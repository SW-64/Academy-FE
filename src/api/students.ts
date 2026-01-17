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

export interface StudentClass {
  classId: number;
  className: string;
}

export interface StudentClassesResponse {
  statusCode: number;
  message: string;
  data: StudentClass[];
}

/**
 * 현재 로그인한 학생의 클래스 목록을 조회합니다.
 * @returns 학생의 클래스 목록
 */
export const getMyClasses = async (): Promise<StudentClassesResponse> => {
  const response = await fetch(`${API_BASE_URL}/students/me/classes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '내 클래스 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '내 클래스 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface Chapter {
  chapterId: number;
  largeUnitNo: number;
  smallUnitNo: number;
  label: string;
}

export interface CellData {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  percent: number;
  updatedAt: string;
}

export interface StudentHomeworkProgress {
  classId: number;
  textbookId: number;
  classTextbookId: number;
  chapters: Chapter[];
  student: {
    studentId: number;
    name: string;
    cells: {
      [chapterId: string]: CellData | null;
    };
  };
}

export interface StudentHomeworkProgressResponse {
  statusCode: number;
  message: string;
  data: StudentHomeworkProgress;
}

/**
 * 현재 로그인한 학생의 특정 클래스와 교재에 대한 숙제 진도를 조회합니다.
 * @param classId 클래스 ID
 * @param textbookId 교재 ID
 * @returns 학생의 숙제 진도
 */
export const getMyHomeworkProgress = async (
  classId: number,
  textbookId: number
): Promise<StudentHomeworkProgressResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/students/me/classes/${classId}/textbooks/${textbookId}/homework`,
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
      message: '내 숙제 진도를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '내 숙제 진도를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};