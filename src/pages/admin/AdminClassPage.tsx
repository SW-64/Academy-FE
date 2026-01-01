import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import MainLayout from '../MainLayout';

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  studentIds: number[];
};

// 더미 학생 데이터
const dummyStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `학생${i + 1}`,
  email: `student${i + 1}@example.com`,
  phone: `010-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
  school: [
    '서울고등학교',
    '부산고등학교',
    '대전고등학교',
    '인천고등학교',
    '광주고등학교',
  ][i % 5],
  grade: `${(i % 3) + 1}학년`,
}));

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
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
  {
    id: 4,
    name: '미적분1+2 통합 특강반',
    studentCount: 18,
    studentIds: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 2, 4, 6],
  },
];

function AdminClassPage() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [classes, setClasses] = useState<ClassType[]>(dummyClasses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editSearchStudent, setEditSearchStudent] = useState('');
  const [editSelectedStudentIds, setEditSelectedStudentIds] = useState<number[]>([]);

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 검색된 학생 목록 필터링
  const filteredStudents = dummyStudents.filter(student =>
    student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      alert('클래스 이름을 입력해주세요.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert('최소 한 명의 학생을 추가해주세요.');
      return;
    }

    const newClass: ClassType = {
      id: classes.length + 1,
      name: newClassName,
      studentCount: selectedStudentIds.length,
      studentIds: selectedStudentIds,
    };

    setClasses(prev => [...prev, newClass]);
    setNewClassName('');
    setSelectedStudentIds([]);
    setSearchStudent('');
    setIsAddModalOpen(false);
  };

  const handleToggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleClassClick = (classItem: ClassType) => {
    setSelectedClass(classItem);
    setEditClassName(classItem.name);
    setEditSelectedStudentIds([...classItem.studentIds]);
    setEditSearchStudent('');
    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedClass) return;
    if (!editClassName.trim()) {
      alert('클래스 이름을 입력해주세요.');
      return;
    }

    setClasses(prev =>
      prev.map(c =>
        c.id === selectedClass.id
          ? {
              ...c,
              name: editClassName,
              studentIds: editSelectedStudentIds,
              studentCount: editSelectedStudentIds.length,
            }
          : c
      )
    );

    setIsEditMode(false);
    setSelectedClass(prev =>
      prev
        ? {
            ...prev,
            name: editClassName,
            studentIds: editSelectedStudentIds,
            studentCount: editSelectedStudentIds.length,
          }
        : null
    );
    alert('수정이 완료되었습니다.');
  };

  const handleDeleteClass = () => {
    if (!selectedClass) return;
    if (!confirm('정말 이 클래스를 삭제하시겠습니까?')) return;

    setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
    setIsDetailModalOpen(false);
    setSelectedClass(null);
    alert('클래스가 삭제되었습니다.');
  };

  const handleToggleEditStudent = (studentId: number) => {
    setEditSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 수정 모달에서 검색된 학생 목록 필터링
  const filteredEditStudents = dummyStudents.filter(student =>
    student.name.toLowerCase().includes(editSearchStudent.toLowerCase()) ||
    student.email.toLowerCase().includes(editSearchStudent.toLowerCase())
  );

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">클래스 관리</h1>
        </div>
      </header>

      {/* 클래스 목록 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">전체 클래스</h2>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
          >
            <Plus className="h-4 w-4" />
            클래스 추가
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {classes.map(classItem => (
            <div
              key={classItem.id}
              onClick={() => handleClassClick(classItem)}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {classItem.name}
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>수강 인원</span>
                  <span className="font-medium text-slate-900">
                    {classItem.studentCount}명
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 클래스 추가 모달 */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl h-[90vh] rounded-2xl bg-white p-6 shadow-xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900 flex-shrink-0">
              클래스 추가
            </h2>

            <div className="space-y-6 flex-1 overflow-y-auto min-h-0">
              {/* 클래스 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  클래스 이름
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="예: 예비고2 월금 정규반"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              {/* 학생 추가 섹션 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학생 추가
                </label>
                
                {/* 검색 칸 */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={e => setSearchStudent(e.target.value)}
                    placeholder="학생 이름 또는 이메일로 검색..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>

                {/* 선택된 학생 목록 */}
                {selectedStudentIds.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      선택된 학생 ({selectedStudentIds.length}명)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudentIds.map(studentId => {
                        const student = dummyStudents.find(s => s.id === studentId);
                        return (
                          <div
                            key={studentId}
                            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm"
                          >
                            <span className="text-slate-900">{student?.name}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(studentId)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 학생 목록 */}
                <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          선택
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          이름
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          이메일
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          학교
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          학년
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-4 text-center text-sm text-slate-500"
                          >
                            검색 결과가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr
                            key={student.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(student.id)}
                                onChange={() => handleToggleStudent(student.id)}
                                className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.email}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.school}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.grade}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewClassName('');
                  setSelectedStudentIds([]);
                  setSearchStudent('');
                }}
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddClass}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 클래스 상세 모달 */}
      {isDetailModalOpen && selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] rounded-2xl bg-white p-6 shadow-xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-slate-900">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editClassName}
                    onChange={e => setEditClassName(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xl font-semibold focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                ) : (
                  selectedClass.name
                )}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {isEditMode ? (
                <div className="space-y-6">
                  {/* 학생 추가/제거 섹션 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      학생 관리
                    </label>
                    
                    {/* 검색 칸 */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={editSearchStudent}
                        onChange={e => setEditSearchStudent(e.target.value)}
                        placeholder="학생 이름 또는 이메일로 검색..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                      />
                    </div>

                    {/* 선택된 학생 목록 */}
                    {editSelectedStudentIds.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-600 mb-2">
                          선택된 학생 ({editSelectedStudentIds.length}명)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {editSelectedStudentIds.map(studentId => {
                            const student = dummyStudents.find(s => s.id === studentId);
                            return (
                              <div
                                key={studentId}
                                className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm"
                              >
                                <span className="text-slate-900">{student?.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleEditStudent(studentId)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 학생 목록 */}
                    <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-200">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                              선택
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                              이름
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                              이메일
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                              학교
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                              학년
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEditStudents.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-4 text-center text-sm text-slate-500"
                              >
                                검색 결과가 없습니다.
                              </td>
                            </tr>
                          ) : (
                            filteredEditStudents.map(student => (
                              <tr
                                key={student.id}
                                className="border-b border-slate-100 hover:bg-slate-50"
                              >
                                <td className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={editSelectedStudentIds.includes(student.id)}
                                    onChange={() => handleToggleEditStudent(student.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                                  />
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-900">
                                  {student.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600">
                                  {student.email}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600">
                                  {student.school}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600">
                                  {student.grade}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      학생 목록 ({selectedClass.studentCount}명)
                    </h3>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                            이름
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                            이메일
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                            학교
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                            학년
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.studentIds.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-8 text-center text-sm text-slate-500"
                            >
                              등록된 학생이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          selectedClass.studentIds.map(studentId => {
                            const student = dummyStudents.find(s => s.id === studentId);
                            if (!student) return null;
                            return (
                              <tr
                                key={studentId}
                                className="border-b border-slate-100 hover:bg-slate-50"
                              >
                                <td className="px-4 py-3 text-sm text-slate-900">
                                  {student.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {student.email}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {student.school}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {student.grade}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 영역 */}
            <div className="mt-6 flex justify-end gap-2 flex-shrink-0 pt-4 border-t border-slate-200">
              {isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditClassName(selectedClass.name);
                      setEditSelectedStudentIds([...selectedClass.studentIds]);
                      setEditSearchStudent('');
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                  >
                    저장
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClass}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminClassPage;

