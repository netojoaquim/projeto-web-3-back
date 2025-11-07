import {
  Controller,
  Post,
  Param,
  Body,
  Patch,
  Get,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoStatus } from './pedido.entity';
import { ApiOperation,ApiTags,ApiBearerAuth } from '@nestjs/swagger';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from 'src/modulos/auth/jwt-auth.guard';

@ApiTags('Pedidos')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido com base no carrinho do cliente',
  })
  async criarPedido(@Body() dto: CreatePedidoDto) {
    return this.pedidoService.criarPedido(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Atualiza apenas o status de um pedido, passando o id do pedido e o novo status no json',
  })
  async atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: PedidoStatus },
  ) {
    return await this.pedidoService.atualizarStatus(id, body.status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary:
      'Atualiza informações gerais de um pedido (status, valor, método de pagamento, etc)',
  })
  async atualizarPedido(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      status?: PedidoStatus;
      valor?: number;
      metodoPagamento?: string;
    },
  ) {
    return await this.pedidoService.atualizarPedido(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cliente')
  @ApiOperation({ summary: 'Lista todos os pedidos de todos os clientes' })
  async listarTodos() {
    return await this.pedidoService.listarTodos();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cliente/:clienteId')
  @ApiOperation({
    summary: 'Lista todos os pedidos de um cliente, passando o id do cliente',
  })
  async listarPorCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return await this.pedidoService.listarPorCliente(clienteId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Busca um pedido pelo seu ID' })
  async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.buscarPorId(id);
  }
}
