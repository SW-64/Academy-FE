import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Save, Upload } from 'lucide-react';
import MainLayout from '../MainLayout';
import { dummyMaterials, type Material } from '../MaterialsPage';
import { getClasses, type ClassData } from '../../api/class';
import {
  getMaterials,
  createMaterial,
  uploadMaterialFile,
  getMaterialDetail,
  deleteMaterial,
  updateMaterial,
} from '../../api/materials';

type MaterialWithFile = Material & {
  content?: string;
  pdfFile?: File | null;
  pdfFileName?: string;
  classIds?: number[];
};

function AdminMaterialsPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [materials, setMaterials] =
    useState<MaterialWithFile[]>(dummyMaterials);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithFile | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    content: '',
    pdfFile: null as File | null,
    pdfFileName: '',
    classIds: [] as number[],
  });
  const [editMaterial, setEditMaterial] = useState({
    title: '',
    content: '',
    pdfFile: null as File | null,
    pdfFileName: '',
    classIds: [] as number[],
  });

  const handleWrite = async () => {
    if (!newMaterial.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    if (newMaterial.classIds.length === 0) {
      // eslint-disable-next-line no-alert
      alert('최소 하나의 클래스를 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // 1단계: 학습자료 생성 API 호출
      const createResponse = await createMaterial({
        title: newMaterial.title,
        description: newMaterial.content || '',
        classIds: newMaterial.classIds,
      });

      const materialId = createResponse.data.materialId;

      // 2단계: 파일이 있으면 파일 업로드 API 호출
      if (newMaterial.pdfFile) {
        await uploadMaterialFile(materialId, newMaterial.pdfFile);
      }

      // 성공 메시지
      // eslint-disable-next-line no-alert
      alert('학습자료가 성공적으로 생성되었습니다.');

      // 폼 초기화
      setNewMaterial({
        title: '',
        content: '',
        pdfFile: null,
        pdfFileName: '',
        classIds: [],
      });
      setIsWriteModalOpen(false);

      // 선택된 클래스가 있으면 해당 클래스의 학습자료 목록 새로고침
      if (selectedClassId) {
        const response = await getMaterials({
          page: currentPage,
          limit: itemsPerPage,
          sort: 'created_desc',
          classId: selectedClassId,
        });

        const convertedMaterials: MaterialWithFile[] = response.data.items.map(
          item => ({
            id: item.materialId,
            title: item.title,
            createdAt: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            author: '관리자',
            hasNewTag: false,
            classIds: [selectedClassId],
          })
        );

        setMaterials(convertedMaterials);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error('학습자료 생성 실패:', error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : '학습자료 생성에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialClick = async (material: MaterialWithFile) => {
    try {
      setIsLoading(true);
      // 학습자료 상세 정보 조회
      const response = await getMaterialDetail(material.id);

      const detailData = response.data;
      const materialWithDetail: MaterialWithFile = {
        id: detailData.materialId,
        title: detailData.title,
        content: detailData.description,
        createdAt: new Date(detailData.createdAt).toLocaleDateString('ko-KR'),
        author: '관리자',
        hasNewTag: false,
        pdfFile: null,
        pdfFileName: detailData.originalFileName || '',
        classIds: detailData.classIds,
      };

      setSelectedMaterial(materialWithDetail);
      setEditMaterial({
        title: detailData.title,
        content: detailData.description || '',
        pdfFile: null,
        pdfFileName: detailData.originalFileName || '',
        classIds: detailData.classIds,
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('학습자료 상세 조회 실패:', error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : '학습자료를 불러오는데 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMaterial) return;
    if (!editMaterial.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    if (editMaterial.classIds.length === 0) {
      // eslint-disable-next-line no-alert
      alert('최소 하나의 클래스를 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // 1단계: 학습자료 수정 API 호출
      await updateMaterial(selectedMaterial.id, {
        title: editMaterial.title,
        description: editMaterial.content || '',
        classIds: editMaterial.classIds,
      });

      // 2단계: 파일이 있으면 파일 업로드 API 호출
      if (editMaterial.pdfFile) {
        await uploadMaterialFile(selectedMaterial.id, editMaterial.pdfFile);
      }

      // 성공 메시지
      // eslint-disable-next-line no-alert
      alert('학습자료가 성공적으로 수정되었습니다.');

      setIsDetailModalOpen(false);
      setSelectedMaterial(null);

      // 선택된 클래스가 있으면 해당 클래스의 학습자료 목록 새로고침
      if (selectedClassId) {
        const response = await getMaterials({
          page: currentPage,
          limit: itemsPerPage,
          sort: 'created_desc',
          classId: selectedClassId,
        });

        const convertedMaterials: MaterialWithFile[] = response.data.items.map(
          item => ({
            id: item.materialId,
            title: item.title,
            createdAt: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            author: '관리자',
            hasNewTag: false,
            classIds: [selectedClassId],
          })
        );

        setMaterials(convertedMaterials);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error('학습자료 수정 실패:', error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : '학습자료 수정에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    if (!confirm('정말 이 학습자료를 삭제하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await deleteMaterial(selectedMaterial.id);

      // 성공 메시지
      // eslint-disable-next-line no-alert
      alert('학습자료가 성공적으로 삭제되었습니다.');

      setIsDetailModalOpen(false);
      setSelectedMaterial(null);

      // 선택된 클래스가 있으면 해당 클래스의 학습자료 목록 새로고침
      if (selectedClassId) {
        const response = await getMaterials({
          page: currentPage,
          limit: itemsPerPage,
          sort: 'created_desc',
          classId: selectedClassId,
        });

        const convertedMaterials: MaterialWithFile[] = response.data.items.map(
          item => ({
            id: item.materialId,
            title: item.title,
            createdAt: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            author: '관리자',
            hasNewTag: false,
            classIds: [selectedClassId],
          })
        );

        setMaterials(convertedMaterials);
        setTotalPages(response.data.meta.totalPages);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error('학습자료 삭제 실패:', error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : '학습자료 삭제에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditMaterial({
          ...editMaterial,
          pdfFile: file,
          pdfFileName: file.name,
        });
      } else {
        setNewMaterial({
          ...newMaterial,
          pdfFile: file,
          pdfFileName: file.name,
        });
      }
    }
  };

  const itemsPerPage = 10;

  // 클래스 목록 조회
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await getClasses();
        setClasses(response.data);
      } catch (error) {
        console.error('클래스 목록 조회 실패:', error);
        // eslint-disable-next-line no-alert
        alert('클래스 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
        const response = await getMaterials({
          page: currentPage,
          limit: itemsPerPage,
          sort: 'created_desc',
          classId: selectedClassId,
        });

        // API 응답을 MaterialWithFile 형식으로 변환
        const convertedMaterials: MaterialWithFile[] = response.data.items.map(
          item => ({
            id: item.materialId,
            title: item.title,
            createdAt: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            author: '관리자',
            hasNewTag: false,
            classIds: [selectedClassId],
          })
        );

        setMaterials(convertedMaterials);
        setTotalPages(response.data.meta.totalPages);
      } catch (error) {
        console.error('학습자료 목록 조회 실패:', error);
        // eslint-disable-next-line no-alert
        alert('학습자료 목록을 불러오는데 실패했습니다.');
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

    handleResize();
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

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-semibold text-slate-900">
              학습자료 관리
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
          {isLoading && classes.length === 0 ? (
            <div className="text-sm text-slate-600">클래스 목록을 불러오는 중...</div>
          ) : classes.length === 0 ? (
            <div className="text-sm text-slate-600">등록된 클래스가 없습니다.</div>
          ) : (
            classes.map(classItem => (
              <button
                key={classItem.classId}
                type="button"
                onClick={() => setSelectedClassId(classItem.classId)}
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

      {/* 학습자료 목록 */}
      <div className="space-y-6">
        <section>
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
                  materials.map(material => (
                    <tr
                      key={material.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleMaterialClick(material)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {material.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {material.title}
                      </td>
                      <td className="hidden min-[431px]:table-cell px-4 py-3 text-sm text-slate-600">
                        {material.createdAt}
                      </td>
                      <td className="hidden min-[601px]:table-cell px-4 py-3 text-sm text-slate-600">
                        {material.author}
                      </td>
                    </tr>
                  ))
                )}
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
              학습자료 작성
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={e =>
                    setNewMaterial({ ...newMaterial, title: e.target.value })
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
                  value={newMaterial.content}
                  onChange={e =>
                    setNewMaterial({ ...newMaterial, content: e.target.value })
                  }
                  rows={15}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  클래스 지정
                </label>
                <div className="space-y-2">
                  {classes.map(classItem => (
                    <label
                      key={classItem.classId}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMaterial.classIds.includes(classItem.classId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewMaterial({
                              ...newMaterial,
                              classIds: [...newMaterial.classIds, classItem.classId],
                            });
                          } else {
                            setNewMaterial({
                              ...newMaterial,
                              classIds: newMaterial.classIds.filter(
                                id => id !== classItem.classId
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                      />
                      <span className="text-sm text-slate-700">
                        {classItem.className}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PDF 파일
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-[#084773] hover:bg-slate-50">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">
                        {newMaterial.pdfFileName || 'PDF 파일을 선택하세요'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        클릭하여 파일을 선택하여 업로드하세요
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => handleFileChange(e, false)}
                      className="hidden"
                      id="pdf-upload"
                    />
                  </label>
                  {newMaterial.pdfFileName && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">
                        {newMaterial.pdfFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewMaterial({
                            ...newMaterial,
                            pdfFile: null,
                            pdfFileName: '',
                          })
                        }
                        className="ml-auto text-slate-500 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  setNewMaterial({
                    title: '',
                    content: '',
                    pdfFile: null,
                    pdfFileName: '',
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
                disabled={isLoading}
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? '처리 중...' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세/수정 모달 */}
      {isDetailModalOpen && selectedMaterial && (
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
              학습자료 수정
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={editMaterial.title}
                  onChange={e =>
                    setEditMaterial({ ...editMaterial, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  내용
                </label>
                <textarea
                  value={editMaterial.content}
                  onChange={e =>
                    setEditMaterial({
                      ...editMaterial,
                      content: e.target.value,
                    })
                  }
                  rows={15}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  클래스 지정
                </label>
                <div className="space-y-2">
                  {classes.map(classItem => (
                    <label
                      key={classItem.classId}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editMaterial.classIds.includes(classItem.classId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditMaterial({
                              ...editMaterial,
                              classIds: [
                                ...editMaterial.classIds,
                                classItem.classId,
                              ],
                            });
                          } else {
                            setEditMaterial({
                              ...editMaterial,
                              classIds: editMaterial.classIds.filter(
                                id => id !== classItem.classId
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                      />
                      <span className="text-sm text-slate-700">
                        {classItem.className}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PDF 파일
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-[#084773] hover:bg-slate-50">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">
                        {editMaterial.pdfFileName || 'PDF 파일을 선택하세요'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        클릭하여 파일을 선택하여 업로드하세요
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => handleFileChange(e, true)}
                      className="hidden"
                      id="pdf-edit-upload"
                    />
                  </label>
                  {(editMaterial.pdfFileName ||
                    selectedMaterial.pdfFileName) && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">
                        {editMaterial.pdfFileName ||
                          selectedMaterial.pdfFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditMaterial({
                            ...editMaterial,
                            pdfFile: null,
                            pdfFileName: '',
                          })
                        }
                        className="ml-auto text-slate-500 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
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

export default AdminMaterialsPage;
