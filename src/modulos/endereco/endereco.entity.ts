import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';

@Entity('endereco')
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false,})
  rua: string;

  @Column({ nullable: true,})
  apelido: string;

  @Column({ nullable: false,})
  bairro: string;

  @Column({ nullable: false })
  numero: string;

  @Column({ nullable: false })
  cidade: string;

  @Column({ nullable: false })
  cep: string;

  @Column({ nullable: false })
  estado: string;

  @Column({ nullable: false, default: false })
  padrao: boolean;

  @ManyToOne(() => Cliente, (cliente) => cliente.enderecos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cliente: Cliente;
}