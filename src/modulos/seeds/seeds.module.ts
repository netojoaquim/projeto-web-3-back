import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteSeed } from './cliente.seed';
import { CategoriaSeed } from './categoria.seed';
import { ProdutoSeed } from './produto.seed';

import {Cliente} from '../cliente/cliente.entity'
import {Categoria} from '../categoria/categoria.entity'
import {Produto} from '../produto/produto.entity'
import {SeedService } from './seeds.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Categoria, Produto])],
  providers: [ClienteSeed, CategoriaSeed, ProdutoSeed,SeedService],
  exports: [SeedModule],
})
export class SeedModule {}
