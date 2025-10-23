import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Categoria } from '../categoria/categoria.entity';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(dto: CreateProdutoDto) {
    const categoria = await this.categoriaRepository.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');

    const produto = this.produtoRepository.create({ ...dto, categoria, ativo: true });
    return this.produtoRepository.save(produto);
  }

  async findAll(): Promise<Produto[]> {
    return this.produtoRepository.find({
      relations: ['categoria'], // Inclui a categoria do produto
    });
  }

  async findOne(id: number) {
    const produto = await this.produtoRepository.findOne({ where: { id }, relations: ['categoria'] });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    const produto = await this.findOne(id);

    if (dto.categoriaId) {
      const categoria = await this.categoriaRepository.findOneBy({ id: dto.categoriaId });
      if (!categoria) throw new NotFoundException('Categoria não encontrada');
      produto.categoria = categoria;
    }

    Object.assign(produto, dto);
    return this.produtoRepository.save(produto);
  }

  async remove(id: number) {
    const result = await this.produtoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Produto não encontrado');
  }

  // Filtros
  findByFilters(
    nome?: string,
    categoriaId?: number,
    precoMin?: number,
    precoMax?: number,
  ) {
    const where: any = {};
    if (nome) where.nome = Like(`%${nome}%`);
    if (categoriaId) where.categoria = { id: categoriaId };
    if (precoMin !== undefined && precoMax !== undefined) where.preco = Between(precoMin, precoMax);

    return this.produtoRepository.find({ where, relations: ['categoria'] });
  }
}
