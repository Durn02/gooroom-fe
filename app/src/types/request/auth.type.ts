export interface SendVerificationCodeRequestData {
  verifycode: string;
  email: string;
}

export interface SignupRequestData {
  email: string;
  password: string;
  concern: string[];
  nickname: string;
  username: string;
};

export interface VerificationCodeRequestData {
  email: string;
};