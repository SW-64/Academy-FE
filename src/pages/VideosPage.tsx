import { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import { Play, X } from 'lucide-react';
import {
  getVideos,
  getVideoDetail,
  getVideoPlayback,
  type VideoListItem,
  type VideoDetailItem,
} from '../api/videos';

function formatDurationHMS(seconds: number): string {
  const sec = Math.floor(Number(seconds) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function VideosPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedVideoDetail, setSelectedVideoDetail] =
    useState<VideoDetailItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const response = await getVideos(1, 20);
        setVideos(response.data.data ?? []);
      } catch (error) {
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  const handleVideoClick = async (video: VideoListItem) => {
    setSelectedVideoId(video.videoId);
    setSelectedVideoDetail(null);
    setIsLoadingDetail(true);
    try {
      const response = await getVideoDetail(video.videoId);
      setSelectedVideoDetail(response.data);
    } catch (error) {
      alert(error instanceof Error ? error.message : '영상 상세를 불러오는데 실패했습니다.');
      setSelectedVideoId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePlayClick = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation();
    setIsLoadingPlayback(true);
    try {
      const response = await getVideoPlayback(videoId);
      if (response.data.playbackUrl) {
        window.open(response.data.playbackUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('재생 URL을 가져올 수 없습니다.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '재생 URL을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPlayback(false);
    }
  };

  return (
    <MainLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">영상</h1>
      </header>

      {isLoadingVideos ? (
        <div className="py-12 text-center text-slate-600">
          영상 목록을 불러오는 중...
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-200/80">
          등록된 영상이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map(video => (
            <div
              key={video.videoId}
              onClick={() => handleVideoClick(video)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
                    <span className="text-sm font-medium text-slate-600">
                      썸네일 없음
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                  {formatDurationHMS(video.duration)}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideoId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => {
            setSelectedVideoId(null);
            setSelectedVideoDetail(null);
          }}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedVideoId(null);
                setSelectedVideoDetail(null);
              }}
              className="absolute -top-12 right-0 rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {isLoadingDetail ? (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-slate-800">
                <span className="text-slate-400">상세 정보를 불러오는 중...</span>
              </div>
            ) : selectedVideoDetail ? (
              <>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-800">
                  {selectedVideoDetail.thumbnailUrl ? (
                    <img
                      src={selectedVideoDetail.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-slate-400">썸네일 없음</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={e =>
                      handlePlayClick(e, selectedVideoDetail.videoId)
                    }
                    disabled={isLoadingPlayback}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40 disabled:opacity-50"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110">
                      <Play
                        className="ml-1 h-10 w-10 text-slate-900"
                        fill="currentColor"
                      />
                    </span>
                  </button>
                  <div className="absolute bottom-4 right-4 rounded bg-black/80 px-3 py-1.5 text-sm font-medium text-white">
                    {formatDurationHMS(selectedVideoDetail.duration)}
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedVideoDetail.title}
                  </h2>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default VideosPage;
