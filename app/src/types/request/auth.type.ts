export interface SignupRequest {
  email: string;
  password: string;
  tags: string[];
  nickname: string;
  username: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface VerifyCodeRequest {
  verifycode: string;
  email: string;
}

export interface SendVerificationCodeRequest {
  email: string;
}
