import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty()
  @IsInt()
  produtoId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number;
}
