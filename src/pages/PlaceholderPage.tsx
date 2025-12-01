import { ReactNode } from 'react';

type PlaceholderPageProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-amber-100/70">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          {icon ?? (
            <span className="text-2xl" role="img" aria-label="준비중">
              ⏳
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {title} 페이지
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {description ??
            '현재 화면은 준비 중입니다. 곧 더 나은 경험으로 찾아올게요.'}
        </p>
        <div className="mt-6 inline-flex items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-medium text-amber-700">
          <span className="mr-1 h-2 w-2 rounded-full bg-amber-400" />
          준비중
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;
