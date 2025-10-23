import { Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { CarrinhoItem } from './carrinho-item.entity';

@Entity('carrinho')
export class Carrinho {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Cliente, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  cliente: Cliente;

  @OneToMany(() => CarrinhoItem, item => item.carrinho, { cascade: true })
  itens: CarrinhoItem[];
}
