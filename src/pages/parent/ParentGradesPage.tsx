import { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '../MainLayout';
import { getMyStudents, getMyStudentClasses } from '../../api/parents';
import type { ParentStudent, ParentStudentClass } from '../../api/parents';
import {
  getMyStudentExamGrades,
  getMyStudentExamRank,
  type MyExamGradesSort,
  type MyExamGradeItem,
  type MyExamRankItem,
} from '../../api/class';
import { X } from 'lucide-react';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function ParentGradesPage() {
  const currentDate = new Date();
  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [classes, setClasses] = useState<ParentStudentClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [grades, setGrades] = useState<MyExamGradeItem[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [sortOption, setSortOption] = useState<MyExamGradesSort>('score_desc');
  const [selectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => currentDate.getMonth() + 1
  );
  const [rankLoadingExamId, setRankLoadingExamId] = useState<number | null>(null);
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [rankModalLoading, setRankModalLoading] = useState(false);
  const [rankModalData, setRankModalData] = useState<{
    examTitle: string;
    rankList: MyExamRankItem[];
  } | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const response = await getMyStudents();
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '자녀 목록을 가져오는데 실패했습니다.';
      alert(msg);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const fetchClasses = useCallback(async () => {
    if (!selectedStudentId) {
      setClasses([]);
      return;
    }
    setIsLoadingClasses(true);
    try {
      const response = await getMyStudentClasses(selectedStudentId);
      setClasses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '자녀의 클래스 목록을 가져오는데 실패했습니다.';
      alert(msg);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchClasses();
    setSelectedClassId(null);
  }, [fetchClasses]);

  const fetchGrades = useCallback(async () => {
    if (!selectedClassId || !selectedStudentId) {
      setGrades([]);
      return;
    }
    setIsLoadingGrades(true);
    try {
      const response = await getMyStudentExamGrades(
        selectedClassId,
        selectedStudentId,
        sortOption
      );
      setGrades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '자녀의 시험 성적을 가져오는데 실패했습니다.';
      alert(msg);
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, [selectedClassId, selectedStudentId, sortOption]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
  };

  const handleClassSelect = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleRankClick = async (examId: number, examTitle: string) => {
    if (!selectedClassId || !selectedStudentId) return;
    setRankLoadingExamId(examId);
    setRankModalOpen(true);
    setRankModalLoading(true);
    setRankModalData({ examTitle, rankList: [] });
    try {
      const response = await getMyStudentExamRank(
        selectedClassId,
        examId,
        selectedStudentId
      );
      const items = Array.isArray(response.data) ? response.data : [];
      setRankModalData({ examTitle, rankList: items });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : '등수 조회에 실패했습니다.';
      alert(msg);
      setRankModalOpen(false);
    } finally {
      setRankModalLoading(false);
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

  const filteredGrades = useMemo(() => {
    return grades.filter(exam => {
      const dateStr = exam.examDate?.split('T')[0] ?? '';
      const [y, m] = dateStr.split('-').map(Number);
      return y === selectedYear && m === selectedMonth;
    });
  }, [grades, selectedYear, selectedMonth]);

  const selectedStudent = students.find(s => s.studentId === selectedStudentId);

  return (
    <MainLayout isParent={true}>
      <header className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
          자녀 성적
        </h1>
      </header>

      {/* 자녀 선택 */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-900">
          자녀 선택
        </label>
        {isLoadingStudents ? (
          <p className="text-sm text-slate-600">자녀 목록을 불러오는 중...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-600">등록된 자녀가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {students.map(s => (
              <button
                key={s.studentId}
                type="button"
                onClick={() => handleStudentSelect(s.studentId)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStudentId === s.studentId
                    ? 'border-[#084773] bg-[#084773] text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s.user.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 클래스 선택 - 자녀 선택 시 */}
      {selectedStudentId && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-900">
            클래스 선택
          </label>
          {isLoadingClasses ? (
            <p className="text-sm text-slate-600">
              클래스 목록을 불러오는 중...
            </p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-slate-600">
              해당 자녀의 등록된 클래스가 없습니다.
            </p>
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
      )}

      {/* 년도·월 선택 - 클래스 선택 시 */}
      {selectedClassId && (
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-base sm:text-lg font-semibold text-slate-900">
              {selectedYear}년
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {MONTHS.map(month => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setSelectedMonth(month)}
                  className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    selectedMonth === month
                      ? 'bg-[#084773] text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {month}월
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 시험 성적 목록 */}
      {selectedClassId && (
        <section className="mb-4 sm:mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-[1200px]">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  {selectedStudent?.user.name} · {selectedYear}년 {selectedMonth}
                  월 시험 성적
                </h2>
                <select
                  value={sortOption}
                  onChange={e =>
                    setSortOption(e.target.value as MyExamGradesSort)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
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
                          평균점수
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
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            시험 성적을 불러오는 중...
                          </td>
                        </tr>
                      ) : filteredGrades.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            {selectedYear}년 {selectedMonth}월에 시험 기록이
                            없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredGrades.map(exam => (
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
                            <td className="px-4 py-3 text-right text-sm text-slate-700">
                              {exam.studentAverage != null &&
                              exam.studentAverage !== ''
                                ? `${exam.studentAverage}점`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                              {exam.grades?.[0]?.score != null
                                ? `${exam.grades[0].score}점`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRankClick(exam.examId, exam.examTitle)
                                }
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

      {selectedStudentId && !selectedClassId && !isLoadingClasses && classes.length > 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
          <p className="text-sm text-slate-500">
            클래스를 선택하면 해당 자녀의 시험 성적을 볼 수 있습니다.
          </p>
        </div>
      )}

      {/* 등수 조회 모달 */}
      {rankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                자녀 등수 조회
                {rankModalData?.examTitle && (
                  <span className="ml-2 text-sm font-normal text-slate-600">
                    ({rankModalData.examTitle})
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setRankModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {rankModalLoading ? (
              <p className="py-6 text-center text-sm text-slate-500">
                등수를 불러오는 중...
              </p>
            ) : !rankModalData?.rankList?.length ? (
              <p className="py-6 text-center text-sm text-slate-500">
                등수 정보가 없습니다.
              </p>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                        등수
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                        점수
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                        이름
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankModalData.rankList.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-slate-100 ${
                          item.isMe ? 'bg-[#084773]/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-sm text-slate-900">
                          {item.ranking}등
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-900">
                          {item.score}점
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-900">
                          {item.name ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setRankModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentGradesPage;
