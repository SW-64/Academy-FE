import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from './MainLayout';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
export interface Material {
  id: number;
  title: string;
  createdAt: string;
  author: string;
  hasNewTag?: boolean;
}

export const dummyMaterials: Material[] = [
  {
    id: 16,
    title: '미적분 I - 함수의 극한과 연속',
    createdAt: '2026-02-28',
    author: '곽원근',
    hasNewTag: true,
  },
  {
    id: 15,
    title: '확률과 통계 - 이항분포와 정규분포',
    createdAt: '2026-02-27',
    author: '곽원근',
    hasNewTag: true,
  },
  {
    id: 14,
    title: '기하와 벡터 - 공간도형의 방정식',
    createdAt: '2026-02-26',
    author: '곽원근',
  },
  {
    id: 13,
    title: '미적분 II - 적분의 활용',
    createdAt: '2026-02-25',
    author: '곽원근',
  },
  {
    id: 12,
    title: '수학 I - 지수함수와 로그함수',
    createdAt: '2026-02-24',
    author: '곽원근',
  },
  {
    id: 11,
    title: '수학 II - 삼각함수의 성질',
    createdAt: '2026-02-23',
    author: '곽원근',
  },
  {
    id: 10,
    title: '미적분 I - 도함수의 활용',
    createdAt: '2026-02-22',
    author: '곽원근',
  },
  {
    id: 9,
    title: '확률과 통계 - 확률의 기본 성질',
    createdAt: '2026-02-21',
    author: '곽원근',
  },
  {
    id: 8,
    title: '기하와 벡터 - 평면벡터의 연산',
    createdAt: '2026-02-20',
    author: '곽원근',
  },
  {
    id: 7,
    title: '미적분 II - 여러 가지 적분법',
    createdAt: '2026-02-19',
    author: '곽원근',
  },
  {
    id: 6,
    title: '수학 I - 수열의 극한',
    createdAt: '2026-02-18',
    author: '곽원근',
  },
  {
    id: 5,
    title: '수학 II - 함수의 연속과 미분',
    createdAt: '2026-02-17',
    author: '곽원근',
  },
  {
    id: 4,
    title: '미적분 I - 여러 가지 미분법',
    createdAt: '2026-02-16',
    author: '곽원근',
  },
  {
    id: 3,
    title: '확률과 통계 - 조건부 확률',
    createdAt: '2026-02-15',
    author: '곽원근',
  },
  {
    id: 2,
    title: '기하와 벡터 - 공간좌표와 공간벡터',
    createdAt: '2026-02-14',
    author: '곽원근',
  },
  {
    id: 1,
    title: '미적분 II - 정적분의 계산',
    createdAt: '2026-02-13',
    author: '곽원근',
  },
];

function MaterialsPage() {
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

  // 일반 리스트는 id 기준 내림차순 정렬 (낮은 번호가 밑으로)
  const sortedMaterials = [...dummyMaterials].sort((a, b) => b.id - a.id);

  // 제목 검색 필터링
  const filteredMaterials = searchTitle
    ? sortedMaterials.filter(material =>
        material.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
    : sortedMaterials;

  // 검색어가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  // 테이블 행 렌더링 함수
  const renderMaterialRow = (material: Material) => (
    <tr
      key={material.id}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
    >
      <td className="pl-8 pr-1 py-3">
        <span className="text-sm text-slate-700">{material.id}</span>
      </td>
      <td className="pl-1 pr-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-slate-900 cursor-pointer hover:text-[#084773] hover:underline"
            onClick={() => navigate(`/materials/${material.id}`)}
          >
            {material.title}
          </span>
          {material.hasNewTag && (
            <span className="inline-flex rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              N
            </span>
          )}
        </div>
      </td>
      <td className="hidden min-[431px]:table-cell pl-4 pr-1 py-3 text-sm text-slate-700">
        {material.createdAt.split(' ')[0]}
      </td>
      <td className="hidden min-[601px]:table-cell pl-1 pr-4 py-3 text-sm text-slate-700">
        {material.author}
      </td>
    </tr>
  );

  return (
    <MainLayout showCalendar={showCalendar}>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 text-center md:text-left">
          학습자료
        </h1>
        <p className="mt-1 text-sm text-slate-600 text-center md:text-left">
          학습자료를 조회합니다.
        </p>
      </header>

      {/* 검색 및 전체 자료 건수 */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="pl-4 pt-3 text-sm max-[355px]:text-xs text-slate-600">
          전체 {searchTitle ? filteredMaterials.length : dummyMaterials.length}
          건
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

      {/* 학습자료 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse">
          <tbody>
            {currentMaterials.map(material => renderMaterialRow(material))}
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

export default MaterialsPage;
