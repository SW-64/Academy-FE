import { request } from './client';

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
 * @param page 페이지 번호 (1부터 시작)
 * @param limit 한 페이지당 항목 수 (기본 10)
 * @returns 승인 대기 중인 유저 목록
 */
export const getPendingUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<PendingUsersResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request<PendingUsersResponse>(`/users/pending?${params}`, {
    errorMessage: '승인 대기 중인 유저 목록을 가져오는데 실패했습니다.',
  });
};

/**
 * 블랙리스트 유저 목록을 조회합니다.
 * @returns 블랙리스트 유저 목록
 */
export const getBlacklistUsers = async (): Promise<BlacklistUsersResponse> => {
  return request<BlacklistUsersResponse>('/users/blacklist', {
    errorMessage: '블랙리스트 유저 목록을 가져오는데 실패했습니다.',
  });
};

/**
 * 유저 계정을 승인합니다.
 * @param userId 유저 ID
 * @returns 승인 응답
 */
export const approveUser = async (
  userId: number
): Promise<ApproveUserResponse> => {
  return request<ApproveUserResponse>(`/users/${userId}/approve`, {
    method: 'PATCH',
    errorMessage: '유저 계정 승인에 실패했습니다.',
  });
};

/**
 * 유저 계정을 거절합니다.
 * @param userId 유저 ID
 * @returns 거절 응답
 */
export const rejectUser = async (
  userId: number
): Promise<RejectUserResponse> => {
  return request<RejectUserResponse>(`/users/${userId}/reject`, {
    method: 'PATCH',
    errorMessage: '유저 계정 거절에 실패했습니다.',
  });
};

/**
 * 블랙리스트에서 유저를 복구합니다.
 * @param userId 유저 ID
 * @returns 복구 응답
 */
export const unblacklistUser = async (
  userId: number
): Promise<UnblacklistUserResponse> => {
  return request<UnblacklistUserResponse>(`/users/${userId}/unblacklist`, {
    method: 'PATCH',
    errorMessage: '블랙리스트 복구에 실패했습니다.',
  });
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
  return request<UpdateUserInfoResponse>(`/users/${userId}/info`, {
    method: 'PATCH',
    body: data,
    errorMessage: '유저 정보 수정에 실패했습니다.',
  });
};

export interface MyInfoResponse {
  statusCode: number;
  message: string;
  data: {
    userId: number;
    loginId?: string;
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
  return request<MyInfoResponse>('/users/me', {
    errorMessage: '내 정보를 가져오는데 실패했습니다.',
  });
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
  return request<UpdateMyInfoResponse>('/users/me', {
    method: 'PATCH',
    body: data,
    errorMessage: '내 정보 수정에 실패했습니다.',
  });
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
  return request<ChangePasswordResponse>('/users/me/password', {
    method: 'PATCH',
    body: data,
    errorMessage: '비밀번호 변경에 실패했습니다.',
  });
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
  return request<ResetPasswordResponse>(`/users/${userId}/reset-password`, {
    method: 'POST',
    body: data,
    errorMessage: '비밀번호 초기화에 실패했습니다.',
  });
};
