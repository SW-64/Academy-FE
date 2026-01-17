import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import MainLayout from './MainLayout';
import { getMaterialDetail } from '../api/materials';
import { getMaterialDownloadUrl } from '../api/students';

interface MaterialDetail {
  materialId: number;
  adminId: number;
  title: string;
  description: string;
  originalFileName: string | null;
  createdAt: string;
  updatedAt: string;
  classIds: number[];
}

function MaterialsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // 학습자료 상세 조회
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await getMaterialDetail(Number(id));
        setMaterial(response.data);
      } catch (error) {
        console.error('학습자료 상세 조회 실패:', error);
        // eslint-disable-next-line no-alert
        alert(
          error instanceof Error
            ? error.message
            : '학습자료를 불러오는데 실패했습니다.'
        );
        navigate('/materials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialDetail();
  }, [id, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1300);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownload = async () => {
    if (!material || !material.originalFileName) {
      // eslint-disable-next-line no-alert
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      setIsDownloading(true);
      // 다운로드 URL 발급 API 호출
      const response = await getMaterialDownloadUrl(material.materialId);

      // 발급받은 URL로 파일 다운로드
      const link = document.createElement('a');
      link.href = response.data.url;
      link.download = response.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('다운로드 URL 발급 실패:', error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : '파일 다운로드에 실패했습니다.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout showCalendar={showCalendar}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-slate-600">학습자료를 불러오는 중...</p>
        </div>
      </MainLayout>
    );
  }

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
          <h2 className="text-xl font-semibold text-slate-900">
            {material.title}
          </h2>
        </div>

        {/* 작성일 영역 */}
        <div className="px-6 pt-4">
          <div className="flex justify-end gap-6 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700">작성일: </span>
              {new Date(material.createdAt).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>

        {/* 내용 영역 */}
        <div className="px-6 pt-4 pb-6">
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line">
            {material.description && (
              <p className="text-slate-600 mb-4 whitespace-pre-line">
                {material.description}
              </p>
            )}
            {material.originalFileName && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-lg bg-[#084773] px-4 py-2 text-sm text-white transition-colors hover:bg-[#063a5a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>
                  {isDownloading
                    ? '다운로드 중...'
                    : `PDF 다운로드 (${material.originalFileName})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MaterialsDetailPage;


