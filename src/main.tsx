import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logout } from './api/auth';

// 401 응답 시 로그인 만료 처리 (토큰 만료 시 로그아웃 후 로그인 페이지로)
const originalFetch = window.fetch;
window.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await originalFetch(input, init);
  if (response.status === 401) {
    const url = typeof input === 'string' ? input : (input as Request)?.url ?? '';
    if (typeof url === 'string' && url.includes('sign-out')) return response;
    try {
      alert('로그인 유효시간이 만료되었습니다.');
      await logout();
    } catch {
      // 로그아웃 API 실패 시에도 로그인 페이지로 이동
    }
    window.location.href = '/login';
    return response;
  }
  return response;
};

// FE Academy main entry
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
