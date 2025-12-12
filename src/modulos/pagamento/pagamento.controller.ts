import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetodoPagamento } from './pagamento.entity';
import { PagamentoService } from './pagamento.service';

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

  @Get('metodos')
  @ApiOperation({ summary: 'Lista os métodos de pagamento disponíveis' })
  listarMetodosPagamento() {
    return Object.values(MetodoPagamento);
  }

  @Post()
  async criar(@Body() dto: CriarPagamentoDto) {
    return this.pagamentoService.criarPagamento(dto);
  }
}
