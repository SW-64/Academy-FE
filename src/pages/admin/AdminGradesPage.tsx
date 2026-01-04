import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ChevronDown } from 'lucide-react';
import MainLayout from '../MainLayout';
import { examRecords } from '../../data/gradesData';
import type { ExamRecord } from '../../data/gradesData';

type SortOption = 'latest' | 'avgScore';

// 더미 클래스 데이터
const dummyClasses = [
  { id: 1, name: '예비고2 월금 정규반' },
  { id: 2, name: '예비고2 화목 정규반' },
  { id: 3, name: '미적분1 기본 특강반' },
  { id: 4, name: '미적분1+2 통합 특강반' },
];

function AdminGradesPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // 기본값: 2월
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [showCalendar, setShowCalendar] = useState(false);
  const [useMonthDropdown, setUseMonthDropdown] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<{
    date: string;
    dateFormatted: string;
    name: string;
    records: ExamRecord[];
    averageScore: number;
    totalStudents: number;
    questions?: {
      questionNumber: number;
      points: number;
      errorRate?: number;
    }[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [examRecordsState, setExamRecordsState] =
    useState<ExamRecord[]>(examRecords);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editExamName, setEditExamName] = useState('');
  const [editQuestions, setEditQuestions] = useState<
    { questionNumber: number; points: number; errorRate?: number }[]
  >([]);

  // 새 시험 추가 폼
  const [newExam, setNewExam] = useState({
    name: '',
    date: '',
    questions: [] as { questionNumber: number; points: number }[],
  });

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
      setUseMonthDropdown(window.innerWidth <= 500);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
    };

    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthDropdownOpen]);

  // 고유한 시험 날짜 목록 추출
  const uniqueExamDates = Array.from(
    new Set(examRecordsState.map(record => record.date))
  ).sort();

  // 날짜별로 그룹화된 시험 기록
  const allExamsByDate = uniqueExamDates.map(date => {
    const records = examRecordsState.filter(record => record.date === date);
    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;

    return {
      date,
      dateFormatted,
      name: `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 시험`, // 기본 시험 이름
      records,
      averageScore:
        Math.round(
          (records.reduce((sum, r) => sum + r.score, 0) / records.length) * 10
        ) / 10,
      totalStudents: records.length,
    };
  });

  // 선택된 월에 해당하는 시험만 필터링
  const filteredExams = allExamsByDate
    .filter(exam => {
      const examDate = new Date(exam.date);
      return (
        examDate.getMonth() + 1 === selectedMonth &&
        examDate.getFullYear() === 2026
      );
    })
    .sort((a, b) => {
      if (sortOption === 'latest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.averageScore - a.averageScore;
      }
    });

  const handleExamClick = (exam: (typeof allExamsByDate)[0]) => {
    // 시험 추가에서 설정한 문항 정보를 가져옴 (임시로 더미 데이터 사용)
    // 실제로는 시험 저장 시 questions 정보도 함께 저장되어야 함
    const examQuestions = [
      { questionNumber: 1, points: 5, errorRate: undefined },
      { questionNumber: 2, points: 5, errorRate: undefined },
      { questionNumber: 3, points: 10, errorRate: undefined },
    ];

    setSelectedExam({
      ...exam,
      questions: examQuestions,
    });
    setEditDate(exam.date);
    setEditExamName(exam.name);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleGenerateAverageForDetail = () => {
    if (!selectedExam) return;
    const averageScore =
      Math.round(
        (selectedExam.records.reduce((sum, r) => sum + r.score, 0) /
          selectedExam.records.length) *
          10
      ) / 10;
    setSelectedExam({
      ...selectedExam,
      averageScore,
    });
    // eslint-disable-next-line no-alert
    alert(`평균 점수가 ${averageScore}점으로 계산되었습니다.`);
  };

  const handleSaveEdit = () => {
    if (!selectedExam) return;

    if (!editExamName.trim()) {
      alert('시험 이름을 입력해주세요.');
      return;
    }

    // 날짜 변경 시 examRecordsState 업데이트
    if (editDate !== selectedExam.date) {
      setExamRecordsState(prev =>
        prev.map(r =>
          r.date === selectedExam.date ? { ...r, date: editDate } : r
        )
      );
    }

    // selectedExam 업데이트
    const dateObj = new Date(editDate);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(dateObj.getDate()).padStart(2, '0')}`;

    setSelectedExam({
      ...selectedExam,
      name: editExamName,
      date: editDate,
      dateFormatted,
    });

    setIsEditMode(false);
    // eslint-disable-next-line no-alert
    alert('수정이 완료되었습니다.');
  };

  const handleDeleteExam = () => {
    if (!selectedExam) return;
    if (!confirm('정말 이 시험을 삭제하시겠습니까?')) return;

    // examRecordsState에서 해당 날짜의 모든 기록 삭제
    setExamRecordsState(prev => prev.filter(r => r.date !== selectedExam.date));

    setIsModalOpen(false);
    setSelectedExam(null);
    // eslint-disable-next-line no-alert
    alert('시험이 삭제되었습니다.');
  };

  const handleAddExam = () => {
    const year = 2026;
    const month = selectedMonth;
    const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`;
    setNewExam({ name: '', date: defaultDate, questions: [] });
    setIsAddExamModalOpen(true);
  };

  const handleSaveExam = () => {
    if (!newExam.name) {
      alert('시험 이름을 입력해주세요.');
      return;
    }
    if (!newExam.date) {
      alert('날짜를 선택해주세요.');
      return;
    }
    if (newExam.questions.length === 0) {
      alert('최소 한 개의 문항을 추가해주세요.');
      return;
    }

    // 시험 저장 로직 (나중에 API로 교체)
    alert('시험이 추가되었습니다.');
    setNewExam({ name: '', date: '', questions: [] });
    setIsAddExamModalOpen(false);
  };

  const handleAddQuestion = () => {
    const nextQuestionNumber = newExam.questions.length + 1;
    setNewExam(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionNumber: nextQuestionNumber, points: 0 },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setNewExam(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateErrorRate = () => {
    // 오답률 생성 로직 (나중에 API로 교체)
    alert('오답률이 생성되었습니다.');
  };

  ``;
  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">시험 관리</h1>
        </div>
        {selectedClassId && (
          <>
            <button
              type="button"
              onClick={() => setSelectedClassId(null)}
              className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← 클래스 선택으로 돌아가기
            </button>
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {dummyClasses.find(c => c.id === selectedClassId)?.name}
              </h2>
            </div>
          </>
        )}
      </header>

      {/* 클래스 선택 */}
      {!selectedClassId && (
        <section className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            클래스 선택
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dummyClasses.map(classItem => (
              <button
                key={classItem.id}
                type="button"
                onClick={() => setSelectedClassId(classItem.id)}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md text-left"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {classItem.name}
                </h3>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 클래스 선택 시 표시되는 내용 */}
      {selectedClassId && (
        <>
          {/* 년도 및 월 선택 */}
          <div className="mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-base sm:text-lg font-semibold text-slate-900">
                  2026년
                </span>
                {useMonthDropdown ? (
                  <div className="relative" ref={monthDropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setIsMonthDropdownOpen(!isMonthDropdownOpen)
                      }
                      className="flex w-17 items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    >
                      <span>{selectedMonth}월</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isMonthDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isMonthDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-17 rounded-xl border border-slate-300 bg-white shadow-lg">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          month => (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                setSelectedMonth(month);
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                                selectedMonth === month
                                  ? 'bg-[#084773] text-white'
                                  : 'text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {month}월
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 1260px 이하: 2줄 배치 (1~6월, 7~12월) */}
                    <div className="min-[1261px]:hidden flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {Array.from({ length: 6 }, (_, i) => i + 1).map(
                          month => (
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
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {Array.from({ length: 6 }, (_, i) => i + 7).map(
                          month => (
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
                          )
                        )}
                      </div>
                    </div>
                    {/* 1261px 이상: 1줄 배치 */}
                    <div className="hidden min-[1261px]:flex flex-wrap gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        month => (
                          <button
                            key={month}
                            type="button"
                            onClick={() => setSelectedMonth(month)}
                            className={`rounded-lg ${
                              month >= 10 ? 'px-3' : 'px-4'
                            } py-2 text-sm font-medium transition-colors ${
                              selectedMonth === month
                                ? 'bg-[#084773] text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                            }`}
                          >
                            {month}월
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddExam}
                className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                시험 추가
              </button>
            </div>
          </div>
        </>
      )}

      {/* 시험 목록 테이블 - 클래스 선택 시에만 표시 */}
      {selectedClassId && (
        <section className="mb-4 sm:mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-[1200px]">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  시험 목록
                </h2>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as SortOption)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773] bg-white"
                >
                  <option value="latest">최신순</option>
                  <option value="avgScore">평균점수 높은순</option>
                </select>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white">
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">
                          회차
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                          평균 점수
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            {selectedMonth}월에 시험 기록이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredExams.map(exam => (
                          <tr
                            key={exam.date}
                            className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {exam.name}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                              {exam.averageScore}점
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleExamClick(exam)}
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                  시험 상세
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/grades/${exam.date}`)
                                  }
                                  className="rounded-lg bg-[#084773] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#063a5a]"
                                >
                                  성적 상세
                                </button>
                              </div>
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
      {/* 시험 추가 모달 */}
      {isAddExamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddExamModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 flex-shrink-0 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">
                시험 추가
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    시험 이름 (회차)
                  </label>
                  <input
                    type="text"
                    value={newExam.name}
                    onChange={e =>
                      setNewExam({ ...newExam, name: e.target.value })
                    }
                    placeholder="예: 1회차 모의고사"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={newExam.date}
                    onChange={e =>
                      setNewExam({ ...newExam, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      문항 관리
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1 rounded-lg bg-[#084773] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#063a5a]"
                    >
                      <Plus className="h-3 w-3" />
                      문항 추가
                    </button>
                  </div>

                  {newExam.questions.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                              문항번호
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                              배점
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                              작업
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {newExam.questions.map((question, index) => (
                            <tr
                              key={index}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={question.questionNumber}
                                  readOnly
                                  disabled
                                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-600 cursor-not-allowed"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={question.points}
                                  onChange={e => {
                                    const updatedQuestions = [
                                      ...newExam.questions,
                                    ];
                                    updatedQuestions[index] = {
                                      ...updatedQuestions[index],
                                      points: Number(e.target.value),
                                    };
                                    setNewExam({
                                      ...newExam,
                                      questions: updatedQuestions,
                                    });
                                  }}
                                  min="0"
                                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(index)}
                                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                >
                                  삭제
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      문항이 없습니다. 문항을 추가해주세요.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="p-6 border-t border-slate-200 bg-white flex-shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddExamModalOpen(false);
                  setNewExam({ name: '', date: '', questions: [] });
                }}
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveExam}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 상세 모달 */}
      {isModalOpen && selectedExam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 flex-shrink-0 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                시험 상세
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 w-24">
                    시험 이름:
                  </label>
                  <input
                    type="text"
                    value={isEditMode ? editExamName : selectedExam.name}
                    onChange={e => {
                      if (isEditMode) {
                        setEditExamName(e.target.value);
                      } else {
                        setEditExamName(e.target.value);
                        setIsEditMode(true);
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 w-24">
                    날짜:
                  </label>
                  <input
                    type="date"
                    value={isEditMode ? editDate : selectedExam.date}
                    onChange={e => {
                      if (isEditMode) {
                        setEditDate(e.target.value);
                      } else {
                        setEditDate(e.target.value);
                        setIsEditMode(true);
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 w-24">
                    평균 점수:
                  </label>
                  <span className="text-sm text-slate-900">
                    {selectedExam.averageScore}점
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* 문항, 배점, 오답률 테이블 */}
              {selectedExam.questions && selectedExam.questions.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          문항
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          배점
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          오답률
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isEditMode
                        ? editQuestions
                        : selectedExam.questions
                      ).map((question, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={question.questionNumber}
                                onChange={e => {
                                  const updatedQuestions = [...editQuestions];
                                  updatedQuestions[index] = {
                                    ...updatedQuestions[index],
                                    questionNumber: Number(e.target.value),
                                  };
                                  setEditQuestions(updatedQuestions);
                                }}
                                min="1"
                                className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                              />
                            ) : (
                              <span className="text-sm text-slate-900">
                                {question.questionNumber}번
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={question.points}
                                onChange={e => {
                                  const updatedQuestions = [...editQuestions];
                                  updatedQuestions[index] = {
                                    ...updatedQuestions[index],
                                    points: Number(e.target.value),
                                  };
                                  setEditQuestions(updatedQuestions);
                                }}
                                min="0"
                                className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                              />
                            ) : (
                              <span className="text-sm text-slate-900">
                                {question.points}점
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-900">
                              {question.errorRate !== undefined
                                ? `${question.errorRate}%`
                                : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  문항이 없습니다. 시험 추가에서 문항을 설정해주세요.
                </div>
              )}
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="p-6 border-t border-slate-200 bg-white flex-shrink-0 flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleGenerateErrorRate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  오답률 생성
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAverageForDetail}
                  className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                >
                  평균 점수 생성
                </button>
              </div>
              <div className="flex gap-3">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDate(selectedExam.date);
                        setEditExamName(selectedExam.name);
                        setEditQuestions(
                          selectedExam.questions
                            ? [...selectedExam.questions]
                            : []
                        );
                        setIsEditMode(false);
                      }}
                      className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDate(selectedExam.date);
                        setEditExamName(selectedExam.name);
                        setEditQuestions(
                          selectedExam.questions
                            ? [...selectedExam.questions]
                            : []
                        );
                        setIsEditMode(true);
                      }}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteExam}
                      className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminGradesPage;
