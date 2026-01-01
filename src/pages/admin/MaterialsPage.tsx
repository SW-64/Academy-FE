import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Save, Upload } from 'lucide-react';
import MainLayout from '../MainLayout';
import { dummyMaterials, type Material } from '../MaterialsPage';

// 더미 클래스 데이터 (실제로는 API에서 가져와야 함)
const dummyClasses = [
  { id: 1, name: '예비고2 월금 정규반' },
  { id: 2, name: '예비고2 화목 정규반' },
  { id: 3, name: '미적분1 기본 특강반' },
  { id: 4, name: '미적분1+2 통합 특강반' },
];

type MaterialWithFile = Material & {
  content?: string;
  pdfFile?: File | null;
  pdfFileName?: string;
  classIds?: number[];
};

function AdminMaterialsPage() {
  const [materials, setMaterials] =
    useState<MaterialWithFile[]>(dummyMaterials);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithFile | null>(null);
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

  const handleWrite = () => {
    if (!newMaterial.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    const material: MaterialWithFile = {
      id: materials.length + 1,
      title: newMaterial.title,
      content: newMaterial.content,
      createdAt: new Date().toLocaleDateString('ko-KR'),
      author: '관리자',
      hasNewTag: true,
      pdfFile: newMaterial.pdfFile,
      pdfFileName:
        newMaterial.pdfFileName ||
        (newMaterial.pdfFile ? newMaterial.pdfFile.name : ''),
      classIds: newMaterial.classIds,
    };

    setMaterials(prev => [material, ...prev]);
    setNewMaterial({ title: '', content: '', pdfFile: null, pdfFileName: '', classIds: [] });
    setIsWriteModalOpen(false);
  };

  const handleMaterialClick = (material: MaterialWithFile) => {
    setSelectedMaterial(material);
    setEditMaterial({
      title: material.title,
      content: material.content || '',
      pdfFile: null,
      pdfFileName: material.pdfFileName || '',
      classIds: material.classIds || [],
    });
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedMaterial) return;
    if (!editMaterial.title.trim()) {
      // eslint-disable-next-line no-alert
      alert('제목을 입력해주세요.');
      return;
    }

    setMaterials(prev =>
      prev.map(material =>
        material.id === selectedMaterial.id
          ? {
              ...material,
              title: editMaterial.title,
              content: editMaterial.content,
              pdfFile: editMaterial.pdfFile || material.pdfFile,
              pdfFileName:
                editMaterial.pdfFileName || material.pdfFileName || '',
              classIds: editMaterial.classIds,
            }
          : material
      )
    );

    setIsDetailModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleDelete = () => {
    if (!selectedMaterial) return;
    if (!confirm('정말 이 학습자료를 삭제하시겠습니까?')) return;

    setMaterials(prev =>
      prev.filter(material => material.id !== selectedMaterial.id)
    );
    setIsDetailModalOpen(false);
    setSelectedMaterial(null);
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
  const sortedMaterials = [...materials].sort((a, b) => b.id - a.id);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedMaterials.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = sortedMaterials.slice(startIndex, endIndex);

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
                {currentMaterials.map(material => (
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
                ))}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsWriteModalOpen(false)}
        >
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
                  {dummyClasses.map(classItem => (
                    <label
                      key={classItem.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMaterial.classIds.includes(classItem.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewMaterial({
                              ...newMaterial,
                              classIds: [...newMaterial.classIds, classItem.id],
                            });
                          } else {
                            setNewMaterial({
                              ...newMaterial,
                              classIds: newMaterial.classIds.filter(
                                id => id !== classItem.id
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                      />
                      <span className="text-sm text-slate-700">
                        {classItem.name}
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
                        클릭하여 파일을 선택하거나 드래그하여 업로드
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
                className="rounded-lg bg-[#084773] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세/수정 모달 */}
      {isDetailModalOpen && selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
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
                  {dummyClasses.map(classItem => (
                    <label
                      key={classItem.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editMaterial.classIds.includes(classItem.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditMaterial({
                              ...editMaterial,
                              classIds: [...editMaterial.classIds, classItem.id],
                            });
                          } else {
                            setEditMaterial({
                              ...editMaterial,
                              classIds: editMaterial.classIds.filter(
                                id => id !== classItem.id
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                      />
                      <span className="text-sm text-slate-700">
                        {classItem.name}
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
                        {editMaterial.pdfFileName ||
                          selectedMaterial.pdfFileName ||
                          'PDF 파일을 선택하세요'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        클릭하여 파일을 선택하거나 드래그하여 업로드
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
