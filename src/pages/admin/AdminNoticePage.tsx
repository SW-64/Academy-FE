import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Save } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  getClasses,
  getNotices,
  getNoticeDetail,
  createNotice,
  updateNotice,
  deleteNotice,
  type NoticeListItem,
  type NoticeListMeta,
  type NoticeDetailData,
} from '../../api/class';

function AdminNoticePage() {
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [listMeta, setListMeta] = useState<NoticeListMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetailData | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    classId: null as number | null,
  });
  const [editNotice, setEditNotice] = useState({ title: '', content: '' });

  // 탭 진입 시 클래스 목록 조회
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await getClasses();
        setClasses(
          response.data.map(c => ({ id: c.classId, name: c.className }))
        );
      } catch {
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // 클래스 선택 시 해당 클래스 공지사항 목록 조회
  useEffect(() => {
    if (selectedClassId == null) {
      setNotices([]);
      setListMeta(null);
      setCurrentPage(1);
      return;
    }
    const fetchNotices = async () => {
      setIsLoadingNotices(true);
      try {
        const response = await getNotices(selectedClassId, currentPage);
        setNotices(response.data.items);
        setListMeta(response.data.meta);
      } catch {
        setNotices([]);
        setListMeta(null);
      } finally {
        setIsLoadingNotices(false);
      }
    };
    fetchNotices();
  }, [selectedClassId, currentPage]);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWrite = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (newNotice.classId == null) {
      alert('클래스를 하나 선택해주세요.');
      return;
    }
    try {
      await createNotice(newNotice.classId, {
        title: newNotice.title.trim(),
        content: newNotice.content.trim(),
      });
      setNewNotice({ title: '', content: '', classId: null });
      setIsWriteModalOpen(false);
      if (selectedClassId === newNotice.classId) {
        const response = await getNotices(selectedClassId, currentPage);
        setNotices(response.data.items);
        setListMeta(response.data.meta);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '공지사항 생성에 실패했습니다.');
    }
  };

  const handleNoticeClick = async (notice: NoticeListItem) => {
    if (selectedClassId == null) return;
    try {
      const response = await getNoticeDetail(selectedClassId, notice.noticeId);
      setSelectedNotice(response.data);
      setEditNotice({
        title: response.data.title,
        content: response.data.content,
      });
      setIsEditMode(false);
      setIsDetailModalOpen(true);
    } catch (e) {
      alert(
        e instanceof Error ? e.message : '공지사항을 불러오는데 실패했습니다.'
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedNotice || selectedClassId == null) return;
    if (!editNotice.title.trim() || !editNotice.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    try {
      await updateNotice(selectedClassId, selectedNotice.noticeId, {
        title: editNotice.title.trim(),
        content: editNotice.content.trim(),
      });
      const response = await getNoticeDetail(
        selectedClassId,
        selectedNotice.noticeId
      );
      setSelectedNotice(response.data);
      setIsEditMode(false);
      const listRes = await getNotices(selectedClassId, currentPage);
      setNotices(listRes.data.items);
      setListMeta(listRes.data.meta);
    } catch (e) {
      alert(e instanceof Error ? e.message : '공지사항 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice || selectedClassId == null) return;
    if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(selectedClassId, selectedNotice.noticeId);
      setIsDetailModalOpen(false);
      setSelectedNotice(null);
      const response = await getNotices(selectedClassId, currentPage);
      setNotices(response.data.items);
      setListMeta(response.data.meta);
    } catch (e) {
      alert(e instanceof Error ? e.message : '공지사항 삭제에 실패했습니다.');
    }
  };

  const pinnedNotices = notices.filter(n => n.pinned);
  const generalNotices = notices.filter(n => !n.pinned);
  const totalPages = listMeta?.totalPages ?? 1;

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
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

        {/* 클래스 선택 (1개) */}
        <div className="mb-4 flex flex-wrap gap-2">
          {isLoadingClasses ? (
            <span className="text-sm text-slate-500">클래스 목록 조회 중...</span>
          ) : classes.length === 0 ? (
            <span className="text-sm text-slate-500">등록된 클래스가 없습니다.</span>
          ) : (
            classes.map(classItem => (
              <button
                key={classItem.id}
                type="button"
                onClick={() => {
                  setSelectedClassId(classItem.id);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === classItem.id
                    ? 'bg-[#084773] text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {classItem.name}
              </button>
            ))
          )}
        </div>
      </header>

      {/* 공지사항 목록 */}
      <div className="space-y-6">
        {selectedClassId == null ? (
          <p className="text-slate-500">클래스를 선택하면 해당 클래스의 공지사항 목록이 표시됩니다.</p>
        ) : isLoadingNotices ? (
          <p className="text-slate-500">공지사항 목록을 불러오는 중...</p>
        ) : (
          <>
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
                          key={notice.noticeId}
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
                            {notice.createdAt.slice(0, 10)}
                          </td>
                          <td className="hidden min-[601px]:table-cell px-4 py-3 text-sm text-slate-600">
                            관리자
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
                    {generalNotices.map(notice => (
                      <tr
                        key={notice.noticeId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleNoticeClick(notice)}
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {notice.noticeId}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {notice.title}
                        </td>
                        <td className="hidden min-[431px]:table-cell px-4 py-3 text-sm text-slate-600">
                          {notice.createdAt.slice(0, 10)}
                        </td>
                        <td className="hidden min-[601px]:table-cell px-4 py-3 text-sm text-slate-600">
                          관리자
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#084773] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 글쓰기 모달 - 클래스 1개만 지정 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-8 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsWriteModalOpen(false);
                setNewNotice({ title: '', content: '', classId: null });
              }}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              공지사항 작성
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  제목
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={e =>
                    setNewNotice(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  내용
                </label>
                <textarea
                  value={newNotice.content}
                  onChange={e =>
                    setNewNotice(prev => ({ ...prev, content: e.target.value }))
                  }
                  rows={15}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  클래스 지정 (1개만 선택)
                </label>
                {classes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    등록된 클래스가 없습니다.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {classes.map(classItem => (
                      <label
                        key={classItem.id}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="radio"
                          name="write-class"
                          checked={newNotice.classId === classItem.id}
                          onChange={() =>
                            setNewNotice(prev => ({
                              ...prev,
                              classId: classItem.id,
                            }))
                          }
                          className="h-4 w-4 border-slate-300 text-[#084773] focus:ring-[#084773]"
                        />
                        <span className="text-sm text-slate-700">
                          {classItem.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  setNewNotice({ title: '', content: '', classId: null });
                }}
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWrite}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white hover:bg-[#063a5a]"
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세/수정 모달 - 관리자용 수정/삭제 버튼 */}
      {isDetailModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedNotice(null);
                setIsEditMode(false);
              }}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              {isEditMode ? '공지사항 수정' : '공지사항 상세'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  제목
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editNotice.title}
                    onChange={e =>
                      setEditNotice(prev => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                ) : (
                  <p className="text-slate-900">{selectedNotice.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  내용
                </label>
                {isEditMode ? (
                  <textarea
                    value={editNotice.content}
                    onChange={e =>
                      setEditNotice(prev => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={15}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-slate-900">
                    {selectedNotice.content}
                  </p>
                )}
              </div>

              {!isEditMode && (
                <div className="text-sm text-slate-500">
                  작성일:{' '}
                  {selectedNotice.createdAt.slice(0, 10)}{' '}
                  {selectedNotice.createdAt.slice(11, 19)}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white hover:bg-[#063a5a]"
                  >
                    <Save className="h-4 w-4" />
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white hover:bg-[#063a5a]"
                  >
                    <Save className="h-4 w-4" />
                    수정
                  </button>
                )}
              </div>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedNotice(null);
                  }}
                  className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  닫기
                </button>
              )}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditNotice({
                      title: selectedNotice.title,
                      content: selectedNotice.content,
                    });
                  }}
                  className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminNoticePage;
