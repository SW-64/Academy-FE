import MainLayout from './MainLayout';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
const dummyVideos = [
  {
    id: 1,
    title: 'React 기본 개념 정리',
    duration: '35:20',
    level: '기초',
    published: true,
  },
  {
    id: 2,
    title: '상태 관리 패턴 소개',
    duration: '42:10',
    level: '심화',
    published: false,
  },
];

function VideosPage() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">영상</h1>
        <p className="mt-1 text-sm text-slate-600">
          강의 영상과 다시보기를 확인하실 수 있습니다.
        </p>
      </header>

      {/* 영상 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dummyVideos.map(video => (
          <div
            key={video.id}
            className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {video.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      video.published
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {video.published ? '공개' : '비공개'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                  <span>재생 시간: {video.duration}</span>
                  <span>난이도: {video.level}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default VideosPage;
