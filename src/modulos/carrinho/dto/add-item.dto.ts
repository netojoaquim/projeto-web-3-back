import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty()
  @IsInt()
  produtoId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number;
}
