import { Controller, Get, Post, Body,UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation,ApiBearerAuth } from '@nestjs/swagger';
import { MetodoPagamento } from './pagamento.entity';
import { PagamentoService } from './pagamento.service';
import { JwtAuthGuard } from 'src/modulos/auth/jwt-auth.guard';


interface CriarPagamentoDto {
    metodo: MetodoPagamento;
    valor: number;

    numeroCartao?: string;
    nomeTitular?: string;
    codigoVerificador?: string;
    validade?: string;

    chavePix?: string;
    qrCode?: string;

    codigoBarras?: string;
    dataVencimento?: string;
}

@ApiTags('pagamento')
@Controller('pagamento')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('metodos')
  @ApiOperation({ summary: 'Lista os métodos de pagamento disponíveis' })
  listarMetodosPagamento() {
    return Object.values(MetodoPagamento);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async criar(@Body() dto: CriarPagamentoDto) {
    return this.pagamentoService.criarPagamento(dto);
  }
}
