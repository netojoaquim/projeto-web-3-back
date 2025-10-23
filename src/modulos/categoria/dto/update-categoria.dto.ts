import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCategoriaDto {
    @ApiPropertyOptional({
                description: 'Nome da categoria',
                example: 'tecnologia',
                type: String,
            })
    descricao?: string;
}