import { Column, Entity, PrimaryGeneratedColumn,JoinColumn,OneToOne } from 'typeorm';
import { Pagamento } from './pagamento.entity';


@Entity('pagamento_cartao')
export class PagamentoCartao{

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numeroCartao: string;

  @Column()
  nomeTitular: string;

  @Column()
  codigoVerificador: string;

  @Column()
  validade: string;

  @OneToOne(() => Pagamento, { onDelete: 'CASCADE' })
  @JoinColumn()
  pagamento: Pagamento;
}
