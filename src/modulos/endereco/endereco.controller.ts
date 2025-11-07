import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    NotFoundException,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { EnderecoService } from './endereco.service';
import { JwtAuthGuard } from 'src/modulos/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('endereco')
@Controller('cliente/endereco')
export class EnderecoController {
  constructor(private readonly enderecoService:EnderecoService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo endereco' })
  @ApiResponse({ status: 201, description: 'O endereco foi criado com sucesso.' })
  create(@Body() createEnderecoDto: CreateEnderecoDto) {
    return this.enderecoService.create(createEnderecoDto);
  }

  @Get(':clienteId')
  @ApiOperation({ summary: 'Lista todos os endereços de um cliente específico' })
  findAllByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.enderecoService.findAllByCliente(clienteId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os enderecos' })
  findAll() {
    return this.enderecoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um endereco pelo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enderecoService.findOne(id);
  }

  @Get('padrao/:clienteId')
  @ApiOperation({ summary: 'Obtém o endereço padrão de um cliente' })
  getEnderecoPadrao(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.enderecoService.getEnderecoPadrao(clienteId);
  }

  //definir um endereco como padrao
  @Patch(':id/padrao')
  @ApiOperation({ summary: 'Define um endereço como padrão para o cliente' })
  definirComoPadrao(@Param('id', ParseIntPipe) id: number) {
    return this.enderecoService.definirComoPadrao(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um endereco' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateEnderecoDto: UpdateEnderecoDto,
  ) {
    return this.enderecoService.update(id, UpdateEnderecoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um endereco' })
  @ApiResponse({ status: 204, description: 'endereco deletado com sucesso' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enderecoService.remove(id);
  }
}