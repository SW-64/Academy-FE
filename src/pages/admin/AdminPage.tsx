import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import MainLayout from '../MainLayout';

// 더미 데이터 - 학생 20명
const initialStudents = Array.from({ length: 20 }, (_, i) => ({
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

// 더미 데이터 - 학부모 20명
const initialParents = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `학부모${i + 1}`,
  email: `parent${i + 1}@example.com`,
  phone: `010-${String(i + 21).padStart(4, '0')}-${String(i + 21).padStart(
    4,
    '0'
  )}`,
  linkedStudent: `학생${i + 1}`,
}));

const dummyPendingUsers = [
  {
    id: 1,
    name: '최학생',
    email: 'student4@example.com',
    role: '학생',
    requestedAt: '2025-02-15',
  },
  {
    id: 2,
    name: '정학부모',
    email: 'parent3@example.com',
    role: '학부모',
    requestedAt: '2025-02-16',
  },
];

const dummyBlacklistUsers = [
  {
    id: 1,
    name: '김블랙',
    email: 'black1@example.com',
    role: '학생',
    requestedAt: '2025-01-10',
  },
  {
    id: 2,
    name: '이블랙',
    email: 'black2@example.com',
    role: '학부모',
    requestedAt: '2025-01-15',
  },
];

type TabType = 'students' | 'parents' | 'pending' | 'blacklist';

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

type Parent = {
  id: number;
  name: string;
  email: string;
  phone: string;
  linkedStudent: string;
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [showCalendar, setShowCalendar] = useState(false);
  const [pendingUsers, setPendingUsers] = useState(dummyPendingUsers);
  const [blacklistUsers, setBlacklistUsers] = useState(dummyBlacklistUsers);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [studentPage, setStudentPage] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  const itemsPerPage = 10;

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    setStudentPage(1);
    setParentPage(1);
  }, [activeTab]);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    school: '',
    phone: '',
    grade: '',
  });
  const [editParentForm, setEditParentForm] = useState({
    name: '',
    phone: '',
    linkedStudent: '',
  });

  // 학생-부모 연동 관계 (학생 ID -> 부모 ID, 1명만 가능)
  const [studentParentLinks, setStudentParentLinks] = useState<
    Record<number, number>
  >({});

  // 부모 검색 상태
  const [parentSearchQuery, setParentSearchQuery] = useState('');

  // 검색 결과 상태 (검색 버튼을 눌렀을 때만 표시)
  const [searchResults, setSearchResults] = useState<Parent[]>([]);

  // 검색 실행 여부
  const [hasSearched, setHasSearched] = useState(false);

  // 삭제 확인 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deletingParent, setDeletingParent] = useState<Parent | null>(null);

  const handleApprove = (id: number) => {
    const user = pendingUsers.find(u => u.id === id);
    if (!user) return;

    // 승인 처리
    setPendingUsers(prev => prev.filter(u => u.id !== id));

    // 학생이면 전체 학생 목록으로, 학부모면 전체 학부모 목록으로 이동
    if (user.role === '학생') {
      setActiveTab('students');
    } else {
      setActiveTab('parents');
    }
  };

  const handleReject = (id: number) => {
    // 거절 처리: 미승인 목록에서 제거
    if (confirm('정말 이 유저의 가입 신청을 거절하시겠습니까?')) {
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleRestore = (id: number) => {
    // 복구 처리: 블랙리스트에서 제거
    if (confirm('정말 이 유저를 블랙리스트에서 복구하시겠습니까?')) {
      setBlacklistUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setParentSearchQuery(''); // 검색어 초기화
    setSearchResults([]); // 검색 결과 초기화
    setHasSearched(false); // 검색 여부 초기화
    // 학교 이름에서 "고등학교" 제거한 앞부분만 추출
    const schoolName = student.school.replace('고등학교', '');
    // 연락처에서 '-' 제거
    const phoneWithoutDash = student.phone.replace(/-/g, '');
    // 학년에서 "학년" 제거하고 숫자만 추출
    const gradeNumber = student.grade.replace('학년', '');
    setEditForm({
      name: student.name,
      school: schoolName,
      phone: phoneWithoutDash,
      grade: gradeNumber,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: editForm.name,
                school: `${editForm.school}고등학교`,
                phone: editForm.phone.replace(
                  /(\d{3})(\d{4})(\d{4})/,
                  '$1-$2-$3'
                ),
                grade: `${editForm.grade}학년`,
              }
            : s
        )
      );
      setEditingStudent(null);
    }
    if (editingParent) {
      setParents(prev =>
        prev.map(p =>
          p.id === editingParent.id
            ? {
                ...p,
                name: editParentForm.name,
                phone: editParentForm.phone,
                linkedStudent: editParentForm.linkedStudent,
              }
            : p
        )
      );
      setEditingParent(null);
    }
    setEditModalOpen(false);
  };

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent);
    setEditParentForm({
      name: parent.name,
      phone: parent.phone,
      linkedStudent: parent.linkedStudent,
    });
    setEditModalOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setDeleteModalOpen(true);
  };

  const handleDeleteParent = (parent: Parent) => {
    setDeletingParent(parent);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingStudent) {
      setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
      setDeletingStudent(null);
    }
    if (deletingParent) {
      setParents(prev => prev.filter(p => p.id !== deletingParent.id));
      setDeletingParent(null);
    }
    setDeleteModalOpen(false);
  };

  const handleResetPassword = () => {
    if (confirm('정말 초기화할까요?')) {
      // 실제 비밀번호 초기화 로직은 여기에 구현
      // eslint-disable-next-line no-alert
      alert(
        editingStudent
          ? `${editingStudent.name} 학생의 비밀번호가 초기화되었습니다. (데모)`
          : `${editingParent?.name} 학부모의 비밀번호가 초기화되었습니다. (데모)`
      );
    }
  };

  // 부모 검색 함수 (검색 버튼 클릭 시 실행)
  const handleSearchParents = () => {
    if (!editingStudent) return;

    const linkedParentId = studentParentLinks[editingStudent.id];
    const query = parentSearchQuery.trim().toLowerCase();

    // 검색어가 있으면 필터링, 없으면 모든 부모 표시
    const filtered = parents.filter(parent => {
      // 이미 연동된 부모는 제외
      if (linkedParentId && parent.id === linkedParentId) {
        return false;
      }
      // 검색어 필터링
      if (query) {
        return (
          parent.name.toLowerCase().includes(query) ||
          parent.email.toLowerCase().includes(query)
        );
      }
      return true;
    });

    setSearchResults(filtered);
    setHasSearched(true);
  };

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">학생 관리</h1>
        </div>
      </header>

      {/* 탭 */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'students'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          학생 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parents')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'parents'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          학부모 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          미승인된 유저
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('blacklist')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'blacklist'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          블랙리스트
        </button>
      </div>

      {/* 학생 관리 탭 */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              전체 학생 목록
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
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
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      학년
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연동된 학부모
                    </th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (studentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentStudents = students.slice(
                      startIndex,
                      endIndex
                    );
                    return currentStudents.map(student => (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
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
                          {student.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.grade}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {(() => {
                            const linkedParentId =
                              studentParentLinks[student.id];
                            if (!linkedParentId) {
                              return <span className="text-slate-400">-</span>;
                            }
                            const linkedParent = parents.find(
                              p => p.id === linkedParentId
                            );
                            return linkedParent ? (
                              <span>{linkedParent.name}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditStudent(student)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            {/* 학생 페이지네이션 */}
            {(() => {
              const totalPages = Math.ceil(students.length / itemsPerPage);
              return (
                <div className="mt-6 flex items-center justify-center gap-2">
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
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
                    )
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setStudentPage(prev => Math.min(totalPages, prev + 1))
                    }
                    disabled={studentPage === totalPages}
                    className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}
          </section>
        </div>
      )}

      {/* 학부모 관리 탭 */}
      {activeTab === 'parents' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              전체 학부모 목록
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연동 학생
                    </th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (parentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentParents = parents.slice(startIndex, endIndex);
                    return currentParents.map(parent => (
                      <tr
                        key={parent.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {parent.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.linkedStudent}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditParent(parent)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParent(parent)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            {/* 학부모 페이지네이션 */}
            {(() => {
              const totalPages = Math.ceil(parents.length / itemsPerPage);
              return (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setParentPage(prev => Math.max(1, prev - 1))}
                    disabled={parentPage === 1}
                    className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setParentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          parentPage === page
                            ? 'bg-[#084773] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setParentPage(prev => Math.min(totalPages, prev + 1))
                    }
                    disabled={parentPage === totalPages}
                    className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}
          </section>
        </div>
      )}

      {/* 미승인된 유저 탭 */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              미승인된 유저
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      역할
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      신청일
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      처리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        미승인된 유저가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.requestedAt}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(user.id)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              승인
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(user.id)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              거절
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 블랙리스트 탭 */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              블랙리스트
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-red-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      역할
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      신청일
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      처리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blacklistUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        블랙리스트에 등록된 유저가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    blacklistUsers.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.requestedAt}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestore(user.id)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              복구
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 수정 모달 */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-md h-[90vh] max-h-[800px] flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 (고정) */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingStudent ? '학생 정보 수정' : '학부모 정보 수정'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingStudent(null);
                  setEditingParent(null);
                }}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 본문 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={editingStudent ? editForm.name : editParentForm.name}
                  onChange={e =>
                    editingStudent
                      ? setEditForm({ ...editForm, name: e.target.value })
                      : setEditParentForm({
                          ...editParentForm,
                          name: e.target.value,
                        })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              {editingStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학교
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={e =>
                          setEditForm({ ...editForm, school: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                        placeholder="학교명 앞부분"
                      />
                      <span className="text-sm text-slate-600 whitespace-nowrap">
                        고등학교
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      연락처
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => {
                        // 숫자만 입력 허용
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        // 최대 11자리로 제한 (01012345678)
                        if (value.length <= 11) {
                          setEditForm({ ...editForm, phone: value });
                        }
                      }}
                      placeholder="01012345678"
                      maxLength={11}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    />
                    {editForm.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {editForm.phone.length < 11
                          ? `${editForm.phone.length}자 입력됨 (11자 필요)`
                          : editForm.phone.replace(
                              /(\d{3})(\d{4})(\d{4})/,
                              '$1-$2-$3'
                            )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학년
                    </label>
                    <select
                      value={editForm.grade}
                      onChange={e =>
                        setEditForm({ ...editForm, grade: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    >
                      <option value="">학년 선택</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                    >
                      비밀번호 초기화
                    </button>
                  </div>

                  {/* 부모 목록 및 연동 */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      부모 목록
                    </label>

                    {/* 부모 검색 */}
                    <div className="mb-3 flex gap-2">
                      <input
                        type="text"
                        value={parentSearchQuery}
                        onChange={e => setParentSearchQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleSearchParents();
                          }
                        }}
                        placeholder="부모 이름 또는 이메일로 검색..."
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                      />
                      <button
                        type="button"
                        onClick={handleSearchParents}
                        className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] flex items-center gap-1"
                      >
                        <Search className="h-4 w-4" />
                        검색
                      </button>
                    </div>

                    {/* 연동된 부모 목록 */}
                    {editingStudent && (
                      <>
                        <div className="mb-3 h-16 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
                          {(() => {
                            const linkedParentId =
                              studentParentLinks[editingStudent.id];

                            if (!linkedParentId) {
                              return (
                                <div className="h-full flex items-center justify-center">
                                  <div className="text-sm text-slate-400">
                                    {/* 빈 상태 - 아무것도 표시하지 않음 */}
                                  </div>
                                </div>
                              );
                            }

                            const linkedParent = parents.find(
                              p => p.id === linkedParentId
                            );

                            if (!linkedParent) {
                              return (
                                <div className="h-full flex items-center justify-center">
                                  <div className="text-sm text-slate-400">
                                    {/* 빈 상태 - 아무것도 표시하지 않음 */}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="divide-y divide-slate-200">
                                <div className="flex items-center justify-between px-3 py-2 hover:bg-white">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-900">
                                      {linkedParent.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {linkedParent.email} |{' '}
                                      {linkedParent.phone}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStudentParentLinks(prev => {
                                        const newLinks = { ...prev };
                                        delete newLinks[editingStudent.id];
                                        return newLinks;
                                      });
                                    }}
                                    className="ml-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                  >
                                    연동 해제
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 검색 가능한 부모 목록 (검색 버튼을 눌렀을 때만 표시) */}
                        {hasSearched && (
                          <div className="mb-3 h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
                            {searchResults.length === 0 ? (
                              <div className="px-3 py-4 text-center text-sm text-slate-500">
                                {parentSearchQuery.trim()
                                  ? '검색 결과가 없습니다.'
                                  : '검색 결과가 없습니다.'}
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-200">
                                {searchResults.map(parent => (
                                  <div
                                    key={parent.id}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-white"
                                  >
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-slate-900">
                                        {parent.name}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {parent.email} | {parent.phone}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStudentParentLinks(prev => ({
                                          ...prev,
                                          [editingStudent.id]: parent.id,
                                        }));
                                        setSearchResults([]);
                                        setHasSearched(false);
                                        setParentSearchQuery('');
                                      }}
                                      className="ml-2 rounded-lg border border-[#084773] bg-[#084773] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#063a5a]"
                                    >
                                      연동
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      연락처
                    </label>
                    <input
                      type="text"
                      value={editParentForm.phone}
                      onChange={e =>
                        setEditParentForm({
                          ...editParentForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      연동 학생
                    </label>
                    <input
                      type="text"
                      value={editParentForm.linkedStudent}
                      onChange={e =>
                        setEditParentForm({
                          ...editParentForm,
                          linkedStudent: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                    >
                      비밀번호 초기화
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 하단 버튼 (고정) */}
            <div className="flex-shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingStudent(null);
                  setEditingParent(null);
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
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              삭제 확인
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              정말 이{' '}
              {deletingStudent ? '학생' : deletingParent ? '학부모' : ''}을
              삭제하시겠습니까?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingStudent(null);
                  setDeletingParent(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminPage;
