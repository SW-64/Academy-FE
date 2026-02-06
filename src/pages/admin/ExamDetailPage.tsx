import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../MainLayout';
import {
  getWrongAnswers,
  patchWrongAnswers,
  getErrorRates,
  createErrorRates,
  getRankings,
  createRankings,
} from '../../api/class';

// 타입 정의
export type ExamRecord = {
  studentId: number;
  studentName: string;
  date: string;
  dateFormatted: string;
  score: number;
  average: number;
  grade: string;
  targetScore: number;
  differenceFromTarget: number;
  wrongAnswers?: number[];
  classId?: number;
  school?: string;
  isTaken?: boolean;
  scoreForAvg?: number | null;
};

function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const [examData, setExamData] = useState<{
    date: string;
    name: string;
    questions: {
      questionNumber: number;
      points: number;
      examDetailId: number;
    }[];
    records: ExamRecord[];
    /** 전체 학생 평균 점수 (백엔드 계산 값) */
    studentAverage: number | null;
    /** 상위 30% 평균 점수 (백엔드 계산 값) */
    top30Average: number | null;
  } | null>(null);
  const [errorRatesDetails, setErrorRatesDetails] = useState<
    { question: number; points: number; errorRate: string }[] | null
  >(null);
  const [isLoadingErrorRates, setIsLoadingErrorRates] = useState(false);
  const [isPatchingWrong, setIsPatchingWrong] = useState(false);
  const [rankings, setRankings] = useState<
    | {
        studentId: number;
        name: string;
        isTaken: number | null;
        score: number | null;
        ranking: number | null;
      }[]
    | null
  >(null);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isCreatingRankings, setIsCreatingRankings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showErrorRate, setShowErrorRate] = useState(false);
  const [showStudentAnswers, setShowStudentAnswers] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentWrongAnswers, setStudentWrongAnswers] = useState<
    Record<number, number[]>
  >({});
  /** 학생별 응시 여부. true=응시, false=미응시. 비워두면 true로 전송 */
  const [studentIsTaken, setStudentIsTaken] = useState<Record<number, boolean>>(
    {}
  );

  // 시험 오답 문제 조회 API
  useEffect(() => {
    if (!examId || !classId) {
      navigate('/admin/grades');
      return;
    }

    const cid = Number(classId);
    const eid = Number(examId);
    if (isNaN(cid) || isNaN(eid)) {
      navigate('/admin/grades');
      return;
    }

    const fetchWrongAnswers = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getWrongAnswers(cid, eid);
        const { exam, questions, students } = res.data;

        const dateStr = exam.examDate.split('T')[0];
        const dateFormatted =
          dateStr && dateStr.length >= 10
            ? `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}`
            : '';

        const wrongMap: Record<number, number[]> = {};
        students.forEach(s => {
          wrongMap[s.studentId] = s.wrongQuestions || [];
        });

        const records: ExamRecord[] = students
          .map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            date: dateStr,
            dateFormatted,
            score: s.score ?? 0,
            average: 0,
            grade: '',
            targetScore: 0,
            differenceFromTarget: 0,
            school: s.school,
            isTaken: s.isTaken,
            scoreForAvg: s.score,
          }))
          .sort((a, b) => a.studentName.localeCompare(b.studentName, 'ko'));

        // 백엔드에서 내려주는 평균/상위 30% 평균 값 파싱
        const parseNumberOrNull = (value: unknown): number | null => {
          if (value == null) return null;
          if (typeof value === 'number') return isNaN(value) ? null : value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
          }
          return null;
        };

        // 학생 평균: studentAverage 그대로 사용
        const studentAverage = parseNumberOrNull(exam.studentAverage);
        // 상위 30% 평균: 신규 필드 topStudentAverage를 우선 사용, 없으면 기존 top30Average 사용
        const top30Source = exam.topStudentAverage ?? exam.top30Average;
        const top30Average = parseNumberOrNull(top30Source);

        setStudentWrongAnswers(wrongMap);
        setStudentIsTaken(prev => ({
          ...prev,
          ...Object.fromEntries(records.map(r => [r.studentId, true])),
        }));
        setExamData({
          date: dateStr,
          name: exam.examTitle,
          questions: questions.map(q => ({
            questionNumber: q.question,
            points: q.points,
            examDetailId: q.examDetailId,
          })),
          records,
          studentAverage,
          top30Average,
        });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : '시험 오답 문제 조회에 실패했습니다.';
        setLoadError(msg);
        alert(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWrongAnswers();
  }, [examId, classId, navigate]);

  if (isLoading || !examData) {
    return (
      <MainLayout showCalendar={false} isAdmin={true}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-500">{loadError || '로딩 중...'}</div>
        </div>
      </MainLayout>
    );
  }

  const totalQuestions = examData.questions.length;
  const maxQuestions = totalQuestions;

  // 학생별 오답 정보
  const getStudentAnswerInfo = (studentId: number) => {
    const record = examData.records.find(r => r.studentId === studentId);
    if (!record) {
      return { tookExam: false, wrongAnswers: [], score: 0 };
    }
    const wrongAnswers = studentWrongAnswers[studentId] || [];
    const isTaken = studentIsTaken[record.studentId] ?? record.isTaken ?? true;
    return {
      tookExam: isTaken,
      wrongAnswers,
      score: record.score,
    };
  };

  // 통계 계산
  const totalStudents = examData.records.length;
  const tookExamCount = examData.records.filter(r => {
    const info = getStudentAnswerInfo(r.studentId);
    return info.tookExam;
  }).length;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-[95%] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                navigate(
                  classId ? `/admin/grades?classId=${classId}` : '/admin/grades'
                )
              }
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </button>
            <h1 className="text-2xl font-semibold text-slate-900">
              {examData.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!showErrorRate && classId && examId) {
                  setIsLoadingErrorRates(true);
                  try {
                    const res = await getErrorRates(
                      Number(classId),
                      Number(examId)
                    );
                    setErrorRatesDetails(res.data.details);
                  } catch (e) {
                    alert(
                      e instanceof Error
                        ? e.message
                        : '오답률 조회에 실패했습니다.'
                    );
                    return;
                  } finally {
                    setIsLoadingErrorRates(false);
                  }
                }
                setShowErrorRate(!showErrorRate);
                setShowStudentAnswers(false);
              }}
              disabled={isLoadingErrorRates}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showErrorRate
                  ? 'border-[#084773] bg-[#084773] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isLoadingErrorRates ? '로딩...' : '오답률 확인'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowStudentAnswers(!showStudentAnswers);
                setShowErrorRate(false);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showStudentAnswers
                  ? 'border-[#084773] bg-[#084773] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              학생별 오답번호
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!showRanking && classId && examId) {
                  setIsLoadingRankings(true);
                  try {
                    const res = await getRankings(
                      Number(classId),
                      Number(examId)
                    );
                    setRankings(res.data);
                  } catch (e) {
                    alert(
                      e instanceof Error
                        ? e.message
                        : '시험 등수 조회에 실패했습니다.'
                    );
                    return;
                  } finally {
                    setIsLoadingRankings(false);
                  }
                }
                setShowRanking(!showRanking);
                setShowErrorRate(false);
                setShowStudentAnswers(false);
                setIsEditMode(false);
              }}
              disabled={isLoadingRankings}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showRanking
                  ? 'border-[#084773] bg-[#084773] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isLoadingRankings ? '로딩...' : '성적 순위'}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (isEditMode) {
                  if (!classId || !examId) return;
                  setIsPatchingWrong(true);
                  try {
                    const items = examData.records.map(r => {
                      const wrongIds = (studentWrongAnswers[r.studentId] || [])
                        .map(
                          qNum =>
                            examData.questions.find(
                              q => q.questionNumber === qNum
                            )?.examDetailId
                        )
                        .filter((id): id is number => id != null);
                      const isTaken =
                        studentIsTaken[r.studentId] ?? r.isTaken ?? true;
                      return {
                        studentId: r.studentId,
                        wrongExamDetailIds: wrongIds,
                        isTaken,
                      };
                    });
                    await patchWrongAnswers(Number(classId), Number(examId), {
                      items,
                    });
                    alert('수정되었습니다.');
                    setIsEditMode(false);
                    setShowErrorRate(false);
                    setShowStudentAnswers(false);
                    setShowRanking(false);
                  } catch (e) {
                    alert(
                      e instanceof Error
                        ? e.message
                        : '시험 오답 수정에 실패했습니다.'
                    );
                  } finally {
                    setIsPatchingWrong(false);
                  }
                } else {
                  setIsEditMode(true);
                  setShowErrorRate(false);
                  setShowStudentAnswers(false);
                  setShowRanking(false);
                }
              }}
              disabled={isPatchingWrong}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isEditMode
                  ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                  : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isPatchingWrong
                ? '저장 중...'
                : isEditMode
                ? '수정 완료'
                : '성적 수정'}
            </button>
          </div>
        </div>

        {/* 시험 통계 (상단에 한 줄로 표시) */}
        <div className="mb-4 flex items-center gap-6 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            {formatDate(examData.date)} 시험
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600">학생 평균:</span>
            <span className="text-sm font-semibold text-slate-900">
              {examData.studentAverage != null
                ? `${examData.studentAverage}점`
                : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600">상위 30% 평균:</span>
            <span className="text-sm font-semibold text-slate-900">
              {examData.top30Average != null
                ? `${examData.top30Average}점`
                : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600">총 인원:</span>
            <span className="text-sm font-semibold text-slate-900">
              {totalStudents}명
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600">응시인원:</span>
            <span className="text-sm font-semibold text-slate-900">
              {tookExamCount}명
            </span>
          </div>
        </div>

        <div
          className={`rounded-lg border-2 overflow-hidden transition-all ${
            isEditMode
              ? 'border-blue-400 bg-blue-50/20 shadow-lg'
              : 'border-slate-400 bg-white'
          }`}
        >
          <div className="flex">
            {/* 고정 컬럼: 이름, 학교, 미응시 */}
            <div className="flex-shrink-0 border-r-2 border-slate-400 bg-slate-50">
              <table
                className="border-collapse"
                style={{ tableLayout: 'fixed' }}
              >
                <thead>
                  {/* 첫 번째 행: 이름, 학교, 미응시 */}
                  <tr className="border-b-2 border-slate-400">
                    <th
                      className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900 whitespace-nowrap"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    >
                      이름
                    </th>
                    <th
                      className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900 whitespace-nowrap"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    >
                      학교
                    </th>
                    <th
                      className="px-3 py-2 text-center text-sm font-semibold text-slate-900 whitespace-nowrap"
                      style={{
                        width: '80px',
                        minWidth: '80px',
                        maxWidth: '80px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    >
                      미응시
                    </th>
                  </tr>
                  {/* 두 번째 행: 빈 행 (배점 행과 맞추기) */}
                  <tr className="border-b border-slate-300">
                    <th
                      className="border-r border-slate-300 px-3 py-2"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                    <th
                      className="border-r border-slate-300 px-3 py-2"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                    <th
                      className="px-3 py-2"
                      style={{
                        width: '80px',
                        minWidth: '80px',
                        maxWidth: '80px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                  </tr>
                  {/* 세 번째 행: 빈 행 (문항번호 행과 맞추기) */}
                  <tr className="border-b-2 border-slate-400">
                    <th
                      className="border-r border-slate-300 px-3 py-2"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                    <th
                      className="border-r border-slate-300 px-3 py-2"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                    <th
                      className="px-3 py-2"
                      style={{
                        width: '80px',
                        minWidth: '80px',
                        maxWidth: '80px',
                        height: '40px',
                        minHeight: '40px',
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {examData.records.map(record => {
                    const answerInfo = getStudentAnswerInfo(record.studentId);
                    return (
                      <tr
                        key={record.studentId}
                        className="border-b border-slate-300 hover:bg-slate-50"
                      >
                        <td
                          className="border-r border-slate-300 px-3 py-2 text-center text-sm text-slate-900 whitespace-nowrap"
                          style={{
                            width: '100px',
                            minWidth: '100px',
                            maxWidth: '100px',
                            height: '40px',
                            minHeight: '40px',
                          }}
                        >
                          {record.studentName}
                        </td>
                        <td
                          className="border-r border-slate-300 px-3 py-2 text-center text-sm text-slate-900 whitespace-nowrap"
                          style={{
                            width: '100px',
                            minWidth: '100px',
                            maxWidth: '100px',
                            height: '40px',
                            minHeight: '40px',
                          }}
                        >
                          {record.school ?? '-'}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm whitespace-nowrap"
                          style={{
                            width: '80px',
                            minWidth: '80px',
                            maxWidth: '80px',
                            height: '40px',
                            minHeight: '40px',
                          }}
                        >
                          {isEditMode ? (
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!answerInfo.tookExam}
                                onChange={e => {
                                  setStudentIsTaken(prev => ({
                                    ...prev,
                                    [record.studentId]: !e.target.checked,
                                  }));
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-[#084773] focus:ring-[#084773]"
                              />
                            </label>
                          ) : answerInfo.tookExam ? (
                            'O'
                          ) : (
                            'X'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 스크롤 가능한 컬럼: 문항번호 */}
            <div className="flex-1 overflow-x-auto">
              <table
                className="border-collapse"
                style={{
                  tableLayout: 'fixed',
                  width:
                    totalQuestions > 25 ? `${totalQuestions * 40}px` : '100%',
                  minWidth:
                    totalQuestions > 25 ? `${totalQuestions * 40}px` : '100%',
                }}
              >
                <thead>
                  {/* 첫 번째 행: 문항번호/배점 (colspan) */}
                  <tr className="border-b-2 border-slate-400 bg-slate-50">
                    <th
                      colSpan={maxQuestions}
                      className="border-r-2 border-slate-400 px-3 py-2 text-center text-sm font-semibold text-blue-600"
                      style={{
                        height: '40px',
                        minHeight: '40px',
                      }}
                    >
                      문항번호/배점
                    </th>
                  </tr>
                  {/* 두 번째 행: 문항번호 */}
                  <tr className="border-b border-slate-300 bg-slate-50">
                    {Array.from({ length: maxQuestions }, (_, i) => i + 1).map(
                      num => (
                        <th
                          key={num}
                          className={`border-r border-slate-300 px-2 py-2 text-center text-xs font-medium text-slate-700 ${
                            num <= totalQuestions
                              ? (num - 1) % 5 < 2
                                ? 'bg-slate-100'
                                : 'bg-blue-50'
                              : 'bg-slate-50'
                          }`}
                          style={{
                            width: '40px',
                            minWidth: '40px',
                            maxWidth: '40px',
                            height: '40px',
                            minHeight: '40px',
                          }}
                        >
                          {num}
                        </th>
                      )
                    )}
                  </tr>
                  {/* 세 번째 행: 배점 */}
                  <tr className="border-b-2 border-slate-400 bg-slate-50">
                    {Array.from({ length: maxQuestions }, (_, i) => i + 1).map(
                      num => (
                        <th
                          key={num}
                          className={`border-r border-slate-300 px-2 py-2 text-center text-xs font-medium text-slate-700 ${
                            num <= totalQuestions
                              ? 'bg-blue-100'
                              : 'bg-slate-50'
                          }`}
                          style={{
                            width: '40px',
                            minWidth: '40px',
                            maxWidth: '40px',
                            height: '40px',
                            minHeight: '40px',
                          }}
                        >
                          {num <= totalQuestions
                            ? examData.questions[num - 1]?.points || 1
                            : ''}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {examData.records.map(record => {
                    const answerInfo = getStudentAnswerInfo(record.studentId);
                    return (
                      <tr
                        key={record.studentId}
                        className="border-b border-slate-300 hover:bg-slate-50"
                      >
                        {Array.from(
                          { length: maxQuestions },
                          (_, i) => i + 1
                        ).map(num => {
                          const isWrong =
                            num <= totalQuestions &&
                            answerInfo.wrongAnswers.includes(num);

                          const handleCellClick = () => {
                            if (!isEditMode || num > totalQuestions) return;

                            const currentWrongAnswers =
                              studentWrongAnswers[record.studentId] || [];
                            let newWrongAnswers: number[];

                            if (isWrong) {
                              // x 표시 제거
                              newWrongAnswers = currentWrongAnswers.filter(
                                n => n !== num
                              );
                            } else {
                              // x 표시 추가
                              newWrongAnswers = [...currentWrongAnswers, num];
                            }

                            setStudentWrongAnswers({
                              ...studentWrongAnswers,
                              [record.studentId]: newWrongAnswers,
                            });
                          };

                          return (
                            <td
                              key={num}
                              onClick={handleCellClick}
                              className={`border-r border-slate-300 px-2 py-2 text-center text-sm ${
                                num <= totalQuestions
                                  ? (num - 1) % 5 < 2
                                    ? 'bg-slate-50'
                                    : 'bg-blue-50/30'
                                  : 'bg-white'
                              } ${
                                isEditMode && num <= totalQuestions
                                  ? 'cursor-pointer hover:bg-blue-100'
                                  : ''
                              }`}
                              style={{
                                width: '40px',
                                minWidth: '40px',
                                maxWidth: '40px',
                                height: '40px',
                                minHeight: '40px',
                              }}
                            >
                              {isWrong ? 'x' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 오답률 확인 모달 */}
        {showErrorRate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
              <button
                type="button"
                onClick={() => setShowErrorRate(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!classId || !examId) return;
                    try {
                      await createErrorRates(Number(classId), Number(examId));
                      const res = await getErrorRates(
                        Number(classId),
                        Number(examId)
                      );
                      setErrorRatesDetails(res.data.details);
                      alert('오답률이 계산되었습니다.');
                    } catch (e) {
                      alert(
                        e instanceof Error
                          ? e.message
                          : '오답률 계산에 실패했습니다.'
                      );
                    }
                  }}
                  className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063d5c]"
                >
                  오답률 계산
                </button>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                문제별 오답률
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                    num => {
                      const detail = errorRatesDetails?.find(
                        d => d.question === num
                      );
                      const rateNum = detail
                        ? parseFloat(detail.errorRate)
                        : NaN;
                      const getBgColorClass = () => {
                        if (!Number.isFinite(rateNum))
                          return 'bg-white border-slate-200';
                        if (rateNum > 50) return 'bg-red-100 border-red-300';
                        if (rateNum >= 30)
                          return 'bg-orange-100 border-orange-300';
                        return 'bg-white border-slate-200';
                      };
                      return (
                        <div
                          key={num}
                          className={`flex flex-col items-center rounded border p-2 ${getBgColorClass()}`}
                        >
                          <div className="text-slate-600">{num}</div>
                          <div className="font-semibold text-slate-900">
                            {Number.isFinite(rateNum) ? `${rateNum}%` : '-'}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 성적 순위 모달 */}
        {showRanking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-3xl max-h-[90vh] rounded-lg border border-slate-200 bg-white p-6 shadow-lg flex flex-col">
              <button
                type="button"
                onClick={() => setShowRanking(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!classId || !examId) return;
                    setIsCreatingRankings(true);
                    try {
                      await createRankings(Number(classId), Number(examId));
                      const res = await getRankings(
                        Number(classId),
                        Number(examId)
                      );
                      setRankings(res.data);
                      alert('등수가 계산되었습니다.');
                    } catch (e) {
                      alert(
                        e instanceof Error
                          ? e.message
                          : '시험 등수 계산에 실패했습니다.'
                      );
                    } finally {
                      setIsCreatingRankings(false);
                    }
                  }}
                  disabled={isCreatingRankings}
                  className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063d5c] disabled:opacity-50"
                >
                  {isCreatingRankings ? '계산 중...' : '순위 생성'}
                </button>
              </div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                성적 순위
              </h3>
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  {rankings && rankings.length > 0 ? (
                    rankings.map(item => (
                      <div
                        key={item.studentId}
                        className="flex items-center gap-4 rounded border border-slate-200 p-3"
                      >
                        <div className="w-16 text-sm font-semibold text-slate-900 text-center">
                          {item.ranking != null ? `${item.ranking}등` : '-'}
                        </div>
                        <div className="w-20 text-sm font-medium text-slate-900 text-center">
                          {item.score != null ? `${item.score}점` : '-'}
                        </div>
                        <div className="flex-1 text-sm text-slate-700">
                          {item.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-4">
                      등수 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 학생별 오답번호 모달 */}
        {showStudentAnswers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-3xl max-h-[90vh] rounded-lg border border-slate-200 bg-white p-6 shadow-lg flex flex-col">
              <button
                type="button"
                onClick={() => setShowStudentAnswers(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                학생별 오답번호
              </h3>
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  {examData.records.map(record => {
                    const answerInfo = getStudentAnswerInfo(record.studentId);
                    return (
                      <div
                        key={record.studentId}
                        className="flex items-center gap-4 rounded border border-slate-200 p-3"
                      >
                        <div className="w-24 text-sm font-medium text-slate-900">
                          {record.studentName}
                        </div>
                        <div className="flex-1 text-sm text-slate-700">
                          {answerInfo.wrongAnswers.length > 0
                            ? answerInfo.wrongAnswers
                                .sort((a, b) => a - b)
                                .join(', ')
                            : '없음'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ExamDetailPage;
