import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainPage from './pages/MainPage';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 초기 진입은 /main 으로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/main" replace />} />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* “준비중” 플레이스홀더 페이지들 */}
        <Route
          path="/notice"
          element={
            <PlaceholderPage
              title="공지사항"
              description="중요한 안내와 공지사항을 한 곳에서 확인하실 수 있도록 준비 중입니다."
            />
          }
        />
        <Route
          path="/grades"
          element={
            <PlaceholderPage
              title="성적"
              description="이번 학기 성적과 진도 현황을 확인하실 수 있도록 준비 중입니다."
            />
          }
        />
        <Route
          path="/materials"
          element={
            <PlaceholderPage
              title="학습자료"
              description="강의 자료와 참고 문서를 편리하게 볼 수 있도록 준비 중입니다."
            />
          }
        />
        <Route
          path="/videos"
          element={
            <PlaceholderPage
              title="영상"
              description="강의 영상과 다시보기 기능을 제공하기 위해 준비 중입니다."
            />
          }
        />
        <Route
          path="/mypage"
          element={
            <PlaceholderPage
              title="마이페이지"
              description="나의 정보와 학습 이력을 관리하실 수 있도록 준비 중입니다."
            />
          }
        />
        <Route
          path="/integrations"
          element={
            <PlaceholderPage
              title="연동"
              description="다양한 서비스와 연동하여 더 편리하게 이용하실 수 있도록 준비 중입니다."
            />
          }
        />

        {/* 기존 인증 관련 페이지들 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 정의되지 않은 경로는 메인으로 */}
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
