import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Rolesguard } from '../auth/roles.guard';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';


@ApiTags('categoria')
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) { }

  @UseGuards(JwtAuthGuard, Rolesguard)
  @Roles('admin')
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, Rolesguard)
  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'update na  categoria por id' })
  update(@Param('id') id: string, @Body() UpdateCategoriaDto: UpdateCategoriaDto) {
      return this.categoriaService.update(+id, UpdateCategoriaDto);
    }
  @UseGuards(JwtAuthGuard, Rolesguard)
  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete na categoria por id' })
  remove(@Param('id') id: number) {
    return this.categoriaService.remove(id);
  }

}