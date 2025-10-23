import { Controller } from '@nestjs/common';
import { Body, Get, Param, Post,Patch, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CategoriaService } from './categoria.service';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';


@ApiTags('categoria')
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

   @Post()
   @ApiOperation({ summary: 'Cria uma nova categoria' })
   create(@Body() CreateCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(CreateCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'lista todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de todos os tipos de categorias' })
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'categorias por id' })
  findOne(@Param('id') id: number) {
    return this.categoriaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update na  categoria por id' })
  update(@Param('id') id: string, @Body() UpdateCategoriaDto: UpdateCategoriaDto) {
      return this.categoriaService.update(+id, UpdateCategoriaDto);
    }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete na categoria por id' })
  remove(@Param('id') id: number) {
    return this.categoriaService.remove(id);
  }

}