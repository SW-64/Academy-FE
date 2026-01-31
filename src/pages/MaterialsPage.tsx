import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from './MainLayout';
import { getStudentClasses, getStudentMaterials } from '../api/students';
import type { Material } from '../types/material';

function MaterialsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [classes, setClasses] = useState<
    Array<{ classId: number; className: string }>
  >([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(() => {
    // sessionStorage에서 저장된 클래스 ID 읽어오기
    const savedClassId = sessionStorage.getItem('selectedClassId');
    return savedClassId ? Number(savedClassId) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // 클래스 선택 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (selectedClassId !== null) {
      sessionStorage.setItem('selectedClassId', selectedClassId.toString());
    } else {
      sessionStorage.removeItem('selectedClassId');
    }
  }, [selectedClassId]);

  // 학생이 속한 클래스 목록 조회
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentClasses();
        setClasses(response.data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '클래스 목록을 불러오는데 실패했습니다.';
        
        // eslint-disable-next-line no-alert
        alert(errorMessage);
        
        // 401 에러인 경우 로그인 페이지로 리다이렉트
        if (errorMessage.includes('인증') || errorMessage.includes('로그인')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [navigate]);

  // 학습자료 목록 조회 (클래스 선택 시)
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedClassId) {
        setMaterials([]);
        setTotalPages(1);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getStudentMaterials({
          page: currentPage,
          limit: itemsPerPage,
          sort: 'created_desc',
          classId: selectedClassId,
        });

        // API 응답을 Material 형식으로 변환
        const convertedMaterials: Material[] = response.data.items.map(
          item => {
            const date = new Date(item.createdAt);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return {
              id: item.materialId,
              title: item.title,
              createdAt: `${year}.${month}.${day}`,
              author: '관리자',
              hasNewTag: false,
              classIds: [selectedClassId],
            };
          }
        );

        setMaterials(convertedMaterials);
        setTotalPages(response.data.meta.totalPages);
      } catch (error) {
        // eslint-disable-next-line no-alert
        alert(
          error instanceof Error
            ? error.message
            : '학습자료 목록을 불러오는데 실패했습니다.'
        );
        setMaterials([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedClassId, currentPage, itemsPerPage]);

  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    // 클래스 선택 변경 시 첫 페이지로 리셋
    setCurrentPage(1);
  }, [selectedClassId]);

  // 일반 리스트는 id 기준 내림차순 정렬 (낮은 번호가 밑으로)
  const sortedMaterials = [...materials].sort((a, b) => b.id - a.id);

  const filteredMaterials = sortedMaterials;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  // 테이블 행 렌더링 함수
  const renderMaterialRow = (material: Material, index: number) => (
    <tr
      key={material.id}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
    >
      <td className="pl-8 pr-1 py-3">
        <span className="text-sm text-slate-700">
          {currentMaterials.length - index}
        </span>
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
        {material.createdAt}
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
        <h1 className="text-2xl font-semibold text-slate-900 text-center md:text-left mb-4">
          학습자료
        </h1>

        {/* 클래스 선택 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {isLoading && classes.length === 0 ? (
            <div className="text-sm text-slate-600">클래스 목록을 불러오는 중...</div>
          ) : classes.length === 0 ? (
            <div className="text-sm text-slate-600">등록된 클래스가 없습니다.</div>
          ) : (
            classes.map(classItem => (
              <button
                key={classItem.classId}
                type="button"
                onClick={() => {
                  setSelectedClassId(classItem.classId);
                  sessionStorage.setItem('selectedClassId', classItem.classId.toString());
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === classItem.classId
                    ? 'bg-[#084773] text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {classItem.className}
              </button>
            ))
          )}
        </div>
      </header>

      {/* 학습자료 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse">
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-slate-600"
                >
                  학습자료 목록을 불러오는 중...
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-slate-600"
                >
                  {selectedClassId
                    ? '등록된 학습자료가 없습니다.'
                    : '클래스를 선택해주세요.'}
                </td>
              </tr>
            ) : (
              currentMaterials.map((material, index) =>
                renderMaterialRow(material, index)
              )
            )}
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
