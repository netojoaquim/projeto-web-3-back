import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagamento } from './pagamento.entity';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { ConfigModule } from '@nestjs/config';

import { PagamentoCartao } from './pagamento.cartao.entity';
import { PagamentoPix } from './pagamento.pix.entity';
import { PagamentoBoleto } from './pagamento.boleto.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Pagamento,PagamentoCartao,PagamentoPix,PagamentoBoleto]),
  ],
  providers: [PagamentoService],
  controllers: [PagamentoController],
  exports: [PagamentoService],
})
export class PagamentoModule {}