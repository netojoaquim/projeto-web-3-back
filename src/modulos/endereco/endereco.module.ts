import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../cliente/cliente.entity'; 
import { EnderecoController } from './endereco.controller';
import { EnderecoService } from './endereco.service';
import { Endereco } from './endereco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco, Cliente])],
  providers: [EnderecoService],
  controllers: [EnderecoController]
})
export class EnderecoModule {}