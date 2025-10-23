import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoriaDto {
    @ApiPropertyOptional({
            description: 'Nome da categoria',
            example: 'tecnologia',
            type: String,
        })
    descricao: string;
}