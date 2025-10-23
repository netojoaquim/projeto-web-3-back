import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ApiTags, ApiOperation,ApiResponse } from '@nestjs/swagger';

@ApiTags('Produto')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @ApiOperation({ summary: 'Cria um novo produto' })
  @Post() create(@Body() dto: CreateProdutoDto) {
    return this.produtoService.create(dto);
  }

  // @ApiOperation({ summary: 'Lista todos os produtos com filtros opcionais' })
  // @Get() findAll(
  //   @Query('nome') nome?: string,
  //   @Query('categoriaId') categoriaId?: number,
  //   @Query('precoMin') precoMin?: number,
  //   @Query('precoMax') precoMax?: number,
  // ) {
  //   return this.produtoService.findByFilters(nome, categoriaId, precoMin ? Number(precoMin) : undefined, precoMax ? Number(precoMax) : undefined);
  // }
  @Get()
  @ApiOperation({ summary: 'Lista todos os produtos' })
  @ApiResponse({ status: 200, description: 'Produtos listados com sucesso.' })
  async findAll() {
    const produtos = await this.produtoService.findAll();
    return {
      message: 'Produtos listados com sucesso',
      data: produtos,
    };
  }

  @ApiOperation({ summary: 'Obtém um produto pelo ID' })
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtoService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um produto pelo ID' })
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
    return this.produtoService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remove um produto pelo ID' })
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.produtoService.remove(id);
  }
}
