import { useState } from 'react';
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from './MainLayout';

type Notice = {
  id: number;
  number: number | 'important';
  title: string;
  hasNewTag: boolean;
  author: string;
  createdAt: string;
  views: number;
};

const dummyNotices: Notice[] = [
  {
    id: 1,
    number: 'important',
    title: '2018년도 직장인 건강검진 안내',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:16',
    views: 4,
  },
  {
    id: 2,
    number: 'important',
    title: '5월 사내행사 일정 안내',
    hasNewTag: false,
    author: '박혜진',
    createdAt: '2018.04.20 15:31',
    views: 7,
  },
  {
    id: 3,
    number: 9,
    title: '임직원 영어교육비 지원제도 안내',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:40',
    views: 8,
  },
  {
    id: 4,
    number: 8,
    title: '회사 소개자료 공유',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:40',
    views: 0,
  },
  {
    id: 5,
    number: 7,
    title: '5월 구내식당 메뉴안내',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:39',
    views: 1,
  },
  {
    id: 6,
    number: 6,
    title: '성희롱 예방 교육 자료 게시',
    hasNewTag: false,
    author: '박혜진',
    createdAt: '2018.05.04 14:38',
    views: 0,
  },
  {
    id: 7,
    number: 5,
    title: '더존ICT그룹 2018년 4월 인사발령',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:38',
    views: 0,
  },
  {
    id: 8,
    number: 4,
    title: '2018년 어린이날 대체공휴일 휴무안내',
    hasNewTag: true,
    author: '박혜진',
    createdAt: '2018.05.04 14:17',
    views: 0,
  },
];

function NoticePage() {
  const [startDate, setStartDate] = useState('2017.05.04');
  const [endDate, setEndDate] = useState('2018.05.04');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(dummyNotices.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = dummyNotices.slice(startIndex, endIndex);

  return (
    <MainLayout showCalendar={false}>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">공지사항</h1>
        <p className="mt-1 text-sm text-slate-600">
          회사 공지사항을 조회합니다.
        </p>
      </header>

      {/* 날짜 필터 및 검색 */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 pr-8 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
              placeholder="시작일"
            />
            <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="text-slate-400">~</span>
          <div className="relative">
            <input
              type="text"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 pr-8 text-sm text-slate-700 focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
              placeholder="종료일"
            />
            <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
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
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                제목
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                작성자
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                작성날짜
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                조회수
              </th>
            </tr>
          </thead>
          <tbody>
            {currentNotices.map(notice => (
              <tr
                key={notice.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  {notice.number === 'important' ? (
                    <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                      중요
                    </span>
                  ) : (
                    <span className="text-sm text-slate-700">
                      {notice.number}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900">
                      {notice.title}
                    </span>
                    {notice.hasNewTag && (
                      <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        N
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {notice.author}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {notice.createdAt}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {notice.views}
                </td>
              </tr>
            ))}
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
