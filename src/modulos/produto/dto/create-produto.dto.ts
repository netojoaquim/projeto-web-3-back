import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty({
        description: 'nome do usuário',
        example: 'Camiseta Azul',
    })
  nome: string;

  @ApiProperty({ required: false,
    description: 'Descrição do produto',
    example: 'Camiseta azul de algodão'
  })
  descricao?: string;

  @ApiProperty({
    description: 'Preço do produto',
    example: 49.99 
  })
  preco: number;

  @ApiProperty({description: 'Quantidade em estoque',
    example: 100 
  })
  estoque: number;

  @ApiProperty({ required: false, description: 'URL da imagem do produto',
    example: 'http://exemplo.com/imagem.jpg' 
  })
  imagem?: string;

  @ApiProperty({
    description: 'ID da categoria do produto',
    example: 1 
  })
  categoriaId: number;

  @ApiProperty({
    description: 'ativo- true para ativo, false para inativo',
    example: true
  })
  ativo: number;
}
