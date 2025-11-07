import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { Cliente } from '../cliente/cliente.entity';
import {
  MetodoPagamento,
  PagamentoStatus,
  Pagamento,
} from './pagamento.entity';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
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
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,

    @InjectRepository(Pagamento)
    private readonly pagamentoRepo: Repository<Pagamento>,

    @InjectRepository(PedidoItem)
    private pedidoItemRepo: Repository<PedidoItem>,

    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,

    @InjectRepository(Endereco)
    private enderecoRepo: Repository<Endereco>,

    private readonly mailerService: MailerService,
  ) {}

  async criarPedido(dto: CreatePedidoDto) {
    const cliente = await this.clienteRepo.findOne({
      where: { id: dto.userId },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const endereco = await this.enderecoRepo.findOne({
      where: { id: dto.enderecoEntrega.id },
    });
    if (!endereco) throw new NotFoundException('Endereço não encontrado');

    const pagamento = this.pagamentoRepo.create({
      metodo: dto.metodoPagamento as MetodoPagamento,
      valor: dto.total,
    });

    const pedido = this.pedidoRepo.create({
      cliente,
      enderecoEntrega: endereco,
      valor: dto.total,
      status: PedidoStatus.AGUARDANDO_PAGAMENTO,
      pagamento,
      itens: [],
    });

    for (const item of dto.itens) {
      const produto = await this.produtoRepo.findOne({
        where: { id: item.produto.id },
      });
      if (!produto) continue;

      const pedidoItem = this.pedidoItemRepo.create({
        produto,
        quantidade: item.quantidade,
        valor: item.valor,
      });

      pedido.itens.push(pedidoItem);
    }

    const saved = await this.pedidoRepo.save(pedido);
    await this.enviarEmailConfirmacao(saved, cliente);
    return saved;
  }

  async atualizarStatus(pedidoId: number, status: PedidoStatus) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId },
      relations: ['cliente','pagamento', 'itens', 'itens.produto'],
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    pedido.status = status;

    if (status === PedidoStatus.PAGO) {
      pedido.pagamento.status = PagamentoStatus.PAGO;
      await this.pagamentoRepo.save(pedido.pagamento);
      for (const item of pedido.itens) {
        const produto = item.produto;

        if (!produto) continue;

        if (produto.estoque < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${produto.nome}`,
          );
        }

        produto.estoque -= item.quantidade;

        // marca como inativo se zerar
        if (produto.estoque <= 0) {
          produto.estoque = 0;
          produto.ativo = false;
        }

        await this.produtoRepo.save(produto);
      }
      await this.enviarEmailConfirmacaoPagamento(pedido);
    } else if (status === PedidoStatus.CANCELADO) {
      pedido.pagamento.status = PagamentoStatus.CANCELADO;
      await this.pagamentoRepo.save(pedido.pagamento);

      await this.enviarEmailCancelamento(pedido);
    }

    return await this.pedidoRepo.save(pedido);
  }

  async listarPorCliente(clienteId: number) {
    return await this.pedidoRepo.find({
      where: { cliente: { id: clienteId } },
      order: { dataCriacao: 'DESC' },
    });
  }

  async listarTodos() {
    return await this.pedidoRepo.find({
      order: { dataCriacao: 'DESC' },
    });
  }

  async buscarPorId(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    return pedido;
  }

  async atualizarPedido(
    id: number,
    body: { status?: PedidoStatus; valor?: number; metodoPagamento?: string },
  ) {
    const pedido = await this.pedidoRepo.findOne({
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
      await this.pagamentoRepo.save(pedido.pagamento);
    }

    pedido.dataModificacao = new Date();

    return await this.pedidoRepo.save(pedido);
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
