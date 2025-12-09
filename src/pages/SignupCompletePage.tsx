import { useState } from 'react'
import { Link } from 'react-router-dom'

const SignupCompletePage = () => {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-4 sm:py-8 bg-white">
      <div className="flex flex-col items-center w-full max-w-[403px] rounded-2xl">
        {/* 로고 */}
        <div className="flex justify-center pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 mb-8">
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

        {/* 완료 메시지 카드 */}
        <div className="w-full bg-white rounded-2xl p-4 sm:p-6 md:p-8 text-center">
          <div className="mb-6">
            {/* 체크 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            {/* 완료 메시지 */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              회원가입이 완료 되었습니다.
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              곽원근 수학연구소에 오신 것을 환영합니다!
            </p>
          </div>

          {/* 로그인하러 가기 버튼 */}
          <Link
            to="/login"
            className="block w-full bg-[#084773] hover:bg-[#063a5a] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#084773] focus:ring-offset-2 transition-colors text-center"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupCompletePage

