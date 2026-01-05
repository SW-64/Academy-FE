import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from './MainLayout';
import {
  dummyClasses,
  dummyHomeworks,
  studentHomeworkProgress,
  calculateProgress,
} from '../data/homeworkData';
import { BookOpen, ChevronRight } from 'lucide-react';

// TODO: 실제 로그인한 학생 ID로 교체
const CURRENT_STUDENT_ID = 1;

function HomeworkPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    classIdParam ? parseInt(classIdParam, 10) : null
  );

  // URL 쿼리 파라미터와 동기화
  useEffect(() => {
    if (classIdParam) {
      const classId = parseInt(classIdParam, 10);
      if (!isNaN(classId)) {
        setSelectedClassId(classId);
      }
    }
  }, [classIdParam]);

  // 선택된 클래스의 숙제 목록 필터링
  const filteredHomeworks = selectedClassId
    ? dummyHomeworks.filter(h => h.classId === selectedClassId)
    : [];

  // 학생의 숙제 진행도 가져오기
  const getStudentProgress = (homeworkId: number) => {
    return studentHomeworkProgress.find(
      p => p.studentId === CURRENT_STUDENT_ID && p.homeworkId === homeworkId
    );
  };

  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">숙제</h1>
        <p className="mt-1 text-sm text-slate-600">
          클래스를 선택하여 숙제 목록을 확인하세요.
        </p>
      </header>

      {/* 클래스 선택 */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          클래스 선택
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dummyClasses.map(cls => (
            <button
              key={cls.id}
              type="button"
              onClick={() => {
                setSelectedClassId(cls.id);
                setSearchParams({ classId: cls.id.toString() });
              }}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedClassId === cls.id
                  ? 'border-[#084773] bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <h3 className="font-semibold text-slate-900">{cls.name}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* 숙제 목록 */}
      {selectedClassId ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            숙제 목록
          </h2>
          {filteredHomeworks.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-900">
                등록된 숙제가 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHomeworks.map(homework => {
                const progress = getStudentProgress(homework.id);
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
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#084773] hover:shadow-md"
                    onClick={() =>
                      navigate(
                        `/homework/${homework.id}/progress?classId=${selectedClassId}`
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {homework.textbookName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {homework.className}
                        </p>
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-600">진행도</span>
                            <span className="font-medium text-slate-900">
                              {progressData.completed} / {progressData.total} (
                              {progressData.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-[#084773] transition-all"
                              style={{ width: `${progressData.percentage}%` }}
                            />
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          현재 진행: 대단원 {progressData.currentMajorUnit} - 소단원{' '}
                          {progressData.currentMinorUnit}
                        </p>
                      </div>
                      <ChevronRight className="ml-4 h-5 w-5 flex-shrink-0 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-sm font-medium text-slate-900">
            클래스를 선택해주세요
          </p>
          <p className="mt-1 text-sm text-slate-600">
            위에서 클래스를 선택하면 해당 클래스의 숙제 목록을 확인할 수
            있습니다.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default HomeworkPage;

