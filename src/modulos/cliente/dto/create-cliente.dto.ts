import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
        description: 'IDs dos veículos associados',
        example: [1, 2, 3],
        type: [Number]
    })
    enderecos?: number[];
}