import { Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn , Column} from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { CarrinhoItem } from './carrinho-item.entity';

@Entity('carrinho')
export class Carrinho {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Cliente, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  cliente: Cliente;

  @OneToMany(() => CarrinhoItem, item => item.carrinho, { cascade: true , eager:true})
  itens: CarrinhoItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;
}
