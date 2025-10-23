import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from './modulos/cliente/cliente.module';
import { AuthModule } from './modulos/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EnderecoModule } from './modulos/endereco/endereco.module';
import { CategoriaModule } from './modulos/categoria/categoria.module';
import { ProdutoModule } from './modulos/produto/produto.module';
import { CarrinhoModule } from './modulos/carrinho/carrinho.module';
import { CarrinhoItem } from './modulos/carrinho/carrinho-item.entity';

@Module({
  imports: [
    ClienteModule,
    AuthModule,
    EnderecoModule,
    CategoriaModule,
    ProdutoModule,
    CarrinhoModule,
    CarrinhoItem,
    ConfigModule.forRoot({
      isGlobal: true,
    }),  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST||'localhost',
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/modulos/**/*.entity{.ts,.js}'],
      logging: true,
      synchronize: true, 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
