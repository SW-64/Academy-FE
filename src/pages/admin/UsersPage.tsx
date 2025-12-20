import { useMemo, useState, useEffect } from 'react';
import MainLayout from '../MainLayout';

type UserRole = '학생' | '학부모';
type UserStatus = '대기' | '승인' | '반려';

type PendingUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  requestedAt: string;
  status: UserStatus;
};

type SimpleUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
};

type LinkRelation = {
  id: number;
  parent: SimpleUser;
  child: SimpleUser;
  linkedAt: string;
};

const dummyPendingUsers: PendingUser[] = [
  {
    id: 1,
    name: '김학생',
    email: 'student1@example.com',
    role: '학생',
    requestedAt: '2025-02-01',
    status: '대기',
  },
  {
    id: 2,
    name: '이학부모',
    email: 'parent1@example.com',
    role: '학부모',
    requestedAt: '2025-02-02',
    status: '대기',
  },
];

const dummyUsers: SimpleUser[] = [
  {
    id: 1,
    name: '김학생',
    email: 'student1@example.com',
    role: '학생',
    phone: '010-1111-2222',
  },
  {
    id: 2,
    name: '박학생',
    email: 'student2@example.com',
    role: '학생',
    phone: '010-3333-4444',
  },
  {
    id: 3,
    name: '이학부모',
    email: 'parent1@example.com',
    role: '학부모',
    phone: '010-5555-6666',
  },
];

const dummyLinks: LinkRelation[] = [
  {
    id: 1,
    parent: dummyUsers[2],
    child: dummyUsers[0],
    linkedAt: '2025-02-03',
  },
];

type UserTabKey = 'approval' | 'edit' | 'link';

function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserTabKey>('approval');
  const [showCalendar, setShowCalendar] = useState(false);
  const [pendingUsers, setPendingUsers] =
    useState<PendingUser[]>(dummyPendingUsers);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('학생');

  const [parentId, setParentId] = useState<number | ''>('');
  const [childId, setChildId] = useState<number | ''>('');
  const [links, setLinks] = useState<LinkRelation[]>(dummyLinks);

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedUser = useMemo(
    () => dummyUsers.find(u => u.id === selectedUserId) ?? null,
    [selectedUserId]
  );

  const handleSelectUser = (id: number | '') => {
    setSelectedUserId(id);
    if (id === '') {
      setEditName('');
      setEditPhone('');
      setEditRole('학생');
      return;
    }
    const user = dummyUsers.find(u => u.id === id);
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone ?? '');
      setEditRole(user.role);
    }
  };

  const handleApprove = (id: number) => {
    setPendingUsers(prev =>
      prev.map(user => (user.id === id ? { ...user, status: '승인' } : user))
    );
  };

  const handleReject = (id: number) => {
    setPendingUsers(prev =>
      prev.map(user => (user.id === id ? { ...user, status: '반려' } : user))
    );
  };

  const handleSaveEdit = () => {
    // 실제 저장 대신 데모용 알림
    // eslint-disable-next-line no-alert
    alert('저장되었습니다. (데모)');
  };

  const handleLink = () => {
    if (!parentId || !childId) {
      // eslint-disable-next-line no-alert
      alert('부모와 자녀를 모두 선택해주세요. (데모)');
      return;
    }
    const parent = dummyUsers.find(
      u => u.id === parentId && u.role === '학부모'
    );
    const child = dummyUsers.find(u => u.id === childId && u.role === '학생');
    if (!parent || !child) {
      // eslint-disable-next-line no-alert
      alert('역할이 올바른 유저를 선택해주세요. (데모)');
      return;
    }
    const newRelation: LinkRelation = {
      id: links.length + 1,
      parent,
      child,
      linkedAt: '2025-02-10',
    };
    setLinks(prev => [...prev, newRelation]);
  };

  const handleUnlink = (id: number) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">유저 관리</h2>
      </header>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-amber-50/70 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('approval')}
          className={`rounded-xl px-4 py-1.5 text-xs font-medium transition ${
            activeTab === 'approval'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          계정 승인/반려
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`rounded-xl px-4 py-1.5 text-xs font-medium transition ${
            activeTab === 'edit'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          유저 정보 변경
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('link')}
          className={`rounded-xl px-4 py-1.5 text-xs font-medium transition ${
            activeTab === 'link'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          부모-자녀 연동
        </button>
      </div>

      {activeTab === 'approval' && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            계정 승인/반려
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-amber-100 bg-amber-50/40">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50 text-left text-[11px] font-semibold text-slate-600 sm:text-xs">
                  <th className="px-3 py-2">이름</th>
                  <th className="px-3 py-2">이메일</th>
                  <th className="px-3 py-2">역할</th>
                  <th className="px-3 py-2">신청일</th>
                  <th className="px-3 py-2">상태</th>
                  <th className="px-3 py-2">처리</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-amber-100/70 last:border-0 hover:bg-white/60"
                  >
                    <td className="px-3 py-2 text-slate-900">{user.name}</td>
                    <td className="px-3 py-2 text-slate-700">{user.email}</td>
                    <td className="px-3 py-2 text-slate-700">{user.role}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {user.requestedAt}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          user.status === '대기'
                            ? 'bg-amber-50 text-amber-700'
                            : user.status === '승인'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => handleApprove(user.id)}
                          className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-600"
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(user.id)}
                          className="rounded-full bg-rose-400 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-rose-500"
                        >
                          반려
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'edit' && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            유저 정보 변경
          </h3>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)]">
            <div className="space-y-2 rounded-2xl bg-amber-50/70 p-4">
              <label className="block text-xs font-medium text-slate-700">
                유저 선택
              </label>
              <select
                value={selectedUserId}
                onChange={e =>
                  handleSelectUser(e.target.value ? Number(e.target.value) : '')
                }
                className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
              >
                <option value="">유저를 선택하세요</option>
                {dummyUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                더미 유저 목록에서 정보를 선택해 수정하는 UI 데모입니다.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/70 p-4">
              {selectedUser ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      이름
                    </label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      연락처
                    </label>
                    <input
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      역할
                    </label>
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value as UserRole)}
                      className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
                    >
                      <option value="학생">학생</option>
                      <option value="학부모">학부모</option>
                    </select>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                    >
                      저장 (데모)
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  왼쪽에서 유저를 선택하면 이 영역에 수정 폼이 표시됩니다.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'link' && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            부모-자녀 연동
          </h3>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
            <div className="space-y-3 rounded-2xl bg-amber-50/70 p-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  부모 선택
                </label>
                <select
                  value={parentId}
                  onChange={e =>
                    setParentId(e.target.value ? Number(e.target.value) : '')
                  }
                  className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
                >
                  <option value="">부모를 선택하세요</option>
                  {dummyUsers
                    .filter(user => user.role === '학부모')
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  자녀 선택
                </label>
                <select
                  value={childId}
                  onChange={e =>
                    setChildId(e.target.value ? Number(e.target.value) : '')
                  }
                  className="mt-1 w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-amber-300 focus:ring"
                >
                  <option value="">자녀를 선택하세요</option>
                  {dummyUsers
                    .filter(user => user.role === '학생')
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleLink}
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                연동하기 (데모)
              </button>
            </div>

            <div className="space-y-2 rounded-2xl border border-amber-100 bg-white/70 p-4">
              <h4 className="text-xs font-semibold text-slate-800">
                현재 연동 목록
              </h4>
              <div className="overflow-x-auto rounded-2xl">
                <table className="min-w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50 text-left text-[11px] font-semibold text-slate-600 sm:text-xs">
                      <th className="px-3 py-2">부모</th>
                      <th className="px-3 py-2">자녀</th>
                      <th className="px-3 py-2">연동일</th>
                      <th className="px-3 py-2">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(link => (
                      <tr
                        key={link.id}
                        className="border-b border-amber-100/70 last:border-0 hover:bg-amber-50/40"
                      >
                        <td className="px-3 py-2 text-slate-900">
                          {link.parent.name}
                        </td>
                        <td className="px-3 py-2 text-slate-900">
                          {link.child.name}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {link.linkedAt}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleUnlink(link.id)}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
                          >
                            해제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
      </div>
    </MainLayout>
  );
}

export default UsersPage;
