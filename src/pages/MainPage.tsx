import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import MainLayout from './MainLayout';

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
// 날짜는 오래된 순서대로 정렬 (왼쪽에서 오른쪽으로 최신순)
const dummyGrades = [
  {
    id: 1,
    subject: '수학',
    score: 70,
    date: '02/07',
  },
  {
    id: 2,
    subject: '수학',
    score: 75,
    date: '02/08',
  },
  {
    id: 3,
    subject: '수학',
    score: 80,
    date: '02/09',
  },
  {
    id: 4,
    subject: '수학',
    score: 85,
    date: '02/10',
  },
  {
    id: 5,
    subject: '수학',
    score: 90,
    date: '02/11',
  },
  {
    id: 6,
    subject: '수학',
    score: 95,
    date: '02/12',
  },
  {
    id: 7,
    subject: '수학',
    score: 100,
    date: '02/13',
  },
];

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
  const minScore = 70;
  const maxScore = 100;
  const scoreRange = maxScore - minScore;
  const padding = 20; // SVG 패딩
  const chartWidth = 400;
  const chartHeight = 200;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  return (
    <div className={`relative w-full ${isModal ? 'h-[500px]' : 'h-[280px]'}`}>
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
      >
        {/* 그리드 라인 (70-100 범위) */}
        {[70, 75, 80, 85, 90, 95, 100].map(score => {
          const y =
            padding +
            innerHeight -
            ((score - minScore) / scoreRange) * innerHeight;
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
        {/* 데이터 포인트와 선 */}
        <polyline
          points={dummyGrades
            .map((grade, index) => {
              const x =
                padding + (index / (dummyGrades.length - 1)) * innerWidth;
              const y =
                padding +
                innerHeight -
                ((grade.score - minScore) / scoreRange) * innerHeight;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#084773"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 데이터 포인트 */}
        {dummyGrades.map((grade, index) => {
          const x = padding + (index / (dummyGrades.length - 1)) * innerWidth;
          const y =
            padding +
            innerHeight -
            ((grade.score - minScore) / scoreRange) * innerHeight;
          return (
            <g key={grade.id}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#084773"
                className="transition-all hover:r-7"
              />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="#084773"
                fillOpacity="0.2"
                className="transition-all"
              />
            </g>
          );
        })}
      </svg>
      {/* X축 레이블 (날짜) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {dummyGrades.map(grade => (
          <span key={grade.id} className="text-[10px] text-slate-500">
            {grade.date}
          </span>
        ))}
      </div>
      {/* Y축 레이블 (점수 70-100) */}
      <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2">
        {[100, 95, 90, 85, 80, 75, 70].map(score => (
          <span key={score} className="text-[10px] text-slate-500">
            {score}
          </span>
        ))}
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
        <p className="mt-1 text-sm text-slate-600">
          최신 정보를 한눈에 확인하세요
        </p>
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
