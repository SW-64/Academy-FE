import { API_BASE_URL } from '../constants/api';

export interface ClassResponse {
  statusCode: number;
  message: string;
  data: ClassData[];
}

export interface ClassData {
  classId: number;
  className: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 클래스 전체 목록을 조회합니다.
 * @returns 클래스 목록
 */
export const getClasses = async (): Promise<ClassResponse> => {
  const response = await fetch(`${API_BASE_URL}/class`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '클래스 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '클래스 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface ClassStudentsResponse {
  statusCode: number;
  message: string;
  data: {
    classId: number;
    className: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    studentClasses: StudentClassData[];
  };
}

export interface StudentClassData {
  studentClassId: number;
  student: {
    studentId: number;
    grade: number;
    school: string;
    user: {
      userId: number;
      email: string;
      name: string;
    };
  };
}

/**
 * 특정 클래스의 학생 목록을 조회합니다.
 * @param classId 클래스 ID
 * @returns 클래스 학생 목록
 */
export const getClassStudents = async (
  classId: number
): Promise<ClassStudentsResponse> => {
  const response = await fetch(`${API_BASE_URL}/class/${classId}/students`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

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

export interface CreateClassRequest {
  name: string;
  studentIds: number[];
}

export interface CreateClassResponse {
  statusCode: number;
  message: string;
  data?: ClassData;
}

/**
 * 클래스를 생성합니다.
 * @param data 클래스 생성 데이터
 * @returns 생성된 클래스 정보
 */
export const createClass = async (
  data: CreateClassRequest
): Promise<CreateClassResponse> => {
  const response = await fetch(`${API_BASE_URL}/class`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '클래스 생성에 실패했습니다.',
    }));
    throw new Error(errorData.message || '클래스 생성에 실패했습니다.');
  }

  return response.json();
};

export interface UpdateClassRequest {
  name: string;
  studentIds: number[];
}

export interface UpdateClassResponse {
  statusCode: number;
  message: string;
  data?: ClassData;
}

/**
 * 클래스를 수정합니다.
 * @param classId 클래스 ID
 * @param data 클래스 수정 데이터
 * @returns 수정된 클래스 정보
 */
export const updateClass = async (
  classId: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => {
  const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '클래스 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '클래스 수정에 실패했습니다.');
  }

  return response.json();
};

/**
 * 클래스를 삭제합니다.
 * @param classId 클래스 ID
 */
export const deleteClass = async (classId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '클래스 삭제에 실패했습니다.',
    }));
    throw new Error(errorData.message || '클래스 삭제에 실패했습니다.');
  }
};

export interface ClassTextbookItem {
  classTextbookId: number;
  classId: number;
  textbook: {
    textbookId: number;
    name: string;
    grade: number;
  };
}

export interface ClassTextbooksResponse {
  statusCode: number;
  message: string;
  data: ClassTextbookItem[];
}

/**
 * 특정 클래스에 배정된 교재 목록을 조회합니다.
 * @param classId 클래스 ID
 * @returns 클래스에 배정된 교재 목록
 */
export const getClassTextbooks = async (
  classId: number
): Promise<ClassTextbooksResponse> => {
  const response = await fetch(`${API_BASE_URL}/class/${classId}/textbooks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '클래스 교재 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '클래스 교재 목록을 가져오는데 실패했습니다.'
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

export interface StudentProgress {
  studentId: number;
  name: string;
  cells: {
    [chapterId: string]: CellData | null;
  };
}

export interface ProgressGridResponse {
  statusCode: number;
  message: string;
  data: {
    classId: number;
    textbookId: number;
    classTextbookId: number;
    chapters: Chapter[];
    students: StudentProgress[];
  };
}

/**
 * 클래스의 교재에 대한 숙제 진도 그리드를 조회합니다.
 * @param classId 클래스 ID
 * @param textbookId 교재 ID
 * @returns 진도 그리드 데이터
 */
export const getProgressGrid = async (
  classId: number,
  textbookId: number
): Promise<ProgressGridResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/textbooks/${textbookId}/progress-grid`,
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
      message: '진도 그리드를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '진도 그리드를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface ProgressCellItem {
  studentId: number;
  chapterId: number;
  percent: number;
}

export interface UpdateProgressCellsRequest {
  items: ProgressCellItem[];
}

export interface UpdateProgressCellsResponse {
  statusCode: number;
  message: string;
}

/**
 * 진도 셀들을 일괄 수정합니다.
 * @param classId 클래스 ID
 * @param textbookId 교재 ID
 * @param data 수정할 진도 셀 데이터
 * @returns 수정 응답
 */
export const updateProgressCells = async (
  classId: number,
  textbookId: number,
  data: UpdateProgressCellsRequest
): Promise<UpdateProgressCellsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/textbooks/${textbookId}/progress-cells`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키를 포함하여 요청
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '진도 셀 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '진도 셀 수정에 실패했습니다.');
  }

  return response.json();
};

export interface ExamItem {
  examId: number;
  examTitle: string;
  examDate: string;
  studentAverage: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamsResponse {
  statusCode: number;
  message: string;
  data: {
    items: ExamItem[];
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
 * 특정 클래스의 시험 목록을 조회합니다.
 * @param classId 클래스 ID
 * @returns 시험 목록
 */
export const getClassExams = async (
  classId: number
): Promise<ExamsResponse> => {
  const response = await fetch(`${API_BASE_URL}/classes/${classId}/exams`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '시험 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '시험 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface ExamDetail {
  examDetailId: number;
  question: number;
  points: number;
}

export interface ExamDetailResponse {
  statusCode: number;
  message: string;
  data: {
    examId: number;
    examTitle: string;
    examDate: string;
    studentAverage: number | null;
    createdAt: string;
    updatedAt: string;
    examDetails: ExamDetail[];
  };
}

/**
 * 특정 클래스의 시험 상세 정보를 조회합니다.
 * @param classId 클래스 ID
 * @param examId 시험 ID
 * @returns 시험 상세 정보
 */
export const getExamDetail = async (
  classId: number,
  examId: number
): Promise<ExamDetailResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}`,
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
      message: '시험 상세 정보를 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '시험 상세 정보를 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface CreateExamRequest {
  examTitle: string;
  examDate: string;
  question: number[];
  points: number[];
}

export interface CreateExamResponse {
  statusCode: number;
  message: string;
  data?: {
    examId: number;
    examTitle: string;
    examDate: string;
    studentAverage: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * 시험 일정을 생성합니다.
 * @param classId 클래스 ID
 * @param data 시험 생성 데이터
 * @returns 생성된 시험 정보
 */
export const createExam = async (
  classId: number,
  data: CreateExamRequest
): Promise<CreateExamResponse> => {
  const response = await fetch(`${API_BASE_URL}/classes/${classId}/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '시험 생성에 실패했습니다.',
    }));
    throw new Error(errorData.message || '시험 생성에 실패했습니다.');
  }

  return response.json();
};

export interface UpdateExamRequest {
  examTitle: string;
  examDate: string;
  question: number[];
  points: number[];
}

export interface UpdateExamResponse {
  statusCode: number;
  message: string;
}

/**
 * 시험 일정을 수정합니다.
 * @param classId 클래스 ID
 * @param examId 시험 ID
 * @param data 시험 수정 데이터
 * @returns 수정 응답
 */
export const updateExam = async (
  classId: number,
  examId: number,
  data: UpdateExamRequest
): Promise<UpdateExamResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키를 포함하여 요청
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '시험 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '시험 수정에 실패했습니다.');
  }

  return response.json();
};

export interface WrongAnswerQuestion {
  examDetailId: number;
  question: number;
  points: number;
}

export interface WrongAnswerStudent {
  studentId: number;
  name: string;
  school: string;
  isTaken: boolean;
  score: number | null;
  wrongExamDetailIds: number[];
  wrongQuestions: number[];
}

export interface WrongAnswersResponse {
  statusCode: number;
  message: string;
  data: {
    exam: {
      examId: number;
      examTitle: string;
      examDate: string;
    };
    questions: WrongAnswerQuestion[];
    students: WrongAnswerStudent[];
  };
}

/**
 * 시험 오답 문제를 조회합니다.
 * @param classId 클래스 ID
 * @param examId 시험 ID
 * @returns 시험 오답 문제 목록
 */
export const getWrongAnswers = async (
  classId: number,
  examId: number
): Promise<WrongAnswersResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}/wrong-answers`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '시험 오답 문제 조회에 실패했습니다.',
    }));
    throw new Error(errorData.message || '시험 오답 문제 조회에 실패했습니다.');
  }

  return response.json();
};

export interface PatchWrongAnswersItem {
  studentId: number;
  wrongExamDetailIds: number[];
}

export interface PatchWrongAnswersRequest {
  items: PatchWrongAnswersItem[];
}

/**
 * 시험 오답 문제를 수정합니다.
 */
export const patchWrongAnswers = async (
  classId: number,
  examId: number,
  data: PatchWrongAnswersRequest
): Promise<{ statusCode: number; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}/wrong-answers`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: '시험 오답 수정에 실패했습니다.' }));
    throw new Error(err.message || '시험 오답 수정에 실패했습니다.');
  }
  return response.json();
};

export interface ErrorRateDetail {
  question: number;
  points: number;
  errorRate: string;
}

export interface ErrorRatesResponse {
  statusCode: number;
  message: string;
  data: {
    exam: { examId: number };
    details: ErrorRateDetail[];
  };
}

/**
 * 시험 오답률을 조회합니다.
 */
export const getErrorRates = async (
  classId: number,
  examId: number
): Promise<ErrorRatesResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}/error-rates`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: '오답률 조회에 실패했습니다.' }));
    throw new Error(err.message || '오답률 조회에 실패했습니다.');
  }
  return response.json();
};

/**
 * 시험 오답률을 계산(적용)합니다.
 */
export const createErrorRates = async (
  classId: number,
  examId: number
): Promise<{ statusCode: number; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}/error-rates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: '오답률 계산에 실패했습니다.' }));
    throw new Error(err.message || '오답률 계산에 실패했습니다.');
  }
  return response.json();
};

export interface DeleteExamResponse {
  statusCode: number;
  message: string;
}

/**
 * 시험 일정을 삭제합니다.
 * @param classId 클래스 ID
 * @param examId 시험 ID
 * @returns 삭제 응답
 */
export const deleteExam = async (
  classId: number,
  examId: number
): Promise<DeleteExamResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/exams/${examId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키를 포함하여 요청
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '시험 삭제에 실패했습니다.',
    }));
    throw new Error(errorData.message || '시험 삭제에 실패했습니다.');
  }

  return response.json();
};
