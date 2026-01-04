import { useState } from 'react';
import MainLayout from './MainLayout';
import { Play, X, ChevronRight } from 'lucide-react';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
interface Video {
  id: number;
  title: string;
  duration: string;
  classIds?: number[];
}

// 더미 클래스 데이터 (실제로는 API에서 가져와야 함)
const dummyClasses = [
  { id: 1, name: '예비고2 월금 정규반' },
  { id: 2, name: '예비고2 화목 정규반' },
  { id: 3, name: '미적분1 기본 특강반' },
  { id: 4, name: '미적분1+2 통합 특강반' },
];

const dummyVideos: Video[] = [
  {
    id: 1,
    title: '미적분 I - 함수의 극한과 연속',
    duration: '47:27',
    classIds: [3], // 미적분1 기본 특강반
  },
  {
    id: 2,
    title: '확률과 통계 - 이항분포와 정규분포',
    duration: '37:05',
    classIds: [1, 2], // 예비고2 월금 정규반, 예비고2 화목 정규반
  },
  {
    id: 3,
    title: '기하와 벡터 - 공간도형의 방정식',
    duration: '50:32',
    classIds: [1, 2], // 예비고2 월금 정규반, 예비고2 화목 정규반
  },
  {
    id: 4,
    title: '미적분 II - 적분의 활용',
    duration: '42:18',
    classIds: [4], // 미적분1+2 통합 특강반
  },
  {
    id: 5,
    title: '수학 I - 지수함수와 로그함수',
    duration: '38:45',
    classIds: [1, 2, 3], // 예비고2 월금 정규반, 예비고2 화목 정규반, 미적분1 기본 특강반
  },
  {
    id: 6,
    title: '수학 II - 삼각함수의 성질',
    duration: '45:12',
    classIds: [1], // 예비고2 월금 정규반
  },
  {
    id: 7,
    title: '미적분 I - 도함수의 활용',
    duration: '39:28',
    classIds: [3, 4], // 미적분1 기본 특강반, 미적분1+2 통합 특강반
  },
  {
    id: 8,
    title: '확률과 통계 - 확률의 기본 성질',
    duration: '41:15',
    classIds: [2, 4], // 예비고2 화목 정규반, 미적분1+2 통합 특강반
  },
];

function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // 클래스별 영상 필터링
  const filteredVideos = selectedClassId
    ? dummyVideos.filter(
        video => video.classIds && video.classIds.includes(selectedClassId)
      )
    : dummyVideos;

  // 클래스별 영상 개수 계산
  const getVideoCountByClass = (classId: number) => {
    return dummyVideos.filter(
      video => video.classIds && video.classIds.includes(classId)
    ).length;
  };

  const selectedClassName = selectedClassId
    ? dummyClasses.find(c => c.id === selectedClassId)?.name
    : null;

  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        {selectedClassId ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedClassId(null)}
              className="text-2xl font-semibold text-slate-900 hover:text-[#084773] transition-colors"
            >
              영상
            </button>
            <ChevronRight className="h-5 w-5 text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900">
              {selectedClassName}
            </h1>
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-slate-900">영상</h1>
        )}
      </header>

      {/* 클래스 선택 박스 (클래스 미선택 시에만 표시) */}
      {!selectedClassId && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dummyClasses.map(classItem => {
            const videoCount = getVideoCountByClass(classItem.id);

            return (
              <div
                key={classItem.id}
                onClick={() => setSelectedClassId(classItem.id)}
                className="cursor-pointer rounded-lg border-2 border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {classItem.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  영상 {videoCount}개
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 영상 목록 (클래스 선택 시에만 표시) */}
      {selectedClassId && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredVideos.length > 0 ? (
            filteredVideos.map(video => (
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
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-slate-600">해당 클래스에 제공된 영상이 없습니다.</p>
            </div>
          )}
        </div>
      )}

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
