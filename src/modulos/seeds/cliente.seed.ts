import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { UserRole } from '../cliente/cliente.entity';


@Injectable()
export class ClienteSeed {
  constructor(
    @InjectRepository(Cliente)
    private repo: Repository<Cliente>,
  ) {}

  async run() {
    const count = await this.repo.count();
    if (count > 0) return;

    const cliente = [
      {
        id: 1,
        nome_completo: 'admin',
        email: 'admin@email.com',
        numero_telefone: '(81) 9595-8284',
        senha: '654321',
        data_nascimento: new Date('2001-11-22'),
        role: UserRole.ADMIN,
        ativo: true,
      },
      {
        id: 2,
        nome_completo: 'jose joaquim',
        email: 'joaquimsantana283@gmail.com',
        numero_telefone: '(81) 99565-0419',
        senha: '123456',
        data_nascimento: new Date('2001-11-22'),
        role: UserRole.CLIENTE,
        ativo: true,
      },
    ];

    await this.repo.save(cliente);
  }
}
