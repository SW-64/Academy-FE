import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  getMyStudents,
  getMyStudentClasses,
  getMyStudentHomeworkProgress,
} from '../../api/parents';
import type {
  ParentStudent,
  ParentStudentClass,
  ParentStudentHomeworkProgress,
} from '../../api/parents';
import { getClassTextbooks } from '../../api/class';
import type { ClassTextbookItem } from '../../api/class';

function ParentHomeworkProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentIdParam = searchParams.get('studentId');
  const classIdParam = searchParams.get('classId');
  const textbookIdParam = searchParams.get('textbookId');

  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    studentIdParam ? parseInt(studentIdParam, 10) : null
  );
  const [classes, setClasses] = useState<ParentStudentClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    classIdParam ? parseInt(classIdParam, 10) : null
  );
  const [textbooks, setTextbooks] = useState<ClassTextbookItem[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState<number | null>(
    textbookIdParam ? parseInt(textbookIdParam, 10) : null
  );
  const [homeworkProgress, setHomeworkProgress] =
    useState<ParentStudentHomeworkProgress | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingTextbooks, setIsLoadingTextbooks] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // 자녀 목록 조회
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await getMyStudents();
        setStudents(response.data);
      } catch (error) {
        console.error('자녀 목록 조회 에러:', error);
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // 자녀 선택 시 클래스 목록 조회
  useEffect(() => {
    if (selectedStudentId) {
      const fetchClasses = async () => {
        setIsLoadingClasses(true);
        try {
          const response = await getMyStudentClasses(selectedStudentId);
          setClasses(response.data);
          setSelectedClassId(null);
          setTextbooks([]);
          setSelectedTextbookId(null);
          setHomeworkProgress(null);
        } catch (error) {
          console.error('자녀 클래스 목록 조회 에러:', error);
          setClasses([]);
        } finally {
          setIsLoadingClasses(false);
        }
      };

      fetchClasses();
    } else {
      setClasses([]);
      setSelectedClassId(null);
      setTextbooks([]);
      setSelectedTextbookId(null);
      setHomeworkProgress(null);
    }
  }, [selectedStudentId]);

  // 클래스 선택 시 교재 목록 조회
  useEffect(() => {
    if (selectedClassId) {
      const fetchTextbooks = async () => {
        setIsLoadingTextbooks(true);
        try {
          const response = await getClassTextbooks(selectedClassId);
          setTextbooks(response.data);
          setSelectedTextbookId(null);
          setHomeworkProgress(null);
        } catch (error) {
          console.error('교재 목록 조회 에러:', error);
          setTextbooks([]);
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
    if (selectedStudentId && selectedClassId && selectedTextbookId) {
      const fetchProgress = async () => {
        setIsLoadingProgress(true);
        try {
          const response = await getMyStudentHomeworkProgress(
            selectedStudentId,
            selectedClassId,
            selectedTextbookId
          );
          setHomeworkProgress(response.data);
        } catch (error) {
          console.error('자녀 숙제 진도 조회 에러:', error);
          setHomeworkProgress(null);
        } finally {
          setIsLoadingProgress(false);
        }
      };

      fetchProgress();
    } else {
      setHomeworkProgress(null);
    }
  }, [selectedStudentId, selectedClassId, selectedTextbookId]);

  // 진행도 계산
  const calculateProgress = () => {
    if (!homeworkProgress) {
      return {
        completed: 0,
        inProgress: 0,
        total: 0,
        percentage: 0,
      };
    }

    const cells = homeworkProgress.student.cells;
    const total = homeworkProgress.chapters.length;
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
  };

  const progressData = calculateProgress();
  const selectedStudent = students.find(s => s.studentId === selectedStudentId);

  return (
    <MainLayout isParent={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          자녀 숙제 진도
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          자녀를 선택하여 숙제 진도를 확인하세요.
        </p>
      </header>

      {/* 자녀 선택 */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">자녀 선택</h2>
        {isLoadingStudents ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">자녀 목록을 불러오는 중...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              등록된 자녀가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {students.map(student => (
              <button
                key={student.studentId}
                type="button"
                onClick={() => {
                  setSelectedStudentId(student.studentId);
                  setSearchParams({ studentId: student.studentId.toString() });
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedStudentId === student.studentId
                    ? 'border-[#084773] bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <h3 className="font-semibold text-slate-900">
                  {student.user.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {student.school} {student.grade}학년
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 클래스 선택 */}
      {selectedStudentId && (
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
                    setSearchParams({
                      studentId: selectedStudentId.toString(),
                      classId: cls.classId.toString(),
                    });
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
      )}

      {/* 교재 선택 */}
      {selectedStudentId && selectedClassId && (
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
              {textbooks.map(item => (
                <button
                  key={item.textbook.textbookId}
                  type="button"
                  onClick={() => {
                    setSelectedTextbookId(item.textbook.textbookId);
                    setSearchParams({
                      studentId: selectedStudentId.toString(),
                      classId: selectedClassId.toString(),
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
                    {item.textbook.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.textbook.grade}학년
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 숙제 진도 */}
      {selectedStudentId && selectedClassId && selectedTextbookId && (
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
                  {
                    textbooks.find(
                      t => t.textbook.textbookId === selectedTextbookId
                    )?.textbook.name
                  }
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedStudent?.user.name} ·{' '}
                  {classes.find(c => c.classId === selectedClassId)?.className}
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {homeworkProgress.chapters.map(chapter => {
                    const cell =
                      homeworkProgress.student.cells[
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
                          {chapter.label}
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
                          <p className="mt-1 text-xs text-slate-500">미시작</p>
                        )}
                      </div>
                    );
                  })}
                </div>
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

      {!selectedStudentId && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-sm font-medium text-slate-900">
            자녀를 선택해주세요
          </p>
          <p className="mt-1 text-sm text-slate-600">
            위에서 자녀를 선택하면 해당 자녀의 클래스 목록을 확인할 수 있습니다.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentHomeworkProgressPage;
