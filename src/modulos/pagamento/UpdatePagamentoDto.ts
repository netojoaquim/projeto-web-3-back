import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { MetodoPagamento } from '../pagamento/pagamento.entity';

class DetalhesCartaoDto {
  @IsNotEmpty()
  numeroCartao: string;
  @IsNotEmpty()
  nomeTitular: string;
  @IsNotEmpty()
  codigoVerificador: string;
  @IsNotEmpty()
  validade: string;
}

class DetalhesPixDto {
  @IsOptional()
  chavePix: string;
  @IsOptional()
  qrCode: string;
}

class DetalhesBoletoDto {
  @IsOptional()
  codigoBarras: string;
  @IsOptional()
  dataVencimento: string;
}

export class UpdatePagamentoDto {
  @IsNotEmpty()
  @IsNumber()
  pagamentoId: number;

  @IsNotEmpty()
  @IsEnum(MetodoPagamento)
  metodo: MetodoPagamento;

  detalhes: any;
}