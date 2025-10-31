// src/modulos/produto/dto/create-produto.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive, Min, IsBoolean } from 'class-validator'; 
import { Type } from 'class-transformer'; 

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
    @Type(() => Number) 
    preco: number;

    @ApiProperty({description: 'Quantidade em estoque',
        example: 100 
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number) 
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
    @Type(() => Number) 
    categoriaId: number;

    
    @ApiProperty({
        description: 'Ativo - true para ativo, false para inativo',
        example: true
    })
    @IsOptional()
    @IsBoolean() 
    @Type(() => Boolean) 
    ativo: boolean; 
}