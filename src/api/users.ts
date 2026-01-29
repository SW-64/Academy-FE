import { API_BASE_URL } from '../constants/api';

export interface RejectUserResponse {
  statusCode: number;
  message: string;
}

export interface ApproveUserResponse {
  statusCode: number;
  message: string;
}

export interface UnblacklistUserResponse {
  statusCode: number;
  message: string;
}

export interface PendingUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  signupSchool: string;
  signupGrade: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BlacklistUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  signupSchool: string;
  signupGrade: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PendingUsersResponse {
  statusCode: number;
  message: string;
  data: {
    items: PendingUser[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface BlacklistUsersResponse {
  statusCode: number;
  message: string;
  data: {
    items: BlacklistUser[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

/**
 * 승인 대기 중인 유저 목록을 조회합니다.
 * @returns 승인 대기 중인 유저 목록
 */
export const getPendingUsers = async (): Promise<PendingUsersResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '승인 대기 중인 유저 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '승인 대기 중인 유저 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

/**
 * 블랙리스트 유저 목록을 조회합니다.
 * @returns 블랙리스트 유저 목록
 */
export const getBlacklistUsers = async (): Promise<BlacklistUsersResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/blacklist`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '블랙리스트 유저 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '블랙리스트 유저 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

/**
 * 유저 계정을 승인합니다.
 * @param userId 유저 ID
 * @returns 승인 응답
 */
export const approveUser = async (
  userId: number
): Promise<ApproveUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '유저 계정 승인에 실패했습니다.',
    }));
    throw new Error(errorData.message || '유저 계정 승인에 실패했습니다.');
  }

  return response.json();
};

/**
 * 유저 계정을 거절합니다.
 * @param userId 유저 ID
 * @returns 거절 응답
 */
export const rejectUser = async (
  userId: number
): Promise<RejectUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '유저 계정 거절에 실패했습니다.',
    }));
    throw new Error(errorData.message || '유저 계정 거절에 실패했습니다.');
  }

  return response.json();
};

/**
 * 블랙리스트에서 유저를 복구합니다.
 * @param userId 유저 ID
 * @returns 복구 응답
 */
export const unblacklistUser = async (
  userId: number
): Promise<UnblacklistUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/unblacklist`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '블랙리스트 복구에 실패했습니다.',
    }));
    throw new Error(errorData.message || '블랙리스트 복구에 실패했습니다.');
  }

  return response.json();
};

export interface UpdateUserInfoDto {
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  grade?: number;
}

export interface UpdateUserInfoResponse {
  statusCode: number;
  message: string;
}

/**
 * 유저 정보를 수정합니다.
 * @param userId 유저 ID
 * @param data 수정할 정보
 * @returns 수정 응답
 */
export const updateUserInfo = async (
  userId: number,
  data: UpdateUserInfoDto
): Promise<UpdateUserInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '유저 정보 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '유저 정보 수정에 실패했습니다.');
  }

  return response.json();
};

export interface MyInfoResponse {
  statusCode: number;
  message: string;
  data: {
    userId: number;
    email: string;
    name: string;
    role: string;
    phone: string;
    status: string;
    signupSchool: string | null;
    signupGrade: number | null;
  };
}

/**
 * 내 정보를 조회합니다.
 * @returns 내 정보
 */
export const getMyInfo = async (): Promise<MyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '내 정보를 가져오는데 실패했습니다.',
    }));
    throw new Error(errorData.message || '내 정보를 가져오는데 실패했습니다.');
  }

  return response.json();
};

export interface UpdateMyInfoDto {
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  grade?: number;
}

export interface UpdateMyInfoResponse {
  statusCode: number;
  message: string;
}

/**
 * 내 정보를 수정합니다.
 * @param data 수정할 정보
 * @returns 수정 응답
 */
export const updateMyInfo = async (
  data: UpdateMyInfoDto
): Promise<UpdateMyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '내 정보 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '내 정보 수정에 실패했습니다.');
  }

  return response.json();
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface ChangePasswordResponse {
  statusCode: number;
  message: string;
}

/**
 * 비밀번호를 변경합니다.
 * @param data 비밀번호 변경 데이터
 * @returns 변경 응답
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '비밀번호 변경에 실패했습니다.',
    }));
    throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
  }

  return response.json();
};

export interface ResetPasswordRequest {
  newPassword: string;
  newPasswordConfirm: string;
}

export interface ResetPasswordResponse {
  statusCode: number;
  message: string;
}

/**
 * 유저 비밀번호를 초기화합니다.
 * @param userId 유저 ID
 * @param data 비밀번호 초기화 데이터
 * @returns 초기화 응답
 */
export const resetUserPassword = async (
  userId: number,
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키를 포함하여 요청
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '비밀번호 초기화에 실패했습니다.',
    }));
    throw new Error(errorData.message || '비밀번호 초기화에 실패했습니다.');
  }

  return response.json();
};
