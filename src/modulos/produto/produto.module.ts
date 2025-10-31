import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { CategoriaModule } from '../categoria/categoria.module'; 
import { Categoria } from '../categoria/categoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Categoria]),
    CategoriaModule,
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService],
})
export class ProdutoModule {}
