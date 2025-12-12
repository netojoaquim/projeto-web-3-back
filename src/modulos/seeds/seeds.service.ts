// seeds/seed.service.ts
import { Injectable } from '@nestjs/common';
import { ClienteSeed } from './cliente.seed';
import { CategoriaSeed } from './categoria.seed';
import { ProdutoSeed } from './produto.seed';

@Injectable()
export class SeedService {
  constructor(
    private clienteSeed: ClienteSeed,
    private categoriaSeed: CategoriaSeed,
    private produtoSeed: ProdutoSeed,
  ) {}

  async run() {
    await this.categoriaSeed.run();
    await this.clienteSeed.run();
    await this.produtoSeed.run();
  }
}
