import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { ClienteModule } from '../cliente/cliente.module';
import jwtConfig from './jwt.config';
import { AuthController } from './auth.controller';
import { PasswordResetToken } from './password-reset-token.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      PasswordResetToken
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ClienteModule,
    MailerModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule { }
