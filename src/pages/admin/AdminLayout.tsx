import { NavLink, Outlet, useLocation } from 'react-router-dom';

const adminTabs = [
  { label: '시험', path: '/admin/exams' },
  { label: '학습자료', path: '/admin/materials' },
  { label: '영상', path: '/admin/videos' },
  { label: '유저 관리', path: '/admin/users' },
];

function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              관리자 페이지
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              시험, 학습자료, 영상, 유저 관리를 한 곳에서 확인하고 설정할 수
              있어요.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-amber-100/80 backdrop-blur">
            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
            관리자 모드
          </div>
        </header>

        {/* Tabs (top navigation) */}
        <nav className="mb-6 overflow-x-auto">
          <div className="inline-flex min-w-full gap-2 rounded-2xl bg-white/60 p-1 shadow-sm ring-1 ring-amber-100/80 backdrop-blur">
            {adminTabs.map(tab => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1">
          <div className="rounded-3xl bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-amber-100/80 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
