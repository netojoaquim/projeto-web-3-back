import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/modulos/cliente/cliente.entity';
import { Repository } from 'typeorm';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { Endereco } from './endereco.entity';

@Injectable()
export class EnderecoService {
  constructor(
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createEnderecoDto: CreateEnderecoDto): Promise<Endereco> {
    const { clienteId, padrao, ...enderecoData } = createEnderecoDto;

    const cliente = await this.clienteRepository.findOneBy({ id: clienteId });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${clienteId} não encontrado.`);
    }
    if (padrao){
      await this.enderecoRepository.update(
        { cliente: { id: clienteId }, padrao: true },
        { padrao: false },
      );
    }

    const endereco = this.enderecoRepository.create({
      ...enderecoData, 
      padrao:padrao || false,
      cliente,
    });


    return this.enderecoRepository.save(endereco);
  }

  findAll(): Promise<Endereco[]> {
    return this.enderecoRepository.find({ relations: ['cliente'] });
  }

  async findAllByCliente(clienteId: number): Promise<Endereco[]> {
    const enderecos = await this.enderecoRepository.find({
      where: { cliente: { id: clienteId } },
    });

    if (!enderecos || enderecos.length === 0) {
      throw new NotFoundException(`Nenhum endereço encontrado para o cliente ${clienteId}`);
    }

    return enderecos;
  }

  async findOne(id: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({
      where: { id },
      relations: ['cliente'],
    });

    if (!endereco) {
      throw new NotFoundException(`endereco com ID ${id} não encontrado.`);
    }
    return endereco;
  }

  async update(id: number, updateEnderecoDto: UpdateEnderecoDto): Promise<Endereco> {
    const endereco = await this.findOne(id);
    const { clienteId, padrao, ...enderecoData } = updateEnderecoDto;

    if (clienteId) {
      const cliente = await this.clienteRepository.findOneBy({ id: clienteId });
      if (!cliente) {
        throw new NotFoundException(`Cliente com ID ${clienteId} não encontrado.`);
      }
      endereco.cliente = cliente;
    }

    if (padrao){
      await this.enderecoRepository.update(
        { cliente: { id: endereco.cliente.id }},
        { padrao: false },
      );
    }

    Object.assign(endereco, { ...enderecoData, padrao: padrao ?? endereco.padrao });
    return this.enderecoRepository.save(endereco);
  }

  async remove(id: number): Promise<void> {
    const result = await this.enderecoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Endereco com ID ${id} não encontrado.`);
    }
  }
  async getEnderecoPadrao(clienteId: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({
      where: { cliente: { id: clienteId }, padrao: true },
      relations: ['cliente'],
    });

    if (!endereco) {
      throw new NotFoundException(`Nenhum endereço padrão encontrado para o cliente ID ${clienteId}`);
    }

    return endereco;
  }

  async definirComoPadrao(id: number): Promise<Endereco> {
    const endereco = await this.findOne(id); // findOne já lança NotFoundException se não existir

    // Desmarca todos os outros endereços do mesmo cliente
    await this.enderecoRepository.update(
      { cliente: { id: endereco.cliente.id } },
      { padrao: false },
    );

    // Marca este como o novo padrão
    endereco.padrao = true;
    return this.enderecoRepository.save(endereco);
  }
}