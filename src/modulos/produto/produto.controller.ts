// src/modulos/produto/produto.controller.ts (ALTERADO)

import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  ParseIntPipe, 
  Query, 
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express'; 
@ApiTags('Produto')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}
  @Post('upload')
  @ApiOperation({ summary: 'Faz upload de uma imagem e retorna o nome do arquivo salvo.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem para o produto (JPG, PNG, GIF).'
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { 
      storage: diskStorage({
        destination: './uploads', 
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // filtro para aceitar apenas tipos de imagem
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new BadRequestException('Apenas arquivos de imagem (jpg, jpeg, png, gif) são permitidos!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('Nenhum arquivo enviado');
    }
    return { 
        message: 'Upload realizado com sucesso',
        filename: file.filename,
        url: `uploads/${file.filename}`
    };
  }

  // ====================================================================
  // ROTAS EXISTENTES
  // ====================================================================

  @ApiOperation({ summary: 'Cria um novo produto' })
  @Post() create(@Body() dto: CreateProdutoDto) {
    return this.produtoService.create(dto);
  }

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