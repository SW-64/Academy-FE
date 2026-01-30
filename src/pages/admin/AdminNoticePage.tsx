import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Save } from 'lucide-react';
import MainLayout from '../MainLayout';
import { getClasses } from '../../api/class';
// 타입 정의
export type Notice = {
  id: number;
  number: number | 'important';
  title: string;
  hasNewTag: boolean;
  author: string;
  createdAt: string;
  isPinned?: boolean;
  content?: string;
  classIds?: number[];
};

// 빈 데이터
const dummyNotices: Notice[] = [];

function AdminNoticePage() {
  const [notices, setNotices] = useState<Notice[]>(dummyNotices);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    isPinned: false,
    classIds: [] as number[],
  });
  const [editNotice, setEditNotice] = useState({
    title: '',
    content: '',
    isPinned: false,
    classIds: [] as number[],
  });

  const handleWrite = () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const notice: Notice = {
      id: notices.length + 1,
      number: notices.length + 1,
      title: newNotice.title,
      content: newNotice.content,
      author: '관리자',
      createdAt: new Date().toLocaleString('ko-KR'),
      isPinned: newNotice.isPinned,
      hasNewTag: true,
      classIds: newNotice.classIds,
    };

    setNotices(prev => [notice, ...prev]);
    setNewNotice({ title: '', content: '', isPinned: false, classIds: [] });
    setIsWriteModalOpen(false);
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setEditNotice({
      title: notice.title,
      content: notice.content || '',
      isPinned: notice.isPinned || false,
      classIds: notice.classIds || [],
    });
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedNotice) return;
    if (!editNotice.title.trim() || !editNotice.content.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setNotices(prev =>
      prev.map(notice =>
        notice.id === selectedNotice.id
          ? {
              ...notice,
              title: editNotice.title,
              content: editNotice.content,
              isPinned: editNotice.isPinned,
              classIds: editNotice.classIds,
            }
          : notice
      )
    );

    setIsDetailModalOpen(false);
    setSelectedNotice(null);
  };

  const handleDelete = () => {
    if (!selectedNotice) return;
    if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;

    setNotices(prev => prev.filter(notice => notice.id !== selectedNotice.id));
    setIsDetailModalOpen(false);
    setSelectedNotice(null);
  };

  // 클래스 필터링 (클래스가 선택되었을 때만 필터링)
  const filteredNotices = selectedClassId
    ? notices.filter(
        notice => notice.classIds && notice.classIds.includes(selectedClassId)
      )
    : [];

  // 고정 공지와 일반 공지 분리
  const pinnedNotices = filteredNotices.filter(notice => notice.isPinned);
  const sortedNotices = [...filteredNotices].sort((a, b) => b.id - a.id);
  const itemsPerPage = 10;
  const generalNotices = sortedNotices.filter(notice => !notice.isPinned);
  const totalPages = Math.max(
    1,
    Math.ceil(generalNotices.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = generalNotices.slice(startIndex, endIndex);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 글쓰기 또는 상세/수정 모달이 열릴 때 클래스 목록 조회
  useEffect(() => {
    if (isWriteModalOpen || isDetailModalOpen) {
      const fetchClasses = async () => {
        setIsLoadingClasses(true);
        try {
          const response = await getClasses();
          const transformedClasses = response.data.map(c => ({
            id: c.classId,
            name: c.className,
          }));
          setClasses(transformedClasses);
        } catch (error) {
          console.error('클래스 목록 조회 에러:', error);
          setClasses([]);
        } finally {
          setIsLoadingClasses(false);
        }
      };
      fetchClasses();
    }
  }, [isWriteModalOpen, isDetailModalOpen]);

  useEffect(() => {
    // 공지 삭제/추가 시 현재 페이지가 범위를 벗어나지 않도록 보정
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    // 클래스 선택 변경 시 첫 페이지로 리셋
    setCurrentPage(1);
  }, [selectedClassId]);

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-semibold text-slate-900">
              공지사항 관리
            </h1>
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

        {/* 클래스 선택 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {classes.map(classItem => (
            <button
              key={classItem.id}
              type="button"
              onClick={() => setSelectedClassId(classItem.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedClassId === classItem.id
                  ? 'bg-[#084773] text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {classItem.name}
            </button>
          ))}
        </div>
      </header>

      {/* 공지사항 목록 */}
      <div className="space-y-6">
        {/* 고정 공지 */}
        {pinnedNotices.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              고정 공지
            </h2>
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
                      작성일
                    </th>
                    <th className="hidden min-[601px]:table-cell px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      작성자
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pinnedNotices.map(notice => (
                    <tr
                      key={notice.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleNoticeClick(notice)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                          공지
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {notice.title}
                      </td>
                      <td className="hidden min-[431px]:table-cell px-4 py-3 text-sm text-slate-600">
                        {notice.createdAt.split(' ')[0]}
                      </td>
                      <td className="hidden min-[601px]:table-cell px-4 py-3 text-sm text-slate-600">
                        {notice.author}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 일반 공지 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            일반 공지
          </h2>
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
                    작성일
                  </th>
                  <th className="hidden min-[601px]:table-cell px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    작성자
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentNotices.map(notice => (
                  <tr
                    key={notice.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {notice.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {notice.title}
                    </td>
                    <td className="hidden min-[431px]:table-cell px-4 py-3 text-sm text-slate-600">
                      {notice.createdAt.split(' ')[0]}
                    </td>
                    <td className="hidden min-[601px]:table-cell px-4 py-3 text-sm text-slate-600">
                      {notice.author}
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
              공지사항 작성
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={e =>
                    setNewNotice({ ...newNotice, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  내용
                </label>
                <textarea
                  value={newNotice.content}
                  onChange={e =>
                    setNewNotice({ ...newNotice, content: e.target.value })
                  }
                  rows={15}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    클래스 지정
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newNotice.classIds.length === classes.length) {
                        setNewNotice({
                          ...newNotice,
                          classIds: [],
                        });
                      } else {
                        setNewNotice({
                          ...newNotice,
                          classIds: classes.map(c => c.id),
                        });
                      }
                    }}
                    className="text-xs text-[#084773] hover:text-[#063a5a] font-medium"
                  >
                    {newNotice.classIds.length === classes.length
                      ? '전체 해제'
                      : '클래스 모두 선택'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isLoadingClasses ? (
                    <p className="col-span-2 text-sm text-slate-500">
                      클래스 목록을 불러오는 중...
                    </p>
                  ) : classes.length === 0 ? (
                    <p className="col-span-2 text-sm text-slate-500">
                      등록된 클래스가 없습니다.
                    </p>
                  ) : (
                    classes.map(classItem => (
                      <label
                        key={classItem.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newNotice.classIds.includes(classItem.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewNotice({
                                ...newNotice,
                                classIds: [...newNotice.classIds, classItem.id],
                              });
                            } else {
                              setNewNotice({
                                ...newNotice,
                                classIds: newNotice.classIds.filter(
                                  id => id !== classItem.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                        />
                        <span className="text-sm text-slate-700">
                          {classItem.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-pinned"
                  checked={newNotice.isPinned}
                  onChange={e =>
                    setNewNotice({ ...newNotice, isPinned: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                />
                <label
                  htmlFor="new-pinned"
                  className="text-sm font-medium text-slate-700"
                >
                  고정 공지로 설정
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  setNewNotice({
                    title: '',
                    content: '',
                    isPinned: false,
                    classIds: [],
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
      {isDetailModalOpen && selectedNotice && (
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
              공지사항 수정
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={editNotice.title}
                  onChange={e =>
                    setEditNotice({ ...editNotice, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  내용
                </label>
                <textarea
                  value={editNotice.content}
                  onChange={e =>
                    setEditNotice({ ...editNotice, content: e.target.value })
                  }
                  rows={15}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    클래스 지정
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editNotice.classIds.length === classes.length) {
                        setEditNotice({
                          ...editNotice,
                          classIds: [],
                        });
                      } else {
                        setEditNotice({
                          ...editNotice,
                          classIds: classes.map(c => c.id),
                        });
                      }
                    }}
                    className="text-xs text-[#084773] hover:text-[#063a5a] font-medium"
                  >
                    {editNotice.classIds.length === classes.length
                      ? '전체 해제'
                      : '클래스 모두 선택'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {classes.map(classItem => (
                    <label
                      key={classItem.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editNotice.classIds.includes(classItem.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditNotice({
                              ...editNotice,
                              classIds: [...editNotice.classIds, classItem.id],
                            });
                          } else {
                            setEditNotice({
                              ...editNotice,
                              classIds: editNotice.classIds.filter(
                                id => id !== classItem.id
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                      />
                      <span className="text-sm text-slate-700">
                        {classItem.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-pinned"
                  checked={editNotice.isPinned}
                  onChange={e =>
                    setEditNotice({ ...editNotice, isPinned: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                />
                <label
                  htmlFor="edit-pinned"
                  className="text-sm font-medium text-slate-700"
                >
                  고정 공지로 설정
                </label>
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

export default AdminNoticePage;
