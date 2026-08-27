import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  newPassword: string;
}
