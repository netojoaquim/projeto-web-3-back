import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Endereco } from '../endereco/endereco.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) { }

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const { enderecos, ...rest } = createClienteDto;
    const cliente = this.clienteRepository.create(rest);

    if (enderecos && enderecos.length > 0) {
      const enderecoEntities = await this.enderecoRepository.findBy({
        id: In(enderecos.map(Number)), // Certifique-se que são números
      });
      cliente.enderecos = enderecoEntities;
    }

    return this.clienteRepository.save(cliente);
  }

  findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find({ relations: ['enderecos'] });
  }

  async findOneByName(name: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { nome_completo: name },
      relations: ['enderecos'],
    });
    if (!cliente) {
      throw new Error(`Usuário com nome ${name} não encontrado`);
    }
    return cliente;
  }

  async findOneByEmail(email: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { email: email },
      relations: ['enderecos'],
    });
    if (!cliente) {
      throw new Error(`Usuário com email ${email} não encontrado`);
    }
    return cliente;
  }

  async findOneByNumber(numero: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { numero_telefone: numero },
      relations: ['enderecos'],
    });
    if (!cliente) {
      throw new Error(`Usuário com nome ${numero} não encontrado`);
    }
    return cliente;
  }

  async findOneByPassword(senha: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { senha: senha },
      relations: ['enderecos'],
    });
    if (!cliente) {
      throw new Error(`Usuário não encontrado`);
    }
    return cliente;
  }


  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['enderecos'],
    });
    if (!cliente) {
      throw new Error(`Usuario with id ${id} not found`);
    }
    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['veiculos'],
    });

    if (!cliente) {
      throw new Error('Usuário não encontrado');
    }

    // Atualiza campos simples
    Object.assign(cliente, updateClienteDto);

    // Atualiza relação de veículos, se enviado no DTO
    if (updateClienteDto.enderecos) {
      const enderecos = await this.enderecoRepository.findBy({
        id: In(updateClienteDto.enderecos),
      });
      cliente.enderecos = enderecos;
    }

    await this.clienteRepository.save(cliente);
    return this.findOne(id);
  }

  async remove(id: number): Promise<DeleteResult> {
    const result = await this.clienteRepository.delete(id);
    return result;
  }
}