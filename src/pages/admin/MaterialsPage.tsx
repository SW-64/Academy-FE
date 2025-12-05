type Material = {
  id: number;
  title: string;
  subject: string;
  type: 'PDF' | '슬라이드' | '이미지';
  updatedAt: string;
};

const dummyMaterials: Material[] = [
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            학습자료 관리
          </h2>
          <p className="text-sm text-slate-600">
            수업에 사용할 학습자료를 등록하고 정리할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          + 자료 등록
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/80 text-left text-xs font-semibold text-slate-600">
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">과목</th>
              <th className="px-3 py-2">형식</th>
              <th className="px-3 py-2">수정일</th>
            </tr>
          </thead>
          <tbody>
            {dummyMaterials.map(material => (
              <tr
                key={material.id}
                className="border-b border-slate-100/70 last:border-0 hover:bg-amber-50/40"
              >
                <td className="px-3 py-2 text-slate-900">{material.title}</td>
                <td className="px-3 py-2 text-slate-700">{material.subject}</td>
                <td className="px-3 py-2 text-slate-700">{material.type}</td>
                <td className="px-3 py-2 text-slate-700">
                  {material.updatedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaterialsPage;
