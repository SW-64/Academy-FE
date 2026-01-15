import { API_BASE_URL } from '../constants/api';

export interface ParentsListResponse {
  statusCode: number;
  message: string;
  data: {
    items: ParentItem[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface ParentItem {
  userId: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  createdAt: string;
  parent: {
    parentId: number;
    student: Array<{
      studentId: number;
      user: {
        userId: number;
        name: string;
      };
    }>;
  };
}

export interface ParentDetailResponse {
  statusCode: number;
  message: string;
  data: {
    parentId: number;
    user: {
      userId: number;
      email: string;
      name: string;
      phone: string;
      status: string;
    };
    student: Array<{
      studentId: number;
      userId: number;
      grade: number;
      school: string;
      createdAt: string;
      user: {
        name: string;
        phone: string;
      };
    }>;
  };
}

/**
 * 전체 학부모 목록을 조회합니다 (페이지네이션).
 * @param page 페이지 번호 (기본값: 1)
 * @param limit 페이지당 항목 수 (기본값: 10)
 * @returns 학부모 목록
 */
export const getParents = async (
  page: number = 1,
  limit: number = 10
): Promise<ParentsListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/parents?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키를 포함하여 요청
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학부모 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학부모 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

/**
 * 특정 학부모의 상세 정보를 조회합니다.
 * @param parentId 학부모 ID
 * @returns 학부모 상세 정보
 */
export const getParentDetail = async (
  parentId: number
): Promise<ParentDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/parents/${parentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학부모 정보를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학부모 정보를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};
