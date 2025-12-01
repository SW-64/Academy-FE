import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  GraduationCap,
  BookOpen,
  PlayCircle,
  UserCircle2,
  Link2,
} from 'lucide-react';

type MainTile = {
  id: string;
  title: string;
  icon: JSX.Element;
  to: string;
};

const tiles: MainTile[] = [
  {
    id: 'notice',
    title: '공지사항',
    icon: <Megaphone className="h-8 w-8 text-amber-500" />,
    to: '/notice',
  },
  {
    id: 'grades',
    title: '성적',
    icon: <GraduationCap className="h-8 w-8 text-emerald-500" />,
    to: '/grades',
  },
  {
    id: 'materials',
    title: '학습자료',
    icon: <BookOpen className="h-8 w-8 text-sky-500" />,
    to: '/materials',
  },
  {
    id: 'videos',
    title: '영상',
    icon: <PlayCircle className="h-8 w-8 text-rose-500" />,
    to: '/videos',
  },
  {
    id: 'mypage',
    title: '마이페이지',
    icon: <UserCircle2 className="h-8 w-8 text-indigo-500" />,
    to: '/mypage',
  },
  {
    id: 'integrations',
    title: '연동',
    icon: <Link2 className="h-8 w-8 text-teal-500" />,
    to: '/integrations',
  },
];

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">FE Academy</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              환영합니다 👋
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              오늘도 한 걸음씩 성장해 볼까요?
            </p>
          </div>
          <div className="hidden rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur sm:flex sm:flex-col sm:items-end">
            <span>프론트엔드 아카데미</span>
            <span className="text-[11px] text-slate-400">
              학습을 위한 데모 메인 화면
            </span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map(tile => (
              <button
                key={tile.id}
                type="button"
                onClick={() => navigate(tile.to)}
                className="group flex flex-col items-start justify-between rounded-3xl bg-white/90 p-6 text-left shadow-[0_18px_45px_rgba(15,23_42,0.08)] ring-1 ring-amber-100/70 transition-transform transition-shadow duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                  {tile.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {tile.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    클릭하면 해당 메뉴의 화면으로 이동합니다.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-medium text-amber-600 group-hover:text-amber-700">
                  바로가기
                  <span className="ml-1 translate-x-0 text-xs transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainPage;
