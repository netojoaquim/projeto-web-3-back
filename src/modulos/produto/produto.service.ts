import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like,DeleteResult } from 'typeorm';
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

    // CORREÇÃO/CLAREZA: Explicitamente desestrutura o DTO, incluindo o campo 'imagem'
    const { categoriaId, ativo, ...produtoData } = dto; 

    const produto = this.produtoRepository.create({ 
        ...produtoData, // Inclui nome, descricao, preco, estoque, e IMAGEM
        categoria,      // Relacionamento com o objeto Categoria
        ativo: ativo || true // Garante que ativo seja true se não for fornecido
    });
    
    return this.produtoRepository.save(produto);
  }

  async findAll(): Promise<Produto[]> {
    // ... (sem alteração)
    return this.produtoRepository.find({
      relations: ['categoria'], 
    });
  }
async findOne(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ 
      where: { id },
      relations: ['categoria'],
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    return produto;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.produtoRepository.preload({
      id: id,
      ...updateProdutoDto,
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return this.produtoRepository.save(produto);
  }

  async remove(id: number): Promise<DeleteResult> {
    const result = await this.produtoRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado para remoção.`);
    }

    return result;
  }
  
  
}