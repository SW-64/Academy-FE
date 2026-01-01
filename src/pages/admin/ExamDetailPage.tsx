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
    const questions = [
      { questionNumber: 1, points: 1 },
      { questionNumber: 2, points: 1 },
      { questionNumber: 3, points: 1 },
      { questionNumber: 4, points: 1 },
      { questionNumber: 5, points: 1 },
      { questionNumber: 6, points: 1 },
      { questionNumber: 7, points: 1 },
      { questionNumber: 8, points: 1 },
      { questionNumber: 9, points: 1 },
      { questionNumber: 10, points: 1 },
    ];

    // 학생별 오답 정보 (더미 데이터)
    const studentAnswers: Record<number, {
      tookExam: boolean;
      wrongAnswers: number[];
      score: number;
    }> = {};

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
      name: `${new Date(examDate).getMonth() + 1}월 ${new Date(examDate).getDate()}일 시험`,
      questions,
      records: records.sort((a, b) => a.studentName.localeCompare(b.studentName, 'ko')),
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
  const maxQuestions = Math.max(totalQuestions, 25); // 최대 25개 문항까지 표시

  // 학생별 오답 정보 생성
  const getStudentAnswerInfo = (studentId: number) => {
    const record = examData.records.find(r => r.studentId === studentId);
    if (!record) {
      return { tookExam: false, wrongAnswers: [], score: 0 };
    }

    // 더미 오답 데이터 (실제로는 저장된 데이터 사용)
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

  // 문항별 오답률 계산
  const questionErrorRates: number[] = [];
  for (let i = 1; i <= totalQuestions; i++) {
    const wrongCount = examData.records.filter(r => {
      const info = getStudentAnswerInfo(r.studentId);
      return info.tookExam && info.wrongAnswers.includes(i);
    }).length;
    const errorRate =
      tookExamCount > 0
        ? Math.round((wrongCount / tookExamCount) * 100 * 10) / 10
        : 0;
    questionErrorRates.push(errorRate);
  }
  const averageErrorRate =
    questionErrorRates.length > 0
      ? Math.round(
          (questionErrorRates.reduce((sum, rate) => sum + rate, 0) /
            questionErrorRates.length) *
            10
        ) / 10
      : 0;

  const customRightContent = (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">시험 통계</h3>
      <div className="space-y-4">
        <div>
          <div className="text-xs text-slate-600">오답률</div>
          <div className="text-lg font-semibold text-slate-900">
            {averageErrorRate}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-600">학생 평균</div>
          <div className="text-lg font-semibold text-slate-900">
            {averageScore}점
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-600">총 인원</div>
          <div className="text-lg font-semibold text-slate-900">
            {totalStudents}명
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-600">응시인원</div>
          <div className="text-lg font-semibold text-slate-900">
            {tookExamCount}명
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout
      showCalendar={false}
      isAdmin={true}
      customRightContent={customRightContent}
    >
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
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

        <div className="overflow-x-auto rounded-lg border-2 border-slate-400 bg-white">
          <table className="min-w-full border-collapse">
            <thead>
              {/* 첫 번째 행: 이름, 학교, 응시여부, 문항번호, 점수, 오답번호 */}
              <tr className="border-b-2 border-slate-400 bg-slate-50">
                <th className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  이름
                </th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  학교
                </th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  응시여부
                </th>
                <th
                  colSpan={maxQuestions}
                  className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900"
                >
                  문항번호
                </th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  점수
                </th>
                <th className="px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  오답번호
                </th>
              </tr>
              {/* 두 번째 행: 문항번호 */}
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="border-r border-slate-300 px-3 py-2"></th>
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
                    >
                      {num}
                    </th>
                  )
                )}
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="px-3 py-2"></th>
              </tr>
              {/* 세 번째 행: 배점 값들 */}
              <tr className="border-b-2 border-slate-400 bg-slate-50">
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="border-r border-slate-300 px-3 py-2"></th>
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
                    >
                      {num <= totalQuestions
                        ? examData.questions[num - 1]?.points || 1
                        : ''}
                    </th>
                  )
                )}
                <th className="border-r border-slate-300 px-3 py-2"></th>
                <th className="px-3 py-2"></th>
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
                    <td className="border-r border-slate-300 px-3 py-2 text-center text-sm text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="border-r border-slate-300 px-3 py-2 text-center text-sm text-slate-900">
                      예비고1
                    </td>
                    <td className="border-r border-slate-300 px-3 py-2 text-center text-sm">
                      {answerInfo.tookExam ? 'x' : ''}
                    </td>
                    {Array.from({ length: maxQuestions }, (_, i) => i + 1).map(
                      num => (
                        <td
                          key={num}
                          className={`border-r border-slate-300 px-2 py-2 text-center text-sm ${
                            num <= totalQuestions
                              ? (num - 1) % 5 < 2
                                ? 'bg-slate-50'
                                : 'bg-blue-50/30'
                              : 'bg-white'
                          }`}
                        >
                          {num <= totalQuestions &&
                          answerInfo.tookExam &&
                          answerInfo.wrongAnswers.includes(num)
                            ? 'x'
                            : ''}
                        </td>
                      )
                    )}
                    <td className="border-r border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-900">
                      {answerInfo.score}
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-slate-900">
                      {answerInfo.wrongAnswers.length > 0
                        ? answerInfo.wrongAnswers.join(', ')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default ExamDetailPage;

