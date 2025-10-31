import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, Min } from "class-validator";
import { MetodoPagamento } from "../pagamento.entity";

export class CreatePedidoDto {
    @ApiProperty({ enum: MetodoPagamento })
    @IsEnum(MetodoPagamento)
    metodoPagamento: string;
    total: number;
    userId: number;
    itens: { produto: { id: number }; quantidade: number; valor: number }[];
    enderecoEntrega: { id: number };

}