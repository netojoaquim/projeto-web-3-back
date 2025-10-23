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

  // Pega ou cria o carrinho do cliente
  async getCarrinhoByCliente(clienteId: number): Promise<Carrinho> {
    let carrinho = await this.carrinhoRepository.findOne({
      where: { cliente: { id: clienteId } },
      relations: ['itens', 'itens.produto'],
    });
    if (!carrinho) {
      const cliente = await this.clienteRepository.findOneBy({ id: clienteId });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');
      carrinho = this.carrinhoRepository.create({ cliente, itens: [] });
      await this.carrinhoRepository.save(carrinho);
    }
    return carrinho;
  }

  // Adiciona um produto ao carrinho
  async adicionarItem(clienteId: number, produtoId: number, quantidade: number) {
    if (quantidade <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');

    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const produto = await this.produtoRepository.findOneBy({ id: produtoId });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // Verifica se o item já existe
    let item = carrinho.itens.find(i => i.produto.id === produtoId);
    if (item) {
      item.quantidade += quantidade; // soma a quantidade
    } else {
      item = this.itemRepository.create({ carrinho, produto, quantidade, valor: produto.preco });
      carrinho.itens.push(item);
    }

    await this.itemRepository.save(item);
    return carrinho;
  }

  // Atualiza a quantidade de um item
  async atualizarQuantidade(clienteId: number, itemId: number, quantidade: number) {
    if (quantidade < 0) throw new BadRequestException('Quantidade não pode ser negativa');

    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const item = carrinho.itens.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado no carrinho');

    if (quantidade === 0) {
      // Remove se quantidade for 0
      await this.itemRepository.delete(item.id);
    } else {
      item.quantidade = quantidade;
      await this.itemRepository.save(item);
    }
    return this.getCarrinhoByCliente(clienteId);
  }

  // Remove um item do carrinho
  async removerItem(clienteId: number, itemId: number) {
    const carrinho = await this.getCarrinhoByCliente(clienteId);
    const item = carrinho.itens.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado no carrinho');

    await this.itemRepository.delete(item.id);
    return this.getCarrinhoByCliente(clienteId);
  }

  // Limpar carrinho
  async limparCarrinho(clienteId: number) {
    const carrinho = await this.getCarrinhoByCliente(clienteId);
    await this.itemRepository.delete({ carrinho: { id: carrinho.id } });
    return this.getCarrinhoByCliente(clienteId);
  }
  async atualizarItem(clienteId: number, itemId: number, updateItemDto: UpdateItemDto) {
  const item = await this.itemRepository.findOneBy({ id: itemId });
  if (!item) throw new NotFoundException('Item não encontrado');
  item.quantidade = updateItemDto.quantidade;
  return this.itemRepository.save(item);
  }

}
