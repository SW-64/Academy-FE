import { ReactNode, useState, useEffect } from 'react';
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
  Menu,
  X,
  Users,
  FileText,
  LogOut,
} from 'lucide-react';
import { logout } from '../api/auth';

const menuItems = [
  { id: 'notice', label: '공지사항', icon: Megaphone, path: '/notice' },
  { id: 'grades', label: '성적', icon: GraduationCap, path: '/grades' },
  { id: 'homework', label: '숙제', icon: FileText, path: '/homework' },
  { id: 'materials', label: '학습자료', icon: BookOpen, path: '/materials' },
  { id: 'videos', label: '영상', icon: PlayCircle, path: '/videos' },
  { id: 'mypage', label: '마이페이지', icon: UserCircle2, path: '/mypage' },
];

const parentMenuItems = [
  { id: 'notice', label: '공지사항', icon: Megaphone, path: '/parent/notice' },
  {
    id: 'homework-progress',
    label: '자녀 숙제 진도',
    icon: FileText,
    path: '/parent/homework-progress',
  },
  {
    id: 'mypage',
    label: '마이페이지',
    icon: UserCircle2,
    path: '/parent/mypage',
  },
];

const adminMenuItems = [
  { id: 'classes', label: '클래스 관리', icon: Users, path: '/admin/classes' },
  {
    id: 'students',
    label: '학생 관리',
    icon: GraduationCap,
    path: '/admin/students',
  },
  { id: 'notice', label: '공지사항', icon: Megaphone, path: '/admin/notice' },
  { id: 'grades', label: '시험', icon: GraduationCap, path: '/admin/grades' },
  { id: 'homework', label: '교재', icon: BookOpen, path: '/admin/homework' },
  {
    id: 'homework-progress',
    label: '숙제 진도',
    icon: FileText,
    path: '/admin/homework-progress',
  },
  {
    id: 'materials',
    label: '학습자료',
    icon: BookOpen,
    path: '/admin/materials',
  },
  { id: 'videos', label: '영상', icon: PlayCircle, path: '/admin/videos' },
  {
    id: 'mypage',
    label: '마이페이지',
    icon: UserCircle2,
    path: '/admin/mypage',
  },
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
  isAdmin?: boolean;
  isParent?: boolean;
  customRightContent?: ReactNode;
};

function MainLayout({
  children,
  showCalendar = true,
  isAdmin: propIsAdmin = false,
  isParent: propIsParent = false,
  customRightContent,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // 경로가 /admin으로 시작하면 자동으로 관리자 모드로 설정
  const isAdmin = propIsAdmin || location.pathname.startsWith('/admin');
  // 경로가 /parent로 시작하면 자동으로 학부모 모드로 설정
  const isParent = propIsParent || location.pathname.startsWith('/parent');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // 1025px 이하에서는 기본적으로 닫혀있고, 그 이상에서는 열려있도록
    return window.innerWidth > 1025;
  });

  useEffect(() => {
    const handleResize = () => {
      // 1025px 초과로 변경되면 사이드바 열기, 1025px 이하로 변경되면 닫기
      if (window.innerWidth > 1025) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-blue-100">
      {/* 사이드바 토글 버튼 (사이드바가 닫혀있을 때만 표시) */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed right-2 top-2 z-50 rounded-lg bg-white p-2 shadow-md ring-1 ring-blue-100/70 lg:right-4 lg:top-4"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      )}

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 min-[1025px]:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 왼쪽 사이드바 */}
      <aside
        className={`w-64 flex-shrink-0 bg-white shadow-sm ring-1 ring-blue-100/70 transition-transform duration-300 flex flex-col ${
          isSidebarOpen
            ? 'translate-x-0'
            : 'translate-x-full min-[1025px]:translate-x-0'
        } fixed min-[1025px]:static inset-y-0 right-0 min-[1025px]:left-0 z-40 min-[1025px]:z-auto`}
      >
        {/* 사이드바 상단 로고 및 타이틀 */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-2 border-b border-blue-100/70 px-2 sm:px-3 lg:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  navigate('/admin/classes');
                } else if (isParent) {
                  navigate('/parent/notice');
                } else {
                  navigate('/notice');
                }
              }}
              className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-[#084773] flex-shrink-0 hover:bg-[#063a5a] transition-colors cursor-pointer"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-white" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm lg:text-sm font-semibold text-[#084773] truncate">
                학습 관리 프로그램
              </span>
              {isAdmin && (
                <span className="text-[10px] sm:text-xs text-slate-500">
                  관리자용
                </span>
              )}
              {isParent && (
                <span className="text-[10px] sm:text-xs text-slate-500">
                  학부모용
                </span>
              )}
              {!isAdmin && !isParent && (
                <span className="text-[10px] sm:text-xs text-slate-500">
                  학생용
                </span>
              )}
            </div>
          </div>
          {/* X 버튼 */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="flex-shrink-0 rounded-lg p-1 text-slate-600 hover:bg-slate-100 transition-colors min-[1025px]:hidden"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {/* 메뉴 항목 */}
        <nav className="py-2 flex-1 overflow-y-auto">
          {(isAdmin
            ? adminMenuItems
            : isParent
            ? parentMenuItems
            : menuItems
          ).map(item => {
            const Icon = item.icon;
            const isActive = isAdmin
              ? location.pathname === item.path ||
                (item.path === '/admin' && location.pathname === '/admin') ||
                (item.path !== '/admin' &&
                  location.pathname.startsWith(item.path) &&
                  // /admin/homework-progress가 /admin/homework로 시작하는 것을 방지
                  !(
                    item.path === '/admin/homework' &&
                    location.pathname.startsWith('/admin/homework-progress')
                  ))
              : isParent
              ? location.pathname === item.path ||
                (item.path === '/parent/main' &&
                  location.pathname === '/parent/main') ||
                (item.path !== '/parent/main' &&
                  location.pathname.startsWith(item.path))
              : location.pathname === item.path;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-2 sm:gap-3 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#084773]'
                    : 'text-slate-700 hover:bg-blue-50/50 hover:text-[#084773]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 flex-shrink-0 ${
                    isActive ? 'text-[#084773]' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs sm:text-sm lg:text-sm font-medium truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 로그아웃 버튼 - 사이드바 하단 */}
        <div className="border-t border-blue-100/70 px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
          <button
            type="button"
            onClick={async () => {
              try {
                // 백엔드 로그아웃 API 호출 (httpOnly 쿠키 삭제)
                await logout();
              } catch (error) {
                console.error('로그아웃 에러:', error);
                // 에러가 발생해도 로그인 페이지로 이동
              } finally {
                navigate('/login');
              }
            }}
            className="flex w-full items-center gap-2 sm:gap-3 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-3 text-left transition-colors text-slate-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 flex-shrink-0 text-slate-500" />
            <span className="text-xs sm:text-sm lg:text-sm font-medium">
              로그아웃
            </span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 pt-12 lg:pt-6">
          {children}
        </div>
      </main>

      {/* 오른쪽 캘린더 또는 커스텀 컨텐츠 - 데스크탑에서만 표시 */}
      {(showCalendar || customRightContent) && (
        <aside className="hidden min-[1350px]:block w-80 flex-shrink-0 border-l border-blue-100/70 bg-white/50 p-6">
          <div className={customRightContent ? 'sticky top-6' : ''}>
            {customRightContent || <Calendar />}
          </div>
        </aside>
      )}
    </div>
  );
}

export default MainLayout;
