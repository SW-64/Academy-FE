# 곽원근 수학연구소

React + Vite + TypeScript로 구성된 프론트엔드 프로젝트입니다.

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**주의**:

- `.env` 파일은 `.gitignore`에 포함되어 있어 레포지토리에 올라가지 않습니다.
- 실제 서버 IP나 프로덕션 URL은 `.env` 파일에만 작성하세요.
- 레포지토리에는 `.env.example` 파일이 있어 참고할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하시면 로그인 화면을 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── pages/
│   ├── LoginPage.tsx          # 로그인 페이지
│   ├── SignupPage.tsx         # 회원가입 페이지 (준비중)
│   └── ForgotPasswordPage.tsx # 비밀번호 찾기 페이지 (준비중)
├── App.tsx                    # 라우터 설정
├── main.tsx                   # 진입점
└── index.css                  # TailwindCSS 설정
```

## 주요 기능

- ✅ 로그인 화면 (이메일/비밀번호 입력)
- ✅ 입력값 유효성 검사
- ✅ 비밀번호 show/hide 토글
- ✅ 접근성 고려 (label 연결, ARIA 속성)
- ✅ 반응형 디자인
- ✅ React Router 설정

## 기술 스택

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router DOM
