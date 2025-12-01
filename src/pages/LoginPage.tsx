import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [imageError, setImageError] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const newErrors: { email?: string; password?: string } = {}

    // 이메일 유효성 검사
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 비밀번호 유효성 검사
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    }

    setErrors(newErrors)

    // 에러가 없으면 콘솔에 출력
    if (Object.keys(newErrors).length === 0) {
      console.log('Email:', email)
      console.log('Password:', password)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* 로고 - 왼쪽 맨 위 */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        {imageError ? (
          <h1 className="text-2xl md:text-3xl font-bold text-warm-brown">
            곽원근 수학연구소
          </h1>
        ) : (
          <img
            src="/logo.png"
            alt="곽원근 수학연구소"
            className="h-auto max-w-[200px] md:max-w-[250px]"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors({ ...errors, email: undefined })
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-warm-brown focus:ring-warm-brown'
              } focus:outline-none focus:ring-2 transition-colors`}
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
          <div>
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined })
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg border pr-12 ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-warm-brown focus:ring-warm-brown'
                } focus:outline-none focus:ring-2 transition-colors`}
                placeholder="비밀번호를 입력하세요"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-warm-brown focus:outline-none focus:text-warm-brown transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
            className="w-full bg-warm-brown text-white py-3 rounded-lg font-medium hover:bg-warm-brown-light focus:outline-none focus:ring-2 focus:ring-warm-brown focus:ring-offset-2 transition-colors"
          >
            로그인
          </button>
        </form>

        {/* 보조 액션 */}
        <div className="mt-6 space-y-3">
          <Link
            to="/signup"
            className="block text-center text-warm-brown hover:text-warm-brown-light font-medium focus:outline-none focus:ring-2 focus:ring-warm-brown focus:ring-offset-2 rounded-lg py-2 transition-colors"
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
  )
}

export default LoginPage

