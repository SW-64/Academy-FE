import { useState } from 'react';
import MainLayout from '../MainLayout';
import { initialTextbooks } from './AdminHomeworkPage';

type ClassType = {
  id: number;
  name: string;
  studentCount: number;
  studentIds: number[];
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
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
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
  {
    id: 4,
    name: '미적분1+2 통합 특강반',
    studentCount: 18,
    studentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  },
];

// 더미 학생 데이터
const dummyStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `학생${i + 1}`,
  email: `student${i + 1}@example.com`,
  phone: `010-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
  school: [
    '서울고등학교',
    '부산고등학교',
    '대전고등학교',
    '인천고등학교',
    '광주고등학교',
  ][i % 5],
  grade: `${(i % 3) + 1}학년`,
}));

function HomeworkProgressPage() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // 선택된 클래스의 학생 목록
  const selectedClass = dummyClasses.find(c => c.id === selectedClassId);
  const students = selectedClass
    ? dummyStudents.filter(s => selectedClass.studentIds.includes(s.id))
    : [];

  // 선택된 클래스에 해당하는 교재 목록
  const classTextbooks = selectedClassId
    ? initialTextbooks.filter(t => t.classId === selectedClassId)
    : [];

  return (
    <MainLayout showCalendar={false} isAdmin={true}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">숙제 진도</h1>
          <p className="mt-1 text-sm text-slate-600">
            클래스를 선택하여 학생별 숙제 진도를 확인할 수 있습니다.
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
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedClassId === cls.id
                    ? 'border-[#084773] bg-[#084773] text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* 표 표시 */}
        {selectedClassId && (
          <div className="overflow-x-auto rounded-lg border-2 border-slate-400 bg-white">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-400 bg-slate-50">
                  <th className="border-r border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    학생 이름
                  </th>
                  {classTextbooks.map(textbook => (
                    <th
                      key={textbook.id}
                      className="border-r border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900"
                    >
                      {textbook.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-300 hover:bg-slate-50"
                  >
                    <td className="border-r border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-900">
                      {student.name}
                    </td>
                    {classTextbooks.map(textbook => (
                      <td
                        key={textbook.id}
                        className="border-r border-slate-300 px-4 py-3 text-center text-sm text-slate-600"
                      >
                        {/* 여기에 진도 정보가 들어갈 예정 */}
                        -
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 클래스 미선택 시 안내 */}
        {!selectedClassId && (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                클래스를 선택해주세요
              </p>
              <p className="mt-1 text-sm text-slate-600">
                위에서 클래스를 선택하면 학생별 숙제 진도 표가 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default HomeworkProgressPage;

