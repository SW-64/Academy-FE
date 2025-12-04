import MainLayout from './MainLayout';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
const dummyIntegrations = [
  {
    id: 1,
    name: 'Google Classroom',
    status: '연동됨',
    connectedAt: '2025-02-01',
  },
];

function IntegrationsPage() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">연동</h1>
        <p className="mt-1 text-sm text-slate-600">
          다양한 서비스와 연동하여 더 편리하게 이용하실 수 있습니다.
        </p>
      </header>

      {/* 연동 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dummyIntegrations.map(integration => (
          <div
            key={integration.id}
            className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {integration.name}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    {integration.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  연동일: {integration.connectedAt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default IntegrationsPage;
