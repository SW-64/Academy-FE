type Video = {
  id: number;
  title: string;
  duration: string;
  level: '입문' | '기초' | '심화';
  published: boolean;
};

const dummyVideos: Video[] = [
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">영상 관리</h2>
          <p className="text-sm text-slate-600">
            강의 영상을 등록하고 공개 여부를 관리할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          + 영상 등록
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/80 text-left text-xs font-semibold text-slate-600">
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">재생 시간</th>
              <th className="px-3 py-2">난이도</th>
              <th className="px-3 py-2">공개 여부</th>
            </tr>
          </thead>
          <tbody>
            {dummyVideos.map(video => (
              <tr
                key={video.id}
                className="border-b border-slate-100/70 last:border-0 hover:bg-amber-50/40"
              >
                <td className="px-3 py-2 text-slate-900">{video.title}</td>
                <td className="px-3 py-2 text-slate-700">{video.duration}</td>
                <td className="px-3 py-2 text-slate-700">{video.level}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      video.published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {video.published ? '공개' : '비공개'}
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

export default VideosPage;
