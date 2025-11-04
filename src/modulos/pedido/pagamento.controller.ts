import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetodoPagamento } from './pagamento.entity'; 

@ApiTags('pagamento')
@Controller('pagamento')
export class PagamentoController {
  
  @Get('metodos')
  @ApiOperation({ summary: 'Lista os métodos de pagamento disponíveis' })
  listarMetodosPagamento(): string[] {
    return Object.values(MetodoPagamento);
  }
}
