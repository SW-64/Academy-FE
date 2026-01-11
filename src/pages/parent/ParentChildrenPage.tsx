import { useState } from 'react';
import { X, GraduationCap, BookOpen, FileText } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  examRecords,
  studentSummaries,
  dailyStats,
  students,
  type GradeLevel,
  type ExamRecord,
} from '../../data/gradesData';
import {
  getStudentClasses,
  getClassExamRecords,
  getStudentProgress,
} from '../../data/parentData';
import {
  dummyHomeworks,
  studentHomeworkProgress,
  calculateProgress,
} from '../../data/homeworkData';

// 자녀 2명의 ID (실제로는 로그인한 학부모의 자녀 ID로 교체)
const CHILDREN_IDS = [1, 2];

type TabType = 'grades' | 'progress' | 'homework';

function ParentChildrenPage() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    CHILDREN_IDS.length > 0 ? CHILDREN_IDS[0] : null
  );
  const [activeTab, setActiveTab] = useState<TabType>('grades');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // 기본값: 2월
  const [selectedRecord, setSelectedRecord] = useState<ExamRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 자녀들의 정보 가져오기
  const childrenData = CHILDREN_IDS.map(childId => {
    const student = students.find(s => s.id === childId);
    return {
      childId,
      name: student?.name || `학생${childId}`,
    };
  });

  // 자녀가 선택되지 않았으면 첫 번째 자녀를 기본으로 선택
  if (!selectedChildId && CHILDREN_IDS.length > 0) {
    setSelectedChildId(CHILDREN_IDS[0]);
    return null;
  }

  if (!selectedChildId) {
    return (
      <MainLayout isParent={true}>
        <div className="text-center text-slate-600">
          등록된 자녀가 없습니다.
        </div>
      </MainLayout>
    );
  }

  // 선택된 자녀의 클래스 목록
  const studentClasses = getStudentClasses(selectedChildId);
  
  // 선택된 자녀의 데이터
  const currentStudent = studentSummaries.find(
    s => s.studentId === selectedChildId
  );
  const selectedChildName =
    childrenData.find(c => c.childId === selectedChildId)?.name ||
    `학생${selectedChildId}`;

  if (!currentStudent) {
    return (
      <MainLayout isParent={true}>
        <div className="text-center text-slate-600">
          학생 정보를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  // 클래스별 성적 필터링
  const classRecords = getClassExamRecords(selectedChildId, selectedClassId);
  const myRecords = examRecords.filter(r => r.studentId === selectedChildId);

  // 개인 등급 분포 계산
  const myGradeDistribution = myRecords.reduce(
    (acc, record) => {
      acc[record.grade]++;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 } as Record<GradeLevel, number>
  );

  // 선택된 월에 해당하는 성적 필터링
  const getFilteredRecords = () => {
    return classRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() + 1 === selectedMonth &&
          recordDate.getFullYear() === 2026
        );
      })
      .reverse(); // 오래된 순으로 정렬
  };

  const filteredRecords = getFilteredRecords();

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

  // 진도 데이터
  const progressData = getStudentProgress(selectedChildId, selectedClassId);

  // 숙제 데이터
  const studentHomeworks = selectedClassId
    ? dummyHomeworks.filter(h => h.classId === selectedClassId)
    : dummyHomeworks.filter(h => {
        // 학생이 속한 클래스의 숙제만 필터링
        return studentClasses.some(c => c.id === h.classId);
      });

  // 학생의 숙제 진행도 가져오기
  const getStudentHomeworkProgress = (homeworkId: number) => {
    return studentHomeworkProgress.find(
      p => p.studentId === selectedChildId && p.homeworkId === homeworkId
    );
  };

  return (
    <MainLayout isParent={true}>
      {/* 헤더 */}
      <header className="mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
          자녀 조회
        </h1>
      </header>

      {/* 자녀 선택 탭 */}
      {CHILDREN_IDS.length > 1 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {childrenData.map(child => (
              <button
                key={child.childId}
                type="button"
                onClick={() => {
                  setSelectedChildId(child.childId);
                  setSelectedMonth(2); // 월 선택 리셋
                  setSelectedClassId(null); // 클래스 선택 리셋
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedChildId === child.childId
                    ? 'bg-[#084773] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 자녀 헤더 */}
      <header className="mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
          {selectedChildName}의 정보
        </h2>
      </header>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('grades');
              setSelectedClassId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'grades'
                ? 'border-[#084773] text-[#084773]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            성적
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('progress');
              setSelectedClassId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'progress'
                ? 'border-[#084773] text-[#084773]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            진도
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('homework');
              setSelectedClassId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'homework'
                ? 'border-[#084773] text-[#084773]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            숙제
          </button>
        </div>
      </div>

      {/* 클래스 선택 */}
      {studentClasses.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900">
            클래스 선택
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedClassId(null)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedClassId === null
                  ? 'bg-[#084773] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              전체
            </button>
            {studentClasses.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === cls.id
                    ? 'bg-[#084773] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 성적 탭 */}
      {activeTab === 'grades' && (
        <>
          {/* 년도 및 월 선택 */}
          <div className="mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-0 sm:flex sm:items-center sm:gap-4">
              <span className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-0 block sm:inline">
                2026년
              </span>
              {/* 모바일/태블릿: 2줄 배치 */}
              <div className="lg:hidden flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map(month => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => setSelectedMonth(month)}
                      className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                        selectedMonth === month
                          ? 'bg-[#084773] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                      }`}
                    >
                      {month}월
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {Array.from({ length: 5 }, (_, i) => i + 8).map(month => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => setSelectedMonth(month)}
                      className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                        selectedMonth === month
                          ? 'bg-[#084773] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                      }`}
                    >
                      {month}월
                    </button>
                  ))}
                </div>
              </div>
              {/* 데스크탑: 1줄 배치 */}
              <div className="hidden lg:flex flex-wrap gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => setSelectedMonth(month)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedMonth === month
                        ? 'bg-[#084773] text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                    }`}
                  >
                    {month}월
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 성적 정보 카드 */}
          <div className="mb-12 sm:mb-24 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {/* 성적 현황 */}
            <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-blue-100/70">
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">
                {selectedChildName}의 성적 현황
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
              </div>
            </div>

            {/* 등급 분포 */}
            <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-blue-100/70">
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">
                {selectedChildName}의 등급 분포
              </h3>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {Object.entries(myGradeDistribution).map(([grade, count]) => {
                  const percentage = (count / myRecords.length) * 100;
                  return (
                    <div key={grade} className="text-center">
                      <div
                        className={`mx-auto mb-1 sm:mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-base sm:text-lg font-bold ${getGradeColor(
                          grade as GradeLevel
                        )}`}
                      >
                        {grade}
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-900">
                        {count}회
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-600">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 최근 시험 성적 */}
          <section className="mb-4 sm:mb-6">
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">
              최근 시험 성적
            </h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-[700px] sm:min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          날짜
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          점수
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          전체 학생 평균
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          순위
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          등급
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                          전체 학생 평균 대비
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-xs sm:text-sm text-slate-500"
                          >
                            {selectedMonth}월에 해당하는 시험 기록이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record, index) => {
                          // 해당 날짜의 전체 학생 평균 찾기
                          const dailyStat = dailyStats.find(
                            stat => stat.date === record.date
                          );
                          const allStudentsAverage = dailyStat
                            ? dailyStat.averageScore
                            : 0;
                          const differenceFromAllStudentsAverage =
                            record.score - allStudentsAverage;

                          // 해당 날짜의 모든 학생 점수 가져와서 순위 계산
                          const sameDateRecords = examRecords.filter(
                            r => r.date === record.date
                          );
                          const sortedByScore = [...sameDateRecords].sort(
                            (a, b) => b.score - a.score
                          );
                          const rank =
                            sortedByScore.findIndex(
                              r => r.studentId === selectedChildId
                            ) + 1;
                          const totalStudents = sameDateRecords.length;

                          return (
                            <tr
                              key={index}
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsModalOpen(true);
                              }}
                              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                                {record.dateFormatted}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                                {record.score}점
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                {allStudentsAverage}점
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                                {rank}위 / {totalStudents}명
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-block rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${getGradeColor(
                                    record.grade
                                  )}`}
                                >
                                  {record.grade}
                                </span>
                              </td>
                              <td
                                className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium whitespace-nowrap ${
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
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* 성적 변화 그래프 */}
          <section className="mb-4 sm:mb-6">
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">
              성적 변화
            </h2>
            <div className="rounded-xl bg-white p-2 sm:p-3 md:p-6 shadow-sm ring-1 ring-blue-100/70">
              <div className="relative h-40 sm:h-48 md:h-64 w-full overflow-x-auto">
                {filteredRecords.length > 0 ? (
                  <>
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
                      {/* 전체 학생 평균점수 라인 (날짜별) */}
                      {(() => {
                        const reversedRecords = [...filteredRecords].reverse();
                        const averagePoints = reversedRecords.map(
                          (record, index) => {
                            const dailyStat = dailyStats.find(
                              stat => stat.date === record.date
                            );
                            const allStudentsAverage = dailyStat
                              ? dailyStat.averageScore
                              : 0;
                            const reversedLength = filteredRecords.length;
                            const x =
                              reversedLength > 1
                                ? 50 + (index / (reversedLength - 1)) * 700
                                : 50;
                            const y = 250 - ((allStudentsAverage - 60) / 40) * 200;
                            return { x, y };
                          }
                        );

                        return (
                          <polyline
                            points={averagePoints
                              .map(point => `${point.x},${point.y}`)
                              .join(' ')}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })()}
                      {/* 점수 선 */}
                      <polyline
                        points={[...filteredRecords]
                          .reverse()
                          .map((record, index) => {
                            const reversedLength = filteredRecords.length;
                            const x =
                              reversedLength > 1
                                ? 50 + (index / (reversedLength - 1)) * 700
                                : 50;
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
                      {[...filteredRecords].reverse().map((record, index) => {
                        const reversedLength = filteredRecords.length;
                        const x =
                          reversedLength > 1
                            ? 50 + (index / (reversedLength - 1)) * 700
                            : 50;
                        const y = 250 - ((record.score - 60) / 40) * 200;
                        return (
                          <circle key={index} cx={x} cy={y} r="4" fill="#084773" />
                        );
                      })}
                    </svg>
                    {/* 범례 */}
                    <div className="absolute right-2 sm:right-6 top-2 sm:top-6 flex flex-col gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-2.5 sm:h-3 w-6 sm:w-8 bg-[#084773]"></div>
                        <span className="text-[10px] sm:text-xs text-slate-600">
                          시험 점수
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-2.5 sm:h-3 w-6 sm:w-8 border-2 border-dashed border-amber-500"></div>
                        <span className="text-[10px] sm:text-xs text-slate-600">
                          전체 학생 평균점수
                        </span>
                      </div>
                    </div>
                    {/* Y축 레이블 (60~100) */}
                    <div className="absolute left-0 top-0 bottom-8 sm:bottom-10 flex flex-col justify-between py-1 sm:py-2">
                      {[100, 90, 80, 70, 60].map(score => (
                        <span
                          key={score}
                          className="text-[10px] sm:text-xs text-slate-500"
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                    {/* X축 레이블 */}
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{ height: '20px', paddingLeft: '2rem' }}
                    >
                      {[...filteredRecords]
                        .reverse()
                        .filter(
                          (_, index) =>
                            index %
                              Math.max(
                                1,
                                Math.floor(filteredRecords.length / 5)
                              ) ===
                              0 || index === filteredRecords.length - 1
                        )
                        .map((filteredRecord, displayIndex) => {
                          // 필터링된 레코드들 중에서 원래 인덱스 찾기
                          const reversedRecords = [...filteredRecords].reverse();
                          const originalIndex = reversedRecords.findIndex(
                            r => r.date === filteredRecord.date
                          );

                          // SVG 내부의 실제 x 좌표 계산 (viewBox 기준, padding = 50)
                          const reversedLength = filteredRecords.length;
                          const x =
                            reversedLength > 1
                              ? 50 + (originalIndex / (reversedLength - 1)) * 700
                              : 50;
                          // SVG viewBox 기준으로 퍼센트 계산 (800px 기준)
                          const xPercent = (x / 800) * 100;

                          return (
                            <span
                              key={displayIndex}
                              className="absolute text-[8px] sm:text-[10px] text-slate-500"
                              style={{
                                left: `${xPercent}%`,
                                transform: 'translateX(-50%)',
                              }}
                            >
                              {filteredRecord.dateFormatted}
                            </span>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    {selectedMonth}월에 해당하는 시험 기록이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* 진도 탭 */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          {progressData.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-900">
                진도 정보가 없습니다
              </p>
            </div>
          ) : (
            progressData.map(progress => (
              <div
                key={`${progress.studentId}-${progress.classId}`}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {progress.className}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{progress.subject}</p>
                </div>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">진행도</span>
                    <span className="font-medium text-slate-900">
                      {progress.completedChapters} / {progress.totalChapters} (
                      {progress.progressPercentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-[#084773] transition-all"
                      style={{ width: `${progress.progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">현재 진도</span>
                    <span className="font-medium text-slate-900">
                      {progress.currentChapter}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">마지막 업데이트</span>
                    <span className="text-slate-900">{progress.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 숙제 탭 */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          {studentHomeworks.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-900">
                등록된 숙제가 없습니다
              </p>
            </div>
          ) : (
            studentHomeworks.map(homework => {
              const progress = getStudentHomeworkProgress(homework.id);
              const progressData = progress
                ? calculateProgress(
                    progress.progress,
                    homework.majorUnitCount,
                    homework.minorUnitCount,
                    homework.majorUnitsDetail
                  )
                : {
                    completed: 0,
                    total: homework.majorUnitsDetail
                      ? homework.majorUnitsDetail.reduce(
                          (sum, d) => sum + d.minorUnitCount,
                          0
                        )
                      : homework.majorUnitCount * homework.minorUnitCount,
                    percentage: 0,
                    currentMajorUnit: 1,
                    currentMinorUnit: 1,
                  };

              return (
                <div
                  key={homework.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {homework.textbookName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {homework.className}
                    </p>
                  </div>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">진행도</span>
                      <span className="font-medium text-slate-900">
                        {progressData.completed} / {progressData.total} (
                        {progressData.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#084773] transition-all"
                        style={{ width: `${progressData.percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    현재 진행: 대단원 {progressData.currentMajorUnit} - 소단원{' '}
                    {progressData.currentMinorUnit}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 상세 정보 모달 */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full bg-slate-100 p-1 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-slate-900">
              시험 상세 정보
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">학생 이름</p>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedRecord.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">시험 날짜</p>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedRecord.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">점수</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedRecord.score}점
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">등급</p>
                  <p className="mt-1">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getGradeColor(
                        selectedRecord.grade
                      )}`}
                    >
                      {selectedRecord.grade}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    전체 학생 평균
                  </p>
                  <p className="mt-1 text-base text-slate-900">
                    {dailyStats
                      .find(stat => stat.date === selectedRecord.date)
                      ?.averageScore.toFixed(1) || '0.0'}
                    점
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">순위</p>
                  <p className="mt-1 text-base text-slate-900">
                    {(() => {
                      const sameDateRecords = examRecords.filter(
                        r => r.date === selectedRecord.date
                      );
                      const sortedByScore = [...sameDateRecords].sort(
                        (a, b) => b.score - a.score
                      );
                      const rank =
                        sortedByScore.findIndex(
                          r => r.studentId === selectedChildId
                        ) + 1;
                      const totalStudents = sameDateRecords.length;
                      return `${rank}위 / ${totalStudents}명`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    전체 학생 평균 대비
                  </p>
                  <p
                    className={`mt-1 text-base font-medium ${
                      selectedRecord.score -
                        (dailyStats.find(
                          stat => stat.date === selectedRecord.date
                        )?.averageScore || 0) >=
                      0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedRecord.score -
                      (dailyStats.find(
                        stat => stat.date === selectedRecord.date
                      )?.averageScore || 0) >=
                    0
                      ? '+'
                      : ''}
                    {(
                      selectedRecord.score -
                      (dailyStats.find(
                        stat => stat.date === selectedRecord.date
                      )?.averageScore || 0)
                    ).toFixed(1)}
                    점
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 border-t border-slate-200 pt-3 sm:pt-4">
                <p className="mb-2 text-xs sm:text-sm font-medium text-slate-600">
                  오답 문항
                </p>
                <div className="mb-4">
                  {selectedRecord.wrongAnswers &&
                  selectedRecord.wrongAnswers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.wrongAnswers.map(questionNum => (
                        <span
                          key={questionNum}
                          className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 border border-red-200"
                        >
                          {questionNum}번
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">틀린 문항이 없습니다.</p>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-6 border-t border-slate-200 pt-3 sm:pt-4">
                <p className="mb-2 text-xs sm:text-sm font-medium text-slate-600">
                  선생님 코멘트
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                  {selectedRecord.score >= 90
                    ? '이번 시험에서 매우 우수한 성적을 거두셨습니다. 지속적인 노력과 집중력이 돋보였으며, 특히 문제 해결 과정에서 논리적 사고력이 뛰어났습니다. 앞으로도 현재의 학습 태도를 유지하시면서 더욱 발전하시길 바랍니다. 다음 시험에서도 좋은 결과를 기대하겠습니다.'
                    : selectedRecord.score >= 80
                    ? '전반적으로 좋은 성적을 보여주셨습니다. 기본 개념에 대한 이해가 탄탄하며, 문제 해결 능력도 양호합니다. 다만 일부 응용 문제에서 실수가 있었으니, 다양한 유형의 문제를 더 많이 풀어보시면 도움이 될 것 같습니다. 꾸준한 연습을 통해 더 높은 점수를 목표로 하시기 바랍니다.'
                    : selectedRecord.score >= 70
                    ? '기본적인 내용은 이해하고 계시지만, 더 많은 연습이 필요해 보입니다. 특히 계산 실수나 문제 이해 부분에서 개선의 여지가 있습니다. 매일 조금씩이라도 문제를 풀어보시고, 틀린 문제는 반드시 복습하시기 바랍니다. 꾸준한 노력으로 점차 향상될 수 있을 것입니다.'
                    : '이번 시험 결과를 바탕으로 학습 방법을 점검해보시기 바랍니다. 기본 개념부터 다시 정리하시고, 매일 일정한 시간을 할애하여 학습하시는 것이 중요합니다. 어려운 부분이 있다면 선생님께 질문하시거나 추가 설명을 요청하시기 바랍니다. 포기하지 마시고 꾸준히 노력하시면 분명히 좋은 결과가 있을 것입니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentChildrenPage;
