import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 코드 스플리팅: 모든 페이지를 lazy import
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const SignupCompletePage = lazy(() => import('./pages/SignupCompletePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const NoticePage = lazy(() => import('./pages/NoticePage'));
const NoticeDetailPage = lazy(() => import('./pages/NoticeDetailPage'));
const GradesPage = lazy(() => import('./pages/GradesPage'));
const HomeworkPage = lazy(() => import('./pages/HomeworkPage'));
const HomeworkProgressPage = lazy(() => import('./pages/HomeworkProgressPage'));
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'));
const MaterialsDetailPage = lazy(() => import('./pages/MaterialsDetailPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminClassPage = lazy(() => import('./pages/admin/AdminClassPage'));
const AdminNoticePage = lazy(() => import('./pages/admin/AdminNoticePage'));
const AdminGradesPage = lazy(() => import('./pages/admin/AdminGradesPage'));
const ExamDetailPage = lazy(() => import('./pages/admin/ExamDetailPage'));
const AdminMaterialsPage = lazy(() => import('./pages/admin/MaterialsPage'));
const AdminVideosPage = lazy(() => import('./pages/admin/VideosPage'));
const AdminHomeworkPage = lazy(() => import('./pages/admin/AdminHomeworkPage'));
const AdminHomeworkProgressPage = lazy(
  () => import('./pages/admin/HomeworkProgressPage')
);
const ParentNoticePage = lazy(() => import('./pages/parent/ParentNoticePage'));
const ParentNoticeDetailPage = lazy(
  () => import('./pages/parent/ParentNoticeDetailPage')
);
const ParentHomeworkProgressPage = lazy(
  () => import('./pages/parent/ParentHomeworkProgressPage')
);
const ParentMyPage = lazy(() => import('./pages/parent/ParentMyPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* 초기 진입은 /login 으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 메인 페이지는 공지사항으로 리다이렉트 */}
          <Route path="/main" element={<Navigate to="/notice" replace />} />

          {/* 메인 레이아웃 페이지들 */}
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/homework" element={<HomeworkPage />} />
          <Route
            path="/homework/:id/progress"
            element={<HomeworkProgressPage />}
          />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialsDetailPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />

          {/* 관리자 라우트 */}
          <Route path="/admin" element={<AdminClassPage />} />
          <Route path="/admin/classes" element={<AdminClassPage />} />
          <Route path="/admin/students" element={<AdminPage />} />
          <Route path="/admin/notice" element={<AdminNoticePage />} />
          <Route path="/admin/grades" element={<AdminGradesPage />} />
          <Route path="/admin/grades/:examDate" element={<ExamDetailPage />} />
          <Route path="/admin/materials" element={<AdminMaterialsPage />} />
          <Route path="/admin/videos" element={<AdminVideosPage />} />
          <Route path="/admin/homework" element={<AdminHomeworkPage />} />
          <Route
            path="/admin/homework-progress"
            element={<AdminHomeworkProgressPage />}
          />
          <Route path="/admin/mypage" element={<MyPage />} />

          {/* 학부모 라우트 */}
          <Route
            path="/parent/main"
            element={<Navigate to="/parent/notice" replace />}
          />
          <Route path="/parent/notice" element={<ParentNoticePage />} />
          <Route
            path="/parent/notice/:id"
            element={<ParentNoticeDetailPage />}
          />
          <Route
            path="/parent/homework-progress"
            element={<ParentHomeworkProgressPage />}
          />
          <Route path="/parent/mypage" element={<ParentMyPage />} />

          {/* 기존 인증 관련 페이지들 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/complete" element={<SignupCompletePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 정의되지 않은 경로는 공지사항으로 */}
          <Route path="*" element={<Navigate to="/notice" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
