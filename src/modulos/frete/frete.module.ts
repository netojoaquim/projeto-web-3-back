import { Module } from '@nestjs/common';
import { FreteService } from './frete.service';
import { HttpModule } from '@nestjs/axios';
import { FreteController } from './frete.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    HttpModule],
  providers: [FreteService],
  exports: [FreteService],
  controllers: [FreteController],
})
export class FreteModule {}