import { useState } from 'react';
import { Plus, X, Trash2, BookOpen, Edit2 } from 'lucide-react';
import MainLayout from '../MainLayout';

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
  classId: number;
  className: string;
  unitCount: number;
  majorUnitCount: number;
  minorUnitCount: number;
  subUnits: SubUnit[];
};

// 더미 클래스 데이터
const dummyClasses: ClassType[] = [
  { id: 1, name: '예비고2 월금 정규반' },
  { id: 2, name: '예비고2 화목 정규반' },
  { id: 3, name: '미적분1 기본 특강반' },
  { id: 4, name: '미적분1+2 통합 특강반' },
];

// 학년 옵션
const gradeOptions = [
  '1학년',
  '2학년',
  '3학년',
  '예비고1',
  '예비고2',
  '예비고3',
];

// 초기 예시 교재 데이터
const initialTextbooks: Textbook[] = [
  {
    id: 1,
    name: '수학의 정석',
    grade: '예비고2',
    classId: 1,
    className: '예비고2 월금 정규반',
    unitCount: 9,
    majorUnitCount: 3,
    minorUnitCount: 3,
    subUnits: [
      { id: '1', name: '대단원', subUnitCount: 3 },
      { id: '2', name: '소단원', subUnitCount: 3 },
      { id: '3', name: '스텝', subUnitCount: 2 },
    ],
  },
  {
    id: 2,
    name: '미적분 기본서',
    grade: '예비고1',
    classId: 3,
    className: '미적분1 기본 특강반',
    unitCount: 8,
    majorUnitCount: 4,
    minorUnitCount: 2,
    subUnits: [
      { id: '4', name: '대단원', subUnitCount: 4 },
      { id: '5', name: '소단원', subUnitCount: 2 },
      { id: '6', name: '스텝', subUnitCount: 1 },
    ],
  },
  {
    id: 3,
    name: '수학 I 완전정복',
    grade: '1학년',
    classId: 2,
    className: '예비고2 화목 정규반',
    unitCount: 12,
    majorUnitCount: 6,
    minorUnitCount: 4,
    subUnits: [
      { id: '7', name: '대단원', subUnitCount: 6 },
      { id: '8', name: '소단원', subUnitCount: 4 },
      { id: '9', name: '스텝', subUnitCount: 3 },
    ],
  },
  {
    id: 4,
    name: '확률과 통계 마스터',
    grade: '2학년',
    classId: 4,
    className: '미적분1+2 통합 특강반',
    unitCount: 9,
    majorUnitCount: 5,
    minorUnitCount: 3,
    subUnits: [
      { id: '10', name: '대단원', subUnitCount: 5 },
      { id: '11', name: '소단원', subUnitCount: 3 },
      { id: '12', name: '스텝', subUnitCount: 2 },
    ],
  },
  {
    id: 5,
    name: '기하와 벡터 완성',
    grade: '3학년',
    classId: 1,
    className: '예비고2 월금 정규반',
    unitCount: 11,
    majorUnitCount: 6,
    minorUnitCount: 4,
    subUnits: [
      { id: '13', name: '대단원', subUnitCount: 6 },
      { id: '14', name: '소단원', subUnitCount: 4 },
      { id: '15', name: '스텝', subUnitCount: 3 },
    ],
  },
  {
    id: 6,
    name: '수학 II 실전 문제집',
    grade: '예비고3',
    classId: 2,
    className: '예비고2 화목 정규반',
    unitCount: 14,
    majorUnitCount: 7,
    minorUnitCount: 5,
    subUnits: [
      { id: '16', name: '대단원', subUnitCount: 7 },
      { id: '17', name: '소단원', subUnitCount: 5 },
      { id: '18', name: '스텝', subUnitCount: 4 },
    ],
  },
  {
    id: 7,
    name: '미적분 II 심화',
    grade: '예비고2',
    classId: 3,
    className: '미적분1 기본 특강반',
    unitCount: 10,
    majorUnitCount: 5,
    minorUnitCount: 3,
    subUnits: [
      { id: '19', name: '대단원', subUnitCount: 5 },
      { id: '20', name: '소단원', subUnitCount: 3 },
      { id: '21', name: '스텝', subUnitCount: 2 },
    ],
  },
  {
    id: 8,
    name: '수학 상하 통합',
    grade: '1학년',
    classId: 4,
    className: '미적분1+2 통합 특강반',
    unitCount: 16,
    majorUnitCount: 8,
    minorUnitCount: 6,
    subUnits: [
      { id: '22', name: '대단원', subUnitCount: 8 },
      { id: '23', name: '소단원', subUnitCount: 6 },
      { id: '24', name: '스텝', subUnitCount: 5 },
    ],
  },
  {
    id: 9,
    name: '수능 수학 완벽 대비',
    grade: '3학년',
    classId: 1,
    className: '예비고2 월금 정규반',
    unitCount: 15,
    majorUnitCount: 8,
    minorUnitCount: 5,
    subUnits: [
      { id: '25', name: '대단원', subUnitCount: 8 },
      { id: '26', name: '소단원', subUnitCount: 5 },
      { id: '27', name: '스텝', subUnitCount: 4 },
    ],
  },
  {
    id: 10,
    name: '수학의 바이블',
    grade: '예비고1',
    classId: 2,
    className: '예비고2 화목 정규반',
    unitCount: 13,
    majorUnitCount: 7,
    minorUnitCount: 4,
    subUnits: [
      { id: '28', name: '대단원', subUnitCount: 7 },
      { id: '29', name: '소단원', subUnitCount: 4 },
      { id: '30', name: '스텝', subUnitCount: 3 },
    ],
  },
];

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
    classId: 0,
    majorUnitCount: 0,
    minorUnitCount: 0,
  });
  const [majorUnits, setMajorUnits] = useState<
    Array<{ minorUnitCount: number }>
  >([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditingTextbookId(null);
    setNewTextbook({
      name: '',
      grade: '',
      classId: 0,
      majorUnitCount: 0,
      minorUnitCount: 0,
    });
    setMajorUnits([]);
  };

  const handleOpenEditModal = (textbook: Textbook) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditingTextbookId(textbook.id);
    const majorUnitCount = textbook.majorUnitCount || textbook.unitCount;
    
    // 기존 데이터에 majorUnitsDetail이 있으면 사용, 없으면 전역 값으로 모든 대단원에 동일하게 적용
    const textbookWithDetail = textbook as Textbook & {
      majorUnitsDetail?: Array<{
        majorUnitIndex: number;
        minorUnitCount: number;
      }>;
    };
    
    let initialMajorUnits: Array<{ minorUnitCount: number }>;
    
    if (textbookWithDetail.majorUnitsDetail && textbookWithDetail.majorUnitsDetail.length > 0) {
      // 기존에 저장된 대단원별 상세 정보가 있으면 사용
      initialMajorUnits = Array.from({ length: majorUnitCount }, (_, index) => {
        const detail = textbookWithDetail.majorUnitsDetail?.find(
          d => d.majorUnitIndex === index + 1
        );
        return {
          minorUnitCount: detail?.minorUnitCount || textbook.minorUnitCount || 0,
        };
      });
    } else {
      // 기존 데이터를 대단원별 구조로 변환
      // 기존에는 전역 소단원 수만 있었으므로, 모든 대단원에 동일하게 적용
      initialMajorUnits = Array.from({ length: majorUnitCount }, () => ({
        minorUnitCount: textbook.minorUnitCount || 0,
      }));
    }
    
    setNewTextbook({
      name: textbook.name,
      grade: textbook.grade,
      classId: textbook.classId,
      majorUnitCount: majorUnitCount,
      minorUnitCount: textbook.minorUnitCount || 0,
    });
    setMajorUnits(initialMajorUnits);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTextbookId(null);
    setNewTextbook({
      name: '',
      grade: '',
      classId: 0,
      majorUnitCount: 0,
      minorUnitCount: 0,
    });
    setMajorUnits([]);
  };


  // 대단원 수 변경 시 majorUnits 배열 업데이트
  const handleMajorUnitCountChange = (value: string | number) => {
    // 문자열인 경우 숫자로 변환 (앞의 0 제거)
    const numValue = typeof value === 'string' 
      ? (value === '' ? 0 : parseInt(value, 10) || 0)
      : value;
    const newCount = Math.max(0, numValue);
    setNewTextbook(prev => ({ ...prev, majorUnitCount: newCount }));
    
    if (newCount > majorUnits.length) {
      // 대단원 수가 증가하면 기본값으로 추가
      const defaultMinorCount = majorUnits.length > 0 
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


  const handleSave = () => {
    if (!newTextbook.name || !newTextbook.grade || !newTextbook.classId) {
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

    const selectedClass = dummyClasses.find(c => c.id === newTextbook.classId);

    // 평균 소단원 수 계산 (하위 호환성 유지)
    const avgMinorUnitCount = Math.round(
      majorUnits.reduce((sum, unit) => sum + unit.minorUnitCount, 0) /
        majorUnits.length
    );

    // 대단원별 정보를 subUnits에 저장 (확장 가능한 구조)
    // 각 대단원의 정보를 별도로 저장할 수도 있지만, 현재 구조 유지를 위해
    // 평균값을 사용하되, 실제 데이터는 majorUnits 배열에 저장
    const textbookData: Textbook = {
      id:
        isEditMode && editingTextbookId
          ? editingTextbookId
          : textbooks.length + 1,
      name: newTextbook.name,
      grade: newTextbook.grade,
      classId: newTextbook.classId,
      className: selectedClass?.name || '',
      unitCount: newTextbook.majorUnitCount,
      majorUnitCount: newTextbook.majorUnitCount,
      minorUnitCount: avgMinorUnitCount, // 평균값 저장 (하위 호환성)
      subUnits: [],
      // 대단원별 상세 정보는 확장을 위해 별도 필드에 저장 가능
      // majorUnitsDetail: majorUnits, // 필요시 추가
    };

    // majorUnits 정보를 subUnits에 포함시키기 위해 확장
    // 각 대단원별 정보를 저장할 수 있도록 구조 확장
    (textbookData as any).majorUnitsDetail = majorUnits.map((unit, index) => ({
      majorUnitIndex: index + 1,
      minorUnitCount: unit.minorUnitCount,
    }));

    if (isEditMode && editingTextbookId) {
      setTextbooks(
        textbooks.map(t => (t.id === editingTextbookId ? textbookData : t))
      );
      if (selectedTextbook?.id === editingTextbookId) {
        setSelectedTextbook(textbookData);
      }
    } else {
      setTextbooks([...textbooks, textbookData]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 이 교재를 삭제하시겠습니까?')) {
      setTextbooks(textbooks.filter(t => t.id !== id));
      if (selectedTextbook?.id === id) {
        setSelectedTextbook(null);
      }
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
            {textbooks.length === 0 ? (
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
                    onClick={() => setSelectedTextbook(textbook)}
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
                      {textbook.grade} · {textbook.className}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 교재 정보 */}
          <div className="lg:col-span-2">
            {selectedTextbook ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {selectedTextbook.name}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>학년: {selectedTextbook.grade}</p>
                      <p>클래스: {selectedTextbook.className}</p>
                      <p>
                        대단원:{' '}
                        {selectedTextbook.majorUnitCount ||
                          selectedTextbook.unitCount}
                        개
                      </p>
                      <p>소단원: {selectedTextbook.minorUnitCount}개</p>
                      {/* 하위 단원 목록 */}
                      {selectedTextbook.subUnits.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {selectedTextbook.subUnits.map(subUnit => (
                            <p
                              key={subUnit.id}
                              className="text-sm text-slate-600"
                            >
                              {subUnit.name}: {subUnit.subUnitCount}개
                            </p>
                          ))}
                        </div>
                      )}
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
                    클래스
                  </label>
                  <select
                    value={newTextbook.classId}
                    onChange={e =>
                      setNewTextbook(prev => ({
                        ...prev,
                        classId: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                  >
                    <option value="0">클래스를 선택하세요</option>
                    {dummyClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
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
                      handleMajorUnitCountChange(value === '' ? 0 : parseInt(value, 10) || 0);
                    }}
                    placeholder="대단원 수를 입력하세요"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-2 focus:ring-[#084773]/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    대단원 수를 입력하면 각 대단원별로 소단원 수를 설정할 수 있습니다.
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
