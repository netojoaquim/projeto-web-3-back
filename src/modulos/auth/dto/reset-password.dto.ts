import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
export class ResetPasswordDto {
  @IsString() 
  @IsNotEmpty() 
  email: string;

  @IsString() 
  @IsNotEmpty() 
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos.' })
  code: string;

  @IsString() 
  @IsNotEmpty() 
  @MinLength(6) 
  newPassword: string;
}
