import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClienteService } from 'src/modulos/cliente/cliente.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: ClienteService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: LoginDto })
  async login(@Request() req) {
    // req.user é o cliente completo retornado pelo LocalStrategy
    const cliente = req.user;

    // 🔥 Gere o token com o cliente inteiro (inclui id e role)
    const token = this.authService.login(cliente);

    // Busque os dados atualizados do usuário (opcional)
    const userData = await this.usuarioService.findOne(cliente.id);

    return {
      id: cliente.id,
      token,
      usuario: userData,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    await this.authService.forgotPassword(email);
    return { message: 'email enviado se existir usuario' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() { email, code, newPassword }: ResetPasswordDto) {
    await this.authService.resetPassword(code, email, newPassword);
    return { message: 'Senha redefinida com sucesso.' };
  }
}
