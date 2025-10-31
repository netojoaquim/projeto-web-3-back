import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { CarrinhoItem } from './carrinho-item.entity';
import { Produto } from '../produto/produto.entity';
import { Cliente } from '../cliente/cliente.entity';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private readonly carrinhoRepository: Repository<Carrinho>,
    @InjectRepository(CarrinhoItem)
    private readonly itemRepository: Repository<CarrinhoItem>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async getCarrinhoByCliente(clienteId: number): Promise<Carrinho> {

    let carrinho = await this.carrinhoRepository.findOne({
      where: { cliente: { id: clienteId } },
      relations: ['itens', 'itens.produto'],
    });

    if (!carrinho) {
      const cliente = await this.clienteRepository.findOneBy({ id: clienteId });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');

      carrinho = this.carrinhoRepository.create({ cliente, itens: [], total: 0 });
      await this.carrinhoRepository.save(carrinho);
    }
    return carrinho;
  }

  async adicionarItem(clienteId: number, produtoId: number, quantidade: number) {
    if (quantidade <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');
    

    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const produto = await this.produtoRepository.findOneBy({ id: produtoId });

    if (!produto) throw new NotFoundException('Produto não encontrado');

    if (!produto.ativo) {
      throw new BadRequestException(`O produto "${produto.nome}" está inativo e não pode ser adicionado ao carrinho.`);
    }

    if (!produto.estoque) {
      throw new BadRequestException(`O produto "${produto.nome}" está sem estoque e não pode ser adicionado ao carrinho.`);
    }

    let item = carrinho.itens.find(i => i.produto.id === produtoId);

    if (item) {
      const novaquantidade= item.quantidade + quantidade;

      if (quantidade > produto.estoque) {
      throw new BadRequestException(
        `Estoque insuficiente. Estoque disponível: ${produto.estoque}, quantidade solicitada: ${quantidade}`,
      );
    }
      item.quantidade = novaquantidade;

    } else {

      if (quantidade > produto.estoque) {
      throw new BadRequestException(
        `Estoque insuficiente. Estoque disponível: ${produto.estoque}, quantidade solicitada: ${quantidade}`,
      );
    }

      item = this.itemRepository.create({ carrinho,
         produto,
         quantidade,
          valor: produto.preco
        });
      carrinho.itens.push(item);
    }

    await this.itemRepository.save(item);
    await this.recalcularTotal(carrinho.id);

    return this.getCarrinhoByCliente(clienteId);
  }

  async atualizarQuantidade(clienteId: number, itemId: number, quantidade: number) {
    if (quantidade < 0) throw new BadRequestException('Quantidade não pode ser negativa');

    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const item = carrinho.itens.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado no carrinho');

    if (quantidade === 0) {
      await this.itemRepository.delete(item.id);
    } else {
      item.quantidade = quantidade;
      await this.itemRepository.save(item);
    }
    await this.recalcularTotal(carrinho.id);
    return this.getCarrinhoByCliente(clienteId);
  }

  async removerItem(clienteId: number, itemId: number) {
    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const item = carrinho.itens.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado no carrinho');

    await this.itemRepository.delete(item.id);
    await this.recalcularTotal(carrinho.id);
    return this.getCarrinhoByCliente(clienteId);
  }

  async limparCarrinho(clienteId: number) {
    const carrinho = await this.getCarrinhoByCliente(clienteId);
    if (!carrinho){
      throw new Error('carrinho não encontrado')
    }
    await this.carrinhoRepository.remove(carrinho);
    const novoCarrinho = this.carrinhoRepository.create({
    cliente: { id: clienteId },
    total: 0,
    itens: [],
  })
    await await this.carrinhoRepository.save(novoCarrinho);
  }

  async atualizarItem(clienteId: number, itemId: number, updateItemDto: UpdateItemDto) {
    const item = await this.itemRepository.findOne({ where: {id:itemId},relations:['carrinho'], });
    if (!item) throw new NotFoundException('Item não encontrado');
    item.quantidade = updateItemDto.quantidade;
    await this.itemRepository.save(item);
    await this.recalcularTotal(item.carrinho.id);
    return this.getCarrinhoByCliente(clienteId);
  }

  private async recalcularTotal(carrinhoId: number) {
    const carrinho = await this.carrinhoRepository.findOne({
      where: { id: carrinhoId },
      relations: ['itens', 'itens.produto'],
    });

    if (!carrinho) return;

    carrinho.total = carrinho.itens.reduce(
      (sum, item) => sum + item.quantidade * item.produto.preco,
      0,
    );

    await this.carrinhoRepository.save(carrinho);
  }

}
