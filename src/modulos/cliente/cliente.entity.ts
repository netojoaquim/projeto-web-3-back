import { BeforeInsert, Column, Entity, OneToMany,OneToOne, PrimaryGeneratedColumn,BeforeUpdate } from 'typeorm';
import { Endereco } from '../endereco/endereco.entity';
import * as bcrypt from "bcrypt";
import { Carrinho } from '../carrinho/carrinho.entity';
import { Pedido } from '../pedido/pedido.entity';

export enum UserRole {
    ADMIN = 'admin',
    CLIENTE = 'cliente',
}

@Entity('cliente')
export class Cliente {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false})
    nome_completo: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    numero_telefone: string;s

    @Column({ nullable: false })
    senha: string;

    @Column({ type: 'date', nullable: true })
    data_nascimento: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    data_criacao: Date;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
    role: UserRole;

    @Column({nullable:false ,default: true })
     ativo: boolean;

    @OneToMany(() => Endereco, endereco => endereco.cliente, { nullable: true , cascade: true})
    enderecos: Endereco[];

    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];


    @OneToOne(() => Carrinho, (carrinho)=>carrinho.cliente, { nullable: true, cascade: true})

    @BeforeInsert()
    async hashPassword() {
        this.senha = await bcrypt.hash(this.senha, 10);
    }

    @BeforeUpdate()
    async hashPasswordOnUpdate() {
      if (this.senha) {
        if (!this.senha.startsWith('$2b$')) {
          this.senha = await bcrypt.hash(this.senha, 10);
        }
      }
    }
}