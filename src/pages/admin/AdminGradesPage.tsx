import { useState } from 'react';
import { X, Plus, UserPlus, UserMinus } from 'lucide-react';
import MainLayout from '../MainLayout';
import { examRecords, students } from '../../data/gradesData';
import type { ExamRecord, GradeLevel } from '../../data/gradesData';

// 등급 계산 함수
function calculateGrade(score: number): GradeLevel {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function AdminGradesPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // 기본값: 2월
  const [selectedExam, setSelectedExam] = useState<{
    date: string;
    dateFormatted: string;
    records: ExamRecord[];
    averageScore: number;
    totalStudents: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [examRecordsState, setExamRecordsState] = useState<ExamRecord[]>(examRecords);
  
  // 새 시험 추가 폼
  const [newExam, setNewExam] = useState({
    date: '',
    students: [] as { studentId: number; score: number }[],
  });

  // 학생 추가 폼
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    score: '',
  });

  // 고유한 시험 날짜 목록 추출
  const uniqueExamDates = Array.from(
    new Set(examRecordsState.map(record => record.date))
  ).sort();

  // 날짜별로 그룹화된 시험 기록
  const allExamsByDate = uniqueExamDates.map(date => {
    const records = examRecordsState.filter(record => record.date === date);
    const dateObj = new Date(date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
    
    return {
      date,
      dateFormatted,
      records,
      averageScore: Math.round(
        (records.reduce((sum, r) => sum + r.score, 0) / records.length) * 10
      ) / 10,
      totalStudents: records.length,
    };
  });

  // 선택된 월에 해당하는 시험만 필터링하고 최신순에서 오래된 순으로 정렬
  const filteredExams = allExamsByDate
    .filter(exam => {
      const examDate = new Date(exam.date);
      return examDate.getMonth() + 1 === selectedMonth && examDate.getFullYear() === 2026;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 최신순에서 오래된 순

  const handleExamClick = (exam: typeof allExamsByDate[0]) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleAddExam = () => {
    // 선택된 월의 첫 번째 날짜를 기본값으로 설정
    const year = 2026;
    const month = selectedMonth;
    const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`;
    setNewExam({ date: defaultDate, students: [] });
    setIsAddExamModalOpen(true);
  };

  const handleSaveExam = () => {
    if (!newExam.date) {
      alert('날짜를 선택해주세요.');
      return;
    }
    if (newExam.students.length === 0) {
      alert('최소 한 명의 학생을 추가해주세요.');
      return;
    }

    const dateObj = new Date(newExam.date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;

    const newRecords: ExamRecord[] = newExam.students.map(({ studentId, score }) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return null as any;

      // 해당 학생의 기존 기록들로 누적 평균 계산
      const existingRecords = examRecordsState.filter(r => r.studentId === studentId);
      const cumulativeSum = existingRecords.reduce((sum, r) => sum + r.score, 0) + score;
      const average = Math.round((cumulativeSum / (existingRecords.length + 1)) * 10) / 10;

      return {
        studentId,
        studentName: student.name,
        date: newExam.date,
        dateFormatted,
        score,
        average,
        grade: calculateGrade(score),
        targetScore: student.targetScore,
        differenceFromTarget: score - student.targetScore,
      };
    }).filter(Boolean);

    setExamRecordsState(prev => [...prev, ...newRecords]);
    setNewExam({ date: '', students: [] });
    setIsAddExamModalOpen(false);
  };

  const handleAddAllStudents = () => {
    const allStudentIds = students.map(s => s.id);
    const existingStudentIds = newExam.students.map(s => s.studentId);
    const studentsToAdd = allStudentIds.filter(id => !existingStudentIds.includes(id));
    
    const newStudents = studentsToAdd.map(studentId => ({
      studentId,
      score: 0,
    }));

    setNewExam(prev => ({
      ...prev,
      students: [...prev.students, ...newStudents],
    }));
  };

  const handleAddStudentToExam = () => {
    if (!newStudent.studentId || !newStudent.score) {
      alert('학생과 점수를 모두 입력해주세요.');
      return;
    }

    const studentId = Number(newStudent.studentId);
    const score = Number(newStudent.score);

    if (isNaN(studentId) || isNaN(score) || score < 0 || score > 100) {
      alert('올바른 점수를 입력해주세요. (0-100)');
      return;
    }

    if (newExam.students.some(s => s.studentId === studentId)) {
      alert('이미 추가된 학생입니다.');
      return;
    }

    setNewExam(prev => ({
      ...prev,
      students: [...prev.students, { studentId, score }],
    }));

    setNewStudent({ studentId: '', score: '' });
  };

  const handleRemoveStudentFromExam = (studentId: number) => {
    setNewExam(prev => ({
      ...prev,
      students: prev.students.filter(s => s.studentId !== studentId),
    }));
  };

  const handleAddStudentToDetail = () => {
    if (!selectedExam) return;
    setIsAddStudentModalOpen(true);
  };

  const handleSaveStudentToDetail = () => {
    if (!selectedExam || !newStudent.studentId || !newStudent.score) {
      alert('학생과 점수를 모두 입력해주세요.');
      return;
    }

    const studentId = Number(newStudent.studentId);
    const score = Number(newStudent.score);

    if (isNaN(studentId) || isNaN(score) || score < 0 || score > 100) {
      alert('올바른 점수를 입력해주세요. (0-100)');
      return;
    }

    if (selectedExam.records.some(r => r.studentId === studentId)) {
      alert('이미 추가된 학생입니다.');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const dateObj = new Date(selectedExam.date);
    const dateFormatted = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;

    // 해당 학생의 기존 기록들로 누적 평균 계산
    const existingRecords = examRecordsState.filter(r => r.studentId === studentId);
    const cumulativeSum = existingRecords.reduce((sum, r) => sum + r.score, 0) + score;
    const average = Math.round((cumulativeSum / (existingRecords.length + 1)) * 10) / 10;

    const newRecord: ExamRecord = {
      studentId,
      studentName: student.name,
      date: selectedExam.date,
      dateFormatted,
      score,
      average,
      grade: calculateGrade(score),
      targetScore: student.targetScore,
      differenceFromTarget: score - student.targetScore,
    };

    setExamRecordsState(prev => [...prev, newRecord]);
    
    // 모달의 selectedExam 업데이트
    setSelectedExam(prev => {
      if (!prev) return null;
      const updatedRecords = [...prev.records, newRecord];
      const averageScore = Math.round(
        (updatedRecords.reduce((sum, r) => sum + r.score, 0) / updatedRecords.length) * 10
      ) / 10;
      return {
        ...prev,
        records: updatedRecords,
        averageScore,
        totalStudents: updatedRecords.length,
      };
    });

    setNewStudent({ studentId: '', score: '' });
    setIsAddStudentModalOpen(false);
  };

  const handleRemoveStudentFromDetail = (studentId: number) => {
    if (!selectedExam) return;

    setExamRecordsState(prev => prev.filter(r => !(r.date === selectedExam.date && r.studentId === studentId)));
    
    // 모달의 selectedExam 업데이트
    setSelectedExam(prev => {
      if (!prev) return null;
      const updatedRecords = prev.records.filter(r => r.studentId !== studentId);
      if (updatedRecords.length === 0) {
        setIsModalOpen(false);
        return null;
      }
      const averageScore = Math.round(
        (updatedRecords.reduce((sum, r) => sum + r.score, 0) / updatedRecords.length) * 10
      ) / 10;
      return {
        ...prev,
        records: updatedRecords,
        averageScore,
        totalStudents: updatedRecords.length,
      };
    });
  };

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">성적 관리</h1>
          <p className="mt-1 text-sm text-slate-600">
            시험 목록을 확인하고 관리할 수 있습니다.
          </p>
        </div>
      </header>

      {/* 년도 및 월 선택 */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-4">
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
          <button
            type="button"
            onClick={handleAddExam}
            className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] mt-3 sm:mt-0"
          >
            <Plus className="h-4 w-4" />
            시험 추가
          </button>
        </div>
      </div>

      {/* 시험 목록 테이블 */}
      <section className="mb-4 sm:mb-6">
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">
          시험 목록
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-[600px] sm:min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                      날짜
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                      평균 점수
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                      참여 학생
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-xs sm:text-sm text-slate-500"
                      >
                        {selectedMonth}월에 시험 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map(exam => (
                      <tr
                        key={exam.date}
                        onClick={() => handleExamClick(exam)}
                        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                          {exam.dateFormatted}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                          {exam.averageScore}점
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                          {exam.totalStudents}명
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 시험 추가 모달 */}
      {isAddExamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsAddExamModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddExamModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">시험 추가</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  날짜
                </label>
                <input
                  type="date"
                  value={newExam.date}
                  onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    학생 추가
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAllStudents}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <UserPlus className="h-3 w-3" />
                    현재 학생 모두 추가
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={newStudent.studentId}
                    onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  >
                    <option value="">학생 선택</option>
                    {students
                      .filter(s => !newExam.students.some(es => es.studentId === s.id))
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    value={newStudent.score}
                    onChange={e => setNewStudent({ ...newStudent, score: e.target.value })}
                    placeholder="점수"
                    min="0"
                    max="100"
                    className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                  <button
                    type="button"
                    onClick={handleAddStudentToExam}
                    className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                  >
                    추가
                  </button>
                </div>
              </div>

              {newExam.students.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">추가된 학생 목록</h3>
                  <div className="space-y-2">
                    {newExam.students.map(({ studentId, score }, index) => {
                      const student = students.find(s => s.id === studentId);
                      return (
                        <div
                          key={studentId}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2"
                        >
                          <span className="text-sm font-medium text-slate-900 flex-shrink-0">
                            {student?.name}
                          </span>
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <input
                              type="number"
                              value={score}
                              onChange={e => {
                                const newScore = Number(e.target.value);
                                if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                                  const updatedStudents = [...newExam.students];
                                  updatedStudents[index] = { ...updatedStudents[index], score: newScore };
                                  setNewExam({ ...newExam, students: updatedStudents });
                                }
                              }}
                              min="0"
                              max="100"
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                            />
                            <span className="text-sm text-slate-600">점</span>
                            <span className="text-sm text-slate-500 ml-6">
                              {studentId <= 3 
                                ? ['010-1111-2222', '010-3333-4444', '010-5555-6666'][studentId - 1]
                                : `010-${String(studentId).padStart(4, '0')}-${String(studentId * 1111).slice(-4)}`
                              }
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudentFromExam(studentId)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 flex-shrink-0"
                          >
                            제거
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddExamModalOpen(false);
                  setNewExam({ date: '', students: [] });
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              {selectedExam.dateFormatted} 시험 상세
            </h2>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>평균 점수: {selectedExam.averageScore}점</span>
                <span>참여 학생: {selectedExam.totalStudents}명</span>
              </div>
              <button
                type="button"
                onClick={handleAddStudentToDetail}
                className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                <UserPlus className="h-4 w-4" />
                학생 추가
              </button>
            </div>

            {/* 학생별 성적 테이블 */}
            <div className="overflow-x-auto rounded-xl bg-white border border-slate-200">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      학생명
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      점수
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      등급
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExam.records
                    .sort((a, b) => b.score - a.score)
                    .map((record, index) => {
                      const phoneNumber = record.studentId <= 3 
                        ? ['010-1111-2222', '010-3333-4444', '010-5555-6666'][record.studentId - 1]
                        : `010-${String(record.studentId).padStart(4, '0')}-${String(record.studentId * 1111).slice(-4)}`;
                      
                      return (
                        <tr
                          key={`${record.studentId}-${record.date}`}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {record.studentName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={record.score}
                                onChange={e => {
                                  const newScore = Number(e.target.value);
                                  if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                                    const updatedRecords = [...selectedExam.records];
                                    updatedRecords[index] = {
                                      ...updatedRecords[index],
                                      score: newScore,
                                      grade: calculateGrade(newScore),
                                    };
                                    const averageScore = Math.round(
                                      (updatedRecords.reduce((sum, r) => sum + r.score, 0) / updatedRecords.length) * 10
                                    ) / 10;
                                    setSelectedExam({
                                      ...selectedExam,
                                      records: updatedRecords,
                                      averageScore,
                                    });
                                    // examRecordsState도 업데이트
                                    setExamRecordsState(prev => 
                                      prev.map(r => 
                                        r.date === selectedExam.date && r.studentId === record.studentId
                                          ? { ...r, score: newScore, grade: calculateGrade(newScore) }
                                          : r
                                      )
                                    );
                                  }
                                }}
                                min="0"
                                max="100"
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                              />
                              <span className="text-sm text-slate-900 font-medium">점</span>
                              <span className="text-sm text-slate-500 ml-6">{phoneNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                record.grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : record.grade === 'B'
                                  ? 'bg-blue-100 text-blue-700'
                                  : record.grade === 'C'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : record.grade === 'D'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {record.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveStudentFromDetail(record.studentId);
                                }}
                                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                              >
                                <UserMinus className="h-3 w-3" />
                                학생 빼기
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 학생 추가 모달 (상세 모달에서) */}
      {isAddStudentModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsAddStudentModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddStudentModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-slate-900">학생 추가</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학생 선택
                </label>
                <select
                  value={newStudent.studentId}
                  onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                >
                  <option value="">학생 선택</option>
                  {students
                    .filter(s => !selectedExam?.records.some(r => r.studentId === s.id))
                    .map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  점수
                </label>
                <input
                  type="number"
                  value={newStudent.score}
                  onChange={e => setNewStudent({ ...newStudent, score: e.target.value })}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  setNewStudent({ studentId: '', score: '' });
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveStudentToDetail}
                className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminGradesPage;
