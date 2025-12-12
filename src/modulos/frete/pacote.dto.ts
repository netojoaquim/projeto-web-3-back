import { ApiProperty } from '@nestjs/swagger';

export class PacoteDto {
  @ApiProperty({ example: 4 })
  height: number;

  @ApiProperty({ example: 12 })
  width: number;

  @ApiProperty({ example: 17 })
  length: number;

  @ApiProperty({ example: 0.3 })
  weight: number;
  @ApiProperty({ example: 100.0 })
  insurance_value: number;
}

export class CotacaoDto {
  @ApiProperty({ example: '51020900' })
  cepDestino: string;

  @ApiProperty({ type: PacoteDto })
  pacote: PacoteDto;
}
