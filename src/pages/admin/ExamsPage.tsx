type Exam = {
  id: number;
  title: string;
  subject: string;
  date: string;
  status: '진행 예정' | '진행 중' | '종료';
};

const dummyExams: Exam[] = [
  {
    id: 1,
    title: '3월 모의고사',
    subject: '국어 / 수학 / 영어',
    date: '2025-03-10',
    status: '종료',
  },
  {
    id: 2,
    title: '기말고사',
    subject: '전과목',
    date: '2025-06-20',
    status: '진행 예정',
  },
];

function ExamsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">시험 관리</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          + 시험 등록
        </button>
      </div>

      {/* Dummy table */}
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/80 text-left text-xs font-semibold text-slate-600">
              <th className="px-3 py-2">시험명</th>
              <th className="px-3 py-2">과목</th>
              <th className="px-3 py-2">일시</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {dummyExams.map(exam => (
              <tr
                key={exam.id}
                className="border-b border-slate-100/70 last:border-0 hover:bg-amber-50/40"
              >
                <td className="px-3 py-2 text-slate-900">{exam.title}</td>
                <td className="px-3 py-2 text-slate-700">{exam.subject}</td>
                <td className="px-3 py-2 text-slate-700">{exam.date}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {exam.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExamsPage;
