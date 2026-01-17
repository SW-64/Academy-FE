import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import MainLayout from './MainLayout';
import { getMyClasses, getMyHomeworkProgress } from '../api/students';
import type { StudentClass, StudentHomeworkProgress } from '../api/students';
import { getClassTextbooks } from '../api/class';
import type { ClassTextbookItem } from '../api/class';

function HomeworkPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');
  const textbookIdParam = searchParams.get('textbookId');

  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    classIdParam ? parseInt(classIdParam, 10) : null
  );
  const [textbooks, setTextbooks] = useState<ClassTextbookItem[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState<number | null>(
    textbookIdParam ? parseInt(textbookIdParam, 10) : null
  );
  const [homeworkProgress, setHomeworkProgress] =
    useState<StudentHomeworkProgress | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingTextbooks, setIsLoadingTextbooks] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // 내 클래스 목록 조회
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await getMyClasses();
        setClasses(response.data);
      } catch (error) {
        console.error('클래스 목록 조회 에러:', error);
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // 클래스 선택 시 교재 목록 조회
  useEffect(() => {
    if (selectedClassId) {
      const fetchTextbooks = async () => {
        setIsLoadingTextbooks(true);
        try {
          const response = await getClassTextbooks(selectedClassId);
          if (response && response.data && Array.isArray(response.data)) {
            // 데이터 검증 및 필터링
            const validTextbooks = response.data.filter(
              item => item && item.textbook && item.textbook.textbookId
            );
            setTextbooks(validTextbooks);
          } else {
            setTextbooks([]);
          }
          setSelectedTextbookId(null);
          setHomeworkProgress(null);
        } catch (error) {
          console.error('교재 목록 조회 에러:', error);
          setTextbooks([]);
          setSelectedTextbookId(null);
          setHomeworkProgress(null);
        } finally {
          setIsLoadingTextbooks(false);
        }
      };

      fetchTextbooks();
    } else {
      setTextbooks([]);
      setSelectedTextbookId(null);
      setHomeworkProgress(null);
    }
  }, [selectedClassId]);

  // 교재 선택 시 숙제 진도 조회
  useEffect(() => {
    if (selectedClassId && selectedTextbookId) {
      const fetchProgress = async () => {
        setIsLoadingProgress(true);
        try {
          const response = await getMyHomeworkProgress(
            selectedClassId,
            selectedTextbookId
          );
          if (response && response.data) {
            setHomeworkProgress(response.data);
          } else {
            setHomeworkProgress(null);
          }
        } catch (error) {
          console.error('숙제 진도 조회 에러:', error);
          setHomeworkProgress(null);
        } finally {
          setIsLoadingProgress(false);
        }
      };

      fetchProgress();
    } else {
      setHomeworkProgress(null);
    }
  }, [selectedClassId, selectedTextbookId]);

  // 진행도 계산
  const calculateProgress = () => {
    if (
      !homeworkProgress ||
      !homeworkProgress.student ||
      !homeworkProgress.chapters
    ) {
      return {
        completed: 0,
        inProgress: 0,
        total: 0,
        percentage: 0,
      };
    }

    try {
      const cells = homeworkProgress.student.cells || {};
      const chapters = homeworkProgress.chapters || [];
      const total = chapters.length;
      const completed = Object.values(cells).filter(
        cell => cell?.status === 'COMPLETED'
      ).length;
      const inProgress = Object.values(cells).filter(
        cell => cell?.status === 'IN_PROGRESS'
      ).length;

      return {
        completed,
        inProgress,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } catch (error) {
      console.error('진행도 계산 에러:', error);
      return {
        completed: 0,
        inProgress: 0,
        total: 0,
        percentage: 0,
      };
    }
  };

  const progressData = calculateProgress();

  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">숙제</h1>
        <p className="mt-1 text-sm text-slate-600">
          클래스를 선택하여 숙제 목록을 확인하세요.
        </p>
      </header>

      {/* 클래스 선택 */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          클래스 선택
        </h2>
        {isLoadingClasses ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              클래스 목록을 불러오는 중...
            </p>
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              등록된 클래스가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {classes.map(cls => (
              <button
                key={cls.classId}
                type="button"
                onClick={() => {
                  setSelectedClassId(cls.classId);
                  setSearchParams({ classId: cls.classId.toString() });
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedClassId === cls.classId
                    ? 'border-[#084773] bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <h3 className="font-semibold text-slate-900">
                  {cls.className}
                </h3>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 교재 선택 */}
      {selectedClassId && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            교재 선택
          </h2>
          {isLoadingTextbooks ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                교재 목록을 불러오는 중...
              </p>
            </div>
          ) : textbooks.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-900">
                등록된 교재가 없습니다
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {textbooks
                .filter(
                  item => item && item.textbook && item.textbook.textbookId
                )
                .map(item => (
                  <button
                    key={item.textbook.textbookId}
                    type="button"
                    onClick={() => {
                      setSelectedTextbookId(item.textbook.textbookId);
                      setSearchParams({
                        classId: selectedClassId!.toString(),
                        textbookId: item.textbook.textbookId.toString(),
                      });
                    }}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      selectedTextbookId === item.textbook.textbookId
                        ? 'border-[#084773] bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900">
                      {item.textbook.name || '교재 이름 없음'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.textbook.grade || '?'}학년
                    </p>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 숙제 진도 */}
      {selectedClassId && selectedTextbookId && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            숙제 진도
          </h2>
          {isLoadingProgress ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm text-slate-600">
                숙제 진도를 불러오는 중...
              </p>
            </div>
          ) : homeworkProgress ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {textbooks.find(
                    t => t.textbook.textbookId === selectedTextbookId
                  )?.textbook.name || '교재 정보 없음'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {classes.find(c => c.classId === selectedClassId)
                    ?.className || '클래스 정보 없음'}
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">진행도</span>
                  <span className="font-medium text-slate-900">
                    {progressData.completed} / {progressData.total} (
                    {progressData.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#084773] transition-all"
                    style={{ width: `${progressData.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">
                  단원별 진도
                </h4>
                {homeworkProgress.chapters &&
                homeworkProgress.chapters.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {homeworkProgress.chapters.map(chapter => {
                      const cell =
                        homeworkProgress.student?.cells?.[
                          chapter.chapterId.toString()
                        ];
                      const status = cell?.status || 'NOT_STARTED';
                      const percent = cell?.percent || 0;

                      return (
                        <div
                          key={chapter.chapterId}
                          className={`rounded-lg border-2 p-3 text-center transition-all ${
                            status === 'COMPLETED'
                              ? 'border-green-500 bg-green-50'
                              : status === 'IN_PROGRESS'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {chapter.label || '단원 정보 없음'}
                          </p>
                          {status === 'IN_PROGRESS' && (
                            <p className="mt-1 text-xs text-slate-600">
                              {percent}%
                            </p>
                          )}
                          {status === 'COMPLETED' && (
                            <p className="mt-1 text-xs text-green-700">완료</p>
                          )}
                          {status === 'NOT_STARTED' && (
                            <p className="mt-1 text-xs text-slate-500">
                              미시작
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    단원 정보가 없습니다.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-900">
                숙제 진도 정보를 불러올 수 없습니다
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedClassId && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-sm font-medium text-slate-900">
            클래스를 선택해주세요
          </p>
          <p className="mt-1 text-sm text-slate-600">
            위에서 클래스를 선택하면 해당 클래스의 교재 목록을 확인할 수
            있습니다.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default HomeworkPage;
