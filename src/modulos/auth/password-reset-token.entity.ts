import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  BeforeInsert
} from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => Cliente, { eager: true, onDelete: 'CASCADE' })
  cliente: Cliente;

  @CreateDateColumn({type:'timestamptz'})
  createdAt: Date;

  @Column()
  expiresAt: Date;
}