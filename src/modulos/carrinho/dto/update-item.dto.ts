import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number;
}
