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
  } | null;
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

export interface StudentClassItem {
  classId: number;
  className: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentClass {
  classId: number;
  className: string;
}

export interface StudentClassesResponse {
  statusCode: number;
  message: string;
  data: StudentClassItem[] | StudentClass[];
}

/**
 * 현재 로그인한 학생이 속한 클래스 목록을 조회합니다.
 * @returns 학생이 속한 클래스 목록
 */
export const getStudentClasses = async (): Promise<StudentClassesResponse> => {
  const response = await fetch(`${API_BASE_URL}/students/me/classes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    // 401 Unauthorized 에러인 경우
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({
        message: '인증이 필요합니다. 다시 로그인해주세요.',
      }));
      throw new Error(
        errorData.message || '인증이 필요합니다. 다시 로그인해주세요.'
      );
    }

    const errorData = await response.json().catch(() => ({
      message: '클래스 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '클래스 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

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

export interface StudentMaterialItem {
  materialId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  hasFile: boolean;
}

export interface StudentMaterialsResponse {
  statusCode: number;
  message: string;
  data: {
    items: StudentMaterialItem[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface GetStudentMaterialsParams {
  page?: number;
  limit?: number;
  sort?: string;
  classId?: number;
}

/**
 * 학생용 학습자료 목록을 조회합니다.
 * @param params 쿼리 파라미터 (page, limit, sort, classId)
 * @returns 학습자료 목록
 */
export const getStudentMaterials = async (
  params?: GetStudentMaterialsParams
): Promise<StudentMaterialsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }
  if (params?.classId) {
    queryParams.append('classId', params.classId.toString());
  }

  const url = `${API_BASE_URL}/students/materials${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학습자료 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface MaterialDownloadUrlResponse {
  statusCode: number;
  message: string;
  data: {
    materialId: number;
    url: string;
    expiresInSeconds: number;
    fileName: string;
  };
}

/**
 * 학습자료 다운로드 URL을 발급합니다.
 * @param materialId 학습자료 ID
 * @returns 다운로드 URL 정보
 */
export const getMaterialDownloadUrl = async (
  materialId: number
): Promise<MaterialDownloadUrlResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/students/materials/${materialId}/download-url`,
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
      message: '다운로드 URL 발급에 실패했습니다.',
    }));
    throw new Error(errorData.message || '다운로드 URL 발급에 실패했습니다.');
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

export interface LinkParentResponse {
  statusCode: number;
  message: string;
  data?: {
    studentId: number;
    parentId: number;
  };
}

/**
 * 학생과 학부모를 연동합니다.
 * @param studentId 학생 ID
 * @param parentId 학부모 ID
 * @returns 연동 결과
 */
export const linkParent = async (
  studentId: number,
  parentId: number
): Promise<LinkParentResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/students/${studentId}/parent/${parentId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학부모 연동에 실패했습니다.',
    }));
    throw new Error(errorData.message || '학부모 연동에 실패했습니다.');
  }

  return response.json();
};

/**
 * 학생과 학부모의 연동을 해제합니다.
 * @param studentId 학생 ID
 * @param parentId 학부모 ID
 * @returns 연동 해제 결과
 */
export const unlinkParent = async (
  studentId: number,
  parentId: number
): Promise<LinkParentResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/students/${studentId}/parent/${parentId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학부모 연동 해제에 실패했습니다.',
    }));
    throw new Error(errorData.message || '학부모 연동 해제에 실패했습니다.');
  }

  return response.json();
};
