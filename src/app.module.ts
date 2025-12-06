import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from './modulos/cliente/cliente.module';
import { AuthModule } from './modulos/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnderecoModule } from './modulos/endereco/endereco.module';
import { CategoriaModule } from './modulos/categoria/categoria.module';
import { ProdutoModule } from './modulos/produto/produto.module';
import { CarrinhoModule } from './modulos/carrinho/carrinho.module';
import { PedidoModule } from './modulos/pedido/pedido.module';
import { PagamentoModule } from './modulos/pagamento/pagamento.module';
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
    PedidoModule,
    PagamentoModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        
        // 🔍 LOG AQUI — MOSTRA A CONFIG DE CONEXÃO
        console.log('🔍 Conectando ao banco:', {
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          user: configService.get<string>('DB_USERNAME'),
          database: configService.get<string>('DB_NAME'),
        });

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/modulos/**/*.entity{.ts,.js}'],
          synchronize: true,
          extra: {
            options: '-c timezone=America/Recife',
          },
        };
      },
      inject: [ConfigService],
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
        },
        defaults: {
          from: config.get<string>('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, '..', 'src', 'templates'),
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
