import { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from './MainLayout';
// 타입 정의
export type HomeworkProgress = {
  majorUnit: number;
  minorUnit: number;
  completed: boolean;
};

export type MajorUnitDetail = {
  majorUnit: number;
  minorUnitCount: number;
};

export type Homework = {
  id: number;
  textbookId: number;
  textbookName: string;
  classId: number;
  className: string;
  majorUnitCount: number;
  minorUnitCount: number;
  progress: HomeworkProgress[];
  majorUnitsDetail?: MajorUnitDetail[];
};

export type StudentHomework = {
  studentId: number;
  homeworkId: number;
  progress: HomeworkProgress[];
  lastUpdated: string;
};

// 빈 데이터
const dummyHomeworks: Homework[] = [];
const studentHomeworkProgress: StudentHomework[] = [];

// 진행도 계산 함수
function calculateProgress(
  progress: HomeworkProgress[],
  majorUnitCount: number,
  minorUnitCount: number
): {
  completed: number;
  total: number;
  percentage: number;
  currentMajorUnit: number;
  currentMinorUnit: number;
} {
  const total = majorUnitCount * minorUnitCount;
  const completed = progress.filter(p => p.completed).length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    currentMajorUnit: 1,
    currentMinorUnit: 1,
  };
}
import { ArrowLeft, Check, X } from 'lucide-react';

// TODO: 실제 로그인한 학생 ID로 교체
const CURRENT_STUDENT_ID = 1;

function HomeworkProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const homeworkId = id ? parseInt(id, 10) : null;
  const classId = searchParams.get('classId');

  const homework = useMemo(() => {
    return homeworkId ? dummyHomeworks.find(h => h.id === homeworkId) : null;
  }, [homeworkId]);

  const studentProgress = useMemo(() => {
    if (!homeworkId) return null;
    return studentHomeworkProgress.find(
      p => p.studentId === CURRENT_STUDENT_ID && p.homeworkId === homeworkId
    );
  }, [homeworkId]);

  // 진행도 데이터 계산
  const progressData = useMemo(() => {
    const total = homework
      ? homework.majorUnitsDetail
        ? homework.majorUnitsDetail.reduce(
            (sum: number, d: MajorUnitDetail) => sum + d.minorUnitCount,
            0
          )
        : homework.majorUnitCount * homework.minorUnitCount
      : 0;

    if (!homework || !studentProgress) {
      return {
        completed: 0,
        total,
        percentage: 0,
        currentMajorUnit: 1,
        currentMinorUnit: 1,
      };
    }
    const calculated = calculateProgress(
      studentProgress.progress,
      homework.majorUnitCount,
      homework.minorUnitCount
    );
    return {
      ...calculated,
      total, // majorUnitsDetail이 있으면 그걸 사용한 total로 덮어쓰기
    };
  }, [homework, studentProgress]);

  // 대단원별 소단원 진행도 그룹화
  const groupedProgress = useMemo(() => {
    if (!homework) return {};

    const groups: Record<number, HomeworkProgress[]> = {};

    // 모든 대단원과 소단원을 포함하도록 생성
    for (let major = 1; major <= homework.majorUnitCount; major++) {
      groups[major] = [];

      // 대단원별 소단원 개수 가져오기
      const minorUnitCount = homework.majorUnitsDetail
        ? homework.majorUnitsDetail.find(
            (d: MajorUnitDetail) => d.majorUnit === major
          )?.minorUnitCount || homework.minorUnitCount
        : homework.minorUnitCount;

      for (let minor = 1; minor <= minorUnitCount; minor++) {
        // studentProgress에서 해당 항목 찾기
        const existingProgress = studentProgress?.progress.find(
          p => p.majorUnit === major && p.minorUnit === minor
        );

        if (existingProgress) {
          groups[major].push(existingProgress);
        } else {
          // progress에 없으면 미완료 상태로 추가
          groups[major].push({
            majorUnit: major,
            minorUnit: minor,
            completed: false,
          });
        }
      }
      // 소단원 순서대로 정렬
      groups[major].sort((a, b) => a.minorUnit - b.minorUnit);
    }

    return groups;
  }, [homework, studentProgress]);

  if (!homework) {
    return (
      <MainLayout>
        <div className="text-center text-slate-600">
          숙제를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* 헤더 */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(classId ? `/homework?classId=${classId}` : '/homework')
          }
          className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          숙제 목록으로 돌아가기
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">
          {homework.textbookName}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{homework.className}</p>
      </div>

      {/* 진행도 요약 */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">전체 진행도</span>
            <span className="font-semibold text-slate-900">
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

      {/* 대단원별 진행도 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          단원별 진행도
        </h2>
        <div className="space-y-4">
          {Object.entries(groupedProgress)
            .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
            .map(([majorUnitStr, minorUnits]) => {
              const majorUnit = parseInt(majorUnitStr, 10);
              const completedCount = minorUnits.filter(m => m.completed).length;
              const totalCount = minorUnits.length;
              const majorPercentage = Math.round(
                (completedCount / totalCount) * 100
              );

              return (
                <div
                  key={majorUnit}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">
                        대단원 {majorUnit}
                      </h3>
                      <span className="text-sm text-slate-600">
                        {completedCount} / {totalCount} ({majorPercentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all ${
                          majorPercentage === 100
                            ? 'bg-emerald-500'
                            : majorPercentage > 0
                            ? 'bg-blue-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${majorPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* 소단원 목록 */}
                  <div
                    className={`grid gap-3 ${
                      totalCount === 1
                        ? 'grid-cols-1'
                        : totalCount === 2
                        ? 'grid-cols-2'
                        : totalCount === 3
                        ? 'grid-cols-3'
                        : totalCount === 4
                        ? 'grid-cols-2 sm:grid-cols-4'
                        : totalCount <= 6
                        ? 'grid-cols-2 sm:grid-cols-3'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    }`}
                  >
                    {minorUnits.map((minor, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          minor.completed
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-700">
                          소단원 {minor.minorUnit}
                        </span>
                        {minor.completed ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressPage;
