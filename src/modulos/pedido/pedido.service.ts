import {Injectable,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { Cliente } from '../cliente/cliente.entity';
import {MetodoPagamento,PagamentoStatus,Pagamento} from './pagamento.entity';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoItem } from './pedido-item.entity';


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
  ) {}

  /**
   * Finaliza o pedido a partir do carrinho
   */
  async criarPedido(dto: CreatePedidoDto) {
    const cliente = await this.clienteRepo.findOne({ where: { id: dto.userId } });
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
    return saved;
  }

  /**
   * Atualiza o status de um pedido
   */
  async atualizarStatus(pedidoId: number, status: PedidoStatus) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId },
      relations: ['pagamento'],
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    pedido.status = status;

    // Sincroniza status de pagamento se for o caso
    if (status === PedidoStatus.PAGO) {
      pedido.pagamento.status = PagamentoStatus.PAGO;
      await this.pagamentoRepo.save(pedido.pagamento);
    } else if (status === PedidoStatus.CANCELADO) {
      pedido.pagamento.status = PagamentoStatus.CANCELADO;
      await this.pagamentoRepo.save(pedido.pagamento);
    }

    return await this.pedidoRepo.save(pedido);
  }

  /**
   * Lista todos os pedidos de um cliente
   */
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

  /**
   * Retorna um pedido específico
   */
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
}
