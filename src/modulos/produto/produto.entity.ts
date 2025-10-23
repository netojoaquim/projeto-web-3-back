import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../categoria/categoria.entity';



@Entity('produto')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column('decimal', { nullable:false ,precision: 10, scale: 2 })
  preco: number;

  @Column('int', { nullable:false ,default: 0 })
  estoque: number;

  @Column({ nullable: true })
  imagem: string;

  @Column({nullable:false ,default: true })
  ativo: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.produtos, { nullable: false })
  categoria: Categoria;
}
