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

// 2025년 2월의 평일 날짜 생성 (월~금만)
function generateWeekdaysInFebruary2025(): string[] {
  const dates: string[] = [];
  const year = 2025;
  const month = 1; // 0-based, 1 = February

  // 2월 1일부터 시작
  for (let day = 1; day <= 28; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = 일요일, 1 = 월요일, ..., 5 = 금요일
    // 평일만 추가 (월요일=1 ~ 금요일=5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

// 학생 데이터 생성
export const students: Student[] = studentNames.map((name, index) => ({
  id: index + 1,
  name,
  targetScore: generateTargetScore(),
}));

// 시험 날짜 목록
const examDates = generateWeekdaysInFebruary2025();

// 전체 시험 기록 생성
export const examRecords: ExamRecord[] = [];

students.forEach(student => {
  const studentScores: number[] = [];
  let cumulativeSum = 0;

  examDates.forEach((date, dayIndex) => {
    const score = generateScore(student.id, dayIndex, student.targetScore);
    studentScores.push(score);
    cumulativeSum += score;
    const average = Math.round((cumulativeSum / studentScores.length) * 10) / 10;

    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;

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
    });
  });
});

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
    studentRecords.slice(0, Math.floor(studentRecords.length / 2)).reduce((sum, r) => sum + r.score, 0) /
    Math.floor(studentRecords.length / 2);
  const secondHalfAvg =
    studentRecords.slice(Math.floor(studentRecords.length / 2)).reduce((sum, r) => sum + r.score, 0) /
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

export const dailyStats: DailyStats[] = examDates.map(date => {
  const dateRecords = examRecords.filter(r => r.date === date);
  const averageScore =
    Math.round((dateRecords.reduce((sum, r) => sum + r.score, 0) / dateRecords.length) * 10) / 10;

  const dateObj = new Date(date);
  const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;

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
    Math.round((weekRecords.reduce((sum, r) => sum + r.score, 0) / weekRecords.length) * 10) / 10;

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
  month: '2025-02',
  totalStudents: students.length,
  totalExams: examRecords.length,
  averageScore:
    Math.round((examRecords.reduce((sum, r) => sum + r.score, 0) / examRecords.length) * 10) / 10,
  gradeDistribution: examRecords.reduce(
    (acc, record) => {
      acc[record.grade]++;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 } as Record<GradeLevel, number>
  ),
};


