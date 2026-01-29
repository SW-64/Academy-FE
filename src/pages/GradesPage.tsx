import { useState, useEffect, useCallback } from 'react';
import MainLayout from './MainLayout';
import { getStudentClasses } from '../api/students';
import type { StudentClassItem, StudentClass } from '../api/students';
import {
  getMyExamGrades,
  getMyExamRank,
  type MyExamGradesSort,
  type MyExamGradeItem,
} from '../api/class';

function GradesPage() {
  const [classes, setClasses] = useState<(StudentClassItem | StudentClass)[]>(
    []
  );
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [grades, setGrades] = useState<MyExamGradeItem[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [sortOption, setSortOption] = useState<MyExamGradesSort>('score_desc');

  const [rankLoadingExamId, setRankLoadingExamId] = useState<number | null>(
    null
  );

  // 내 클래스 목록 조회
  const fetchClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    try {
      const response = await getStudentClasses();
      const data = response.data;
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('클래스 목록 조회 에러:', error);
      const msg =
        error instanceof Error
          ? error.message
          : '클래스 목록을 가져오는데 실패했습니다.';
      alert(msg);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // 클래스 선택 시 학생 본인 시험점수 전체조회
  const fetchGrades = useCallback(async () => {
    if (!selectedClassId) {
      setGrades([]);
      return;
    }
    setIsLoadingGrades(true);
    try {
      const response = await getMyExamGrades(selectedClassId, sortOption);
      setGrades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('시험 성적 조회 에러:', error);
      const msg =
        error instanceof Error
          ? error.message
          : '시험 성적을 가져오는데 실패했습니다.';
      alert(msg);
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, [selectedClassId, sortOption]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleClassSelect = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleRankClick = async (examId: number) => {
    if (!selectedClassId) return;
    setRankLoadingExamId(examId);
    try {
      const response = await getMyExamRank(selectedClassId, examId);
      const d = response.data;
      const rank = d?.rank;
      const total = d?.totalStudents;
      if (rank != null && total != null) {
        alert(`등수: ${rank}위 / ${total}명`);
      } else {
        alert(response.message || '등수 정보를 불러왔습니다.');
      }
    } catch (error) {
      console.error('등수 조회 에러:', error);
      const msg =
        error instanceof Error ? error.message : '등수 조회에 실패했습니다.';
      alert(msg);
    } finally {
      setRankLoadingExamId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = dateStr.split('T')[0];
      return d || dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      <header className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
          나의 성적
        </h1>
      </header>

      {/* 클래스 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          클래스 선택
        </label>
        {isLoadingClasses ? (
          <p className="text-sm text-slate-600">클래스 목록을 불러오는 중...</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-slate-600">등록된 클래스가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classes.map(cls => (
              <button
                key={cls.classId}
                type="button"
                onClick={() => handleClassSelect(cls.classId)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === cls.classId
                    ? 'border-[#084773] bg-[#084773] text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cls.className}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 시험 성적 목록 - 클래스 선택 시 */}
      {selectedClassId && (
        <section className="mb-4 sm:mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-[1200px]">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  시험 성적 목록
                </h2>
                <select
                  value={sortOption}
                  onChange={e =>
                    setSortOption(e.target.value as MyExamGradesSort)
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773] bg-white"
                >
                  <option value="score_desc">점수순</option>
                  <option value="name_asc">이름순</option>
                </select>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">
                          회차
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">
                          날짜
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                          점수
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingGrades ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            시험 성적을 불러오는 중...
                          </td>
                        </tr>
                      ) : grades.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            시험 기록이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        grades.map(exam => (
                          <tr
                            key={exam.examId}
                            className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {exam.examTitle}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {formatDate(exam.examDate)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                              {exam.grades?.[0]?.score != null
                                ? `${exam.grades[0].score}점`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRankClick(exam.examId)}
                                disabled={rankLoadingExamId === exam.examId}
                                className="rounded-lg bg-[#084773] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#063a5a] disabled:opacity-50"
                              >
                                {rankLoadingExamId === exam.examId
                                  ? '조회 중...'
                                  : '등수 조회'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!selectedClassId && !isLoadingClasses && classes.length > 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
          <p className="text-sm text-slate-500">
            클래스를 선택하면 해당 클래스의 시험 성적을 볼 수 있습니다.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default GradesPage;
