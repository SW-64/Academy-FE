import { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
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

// 진도 상태 타입
type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

// 학생별 교재 진도 정보
type StudentProgress = {
  studentId: number;
  textbookId: number;
  unitIndex: number; // 단원 인덱스
  stepIndex: number; // 스텝 인덱스
  status: ProgressStatus;
  progress: number; // 0-100%
  questionNumber?: number; // 문항 번호 (선택적)
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

function HomeworkProgressPage() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentProgresses, setStudentProgresses] = useState<StudentProgress[]>(
    []
  );
  const [editingCell, setEditingCell] = useState<{
    studentId: number;
    textbookId: number;
    unitIndex: number;
    stepIndex: number;
  } | null>(null);

  // 선택된 클래스의 학생 목록
  const selectedClass = dummyClasses.find(c => c.id === selectedClassId);
  const students = selectedClass
    ? dummyStudents.filter(s => selectedClass.studentIds.includes(s.id))
    : [];

  // 선택된 클래스에 해당하는 교재 목록
  const classTextbooks = selectedClassId
    ? initialTextbooks.filter(t => t.classId === selectedClassId)
    : [];

  // 학생별 교재의 단원/스텝 진도 가져오기
  const getProgress = (
    studentId: number,
    textbookId: number,
    unitIndex: number,
    stepIndex: number
  ): StudentProgress | null => {
    return (
      studentProgresses.find(
        p =>
          p.studentId === studentId &&
          p.textbookId === textbookId &&
          p.unitIndex === unitIndex &&
          p.stepIndex === stepIndex
      ) || null
    );
  };

  // 진도 업데이트
  const updateProgress = (
    studentId: number,
    textbookId: number,
    unitIndex: number,
    stepIndex: number,
    status: ProgressStatus,
    progress: number,
    questionNumber?: number
  ) => {
    const existingIndex = studentProgresses.findIndex(
      p =>
        p.studentId === studentId &&
        p.textbookId === textbookId &&
        p.unitIndex === unitIndex &&
        p.stepIndex === stepIndex
    );

    const newProgress: StudentProgress = {
      studentId,
      textbookId,
      unitIndex,
      stepIndex,
      status,
      progress,
      questionNumber,
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
    textbookId: number,
    unitIndex: number,
    stepIndex: number,
    newStatus: ProgressStatus
  ) => {
    const currentProgress = getProgress(
      studentId,
      textbookId,
      unitIndex,
      stepIndex
    );
    const progress =
      newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0;
    updateProgress(
      studentId,
      textbookId,
      unitIndex,
      stepIndex,
      newStatus,
      progress
    );
  };

  // 슬라이더 값 변경
  const handleSliderChange = (
    studentId: number,
    textbookId: number,
    unitIndex: number,
    stepIndex: number,
    value: number
  ) => {
    const status: ProgressStatus =
      value === 100 ? 'completed' : value > 0 ? 'in-progress' : 'not-started';
    updateProgress(studentId, textbookId, unitIndex, stepIndex, status, value);
  };

  // 수기 입력 처리
  const handleManualInput = (
    studentId: number,
    textbookId: number,
    unitIndex: number,
    stepIndex: number,
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
      updateProgress(
        studentId,
        textbookId,
        unitIndex,
        stepIndex,
        status,
        numValue
      );
    }
  };

  // 그라데이션 색상 계산
  const getProgressColor = (progress: number): string => {
    if (progress === 0) return '#e2e8f0'; // 미시작 - 회색
    if (progress === 100) return '#10b981'; // 완료 - 녹색
    // 진행 중 - 그라데이션 (노란색 → 주황색 → 빨간색)
    if (progress <= 30) return `rgb(255, ${200 + progress * 2}, 0)`;
    if (progress <= 60)
      return `rgb(255, ${260 - progress * 2}, ${progress * 2 - 60})`;
    return `rgb(${355 - progress * 2}, ${340 - progress * 2}, ${
      progress * 2 - 120
    })`;
  };

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">숙제 진도</h1>
          <p className="mt-1 text-sm text-slate-600">
            클래스를 선택하여 학생별 숙제 진도를 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 클래스 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            클래스 선택
          </label>
          <div className="flex flex-wrap gap-2">
            {dummyClasses.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === cls.id
                    ? 'border-[#084773] bg-[#084773] text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* 표 표시 */}
        {selectedClassId && classTextbooks.length > 0 && (
          <div className="overflow-x-auto rounded-lg border-2 border-slate-400 bg-white">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-400 bg-slate-50">
                  <th
                    rowSpan={2}
                    className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10"
                  >
                    학생 이름
                  </th>
                  {classTextbooks.map(textbook => {
                    // 교재별 단원 수 계산 (대단원, 소단원, 스텝)
                    const totalUnits =
                      textbook.majorUnitCount || textbook.unitCount;
                    const totalSteps = textbook.subUnits.reduce((sum, sub) => {
                      if (sub.name === '스텝') return sum + sub.subUnitCount;
                      return sum;
                    }, 0);
                    const colSpan = totalUnits * totalSteps || 1;

                    return (
                      <th
                        key={textbook.id}
                        colSpan={colSpan}
                        className="border-r border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-900"
                      >
                        {textbook.name}
                      </th>
                    );
                  })}
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  {classTextbooks.map(textbook => {
                    const totalUnits =
                      textbook.majorUnitCount || textbook.unitCount;
                    const stepSubUnit = textbook.subUnits.find(
                      sub => sub.name === '스텝'
                    );
                    const stepCount = stepSubUnit?.subUnitCount || 3; // 기본 3 스텝

                    return Array.from({ length: totalUnits }, (_, unitIndex) =>
                      Array.from({ length: stepCount }, (_, stepIndex) => (
                        <th
                          key={`${textbook.id}-${unitIndex}-${stepIndex}`}
                          className="border-r border-slate-300 px-1 py-1 text-center text-[10px] font-medium text-slate-700"
                        >
                          {unitIndex + 1}-{stepIndex + 1}
                        </th>
                      ))
                    ).flat();
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-300 hover:bg-slate-50"
                  >
                    <td className="border-r border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-900 sticky left-0 bg-white z-10">
                      {student.name}
                    </td>
                    {classTextbooks.map(textbook => {
                      const totalUnits =
                        textbook.majorUnitCount || textbook.unitCount;
                      const stepSubUnit = textbook.subUnits.find(
                        sub => sub.name === '스텝'
                      );
                      const stepCount = stepSubUnit?.subUnitCount || 3;

                      return Array.from(
                        { length: totalUnits },
                        (_, unitIndex) =>
                          Array.from({ length: stepCount }, (_, stepIndex) => {
                            const progress = getProgress(
                              student.id,
                              textbook.id,
                              unitIndex,
                              stepIndex
                            );
                            const status = progress?.status || 'not-started';
                            const progressValue = progress?.progress || 0;
                            const isEditing =
                              editingCell?.studentId === student.id &&
                              editingCell?.textbookId === textbook.id &&
                              editingCell?.unitIndex === unitIndex &&
                              editingCell?.stepIndex === stepIndex;

                            return (
                              <td
                                key={`${textbook.id}-${unitIndex}-${stepIndex}`}
                                className="border-r border-slate-300 px-1 py-1 text-center relative group"
                                onDoubleClick={() =>
                                  setEditingCell({
                                    studentId: student.id,
                                    textbookId: textbook.id,
                                    unitIndex,
                                    stepIndex,
                                  })
                                }
                              >
                                {isEditing ? (
                                  <div className="p-2 space-y-2 min-w-[120px]">
                                    {/* 슬라이더 */}
                                    <div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="10"
                                        value={progressValue}
                                        onChange={e =>
                                          handleSliderChange(
                                            student.id,
                                            textbook.id,
                                            unitIndex,
                                            stepIndex,
                                            parseInt(e.target.value, 10)
                                          )
                                        }
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                          background: `linear-gradient(to right, ${getProgressColor(
                                            0
                                          )} 0%, ${getProgressColor(
                                            progressValue
                                          )} ${progressValue}%, #e2e8f0 ${progressValue}%, #e2e8f0 100%)`,
                                        }}
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
                                          textbook.id,
                                          unitIndex,
                                          stepIndex,
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
                                            textbook.id,
                                            unitIndex,
                                            stepIndex,
                                            'not-started'
                                          );
                                          setEditingCell(null);
                                        }}
                                        className={`flex-1 px-2 py-1 text-[10px] rounded border ${
                                          status === 'not-started'
                                            ? 'bg-slate-100 border-slate-400'
                                            : 'bg-white border-slate-300'
                                        }`}
                                      >
                                        미시작
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleStatusChange(
                                            student.id,
                                            textbook.id,
                                            unitIndex,
                                            stepIndex,
                                            'in-progress'
                                          );
                                        }}
                                        className={`flex-1 px-2 py-1 text-[10px] rounded border ${
                                          status === 'in-progress'
                                            ? 'bg-blue-100 border-blue-400'
                                            : 'bg-white border-slate-300'
                                        }`}
                                      >
                                        진행중
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleStatusChange(
                                            student.id,
                                            textbook.id,
                                            unitIndex,
                                            stepIndex,
                                            'completed'
                                          );
                                          setEditingCell(null);
                                        }}
                                        className={`flex-1 px-2 py-1 text-[10px] rounded border ${
                                          status === 'completed'
                                            ? 'bg-green-100 border-green-400'
                                            : 'bg-white border-slate-300'
                                        }`}
                                      >
                                        완료
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCell(null)}
                                      className="w-full px-2 py-1 text-[10px] bg-slate-100 rounded border border-slate-300"
                                    >
                                      닫기
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-8">
                                    {status === 'completed' ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : status === 'in-progress' ? (
                                      <div className="flex flex-col items-center">
                                        <PlayCircle className="h-4 w-4 text-blue-600 mb-0.5" />
                                        <span className="text-[9px] text-slate-600">
                                          {progressValue}%
                                        </span>
                                      </div>
                                    ) : (
                                      <Circle className="h-4 w-4 text-slate-400" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })
                      ).flat();
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 클래스 미선택 시 안내 */}
        {!selectedClassId && (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                클래스를 선택해주세요
              </p>
              <p className="mt-1 text-sm text-slate-600">
                위에서 클래스를 선택하면 학생별 숙제 진도 표가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        {selectedClassId && (
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs text-blue-900">
              💡 <strong>사용 방법:</strong> 셀을 더블클릭하면 진도를 입력할 수
              있습니다. 슬라이더나 수기 입력으로 진행률을 설정하고, 상태
              버튼으로 미시작/진행중/완료를 선택할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressPage;
