import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { Cliente } from './cliente.entity';
import { Endereco } from '../endereco/endereco.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cliente,Endereco])],
    controllers: [ClienteController],
    providers: [ClienteService],
    exports: [ClienteService]
})
export class ClienteModule {}