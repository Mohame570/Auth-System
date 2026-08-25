export class ResetPasswordDto {
  email: string;
}

export class ConfirmResetDto {
  token: string;
  newPassword: string;
}
