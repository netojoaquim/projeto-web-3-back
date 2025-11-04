import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { Pagamento } from './pagamento.entity';
import { PedidoItem } from './pedido-item.entity';
import { Cliente } from '../cliente/cliente.entity';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { PagamentoController } from './pagamento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido,Pagamento,PedidoItem,Cliente,Produto,Endereco])],
  controllers: [PedidoController,PagamentoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
