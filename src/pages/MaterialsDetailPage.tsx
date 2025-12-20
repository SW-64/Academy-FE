import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import MainLayout from './MainLayout';
import { dummyMaterials } from './MaterialsPage';

function MaterialsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);

  const material = dummyMaterials.find(m => m.id === Number(id));

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1300);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownload = () => {
    // 임시 PDF 파일 다운로드
    const link = document.createElement('a');
    link.href = '/temp-material.pdf';
    link.download = `${material?.title || '학습자료'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!material) {
    return (
      <MainLayout showCalendar={showCalendar}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-slate-600">학습자료를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/materials')}
            className="mt-4 rounded-lg bg-[#084773] px-4 py-2 text-sm text-white transition-colors hover:bg-[#063a5a]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showCalendar={showCalendar}>
      {/* 헤더 */}
      <header className="mb-6">
        <button
          onClick={() => navigate('/materials')}
          className="mb-4 flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#084773]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로</span>
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 text-center min-[1025px]:text-left">
          학습자료
        </h1>
      </header>

      {/* 학습자료 상세 */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* 제목 영역 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            {material.hasNewTag && (
              <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white flex-shrink-0">
                N
              </span>
            )}
            <h2 className="text-xl font-semibold text-slate-900">
              {material.title}
            </h2>
          </div>
        </div>

        {/* 작성일/작성자 영역 */}
        <div className="px-6 pt-4">
          <div className="flex justify-end gap-6 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700"></span>{' '}
              {material.createdAt.split(' ')[0]}
            </div>
            <div>
              <span className="font-medium text-slate-700"></span>{' '}
              {material.author}
            </div>
          </div>
        </div>

        {/* 내용 영역 */}
        <div className="px-6 pt-4 pb-6">
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line">
            <p className="text-slate-600 mb-4">
              이 학습자료는 고등학교 수학 교육과정에 맞춰 제작되었습니다.
            </p>
            <p className="text-slate-600 mb-4">
              아래 버튼을 클릭하여 PDF 파일을 다운로드하실 수 있습니다.
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm text-white transition-colors hover:bg-[#063a5a]"
            >
              <Download className="h-4 w-4" />
              <span>PDF 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MaterialsDetailPage;
