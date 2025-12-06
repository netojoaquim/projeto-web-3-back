import {Injectable,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { Cliente } from '../cliente/cliente.entity';
import { MetodoPagamento, PagamentoStatus} from '../pagamento/pagamento.entity';
import { PagamentoService } from '../pagamento/pagamento.service';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusDto } from './dto/update-status-pedido.dto';
import { PedidoItem } from './pedido-item.entity';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(PedidoItem)
    private pedidoItemRepository: Repository<PedidoItem>,

    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,

    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,

    private readonly mailerService: MailerService,
    private readonly pagamentoService: PagamentoService,
  ) {}

  async criarPedido(dto: CreatePedidoDto) {
    // Cria o QueryRunner para controlar a transação
    const queryRunner =
      this.pedidoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Busca cliente e endereço
      const cliente = await queryRunner.manager.findOne(Cliente, {
        where: { id: dto.userId },
      });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');

      const endereco = await queryRunner.manager.findOne(Endereco, {
        where: { id: dto.enderecoEntrega.id },
      });
      if (!endereco) throw new NotFoundException('Endereço não encontrado');

      const pagamento = await this.pagamentoService.criarPagamento(
        dto.metodoPagamento as MetodoPagamento,
        dto.total,
      );

      // 3️⃣ Cria pedido
      const pedido = queryRunner.manager.create(Pedido, {
        cliente,
        enderecoEntrega: endereco,
        valor: dto.total,
        status: PedidoStatus.AGUARDANDO_PAGAMENTO,
        pagamento,
        itens: [],
      });

      // 4️⃣ Processa itens do pedido
      for (const item of dto.itens) {
        const produto = await queryRunner.manager.findOne(Produto, {
          where: { id: item.produto.id },
        });
        if (!produto)
          throw new NotFoundException(
            `Produto ID ${item.produto.id} não encontrado`,
          );

        const quantidadeSolicitada = item.quantidade;
        const estoqueDisponivel = produto.estoque - produto.estoque_reservado;

        if (quantidadeSolicitada > estoqueDisponivel) {
          throw new BadRequestException(
            `Estoque insuficiente (${estoqueDisponivel}) para o produto ID ${produto.id}`,
          );
        }

        produto.estoque_reservado += quantidadeSolicitada;
        await queryRunner.manager.save(produto);

        const pedidoItem = queryRunner.manager.create(PedidoItem, {
          produto,
          quantidade: item.quantidade,
          valor: item.valor,
        });

        pedido.itens.push(pedidoItem);
      }

      // 5️⃣ Salva pedido (junto com itens)
      await queryRunner.manager.save(pedido);

      // 6️⃣ Commit da transação
      await queryRunner.commitTransaction();

      // 7️⃣ Envia email fora da transação
      await this.enviarEmailConfirmacao(pedido, cliente);

      return pedido;
    } catch (error) {
      // Se houver erro, desfaz tudo
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Libera o queryRunner
      await queryRunner.release();
    }
  }

  async atualizarStatus(pedidoId: number, updateStatusDto: UpdateStatusDto) {
  const queryRunner = this.pedidoRepository.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const pedido = await queryRunner.manager.findOne(Pedido, {
      where: { id: pedidoId },
      relations: ['cliente', 'pagamento', 'itens', 'itens.produto'],
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    pedido.status = updateStatusDto.status;

    if (updateStatusDto.status === PedidoStatus.PAGO) {
      if (!pedido.pagamento?.id) throw new BadRequestException('Pagamento não associado ao pedido.');

      // Atualiza o pagamento usando o mesmo queryRunner
      pedido.pagamento.status = PagamentoStatus.PAGO;
      pedido.pagamento.dataAtualizacao = new Date();
      await queryRunner.manager.save(pedido.pagamento);

      for (const item of pedido.itens) {
        const produto = item.produto;
        if (!produto) throw new NotFoundException('Produto do item não encontrado');

        produto.estoque -= item.quantidade;
        produto.estoque_reservado = Math.max(0, produto.estoque_reservado - item.quantidade);
        if (produto.estoque <= 0) produto.ativo = false;

        await queryRunner.manager.save(produto);
      }

      await queryRunner.manager.save(pedido);
      await queryRunner.commitTransaction();

      // Emails fora da transação
      await this.enviarEmailConfirmacaoPagamento(pedido);

    } else if (updateStatusDto.status === PedidoStatus.CANCELADO) {
      if (!updateStatusDto.motivo_cancelamento) {
        throw new BadRequestException('O motivo_cancelamento é obrigatório para cancelar o pedido.');
      }
      pedido.motivo_cancelamento = updateStatusDto.motivo_cancelamento;

      // Reverte estoque reservado
      for (const item of pedido.itens) {
        const produto = item.produto;
        if (!produto) throw new NotFoundException('Produto do item não encontrado');

        produto.estoque_reservado = Math.max(0, produto.estoque_reservado - item.quantidade);
        await queryRunner.manager.save(produto);
      }

      // Atualiza pagamento dentro da transação
      if (!pedido.pagamento?.id) throw new BadRequestException('Pagamento não associado ao pedido.');
      pedido.pagamento.status = PagamentoStatus.CANCELADO;
      pedido.pagamento.dataAtualizacao = new Date();
      await queryRunner.manager.save(pedido.pagamento);

      await queryRunner.manager.save(pedido);
      await queryRunner.commitTransaction();

      // Emails fora da transação
      await this.enviarEmailCancelamento(pedido);
    }

    return pedido;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}


  async listarPorCliente(clienteId: number) {
    return await this.pedidoRepository.find({
      where: { cliente: { id: clienteId } },
      order: { dataCriacao: 'DESC' },
    });
  }

  async listarTodos() {
    return await this.pedidoRepository.find({
      order: { dataCriacao: 'DESC' },
    });
  }

  async buscarPorId(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    return pedido;
  }

  async atualizarPedido(
    id: number,
    body: { status?: PedidoStatus; valor?: number; metodoPagamento?: string },
  ) {
    const queryRunner = this.pedidoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedido = await queryRunner.manager.findOne(Pedido, {
        where: { id },
        relations: ['pagamento'],
      });

      if (!pedido) throw new NotFoundException('Pedido não encontrado');

      if (body.status) pedido.status = body.status;
      if (body.valor) pedido.valor = body.valor;

      if (body.metodoPagamento && pedido.pagamento) {
        pedido.pagamento= await this.pagamentoService.atualizarMetodo(
          pedido.pagamento.id,
          body.metodoPagamento as MetodoPagamento);
      }

      pedido.dataModificacao = new Date();

      await queryRunner.manager.save(pedido);

      await queryRunner.commitTransaction();

      return pedido;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  private async enviarEmailConfirmacao(pedido: Pedido, cliente: Cliente) {
    const agoraRecife = dayjs().tz('America/Recife');
    const dataPedido = agoraRecife.format('DD/MM/YYYY');
    const horaPedido = agoraRecife.format('HH:mm:ss');

    // Formata os itens
    const itensFormatados =
      pedido.itens?.map((item) => ({
        nome: item.produto?.nome || 'Produto',
        quantidade: item.quantidade,
        precoUnitario: item.valor.toFixed(2),
        subtotal: (item.quantidade * item.valor).toFixed(2),
      })) || [];

    const valorTotal = pedido.valor?.toFixed(2) ?? '0.00';

    try {
      await this.mailerService.sendMail({
        to: cliente.email,
        subject: `Confirmação do Pedido #${pedido.id} - Guarashop`,
        template: 'pedido-confirmacao',
        context: {
          nome: cliente.nome_completo,
          numeroPedido: pedido.id,
          valorTotal,
          date: dataPedido,
          time: horaPedido,
          itens: itensFormatados,
        },
      });
      console.log('Enviando e-mail de confirmação para:', cliente.email);
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }
  }
  private async enviarEmailConfirmacaoPagamento(pedido: Pedido) {
    const cliente = pedido.cliente;
    const agoraRecife = dayjs().tz('America/Recife');
    const data = agoraRecife.format('DD/MM/YYYY');
    const hora = agoraRecife.format('HH:mm:ss');

    try {
      await this.mailerService.sendMail({
        to: cliente.email,
        subject: `Pagamento confirmado - Pedido #${pedido.id}`,
        template: 'confirmacao',
        context: {
          nome: cliente.nome_completo,
          numeroPedido: pedido.id,
          valorTotal: Number(pedido.valor ?? 0).toFixed(2),
          date: data,
          time: hora,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de confirmação de pagamento:', error);
    }
  }
  private async enviarEmailCancelamento(pedido: Pedido) {
    const cliente = pedido.cliente;
    const agoraRecife = dayjs().tz('America/Recife');
    const data = agoraRecife.format('DD/MM/YYYY');
    const hora = agoraRecife.format('HH:mm:ss');

    try {
      await this.mailerService.sendMail({
        to: cliente.email,
        subject: `Pedido #${pedido.id} cancelado - Guarashop`,
        template: 'cancelamento',
        context: {
          nome: cliente.nome_completo,
          numeroPedido: pedido.id,
          valorTotal: Number(pedido.valor ?? 0).toFixed(2),
          date: data,
          time: hora,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de cancelamento:', error);
    }
  }
}
