import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Megaphone,
  GraduationCap,
  BookOpen,
  PlayCircle,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { id: 'home', label: '홈 화면', icon: Home, path: '/main' },
  { id: 'notice', label: '공지사항', icon: Megaphone, path: '/notice' },
  { id: 'grades', label: '성적', icon: GraduationCap, path: '/grades' },
  { id: 'materials', label: '학습자료', icon: BookOpen, path: '/materials' },
  { id: 'videos', label: '영상', icon: PlayCircle, path: '/videos' },
  { id: 'mypage', label: '마이페이지', icon: UserCircle2, path: '/mypage' },
];

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100/70">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded-lg p-1 text-slate-600 hover:bg-blue-50 hover:text-[#084773] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-slate-900">
          {year}년 {monthNames[month]}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-lg p-1 text-slate-600 hover:bg-blue-50 hover:text-[#084773] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekDays.map(day => (
          <div key={day} className="py-2 font-semibold text-slate-600">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`py-1.5 text-xs ${
              day === null
                ? 'text-transparent'
                : isToday(day)
                ? 'rounded-lg bg-[#084773] text-white font-semibold'
                : 'text-slate-700 hover:bg-blue-50 rounded-lg cursor-pointer'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

type MainLayoutProps = {
  children: ReactNode;
  showCalendar?: boolean;
};

function MainLayout({ children, showCalendar = true }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-blue-100">
      {/* 왼쪽 사이드바 */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-sm ring-1 ring-blue-100/70">
        {/* 사이드바 상단 로고 및 타이틀 */}
        <div className="flex items-center gap-2 border-b border-blue-100/70 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#084773]">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#084773]">
            학습 관리 프로그램
          </span>
        </div>

        {/* 메뉴 항목 */}
        <nav className="py-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#084773]'
                    : 'text-slate-700 hover:bg-blue-50/50 hover:text-[#084773]'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-[#084773]' : 'text-slate-500'
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* 오른쪽 캘린더 */}
      {showCalendar && (
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-blue-100/70 bg-white/50 p-6">
          <Calendar />
        </aside>
      )}
    </div>
  );
}

export default MainLayout;
