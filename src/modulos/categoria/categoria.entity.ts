import { Column, Entity, PrimaryGeneratedColumn,OneToMany } from "typeorm";
import { Produto } from "../produto/produto.entity";

@Entity('categoria')
export class Categoria {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    descricao: String;

    @OneToMany(() => Produto, (produto) => produto.categoria)
    produtos: Produto[];
}