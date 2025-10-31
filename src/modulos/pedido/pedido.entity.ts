import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { Pagamento } from '../pedido/pagamento.entity';
import { PedidoItem } from './pedido-item.entity';
import { Endereco } from '../endereco/endereco.entity';


export enum PedidoStatus {
  ABERTO = 'ABERTO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({
    type: 'enum',
    enum: PedidoStatus,
    default: PedidoStatus.ABERTO,
  })
  status: PedidoStatus;

  @CreateDateColumn({ name: 'data_criacao' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'data_modificacao' })
  dataModificacao: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, { eager: true })
  cliente: Cliente;

  @ManyToOne(() => Endereco, { eager: true })
  @JoinColumn({ name: 'endereco_entrega_id' })
  enderecoEntrega: Endereco;

  @OneToMany(() => PedidoItem, (item) => item.pedido, { cascade: true, eager: true })
  itens: PedidoItem[];

  @OneToOne(() => Pagamento, (pagamento) => pagamento.pedido, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  pagamento: Pagamento;

}
