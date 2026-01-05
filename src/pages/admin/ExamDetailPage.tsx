import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../MainLayout';
import { examRecords } from '../../data/gradesData';
import type { ExamRecord } from '../../data/gradesData';

function ExamDetailPage() {
  const { examDate } = useParams<{ examDate: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const [examData, setExamData] = useState<{
    date: string;
    name: string;
    questions: { questionNumber: number; points: number }[];
    records: ExamRecord[];
  } | null>(null);
  const [showErrorRate, setShowErrorRate] = useState(false);
  const [showStudentAnswers, setShowStudentAnswers] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentWrongAnswers, setStudentWrongAnswers] = useState<
    Record<number, number[]>
  >({});

  useEffect(() => {
    if (!examDate) return;

    // 해당 날짜의 시험 기록 가져오기
    const records = examRecords.filter(r => r.date === examDate);
    if (records.length === 0) {
      navigate('/admin/grades');
      return;
    }

    // 더미 문항 데이터 (실제로는 시험 저장 시 함께 저장되어야 함)
    const questionCount = 25;
    const questions = Array.from({ length: questionCount }, (_, i) => ({
      questionNumber: i + 1,
      points: 1,
    }));

    // 학생별 무작위 오답 생성
    // 일부 문제는 많은 학생들이 틀리도록 설정 (50% 이상 오답률을 만들기 위해)
    const wrongAnswersMap: Record<number, number[]> = {};
    const popularWrongQuestions = [3, 7, 12, 18, 22]; // 많은 학생이 틀릴 문제들

    records.forEach(record => {
      const wrongAnswers: number[] = [];

      // 인기 오답 문제 중 일부를 포함 (약 70% 확률로)
      popularWrongQuestions.forEach(qNum => {
        if (Math.random() > 0.3) {
          wrongAnswers.push(qNum);
        }
      });

      // 추가로 무작위 오답 생성 (1~5개)
      const additionalWrongCount = Math.floor(Math.random() * 5) + 1;
      const allQuestions = Array.from(
        { length: questionCount },
        (_, i) => i + 1
      );
      const availableQuestions = allQuestions.filter(
        q => !wrongAnswers.includes(q)
      );
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      wrongAnswers.push(...shuffled.slice(0, additionalWrongCount));

      wrongAnswersMap[record.studentId] = wrongAnswers;
    });

    setStudentWrongAnswers(wrongAnswersMap);

    setExamData({
      date: examDate,
      name: `${new Date(examDate).getMonth() + 1}월 ${new Date(
        examDate
      ).getDate()}일 시험`,
      questions,
      records: records.sort((a, b) =>
        a.studentName.localeCompare(b.studentName, 'ko')
      ),
    });
  }, [examDate, navigate]);

  if (!examData) {
    return (
      <MainLayout showCalendar={false} isAdmin={true}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MainLayout>
    );
  }

  const totalQuestions = examData.questions.length;
  // 문항 수에 따라 동적으로 표시 (25개 이상도 대응)
  const maxQuestions = totalQuestions;

  // 학생별 오답 정보 생성
  const getStudentAnswerInfo = (studentId: number) => {
    const record = examData.records.find(r => r.studentId === studentId);
    if (!record) {
      return { tookExam: false, wrongAnswers: [], score: 0 };
    }

    const wrongAnswers = studentWrongAnswers[studentId] || [];

    return {
      tookExam: true,
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
  const averageScore =
    examData.records.length > 0
      ? Math.round(
          (examData.records.reduce((sum, r) => sum + r.score, 0) /
            examData.records.length) *
            10
        ) / 10
      : 0;

  // 오답률 계산 (각 문항별)
  const getErrorRate = (questionNum: number) => {
    if (tookExamCount === 0) return 0;
    const wrongCount = examData.records.filter(r => {
      const info = getStudentAnswerInfo(r.studentId);
      return info.tookExam && info.wrongAnswers.includes(questionNum);
    }).length;
    return Math.round((wrongCount / tookExamCount) * 100 * 10) / 10;
  };

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
              onClick={() => {
                setShowErrorRate(!showErrorRate);
                setShowStudentAnswers(false);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showErrorRate
                  ? 'border-[#084773] bg-[#084773] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              오답률 확인
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
              onClick={() => {
                setShowRanking(!showRanking);
                setShowErrorRate(false);
                setShowStudentAnswers(false);
                setIsEditMode(false);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showRanking
                  ? 'border-[#084773] bg-[#084773] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              성적 순위
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditMode(!isEditMode);
                setShowErrorRate(false);
                setShowStudentAnswers(false);
                setShowRanking(false);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isEditMode
                  ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                  : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isEditMode ? '수정 완료' : '성적 수정'}
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
              {averageScore}점
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
            {/* 고정 컬럼: 이름, 학교, 응시여부 */}
            <div className="flex-shrink-0 border-r-2 border-slate-400 bg-slate-50">
              <table
                className="border-collapse"
                style={{ tableLayout: 'fixed' }}
              >
                <thead>
                  {/* 첫 번째 행: 이름, 학교, 응시여부 */}
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
                      응시여부
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
                          예비고1
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
                          {answerInfo.tookExam ? 'x' : ''}
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
                            answerInfo.tookExam &&
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
                  onClick={() => {
                    // 오답률 재계산 (실제로는 서버에 요청)
                  }}
                  className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063d5c]"
                >
                  오답률 생성
                </button>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                문제별 오답률
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                    num => {
                      const errorRate = getErrorRate(num);
                      const getBgColorClass = () => {
                        if (errorRate > 50) {
                          return 'bg-red-100 border-red-300';
                        } else if (errorRate >= 30) {
                          return 'bg-orange-100 border-orange-300';
                        }
                        return 'bg-white border-slate-200';
                      };
                      return (
                        <div
                          key={num}
                          className={`flex flex-col items-center rounded border p-2 ${getBgColorClass()}`}
                        >
                          <div className="text-slate-600">{num}</div>
                          <div className="font-semibold text-slate-900">
                            {errorRate}%
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
                  onClick={() => {
                    // 순위 생성 (실제로는 서버에 요청)
                  }}
                  className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063d5c]"
                >
                  순위 생성
                </button>
              </div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                성적 순위
              </h3>
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  {examData.records
                    .sort((a, b) => b.score - a.score)
                    .map((record, index) => {
                      const rank = index + 1;
                      return (
                        <div
                          key={record.studentId}
                          className="flex items-center gap-4 rounded border border-slate-200 p-3"
                        >
                          <div className="w-16 text-sm font-semibold text-slate-900 text-center">
                            {rank}등
                          </div>
                          <div className="w-20 text-sm font-medium text-slate-900 text-center">
                            {record.score}점
                          </div>
                          <div className="flex-1 text-sm text-slate-700">
                            {record.studentName}
                          </div>
                        </div>
                      );
                    })}
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
