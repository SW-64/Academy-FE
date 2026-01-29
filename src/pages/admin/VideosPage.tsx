import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Save, Upload } from 'lucide-react';
import MainLayout from '../MainLayout';

// 더미 클래스 데이터 (실제로는 API에서 가져와야 함)
type ClassType = {
  id: number;
  name: string;
  studentIds: number[];
};

// 타입 정의
type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

// 빈 데이터
const dummyClasses: ClassType[] = [];
const dummyStudents: Student[] = [];

type Video = {
  id: number;
  title: string;
  duration: string;
  videoFile?: File | null;
  videoFileName?: string;
  selectedClasses?: { classId: number; studentIds: number[] }[];
};

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

function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>(dummyVideos);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    videoFile: null as File | null,
    videoFileName: '',
    selectedClasses: [] as { classId: number; studentIds: number[] }[],
  });
  const [editVideo, setEditVideo] = useState({
    title: '',
    videoFile: null as File | null,
    videoFileName: '',
    selectedClasses: [] as { classId: number; studentIds: number[] }[],
  });

  const handleWrite = () => {
    if (!newVideo.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    const video: Video = {
      id: videos.length + 1,
      title: newVideo.title,
      duration: '00:00',
      videoFile: newVideo.videoFile,
      videoFileName:
        newVideo.videoFileName ||
        (newVideo.videoFile ? newVideo.videoFile.name : ''),
      selectedClasses: newVideo.selectedClasses,
    };

    setVideos(prev => [video, ...prev]);
    setNewVideo({
      title: '',
      videoFile: null,
      videoFileName: '',
      selectedClasses: [],
    });
    setIsWriteModalOpen(false);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setEditVideo({
      title: video.title,
      videoFile: null,
      videoFileName: video.videoFileName || '',
      selectedClasses: video.selectedClasses || [],
    });
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedVideo) return;
    if (!editVideo.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    setVideos(prev =>
      prev.map(video =>
        video.id === selectedVideo.id
          ? {
              ...video,
              title: editVideo.title,
              videoFile: editVideo.videoFile || video.videoFile,
              videoFileName:
                editVideo.videoFileName || video.videoFileName || '',
              selectedClasses: editVideo.selectedClasses,
            }
          : video
      )
    );

    setIsDetailModalOpen(false);
    setSelectedVideo(null);
  };

  const handleDelete = () => {
    if (!selectedVideo) return;
    if (!confirm('정말 이 영상을 삭제하시겠습니까?')) return;

    setVideos(prev => prev.filter(video => video.id !== selectedVideo.id));
    setIsDetailModalOpen(false);
    setSelectedVideo(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditVideo({
          ...editVideo,
          videoFile: file,
          videoFileName: file.name,
        });
      } else {
        setNewVideo({
          ...newVideo,
          videoFile: file,
          videoFileName: file.name,
        });
      }
    }
  };

  const itemsPerPage = 10;
  const sortedVideos = [...videos].sort((a, b) => b.id - a.id);
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = sortedVideos.slice(startIndex, endIndex);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

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

      {/* 영상 목록 */}
      <div className="space-y-6">
        <section>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    번호
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    제목
                  </th>
                  <th className="hidden min-[431px]:table-cell px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    재생 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentVideos.map(video => (
                  <tr
                    key={video.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleVideoClick(video)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {video.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {video.title}
                    </td>
                    <td className="hidden min-[431px]:table-cell px-4 py-3 text-sm text-slate-600">
                      {video.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    클래스 선택
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        newVideo.selectedClasses.length === dummyClasses.length
                      ) {
                        setNewVideo({
                          ...newVideo,
                          selectedClasses: [],
                        });
                      } else {
                        setNewVideo({
                          ...newVideo,
                          selectedClasses: dummyClasses.map(c => ({
                            classId: c.id,
                            studentIds: [],
                          })),
                        });
                      }
                    }}
                    className="text-xs text-[#084773] hover:text-[#063a5a] font-medium"
                  >
                    {newVideo.selectedClasses.length === dummyClasses.length
                      ? '전체 해제'
                      : '클래스 모두 선택'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dummyClasses.map(classItem => {
                    const isClassExpanded = newVideo.selectedClasses.some(
                      sc => sc.classId === classItem.id
                    );
                    const selectedClassData = newVideo.selectedClasses.find(
                      sc => sc.classId === classItem.id
                    );

                    return (
                      <div
                        key={classItem.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isClassExpanded) {
                              setNewVideo({
                                ...newVideo,
                                selectedClasses:
                                  newVideo.selectedClasses.filter(
                                    sc => sc.classId !== classItem.id
                                  ),
                              });
                            } else {
                              setNewVideo({
                                ...newVideo,
                                selectedClasses: [
                                  ...newVideo.selectedClasses,
                                  { classId: classItem.id, studentIds: [] },
                                ],
                              });
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer mb-3 w-full text-left"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {classItem.name}
                          </span>
                        </button>

                        {isClassExpanded && (
                          <div className="ml-0 mt-2">
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                              학생 선택
                            </label>
                            <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1.5">
                              {classItem.studentIds.map(studentId => {
                                const student = dummyStudents.find(
                                  s => s.id === studentId
                                );
                                if (!student) return null;
                                return (
                                  <label
                                    key={studentId}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedClassData?.studentIds.includes(
                                          studentId
                                        ) || false
                                      }
                                      onChange={e => {
                                        const classIndex =
                                          newVideo.selectedClasses.findIndex(
                                            sc => sc.classId === classItem.id
                                          );
                                        if (classIndex === -1) return;

                                        const updatedClasses = [
                                          ...newVideo.selectedClasses,
                                        ];
                                        if (e.target.checked) {
                                          updatedClasses[classIndex] = {
                                            ...updatedClasses[classIndex],
                                            studentIds: [
                                              ...updatedClasses[classIndex]
                                                .studentIds,
                                              studentId,
                                            ],
                                          };
                                        } else {
                                          updatedClasses[classIndex] = {
                                            ...updatedClasses[classIndex],
                                            studentIds: updatedClasses[
                                              classIndex
                                            ].studentIds.filter(
                                              id => id !== studentId
                                            ),
                                          };
                                        }
                                        setNewVideo({
                                          ...newVideo,
                                          selectedClasses: updatedClasses,
                                        });
                                      }}
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                                    />
                                    <span className="text-xs text-slate-700">
                                      {student.name} ({student.school}{' '}
                                      {student.grade})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                            {selectedClassData && (
                              <p className="mt-2 text-xs text-slate-500">
                                선택된 학생:{' '}
                                {selectedClassData.studentIds.length}명
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                      onChange={e => handleFileChange(e, false)}
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
                    selectedClasses: [],
                  });
                }}
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWrite}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세/수정 모달 */}
      {isDetailModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              영상 수정
            </h2>

            {/* 접근 권한 정보 */}
            {selectedVideo.selectedClasses &&
              selectedVideo.selectedClasses.length > 0 && (
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    접근 권한
                  </h3>
                  <div className="space-y-3">
                    {selectedVideo.selectedClasses.map(classData => {
                      const classItem = dummyClasses.find(
                        c => c.id === classData.classId
                      );
                      if (!classItem) return null;

                      return (
                        <div
                          key={classData.classId}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <p className="mb-2 text-sm font-medium text-slate-900">
                            {classItem.name}
                          </p>
                          <div className="space-y-1">
                            {classData.studentIds.length > 0 ? (
                              classData.studentIds.map(studentId => {
                                const student = dummyStudents.find(
                                  s => s.id === studentId
                                );
                                if (!student) return null;
                                return (
                                  <p
                                    key={studentId}
                                    className="text-xs text-slate-600"
                                  >
                                    • {student.name} ({student.school}{' '}
                                    {student.grade})
                                  </p>
                                );
                              })
                            ) : (
                              <p className="text-xs text-slate-500">
                                선택된 학생 없음
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={editVideo.title}
                  onChange={e =>
                    setEditVideo({ ...editVideo, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    클래스 선택
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        editVideo.selectedClasses.length === dummyClasses.length
                      ) {
                        setEditVideo({
                          ...editVideo,
                          selectedClasses: [],
                        });
                      } else {
                        setEditVideo({
                          ...editVideo,
                          selectedClasses: dummyClasses.map(c => ({
                            classId: c.id,
                            studentIds: [],
                          })),
                        });
                      }
                    }}
                    className="text-xs text-[#084773] hover:text-[#063a5a] font-medium"
                  >
                    {editVideo.selectedClasses.length === dummyClasses.length
                      ? '전체 해제'
                      : '클래스 모두 선택'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dummyClasses.map(classItem => {
                    const isClassSelected = editVideo.selectedClasses.some(
                      sc => sc.classId === classItem.id
                    );
                    const selectedClassData = editVideo.selectedClasses.find(
                      sc => sc.classId === classItem.id
                    );

                    return (
                      <div
                        key={classItem.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={isClassSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setEditVideo({
                                  ...editVideo,
                                  selectedClasses: [
                                    ...editVideo.selectedClasses,
                                    { classId: classItem.id, studentIds: [] },
                                  ],
                                });
                              } else {
                                setEditVideo({
                                  ...editVideo,
                                  selectedClasses:
                                    editVideo.selectedClasses.filter(
                                      sc => sc.classId !== classItem.id
                                    ),
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {classItem.name}
                          </span>
                        </label>

                        {isClassSelected && (
                          <div className="ml-6 mt-2">
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                              학생 선택
                            </label>
                            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1.5">
                              {classItem.studentIds.map(studentId => {
                                const student = dummyStudents.find(
                                  s => s.id === studentId
                                );
                                if (!student) return null;
                                return (
                                  <label
                                    key={studentId}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedClassData?.studentIds.includes(
                                          studentId
                                        ) || false
                                      }
                                      onChange={e => {
                                        const classIndex =
                                          editVideo.selectedClasses.findIndex(
                                            sc => sc.classId === classItem.id
                                          );
                                        if (classIndex === -1) return;

                                        const updatedClasses = [
                                          ...editVideo.selectedClasses,
                                        ];
                                        if (e.target.checked) {
                                          updatedClasses[classIndex] = {
                                            ...updatedClasses[classIndex],
                                            studentIds: [
                                              ...updatedClasses[classIndex]
                                                .studentIds,
                                              studentId,
                                            ],
                                          };
                                        } else {
                                          updatedClasses[classIndex] = {
                                            ...updatedClasses[classIndex],
                                            studentIds: updatedClasses[
                                              classIndex
                                            ].studentIds.filter(
                                              id => id !== studentId
                                            ),
                                          };
                                        }
                                        setEditVideo({
                                          ...editVideo,
                                          selectedClasses: updatedClasses,
                                        });
                                      }}
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                                    />
                                    <span className="text-xs text-slate-700">
                                      {student.name} ({student.school}{' '}
                                      {student.grade})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                            {selectedClassData && (
                              <p className="mt-2 text-xs text-slate-500">
                                선택된 학생:{' '}
                                {selectedClassData.studentIds.length}명
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                        {editVideo.videoFileName ||
                          selectedVideo.videoFileName ||
                          '영상 파일을 선택하세요'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        클릭하여 파일을 선택하거나 드래그하여 업로드
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => handleFileChange(e, true)}
                      className="hidden"
                      id="video-edit-upload"
                    />
                  </label>
                  {(editVideo.videoFileName || selectedVideo.videoFileName) && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">
                        {editVideo.videoFileName || selectedVideo.videoFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditVideo({
                            ...editVideo,
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

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                >
                  <Save className="h-4 w-4" />
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminVideosPage;
