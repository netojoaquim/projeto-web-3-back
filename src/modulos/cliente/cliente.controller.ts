import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteService } from './cliente.service';
import { JwtAuthGuard } from 'src/modulos/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Cliente')
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  getProfile(@Req() req) {
    return this.clienteService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('enderecos')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  async getVeiculos(@Req() req) {
    const cliente = await this.clienteService.findOne(req.user.id);
    return cliente.enderecos || [];
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  async create(@Body() createClienteDto: CreateClienteDto) {
    try {
      const cliente = await this.clienteService.create(createClienteDto);
      return { message: 'Usuário criado com sucesso', data: cliente };
    } catch (error) {
      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    try {
      const clientes = await this.clienteService.findAll();
      return {
        message: 'Lista de usuários obtida com sucesso',
        data: clientes,
      };
    } catch {
      throw new InternalServerErrorException('Erro ao buscar usuários');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um único usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.clienteService.findOne(id);
    if (!cliente) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { message: 'Usuário encontrado com sucesso', data: cliente };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    const cliente = await this.clienteService.update(id, updateClienteDto);
    if (!cliente) {
      throw new NotFoundException('Usuário não encontrado para atualização');
    }
    return { message: 'Usuário atualizado com sucesso', data: cliente };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.clienteService.remove(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado para remoção');
    }
    return { message: 'Usuário removido com sucesso' };
  }
}