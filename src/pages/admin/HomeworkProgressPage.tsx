import { useEffect, useState } from 'react';
import MainLayout from '../MainLayout';
import {
  getClasses,
  getClassTextbooks,
  getProgressGrid,
  updateProgressCells,
} from '../../api/class';
import type { Chapter, StudentProgress } from '../../api/class';

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  studentIds: number[];
};

// 빈 데이터
const initialClasses: ClassType[] = [];

type Textbook = {
  id: number;
  name: string;
  grade: string;
  classIds: number[];
  classNames: string[];
  majorUnitCount: number;
  minorUnitCount: number;
  subUnits: Array<{
    id: string;
    name: string;
    subUnitCount: number;
  }>;
};

type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

function HomeworkProgressPage() {
  const [classes, setClasses] = useState<ClassType[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoadingTextbooks, setIsLoadingTextbooks] = useState(false);
  const [selectedTextbookId, setSelectedTextbookId] = useState<number | null>(
    null
  );
  const [progressData, setProgressData] = useState<{
    chapters: Chapter[];
    students: StudentProgress[];
  } | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    studentId: number;
    chapterId: number;
  } | null>(null);
  const [editPercent, setEditPercent] = useState<number>(0);

  // 클래스 목록 조회 API 호출
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await getClasses();
        const transformedClasses: ClassType[] = response.data.map(
          classData => ({
            id: classData.classId,
            name: classData.className,
            studentCount: 0,
            studentIds: [],
          })
        );
        setClasses(transformedClasses);
      } catch (error) {
        console.error('클래스 목록 조회 에러:', error);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 클래스 선택 시 교재 목록 조회
  const handleClassSelect = async (classId: number, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setSelectedTextbookId(null);
    setProgressData(null);
    setIsLoadingTextbooks(true);
    try {
      const response = await getClassTextbooks(classId);
      const transformedTextbooks: Textbook[] = response.data.map(item => ({
        id: item.textbook.textbookId,
        name: item.textbook.name,
        grade: `${item.textbook.grade}학년`,
        classIds: [item.classId],
        classNames: [],
        unitCount: item.textbook.largeUnit,
        majorUnitCount: item.textbook.largeUnit,
        minorUnitCount: item.textbook.smallUnit,
        subUnits: [],
      }));
      setTextbooks(transformedTextbooks);
    } catch (error) {
      console.error('클래스 교재 목록 조회 에러:', error);
      setTextbooks([]);
    } finally {
      setIsLoadingTextbooks(false);
    }
  };

  // 교재 선택 시 진도 그리드 조회
  const handleTextbookSelect = async (textbookId: number) => {
    if (!selectedClassId) return;

    setSelectedTextbookId(textbookId);
    setIsLoadingProgress(true);
    try {
      const response = await getProgressGrid(selectedClassId, textbookId);
      setProgressData({
        chapters: response.data.chapters,
        students: response.data.students,
      });
    } catch (error) {
      console.error('진도 그리드 조회 에러:', error);
      setProgressData(null);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // 대단원 헤더 생성
  const generateMajorUnitHeaders = (chapters: Chapter[]) => {
    const headers: Array<{
      majorUnit: number;
      colspan: number;
      label: string;
    }> = [];

    let currentMajorUnit = 0;
    let currentColspan = 0;

    chapters.forEach(chapter => {
      if (chapter.largeUnitNo !== currentMajorUnit) {
        if (currentMajorUnit > 0) {
          headers.push({
            majorUnit: currentMajorUnit,
            colspan: currentColspan,
            label: `${currentMajorUnit}단원`,
          });
        }
        currentMajorUnit = chapter.largeUnitNo;
        currentColspan = 1;
      } else {
        currentColspan++;
      }
    });

    if (currentMajorUnit > 0) {
      headers.push({
        majorUnit: currentMajorUnit,
        colspan: currentColspan,
        label: `${currentMajorUnit}단원`,
      });
    }

    return headers;
  };

  // 상태별 색상
  const getStatusColor = (
    status: ProgressStatus | null,
    percent: number,
    isEditing: boolean = false
  ) => {
    let baseColor = '';
    if (!status || status === 'NOT_STARTED') {
      baseColor = 'bg-slate-100 border-slate-300';
    } else if (status === 'COMPLETED') {
      baseColor = 'bg-green-100 border-green-300';
    } else if (status === 'IN_PROGRESS') {
      if (percent <= 30) baseColor = 'bg-yellow-100 border-yellow-300';
      else if (percent <= 60) baseColor = 'bg-orange-100 border-orange-300';
      else baseColor = 'bg-red-100 border-red-300';
    } else {
      baseColor = 'bg-slate-100 border-slate-300';
    }

    // 편집 모드일 때 약간의 변화 추가
    if (isEditMode) {
      return `${baseColor} ${
        isEditing
          ? 'ring-2 ring-blue-400 ring-offset-1'
          : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-0'
      }`;
    }

    return baseColor;
  };

  // 셀 더블클릭 핸들러
  const handleCellDoubleClick = (
    studentId: number,
    chapterId: number,
    currentPercent: number
  ) => {
    if (!isEditMode) return;
    setEditingCell({ studentId, chapterId });
    setEditPercent(currentPercent);
  };

  // 진행률 업데이트
  const handleUpdateProgress = (
    studentId: number,
    chapterId: number,
    percent: number
  ) => {
    if (!progressData) return;

    const status: ProgressStatus =
      percent === 100
        ? 'COMPLETED'
        : percent > 0
        ? 'IN_PROGRESS'
        : 'NOT_STARTED';

    // progressData 업데이트
    const updatedStudents = progressData.students.map(student => {
      if (student.studentId === studentId) {
        const updatedCells = {
          ...student.cells,
          [chapterId.toString()]: {
            status,
            percent,
            updatedAt: new Date().toISOString(),
          },
        };
        return {
          ...student,
          cells: updatedCells,
        };
      }
      return student;
    });

    setProgressData({
      ...progressData,
      students: updatedStudents,
    });

    setEditingCell(null);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditPercent(0);
  };

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-[95%] px-4 py-6 sm:px-6 lg:px-8">
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
            {isLoading ? (
              <p className="text-sm text-slate-600">
                클래스 목록을 불러오는 중...
              </p>
            ) : classes.length === 0 ? (
              <p className="text-sm text-slate-600">
                등록된 클래스가 없습니다.
              </p>
            ) : (
              classes.map(cls => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleClassSelect(cls.id, cls.name)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedClassId === cls.id
                      ? 'border-[#084773] bg-[#084773] text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cls.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 교재 목록 */}
        {selectedClassId && (
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {selectedClassName} - 교재 목록
            </h2>
            {isLoadingTextbooks ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-600">
                  교재 목록을 불러오는 중...
                </p>
              </div>
            ) : textbooks.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-600">
                  등록된 교재가 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {textbooks.map(textbook => (
                  <button
                    key={textbook.id}
                    type="button"
                    onClick={() => handleTextbookSelect(textbook.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTextbookId === textbook.id
                        ? 'border-[#084773] bg-[#084773] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {textbook.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 진도 그리드 표시 */}
        {selectedTextbookId && progressData && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                숙제 진도
              </h2>
              <button
                type="button"
                onClick={async () => {
                  if (isEditMode) {
                    // 편집 완료 - API 호출
                    if (
                      !selectedClassId ||
                      !selectedTextbookId ||
                      !progressData
                    )
                      return;

                    try {
                      // progressData를 API 요청 형식으로 변환
                      const items: Array<{
                        studentId: number;
                        chapterId: number;
                        percent: number;
                      }> = [];

                      progressData.students.forEach(student => {
                        progressData.chapters.forEach(chapter => {
                          const cell =
                            student.cells[chapter.chapterId.toString()];
                          if (cell) {
                            items.push({
                              studentId: student.studentId,
                              chapterId: chapter.chapterId,
                              percent: cell.percent,
                            });
                          }
                        });
                      });

                      const response = await updateProgressCells(
                        selectedClassId,
                        selectedTextbookId,
                        { items }
                      );

                      alert(response.message);
                      setIsEditMode(false);
                      setEditingCell(null);
                    } catch (error) {
                      console.error('진도 셀 수정 에러:', error);
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : '진도 셀 수정에 실패했습니다.';
                      alert(errorMessage);
                    }
                  } else {
                    // 편집 모드 시작
                    setIsEditMode(true);
                  }
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isEditMode
                    ? 'border-[#084773] bg-[#084773] text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isEditMode ? '편집 완료' : '편집 모드'}
              </button>
            </div>
            {isLoadingProgress ? (
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-600">
                  진도 데이터를 불러오는 중...
                </p>
              </div>
            ) : (
              <div
                className={`overflow-x-auto rounded-lg border shadow-sm transition-all ${
                  isEditMode
                    ? 'border-blue-400 bg-blue-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <table className="min-w-full border-collapse">
                  <thead>
                    {/* 대단원 헤더 */}
                    <tr>
                      <th
                        rowSpan={2}
                        className="border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900"
                      >
                        학생
                      </th>
                      {generateMajorUnitHeaders(progressData.chapters).map(
                        header => (
                          <th
                            key={header.majorUnit}
                            colSpan={header.colspan}
                            className="border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-900"
                          >
                            {header.label}
                          </th>
                        )
                      )}
                    </tr>
                    {/* 소단원 헤더 */}
                    <tr>
                      {progressData.chapters.map(chapter => (
                        <th
                          key={chapter.chapterId}
                          className="border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700"
                        >
                          {chapter.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.students.map(student => (
                      <tr key={student.studentId}>
                        <td className="border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900">
                          {student.name}
                        </td>
                        {progressData.chapters.map(chapter => {
                          const cell =
                            student.cells[chapter.chapterId.toString()];
                          const status = cell?.status as ProgressStatus | null;
                          const percent = cell?.percent || 0;
                          const isEditing =
                            editingCell?.studentId === student.studentId &&
                            editingCell?.chapterId === chapter.chapterId;

                          return (
                            <td
                              key={chapter.chapterId}
                              onDoubleClick={() =>
                                handleCellDoubleClick(
                                  student.studentId,
                                  chapter.chapterId,
                                  percent
                                )
                              }
                              className={`border border-slate-200 px-3 py-2 text-center text-xs transition-all ${
                                isEditMode ? 'cursor-pointer' : ''
                              } ${getStatusColor(status, percent, isEditing)}`}
                            >
                              {isEditing ? (
                                <div className="flex flex-col items-center gap-2 p-2 min-w-[120px]">
                                  {/* 슬라이더 */}
                                  <div className="w-full">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      step="5"
                                      value={editPercent}
                                      onChange={e => {
                                        const val = parseInt(
                                          e.target.value,
                                          10
                                        );
                                        // 5의 배수로 반올림
                                        const rounded = Math.round(val / 5) * 5;
                                        setEditPercent(rounded);
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                      style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${editPercent}%, #e2e8f0 ${editPercent}%, #e2e8f0 100%)`,
                                      }}
                                    />
                                  </div>
                                  {/* 진행률 표시 및 수기 입력 */}
                                  <div className="flex items-center gap-2 w-full">
                                    <span className="text-xs font-medium text-slate-700 min-w-[30px]">
                                      {editPercent}%
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="5"
                                      value={editPercent}
                                      onChange={e => {
                                        const val =
                                          parseInt(e.target.value, 10) || 0;
                                        // 5의 배수로 반올림
                                        const rounded = Math.round(val / 5) * 5;
                                        const clamped = Math.max(
                                          0,
                                          Math.min(100, rounded)
                                        );
                                        setEditPercent(clamped);
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          handleUpdateProgress(
                                            student.studentId,
                                            chapter.chapterId,
                                            editPercent
                                          );
                                        } else if (e.key === 'Escape') {
                                          handleCancelEdit();
                                        }
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      className="w-16 rounded border border-blue-400 px-2 py-1 text-center text-xs font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  {/* 상태 표시 (색상으로 가시화) */}
                                  <div
                                    className={`w-full rounded px-2 py-1 text-center text-[10px] font-medium ${
                                      editPercent === 100
                                        ? 'bg-green-100 text-green-800'
                                        : editPercent > 0
                                        ? editPercent <= 30
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : editPercent <= 60
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-red-100 text-red-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {editPercent === 100
                                      ? '완료'
                                      : editPercent > 0
                                      ? '진행중'
                                      : '미시작'}
                                  </div>
                                  {/* 저장/취소 버튼 */}
                                  <div className="flex gap-1 w-full">
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleUpdateProgress(
                                          student.studentId,
                                          chapter.chapterId,
                                          editPercent
                                        );
                                      }}
                                      className="flex-1 rounded bg-blue-500 px-2 py-1 text-[10px] text-white hover:bg-blue-600 transition-colors"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleCancelEdit();
                                      }}
                                      className="flex-1 rounded bg-slate-400 px-2 py-1 text-[10px] text-white hover:bg-slate-500 transition-colors"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : cell ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-medium">
                                    {percent}%
                                  </span>
                                  <span className="text-[10px] opacity-70">
                                    {status === 'COMPLETED'
                                      ? '완료'
                                      : status === 'IN_PROGRESS'
                                      ? '진행중'
                                      : '미시작'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                위에서 클래스를 선택하면 교재를 선택할 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressPage;
