import { Entity, PrimaryGeneratedColumn, ManyToOne, Column,JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../produto/produto.entity';

@Entity('pedido_itens')
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @ManyToOne(() => Produto, { eager: true })
  @JoinColumn({ name: 'produtoId' })
  produto: Produto;

  @Column('int')
  quantidade: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;
}
