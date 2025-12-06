import { Injectable, Logger} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Pedido, PedidoStatus } from './pedido.entity';
import { Produto } from '../produto/produto.entity';
import { PagamentoStatus} from '../pagamento/pagamento.entity';
import { red, magenta } from 'colorette';


@Injectable()
export class TimeoutSchedulerService  {


  private readonly logger = new Logger(TimeoutSchedulerService.name);
  private readonly tempo_limite: number;

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
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
        dataCriacao: LessThan(limiteData),
      },
      relations: ['itens', 'itens.produto'],
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

      for (const item of pedido.itens) {
        const produto = item.produto;

        if (produto) console.log('[CRON JOB] Produto encontrado:', produto.id);
        if (!produto) continue;


        produto.estoque_reservado = Math.max(
          0,
          produto.estoque_reservado - item.quantidade,
        );

        await this.produtoRepository.save(produto);
      }

      pedido.status = PedidoStatus.CANCELADO;
      pedido.motivo_cancelamento = 'Pagamento não finalizado (cancelamento automático)';
      pedido.pagamento.status = PagamentoStatus.ANULADO;
      await this.pedidoRepository.save(pedido);

      this.logger.log(magenta(`[CRON JOB] PEDIDO ${pedido.id} CANCELADO E ESTOQUE LIBERADO.`));
    } catch (error) {
      this.logger.error(red(
        `[CRON JOB ERRO] Falha ao processar o pedido ${pedido.id}: ${error.message}`,
      ));
    }
  }
}