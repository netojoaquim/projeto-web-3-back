import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get(':clienteId')
  @ApiOperation({ summary: 'Consulta os itens do carrinho de um cliente  ' })
  getCarrinho(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.carrinhoService.getCarrinhoByCliente(clienteId);
  }

  @Post(':clienteId/item')
  @ApiOperation({ summary: 'Adiciona itens ao carrinho, passando o id do item e a quantidade no json  ' })
  adicionarItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Body() addItemDto: AddItemDto,
  ) {

    const { produtoId, quantidade } = addItemDto;
    return this.carrinhoService.adicionarItem(clienteId, produtoId, quantidade);
  }

  @Patch(':clienteId/item/:itemId')
  @ApiOperation({ summary: 'Atualiza os itens ao carrinho, passando o id do cliente/id do item e a quantidade no json' })
  atualizarItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.carrinhoService.atualizarItem(clienteId, itemId, updateItemDto);
  }
  @ApiOperation({ summary: 'Remove um item do carrinho, passando o id do cliente e o id do item ' })
  @Delete(':clienteId/item/:itemId')
  removerItem(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.carrinhoService.removerItem(clienteId, itemId);
  }
  @ApiOperation({ summary: 'Limpa todo o carrinho de um cliente, passando o id do cliente ' })
  @Delete(':clienteId/limpar')
  limparCarrinho(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.carrinhoService.limparCarrinho(clienteId);
  }
}
