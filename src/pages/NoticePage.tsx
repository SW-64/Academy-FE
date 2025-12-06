import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from './MainLayout';
import { dummyNotices, type Notice } from '../data/noticesData';

function NoticePage() {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 고정 공지와 일반 공지 분리
  const pinnedNotices = dummyNotices.filter(notice => notice.isPinned);
  // 일반 리스트는 id 기준 내림차순 정렬 (낮은 번호가 밑으로)
  const sortedNotices = [...dummyNotices].sort((a, b) => b.id - a.id);
  
  // 제목 검색 필터링
  const filteredNotices = searchTitle
    ? sortedNotices.filter(notice =>
        notice.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : sortedNotices;
  
  // 검색어가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle]);
  
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, endIndex);
  
  // 테이블 행 렌더링 함수 (고정 공지 섹션용)
  const renderPinnedNoticeRow = (notice: Notice) => (
    <tr
      key={notice.id}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
    >
      <td className="pl-6 pr-1 py-3">
        <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
          공지
        </span>
      </td>
      <td className="pl-1 pr-4 py-3">
        <div className="flex items-center gap-2">
          <span 
            className="text-sm text-slate-900 cursor-pointer hover:text-[#084773] hover:underline"
            onClick={() => navigate(`/notice/${notice.id}`)}
          >
            {notice.title}
          </span>
          {notice.hasNewTag && (
            <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              N
            </span>
          )}
        </div>
      </td>
      <td className="hidden min-[431px]:table-cell pl-4 pr-1 py-3 text-sm text-slate-700">
        {notice.createdAt.split(' ')[0]}
      </td>
      <td className="hidden min-[601px]:table-cell pl-1 pr-4 py-3 text-sm text-slate-700">
        {notice.author}
      </td>
    </tr>
  );
  
  // 테이블 행 렌더링 함수 (일반 리스트용)
  const renderNoticeRow = (notice: Notice) => (
    <tr
      key={notice.id}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
    >
      <td className="pl-8 pr-0 py-3">
        <span className="text-sm text-slate-700">
          {notice.id}
        </span>
      </td>
      <td className="pl-1 pr-4 py-3">
        <div className="flex items-center gap-2">
          <span 
            className="text-sm text-slate-900 cursor-pointer hover:text-[#084773] hover:underline"
            onClick={() => navigate(`/notice/${notice.id}`)}
          >
            {notice.title}
          </span>
          {notice.hasNewTag && (
            <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              N
            </span>
          )}
        </div>
      </td>
      <td className="hidden min-[431px]:table-cell pl-4 pr-1 py-3 text-sm text-slate-700">
        {notice.createdAt.split(' ')[0]}
      </td>
      <td className="hidden min-[601px]:table-cell pl-1 pr-4 py-3 text-sm text-slate-700">
        {notice.author}
      </td>
    </tr>
  );

  return (
    <MainLayout showCalendar={showCalendar}>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 text-center md:text-left">공지사항</h1>
        <p className="mt-1 text-sm text-slate-600 text-center md:text-left">
          회사 공지사항을 조회합니다.
        </p>
      </header>

      {/* 검색 및 전체 공지 건수 */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="pl-4 pt-3 text-sm max-[355px]:text-xs text-slate-600">
          전체 {searchTitle ? filteredNotices.length : dummyNotices.length}건
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
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

      {/* 공지사항 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse">
          {/* <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="pl-6 pr-1 py-3 text-left text-xs font-semibold text-slate-700">
                번호
              </th>
              <th className="pl-1 pr-4 py-3 text-left text-xs font-semibold text-slate-700">
                제목
              </th>
              <th className="pl-4 pr-1 py-3 text-left text-xs font-semibold text-slate-700">
                작성날짜
              </th>
              <th className="pl-1 pr-4 py-3 text-left text-xs font-semibold text-slate-700">
                작성자
              </th>
            </tr>
          </thead> */}
          <tbody>
            {/* 고정 공지 섹션 */}
            {pinnedNotices.length > 0 && (
              <>
                {pinnedNotices.map(notice => renderPinnedNoticeRow(notice))}
              </>
            )}
            {/* 일반 공지 리스트 */}
            {currentNotices.map(notice => renderNoticeRow(notice))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
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
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </MainLayout>
  );
}

export default NoticePage;
