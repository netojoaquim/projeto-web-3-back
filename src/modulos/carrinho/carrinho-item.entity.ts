import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { Produto } from '../produto/produto.entity';

@Entity('carrinho_item')
export class CarrinhoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @ManyToOne(() => Carrinho, carrinho => carrinho.itens, {onDelete: 'CASCADE' })
  @JoinColumn({name:'carrinhoId'})
  carrinho: Carrinho;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @ManyToOne(() => Produto, { nullable: false })
  @JoinColumn()
  produto: Produto;
}
