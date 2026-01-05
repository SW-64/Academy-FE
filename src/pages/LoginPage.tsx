import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    // 이메일 유효성 검사
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 유효성 검사
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);

    // 에러가 없으면 공지사항으로 이동
    if (Object.keys(newErrors).length === 0) {
      console.log('Email:', email);
      console.log('Password:', password);
      // 로그인 성공 시 공지사항으로 이동
      navigate('/notice');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white relative">
      {/* 오른쪽 상단 버튼들 */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/parent/notice')}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          학부모용
        </button>
        <button
          type="button"
          onClick={() => navigate('/notice')}
          className="px-3 py-1.5 text-sm font-medium text-white bg-[#084773] rounded-lg hover:bg-[#063a5a] transition-colors"
        >
          학생용
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
        >
          관리자용
        </button>
      </div>

      {/* 로고와 로그인 박스를 하나의 컨테이너로 묶어서 중앙 배치 */}
      <div className="flex flex-col items-center w-full max-w-[403px] rounded-2xl">
        {/* 로고 */}
        <div className="flex justify-center pt-8 px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-warm-brown text-center">
            곽원근 수학연구소
          </h1>
        </div>

        {/* 로그인 카드 */}
        <div className="w-full bg-white rounded-2xl p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 [&>div:last-of-type]:mb-0"
          >
            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                } focus:outline-none focus:ring-1 transition-colors`}
                placeholder="이메일을 입력하세요"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="mb-10" style={{ marginBottom: '16px' }}>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border pr-12 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                  } focus:outline-none focus:ring-1 transition-colors`}
                  placeholder="비밀번호를 입력하세요"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#084773] focus:outline-none focus:text-[#084773] transition-colors"
                  aria-label={
                    showPassword ? '비밀번호 숨기기' : '비밀번호 보기'
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full bg-[#084773] hover:bg-[#063a5a] text-white py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#084773] focus:ring-offset-2 transition-colors"
            >
              로그인
            </button>
          </form>

          {/* 보조 액션 */}
          <div className="mt-6 space-y-3">
            <Link
              to="/signup"
              className="block text-center text-[#084773] hover:text-[#063a5a] font-medium focus:outline-none focus:ring-2 focus:ring-[#084773] focus:ring-offset-2 rounded-lg py-2 transition-colors"
            >
              회원가입하기
            </Link>
            <Link
              to="/forgot-password"
              className="block text-center text-gray-600 hover:text-warm-brown text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown focus:ring-offset-2 rounded-lg py-2 transition-colors"
            >
              비밀번호를 잊어버리셨나요?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
