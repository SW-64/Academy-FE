import MainLayout from './MainLayout';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
// 날짜는 오래된 순서대로 정렬 (왼쪽에서 오른쪽으로 최신순)
const dummyGrades = [
  {
    id: 1,
    subject: '수학',
    score: 70,
    date: '02/07',
    comment: '양호한 성적입니다. 기초 문제를 더 연습해주세요.',
  },
  {
    id: 2,
    subject: '수학',
    score: 75,
    date: '02/08',
    comment: '좋은 성적입니다. 문제 해결 능력을 더 향상시키면 좋겠습니다.',
  },
  {
    id: 3,
    subject: '수학',
    score: 80,
    date: '02/09',
    comment: '좋은 성적입니다. 계산 실수를 줄이면 더 좋겠습니다.',
  },
  {
    id: 4,
    subject: '수학',
    score: 85,
    date: '02/10',
    comment: '우수한 성적입니다. 계속 노력해주세요.',
  },
  {
    id: 5,
    subject: '수학',
    score: 90,
    date: '02/11',
    comment: '우수한 성적입니다. 지속적인 연습을 유지해주세요.',
  },
  {
    id: 6,
    subject: '수학',
    score: 95,
    date: '02/12',
    comment: '훌륭한 성적입니다. 개념 이해가 잘 되어 있습니다.',
  },
  {
    id: 7,
    subject: '수학',
    score: 100,
    date: '02/13',
    comment: '완벽한 성적입니다. 수학 실력이 뛰어납니다.',
  },
];

function GradesPage() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">성적</h1>
        <p className="mt-1 text-sm text-slate-600">
          이번 학기 성적과 진도 현황을 확인하실 수 있습니다.
        </p>
      </header>

      {/* 성적 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dummyGrades.map(grade => (
          <div
            key={grade.id}
            className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {grade.subject}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-[#084773]">
                    {grade.score}점
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{grade.comment}</p>
                <p className="mt-2 text-xs text-slate-400">{grade.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default GradesPage;
