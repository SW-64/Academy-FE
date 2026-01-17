import { API_BASE_URL } from '../constants/api';

export interface LoginRequest {
  email: string;
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
  const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '로그인에 실패했습니다.',
    }));
    throw new Error(errorData.message || '로그인에 실패했습니다.');
  }

  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '사용자 정보를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '사용자 정보를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

/**
 * 로그아웃합니다.
 * 백엔드에서 쿠키를 삭제합니다.
 */
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '로그아웃에 실패했습니다.',
    }));
    throw new Error(errorData.message || '로그아웃에 실패했습니다.');
  }
};

export interface SignupRequest {
  name: string;
  email: string;
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
export const signup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '회원가입에 실패했습니다.',
    }));
    throw new Error(errorData.message || '회원가입에 실패했습니다.');
  }

  return response.json();
};
