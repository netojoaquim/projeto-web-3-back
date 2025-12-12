import {Injectable,BadRequestException,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, EntityManager } from 'typeorm';
import { UpdatePagamentoDto } from './UpdatePagamentoDto';

import {
  Pagamento,
  PagamentoStatus,
  MetodoPagamento,
} from './pagamento.entity';

import { PagamentoPix } from './pagamento.pix.entity';
import { PagamentoBoleto } from './pagamento.boleto.entity';
import { PagamentoCartao } from './pagamento.cartao.entity';

type PagamentoDetalhado = PagamentoCartao | PagamentoPix | PagamentoBoleto;

@Injectable()
export class PagamentoService {
  constructor(
    @InjectRepository(PagamentoCartao)
    private cartaoRepository: Repository<PagamentoCartao>,

    @InjectRepository(PagamentoPix)
    private pixRepository: Repository<PagamentoPix>,

    @InjectRepository(PagamentoBoleto)
    private boletoRepository: Repository<PagamentoBoleto>,

    @InjectRepository(Pagamento)
    private readonly pagamentoRepository: Repository<Pagamento>,
  ) {}

  // instancia pagamento conforme dto

  async criarPagamento(dto: {
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
  }): Promise<PagamentoDetalhado> {
    if (dto.valor <= 0) {
      throw new BadRequestException('O valor do pagamento deve ser maior que zero.');
    }

    switch (dto.metodo) {
      case MetodoPagamento.CARTAO:
        // cria a instância
        return this.criarPagamentoCartao({
          valor: dto.valor,
          numeroCartao: dto.numeroCartao!,
          nomeTitular: dto.nomeTitular!,
          codigoVerificador: dto.codigoVerificador!,
          validade: dto.validade!,
        });

      case MetodoPagamento.PIX:
        if (!dto.chavePix) {
          dto.chavePix = '';
        }
        return this.criarPagamentoPix({
          valor: dto.valor,
          chavePix: dto.chavePix || '',
          qrCode: dto.qrCode,
        });

      case MetodoPagamento.BOLETO:
        return this.criarPagamentoBoleto({
          valor: dto.valor,
          codigoBarras: dto.codigoBarras!,
          dataVencimento: dto.dataVencimento!,
        });

      default:
        throw new BadRequestException('Método de pagamento inválido.');
    }
  }

  //cria entidade sem salvar
  private criarPagamentoPix(dto: {
    valor: number;
    chavePix: string;
    qrCode?: string;
  }): PagamentoPix {
    if (dto.valor <= 0)
      throw new BadRequestException('Valor deve ser maior que zero.');

    const pagamentoBase = this.pagamentoRepository.create({
      metodo: MetodoPagamento.PIX,
      valor: dto.valor,
      status: PagamentoStatus.PENDENTE,
    });

    const pagamentoPix = this.pixRepository.create({
      chavePix: dto.chavePix,
      qrCode: dto.qrCode,
      pagamento: pagamentoBase,
    });

    return pagamentoPix;
  }

  //cria entidade sem salvar
  private criarPagamentoCartao(dto: {
    valor: number;
    numeroCartao: string;
    nomeTitular: string;
    codigoVerificador: string;
    validade: string;
  }): PagamentoCartao {
    if (dto.valor <= 0)
      throw new BadRequestException('Valor deve ser maior que zero.');

    const pagamentoBase = this.pagamentoRepository.create({
      metodo: MetodoPagamento.CARTAO,
      valor: dto.valor,
      status: PagamentoStatus.PENDENTE,
    });

    const pagamentoCartao = this.cartaoRepository.create({
      numeroCartao: dto.numeroCartao,
      nomeTitular: dto.nomeTitular,
      codigoVerificador: dto.codigoVerificador,
      validade: dto.validade,
      pagamento: pagamentoBase,
    });

    return pagamentoCartao;
  }


  private criarPagamentoBoleto(dto: {
    valor: number;
    codigoBarras: string;
    dataVencimento: string;
  }): PagamentoBoleto {
    if (dto.valor <= 0)
      throw new BadRequestException('Valor deve ser maior que zero.');

    const pagamentoBase = this.pagamentoRepository.create({
      metodo: MetodoPagamento.BOLETO,
      valor: dto.valor,
      status: PagamentoStatus.PENDENTE,
    });

    const pagamentoBoleto = this.boletoRepository.create({
      codigoBarras: dto.codigoBarras,
      dataVencimento: dto.dataVencimento,
      pagamento: pagamentoBase,
    });

    return pagamentoBoleto;
  }

  async atualizarStatusPagamento(
    pagamentoId: number,
    status: PagamentoStatus,
    queryRunner: QueryRunner,
  ): Promise<Pagamento> {


    const pagamento = await queryRunner.manager.findOne(Pagamento, {
      where: { id: pagamentoId },
    });

    if (!pagamento) {
      throw new NotFoundException(`Pagamento ID ${pagamentoId} não encontrado na transação.`);
    }

    pagamento.status = status;
    pagamento.dataAtualizacao = new Date();

    return queryRunner.manager.save(pagamento);
  }


  async atualizarMetodo(
    pagamentoId: number,
    metodo: MetodoPagamento,
  ): Promise<Pagamento> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id: pagamentoId },
    });

    if (!pagamento)
      throw new NotFoundException(`Pagamento ID ${pagamentoId} não encontrado.`);

    pagamento.metodo = metodo;
    return this.pagamentoRepository.save(pagamento);
  }

  async processarAtualizacaoDetalhes(
    pagamentoId: number,
    novoMetodo: MetodoPagamento,
    detalhes: any,
    queryRunner: QueryRunner,
): Promise<PagamentoDetalhado> {

    const manager = queryRunner.manager;

    const pagamentoBase = await manager.findOne(Pagamento, {
        where: { id: pagamentoId },
        relations: ['pagamentoCartao', 'pagamentoPix', 'pagamentoBoleto'],
    });

    if (!pagamentoBase) {
        throw new NotFoundException(`Pagamento ID ${pagamentoId} não encontrado.`);
    }

    const metodoAnterior = pagamentoBase.metodo;
    let pagamentoDetalhadoSalvo: PagamentoDetalhado;
    let deveDeletarDetalhesAnteriores = false;

    if (metodoAnterior !== novoMetodo) {
        deveDeletarDetalhesAnteriores = true;
    }

    pagamentoBase.metodo = novoMetodo;
    pagamentoBase.dataAtualizacao = new Date();
    await manager.save(pagamentoBase);

    // 4. Cria ou Atualiza a entidade detalhada do NOVO método
    let novaEntidadeDetalhada: PagamentoDetalhado;

    if (novoMetodo === MetodoPagamento.CARTAO) {
        novaEntidadeDetalhada = this.criarOuAtualizarCartao(detalhes, pagamentoBase, manager);
    } else if (novoMetodo === MetodoPagamento.PIX) {
        novaEntidadeDetalhada = this.criarOuAtualizarPix(detalhes, pagamentoBase, manager);
    } else if (novoMetodo === MetodoPagamento.BOLETO) {
        novaEntidadeDetalhada = this.criarOuAtualizarBoleto(detalhes, pagamentoBase, manager);
    } else {
        throw new BadRequestException('Método de pagamento inválido.');
    }

    pagamentoDetalhadoSalvo = await manager.save(novaEntidadeDetalhada as any);

    // 5. Executa a DELEÇÃO (após a nova entidade ter sido salva)
    if (deveDeletarDetalhesAnteriores) {
        await this.deletarDetalhesAntigos(metodoAnterior, pagamentoBase, manager);
    }


    // Retorna a entidade detalhada salva
    return pagamentoDetalhadoSalvo;
}


private criarOuAtualizarCartao(detalhes: any, pagamentoBase: Pagamento, manager: EntityManager): PagamentoCartao {
    let cartao = pagamentoBase.pagamentoCartao || this.cartaoRepository.create();

    cartao.pagamento = pagamentoBase;
    cartao.numeroCartao = detalhes.numeroCartao;
    cartao.nomeTitular = detalhes.nomeTitular;
    cartao.codigoVerificador = detalhes.codigoVerificador;
    cartao.validade = detalhes.validade;

    return cartao;
}

private criarOuAtualizarPix(detalhes: any, pagamentoBase: Pagamento, manager: EntityManager): PagamentoPix {
    let pix = pagamentoBase.pagamentoPix || this.pixRepository.create();
    pix.pagamento = pagamentoBase;
    pix.chavePix = detalhes.chavePix;
    return pix;
}

private criarOuAtualizarBoleto(detalhes: any, pagamentoBase: Pagamento, manager: EntityManager): PagamentoBoleto {
    let boleto = pagamentoBase.pagamentoBoleto || this.boletoRepository.create();

    boleto.pagamento = pagamentoBase;
    return boleto;
}


private async deletarDetalhesAntigos(
    metodo: MetodoPagamento,
    pagamentoBase: Pagamento,
    manager: EntityManager
): Promise<void> {

    if (metodo === MetodoPagamento.CARTAO && pagamentoBase.pagamentoCartao) {
        await manager.delete(PagamentoCartao, pagamentoBase.pagamentoCartao.id);
    } else if (metodo === MetodoPagamento.PIX && pagamentoBase.pagamentoPix) {
        await manager.delete(PagamentoPix, pagamentoBase.pagamentoPix.id);
    } else if (metodo === MetodoPagamento.BOLETO && pagamentoBase.pagamentoBoleto) {
        await manager.delete(PagamentoBoleto, pagamentoBase.pagamentoBoleto.id);
    }
}
}