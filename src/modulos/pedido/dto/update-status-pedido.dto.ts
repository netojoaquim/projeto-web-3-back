import { PedidoStatus } from '../pedido.entity.js';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
    @IsEnum(PedidoStatus)
    status: PedidoStatus;

    @IsOptional()
    @IsString()
    motivo_cancelamento?: string;
}