import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João da Silva'
    })
    nome_completo: string;

    @ApiProperty({
        description: 'Email do usuário',
        example: 'joao.silva@email.com'
    })
    email: string;

    @ApiProperty({
        description: 'Número de telefone',
        example: '+55 11 99999-9999'
    })
    numero_telefone: string;


    @ApiProperty({
        description: 'Senha do usuário',
        example: 'senhaSegura123'
    })
    senha: string;

    @ApiPropertyOptional({
        description: 'Data de nascimento do usuário',
        example: '1990-05-25',
        type: String,
        format: 'date'
    })
    data_nascimento?: Date;

    @ApiPropertyOptional({
        description: 'Indica se o cliente está ativo',
        example: true,
        default: true
    })
    @ApiPropertyOptional({
        description: 'Indica se o cliente está ativo',
        example: true,
        default: true
    })
    @IsOptional()
        @IsBoolean()
        @Type(() => Boolean)
        ativo: boolean;

    @ApiPropertyOptional({
        description: 'IDs dos enderecos associados',
        example: [1, 2, 3],
        type: [Number]
    })
    enderecos?: number[];
}