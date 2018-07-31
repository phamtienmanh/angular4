export class LoginForm {
  public email: string;
  public password: string;

  constructor() {
    this.email = undefined;
    this.email = undefined;
  }
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetUserInfo {
  userId: number;
  password: string;
  confirmPassword: string;
  code: string;
}
