// 숙제 관련 데이터 타입 및 더미 데이터

export type ClassType = {
  id: number;
  name: string;
};

export type HomeworkProgress = {
  majorUnit: number; // 대단원 (1-4)
  minorUnit: number; // 소단원 (1-3)
  completed: boolean; // 완료 여부
};

export type MajorUnitDetail = {
  majorUnitIndex: number;
  minorUnitCount: number;
};

export type Homework = {
  id: number;
  textbookId: number;
  textbookName: string;
  classId: number;
  className: string;
  majorUnitCount: number; // 대단원 수
  minorUnitCount: number; // 소단원 수 (평균값, 하위 호환성 유지)
  progress: HomeworkProgress[]; // 진행도
  majorUnitsDetail?: MajorUnitDetail[]; // 대단원별 소단원 개수 (선택적)
};

export type StudentHomework = {
  studentId: number;
  homeworkId: number;
  progress: HomeworkProgress[];
  lastUpdated: string;
};

// 더미 클래스 데이터
export const dummyClasses: ClassType[] = [
  { id: 1, name: '예비고2 월금 정규반' },
  { id: 2, name: '예비고2 화목 정규반' },
  { id: 3, name: '미적분1 기본 특강반' },
  { id: 4, name: '미적분1+2 통합 특강반' },
];

// 더미 숙제 데이터 (대단원 4, 소단원 3 구조)
export const dummyHomeworks: Homework[] = [
  {
    id: 1,
    textbookId: 1,
    textbookName: '수학의 정석',
    classId: 1,
    className: '예비고2 월금 정규반',
    majorUnitCount: 4,
    minorUnitCount: 3,
    progress: [],
  },
  {
    id: 2,
    textbookId: 2,
    textbookName: '미적분 기본서',
    classId: 3,
    className: '미적분1 기본 특강반',
    majorUnitCount: 4,
    minorUnitCount: 3,
    progress: [],
  },
  {
    id: 3,
    textbookId: 3,
    textbookName: '수학 I 완전정복',
    classId: 2,
    className: '예비고2 화목 정규반',
    majorUnitCount: 4,
    minorUnitCount: 3,
    progress: [],
  },
  {
    id: 4,
    textbookId: 4,
    textbookName: '수학 II 심화 교재',
    classId: 1,
    className: '예비고2 월금 정규반',
    majorUnitCount: 4,
    minorUnitCount: 4,
    progress: [],
  },
  {
    id: 5,
    textbookId: 5,
    textbookName: '수학 III 통합 교재',
    classId: 2,
    className: '예비고2 화목 정규반',
    majorUnitCount: 3,
    minorUnitCount: 3, // 평균값 (하위 호환성)
    progress: [],
    majorUnitsDetail: [
      { majorUnitIndex: 1, minorUnitCount: 3 },
      { majorUnitIndex: 2, minorUnitCount: 3 },
      { majorUnitIndex: 3, minorUnitCount: 4 },
    ],
  },
];

// 학생별 숙제 진행도 데이터
// 예: 학생 1이 숙제 1에서 대단원 2, 소단원 1까지 완료
export const studentHomeworkProgress: StudentHomework[] = [
  {
    studentId: 1,
    homeworkId: 1,
    progress: [
      // 대단원 1 완료
      { majorUnit: 1, minorUnit: 1, completed: true },
      { majorUnit: 1, minorUnit: 2, completed: true },
      { majorUnit: 1, minorUnit: 3, completed: true },
      // 대단원 2 부분 완료 (소단원 1까지만)
      { majorUnit: 2, minorUnit: 1, completed: true },
      { majorUnit: 2, minorUnit: 2, completed: false },
      { majorUnit: 2, minorUnit: 3, completed: false },
      // 대단원 3, 4 미완료
      { majorUnit: 3, minorUnit: 1, completed: false },
      { majorUnit: 3, minorUnit: 2, completed: false },
      { majorUnit: 3, minorUnit: 3, completed: false },
      { majorUnit: 4, minorUnit: 1, completed: false },
      { majorUnit: 4, minorUnit: 2, completed: false },
      { majorUnit: 4, minorUnit: 3, completed: false },
    ],
    lastUpdated: '2025-01-15',
  },
  {
    studentId: 1,
    homeworkId: 2,
    progress: [
      // 대단원 1, 2 완료
      { majorUnit: 1, minorUnit: 1, completed: true },
      { majorUnit: 1, minorUnit: 2, completed: true },
      { majorUnit: 1, minorUnit: 3, completed: true },
      { majorUnit: 2, minorUnit: 1, completed: true },
      { majorUnit: 2, minorUnit: 2, completed: true },
      { majorUnit: 2, minorUnit: 3, completed: true },
      // 대단원 3, 4 미완료
      { majorUnit: 3, minorUnit: 1, completed: false },
      { majorUnit: 3, minorUnit: 2, completed: false },
      { majorUnit: 3, minorUnit: 3, completed: false },
      { majorUnit: 4, minorUnit: 1, completed: false },
      { majorUnit: 4, minorUnit: 2, completed: false },
      { majorUnit: 4, minorUnit: 3, completed: false },
    ],
    lastUpdated: '2025-01-20',
  },
  {
    studentId: 1,
    homeworkId: 4,
    progress: [
      // 대단원 1 완료 (소단원 4개)
      { majorUnit: 1, minorUnit: 1, completed: true },
      { majorUnit: 1, minorUnit: 2, completed: true },
      { majorUnit: 1, minorUnit: 3, completed: true },
      { majorUnit: 1, minorUnit: 4, completed: true },
      // 대단원 2 부분 완료 (소단원 2까지만)
      { majorUnit: 2, minorUnit: 1, completed: true },
      { majorUnit: 2, minorUnit: 2, completed: true },
      { majorUnit: 2, minorUnit: 3, completed: false },
      { majorUnit: 2, minorUnit: 4, completed: false },
      // 대단원 3, 4 미완료
      { majorUnit: 3, minorUnit: 1, completed: false },
      { majorUnit: 3, minorUnit: 2, completed: false },
      { majorUnit: 3, minorUnit: 3, completed: false },
      { majorUnit: 3, minorUnit: 4, completed: false },
      { majorUnit: 4, minorUnit: 1, completed: false },
      { majorUnit: 4, minorUnit: 2, completed: false },
      { majorUnit: 4, minorUnit: 3, completed: false },
      { majorUnit: 4, minorUnit: 4, completed: false },
    ],
    lastUpdated: '2025-01-25',
  },
  {
    studentId: 1,
    homeworkId: 5,
    progress: [
      // 대단원 1 완료 (소단원 3개)
      { majorUnit: 1, minorUnit: 1, completed: true },
      { majorUnit: 1, minorUnit: 2, completed: true },
      { majorUnit: 1, minorUnit: 3, completed: true },
      // 대단원 2 완료 (소단원 3개)
      { majorUnit: 2, minorUnit: 1, completed: true },
      { majorUnit: 2, minorUnit: 2, completed: true },
      { majorUnit: 2, minorUnit: 3, completed: true },
      // 대단원 3 부분 완료 (소단원 4개 중 2개만)
      { majorUnit: 3, minorUnit: 1, completed: true },
      { majorUnit: 3, minorUnit: 2, completed: true },
      { majorUnit: 3, minorUnit: 3, completed: false },
      { majorUnit: 3, minorUnit: 4, completed: false },
    ],
    lastUpdated: '2025-01-30',
  },
];

// 진행도 계산 함수
export function calculateProgress(
  progress: HomeworkProgress[],
  majorUnitCount: number,
  minorUnitCount: number,
  majorUnitsDetail?: MajorUnitDetail[]
): {
  completed: number;
  total: number;
  percentage: number;
  currentMajorUnit: number;
  currentMinorUnit: number;
} {
  // 대단원별 소단원 개수가 다른 경우 총 개수 계산
  let total = 0;
  if (majorUnitsDetail && majorUnitsDetail.length > 0) {
    total = majorUnitsDetail.reduce((sum, detail) => sum + detail.minorUnitCount, 0);
  } else {
    total = majorUnitCount * minorUnitCount;
  }
  
  const completed = progress.filter(p => p.completed).length;

  // 현재 진행 중인 위치 찾기 (마지막으로 완료된 항목의 다음 위치)
  let currentMajorUnit = 1;
  let currentMinorUnit = 1;
  let lastCompletedMajor = 0;
  let lastCompletedMinor = 0;

  // 완료된 마지막 위치 찾기
  if (majorUnitsDetail && majorUnitsDetail.length > 0) {
    // 대단원별 소단원 개수가 다른 경우
    for (const detail of majorUnitsDetail) {
      const major = detail.majorUnitIndex;
      for (let minor = 1; minor <= detail.minorUnitCount; minor++) {
        const item = progress.find(
          p => p.majorUnit === major && p.minorUnit === minor
        );
        if (item?.completed) {
          lastCompletedMajor = major;
          lastCompletedMinor = minor;
        }
      }
    }
  } else {
    // 모든 대단원이 같은 소단원 개수인 경우
    for (let major = 1; major <= majorUnitCount; major++) {
      for (let minor = 1; minor <= minorUnitCount; minor++) {
        const item = progress.find(
          p => p.majorUnit === major && p.minorUnit === minor
        );
        if (item?.completed) {
          lastCompletedMajor = major;
          lastCompletedMinor = minor;
        }
      }
    }
  }

  // 다음 진행할 위치 계산
  const getMinorUnitCount = (major: number): number => {
    if (majorUnitsDetail && majorUnitsDetail.length > 0) {
      const detail = majorUnitsDetail.find(d => d.majorUnitIndex === major);
      return detail?.minorUnitCount || minorUnitCount;
    }
    return minorUnitCount;
  };

  const currentMajorMinorCount = getMinorUnitCount(lastCompletedMajor);
  
  if (lastCompletedMinor < currentMajorMinorCount) {
    // 같은 대단원 내에서 다음 소단원
    currentMajorUnit = lastCompletedMajor;
    currentMinorUnit = lastCompletedMinor + 1;
  } else if (lastCompletedMajor < majorUnitCount) {
    // 다음 대단원의 첫 소단원
    currentMajorUnit = lastCompletedMajor + 1;
    currentMinorUnit = 1;
  } else if (completed === total) {
    // 모두 완료
    currentMajorUnit = majorUnitCount;
    const lastMajorDetail = majorUnitsDetail?.find(d => d.majorUnitIndex === majorUnitCount);
    currentMinorUnit = lastMajorDetail?.minorUnitCount || minorUnitCount;
  } else {
    // 아무것도 완료되지 않았거나, 모두 완료된 경우
    if (completed === 0) {
      currentMajorUnit = 1;
      currentMinorUnit = 1;
    } else {
      currentMajorUnit = lastCompletedMajor;
      currentMinorUnit = lastCompletedMinor;
    }
  }

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    currentMajorUnit,
    currentMinorUnit,
  };
}

