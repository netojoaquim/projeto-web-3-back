import {
  Controller,
  Post,
  Param,
  Body,
  Patch,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoStatus } from './pedido.entity';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@ApiTags('Pedidos')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido com base no carrinho do cliente',
  })
  async criarPedido(@Body() dto: CreatePedidoDto) {
    return this.pedidoService.criarPedido(dto);
  }

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
  @Get('cliente')
  @ApiOperation({ summary: 'Lista todos os pedidos de todos os clientes' })
  async listarTodos() {
    return await this.pedidoService.listarTodos();
  }

  @Get('cliente/:clienteId')
  @ApiOperation({
    summary: 'Lista todos os pedidos de um cliente, passando o id do cliente',
  })
  async listarPorCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return await this.pedidoService.listarPorCliente(clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pedido pelo seu ID' })
  async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.buscarPorId(id);
  }
}
