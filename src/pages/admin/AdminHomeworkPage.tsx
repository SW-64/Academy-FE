import { useState, useEffect } from 'react';
import { Plus, X, Trash2, BookOpen, Edit2 } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  getTextbooks,
  getTextbookDetail,
  createTextbook,
  updateTextbook,
  deleteTextbook,
} from '../../api/textbooks';
import { getClasses } from '../../api/class';

type ClassType = {
  id: number;
  name: string;
};

type SubUnit = {
  id: string;
  name: string;
  subUnitCount: number;
};

type Textbook = {
  id: number;
  name: string;
  grade: string;
  classIds: number[];
  classNames: string[];
  unitCount: number;
  majorUnitCount: number;
  minorUnitCount: number;
  subUnits: SubUnit[];
};

// 빈 데이터
const initialClasses: ClassType[] = [];

// 학년 옵션
const gradeOptions = ['1학년', '2학년', '3학년'];

// 빈 교재 데이터
const initialTextbooks: Textbook[] = [];

// 다른 파일에서 사용할 수 있도록 export
export { initialTextbooks };

function AdminHomeworkPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>(initialTextbooks);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTextbookId, setEditingTextbookId] = useState<number | null>(
    null
  );
  const [newTextbook, setNewTextbook] = useState({
    name: '',
    grade: '',
    classIds: [] as number[],
    majorUnitCount: 0,
    minorUnitCount: 0,
  });
  const [majorUnits, setMajorUnits] = useState<
    Array<{ minorUnitCount: number }>
  >([]);
  const [classes, setClasses] = useState<ClassType[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 교재 목록 조회 API 호출
  useEffect(() => {
    const fetchTextbooks = async () => {
      setIsLoading(true);
      try {
        const response = await getTextbooks();
        // API 응답을 Textbook 형식으로 변환
        const transformedTextbooks: Textbook[] = response.data.map(
          textbook => ({
            id: textbook.textbookId,
            name: textbook.name,
            grade: `${textbook.grade}학년`,
            classIds: [], // 상세 조회에서 가져와야 함
            classNames: [], // 상세 조회에서 가져와야 함
            unitCount: textbook.largeUnit,
            majorUnitCount: textbook.largeUnit,
            minorUnitCount: textbook.smallUnit,
            subUnits: [],
          })
        );
        setTextbooks(transformedTextbooks);
      } catch (error) {
        console.error('교재 목록 조회 에러:', error);
        setTextbooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTextbooks();
  }, []);

  // 클래스 목록 조회 API 호출
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getClasses();
        const transformedClasses: ClassType[] = response.data.map(
          classData => ({
            id: classData.classId,
            name: classData.className,
          })
        );
        setClasses(transformedClasses);
      } catch (error) {
        console.error('클래스 목록 조회 에러:', error);
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditingTextbookId(null);
    setNewTextbook({
      name: '',
      grade: '',
      classIds: [],
      majorUnitCount: 0,
      minorUnitCount: 0,
    });
    setMajorUnits([]);
  };

  const handleOpenEditModal = async (textbook: Textbook) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditingTextbookId(textbook.id);

    // 교재 상세 조회 API 호출
    setIsLoadingDetail(true);
    try {
      const response = await getTextbookDetail(textbook.id);
      const detail = response.data;

      const majorUnitCount = detail.largeUnit;
      const minorUnitCount = detail.smallUnit;

      // 모든 대단원에 동일한 소단원 수 적용
      const initialMajorUnits: Array<{ minorUnitCount: number }> = Array.from(
        { length: majorUnitCount },
        () => ({
          minorUnitCount: minorUnitCount,
        })
      );

      // 클래스 ID 목록 추출 (clazz가 null이 아닌 것만)
      const classIds = detail.classTextbooks
        .filter(
          (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
            ct.clazz !== null
        )
        .map(ct => ct.clazz.classId);
      const classNames = detail.classTextbooks
        .filter(
          (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
            ct.clazz !== null
        )
        .map(ct => ct.clazz.className);

      setNewTextbook({
        name: detail.name,
        grade: `${detail.grade}학년`,
        classIds: classIds,
        majorUnitCount: majorUnitCount,
        minorUnitCount: minorUnitCount,
      });
      setMajorUnits(initialMajorUnits);

      // selectedTextbook도 업데이트
      setSelectedTextbook({
        id: detail.textbookId,
        name: detail.name,
        grade: `${detail.grade}학년`,
        classIds: classIds,
        classNames: classNames,
        unitCount: majorUnitCount,
        majorUnitCount: majorUnitCount,
        minorUnitCount: minorUnitCount,
        subUnits: [],
      });
    } catch (error) {
      console.error('교재 상세 조회 에러:', error);
      alert('교재 상세 정보를 가져오는데 실패했습니다.');
      setIsModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTextbookId(null);
    setNewTextbook({
      name: '',
      grade: '',
      classIds: [],
      majorUnitCount: 0,
      minorUnitCount: 0,
    });
    setMajorUnits([]);
  };

  // 대단원 수 변경 시 majorUnits 배열 업데이트
  const handleMajorUnitCountChange = (value: string | number) => {
    // 문자열인 경우 숫자로 변환 (앞의 0 제거)
    const numValue =
      typeof value === 'string'
        ? value === ''
          ? 0
          : parseInt(value, 10) || 0
        : value;
    const newCount = Math.max(0, numValue);
    setNewTextbook(prev => ({ ...prev, majorUnitCount: newCount }));

    if (newCount > majorUnits.length) {
      // 대단원 수가 증가하면 기본값으로 추가
      const defaultMinorCount =
        majorUnits.length > 0
          ? majorUnits[0].minorUnitCount
          : newTextbook.minorUnitCount || 0;

      const newMajorUnits = [...majorUnits];
      for (let i = majorUnits.length; i < newCount; i++) {
        newMajorUnits.push({
          minorUnitCount: defaultMinorCount,
        });
      }
      setMajorUnits(newMajorUnits);
    } else if (newCount < majorUnits.length) {
      // 대단원 수가 감소하면 배열 축소
      setMajorUnits(majorUnits.slice(0, newCount));
    }
  };

  // 대단원별 소단원 수 변경
  const handleMajorUnitMinorCountChange = (index: number, count: number) => {
    const newMajorUnits = [...majorUnits];
    newMajorUnits[index] = {
      ...newMajorUnits[index],
      minorUnitCount: Math.max(0, count),
    };
    setMajorUnits(newMajorUnits);
  };

  const handleSave = async () => {
    if (
      !newTextbook.name ||
      !newTextbook.grade ||
      newTextbook.classIds.length === 0
    ) {
      alert('교재 이름, 학년, 클래스를 모두 입력해주세요.');
      return;
    }

    if (newTextbook.majorUnitCount === 0) {
      alert('대단원 수를 입력해주세요.');
      return;
    }

    // 대단원별 소단원 수와 스텝 수 검증
    if (majorUnits.length !== newTextbook.majorUnitCount) {
      alert('대단원 수에 맞게 각 대단원의 정보를 입력해주세요.');
      return;
    }

    for (let i = 0; i < majorUnits.length; i++) {
      if (majorUnits[i].minorUnitCount === 0) {
        alert(`${i + 1}번째 대단원의 소단원 수를 입력해주세요.`);
        return;
      }
    }

    // 학년에서 숫자만 추출
    const gradeNumber = parseInt(newTextbook.grade.replace('학년', ''), 10);

    // 평균 소단원 수 계산 (API는 하나의 smallUnit 값만 받음)
    const avgMinorUnitCount = Math.round(
      majorUnits.reduce((sum, unit) => sum + unit.minorUnitCount, 0) /
        majorUnits.length
    );

    try {
      if (isEditMode && editingTextbookId) {
        // 교재 수정 API 호출
        const response = await updateTextbook(editingTextbookId, {
          name: newTextbook.name,
          grade: gradeNumber,
          classList: newTextbook.classIds,
        });
        alert(response.message);

        // 교재 목록 새로고침
        const fetchTextbooks = async () => {
          setIsLoading(true);
          try {
            const response = await getTextbooks();
            const transformedTextbooks: Textbook[] = response.data.map(
              textbook => ({
                id: textbook.textbookId,
                name: textbook.name,
                grade: `${textbook.grade}학년`,
                classIds: [],
                classNames: [],
                unitCount: textbook.largeUnit,
                majorUnitCount: textbook.largeUnit,
                minorUnitCount: textbook.smallUnit,
                subUnits: [],
              })
            );
            setTextbooks(transformedTextbooks);
          } catch (error) {
            console.error('교재 목록 조회 에러:', error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTextbooks();

        // 선택된 교재도 새로고침
        if (selectedTextbook?.id === editingTextbookId) {
          const detailResponse = await getTextbookDetail(editingTextbookId);
          const detail = detailResponse.data;
          const updatedClassIds = detail.classTextbooks
            .filter(
              (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
                ct.clazz !== null
            )
            .map(ct => ct.clazz.classId);
          const updatedClassNames = detail.classTextbooks
            .filter(
              (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
                ct.clazz !== null
            )
            .map(ct => ct.clazz.className);
          setSelectedTextbook({
            id: detail.textbookId,
            name: detail.name,
            grade: `${detail.grade}학년`,
            classIds: updatedClassIds,
            classNames: updatedClassNames,
            unitCount: detail.largeUnit,
            majorUnitCount: detail.largeUnit,
            minorUnitCount: detail.smallUnit,
            subUnits: [],
          });
        }
      } else {
        // 교재 생성 API 호출
        const response = await createTextbook({
          name: newTextbook.name,
          grade: gradeNumber,
          largeUnit: newTextbook.majorUnitCount,
          smallUnit: avgMinorUnitCount,
          classList: newTextbook.classIds,
        });
        alert(response.message);

        // 교재 목록 새로고침
        const fetchTextbooks = async () => {
          setIsLoading(true);
          try {
            const response = await getTextbooks();
            const transformedTextbooks: Textbook[] = response.data.map(
              textbook => ({
                id: textbook.textbookId,
                name: textbook.name,
                grade: `${textbook.grade}학년`,
                classIds: [],
                classNames: [],
                unitCount: textbook.largeUnit,
                majorUnitCount: textbook.largeUnit,
                minorUnitCount: textbook.smallUnit,
                subUnits: [],
              })
            );
            setTextbooks(transformedTextbooks);
          } catch (error) {
            console.error('교재 목록 조회 에러:', error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTextbooks();
      }
      handleCloseModal();
    } catch (error) {
      console.error('교재 저장 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : isEditMode
          ? '교재 수정에 실패했습니다.'
          : '교재 생성에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleTextbookClick = async (textbookId: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await getTextbookDetail(textbookId);
      const detail = response.data;

      const classIds = detail.classTextbooks
        .filter(
          (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
            ct.clazz !== null
        )
        .map(ct => ct.clazz.classId);
      const classNames = detail.classTextbooks
        .filter(
          (ct): ct is typeof ct & { clazz: NonNullable<typeof ct.clazz> } =>
            ct.clazz !== null
        )
        .map(ct => ct.clazz.className);

      setSelectedTextbook({
        id: detail.textbookId,
        name: detail.name,
        grade: `${detail.grade}학년`,
        classIds: classIds,
        classNames: classNames,
        unitCount: detail.largeUnit,
        majorUnitCount: detail.largeUnit,
        minorUnitCount: detail.smallUnit,
        subUnits: [],
      });
    } catch (error) {
      console.error('교재 상세 조회 에러:', error);
      alert('교재 상세 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 교재를 삭제하시겠습니까?')) return;

    try {
      await deleteTextbook(id);
      alert('교재가 삭제되었습니다.');

      // 교재 목록 새로고침
      const fetchTextbooks = async () => {
        setIsLoading(true);
        try {
          const response = await getTextbooks();
          const transformedTextbooks: Textbook[] = response.data.map(
            textbook => ({
              id: textbook.textbookId,
              name: textbook.name,
              grade: `${textbook.grade}학년`,
              classIds: [],
              classNames: [],
              unitCount: textbook.largeUnit,
              majorUnitCount: textbook.largeUnit,
              minorUnitCount: textbook.smallUnit,
              subUnits: [],
            })
          );
          setTextbooks(transformedTextbooks);
        } catch (error) {
          console.error('교재 목록 조회 에러:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTextbooks();

      if (selectedTextbook?.id === id) {
        setSelectedTextbook(null);
      }
    } catch (error) {
      console.error('교재 삭제 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '교재 삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">교재 관리</h1>
            <p className="mt-1 text-sm text-slate-600">
              교재를 생성하고 관리할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
          >
            <Plus className="h-4 w-4" />
            교재 생성
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 교재 목록 */}
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              교재 목록
            </h2>
            {isLoading ? (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm text-slate-600">
                  교재 목록을 불러오는 중...
                </p>
              </div>
            ) : textbooks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-900">
                  등록된 교재가 없습니다
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  교재 생성 버튼을 눌러 새 교재를 추가하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {textbooks.map(textbook => (
                  <div
                    key={textbook.id}
                    onClick={() => handleTextbookClick(textbook.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedTextbook?.id === textbook.id
                        ? 'border-[#084773] bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900">
                      {textbook.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {textbook.grade}
                      {selectedTextbook?.id === textbook.id &&
                        selectedTextbook.classNames.length > 0 &&
                        ` · ${selectedTextbook.classNames.join(', ')}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 교재 정보 */}
          <div className="lg:col-span-2">
            {isLoadingDetail ? (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-12">
                <p className="text-sm text-slate-600">
                  교재 정보를 불러오는 중...
                </p>
              </div>
            ) : selectedTextbook ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {selectedTextbook.name}
                    </h2>
                    <div className="mt-4 space-y-6 text-sm text-slate-600">
                      <p>학년: {selectedTextbook.grade}</p>
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          클래스 지정
                        </label>
                        <div className="space-y-2">
                          {classes.map((classItem: ClassType) => {
                            const isSelected =
                              selectedTextbook.classIds.includes(classItem.id);
                            return (
                              <label
                                key={classItem.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                  isSelected
                                    ? 'bg-blue-100 border border-blue-300 cursor-default'
                                    : 'cursor-default'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled
                                  className={`h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773] cursor-not-allowed ${
                                    isSelected ? 'opacity-100' : 'opacity-40'
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    isSelected
                                      ? 'text-[#084773] font-medium'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {classItem.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-6">
                        <p>
                          대단원:{' '}
                          {selectedTextbook.majorUnitCount ||
                            selectedTextbook.unitCount}
                          개
                        </p>
                        <p className="mt-2">
                          소단원: {selectedTextbook.minorUnitCount}개
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedTextbook)}
                      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedTextbook.id)}
                      className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-12">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    교재를 선택하세요
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    왼쪽 목록에서 교재를 선택하면 상세 정보를 확인할 수
                    있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 교재 생성 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {isEditMode ? '교재 수정' : '교재 생성'}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 교재 이름 */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    교재 이름
                  </label>
                  <input
                    type="text"
                    value={newTextbook.name}
                    onChange={e =>
                      setNewTextbook(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="교재 이름을 입력하세요"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                  />
                </div>

                {/* 학년 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    학년
                  </label>
                  <select
                    value={newTextbook.grade}
                    onChange={e =>
                      setNewTextbook(prev => ({
                        ...prev,
                        grade: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                  >
                    <option value="">학년을 선택하세요</option>
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 클래스 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    클래스 지정
                  </label>
                  <div className="space-y-2">
                    {classes.map(classItem => (
                      <label
                        key={classItem.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newTextbook.classIds.includes(classItem.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewTextbook({
                                ...newTextbook,
                                classIds: [
                                  ...newTextbook.classIds,
                                  classItem.id,
                                ],
                              });
                            } else {
                              setNewTextbook({
                                ...newTextbook,
                                classIds: newTextbook.classIds.filter(
                                  id => id !== classItem.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                        />
                        <span className="text-sm text-slate-700">
                          {classItem.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 대단원 수 */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    대단원 수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTextbook.majorUnitCount || ''}
                    onChange={e => {
                      const value = e.target.value;
                      handleMajorUnitCountChange(
                        value === '' ? 0 : parseInt(value, 10) || 0
                      );
                    }}
                    placeholder="대단원 수를 입력하세요"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    대단원 수를 입력하면 각 대단원별로 소단원 수를 설정할 수
                    있습니다.
                  </p>
                </div>

                {/* 대단원별 소단원 수 */}
                {newTextbook.majorUnitCount > 0 && majorUnits.length > 0 && (
                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        대단원별 설정
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        각 대단원마다 소단원 수를 개별적으로 설정할 수 있습니다.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {majorUnits.map((unit, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {index + 1}번째 대단원
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              소단원 수
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unit.minorUnitCount}
                              onChange={e =>
                                handleMajorUnitMinorCountChange(
                                  index,
                                  Number(e.target.value)
                                )
                              }
                              placeholder="소단원 수"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white hover:bg-[#063a5a] transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AdminHomeworkPage;
