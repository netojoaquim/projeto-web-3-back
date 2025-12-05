import {Injectable,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { Cliente } from '../cliente/cliente.entity';
import { MetodoPagamento, PagamentoStatus,Pagamento,} from './pagamento.entity';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusDto } from './dto/update-status-pedido.dto';
import { PedidoItem } from './pedido-item.entity';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Cron } from '@nestjs/schedule';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Pagamento)
    private readonly pagamentoRepository: Repository<Pagamento>,

    @InjectRepository(PedidoItem)
    private pedidoItemRepository: Repository<PedidoItem>,

    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,

    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,

    private readonly mailerService: MailerService,
  ) {}

  @Cron('0/5 * * * * *')
  async testeCron() {
    console.log('Executando tarefa agendada a 5s -', new Date());
  }

  async criarPedido(dto: CreatePedidoDto) {
    const cliente = await this.clienteRepository.findOne({
      where: { id: dto.userId },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const endereco = await this.enderecoRepository.findOne({
      where: { id: dto.enderecoEntrega.id },
    });
    if (!endereco) throw new NotFoundException('Endereço não encontrado');

    const pagamento = this.pagamentoRepository.create({
      metodo: dto.metodoPagamento as MetodoPagamento,
      valor: dto.total,
    });

    const pedido = this.pedidoRepository.create({
      cliente,
      enderecoEntrega: endereco,
      valor: dto.total,
      status: PedidoStatus.AGUARDANDO_PAGAMENTO,
      pagamento,
      itens: [],
    });

    for (const item of dto.itens) {
      const produto = await this.produtoRepository.findOne({
        where: { id: item.produto.id },
      });
      if (!produto) throw new NotFoundException('Produto não encontrado');

      const quantidadeSolicitada = item.quantidade;
      const estoqueDisponivel = produto.estoque - produto.estoque_reservado;

      if (quantidadeSolicitada > estoqueDisponivel) {
        throw new Error(
          `Estoque insuficiente (${estoqueDisponivel}) para o produto ID ${produto.id}`,
        );
      }
      produto.estoque_reservado += quantidadeSolicitada;
      await this.produtoRepository.save(produto);

      const pedidoItem = this.pedidoItemRepository.create({
        produto,
        quantidade: item.quantidade,
        valor: item.valor,
      });

      pedido.itens.push(pedidoItem);
    }

    const saved = await this.pedidoRepository.save(pedido);
    await this.enviarEmailConfirmacao(saved, cliente);
    return saved;
  }

  async atualizarStatus(pedidoId: number, updateStatusDto: UpdateStatusDto) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
      relations: ['cliente', 'pagamento', 'itens', 'itens.produto'],
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    pedido.status = updateStatusDto.status;

    if (updateStatusDto.status === PedidoStatus.PAGO) {
      pedido.pagamento.status = PagamentoStatus.PAGO;
      await this.pagamentoRepository.save(pedido.pagamento);

      for (const item of pedido.itens) {
        const produto = item.produto;

        if (!produto)
          throw new NotFoundException('Produto do item não encontrado');

        produto.estoque -= item.quantidade;

        produto.estoque_reservado = Math.max(
          0,
          produto.estoque_reservado - item.quantidade,
        );

        // marca como inativo se zerar
        if (produto.estoque <= 0) {
          produto.estoque = 0;
          produto.ativo = false;
        }

        await this.produtoRepository.save(produto);
      }
      await this.enviarEmailConfirmacaoPagamento(pedido);
    } else if (updateStatusDto.status === PedidoStatus.CANCELADO) {
      if (updateStatusDto.motivo_cancelamento) {
        pedido.motivo_cancelamento = updateStatusDto.motivo_cancelamento;
      } else {
        throw new BadRequestException(
          'O motivo_cancelamento é obrigatório para cancelar o pedido.',
        );
      }
      pedido.pagamento.status = PagamentoStatus.CANCELADO;

      for (const item of pedido.itens) {
        const produto = item.produto;
        if (!produto)
          throw new NotFoundException('Produto do item não encontrado');

        produto.estoque_reservado = Math.max(
          0,
          produto.estoque_reservado - item.quantidade,
        );

        await this.produtoRepository.save(produto);
      }
      await this.pagamentoRepository.save(pedido.pagamento);

      await this.enviarEmailCancelamento(pedido);
    }

    return await this.pedidoRepository.save(pedido);
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
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['pagamento'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Atualiza os campos do pedido
    if (body.status) pedido.status = body.status;
    if (body.valor) pedido.valor = body.valor;

    // Atualiza método de pagamento se informado
    if (body.metodoPagamento && pedido.pagamento) {
      pedido.pagamento.metodo = body.metodoPagamento as any;
      await this.pagamentoRepository.save(pedido.pagamento);
    }

    pedido.dataModificacao = new Date();

    return await this.pedidoRepository.save(pedido);
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
