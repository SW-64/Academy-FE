import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupCompletePage from './pages/SignupCompletePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainPage from './pages/MainPage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import GradesPage from './pages/GradesPage';
import MaterialsPage from './pages/MaterialsPage';
import MaterialsDetailPage from './pages/MaterialsDetailPage';
import VideosPage from './pages/VideosPage';
import MyPage from './pages/MyPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AdminPage from './pages/admin/AdminPage';
import AdminNoticePage from './pages/admin/AdminNoticePage';
import AdminGradesPage from './pages/admin/AdminGradesPage';
import AdminMaterialsPage from './pages/admin/MaterialsPage';
import AdminVideosPage from './pages/admin/VideosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 초기 진입은 /login 으로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* 메인 레이아웃 페이지들 */}
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/notice/:id" element={<NoticeDetailPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:id" element={<MaterialsDetailPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />

        {/* 관리자 라우트 */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/notice" element={<AdminNoticePage />} />
        <Route path="/admin/grades" element={<AdminGradesPage />} />
        <Route path="/admin/materials" element={<AdminMaterialsPage />} />
        <Route path="/admin/videos" element={<AdminVideosPage />} />
        <Route path="/admin/mypage" element={<MyPage />} />

        {/* 기존 인증 관련 페이지들 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/complete" element={<SignupCompletePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 정의되지 않은 경로는 메인으로 */}
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
