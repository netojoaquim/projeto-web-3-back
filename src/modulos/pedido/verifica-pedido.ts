import { Injectable, Logger} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Pedido, PedidoStatus } from './pedido.entity';
import { PagamentoStatus} from '../pagamento/pagamento.entity';
import { red, magenta } from 'colorette';
import { PedidoService } from './pedido.service';
import { PagamentoService } from '../pagamento/pagamento.service';


@Injectable()
export class VerificaPedidosExpirados  {


  private readonly logger = new Logger(VerificaPedidosExpirados.name);
  private readonly tempo_limite: number;

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly pagamentoService: PagamentoService,
    private readonly pedidoService: PedidoService,
    private readonly configService: ConfigService,
  ) {
    this.tempo_limite=Number(this.configService.get('PEDIDO_TIMEOUT_MINUTOS'));
  }

  @Cron('0 */1 * * * *')
  async handleTimeoutPedidos() {
    this.logger.log(magenta(' [CRON JOB] VERIFICAÇÃO DE PEDIDOS EXPIRADOS INICIADA'));

    const limiteData = new Date();
    limiteData.setMinutes(
      limiteData.getMinutes() - this.tempo_limite,
    );

    const pedidosExpirados = await this.pedidoRepository.find({
      where: {
        status: PedidoStatus.AGUARDANDO_PAGAMENTO,
        dataModificacao: LessThan(limiteData),
      },
      relations: ['itens', 'itens.produto', 'pagamento'],
    });

    if (pedidosExpirados.length === 0) {
      this.logger.log(magenta('[CRON JOB] NENHUM PEDIDO EXPIRADO ENCONTRADO.'));
      return;
    }

    this.logger.warn(
      `[CRON JOB] ENCONTRADOS ${magenta(pedidosExpirados.length.toString())} PEDIDOS EXPIRADOS PARA CANCELAMENTO.`,
    );

    for (const pedido of pedidosExpirados) {
      await this.liberarEstoqueECancelarPedido(pedido);
    }

    this.logger.log(magenta(' [CRON JOB] VERIFICAÇÃO DE PEDIDOS CONCLUÍDA'));
  }

  private async liberarEstoqueECancelarPedido(pedido: Pedido): Promise<void> {
    try {
      await this.pedidoService.atualizarStatus(pedido.id,{
        status: PedidoStatus.CANCELADO,
        motivo_cancelamento: 'Pagamento não finalizado (cancelamento automático)',
      });
      this.logger.log(magenta(`[CRON JOB] PEDIDO ${pedido.id} CANCELADO E ESTOQUE LIBERADO.`));

    } catch (error) {
      this.logger.error(red(
        `[CRON JOB ERRO] Falha ao processar o pedido ${pedido.id}: ${error.message}`,
      ));
    }
  }
}