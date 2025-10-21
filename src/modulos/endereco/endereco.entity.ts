import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';

@Entity('Endereco')
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false,})
  rua: string;

  @Column({ nullable: false,})
  bairro: string;

  @Column({ nullable: false })
  numero: string;

  @Column({ nullable: false })
  modelo: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.enderecos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cliente: Cliente;
}