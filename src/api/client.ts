import { API_BASE_URL } from '../constants/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  errorMessage?: string;
};

/**
 * 공통 API 요청 헬퍼. credentials: 'include'로 쿠키를 포함합니다.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    errorMessage = '요청에 실패했습니다.',
  } = options;

  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: errorMessage,
    }));
    throw new Error(errorData.message || errorMessage);
  }

  return response.json();
}
