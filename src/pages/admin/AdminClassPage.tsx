import { useState, useEffect } from 'react';
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  getClasses,
  getClassStudents,
  deleteClass,
  createClass,
  updateClass,
} from '../../api/class';
import { getStudents } from '../../api/students';

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

// 빈 데이터
const dummyClasses: ClassType[] = [];

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
  const [editSelectedStudentIds, setEditSelectedStudentIds] = useState<
    number[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);
  const [studentPage, setStudentPage] = useState(1);
  const [studentsMeta, setStudentsMeta] = useState<{
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const studentsPerPage = 10;
  // 수정 모드용 학생 목록
  const [editAllStudents, setEditAllStudents] = useState<Student[]>([]);
  const [isLoadingEditStudents, setIsLoadingEditStudents] = useState(false);
  const [editStudentPage, setEditStudentPage] = useState(1);
  const [editStudentsMeta, setEditStudentsMeta] = useState<{
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);

  // 클래스 목록 조회 API 호출
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await getClasses();
        // API 응답을 ClassType 형식으로 변환
        const transformedClasses: ClassType[] = response.data.map(
          classData => ({
            id: classData.classId,
            name: classData.className,
            studentCount: 0, // 학생 수는 별도 API로 가져와야 할 수 있음
            studentIds: [], // 학생 ID 목록은 별도 API로 가져와야 할 수 있음
          })
        );
        setClasses(transformedClasses);
      } catch (error) {
        console.error('클래스 목록 조회 에러:', error);
        // 에러 발생 시 빈 배열 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 클래스 추가 모달이 열릴 때 학생 목록 조회 (페이지네이션)
  useEffect(() => {
    if (isAddModalOpen) {
      const fetchAllStudents = async () => {
        setIsLoadingAllStudents(true);
        try {
          const response = await getStudents(studentPage, studentsPerPage);
          const transformedStudents: Student[] = response.data.items
            .filter(item => item.student != null)
            .map(item => ({
              id: item.student!.studentId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              school: item.student!.school,
              grade: `${item.student!.grade}학년`,
            }));
          setAllStudents(transformedStudents);
          setStudentsMeta(response.data.meta);
        } catch (error) {
          console.error('학생 목록 조회 에러:', error);
          setAllStudents([]);
          setStudentsMeta(null);
        } finally {
          setIsLoadingAllStudents(false);
        }
      };

      fetchAllStudents();
    } else {
      // 모달이 닫힐 때 페이지 리셋
      setStudentPage(1);
    }
  }, [isAddModalOpen, studentPage, studentsPerPage]);

  // 수정 모드일 때 전체 학생 목록 조회
  useEffect(() => {
    if (isEditMode && isDetailModalOpen) {
      const fetchEditStudents = async () => {
        setIsLoadingEditStudents(true);
        try {
          const response = await getStudents(editStudentPage, studentsPerPage);
          const transformedStudents: Student[] = response.data.items
            .filter(item => item.student != null)
            .map(item => ({
              id: item.student!.studentId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              school: item.student!.school,
              grade: `${item.student!.grade}학년`,
            }));
          setEditAllStudents(transformedStudents);
          setEditStudentsMeta(response.data.meta);
        } catch (error) {
          console.error('학생 목록 조회 에러:', error);
          setEditAllStudents([]);
          setEditStudentsMeta(null);
        } finally {
          setIsLoadingEditStudents(false);
        }
      };

      fetchEditStudents();
    } else {
      // 수정 모드가 아닐 때 페이지 리셋
      setEditStudentPage(1);
    }
  }, [isEditMode, isDetailModalOpen, editStudentPage, studentsPerPage]);

  // 검색된 학생 목록 필터링 (클래스 추가 모달용)
  const filteredStudents = allStudents.filter(
    student =>
      student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // 클래스 상세 모달에서 사용할 학생 목록 필터링 (수정 모드일 때는 전체 학생 목록 사용)
  const filteredEditStudents = isEditMode
    ? editAllStudents.filter(
        student =>
          student.name
            .toLowerCase()
            .includes(editSearchStudent.toLowerCase()) ||
          student.email.toLowerCase().includes(editSearchStudent.toLowerCase())
      )
    : classStudents.filter(
        student =>
          student.name
            .toLowerCase()
            .includes(editSearchStudent.toLowerCase()) ||
          student.email.toLowerCase().includes(editSearchStudent.toLowerCase())
      );

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      alert('클래스 이름을 입력해주세요.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert('최소 한 명의 학생을 추가해주세요.');
      return;
    }

    try {
      const response = await createClass({
        name: newClassName,
        studentIds: selectedStudentIds,
      });
      alert(response.message);

      // 클래스 목록 새로고침
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
        } finally {
          setIsLoading(false);
        }
      };
      fetchClasses();

      // 모달 닫기 및 상태 초기화
      setNewClassName('');
      setSelectedStudentIds([]);
      setSearchStudent('');
      setStudentPage(1);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('클래스 생성 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '클래스 생성에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleToggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleClassClick = async (classItem: ClassType) => {
    setSelectedClass(classItem);
    setEditClassName(classItem.name);
    setEditSearchStudent('');
    setIsEditMode(false);
    setIsDetailModalOpen(true);

    // 클래스 학생 목록 조회 API 호출
    setIsLoadingStudents(true);
    try {
      const response = await getClassStudents(classItem.id);
      // API 응답을 Student 형식으로 변환
      const transformedStudents: Student[] = response.data.studentClasses.map(
        studentClass => ({
          id: studentClass.student.studentId,
          name: studentClass.student.user.name,
          email: studentClass.student.user.email,
          phone: '', // API 응답에 phone이 없으므로 빈 문자열
          school: studentClass.student.school,
          grade: `${studentClass.student.grade}학년`,
        })
      );
      setClassStudents(transformedStudents);
      setEditSelectedStudentIds(transformedStudents.map(s => s.id));

      // 클래스 정보 업데이트 (학생 ID 목록만)
      setClasses(prev =>
        prev.map(c =>
          c.id === classItem.id
            ? {
                ...c,
                studentIds: transformedStudents.map(s => s.id),
              }
            : c
        )
      );
      setSelectedClass(prev =>
        prev
          ? {
              ...prev,
              studentIds: transformedStudents.map(s => s.id),
            }
          : null
      );
    } catch (error) {
      console.error('학생 목록 조회 에러:', error);
      setClassStudents([]);
      setEditSelectedStudentIds([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedClass) return;
    if (!editClassName.trim()) {
      alert('클래스 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await updateClass(selectedClass.id, {
        name: editClassName,
        studentIds: editSelectedStudentIds,
      });
      alert(response.message);

      // 클래스 목록 새로고침
      setIsLoading(true);
      try {
        const classesResponse = await getClasses();
        const transformedClasses: ClassType[] = classesResponse.data.map(
          classData => ({
            id: classData.classId,
            name: classData.className,
            studentCount: 0,
            studentIds: [],
          })
        );
        setClasses(transformedClasses);

        // 새로고침된 데이터에서 해당 클래스 찾기
        const updatedClass = transformedClasses.find(
          c => c.id === selectedClass.id
        );
        if (updatedClass) {
          // 클래스 학생 목록도 새로고침
          setIsLoadingStudents(true);
          try {
            const studentsResponse = await getClassStudents(selectedClass.id);
            const transformedStudents: Student[] =
              studentsResponse.data.studentClasses.map(studentClass => ({
                id: studentClass.student.studentId,
                name: studentClass.student.user.name,
                email: studentClass.student.user.email,
                phone: '',
                school: studentClass.student.school,
                grade: `${studentClass.student.grade}학년`,
              }));
            setClassStudents(transformedStudents);
            setEditSelectedStudentIds(transformedStudents.map(s => s.id));

            // selectedClass 업데이트 (클래스명과 학생 ID 모두)
            setSelectedClass({
              ...updatedClass,
              studentIds: transformedStudents.map(s => s.id),
            });
            // editClassName도 업데이트
            setEditClassName(updatedClass.name);
          } catch (error) {
            console.error('학생 목록 조회 에러:', error);
            // 학생 목록 조회 실패해도 클래스명은 업데이트
            setSelectedClass(updatedClass);
            setEditClassName(updatedClass.name);
          } finally {
            setIsLoadingStudents(false);
          }
        }
      } catch (error) {
        console.error('클래스 목록 조회 에러:', error);
      } finally {
        setIsLoading(false);
      }

      setIsEditMode(false);
    } catch (error) {
      console.error('클래스 수정 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '클래스 수정에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    if (!confirm('정말 이 클래스를 삭제하시겠습니까?')) return;

    try {
      await deleteClass(selectedClass.id);
      // 삭제 성공 시 목록에서 제거
      setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
      setIsDetailModalOpen(false);
      setSelectedClass(null);
      alert('클래스가 삭제되었습니다.');
    } catch (error) {
      console.error('클래스 삭제 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '클래스 삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleToggleEditStudent = (studentId: number) => {
    setEditSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-600">
              클래스 목록을 불러오는 중...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {classes.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-sm text-slate-600">
                  등록된 클래스가 없습니다.
                </p>
              </div>
            ) : (
              classes.map(classItem => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {classItem.name}
                  </h3>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* 클래스 추가 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-3xl h-[95vh] max-h-[900px] rounded-2xl bg-white p-6 shadow-xl overflow-hidden flex flex-col"
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
                    <div className="flex flex-wrap gap-2">
                      {selectedStudentIds.map(studentId => {
                        const student = allStudents.find(
                          s => s.id === studentId
                        );
                        return (
                          <div
                            key={studentId}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm"
                          >
                            <span className="text-slate-900">
                              {student?.name || `학생 ID: ${studentId}`}
                            </span>
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
                      {isLoadingAllStudents ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-4 text-center text-sm text-slate-500"
                          >
                            학생 목록을 불러오는 중...
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-4 text-center text-sm text-slate-500"
                          >
                            {searchStudent
                              ? '검색 결과가 없습니다.'
                              : '등록된 학생이 없습니다.'}
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
                                checked={selectedStudentIds.includes(
                                  student.id
                                )}
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
                {/* 학생 목록 페이지네이션 */}
                {studentsMeta && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStudentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={studentPage === 1}
                      className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from(
                      { length: studentsMeta.totalPages },
                      (_, i) => i + 1
                    ).map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setStudentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          studentPage === page
                            ? 'bg-[#084773] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setStudentPage(prev =>
                          Math.min(studentsMeta.totalPages, prev + 1)
                        )
                      }
                      disabled={studentPage === studentsMeta.totalPages}
                      className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
                  setStudentPage(1);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
                        <div className="flex flex-wrap gap-2">
                          {editSelectedStudentIds.map(studentId => {
                            const student = isEditMode
                              ? editAllStudents.find(s => s.id === studentId)
                              : classStudents.find(s => s.id === studentId);
                            return (
                              <div
                                key={studentId}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm"
                              >
                                <span className="text-slate-900">
                                  {student?.name || `학생 ID: ${studentId}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleEditStudent(studentId)
                                  }
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
                          {isEditMode && isLoadingEditStudents ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-4 text-center text-sm text-slate-500"
                              >
                                학생 목록을 불러오는 중...
                              </td>
                            </tr>
                          ) : !isEditMode && isLoadingStudents ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-4 text-center text-sm text-slate-500"
                              >
                                학생 목록을 불러오는 중...
                              </td>
                            </tr>
                          ) : filteredEditStudents.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-4 text-center text-sm text-slate-500"
                              >
                                {editSearchStudent
                                  ? '검색 결과가 없습니다.'
                                  : '등록된 학생이 없습니다.'}
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
                                    checked={editSelectedStudentIds.includes(
                                      student.id
                                    )}
                                    onChange={() =>
                                      handleToggleEditStudent(student.id)
                                    }
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
                    {/* 수정 모드 학생 목록 페이지네이션 */}
                    {isEditMode && editStudentsMeta && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditStudentPage(prev => Math.max(1, prev - 1))
                          }
                          disabled={editStudentPage === 1}
                          className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from(
                          { length: editStudentsMeta.totalPages },
                          (_, i) => i + 1
                        ).map(page => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setEditStudentPage(page)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              editStudentPage === page
                                ? 'bg-[#084773] text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setEditStudentPage(prev =>
                              Math.min(editStudentsMeta.totalPages, prev + 1)
                            )
                          }
                          disabled={
                            editStudentPage === editStudentsMeta.totalPages
                          }
                          className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      학생 목록
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
                          classStudents.map(student => (
                            <tr
                              key={student.id}
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
                          ))
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
