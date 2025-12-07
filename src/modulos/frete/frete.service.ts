import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FreteService {
  private readonly API_URL = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

  constructor(private readonly httpService: HttpService) {}

  async calcularFrete(
    cepOrigem: string,
    cepDestino: string,
    pacote: { height: number; width: number; length: number; weight: number , insurance_value:number},
  ): Promise<any> {
    if (!cepOrigem || !cepDestino) {
      throw new BadRequestException('CEP de origem e destino são obrigatórios.');
    }

    const body = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      package: pacote,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.API_URL, body, {
          headers: {
            Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Aplicação (joaquimsantana283@gmail.com)',
          },
        }),
      );

      const cotacoes = response.data;
      const opcoesValidas = (Array.isArray(cotacoes) ? cotacoes : cotacoes.options || []).filter(opt => opt.price);
      const resultado = opcoesValidas.map(opt => ({
          nome: opt.name,
          preco: opt.price,
          prazo: opt.delivery_time,
          logo: opt.company.picture,
          empresa: opt.company.name,
        }));

      return resultado; // JSON da cotação
    } catch (error) {
      console.error(
        'Erro ao cotar frete via Melhor Envio:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Falha ao calcular o frete. Verifique os dados.');
    }
  }
}
