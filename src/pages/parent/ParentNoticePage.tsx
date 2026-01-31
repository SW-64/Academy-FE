import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import MainLayout from '../MainLayout';
import { getMyStudents, getMyStudentClasses } from '../../api/parents';
import {
  getNotices,
  getNoticeDetail,
  type NoticeListItem,
  type NoticeListMeta,
  type NoticeDetailData,
} from '../../api/class';
import type { ParentStudent } from '../../api/parents';

function ParentNoticePage() {
  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [classes, setClasses] = useState<{ classId: number; className: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [listMeta, setListMeta] = useState<NoticeListMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTitle, setSearchTitle] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetailData | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 페이지 진입 시 자녀 목록 조회
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await getMyStudents();
        setStudents(response.data);
      } catch {
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // 자녀 선택 시 해당 자녀의 클래스 목록 조회
  useEffect(() => {
    if (selectedStudentId == null) {
      setClasses([]);
      setSelectedClassId(null);
      setNotices([]);
      setListMeta(null);
      return;
    }
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await getMyStudentClasses(selectedStudentId);
        setClasses(
          response.data.map(c => ({ classId: c.classId, className: c.className }))
        );
        setSelectedClassId(null);
        setNotices([]);
        setListMeta(null);
        setCurrentPage(1);
      } catch {
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [selectedStudentId]);

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
    setCurrentPage(1);
  }, [searchTitle]);

  const pinnedNotices = notices.filter(n => n.pinned);
  const generalNotices = notices.filter(n => !n.pinned);
  const filteredGeneral = searchTitle.trim()
    ? generalNotices.filter(n =>
        n.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : generalNotices;
  const totalPages = listMeta?.totalPages ?? 1;

  const handleNoticeClick = async (notice: NoticeListItem) => {
    if (selectedClassId == null) return;
    try {
      const response = await getNoticeDetail(selectedClassId, notice.noticeId);
      setSelectedNotice(response.data);
      setIsDetailModalOpen(true);
    } catch (e) {
      alert(
        e instanceof Error ? e.message : '공지사항을 불러오는데 실패했습니다.'
      );
    }
  };

  return (
    <MainLayout showCalendar={showCalendar} isParent={true}>
      <header className="mb-6">
        <h1 className="text-center text-2xl font-semibold text-slate-900 md:text-left">
          공지사항
        </h1>
      </header>

      {/* 자녀 선택 (1명) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {isLoadingStudents ? (
          <span className="text-sm text-slate-500">자녀 목록 조회 중...</span>
        ) : students.length === 0 ? (
          <span className="text-sm text-slate-500">등록된 자녀가 없습니다.</span>
        ) : (
          students.map(s => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => setSelectedStudentId(s.studentId)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedStudentId === s.studentId
                  ? 'bg-[#084773] text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.user.name}
            </button>
          ))
        )}
      </div>

      {/* 선택한 자녀의 클래스 선택 (1개) */}
      {selectedStudentId != null && (
        <div className="mb-4 flex flex-wrap gap-2">
          {isLoadingClasses ? (
            <span className="text-sm text-slate-500">클래스 목록 조회 중...</span>
          ) : classes.length === 0 ? (
            <span className="text-sm text-slate-500">
              이 자녀가 속한 클래스가 없습니다.
            </span>
          ) : (
            classes.map(c => (
              <button
                key={c.classId}
                type="button"
                onClick={() => {
                  setSelectedClassId(c.classId);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === c.classId
                    ? 'bg-[#084773] text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {c.className}
              </button>
            ))
          )}
        </div>
      )}

      {selectedClassId == null ? (
        selectedStudentId != null &&
        !isLoadingClasses &&
        classes.length === 0 ? null : selectedStudentId == null ? (
          <p className="text-slate-500">자녀를 선택하면 해당 자녀의 클래스 목록이 표시됩니다.</p>
        ) : (
          <p className="text-slate-500">
            클래스를 선택하면 해당 클래스의 공지사항 목록이 표시됩니다.
          </p>
        )
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-4 pt-3 text-sm text-slate-600 max-[355px]:text-xs">
              전체 {pinnedNotices.length + filteredGeneral.length}건
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                placeholder="제목 검색"
              />
              <button
                type="button"
                className="flex items-center justify-center rounded-lg bg-[#084773] p-2 text-white transition-colors hover:bg-[#063a5a]"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isLoadingNotices ? (
            <p className="text-slate-500">공지사항 목록을 불러오는 중...</p>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full border-collapse">
                  <tbody>
                    {pinnedNotices.map(notice => (
                      <tr
                        key={notice.noticeId}
                        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                        onClick={() => handleNoticeClick(notice)}
                      >
                        <td className="pl-8 pr-1 py-3">
                          <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                            공지
                          </span>
                        </td>
                        <td className="pl-1 pr-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="cursor-pointer text-sm text-slate-900 hover:text-[#084773] hover:underline">
                              {notice.title}
                            </span>
                            {notice.isNew && (
                              <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                N
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden pl-4 pr-1 py-3 text-sm text-slate-700 min-[431px]:table-cell">
                          {notice.createdAt.slice(0, 10)}
                        </td>
                        <td className="hidden pl-1 pr-4 py-3 text-sm text-slate-700 min-[601px]:table-cell">
                          관리자
                        </td>
                      </tr>
                    ))}
                    {filteredGeneral.map(notice => (
                      <tr
                        key={notice.noticeId}
                        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                        onClick={() => handleNoticeClick(notice)}
                      >
                        <td className="pl-8 pr-1 py-3">
                          <span className="text-sm text-slate-700">
                            {notice.noticeId}
                          </span>
                        </td>
                        <td className="pl-1 pr-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="cursor-pointer text-sm text-slate-900 hover:text-[#084773] hover:underline">
                              {notice.title}
                            </span>
                            {notice.isNew && (
                              <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                N
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden pl-4 pr-1 py-3 text-sm text-slate-700 min-[431px]:table-cell">
                          {notice.createdAt.slice(0, 10)}
                        </td>
                        <td className="hidden pl-1 pr-4 py-3 text-sm text-slate-700 min-[601px]:table-cell">
                          관리자
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
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
                    )
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(p => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 공지사항 상세 모달 */}
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
              }}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              {selectedNotice.title}
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              작성일: {selectedNotice.createdAt.slice(0, 10)}{' '}
              {selectedNotice.createdAt.slice(11, 19)}
            </p>
            <div className="whitespace-pre-wrap text-slate-900">
              {selectedNotice.content}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentNoticePage;
