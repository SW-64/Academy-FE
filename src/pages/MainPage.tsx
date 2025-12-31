import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import { examRecords } from '../data/gradesData';

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

// 학생 정보 (더미 데이터 - 실제로는 API에서 가져와야 함)
const studentInfo: { school: string; grade: string; name: string } = {
  school: '서울고등학교',
  grade: '1학년',
  name: '김민수',
};

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


function MainPage() {
  const navigate = useNavigate();

  // 현재 학생의 최근 성적 데이터 가져오기
  const myRecords = examRecords
    .filter(r => r.studentId === CURRENT_STUDENT_ID)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestRecord = myRecords[0] || null;
  
  // 학생 전체 평균을 90점으로 고정
  const allStudentsAverage = 90;

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
          <div className="space-y-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70" style={{ minHeight: 'calc(3 * 88px + 2 * 12px + 1px)' }}>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                {studentInfo.name}
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                {studentInfo.school} {studentInfo.grade}
              </p>
              {latestRecord ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">최근 시험</span>
                    <span className="text-xs text-slate-500">
                      {latestRecord.dateFormatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">점수</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {latestRecord.score}점
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">등급</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        latestRecord.grade === 'A'
                          ? 'bg-green-100 text-green-700'
                          : latestRecord.grade === 'B'
                          ? 'bg-blue-100 text-blue-700'
                          : latestRecord.grade === 'C'
                          ? 'bg-yellow-100 text-yellow-700'
                          : latestRecord.grade === 'D'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {latestRecord.grade}
                    </span>
                  </div>
                  {/* 막대 그래프 */}
                  <div className="mt-8 space-y-5">
                    <div className="space-y-4">
                      {/* 학생 전체 평균 막대 (왼쪽) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">학생 전체 평균</span>
                          <span className="text-xs font-medium text-slate-700">
                            {allStudentsAverage}점
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full flex items-center justify-end pr-2 rounded-full"
                            style={{
                              width: `${(allStudentsAverage / 100) * 100}%`,
                            }}
                          >
                          </div>
                        </div>
                      </div>
                      {/* 최근 시험 점수 막대 (오른쪽) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">최근 시험 점수</span>
                          <span className="text-xs font-medium text-slate-700">
                            {latestRecord.score}점
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full flex items-center justify-end pr-2 rounded-full"
                            style={{
                              width: `${(latestRecord.score / 100) * 100}%`,
                            }}
                          >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  성적 데이터가 없습니다.
                </p>
              )}
            </div>
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

    </MainLayout>
  );
}

export default MainPage;
