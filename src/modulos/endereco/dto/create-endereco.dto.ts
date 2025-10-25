import { ApiProperty } from '@nestjs/swagger';

export class CreateEnderecoDto {

  @ApiProperty({
    description: 'Casa praia',
    example: 'Rua das Flores',
  })
  apelido: string;

  @ApiProperty({
    description: 'Nome da rua do endereço',
    example: 'Rua das Flores',
  })
  rua: string;

  @ApiProperty({
    description: 'Bairro onde o cliente mora',
    example: 'Centro',
  })
  bairro: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  numero: string;

  @ApiProperty({
    description: 'CEP do endereço',
    example: '12345-678',
  })
  cep: string;

  @ApiProperty({
    description: 'Cidade (ex: Recife, Pesqueira, etc.)',
    example: 'Moreno',
  })
  cidade: string;

  @ApiProperty({
    description: 'Estado (ex: PE, SP, RJ, etc.)',
    example: 'PE',
  })
  estado: string;

  @ApiProperty({
    description: 'Indica se este é o endereço padrão do cliente',
    example: true,
  })
  padrao: boolean;

  
  @ApiProperty({
    description: 'ID do cliente associado a este endereço',
    example: 1,
  })
  clienteId: number;
}
