import { useState, useEffect, useRef } from 'react'
import { SERVICE_TERMS, PRIVACY_POLICY } from '../constants/terms'

interface ConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (consent: {
    serviceTerms: boolean
    privacyPolicy: boolean
    marketing: boolean
    consentVersion: string
    agreedAt: Date
  }) => void
}

const ConsentModal = ({ isOpen, onClose, onConfirm }: ConsentModalProps) => {
  const [serviceTerms, setServiceTerms] = useState(false)
  const [privacyPolicy, setPrivacyPolicy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [showServiceTermsDetails, setShowServiceTermsDetails] = useState(false)
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 첫 번째 체크박스에 포커스
      setTimeout(() => {
        firstCheckboxRef.current?.focus()
      }, 100)
    } else {
      // 모달이 닫힐 때 상태 초기화
      setServiceTerms(false)
      setPrivacyPolicy(false)
      setMarketing(false)
      setShowServiceTermsDetails(false)
      setShowPrivacyDetails(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (serviceTerms && privacyPolicy) {
      onConfirm({
        serviceTerms,
        privacyPolicy,
        marketing,
        consentVersion: 'v1',
        agreedAt: new Date(),
      })
    }
  }

  const isConfirmEnabled = serviceTerms && privacyPolicy

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2
            id="consent-modal-title"
            className="text-xl sm:text-2xl font-bold text-gray-900"
          >
            이용약관 동의
          </h2>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* 서비스 이용약관 */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  ref={firstCheckboxRef}
                  type="checkbox"
                  checked={serviceTerms}
                  onChange={(e) => setServiceTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#084773] border-gray-300 rounded focus:ring-[#084773] focus:ring-2"
                  aria-required="true"
                />
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    (필수) 서비스 이용약관 동의
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowServiceTermsDetails(!showServiceTermsDetails)}
                    className="ml-2 text-sm text-[#084773] hover:text-[#063a5a] underline"
                  >
                    {showServiceTermsDetails ? '접기' : '전문 보기'}
                  </button>
                </div>
              </label>

              {/* 서비스 이용약관 전문 (아코디언) */}
              {showServiceTermsDetails && (
                <div className="mt-3 ml-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {SERVICE_TERMS}
                  </div>
                </div>
              )}
            </div>

            {/* 개인정보 수집·이용 동의 */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#084773] border-gray-300 rounded focus:ring-[#084773] focus:ring-2"
                  aria-required="true"
                />
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    (필수) 개인정보 수집·이용 동의
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                    className="ml-2 text-sm text-[#084773] hover:text-[#063a5a] underline"
                  >
                    {showPrivacyDetails ? '접기' : '전문 보기'}
                  </button>
                </div>
              </label>

              {/* 개인정보 수집·이용 동의 전문 (아코디언) */}
              {showPrivacyDetails && (
                <div className="mt-3 ml-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {PRIVACY_POLICY}
                  </div>
                </div>
              )}
            </div>

            {/* 마케팅 정보 수신 동의 */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#084773] border-gray-300 rounded focus:ring-[#084773] focus:ring-2"
                />
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    (선택) 마케팅 정보 수신 동의
                  </span>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    이메일 및 SMS를 통한 이벤트 및 프로모션 정보 수신
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className={`flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isConfirmEnabled
                ? 'bg-[#084773] hover:bg-[#063a5a] focus:ring-[#084773] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            동의하고 가입하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentModal

