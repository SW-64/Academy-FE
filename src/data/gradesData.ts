// 학생 30명의 수학 시험 더미 데이터
// 평일(월~금)마다 시험을 보며, 한 달간의 점수 데이터

export type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Student {
  id: number;
  name: string;
  targetScore: number; // 목표 점수 (80~100)
}

export interface ExamRecord {
  studentId: number;
  studentName: string;
  date: string; // YYYY-MM-DD 형식
  dateFormatted: string; // MM/DD 형식
  score: number;
  average: number; // 누적 평균
  grade: GradeLevel;
  targetScore: number;
  differenceFromTarget: number; // 목표 점수 대비 차이
  wrongAnswers?: number[]; // 틀린 문항 번호 목록 (선택적)
  classId?: number; // 클래스 ID (선택적)
}

// 학생 이름 목록
const studentNames = [
  '김민수',
  '이지은',
  '박준호',
  '최수진',
  '정현우',
  '강민지',
  '윤서연',
  '장동현',
  '임하늘',
  '한소영',
  '오태영',
  '신유진',
  '조성민',
  '배지훈',
  '류서아',
  '문현석',
  '송예린',
  '권도현',
  '황민서',
  '안지원',
  '노승현',
  '고은지',
  '남동욱',
  '도예나',
  '라준혁',
  '마서윤',
  '백민규',
  '사지혜',
  '아현수',
  '차수빈',
];

// 등급 계산 함수
function calculateGrade(score: number): GradeLevel {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// 2026년 2월의 평일 날짜 생성 (월~금만)
function generateWeekdaysInFebruary2026(): string[] {
  const dates: string[] = [];
  const year = 2026;
  const month = 1; // 0-based, 1 = February

  // 2월 1일부터 시작
  for (let day = 1; day <= 28; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = 일요일, 1 = 월요일, ..., 5 = 금요일
    // 평일만 추가 (월요일=1 ~ 금요일=5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      dates.push(dateStr);
    }
  }

  return dates;
}

// 학생 목표 점수 생성 (80~100 사이 랜덤)
function generateTargetScore(): number {
  return Math.floor(Math.random() * 21) + 80; // 80~100
}

// 점수 생성 함수 (학생별로 다른 패턴)
function generateScore(
  studentId: number,
  dayIndex: number,
  targetScore: number
): number {
  // 학생별 기본 실력 (60~95 사이)
  const baseSkill = 60 + (studentId % 36); // 60~95
  // 목표 점수에 가까워지도록 조정
  const targetInfluence = (targetScore - baseSkill) * 0.3;
  const adjustedBase = baseSkill + targetInfluence;

  // 시간에 따른 개선 (약간의 상승 추세)
  const improvement = Math.min(dayIndex * 0.5, 10);
  // 랜덤 변동 (-10 ~ +10)
  const randomVariation = (Math.random() - 0.5) * 20;

  let score = adjustedBase + improvement + randomVariation;
  // 0~100 범위로 제한
  score = Math.max(0, Math.min(100, Math.round(score)));

  return score;
}

// 오답번호 생성 함수 (25문항 기준, 점수에 따라 틀린 문항 수 계산)
function generateWrongAnswers(score: number, totalQuestions: number = 25): number[] {
  // 점수에 따라 틀린 문항 수 계산 (100점 만점 기준)
  const wrongCount = Math.round((100 - score) / 4); // 4점당 1문항 틀림
  const actualWrongCount = Math.max(0, Math.min(wrongCount, totalQuestions));
  
  if (actualWrongCount === 0) {
    return [];
  }

  // 랜덤하게 틀린 문항 번호 선택
  const allQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, actualWrongCount).sort((a, b) => a - b);
}

// 학생 데이터 생성
export const students: Student[] = studentNames.map((name, index) => ({
  id: index + 1,
  name,
  targetScore: generateTargetScore(),
}));

// 시험 날짜 목록
const examDates = generateWeekdaysInFebruary2026();

// 전체 시험 기록 생성
export const examRecords: ExamRecord[] = [];

students.forEach(student => {
  const studentScores: number[] = [];
  let cumulativeSum = 0;

  examDates.forEach((date, dayIndex) => {
    const score = generateScore(student.id, dayIndex, student.targetScore);
    studentScores.push(score);
    cumulativeSum += score;
    const average =
      Math.round((cumulativeSum / studentScores.length) * 10) / 10;

    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;

    // 학생별 클래스 할당 (학생 1번: 클래스 1,3 / 학생 2번: 클래스 2,4 / 나머지: 랜덤)
    let classId: number | undefined;
    if (student.id === 1) {
      // 학생 1번은 클래스 1 또는 3
      classId = dayIndex % 2 === 0 ? 1 : 3;
    } else if (student.id === 2) {
      // 학생 2번은 클래스 2 또는 4
      classId = dayIndex % 2 === 0 ? 2 : 4;
    } else {
      // 나머지 학생은 랜덤하게 1-4 중 하나
      classId = (dayIndex % 4) + 1;
    }

    examRecords.push({
      studentId: student.id,
      studentName: student.name,
      date,
      dateFormatted,
      score,
      average,
      grade: calculateGrade(score),
      targetScore: student.targetScore,
      differenceFromTarget: score - student.targetScore,
      wrongAnswers: generateWrongAnswers(score),
      classId,
    });
  });
});

// 학생 1번에 대한 추가 데이터 (1월, 3월, 4월)
const student1 = students.find(s => s.id === 1);
if (student1) {
  // 학생 1번의 기존 점수 기록 (누적 평균 계산용)
  const student1ExistingRecords = examRecords.filter(r => r.studentId === 1);
  let cumulativeSum = student1ExistingRecords.reduce(
    (sum, r) => sum + r.score,
    0
  );
  let recordCount = student1ExistingRecords.length;

  // 1월 데이터 4개 (2026-01-06, 2026-01-07, 2026-01-08, 2026-01-09)
  const januaryDates = ['2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09'];
  januaryDates.forEach((date, index) => {
    const score = generateScore(
      student1.id,
      recordCount + index,
      student1.targetScore
    );
    cumulativeSum += score;
    recordCount++;
    const average = Math.round((cumulativeSum / recordCount) * 10) / 10;
    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;
    // 학생 1번은 클래스 1 또는 3
    const classId = index % 2 === 0 ? 1 : 3;

    examRecords.push({
      studentId: 1,
      studentName: student1.name,
      date,
      dateFormatted,
      score,
      average,
      grade: calculateGrade(score),
      targetScore: student1.targetScore,
      differenceFromTarget: score - student1.targetScore,
      wrongAnswers: generateWrongAnswers(score),
      classId,
    });
  });

  // 3월 데이터 1개 (2026-03-03)
  const marchDate = '2026-03-03';
  const marchScore = generateScore(
    student1.id,
    recordCount,
    student1.targetScore
  );
  cumulativeSum += marchScore;
  recordCount++;
  const marchAverage = Math.round((cumulativeSum / recordCount) * 10) / 10;
  const marchDateObj = new Date(marchDate);
  const marchDateFormatted = `${String(marchDateObj.getMonth() + 1).padStart(
    2,
    '0'
  )}/${String(marchDateObj.getDate()).padStart(2, '0')}`;

  examRecords.push({
    studentId: 1,
    studentName: student1.name,
    date: marchDate,
    dateFormatted: marchDateFormatted,
    score: marchScore,
    average: marchAverage,
    grade: calculateGrade(marchScore),
    targetScore: student1.targetScore,
    differenceFromTarget: marchScore - student1.targetScore,
    wrongAnswers: generateWrongAnswers(marchScore),
    classId: 1, // 학생 1번의 클래스 1
  });

  // 4월 데이터 3개 (2026-04-01, 2026-04-02, 2026-04-03)
  const aprilDates = ['2026-04-01', '2026-04-02', '2026-04-03'];
  aprilDates.forEach((date, index) => {
    const score = generateScore(
      student1.id,
      recordCount + index,
      student1.targetScore
    );
    cumulativeSum += score;
    recordCount++;
    const average = Math.round((cumulativeSum / recordCount) * 10) / 10;
    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;
    // 학생 1번은 클래스 1 또는 3
    const classId = index % 2 === 0 ? 1 : 3;

    examRecords.push({
      studentId: 1,
      studentName: student1.name,
      date,
      dateFormatted,
      score,
      average,
      grade: calculateGrade(score),
      targetScore: student1.targetScore,
      differenceFromTarget: score - student1.targetScore,
      wrongAnswers: generateWrongAnswers(score),
      classId,
    });
  });
}

// 학생별 요약 데이터
export interface StudentSummary {
  studentId: number;
  studentName: string;
  targetScore: number;
  latestScore: number;
  latestAverage: number;
  latestGrade: GradeLevel;
  totalExams: number;
  gradeDistribution: Record<GradeLevel, number>;
  trend: 'improving' | 'stable' | 'declining';
}

export const studentSummaries: StudentSummary[] = students.map(student => {
  const studentRecords = examRecords.filter(r => r.studentId === student.id);
  const latestRecord = studentRecords[studentRecords.length - 1];
  const firstHalfAvg =
    studentRecords
      .slice(0, Math.floor(studentRecords.length / 2))
      .reduce((sum, r) => sum + r.score, 0) /
    Math.floor(studentRecords.length / 2);
  const secondHalfAvg =
    studentRecords
      .slice(Math.floor(studentRecords.length / 2))
      .reduce((sum, r) => sum + r.score, 0) /
    Math.ceil(studentRecords.length / 2);

  const gradeDistribution: Record<GradeLevel, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  studentRecords.forEach(record => {
    gradeDistribution[record.grade]++;
  });

  let trend: 'improving' | 'stable' | 'declining';
  const diff = secondHalfAvg - firstHalfAvg;
  if (diff > 2) trend = 'improving';
  else if (diff < -2) trend = 'declining';
  else trend = 'stable';

  return {
    studentId: student.id,
    studentName: student.name,
    targetScore: student.targetScore,
    latestScore: latestRecord.score,
    latestAverage: latestRecord.average,
    latestGrade: latestRecord.grade,
    totalExams: studentRecords.length,
    gradeDistribution,
    trend,
  };
});

// 일별 통계
export interface DailyStats {
  date: string;
  dateFormatted: string;
  averageScore: number;
  totalStudents: number;
  gradeDistribution: Record<GradeLevel, number>;
}

// 모든 시험 날짜 수집 (2월 + 추가된 1월, 3월, 4월)
const allExamDates = [
  ...examDates,
  '2026-01-06',
  '2026-01-07',
  '2026-01-08',
  '2026-01-09',
  '2026-03-03',
  '2026-04-01',
  '2026-04-02',
  '2026-04-03',
];

export const dailyStats: DailyStats[] = allExamDates.map(date => {
  const dateRecords = examRecords.filter(r => r.date === date);
  if (dateRecords.length === 0) {
    // 해당 날짜에 데이터가 없으면 기본값 반환
    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;
    return {
      date,
      dateFormatted,
      averageScore: 0,
      totalStudents: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    };
  }

  const averageScore =
    Math.round(
      (dateRecords.reduce((sum, r) => sum + r.score, 0) / dateRecords.length) *
        10
    ) / 10;

  const dateObj = new Date(date);
  const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
    2,
    '0'
  )}/${String(dateObj.getDate()).padStart(2, '0')}`;

  const gradeDistribution: Record<GradeLevel, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  dateRecords.forEach(record => {
    gradeDistribution[record.grade]++;
  });

  return {
    date,
    dateFormatted,
    averageScore,
    totalStudents: dateRecords.length,
    gradeDistribution,
  };
});

// 주별 통계
export interface WeeklyStats {
  week: number;
  startDate: string;
  endDate: string;
  averageScore: number;
  totalExams: number;
}

export const weeklyStats: WeeklyStats[] = [];
const weeks = Math.ceil(examDates.length / 5); // 주당 평일 5일

for (let week = 0; week < weeks; week++) {
  const weekDates = examDates.slice(week * 5, (week + 1) * 5);
  if (weekDates.length === 0) break;

  const weekRecords = examRecords.filter(r => weekDates.includes(r.date));
  const averageScore =
    Math.round(
      (weekRecords.reduce((sum, r) => sum + r.score, 0) / weekRecords.length) *
        10
    ) / 10;

  weeklyStats.push({
    week: week + 1,
    startDate: weekDates[0],
    endDate: weekDates[weekDates.length - 1],
    averageScore,
    totalExams: weekRecords.length,
  });
}

// 월별 통계
export const monthlyStats = {
  month: '2026-02',
  totalStudents: students.length,
  totalExams: examRecords.length,
  averageScore:
    Math.round(
      (examRecords.reduce((sum, r) => sum + r.score, 0) / examRecords.length) *
        10
    ) / 10,
  gradeDistribution: examRecords.reduce(
    (acc, record) => {
      acc[record.grade]++;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 } as Record<GradeLevel, number>
  ),
};
