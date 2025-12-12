// seeds/produto.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../produto/produto.entity'

@Injectable()
export class ProdutoSeed {
  constructor(
    @InjectRepository(Produto)
    private repo: Repository<Produto>,
  ) {}

  async run() {
    const count = await this.repo.count();
    if (count > 0) return;

    const produtos = [
      {
        id: 1,
        nome: 'iphone 15 256gb branco',
        descricao: 'iphopne branco',
        preco: 6000.0,
        estoque: 5,
        estoque_reservado: 0,
        imagem: 'b910fbc8b10880622b3efebc70ee23b34f.jpeg',
        ativo: true,
        categoria: {id: 1},
      },
      {
        id: 2,
        nome: 'iphone 15 256gb preto',
        descricao: 'iphone 15 preto',
        preco: 6200.0,
        estoque: 10,
        estoque_reservado: 0,
        imagem: 'ece19d6be010fd2b52d14cf6e8846c62a.jpg',
        ativo: true,
        categoria: {id: 1},
      },
      {
        id: 3,
        nome: 'Terço rustico',
        descricao: 'Terço rustico de madeira',
        preco: 62.0,
        estoque: 10,
        estoque_reservado: 0,
        imagem: '9bd5e0658458ae46f104df1c902927e24.jpeg',
        ativo: true,
        categoria: {id: 2},
      },
      {
        id: 4,
        nome: 'Jaqueta Balanciaga',
        descricao: 'Jaqueta Balanciaga',
        preco: 16000.0,
        estoque: 2,
        estoque_reservado: 0,
        imagem: '1b6ebb59ec18ed4923c3ac412ba20665.jpg',
        ativo: true,
        categoria: {id: 3},
      }
    ];

    await this.repo.save(produtos);
  }
}
