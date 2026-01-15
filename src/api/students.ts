import { API_BASE_URL } from '../constants/api';

export interface StudentsListResponse {
  statusCode: number;
  message: string;
  data: {
    items: StudentItem[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface StudentItem {
  userId: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  createdAt: string;
  student: {
    studentId: number;
    grade: number;
    school: string;
    parent: {
      parentId: number;
      user: {
        userId: number;
        name: string;
      };
    } | null;
  };
}

export interface StudentDetailResponse {
  statusCode: number;
  message: string;
  data: {
    studentId: number;
    parentId: number | null;
    grade: number;
    school: string;
    user: {
      userId: number;
      email: string;
      name: string;
      phone: string;
      status: string;
    };
    parent: {
      parentId: number;
      user: {
        userId: number;
        name: string;
      };
    } | null;
  };
}

/**
 * 전체 학생 목록을 조회합니다 (페이지네이션).
 * @param page 페이지 번호 (기본값: 1)
 * @param limit 페이지당 항목 수 (기본값: 10)
 * @returns 학생 목록
 */
export const getStudents = async (
  page: number = 1,
  limit: number = 10
): Promise<StudentsListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/students?page=${page}&limit=${limit}`,
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
      message: '학생 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학생 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

/**
 * 특정 학생의 상세 정보를 조회합니다.
 * @param studentId 학생 ID
 * @returns 학생 상세 정보
 */
export const getStudentDetail = async (
  studentId: number
): Promise<StudentDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학생 정보를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학생 정보를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};
