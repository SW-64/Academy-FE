import { useEffect, useState } from 'react';
import {
  Plus,
  X,
  Trash2,
  Save,
  Upload,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  MoreVertical,
} from 'lucide-react';
import MainLayout from '../MainLayout';
import { getStudents } from '../../api/students';
import {
  getVideos,
  getVideoDetail,
  getVideoPlayback,
  deleteVideo,
  uploadVideo,
  updateVideo,
  type VideoListItem,
  type VideoDetailItem,
} from '../../api/videos';

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

const VIDEOS_PER_PAGE = 20;

function formatDuration(seconds: number): string {
  const sec = Math.floor(Number(seconds) || 0);
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}시간 ${m}분 ${s}초`;
  }
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s}초`;
  }
  return `${sec}초`;
}

/** HH:MM:SS 형식 (목록 카드용) */
function formatDurationHMS(seconds: number): string {
  const sec = Math.floor(Number(seconds) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [listMeta, setListMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVideoDetail, setSelectedVideoDetail] =
    useState<VideoDetailItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    videoFile: null as File | null,
    videoFileName: '',
    studentIds: [] as number[],
  });
  const [writeModalStudents, setWriteModalStudents] = useState<Student[]>([]);
  const [isLoadingWriteStudents, setIsLoadingWriteStudents] = useState(false);
  const [writeStudentPage, setWriteStudentPage] = useState(1);
  const [writeStudentsMeta, setWriteStudentsMeta] = useState<{
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [writeSearchStudent, setWriteSearchStudent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudentsForChips, setSelectedStudentsForChips] = useState<
    Student[]
  >([]);
  const writeStudentsPerPage = 10;

  // 영상 목록 조회 (페이지네이션)
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const response = await getVideos(currentPage, VIDEOS_PER_PAGE);
        setVideos(response.data.data);
        setListMeta(response.data.meta);
      } catch (error) {
        setVideos([]);
        setListMeta(null);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, [currentPage]);

  // 글쓰기 모달 열릴 때 학생 목록 조회
  useEffect(() => {
    if (isWriteModalOpen) {
      const fetchStudents = async () => {
        setIsLoadingWriteStudents(true);
        try {
          const response = await getStudents(
            writeStudentPage,
            writeStudentsPerPage
          );
          const transformed: Student[] = response.data.items
            .filter(item => item.student != null)
            .map(item => ({
              id: item.student!.studentId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              school: item.student!.school,
              grade: `${item.student!.grade}학년`,
            }));
          setWriteModalStudents(transformed);
          setWriteStudentsMeta(response.data.meta);
        } catch (error) {
          setWriteModalStudents([]);
          setWriteStudentsMeta(null);
        } finally {
          setIsLoadingWriteStudents(false);
        }
      };
      fetchStudents();
    } else {
      setWriteStudentPage(1);
      setWriteSearchStudent('');
      setSelectedStudentsForChips([]);
    }
  }, [isWriteModalOpen, writeStudentPage, writeStudentsPerPage]);

  const filteredWriteStudents = writeModalStudents.filter(
    s =>
      s.name.toLowerCase().includes(writeSearchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(writeSearchStudent.toLowerCase())
  );

  const handleToggleWriteStudent = (student: Student) => {
    setNewVideo(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(student.id)
        ? prev.studentIds.filter(id => id !== student.id)
        : [...prev.studentIds, student.id],
    }));
    setSelectedStudentsForChips(prev =>
      prev.some(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  const handleWrite = async () => {
    if (!newVideo.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!newVideo.videoFile) {
      alert('영상 파일을 선택해주세요.');
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadVideo(
        newVideo.videoFile,
        newVideo.title.trim(),
        newVideo.studentIds
      );
      setNewVideo({
        title: '',
        videoFile: null,
        videoFileName: '',
        studentIds: [],
      });
      setSelectedStudentsForChips([]);
      setIsWriteModalOpen(false);
      alert(response.message || '영상이 업로드되었습니다.');
      // 목록 새로고침
      const listRes = await getVideos(1, VIDEOS_PER_PAGE);
      setVideos(listRes.data.data);
      setListMeta(listRes.data.meta);
      setCurrentPage(1);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoClick = async (video: VideoListItem) => {
    setIsLoadingDetail(true);
    setSelectedVideoDetail(null);
    setIsDetailModalOpen(true);
    try {
      const response = await getVideoDetail(video.videoId);
      setSelectedVideoDetail(response.data);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePlayClick = async (
    e: React.MouseEvent,
    videoId: number
  ) => {
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
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingPlayback(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedVideoDetail) return;
    try {
      const response = await updateVideo(selectedVideoDetail.videoId, {
        title: selectedVideoDetail.title,
        studentIds:
          selectedVideoDetail.assignedStudents?.map(s => s.studentId) ?? [],
      });
      alert(response.message ?? '영상이 수정되었습니다.');
      setSelectedVideoDetail(response.data);
      const listResponse = await getVideos(currentPage, VIDEOS_PER_PAGE);
      setVideos(listResponse.data.data);
      setListMeta(listResponse.data.meta);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDelete = async () => {
    if (!selectedVideoDetail) return;
    if (!confirm('정말 이 영상을 삭제하시겠습니까?')) return;
    try {
      await deleteVideo(selectedVideoDetail.videoId);
      alert('영상이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      setSelectedVideoDetail(null);
      const response = await getVideos(currentPage, VIDEOS_PER_PAGE);
      setVideos(response.data.data);
      setListMeta(response.data.meta);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideo({
        ...newVideo,
        videoFile: file,
        videoFileName: file.name,
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = listMeta?.totalPages ?? 1;

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-semibold text-slate-900">영상 관리</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] self-center md:self-auto w-auto max-[760px]:scale-90"
          >
            <Plus className="h-4 w-4" />
            글쓰기
          </button>
        </div>
      </header>

      {/* 영상 목록 - 카드 그리드 */}
      <div className="space-y-6">
        <section>
          {isLoadingVideos ? (
            <div className="flex justify-center py-12 text-slate-600">
              영상 목록을 불러오는 중...
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-blue-100/70">
              등록된 영상이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map(video => (
                <article
                  key={video.videoId}
                  onClick={() => handleVideoClick(video)}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:shadow-md hover:ring-slate-300"
                >
                  {/* 썸네일 (크게, 재생 버튼 없음) */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
                        썸네일 없음
                      </div>
                    )}
                    {/* 썸네일 우측 상단: 조회수 뱃지 + 옵션 메뉴 */}
                    <div className="absolute right-2 top-2 flex items-center gap-1.5">
                      <span className="rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm">
                        {video.viewCount} views
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleVideoClick(video);
                        }}
                        className="rounded-full p-1.5 text-slate-700 transition-colors hover:bg-white/80"
                        aria-label="옵션"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-base font-semibold text-[#084773] line-clamp-2">
                      {video.title || '(제목 없음)'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{formatDurationHMS(video.duration)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#084773] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              setCurrentPage(prev => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-8 shadow-xl"
            style={{
              height: '90vh',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              영상 작성
            </h2>

            <div className="space-y-6 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={e =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학생 선택
                </label>
                <div className="mb-4">
                  <input
                    type="text"
                    value={writeSearchStudent}
                    onChange={e => setWriteSearchStudent(e.target.value)}
                    placeholder="학생 이름 또는 이메일로 검색..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                </div>
                {selectedStudentsForChips.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedStudentsForChips.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm"
                      >
                        <span className="text-slate-900">{student.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleWriteStudent(student)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          선택
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          이름
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          이메일
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          학교
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                          학년
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingWriteStudents ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-4 text-center text-sm text-slate-500"
                          >
                            학생 목록을 불러오는 중...
                          </td>
                        </tr>
                      ) : filteredWriteStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-4 text-center text-sm text-slate-500"
                          >
                            {writeSearchStudent
                              ? '검색 결과가 없습니다.'
                              : '등록된 학생이 없습니다.'}
                          </td>
                        </tr>
                      ) : (
                        filteredWriteStudents.map(student => (
                          <tr
                            key={student.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={newVideo.studentIds.includes(
                                  student.id
                                )}
                                onChange={() =>
                                  handleToggleWriteStudent(student)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.email}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.school}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {student.grade}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {writeStudentsMeta && writeStudentsMeta.totalPages > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setWriteStudentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={writeStudentPage === 1}
                      className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600">
                      {writeStudentPage} / {writeStudentsMeta.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setWriteStudentPage(prev =>
                          Math.min(writeStudentsMeta.totalPages, prev + 1)
                        )
                      }
                      disabled={
                        writeStudentPage === writeStudentsMeta.totalPages
                      }
                      className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  영상 파일
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-[#084773] hover:bg-slate-50">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">
                        {newVideo.videoFileName || '영상 파일을 선택하세요'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        클릭하여 파일을 선택하거나 드래그하여 업로드
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => handleFileChange(e)}
                      className="hidden"
                      id="video-upload"
                    />
                  </label>
                  {newVideo.videoFileName && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">
                        {newVideo.videoFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewVideo({
                            ...newVideo,
                            videoFile: null,
                            videoFileName: '',
                          })
                        }
                        className="ml-auto text-slate-500 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  setNewVideo({
                    title: '',
                    videoFile: null,
                    videoFileName: '',
                    studentIds: [],
                  });
                  setSelectedStudentsForChips([]);
                }}
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWrite}
                disabled={isUploading}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? '업로드 중...' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedVideoDetail(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              영상 상세
            </h2>

            {isLoadingDetail ? (
              <div className="py-12 text-center text-slate-600">
                상세 정보를 불러오는 중...
              </div>
            ) : selectedVideoDetail ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-slate-500">
                      제목
                    </span>
                    <p className="text-slate-900">
                      {selectedVideoDetail.title || '(제목 없음)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500 block mb-2">
                      썸네일
                    </span>
                    <div className="relative inline-block w-full max-w-2xl overflow-hidden rounded-lg bg-slate-200 aspect-video min-h-[200px]">
                      {selectedVideoDetail.thumbnailUrl ? (
                        <img
                          src={selectedVideoDetail.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full min-h-[200px] items-center justify-center text-slate-400 text-sm">
                          썸네일 없음
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={e =>
                          handlePlayClick(e, selectedVideoDetail.videoId)
                        }
                        disabled={isLoadingPlayback}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40 disabled:opacity-50"
                        title="재생"
                      >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105">
                          <Play className="h-8 w-8 text-[#084773] fill-[#084773]" />
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <span className="text-sm font-medium text-slate-500 block">
                        재생 시간
                      </span>
                      <p className="text-slate-900">
                        {formatDuration(selectedVideoDetail.duration)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-500 block">
                        상태
                      </span>
                      <p className="text-slate-900">
                        {selectedVideoDetail.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-500 block">
                        조회수
                      </span>
                      <p className="text-slate-900">
                        {selectedVideoDetail.viewCount}회
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-500 block">
                        생성일
                      </span>
                      <p className="text-slate-900 text-sm">
                        {new Date(
                          selectedVideoDetail.createdAt
                        ).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500 block mb-2">
                      연결된 학생
                    </span>
                    {selectedVideoDetail.assignedStudents?.length > 0 ? (
                      <ul className="rounded-lg border border-slate-200 p-3 space-y-1">
                        {selectedVideoDetail.assignedStudents.map(s => (
                          <li
                            key={s.studentId}
                            className="text-sm text-slate-700"
                          >
                            • {s.name} (ID: {s.studentId})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        연결된 학생이 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="flex items-center gap-2 rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                    >
                      <Save className="h-4 w-4" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedVideoDetail(null);
                    }}
                    className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    닫기
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminVideosPage;
