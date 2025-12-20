import { useState } from 'react';
import MainLayout from './MainLayout';
import { Play, X } from 'lucide-react';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
interface Video {
  id: number;
  title: string;
  duration: string;
}

const dummyVideos: Video[] = [
  {
    id: 1,
    title: '미적분 I - 함수의 극한과 연속',
    duration: '47:27',
  },
  {
    id: 2,
    title: '확률과 통계 - 이항분포와 정규분포',
    duration: '37:05',
  },
  {
    id: 3,
    title: '기하와 벡터 - 공간도형의 방정식',
    duration: '50:32',
  },
  {
    id: 4,
    title: '미적분 II - 적분의 활용',
    duration: '42:18',
  },
  {
    id: 5,
    title: '수학 I - 지수함수와 로그함수',
    duration: '38:45',
  },
  {
    id: 6,
    title: '수학 II - 삼각함수의 성질',
    duration: '45:12',
  },
  {
    id: 7,
    title: '미적분 I - 도함수의 활용',
    duration: '39:28',
  },
  {
    id: 8,
    title: '확률과 통계 - 확률의 기본 성질',
    duration: '41:15',
  },
];

function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dummyVideos.map(video => (
          <div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            {/* 썸네일 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
              {/* 썸네일 이미지 영역 */}
              <div className="h-full w-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                <span className="text-slate-600 text-sm font-medium">
                  이미지 준비중입니다
                </span>
              </div>

              {/* 재생 시간 오버레이 (오른쪽 하단) */}
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                {video.duration}
              </div>
            </div>

            {/* 비디오 정보 */}
            <div className="mt-3">
              {/* 제목 */}
              <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 비디오 재생 모달 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={e => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 비디오 플레이어 영역 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-800">
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-slate-400 text-lg font-medium">
                  이미지 준비중입니다
                </span>
              </div>

              {/* 재생 버튼 (중앙) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  type="button"
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 hover:bg-white"
                >
                  <Play
                    className="ml-1 h-10 w-10 text-slate-900"
                    fill="currentColor"
                  />
                </button>
              </div>

              {/* 재생 시간 오버레이 (오른쪽 하단) */}
              <div className="absolute bottom-4 right-4 rounded bg-black/80 px-3 py-1.5 text-sm font-medium text-white">
                {selectedVideo.duration}
              </div>
            </div>

            {/* 비디오 제목 */}
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedVideo.title}
              </h2>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default VideosPage;
