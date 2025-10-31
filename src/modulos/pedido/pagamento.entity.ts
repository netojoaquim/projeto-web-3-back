import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../pedido/pedido.entity';

export enum PagamentoStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
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
}
