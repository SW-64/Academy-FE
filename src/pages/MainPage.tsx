import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import MainLayout from './MainLayout';
import { examRecords, dailyStats } from '../data/gradesData';

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
const dummyNotices = [
  {
    id: 1,
    title: '2025학년도 1학기 수업 일정 안내',
    summary:
      '새 학기 수업 일정 및 주요 일정을 안내드립니다. 자세한 내용은 공지사항 게시판을 확인해주세요.',
    date: '2025-02-15',
  },
  {
    id: 2,
    title: '학습자료 업로드 안내',
    summary:
      '이번 주 학습자료가 업로드되었습니다. 학습자료 메뉴에서 확인하실 수 있습니다.',
    date: '2025-02-14',
  },
  {
    id: 3,
    title: '온라인 강의 영상 공개',
    summary:
      '새로운 강의 영상이 업로드되었습니다. 영상 메뉴에서 시청하실 수 있습니다.',
    date: '2025-02-13',
  },
];

// TODO: API 연결 시 이 더미 데이터를 실제 API 호출로 교체
// 현재 학생 ID (실제로는 로그인한 학생 ID로 교체)
const CURRENT_STUDENT_ID = 1;

const dummyMaterials = [
  {
    id: 1,
    title: '1주차 강의자료',
    subject: 'JavaScript 기본',
    type: 'PDF',
  },
  {
    id: 2,
    title: '컴포넌트 설계 슬라이드',
    subject: 'React',
    type: '슬라이드',
  },
];

const dummyVideos = [
  {
    id: 1,
    title: 'React 기본 개념 정리',
    duration: '35:20',
    level: '기초',
  },
  {
    id: 2,
    title: '상태 관리 패턴 소개',
    duration: '42:10',
    level: '심화',
  },
];

function GradeChart({ isModal = false }: { isModal?: boolean }) {
  // 현재 학생의 2월 27일 이후 데이터 가져오기 (최근 7개 기록)
  const cutoffDate = new Date('2026-02-27');
  const myRecords = examRecords
    .filter(r => {
      const recordDate = new Date(r.date);
      return r.studentId === CURRENT_STUDENT_ID && recordDate > cutoffDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 7); // 최대 7개만

  const minScore = 60;
  const maxScore = 100;
  const scoreRange = maxScore - minScore;
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 50;

  if (myRecords.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${
          isModal ? 'h-[500px]' : 'h-[280px]'
        }`}
      >
        <p className="text-sm text-slate-500">표시할 성적 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${isModal ? 'h-[500px]' : 'h-[280px]'}`}>
      <div className="relative h-full w-full overflow-x-auto">
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* 그리드 라인 (70-100 범위) */}
          {[70, 80, 90, 100].map(score => {
            const y = 250 - ((score - minScore) / scoreRange) * 200;
            return (
              <line
                key={score}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
          {/* 전체 학생 평균점수 라인 */}
          {(() => {
            const averagePoints = myRecords.map((record, index) => {
              const dailyStat = dailyStats.find(
                stat => stat.date === record.date
              );
              const allStudentsAverage = dailyStat ? dailyStat.averageScore : 0;
              const recordsLength = myRecords.length;
              const x =
                recordsLength > 1
                  ? padding +
                    (index / (recordsLength - 1)) * (chartWidth - padding * 2)
                  : padding;
              const y =
                250 - ((allStudentsAverage - minScore) / scoreRange) * 200;
              return { x, y };
            });

            return (
              <polyline
                points={averagePoints
                  .map(point => `${point.x},${point.y}`)
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="8 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })()}
          {/* 시험 점수 선 */}
          <polyline
            points={myRecords
              .map((record, index) => {
                const recordsLength = myRecords.length;
                const x =
                  recordsLength > 1
                    ? padding +
                      (index / (recordsLength - 1)) * (chartWidth - padding * 2)
                    : padding;
                const y = 250 - ((record.score - minScore) / scoreRange) * 200;
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#084773"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 데이터 포인트 */}
          {myRecords.map((record, index) => {
            const recordsLength = myRecords.length;
            const x =
              recordsLength > 1
                ? padding +
                  (index / (recordsLength - 1)) * (chartWidth - padding * 2)
                : padding;
            const y = 250 - ((record.score - minScore) / scoreRange) * 200;
            return <circle key={index} cx={x} cy={y} r="4" fill="#084773" />;
          })}
        </svg>
        {/* 범례 */}
        <div
          className={`absolute ${
            isModal ? 'right-6 top-6' : 'right-2 top-2'
          } flex flex-col gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 shadow-sm`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-2.5 sm:h-3 w-6 sm:w-8 bg-[#084773]"></div>
            <span className="text-[10px] sm:text-xs text-slate-600">
              시험 점수
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-2.5 sm:h-3 w-6 sm:w-8 border-2 border-dashed border-amber-500"></div>
            <span className="text-[10px] sm:text-xs text-slate-600">
              전체 학생 평균점수
            </span>
          </div>
        </div>
        {/* Y축 레이블 (70-100) */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-1 sm:py-2">
          {[100, 90, 80, 70].map(score => (
            <span key={score} className="text-[10px] sm:text-xs text-slate-500">
              {score}
            </span>
          ))}
        </div>
        {/* X축 레이블 - 모든 날짜 표시 (데이터 포인트 위치에 맞춰 배치) */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '20px' }}
        >
          {myRecords.map((record, index) => {
            const recordsLength = myRecords.length;
            const xPercent =
              recordsLength > 1
                ? ((padding +
                    (index / (recordsLength - 1)) *
                      (chartWidth - padding * 2)) /
                    chartWidth) *
                  100
                : (padding / chartWidth) * 100;
            return (
              <span
                key={index}
                className="absolute text-[8px] sm:text-[10px] text-slate-500"
                style={{
                  left: `${xPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {record.dateFormatted}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MainPage() {
  const navigate = useNavigate();
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">홈 화면</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 공지사항 섹션 */}
        <section className="mb-8 flex min-h-0 flex-col md:mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">공지사항</h2>
            <button
              type="button"
              onClick={() => navigate('/notice')}
              className="text-sm font-medium text-[#084773] hover:text-[#063a5a] transition-colors"
            >
              더보기 →
            </button>
          </div>
          <div className="space-y-3">
            {dummyNotices.slice(0, 3).map(notice => (
              <div
                key={notice.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => navigate('/notice')}
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {notice.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                  {notice.summary}
                </p>
                <p className="mt-2 text-xs text-slate-400">{notice.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 성적 섹션 */}
        <section className="mb-8 flex min-h-0 flex-col md:mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">성적</h2>
            <button
              type="button"
              onClick={() => navigate('/grades')}
              className="text-sm font-medium text-[#084773] hover:text-[#063a5a] transition-colors"
            >
              더보기 →
            </button>
          </div>
          <div
            className="flex cursor-pointer items-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md"
            style={{ minHeight: '276px' }}
            onClick={e => {
              e.stopPropagation();
              setIsGraphModalOpen(true);
            }}
          >
            <GradeChart />
          </div>
        </section>

        {/* 학습자료 섹션 */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">학습자료</h2>
            <button
              type="button"
              onClick={() => navigate('/materials')}
              className="text-sm font-medium text-[#084773] hover:text-[#063a5a] transition-colors"
            >
              더보기 →
            </button>
          </div>
          <div className="space-y-3">
            {dummyMaterials.slice(0, 2).map(material => (
              <div
                key={material.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => navigate('/materials')}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {material.title}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {material.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {material.subject}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 영상 섹션 */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">영상</h2>
            <button
              type="button"
              onClick={() => navigate('/videos')}
              className="text-sm font-medium text-[#084773] hover:text-[#063a5a] transition-colors"
            >
              더보기 →
            </button>
          </div>
          <div className="space-y-3">
            {dummyVideos.slice(0, 2).map(video => (
              <div
                key={video.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => navigate('/videos')}
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {video.title}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                  <span>{video.duration}</span>
                  <span>•</span>
                  <span>{video.level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 그래프 확대 모달 */}
      {isGraphModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsGraphModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setIsGraphModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 모달 헤더 */}
            <div className="mb-6 pr-10">
              <h2 className="text-xl font-semibold text-slate-900">
                성적 그래프
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                수학 성적 추이를 확인하세요
              </p>
            </div>

            {/* 확대된 그래프 */}
            <div className="rounded-xl bg-white p-6 ring-1 ring-blue-100/70">
              <GradeChart isModal={true} />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default MainPage;
