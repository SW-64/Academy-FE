import { ReactNode } from 'react';

type RouteLoaderProps = {
  children?: ReactNode;
};

function RouteLoader({ children }: RouteLoaderProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#084773] border-r-transparent"></div>
        <p className="text-sm text-slate-600">로딩 중...</p>
        {children}
      </div>
    </div>
  );
}

export default RouteLoader;
