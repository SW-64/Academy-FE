import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../MainLayout';
import { examRecords } from '../../data/gradesData';
import type { ExamRecord } from '../../data/gradesData';

function ExamDetailPage() {
  const { examDate } = useParams<{ examDate: string }>();
  const navigate = useNavigate();
  const [examData, setExamData] = useState<{
    date: string;
    name: string;
    questions: { questionNumber: number; points: number }[];
    records: ExamRecord[];
  } | null>(null);

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

    // 학생별 오답 정보 (더미 데이터)
    const studentAnswers: Record<
      number,
      {
        tookExam: boolean;
        wrongAnswers: number[];
        score: number;
      }
    > = {};

    records.forEach(record => {
      if (!studentAnswers[record.studentId]) {
        // 더미 오답 데이터 생성 (실제로는 저장된 데이터 사용)
        const wrongAnswers: number[] = [];
        const totalQuestions = questions.length;
        const correctAnswers = record.score; // 점수가 정답 수와 같다고 가정
        for (let i = 1; i <= totalQuestions; i++) {
          if (i > correctAnswers) {
            wrongAnswers.push(i);
          }
        }

        studentAnswers[record.studentId] = {
          tookExam: true,
          wrongAnswers,
          score: record.score,
        };
      }
    });

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

    // 첫 번째 학생: 3개의 오답번호
    if (
      examData.records.length > 0 &&
      studentId === examData.records[0].studentId
    ) {
      return {
        tookExam: true,
        wrongAnswers: [2, 3, 6], // 3개 오답번호
        score: record.score,
      };
    }

    // 두 번째 학생: 19개의 오답번호
    if (
      examData.records.length > 1 &&
      studentId === examData.records[1].studentId
    ) {
      return {
        tookExam: true,
        wrongAnswers: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        ], // 19개 오답번호
        score: record.score,
      };
    }

    // 나머지 학생들: 기존 로직 사용
    const wrongAnswers: number[] = [];
    const correctAnswers = Math.round(record.score); // 점수가 정답 수와 같다고 가정
    for (let i = 1; i <= totalQuestions; i++) {
      if (i > correctAnswers) {
        wrongAnswers.push(i);
      }
    }

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
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/grades')}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">
            {examData.name}
          </h1>
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

        <div className="rounded-lg border-2 border-slate-400 bg-white overflow-hidden">
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
                  {/* 첫 번째 행: 배점 (colspan) */}
                  <tr className="border-b-2 border-slate-400 bg-slate-50">
                    <th
                      colSpan={maxQuestions}
                      className="border-r-2 border-slate-400 px-3 py-2 text-center text-sm font-semibold text-blue-600"
                      style={{
                        height: '40px',
                        minHeight: '40px',
                      }}
                    >
                      배점
                    </th>
                  </tr>
                  {/* 두 번째 행: 각 문항의 배점 */}
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
                          {num <= totalQuestions
                            ? examData.questions[num - 1]?.points || 1
                            : ''}
                        </th>
                      )
                    )}
                  </tr>
                  {/* 세 번째 행: 문항번호 */}
                  <tr className="border-b-2 border-slate-400 bg-slate-50">
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
                        ).map(num => (
                          <td
                            key={num}
                            className={`border-r border-slate-300 px-2 py-2 text-center text-sm ${
                              num <= totalQuestions
                                ? (num - 1) % 5 < 2
                                  ? 'bg-slate-50'
                                  : 'bg-blue-50/30'
                                : 'bg-white'
                            }`}
                            style={{
                              width: '40px',
                              minWidth: '40px',
                              maxWidth: '40px',
                              height: '40px',
                              minHeight: '40px',
                            }}
                          >
                            {num <= totalQuestions &&
                            answerInfo.tookExam &&
                            answerInfo.wrongAnswers.includes(num)
                              ? 'x'
                              : ''}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 하단 오답률 통계 */}
        <div className="mt-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              오답률
            </h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2 text-xs">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                  num => (
                    <div
                      key={num}
                      className="flex flex-col items-center rounded border border-slate-200 p-2"
                    >
                      <div className="text-slate-600">{num}</div>
                      <div className="font-semibold text-slate-900">
                        {getErrorRate(num)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ExamDetailPage;
