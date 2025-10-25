// src/modulos/produto/dto/create-produto.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive, Min, IsBoolean } from 'class-validator'; // <--- NOVOS IMPORTS
import { Type } from 'class-transformer'; // <--- NOVO IMPORT

export class CreateProdutoDto {
    @ApiProperty({
        description: 'Nome do produto',
        example: 'Camiseta Azul',
    })
    @IsNotEmpty()
    @IsString()
    nome: string;

    @ApiProperty({ required: false,
        description: 'Descrição do produto',
        example: 'Camiseta azul de algodão'
    })
    @IsOptional()
    @IsString()
    descricao?: string;

    @ApiProperty({
        description: 'Preço do produto',
        example: 49.99 
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number) // Garante a conversão da string do frontend para number
    preco: number;

    @ApiProperty({description: 'Quantidade em estoque',
        example: 100 
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number) // Garante a conversão
    estoque: number;

    @ApiProperty({ required: false, description: 'Nome do arquivo da imagem (retornado pelo Multer)',
        example: 'a1b2c3d4e5f6.jpg' 
    })
    @IsOptional()
    @IsString()
    imagem?: string;

    @ApiProperty({
        description: 'ID da categoria do produto',
        example: 1 
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number) // Garante a conversão do ID para number
    categoriaId: number;

    // Nota: O campo 'ativo' na sua Entity é um boolean.
    // Se o TypeORM for configurado para aceitar 1/0, isso é OK.
    // Se for um boolean, o tipo deve ser IsBoolean. Assumindo que você quer um boolean:
    @ApiProperty({
        description: 'Ativo - true para ativo, false para inativo',
        example: true
    })
    @IsOptional()
    @IsBoolean() // Espera true ou false
    @Type(() => Boolean) // Garante que a string "true"/"false" seja convertida
    ativo: boolean; // Alterei o tipo para boolean, mais alinhado com o que é esperado
}