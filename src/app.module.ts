import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ClienteModule } from './modulos/cliente/cliente.module';
import { AuthModule } from './modulos/auth/auth.module';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { EnderecoModule } from './modulos/endereco/endereco.module';
import { CategoriaModule } from './modulos/categoria/categoria.module';
import { ProdutoModule } from './modulos/produto/produto.module';
import { CarrinhoModule } from './modulos/carrinho/carrinho.module';
import { CarrinhoItem } from './modulos/carrinho/carrinho-item.entity';
import { PedidoModule } from './modulos/pedido/pedido.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ClienteModule,
    AuthModule,
    EnderecoModule,
    CategoriaModule,
    ProdutoModule,
    CarrinhoModule,
    CarrinhoItem,
    PedidoModule,
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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: config.get<string>('MAIL_SECURE') === 'true',
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
          //logger: true,
          //debug: true,
        },
        defaults: {
          from: config.get<string>('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, '..','src','templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
