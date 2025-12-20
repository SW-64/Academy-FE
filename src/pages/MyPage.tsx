import MainLayout from './MainLayout';

function MyPage() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">마이페이지</h1>
      </header>

      {/* 사용자 정보 카드 */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">내 정보</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm text-slate-600">이름</span>
            <span className="text-sm font-medium text-slate-900">홍길동</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm text-slate-600">이메일</span>
            <span className="text-sm font-medium text-slate-900">
              student@example.com
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">역할</span>
            <span className="text-sm font-medium text-slate-900">학생</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MyPage;
