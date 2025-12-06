import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { MetodoPagamento } from "../../pagamento/pagamento.entity";

export class CreatePedidoDto {
    @ApiProperty({ enum: MetodoPagamento })
    @IsEnum(MetodoPagamento)
    metodoPagamento: string;
    @ApiProperty({
        description: 'Valor total do pedido',
        example: '199.99',
    })
    total: number;

    @ApiProperty({
        description: 'ID do usuário que fez o pedido',
        example: '1',
    })
    userId: number;

    @ApiProperty({
        description: 'Itens do pedido',
        example: '[{ produto: { id: 1 }, quantidade: 2, valor: 49.99 }, { produto: { id: 2 }, quantidade: 1, valor: 99.99 }]',
    })
    itens: { produto: { id: number }; quantidade: number; valor: number }[];

    @ApiProperty({
        description: 'Endereço de entrega do pedido',
        example: '{ id: 1 }',
    })
    enderecoEntrega: { id: number };

}