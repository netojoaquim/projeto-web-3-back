import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from './modulos/cliente/cliente.module';
import { AuthModule } from './modulos/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
  

@Module({
  imports: [
    ClienteModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST||'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '6415',
      database: process.env.DB_NAME || 'postgres',
      entities: [__dirname + '/modulos/**/*.entity{.ts,.js}'],
      logging: true,
      synchronize: true, 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
