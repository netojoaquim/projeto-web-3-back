import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrinhoService } from './carrinho.service';
import { CarrinhoController } from './carrinho.controller';
import { Carrinho } from './carrinho.entity';
import { Produto } from '../produto/produto.entity';
import { CarrinhoItem } from './carrinho-item.entity';
import { Cliente } from '../cliente/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrinho, CarrinhoItem, Produto, Cliente])],
  providers: [CarrinhoService],
  controllers: [CarrinhoController],
  exports: [CarrinhoService],
})
export class CarrinhoModule {}
