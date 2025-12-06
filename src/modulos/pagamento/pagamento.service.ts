import {Injectable,BadRequestException,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Pagamento,PagamentoStatus,MetodoPagamento,} from './pagamento.entity';

@Injectable()
export class PagamentoService {
  constructor(
    @InjectRepository(Pagamento)
    private readonly pagamentoRepository: Repository<Pagamento>,
  ) {}

  async criarPagamento(
    metodo: MetodoPagamento,
    valor: number,
  ): Promise<Pagamento> {
    if (valor <= 0) {
      throw new BadRequestException(
        'O valor do pagamento deve ser maior que zero.',
      );
    }
    const novoPagamento = this.pagamentoRepository.create({
      metodo: metodo,
      valor: valor,
    });
    return this.pagamentoRepository.save(novoPagamento);
  }

  async atualizarPagamento(
    pagamentoId: number,
    status: PagamentoStatus,
  ): Promise<Pagamento> {
    console.log('🔍 [PagamentoService] Update solicitado:', {
      pagamentoId,
      status,
    });

    const update = await this.pagamentoRepository.findOne({
      where: { id: pagamentoId },
    });

    if (!update) {
      console.error('❌ Pagamento não encontrado:', pagamentoId);
      throw new NotFoundException(
        `Pagamento ID ${pagamentoId} não encontrado.`,
      );
    }
    console.log('📌 Antes do update:', update);
    update.status = status;
    update.dataAtualizacao = new Date();

    const atualizado = await this.pagamentoRepository.save(update);
    console.log('✅ Pagamento salvo no banco:', atualizado);

    return atualizado;
  }

  async atualizarMetodo(
    pagamentoId: number,
    metodo: MetodoPagamento,
  ): Promise<Pagamento> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id: pagamentoId },
    });
    if (!pagamento) {
      throw new NotFoundException(
        `Pagamento ID ${pagamentoId} não encontrado.`,
      );
    }
    pagamento.metodo = metodo;
    return this.pagamentoRepository.save(pagamento);
  }
}
