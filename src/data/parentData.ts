// 학부모용 데이터 구조

import { type ClassType } from './homeworkData';
import { examRecords, type ExamRecord } from './gradesData';

// 학생-클래스 매핑 데이터
export type StudentClassMapping = {
  studentId: number;
  classId: number;
  className: string;
};

// 학생별 클래스 목록
export const studentClassMappings: StudentClassMapping[] = [
  // 학생 1번은 클래스 1, 3에 속함
  { studentId: 1, classId: 1, className: '예비고2 월금 정규반' },
  { studentId: 1, classId: 3, className: '미적분1 기본 특강반' },
  // 학생 2번은 클래스 2, 4에 속함
  { studentId: 2, classId: 2, className: '예비고2 화목 정규반' },
  { studentId: 2, classId: 4, className: '미적분1+2 통합 특강반' },
];

// 학생별 클래스 목록 가져오기
export function getStudentClasses(studentId: number): ClassType[] {
  const mappings = studentClassMappings.filter(m => m.studentId === studentId);
  return mappings.map(m => ({
    id: m.classId,
    name: m.className,
  }));
}

// 클래스별 성적 필터링
export function getClassExamRecords(
  studentId: number,
  classId: number | null
): ExamRecord[] {
  if (!classId) {
    // 클래스 선택 안 함 - 모든 성적
    return examRecords.filter(r => r.studentId === studentId);
  }

  // 클래스별로 필터링
  return examRecords.filter(
    r => r.studentId === studentId && r.classId === classId
  );
}

// 진도 데이터 타입
export type ProgressData = {
  studentId: number;
  classId: number;
  className: string;
  subject: string; // 과목명
  currentChapter: string; // 현재 진도 챕터
  completedChapters: number; // 완료한 챕터 수
  totalChapters: number; // 전체 챕터 수
  progressPercentage: number; // 진행률
  lastUpdated: string; // 마지막 업데이트 날짜
};

// 더미 진도 데이터
export const dummyProgressData: ProgressData[] = [
  {
    studentId: 1,
    classId: 1,
    className: '예비고2 월금 정규반',
    subject: '수학',
    currentChapter: '3단원 - 함수',
    completedChapters: 2,
    totalChapters: 5,
    progressPercentage: 40,
    lastUpdated: '2026-02-15',
  },
  {
    studentId: 1,
    classId: 3,
    className: '미적분1 기본 특강반',
    subject: '미적분',
    currentChapter: '2단원 - 극한',
    completedChapters: 1,
    totalChapters: 4,
    progressPercentage: 25,
    lastUpdated: '2026-02-14',
  },
  {
    studentId: 2,
    classId: 2,
    className: '예비고2 화목 정규반',
    subject: '수학',
    currentChapter: '4단원 - 방정식',
    completedChapters: 3,
    totalChapters: 6,
    progressPercentage: 50,
    lastUpdated: '2026-02-16',
  },
  {
    studentId: 2,
    classId: 4,
    className: '미적분1+2 통합 특강반',
    subject: '미적분',
    currentChapter: '3단원 - 미분',
    completedChapters: 2,
    totalChapters: 5,
    progressPercentage: 40,
    lastUpdated: '2026-02-15',
  },
];

// 학생별 진도 데이터 가져오기
export function getStudentProgress(
  studentId: number,
  classId: number | null
): ProgressData[] {
  if (!classId) {
    return dummyProgressData.filter(p => p.studentId === studentId);
  }
  return dummyProgressData.filter(
    p => p.studentId === studentId && p.classId === classId
  );
}

