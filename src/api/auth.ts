import { request } from './client';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  return request<LoginResponse>('/auth/sign-in', {
    method: 'POST',
    body: credentials,
    errorMessage: '로그인에 실패했습니다.',
  });
};

export interface MeResponse {
  status: number;
  message: string;
  data: {
    userId: number;
    role: string;
  };
}

/**
 * 현재 로그인한 사용자 정보를 가져옵니다.
 * 백엔드가 httpOnly 쿠키에서 토큰을 읽습니다.
 * @returns 사용자 정보 (userId, role)
 */
export const getMe = async (): Promise<MeResponse> => {
  return request<MeResponse>('/auth/token', {
    errorMessage: '사용자 정보를 가져오는데 실패했습니다.',
  });
};

/**
 * 로그아웃합니다.
 * 백엔드에서 쿠키를 삭제합니다.
 */
export const logout = async (): Promise<void> => {
  await request<void>('/auth/sign-out', {
    method: 'POST',
    errorMessage: '로그아웃에 실패했습니다.',
  });
};

export interface SignupRequest {
  name: string;
  loginId: string;
  role: 'STUDENT' | 'PARENT';
  phone: string;
  password: string;
  passwordConfirm: string;
  signupSchool?: string;
  signupGrade?: number;
}

export interface SignupResponse {
  statusCode: number;
  message: string;
  data?: {
    userId: number;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * 회원가입을 수행합니다.
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  return request<SignupResponse>('/auth/sign-up', {
    method: 'POST',
    body: data,
    errorMessage: '회원가입에 실패했습니다.',
  });
};
