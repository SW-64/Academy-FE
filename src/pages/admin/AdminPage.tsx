import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MainLayout from '../MainLayout';

// 더미 데이터
const initialStudents = [
  {
    id: 1,
    name: '김학생',
    email: 'student1@example.com',
    phone: '010-1111-2222',
    school: '서울고등학교',
    grade: '1학년',
  },
  {
    id: 2,
    name: '박학생',
    email: 'student2@example.com',
    phone: '010-3333-4444',
    school: '부산고등학교',
    grade: '2학년',
  },
  {
    id: 3,
    name: '이학생',
    email: 'student3@example.com',
    phone: '010-5555-6666',
    school: '대전고등학교',
    grade: '3학년',
  },
];

const initialParents = [
  {
    id: 1,
    name: '김학부모',
    email: 'parent1@example.com',
    phone: '010-7777-8888',
    linkedStudent: '김학생',
  },
  {
    id: 2,
    name: '박학부모',
    email: 'parent2@example.com',
    phone: '010-9999-0000',
    linkedStudent: '박학생',
  },
];

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

type TabType = 'students' | 'parents' | 'pending';

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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [parents, setParents] = useState<Parent[]>(initialParents);

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    school: '',
    phone: '',
    grade: '',
  });

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

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      school: student.school,
      phone: student.phone,
      grade: student.grade,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;

    setStudents(prev =>
      prev.map(s =>
        s.id === editingStudent.id
          ? {
              ...s,
              name: editForm.name,
              school: editForm.school,
              phone: editForm.phone,
              grade: editForm.grade,
            }
          : s
      )
    );

    setEditModalOpen(false);
    setEditingStudent(null);
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

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">학생 관리</h1>
          <p className="mt-1 text-sm text-slate-600">
            전체 학생 및 학부모 목록을 관리하고 미승인 유저를 승인할 수 있습니다.
          </p>
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
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
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
                  ))}
                </tbody>
              </table>
            </div>
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
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map(parent => (
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
                            onClick={() => handleDeleteParent(parent)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
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
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleApprove(user.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-[#084773] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#063a5a]"
                          >
                            ✓ 승인
                          </button>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              학생 정보 수정
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학교
                </label>
                <input
                  type="text"
                  value={editForm.school}
                  onChange={e =>
                    setEditForm({ ...editForm, school: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  연락처
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학년
                </label>
                <input
                  type="text"
                  value={editForm.grade}
                  onChange={e =>
                    setEditForm({ ...editForm, grade: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteModalOpen(false)}
        >
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
