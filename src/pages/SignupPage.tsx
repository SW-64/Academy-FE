import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConsentModal from '../components/ConsentModal'

const SignupPage = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'parent' | ''>('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    name?: string
    role?: string
    phone?: string
    password?: string
    confirmPassword?: string
    school?: string
    grade?: string
  }>({})
  const [imageError, setImageError] = useState(false)
  const [isConsentOpen, setIsConsentOpen] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    // 한국 휴대폰 번호 형식: 01012345678 (11자리 숫자)
    const phoneRegex = /^010\d{8}$/
    return phoneRegex.test(phone)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

  // 실제 회원가입 제출 로직 (동의 후 실행)
  const doSubmit = (consent: {
    serviceTerms: boolean
    privacyPolicy: boolean
    marketing: boolean
    consentVersion: string
    agreedAt: Date
  }) => {
    // 동의 정보를 포함한 회원가입 데이터
    const signupData = {
      email,
      name,
      role,
      phone,
      password,
      school: role === 'student' ? school : undefined,
      grade: role === 'student' ? grade : undefined,
      consent: {
        serviceTerms: consent.serviceTerms,
        privacyPolicy: consent.privacyPolicy,
        marketing: consent.marketing,
        consentVersion: consent.consentVersion,
        agreedAt: consent.agreedAt,
      },
    }

    // TODO: 여기서 실제 API 호출
    console.log('회원가입 데이터:', signupData)
    
    // 회원가입 완료 페이지로 이동
    navigate('/signup/complete')
  }

  // 폼 제출 핸들러 (유효성 검사 후 모달 열기)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: {
      email?: string
      name?: string
      role?: string
      phone?: string
      password?: string
      confirmPassword?: string
      school?: string
      grade?: string
    } = {}

    // 이메일 유효성 검사
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 이름 유효성 검사
    if (!name) {
      newErrors.name = '이름을 입력해주세요.'
    }

    // 역할 유효성 검사
    if (!role) {
      newErrors.role = '역할을 선택해주세요.'
    }

    // 연락처 유효성 검사
    if (!phone) {
      newErrors.phone = '연락처를 입력해주세요.'
    } else if (!validatePhone(phone)) {
      newErrors.phone = '올바른 연락처 형식이 아닙니다. (예: 01012345678)'
    }

    // 비밀번호 유효성 검사
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (!validatePassword(password)) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
    }

    // 비밀번호 확인 유효성 검사
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // 학생인 경우 학교, 학년 유효성 검사
    if (role === 'student') {
      if (!school) {
        newErrors.school = '학교를 입력해주세요.'
      }
      if (!grade) {
        newErrors.grade = '학년을 선택해주세요.'
      }
    }

    setErrors(newErrors)

    // 에러가 없으면 동의 모달 열기
    if (Object.keys(newErrors).length === 0) {
      setIsConsentOpen(true)
    }
  }

  // 동의 모달 확인 핸들러
  const handleConsentConfirm = (consent: {
    serviceTerms: boolean
    privacyPolicy: boolean
    marketing: boolean
    consentVersion: string
    agreedAt: Date
  }) => {
    setIsConsentOpen(false)
    doSubmit(consent)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-4 sm:py-8 bg-white">
      {/* 로고와 회원가입 박스를 하나의 컨테이너로 묶어서 중앙 배치 */}
      <div className="flex flex-col items-center w-full max-w-[403px] rounded-2xl">
         {/* 로고 */}
         <div className="flex justify-center pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
           {imageError ? (
             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-warm-brown text-center">
               곽원근 수학연구소
             </h1>
           ) : (
             <img
               src="/logo.png"
               alt="곽원근 수학연구소"
               className="h-auto max-w-[175px] sm:max-w-[197px] md:max-w-[219px] lg:max-w-[263px]"
               onError={() => setImageError(true)}
             />
           )}
         </div>

        {/* 회원가입 카드 */}
        <div className="w-full bg-white rounded-2xl p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 [&>div:last-of-type]:mb-0">
          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
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
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
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
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* 이름 입력 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors({ ...errors, name: undefined })
                }
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
              } focus:outline-none focus:ring-1 transition-colors`}
              placeholder="이름을 입력하세요"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* 역할 선택 */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              역할
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as 'student' | 'parent' | '')
                setSchool('')
                setGrade('')
                if (errors.role) {
                  setErrors({ ...errors, role: undefined, school: undefined, grade: undefined })
                }
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                errors.role
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
              } focus:outline-none focus:ring-1 transition-colors ${role === '' ? 'text-gray-400' : 'text-gray-900'}`}
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? 'role-error' : undefined}
            >
              <option value="" className="text-gray-400">역할을 선택하세요</option>
              <option value="student">학생</option>
              <option value="parent">학부모</option>
            </select>
            {errors.role && (
              <p
                id="role-error"
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.role}
              </p>
            )}
          </div>

          {/* 연락처 입력 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined })
                }
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                errors.phone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
              } focus:outline-none focus:ring-1 transition-colors`}
              placeholder="연락처를 입력하세요 (예: 01012345678)"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.phone}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
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
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border pr-10 sm:pr-12 text-sm sm:text-base ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                } focus:outline-none focus:ring-1 transition-colors`}
                placeholder="비밀번호를 입력하세요 (8자 이상)"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#084773] focus:outline-none focus:text-[#084773] transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined })
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border pr-10 sm:pr-12 text-sm sm:text-base ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                } focus:outline-none focus:ring-1 transition-colors`}
                placeholder="비밀번호를 다시 입력하세요"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#084773] focus:outline-none focus:text-[#084773] transition-colors"
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-1 text-xs sm:text-sm text-red-600"
                role="alert"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* 학교 입력 (학생인 경우만) */}
          {role === 'student' && (
            <>
              <div>
                <label
                  htmlFor="school"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  학교
                </label>
                <input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(e) => {
                    setSchool(e.target.value)
                    if (errors.school) {
                      setErrors({ ...errors, school: undefined })
                    }
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                    errors.school
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                  } focus:outline-none focus:ring-1 transition-colors`}
                  placeholder="학교명을 입력하세요"
                  aria-invalid={!!errors.school}
                  aria-describedby={errors.school ? 'school-error' : undefined}
                />
                {errors.school && (
                  <p
                    id="school-error"
                    className="mt-1 text-xs sm:text-sm text-red-600"
                    role="alert"
                  >
                    {errors.school}
                  </p>
                )}
              </div>

              {/* 학년 선택 (학생인 경우만) */}
              <div>
                <label
                  htmlFor="grade"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  학년
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value)
                    if (errors.grade) {
                      setErrors({ ...errors, grade: undefined })
                    }
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                    errors.grade
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 hover:border-[#084773] focus:border-[#084773] focus:ring-[#084773]'
                  } focus:outline-none focus:ring-1 transition-colors`}
                  aria-invalid={!!errors.grade}
                  aria-describedby={errors.grade ? 'grade-error' : undefined}
                >
                  <option value="">학년을 선택하세요</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
                {errors.grade && (
                  <p
                    id="grade-error"
                    className="mt-1 text-xs sm:text-sm text-red-600"
                    role="alert"
                  >
                    {errors.grade}
                  </p>
                )}
              </div>
            </>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="w-full bg-[#084773] hover:bg-[#063a5a] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#084773] focus:ring-offset-2 transition-colors"
          >
            회원가입
          </button>
        </form>

        {/* 보조 액션 */}
        <div className="mt-6 space-y-3">
          <Link
            to="/login"
            className="block text-center text-[#084773] hover:text-[#063a5a] font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#084773] focus:ring-offset-2 rounded-lg py-2 transition-colors"
          >
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </div>
      </div>

      {/* 동의 모달 */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        onConfirm={handleConsentConfirm}
      />
    </div>
  )
}

export default SignupPage
