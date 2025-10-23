import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn,BeforeUpdate } from 'typeorm';
import { Endereco } from '../endereco/endereco.entity';
import * as bcrypt from "bcrypt";

@Entity('cliente')
export class Cliente {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false ,unique: true})
    nome_completo: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    numero_telefone: string;s

    @Column({ nullable: false })
    senha: string;

    @Column({ type: 'date', nullable: true })
    data_nascimento: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    data_criacao: Date;

    @OneToMany(() => Endereco, endereco => endereco.cliente, { nullable: true , cascade: true})
    enderecos: Endereco[];

    @BeforeInsert()
    async hashPassword() {
        this.senha = await bcrypt.hash(this.senha, 10);
    }

    @BeforeUpdate()
    async hashPasswordOnUpdate() {
      // Verifica se a senha foi modificada para evitar re-hashing desnecessário
      if (this.senha) {
        // É uma boa prática verificar se a senha não é já um hash.
        // Hashes do bcrypt geralmente começam com "$2b$".
        if (!this.senha.startsWith('$2b$')) {
          this.senha = await bcrypt.hash(this.senha, 10);
        }
      }
    }
}