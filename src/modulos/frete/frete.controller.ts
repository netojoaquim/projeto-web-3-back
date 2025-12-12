import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { FreteService } from './frete.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CotacaoDto } from './pacote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('frete')
@Controller('frete')
export class FreteController {
  constructor(private readonly freteService: FreteService) {}
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cotar')
  @ApiOperation({ summary: 'Cota o frete via Melhor Envio (POST JSON)' })
  async cotarFrete(@Body() dto: CotacaoDto) {
    if (!dto.cepDestino)
      throw new BadRequestException('CEP de destino é obrigatório.');
    if (!dto.pacote || !dto.pacote.weight || dto.pacote.weight <= 0)
      throw new BadRequestException('Dados do pacote inválidos.');

    const cepOrigem = process.env.CEP_ORIGEM;
    if (!cepOrigem)
      throw new BadRequestException('CEP de origem não configurado.');

    const resultado = await this.freteService.calcularFrete(
      cepOrigem,
      dto.cepDestino,
      dto.pacote,
    );

    return {
      mensagem: 'Cotação realizada com sucesso.',
      opcoes: resultado,
    };
  }
}
