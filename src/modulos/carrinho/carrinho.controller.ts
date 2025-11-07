import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,UseGuards } from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiOperation,ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modulos/auth/jwt-auth.guard';


@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':clienteId')
  @ApiOperation({ summary: 'Consulta os itens do carrinho de um cliente  ' })
  getCarrinho(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.carrinhoService.getCarrinhoByCliente(clienteId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':clienteId/item')
  @ApiOperation({ summary: 'Adiciona itens ao carrinho, passando o id do item e a quantidade no json  ' })
  adicionarItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Body() createItemDto: CreateItemDto,
  ) {

    const { produtoId, quantidade } = createItemDto;
    return this.carrinhoService.adicionarItem(clienteId, produtoId, quantidade);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':clienteId/item/:itemId')
  @ApiOperation({ summary: 'Atualiza os itens ao carrinho, passando o id do cliente/id do item e a quantidade no json' })
  atualizarItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.carrinhoService.atualizarItem(clienteId, itemId, updateItemDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove um item do carrinho, passando o id do cliente e o id do item ' })
  @Delete(':clienteId/item/:itemId')
  removerItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.carrinhoService.removerItem(clienteId, itemId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Limpa todo o carrinho de um cliente, passando o id do cliente ' })
  @Delete(':clienteId/limpar')
  limparCarrinho(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.carrinhoService.limparCarrinho(clienteId);
  }
}
