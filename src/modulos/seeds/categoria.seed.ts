// seeds/categoria.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../categoria/categoria.entity';

@Injectable()
export class CategoriaSeed {
  constructor(
    @InjectRepository(Categoria)
    private repo: Repository<Categoria>,
  ) {}

  async run() {
    const count = await this.repo.count();
    if (count > 0) return;

    const categorias = [
      { id: 1, descricao: 'Tecnologias e informática' },
      { id: 2, descricao: 'Religioso' },
      { id: 3, descricao: 'Vestimenta' },
    ];

    await this.repo.save(categorias);
  }
}
