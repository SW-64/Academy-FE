import { useNavigate } from 'react-router-dom';
import MainLayout from '../MainLayout';

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  studentIds: number[];
};

// 더미 클래스 데이터
const dummyClasses: ClassType[] = [
  {
    id: 1,
    name: '예비고2 월금 정규반',
    studentCount: 15,
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: 2,
    name: '예비고2 화목 정규반',
    studentCount: 12,
    studentIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
  },
  {
    id: 3,
    name: '미적분1 기본 특강반',
    studentCount: 20,
    studentIds: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  },
  {
    id: 4,
    name: '미적분1+2 통합 특강반',
    studentCount: 18,
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  },
];

function HomeworkProgressPage() {
  const navigate = useNavigate();

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-[95%] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">숙제 진도</h1>
          <p className="mt-1 text-sm text-slate-600">
            클래스를 선택하여 학생별 숙제 진도를 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 클래스 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            클래스 선택
          </label>
          <div className="flex flex-wrap gap-2">
            {dummyClasses.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => navigate(`/admin/homework-progress/${cls.id}`)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* 클래스 미선택 시 안내 */}
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              클래스를 선택해주세요
            </p>
            <p className="mt-1 text-sm text-slate-600">
              위에서 클래스를 선택하면 교재를 선택할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressPage;
