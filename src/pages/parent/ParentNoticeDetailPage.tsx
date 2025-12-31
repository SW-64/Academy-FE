import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../MainLayout';
import { dummyNotices } from '../../data/noticesData';

function ParentNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const notice = dummyNotices.find(n => n.id === Number(id));
  
  // 이전 공지사항 찾기 (현재 id보다 작은 id 중 최대 2개)
  const previousNotices = dummyNotices
    .filter(n => n.id < Number(id))
    .sort((a, b) => b.id - a.id)
    .slice(0, 2);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1300);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!notice) {
    return (
      <MainLayout showCalendar={showCalendar} isParent={true}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-slate-600">공지사항을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/parent/notice')}
            className="mt-4 rounded-lg bg-[#084773] px-4 py-2 text-sm text-white transition-colors hover:bg-[#063a5a]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showCalendar={showCalendar} isParent={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <button
          onClick={() => navigate('/parent/notice')}
          className="mb-4 flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#084773]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로</span>
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 text-center min-[1025px]:text-left">공지사항</h1>
      </header>

      {/* 공지사항 상세 */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* 제목 영역 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            {notice.isPinned && (
              <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white flex-shrink-0">
                공지
              </span>
            )}
            {notice.hasNewTag && (
              <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white flex-shrink-0">
                N
              </span>
            )}
            <h2 className="text-xl font-semibold text-slate-900">{notice.title}</h2>
          </div>
        </div>

        {/* 작성일/작성자 영역 */}
        <div className="px-6 pt-4">
          <div className="flex justify-end gap-6 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700"></span>{' '}
              {notice.createdAt.split(' ')[0]}
            </div>
            <div>
              <span className="font-medium text-slate-700"></span> {notice.author}
            </div>
          </div>
        </div>

        {/* 내용 영역 */}
        <div className="px-6 pt-4 pb-6">
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line">
            {notice.content || (
              <p className="text-slate-600">
                공지사항 내용이 없습니다. 추후 내용이 추가될 예정입니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 이전 공지사항 */}
      {previousNotices.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900 pl-2">이전 공지사항</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {previousNotices.map(prevNotice => (
              <div
                key={prevNotice.id}
                onClick={() => navigate(`/parent/notice/${prevNotice.id}`)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#084773] hover:bg-slate-50"
              >
                <div className="mb-2 flex items-center gap-2">
                  {prevNotice.isPinned && (
                    <span className="inline-flex rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                      공지
                    </span>
                  )}
                  {prevNotice.hasNewTag && (
                    <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      N
                    </span>
                  )}
                </div>
                <h4 className="mb-2 line-clamp-2 text-sm font-medium text-slate-900">
                  {prevNotice.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>{prevNotice.createdAt.split(' ')[0]}</span>
                  <span>{prevNotice.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentNoticeDetailPage;

