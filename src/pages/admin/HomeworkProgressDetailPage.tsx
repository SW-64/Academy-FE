import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../MainLayout';
import { initialTextbooks } from './AdminHomeworkPage';

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  studentIds: number[];
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

type Textbook = {
  id: number;
  name: string;
  grade: string;
  classId: number;
  className: string;
  majorUnitCount: number;
  minorUnitCount: number;
  subUnits: Array<{
    id: string;
    name: string;
    subUnitCount: number;
  }>;
};

type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

type StudentProgress = {
  studentId: number;
  textbookId: number;
  majorUnit: number;
  minorUnit: number;
  status: ProgressStatus;
  progress: number; // 0-100%
};

// 더미 클래스 데이터
const dummyClasses: ClassType[] = [
  {
    id: 1,
    name: '예비고2 월금 정규반',
    studentCount: 15,
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: 2,
    name: '예비고2 화목 정규반',
    studentCount: 12,
    studentIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
  },
  {
    id: 3,
    name: '미적분1 기본 특강반',
    studentCount: 20,
    studentIds: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  },
  {
    id: 4,
    name: '미적분1+2 통합 특강반',
    studentCount: 18,
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  },
];

// 더미 학생 데이터
const dummyStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `학생${i + 1}`,
  email: `student${i + 1}@example.com`,
  phone: `010-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(
    4,
    '0'
  )}`,
  school: [
    '서울고등학교',
    '부산고등학교',
    '대전고등학교',
    '인천고등학교',
    '광주고등학교',
  ][i % 5],
  grade: `${(i % 3) + 1}학년`,
}));

function HomeworkProgressDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [selectedTextbookId, setSelectedTextbookId] = useState<number | null>(
    null
  );
  const [studentProgresses, setStudentProgresses] = useState<StudentProgress[]>(
    []
  );
  const [editingCell, setEditingCell] = useState<{
    studentId: number;
    majorUnit: number;
    minorUnit: number;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const classIdNum = classId ? parseInt(classId, 10) : null;

  // 선택된 클래스의 학생 목록
  const selectedClass = dummyClasses.find(c => c.id === classIdNum);
  const students = selectedClass
    ? dummyStudents.filter(s => selectedClass.studentIds.includes(s.id))
    : [];

  // 선택된 클래스에 해당하는 교재 목록
  const classTextbooks: Textbook[] = classIdNum
    ? initialTextbooks.filter(t => t.classId === classIdNum)
    : [];

  // 선택된 교재 정보
  const displayedTextbook = classTextbooks.find(
    t => t.id === selectedTextbookId
  );

  // 대단원-소단원 헤더 생성
  const generateUnitHeaders = (textbook: Textbook) => {
    const headers: Array<{
      majorUnit: number;
      minorUnit: number;
      label: string;
    }> = [];

    for (let majorUnit = 1; majorUnit <= textbook.majorUnitCount; majorUnit++) {
      for (
        let minorUnit = 1;
        minorUnit <= textbook.minorUnitCount;
        minorUnit++
      ) {
        headers.push({
          majorUnit,
          minorUnit,
          label: `${majorUnit}-${minorUnit}`,
        });
      }
    }

    return headers;
  };

  // 대단원 헤더 생성 (colspan 포함)
  const generateMajorUnitHeaders = (textbook: Textbook) => {
    const headers: Array<{
      majorUnit: number;
      colspan: number;
    }> = [];

    for (let majorUnit = 1; majorUnit <= textbook.majorUnitCount; majorUnit++) {
      headers.push({
        majorUnit,
        colspan: textbook.minorUnitCount,
      });
    }

    return headers;
  };

  // 학생별 진도 정보 가져오기
  const getProgress = (
    studentId: number,
    majorUnit: number,
    minorUnit: number
  ): StudentProgress | null => {
    return (
      studentProgresses.find(
        p =>
          p.studentId === studentId &&
          p.textbookId === selectedTextbookId &&
          p.majorUnit === majorUnit &&
          p.minorUnit === minorUnit
      ) || null
    );
  };

  // 진도 업데이트
  const updateProgress = (
    studentId: number,
    majorUnit: number,
    minorUnit: number,
    status: ProgressStatus,
    progress: number
  ) => {
    if (!selectedTextbookId) return;

    const existingIndex = studentProgresses.findIndex(
      p =>
        p.studentId === studentId &&
        p.textbookId === selectedTextbookId &&
        p.majorUnit === majorUnit &&
        p.minorUnit === minorUnit
    );

    const newProgress: StudentProgress = {
      studentId,
      textbookId: selectedTextbookId,
      majorUnit,
      minorUnit,
      status,
      progress,
    };

    if (existingIndex >= 0) {
      const updated = [...studentProgresses];
      updated[existingIndex] = newProgress;
      setStudentProgresses(updated);
    } else {
      setStudentProgresses([...studentProgresses, newProgress]);
    }
  };

  // 상태 변경
  const handleStatusChange = (
    studentId: number,
    majorUnit: number,
    minorUnit: number,
    newStatus: ProgressStatus
  ) => {
    const progress =
      newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0;
    updateProgress(studentId, majorUnit, minorUnit, newStatus, progress);
  };

  // 슬라이더 값 변경
  const handleSliderChange = (
    studentId: number,
    majorUnit: number,
    minorUnit: number,
    value: number
  ) => {
    const status: ProgressStatus =
      value === 100 ? 'completed' : value > 0 ? 'in-progress' : 'not-started';
    updateProgress(studentId, majorUnit, minorUnit, status, value);
  };

  // 수기 입력 처리
  const handleManualInput = (
    studentId: number,
    majorUnit: number,
    minorUnit: number,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const status: ProgressStatus =
        numValue === 100
          ? 'completed'
          : numValue > 0
          ? 'in-progress'
          : 'not-started';
      updateProgress(studentId, majorUnit, minorUnit, status, numValue);
    }
  };

  // 상태별 색상
  const getStatusColor = (status: ProgressStatus, progress: number) => {
    if (status === 'completed') return 'bg-green-100 border-green-300';
    if (status === 'in-progress') {
      // 진행률에 따라 색상 변화
      if (progress <= 30) return 'bg-yellow-100 border-yellow-300';
      if (progress <= 60) return 'bg-orange-100 border-orange-300';
      return 'bg-red-100 border-red-300';
    }
    return 'bg-slate-100 border-slate-300';
  };

  // 클래스가 없으면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!classIdNum || !selectedClass) {
      navigate('/admin/homework-progress');
    }
  }, [classIdNum, selectedClass, navigate]);

  if (!classIdNum || !selectedClass) {
    return null;
  }

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-[95%] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/homework-progress')}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">
            {selectedClass.name} - 숙제 진도
          </h1>
        </div>

        {/* 교재 선택 */}
        {classTextbooks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-900">
                교재 선택
              </label>
              {selectedTextbookId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setEditingCell(null);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isEditMode
                      ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                      : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isEditMode ? '수정 완료' : '수정'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {classTextbooks.map(textbook => (
                <button
                  key={textbook.id}
                  type="button"
                  onClick={() => {
                    if (selectedTextbookId !== textbook.id) {
                      setSelectedTextbookId(textbook.id);
                      setEditingCell(null);
                      setIsEditMode(false);
                    }
                  }}
                  disabled={selectedTextbookId === textbook.id}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTextbookId === textbook.id
                      ? 'border-[#084773] bg-[#084773] text-white cursor-not-allowed opacity-60'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {textbook.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 표 표시 */}
        {displayedTextbook && students.length > 0 && (
          <div className={`rounded-lg border-2 overflow-hidden transition-all ${
            isEditMode 
              ? 'border-blue-400 bg-blue-50/20 shadow-lg' 
              : 'border-slate-400 bg-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  {/* 첫 번째 행: 대단원 헤더 */}
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <th
                      rowSpan={2}
                      className="border-r border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10"
                    >
                      학생 이름
                    </th>
                    {generateMajorUnitHeaders(displayedTextbook).map(header => (
                      <th
                        key={header.majorUnit}
                        colSpan={header.colspan}
                        className="border-r border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-900"
                      >
                        {header.majorUnit}단원
                      </th>
                    ))}
                  </tr>
                  {/* 두 번째 행: 소단원 헤더 */}
                  <tr className="border-b-2 border-slate-400 bg-slate-50">
                    {generateUnitHeaders(displayedTextbook).map(header => (
                      <th
                        key={`${header.majorUnit}-${header.minorUnit}`}
                        className="border-r border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700"
                        style={{
                          width: '80px',
                          minWidth: '80px',
                          maxWidth: '80px',
                        }}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-300 hover:bg-slate-50"
                    >
                      <td
                        className="border-r border-slate-300 px-3 py-2 text-center text-sm text-slate-900 whitespace-nowrap sticky left-0 bg-white z-10"
                        style={{
                          width: '100px',
                          minWidth: '100px',
                          maxWidth: '100px',
                          height: '60px',
                          minHeight: '60px',
                        }}
                      >
                        {student.name}
                      </td>
                      {generateUnitHeaders(displayedTextbook).map(header => {
                        const progress = getProgress(
                          student.id,
                          header.majorUnit,
                          header.minorUnit
                        );
                        const status = progress?.status || 'not-started';
                        const progressValue = progress?.progress || 0;
                        const isEditing =
                          editingCell?.studentId === student.id &&
                          editingCell?.majorUnit === header.majorUnit &&
                          editingCell?.minorUnit === header.minorUnit;

                        return (
                          <td
                            key={`${header.majorUnit}-${header.minorUnit}`}
                            className={`border-r border-slate-300 px-2 py-2 text-center text-sm relative group ${getStatusColor(
                              status,
                              progressValue
                            )}`}
                            style={{
                              width: '80px',
                              minWidth: '80px',
                              maxWidth: '80px',
                              height: '60px',
                              minHeight: '60px',
                            }}
                            onDoubleClick={() => {
                              if (isEditMode) {
                                setEditingCell({
                                  studentId: student.id,
                                  majorUnit: header.majorUnit,
                                  minorUnit: header.minorUnit,
                                });
                              }
                            }}
                          >
                            {isEditing ? (
                              <div className="absolute top-0 left-0 z-50 p-4 space-y-3 w-[280px] bg-white rounded-lg border-2 border-blue-500 shadow-xl">
                                {/* 슬라이더 */}
                                <div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progressValue}
                                    onChange={e =>
                                      handleSliderChange(
                                        student.id,
                                        header.majorUnit,
                                        header.minorUnit,
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
                                  />
                                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                    <span>0%</span>
                                    <span className="font-medium">
                                      {progressValue}%
                                    </span>
                                    <span>100%</span>
                                  </div>
                                </div>
                                {/* 수기 입력 */}
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={progressValue}
                                  onChange={e =>
                                    handleManualInput(
                                      student.id,
                                      header.majorUnit,
                                      header.minorUnit,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#084773]"
                                  placeholder="0-100"
                                />
                                {/* 상태 버튼 */}
                                <div className="flex gap-1">
                                    <button
                                    type="button"
                                    onClick={() => {
                                      handleStatusChange(
                                        student.id,
                                        header.majorUnit,
                                        header.minorUnit,
                                        'not-started'
                                      );
                                      setEditingCell(null);
                                    }}
                                    className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium ${
                                      status === 'not-started'
                                        ? 'bg-slate-100 border-slate-400 text-slate-700'
                                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    미시작
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStatusChange(
                                        student.id,
                                        header.majorUnit,
                                        header.minorUnit,
                                        'in-progress'
                                      );
                                    }}
                                    className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium ${
                                      status === 'in-progress'
                                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    진행중
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStatusChange(
                                        student.id,
                                        header.majorUnit,
                                        header.minorUnit,
                                        'completed'
                                      );
                                      setEditingCell(null);
                                    }}
                                    className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium ${
                                      status === 'completed'
                                        ? 'bg-green-100 border-green-400 text-green-700'
                                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    완료
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCell(null)}
                                    className="flex-1 px-3 py-2 text-xs font-medium bg-slate-100 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCell(null)}
                                    className="flex-1 px-3 py-2 text-xs font-medium bg-[#084773] rounded-lg text-white hover:bg-[#063d5c]"
                                  >
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full cursor-pointer">
                                {status === 'completed' ? (
                                  <span className="text-xs font-medium text-green-700">
                                    완료
                                  </span>
                                ) : status === 'in-progress' ? (
                                  <>
                                    <span className="text-xs font-medium text-blue-700 mb-1">
                                      진행 중
                                    </span>
                                    <span className="text-[10px] text-slate-600">
                                      {progressValue}%
                                    </span>
                                  </>
                                ) : (
                                  <div className="w-full h-full"></div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 교재 미선택 시 안내 */}
        {!selectedTextbookId && classTextbooks.length > 0 && (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                교재를 선택해주세요
              </p>
              <p className="mt-1 text-sm text-slate-600">
                위에서 교재를 선택하면 진도 표가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 교재가 없는 경우 */}
        {classTextbooks.length === 0 && (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                등록된 교재가 없습니다
              </p>
              <p className="mt-1 text-sm text-slate-600">
                이 클래스에 등록된 교재가 없습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressDetailPage;

