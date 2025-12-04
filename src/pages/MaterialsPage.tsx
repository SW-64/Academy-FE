import MainLayout from './MainLayout';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
const dummyMaterials = [
  {
    id: 1,
    title: '1주차 강의자료',
    subject: 'JavaScript 기본',
    type: 'PDF',
    updatedAt: '2025-02-01',
  },
  {
    id: 2,
    title: '컴포넌트 설계 슬라이드',
    subject: 'React',
    type: '슬라이드',
    updatedAt: '2025-02-05',
  },
];

function MaterialsPage() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">학습자료</h1>
        <p className="mt-1 text-sm text-slate-600">
          강의 자료와 참고 문서를 확인하실 수 있습니다.
        </p>
      </header>

      {/* 학습자료 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dummyMaterials.map(material => (
          <div
            key={material.id}
            className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {material.title}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {material.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {material.subject}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  업로드일: {material.updatedAt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default MaterialsPage;
