import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { PedidoItem } from './pedido-item.entity';
import { Cliente } from '../cliente/cliente.entity';
import { Produto } from '../produto/produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { VerificaPedidosExpirados } from './verifica-pedido';
import { ConfigModule } from '@nestjs/config';
import { Pagamento } from '../pagamento/pagamento.entity';
import { PagamentoModule } from '../pagamento/pagamento.module';



@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Pedido,
      PedidoItem,
      Cliente,
      Produto,
      Endereco,
    ]),
      ScheduleModule.forRoot(),
    PagamentoModule,
  ],
  controllers: [PedidoController],
  providers: [PedidoService,VerificaPedidosExpirados],
  exports: [PedidoService],
})
export class PedidoModule {}
