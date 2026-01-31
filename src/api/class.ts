import { request } from './client';

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
  return request<ClassResponse>('/class', {
    errorMessage: '클래스 목록을 가져오는데 실패했습니다.',
  });
};

export interface ClassStudentItem {
  studentClassId: number;
  studentId: number;
  grade: number;
  school: string;
  userId: number;
  name: string;
  loginId: string;
}

export interface ClassStudentsResponse {
  statusCode: number;
  message: string;
  data: {
    classId: number;
    className: string;
    students: ClassStudentItem[];
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
  return request<ClassStudentsResponse>(`/class/${classId}/students`, {
    errorMessage: '학생 목록을 가져오는데 실패했습니다.',
  });
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
  return request<CreateClassResponse>('/class', {
    method: 'POST',
    body: data,
    errorMessage: '클래스 생성에 실패했습니다.',
  });
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
  return request<UpdateClassResponse>(`/class/${classId}`, {
    method: 'PATCH',
    body: data,
    errorMessage: '클래스 수정에 실패했습니다.',
  });
};

/**
 * 클래스를 삭제합니다.
 * @param classId 클래스 ID
 */
export const deleteClass = async (classId: number): Promise<void> => {
  await request<void>(`/class/${classId}`, {
    method: 'DELETE',
    errorMessage: '클래스 삭제에 실패했습니다.',
  });
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
  return request<ClassTextbooksResponse>(`/class/${classId}/textbooks`, {
    errorMessage: '클래스 교재 목록을 가져오는데 실패했습니다.',
  });
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
  return request<ProgressGridResponse>(
    `/classes/${classId}/textbooks/${textbookId}/progress-grid`,
    { errorMessage: '진도 그리드를 가져오는데 실패했습니다.' }
  );
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
  return request<UpdateProgressCellsResponse>(
    `/classes/${classId}/textbooks/${textbookId}/progress-cells`,
    {
      method: 'PATCH',
      body: data,
      errorMessage: '진도 셀 수정에 실패했습니다.',
    }
  );
};

/**
 * 진도 셀들을 삭제합니다.
 * @param classId 클래스 ID
 * @param textbookId 교재 ID
 * @returns 삭제 응답
 */
export const deleteProgressCells = async (
  classId: number,
  textbookId: number
): Promise<UpdateProgressCellsResponse> => {
  return request<UpdateProgressCellsResponse>(
    `/classes/${classId}/textbooks/${textbookId}/progress-cells`,
    {
      method: 'DELETE',
      errorMessage: '진도 셀 삭제에 실패했습니다.',
    }
  );
};

export interface ExamItem {
  examId: number;
  examTitle: string;
  examDate: string;
  studentAverage: number | string | null;
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
  return request<ExamsResponse>(`/classes/${classId}/exams`, {
    errorMessage: '시험 목록을 가져오는데 실패했습니다.',
  });
};

/** 학생 본인 시험점수 전체조회 - 정렬: score_desc(점수순), name_asc(이름순) */
export type MyExamGradesSort = 'score_desc' | 'name_asc';

export interface MyExamGradeEntry {
  gradeId: number;
  studentId: number;
  score: number;
  level: string | null;
  comment: string | null;
  isTaken: boolean;
}

export interface MyExamGradeItem {
  examId: number;
  examTitle: string;
  examDate: string;
  studentAverage: number | string | null;
  grades: MyExamGradeEntry[];
}

export interface MyExamGradesResponse {
  statusCode: number;
  message: string;
  data: MyExamGradeItem[];
}

export const getMyExamGrades = async (
  classId: number,
  sort: MyExamGradesSort = 'score_desc'
): Promise<MyExamGradesResponse> => {
  const params = new URLSearchParams({ sort });
  return request<MyExamGradesResponse>(
    `/classes/${classId}/exams/grades/me?${params}`,
    { errorMessage: '시험 성적 목록을 가져오는데 실패했습니다.' }
  );
};

/** 학생 본인 시험 등수 조회 (GET /classes/:classId/exams/:examId/rank/me) - 본인(isMe: true)만 이름/studentId 노출 */
export interface MyExamRankItem {
  ranking: number;
  score: number;
  isTaken: boolean;
  isMe: boolean;
  studentId: number | null;
  name: string | null;
}

export interface MyExamRankResponse {
  statusCode: number;
  message: string;
  data: MyExamRankItem[];
}

export const getMyExamRank = async (
  classId: number,
  examId: number
): Promise<MyExamRankResponse> => {
  return request<MyExamRankResponse>(
    `/classes/${classId}/exams/${examId}/rank/me`,
    { errorMessage: '등수 조회에 실패했습니다.' }
  );
};

/**
 * 학부모: 자녀의 시험 성적 목록 조회 (GET /classes/:classId/exams/grades/my-student/:studentId)
 * @param classId 클래스 ID
 * @param studentId 자녀(학생) ID
 */
export const getMyStudentExamGrades = async (
  classId: number,
  studentId: number
): Promise<MyExamGradesResponse> => {
  return request<MyExamGradesResponse>(
    `/classes/${classId}/exams/grades/my-student/${studentId}`,
    { errorMessage: '자녀의 시험 성적을 가져오는데 실패했습니다.' }
  );
};

/**
 * 학부모: 자녀의 시험 등수 조회 (GET /classes/:classId/exams/:examId/rank/my-student/:studentId)
 */
export const getMyStudentExamRank = async (
  classId: number,
  examId: number,
  studentId: number
): Promise<MyExamRankResponse> => {
  return request<MyExamRankResponse>(
    `/classes/${classId}/exams/${examId}/rank/my-student/${studentId}`,
    { errorMessage: '자녀의 등수 조회에 실패했습니다.' }
  );
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
    studentAverage: number | string | null;
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
  return request<ExamDetailResponse>(
    `/classes/${classId}/exams/${examId}`,
    { errorMessage: '시험 상세 정보를 가져오는데 실패했습니다.' }
  );
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
  return request<CreateExamResponse>(`/classes/${classId}/exams`, {
    method: 'POST',
    body: data,
    errorMessage: '시험 생성에 실패했습니다.',
  });
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
  return request<UpdateExamResponse>(
    `/classes/${classId}/exams/${examId}`,
    {
      method: 'PATCH',
      body: data,
      errorMessage: '시험 수정에 실패했습니다.',
    }
  );
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
  return request<WrongAnswersResponse>(
    `/classes/${classId}/exams/${examId}/wrong-answers`,
    { errorMessage: '시험 오답 문제 조회에 실패했습니다.' }
  );
};

export interface PatchWrongAnswersItem {
  studentId: number;
  wrongExamDetailIds: number[];
  /** 응시 여부. 비워두면 true(응시), 미응시 체크 시 false */
  isTaken?: boolean;
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
  return request(`/classes/${classId}/exams/${examId}/wrong-answers`, {
    method: 'PATCH',
    body: data,
    errorMessage: '시험 오답 수정에 실패했습니다.',
  });
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
  return request<ErrorRatesResponse>(
    `/classes/${classId}/exams/${examId}/error-rates`,
    { errorMessage: '오답률 조회에 실패했습니다.' }
  );
};

/**
 * 시험 오답률을 계산(적용)합니다.
 */
export const createErrorRates = async (
  classId: number,
  examId: number
): Promise<{ statusCode: number; message: string }> => {
  return request(`/classes/${classId}/exams/${examId}/error-rates`, {
    method: 'POST',
    errorMessage: '오답률 계산에 실패했습니다.',
  });
};

export interface RankingItem {
  studentId: number;
  name: string;
  isTaken: number | null;
  score: number | null;
  ranking: number | null;
}

export interface RankingsResponse {
  statusCode: number;
  message: string;
  data: RankingItem[];
}

/**
 * 시험 등수를 조회합니다.
 */
export const getRankings = async (
  classId: number,
  examId: number
): Promise<RankingsResponse> => {
  return request<RankingsResponse>(
    `/classes/${classId}/exams/${examId}/rankings`,
    { errorMessage: '시험 등수 조회에 실패했습니다.' }
  );
};

/**
 * 시험 등수를 계산(적용)합니다.
 */
export const createRankings = async (
  classId: number,
  examId: number
): Promise<{ statusCode: number; message: string }> => {
  return request(`/classes/${classId}/exams/${examId}/rankings`, {
    method: 'POST',
    errorMessage: '시험 등수 계산에 실패했습니다.',
  });
};

/**
 * 시험 평균 점수를 계산(적용)합니다.
 */
export const createAverage = async (
  classId: number,
  examId: number
): Promise<{ statusCode: number; message: string }> => {
  return request(`/classes/${classId}/exams/${examId}/average`, {
    method: 'POST',
    errorMessage: '평균 점수 계산에 실패했습니다.',
  });
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
  return request<DeleteExamResponse>(
    `/classes/${classId}/exams/${examId}`,
    {
      method: 'DELETE',
      errorMessage: '시험 삭제에 실패했습니다.',
    }
  );
};
