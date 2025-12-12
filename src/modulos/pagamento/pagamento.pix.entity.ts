import {Column, Entity, PrimaryGeneratedColumn,JoinColumn,OneToOne } from 'typeorm';
import { Pagamento } from './pagamento.entity';

@Entity('pagamento_pix')
export class PagamentoPix  {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  chavePix: string;

  @Column({ nullable: true })
  qrCode: string;

  @OneToOne(() => Pagamento, { onDelete: 'CASCADE' })
  @JoinColumn()
  pagamento: Pagamento;
}
