import { useNavigate } from 'react-router-dom';
import MainLayout from '../MainLayout';
import { examRecords } from '../../data/gradesData';

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

// 자녀 2명의 ID (실제로는 로그인한 학부모의 자녀 ID로 교체)
const CHILDREN_IDS = [1, 2];

function ParentMainPage() {
  const navigate = useNavigate();

  // 자녀 정보 (더미 데이터 - 실제로는 API에서 가져와야 함)
  const childInfo: Record<number, { school: string; grade: string }> = {
    1: { school: '서울고등학교', grade: '1학년' },
    2: { school: '부산고등학교', grade: '2학년' },
    3: { school: '대전고등학교', grade: '3학년' },
  };

  // 자녀 2명의 최근 성적 데이터 가져오기
  const displayedChildrenIds = CHILDREN_IDS.slice(0, 2);
  const childrenRecords = displayedChildrenIds.map(childId => {
    const childRecords = examRecords
      .filter(r => r.studentId === childId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const studentName =
      childRecords.length > 0 ? childRecords[0].studentName : `학생${childId}`;

    const latestRecord = childRecords[0] || null;

    // 학생 전체 평균을 90점으로 고정
    const allStudentsAverage = 90;

    return {
      childId,
      name: studentName,
      school: childInfo[childId]?.school || '고등학교',
      grade: childInfo[childId]?.grade || '1학년',
      latestRecord: latestRecord
        ? {
            ...latestRecord,
            allStudentsAverage,
          }
        : null,
    };
  });

  return (
    <MainLayout isParent={true}>
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
              onClick={() => navigate('/parent/notice')}
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
                onClick={() => navigate('/parent/notice')}
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

        {/* 자녀 성적 섹션 */}
        <section className="mb-8 flex min-h-0 flex-col md:mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">자녀 성적</h2>
            <button
              type="button"
              onClick={() => navigate('/parent/children')}
              className="text-sm font-medium text-[#084773] hover:text-[#063a5a] transition-colors"
            >
              더보기 →
            </button>
          </div>
          <div className="space-y-3">
            {childrenRecords.map(child => (
              <div
                key={child.childId}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70"
                style={{ minHeight: 'calc(3 * 88px + 2 * 12px + 1px)' }}
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {child.name}
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  {child.school} {child.grade}
                </p>
                {child.latestRecord ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">최근 시험</span>
                      <span className="text-xs text-slate-500">
                        {child.latestRecord.dateFormatted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">점수</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {child.latestRecord.score}점
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">등급</span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          child.latestRecord.grade === 'A'
                            ? 'bg-green-100 text-green-700'
                            : child.latestRecord.grade === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : child.latestRecord.grade === 'C'
                            ? 'bg-yellow-100 text-yellow-700'
                            : child.latestRecord.grade === 'D'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {child.latestRecord.grade}
                      </span>
                    </div>
                    {/* 막대 그래프 */}
                    <div className="mt-8 space-y-5">
                      <div className="space-y-4">
                        {/* 학생 전체 평균 막대 (왼쪽) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">
                              학생 전체 평균
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {child.latestRecord.allStudentsAverage}점
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full flex items-center justify-end pr-2 rounded-full"
                              style={{
                                width: `${
                                  (child.latestRecord.allStudentsAverage /
                                    100) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        {/* 최근 시험 점수 막대 (오른쪽) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">
                              최근 시험 점수
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {child.latestRecord.score}점
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full flex items-center justify-end pr-2 rounded-full"
                              style={{
                                width: `${
                                  (child.latestRecord.score / 100) * 100
                                }%`,
                              }}
                            ></div>
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
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default ParentMainPage;
