import { Entity, Column, PrimaryGeneratedColumn,OneToOne,JoinColumn } from 'typeorm';
import { Pagamento } from './pagamento.entity';

@Entity('pagamento_boleto')
export class PagamentoBoleto  {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:true})
  codigoBarras: string;

  @Column( {nullable:true})
  dataVencimento: string;

  @OneToOne(() => Pagamento, { onDelete: 'CASCADE' })
  @JoinColumn()
  pagamento: Pagamento;
}
