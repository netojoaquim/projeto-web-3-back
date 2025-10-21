// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'usuario@email.com ou 81912345678',
        description: 'Pode ser email ou número de telefone',
    })
    identificador: string;

    @ApiProperty({ example: 'senhaSegura123' })
    senha: string;
}
