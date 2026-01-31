import { request } from './client';

export interface Textbook {
  textbookId: number;
  name: string;
  grade: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TextbooksListResponse {
  statusCode: number;
  message: string;
  data: Textbook[];
}

export interface ClassTextbook {
  classTextbookId: number;
  clazz: {
    classId: number;
    className: string;
  } | null;
}

export interface TextbookDetailResponse {
  statusCode: number;
  message: string;
  data: {
    textbookId: number;
    name: string;
    grade: number;
    classTextbooks: ClassTextbook[];
  };
}

export interface CreateTextbookRequest {
  name: string;
  grade: number;
  units: number[];
  classList: number[];
}

export interface CreateTextbookResponse {
  statusCode: number;
  message: string;
  data: {
    name: string;
    grade: number;
    textbookId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface UpdateTextbookRequest {
  name?: string;
  grade?: number;
  units?: number[];
  classList?: number[];
}

export interface UpdateTextbookResponse {
  statusCode: number;
  message: string;
  data?: Textbook;
}

/**
 * 교재 전체 목록을 조회합니다.
 * @returns 교재 목록
 */
export const getTextbooks = async (): Promise<TextbooksListResponse> => {
  return request<TextbooksListResponse>('/textbooks', {
    errorMessage: '교재 목록을 가져오는데 실패했습니다.',
  });
};

/**
 * 특정 교재의 상세 정보를 조회합니다.
 * @param textbookId 교재 ID
 * @returns 교재 상세 정보
 */
export const getTextbookDetail = async (
  textbookId: number
): Promise<TextbookDetailResponse> => {
  return request<TextbookDetailResponse>(`/textbooks/${textbookId}`, {
    errorMessage: '교재 상세 정보를 가져오는데 실패했습니다.',
  });
};

/**
 * 교재를 생성합니다.
 * @param data 교재 생성 데이터
 * @returns 생성된 교재 정보
 */
export const createTextbook = async (
  data: CreateTextbookRequest
): Promise<CreateTextbookResponse> => {
  return request<CreateTextbookResponse>('/textbooks', {
    method: 'POST',
    body: data,
    errorMessage: '교재 생성에 실패했습니다.',
  });
};

/**
 * 교재를 수정합니다.
 * @param textbookId 교재 ID
 * @param data 교재 수정 데이터
 * @returns 수정된 교재 정보
 */
export const updateTextbook = async (
  textbookId: number,
  data: UpdateTextbookRequest
): Promise<UpdateTextbookResponse> => {
  return request<UpdateTextbookResponse>(`/textbooks/${textbookId}`, {
    method: 'PATCH',
    body: data,
    errorMessage: '교재 수정에 실패했습니다.',
  });
};

/**
 * 교재를 삭제합니다.
 * @param textbookId 교재 ID
 */
export const deleteTextbook = async (textbookId: number): Promise<void> => {
  await request<void>(`/textbooks/${textbookId}`, {
    method: 'DELETE',
    errorMessage: '교재 삭제에 실패했습니다.',
  });
};
