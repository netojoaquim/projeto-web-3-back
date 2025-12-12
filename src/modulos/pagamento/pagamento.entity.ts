import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../pedido/pedido.entity';
import { PagamentoCartao } from './pagamento.cartao.entity';
import { PagamentoPix } from './pagamento.pix.entity';
import { PagamentoBoleto } from './pagamento.boleto.entity';

export enum PagamentoStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
  FALHA = 'FALHA',
}
export enum MetodoPagamento {
  CARTAO = 'CARTAO',
  BOLETO = 'BOLETO',
  PIX = 'PIX',
}

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MetodoPagamento,
  })
  metodo: MetodoPagamento;

  @Column({
    type: 'enum',
    enum: PagamentoStatus,
    default: PagamentoStatus.PENDENTE,
  })
  status: PagamentoStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @CreateDateColumn({ name: 'data_criacao' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'data_atualizacao' })
  dataAtualizacao: Date;

  @OneToOne(() => Pedido, (pedido) => pedido.pagamento, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @OneToOne(() => PagamentoCartao, (detalhe) => detalhe.pagamento, {
    cascade: true,
  })
  pagamentoCartao: PagamentoCartao;

  @OneToOne(() => PagamentoPix, (detalhe) => detalhe.pagamento, {
    cascade: true,
  })
  pagamentoPix: PagamentoPix;

  @OneToOne(() => PagamentoBoleto, (detalhe) => detalhe.pagamento, {
    cascade: true,
  })
  pagamentoBoleto: PagamentoBoleto;
}
