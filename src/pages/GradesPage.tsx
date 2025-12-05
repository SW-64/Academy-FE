import { useState } from 'react';
import MainLayout from './MainLayout';
import {
  examRecords,
  studentSummaries,
  dailyStats,
  weeklyStats,
  monthlyStats,
  type GradeLevel,
} from '../data/gradesData';

type ViewMode = 'daily' | 'weekly' | 'monthly';

// TODO: 실제 로그인한 학생 ID로 교체
const CURRENT_STUDENT_ID = 1;
const STUDENT_AVERAGE_SCORE = 70; // 학생 평균점수

function GradesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  // 현재 학생의 데이터만 필터링
  const currentStudent = studentSummaries.find(
    s => s.studentId === CURRENT_STUDENT_ID
  );
  const myRecords = examRecords.filter(
    r => r.studentId === CURRENT_STUDENT_ID
  );

  if (!currentStudent) {
    return (
      <MainLayout>
        <div className="text-center text-slate-600">
          학생 정보를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  // 개인 등급 분포 계산
  const myGradeDistribution = myRecords.reduce(
    (acc, record) => {
      acc[record.grade]++;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 } as Record<GradeLevel, number>
  );

  // 최근 시험 성적 (일별/주별/월별)
  const getRecentRecords = () => {
    switch (viewMode) {
      case 'daily':
        return myRecords.slice(0, 10).reverse(); // 최근 10일을 오래된 순으로
      case 'weekly':
        // 주별로 그룹화
        const weeklyGroups: typeof myRecords[] = [];
        for (let i = 0; i < myRecords.length; i += 5) {
          weeklyGroups.push(myRecords.slice(i, i + 5));
        }
        return weeklyGroups.slice(-4).map(week => ({
          ...week[week.length - 1],
          weekAverage:
            Math.round(
              (week.reduce((sum, r) => sum + r.score, 0) / week.length) * 10
            ) / 10,
        }));
      case 'monthly':
        return [
          {
            ...myRecords[myRecords.length - 1],
            monthAverage: currentStudent.latestAverage,
          },
        ];
      default:
        return [];
    }
  };

  // 등급별 색상
  const getGradeColor = (grade: GradeLevel) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-100 text-emerald-700';
      case 'B':
        return 'bg-blue-100 text-blue-700';
      case 'C':
        return 'bg-yellow-100 text-yellow-700';
      case 'D':
        return 'bg-orange-100 text-orange-700';
      case 'F':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };


  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">나의 성적</h1>
        <p className="mt-1 text-sm text-slate-600">
          {currentStudent.studentName}님의 수학 시험 성적을 확인하실 수 있습니다.
        </p>
      </header>

      {/* 나의 성적 정보 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 나의 성적 현황 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            나의 성적 현황
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">이름</span>
              <span className="font-medium text-slate-900">
                {currentStudent.studentName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">최근 등급</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getGradeColor(
                  currentStudent.latestGrade
                )}`}
              >
                {currentStudent.latestGrade}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">학생 평균점수</span>
              <span className="font-medium text-slate-900">
                {STUDENT_AVERAGE_SCORE}점
              </span>
            </div>
          </div>
        </div>

        {/* 나의 등급 분포 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            나의 등급 분포
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(myGradeDistribution).map(([grade, count]) => {
              const percentage = (count / myRecords.length) * 100;
              return (
                <div key={grade} className="text-center">
                  <div
                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${getGradeColor(
                      grade as GradeLevel
                    )}`}
                  >
                    {grade}
                  </div>
                  <p className="text-xs font-medium text-slate-900">
                    {count}회
                  </p>
                  <p className="text-xs text-slate-600">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode('daily')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'daily'
              ? 'bg-[#084773] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          일별
        </button>
        <button
          type="button"
          onClick={() => setViewMode('weekly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'weekly'
              ? 'bg-[#084773] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          주별
        </button>
        <button
          type="button"
          onClick={() => setViewMode('monthly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'monthly'
              ? 'bg-[#084773] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          월별
        </button>
      </div>

      {/* 최근 시험 성적 */}
      <section className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          최근 시험 성적 (
          {viewMode === 'daily'
            ? '일별'
            : viewMode === 'weekly'
            ? '주별'
            : '월별'}
          )
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    날짜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    {viewMode === 'daily' ? '점수' : '평균 점수'}
                  </th>
                  {viewMode === 'daily' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                        전체 학생 평균
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                        등급
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                        전체 학생 평균 대비
                      </th>
                    </>
                  )}
                  {viewMode !== 'daily' && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      등급
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {viewMode === 'daily' &&
                  getRecentRecords().map((record, index) => {
                    // 해당 날짜의 전체 학생 평균 찾기
                    const dailyStat = dailyStats.find(
                      stat => stat.date === record.date
                    );
                    const allStudentsAverage = dailyStat
                      ? dailyStat.averageScore
                      : 0;
                    const differenceFromAllStudentsAverage =
                      record.score - allStudentsAverage;
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {record.dateFormatted}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {record.score}점
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {allStudentsAverage}점
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getGradeColor(
                              record.grade
                            )}`}
                          >
                            {record.grade}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            differenceFromAllStudentsAverage >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {differenceFromAllStudentsAverage >= 0 ? '+' : ''}
                          {differenceFromAllStudentsAverage.toFixed(1)}점
                        </td>
                      </tr>
                    );
                  })}
                {viewMode === 'weekly' &&
                  getRecentRecords().map((record: any, index) => {
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {record.dateFormatted}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {record.weekAverage}점
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getGradeColor(
                              record.grade
                            )}`}
                          >
                            {record.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {viewMode === 'monthly' &&
                  getRecentRecords().map((record: any, index) => {
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          2025년 2월
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {record.monthAverage}점
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getGradeColor(
                              record.grade
                            )}`}
                          >
                            {record.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 성적 변화 그래프 */}
      <section className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          성적 변화
        </h2>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
          <div className="relative h-64 w-full">
            <svg
              className="h-full w-full"
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              {/* 그리드 라인 (60~100 범위) */}
              {[60, 70, 80, 90, 100].map(score => {
                const y = 250 - ((score - 60) / 40) * 200;
                return (
                  <line
                    key={score}
                    x1="50"
                    y1={y}
                    x2="750"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}
              {/* 평균점수 라인 */}
              <line
                x1="50"
                y1={250 - ((STUDENT_AVERAGE_SCORE - 60) / 40) * 200}
                x2="750"
                y2={250 - ((STUDENT_AVERAGE_SCORE - 60) / 40) * 200}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              {/* 점수 선 */}
              <polyline
                points={myRecords
                  .map((record, index) => {
                    const x = 50 + (index / (myRecords.length - 1)) * 700;
                    const y = 250 - ((record.score - 60) / 40) * 200;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#084773"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* 데이터 포인트 */}
              {myRecords.map((record, index) => {
                const x = 50 + (index / (myRecords.length - 1)) * 700;
                const y = 250 - ((record.score - 60) / 40) * 200;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#084773"
                  />
                );
              })}
            </svg>
            {/* 범례 */}
            <div className="absolute right-6 top-6 flex flex-col gap-2 rounded-lg bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-[#084773]"></div>
                <span className="text-xs text-slate-600">시험 점수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 border-2 border-dashed border-amber-500"></div>
                <span className="text-xs text-slate-600">평균점수</span>
              </div>
            </div>
            {/* Y축 레이블 (60~100) */}
            <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2">
              {[100, 90, 80, 70, 60].map(score => (
                <span key={score} className="text-xs text-slate-500">
                  {score}
                </span>
              ))}
            </div>
            {/* X축 레이블 */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              {myRecords
                .filter((_, index) => index % 5 === 0 || index === myRecords.length - 1)
                .map((record, index) => (
                  <span key={index} className="text-[10px] text-slate-500">
                    {record.dateFormatted}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default GradesPage;
