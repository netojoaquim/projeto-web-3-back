import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { ClienteService } from 'src/modulos/cliente/cliente.service';
import { Cliente } from 'src/modulos/cliente/cliente.entity';
import { AuthJwtPayload } from './dto/auth-jwtPayload.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './password-reset-token.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AuthService {
  constructor(
    private readonly clienteService: ClienteService,
    private jwtService: JwtService,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(identificador: string, password: string) {
    let cliente: Cliente;

    if (identificador.includes('@')) {
      cliente = await this.clienteService.findOneByEmail(identificador);
    } else {
      cliente = await this.clienteService.findOneByNumber(identificador);
    }

    if (!cliente) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    if (!cliente.ativo) {
      throw new UnauthorizedException('Usuário desativado');
    }

    const isPasswordMatch = await compare(password, cliente.senha);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return cliente;
  }

  login(cliente: Cliente) {
    const payload = {
      sub: cliente.id,
      role: cliente.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const cliente = await this.clienteRepository.findOneBy({ email });
    if (!cliente) {
      throw new BadRequestException('Email não cadastrado na base de dados.');
    }
    const existingToken = await this.tokenRepository.findOne({
      where: { cliente: { id: cliente.id } },
      order: { createdAt: 'DESC' },
    });

    if (existingToken) {
      const now = Date.now();
      const lastRequestTime = existingToken.createdAt.getTime();

      const minIntervalEnv = this.configService.get<string>('MIN_INTERVAL_MS');
      const minInterval = Number(minIntervalEnv);

      if (now - lastRequestTime < minInterval) {
        // Tempo mínimo ainda não passou
        throw new BadRequestException(
          'Voce solicitou a redefinição de senha recentemente. Tente novamente mais tarde.',
        );
      }
    }
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto
      .createHash('sha256')
      .update(rawCode)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 300000);

    await this.tokenRepository.delete({ cliente: { id: cliente.id } });

    const resetToken = this.tokenRepository.create({
      token: hashedCode,
      cliente,
      expiresAt,
    });
    await this.tokenRepository.save(resetToken);

    //envia o e-mail
    await this.mailerService.sendMail({
      to: cliente.email,
      subject: 'Código de Recuperação de Senha - Guarashop',
      template: 'recuperacao-senha',
      context: {
        nome: cliente.nome_completo,
        code: rawCode,
      },
    });
  }

  async resetPassword(
    code: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    if (!code || !newPassword || !email) {
      throw new UnauthorizedException('Dados inválidos.');
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const resetToken = await this.tokenRepository.findOne({
      where: { token: hashedCode, cliente: { email } },
      relations: ['cliente'],
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token inválido.');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expirado.');
    }

    const usuario = resetToken.cliente;
    usuario.senha = newPassword;

    await this.clienteRepository.save(usuario);
    await this.tokenRepository.delete(resetToken.id);

    const agoraRecife = dayjs().tz('America/Recife');

    await this.mailerService.sendMail({
      to: usuario.email,
      subject: 'Alteração de senha- Guarashop',
      template: 'alteracao-senha',
      context: {
        nome: usuario.nome_completo,
        date: agoraRecife.format('DD/MM/YYYY'),
        time: agoraRecife.format('HH:mm:ss'),
      },
    });
  }
}
