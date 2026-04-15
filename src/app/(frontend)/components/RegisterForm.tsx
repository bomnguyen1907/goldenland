'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register, signIn } from '@/app/services/auth'

type RegisterFormProps = {
  onClose: () => void
  onSwitchToSignIn: () => void
}

export function RegisterForm({ onClose, onSwitchToSignIn }: RegisterFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý điều khoản dịch vụ để tiếp tục.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        fullName,
        email,
        password,
      })
      await signIn(email, password)
      onClose()
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* ── Left Panel ── */}
        <div className="md:w-[45%] bg-gray-100 p-10 flex flex-col justify-between">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold leading-snug text-red-600 mb-3">
              Tìm nhà đất
              <br />
              Batdongsan.com.vn dẫn lối
            </h1>
            <div className="w-10 h-1 bg-red-600 rounded-full mb-8" />
          </div>

          {/* Illustration */}
          <div className="rounded-2xl overflow-hidden bg-teal-600 flex items-end justify-center pt-8">
            {/* SVG illustration — person lying on sofa */}
            <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Background */}
              <rect width="400" height="280" fill="#2a9d8f" rx="0" />

              {/* Sofa body */}
              <rect x="50" y="170" width="300" height="60" rx="18" fill="#1a6b5e" />
              {/* Sofa back */}
              <rect x="65" y="130" width="270" height="55" rx="14" fill="#1a6b5e" />
              {/* Sofa left arm */}
              <rect x="40" y="155" width="38" height="75" rx="12" fill="#155f53" />
              {/* Sofa right arm */}
              <rect x="322" y="155" width="38" height="75" rx="12" fill="#155f53" />
              {/* Sofa legs */}
              <rect x="80" y="226" width="18" height="30" rx="5" fill="#8b4513" />
              <rect x="302" y="226" width="18" height="30" rx="5" fill="#8b4513" />
              {/* Red pillow */}
              <ellipse cx="90" cy="168" rx="28" ry="22" fill="#e63946" />

              {/* Person — body lying */}
              {/* Torso */}
              <rect x="110" y="148" width="160" height="38" rx="18" fill="#e07b3a" />
              {/* Legs */}
              <rect x="260" y="148" width="80" height="26" rx="13" fill="#2d2d3a" />
              {/* Shoes */}
              <ellipse cx="345" cy="155" rx="18" ry="11" fill="#e63946" />
              <ellipse cx="345" cy="165" rx="18" ry="11" fill="#c1121f" />
              {/* Head */}
              <circle cx="110" cy="148" r="24" fill="#f4a261" />
              {/* Hair */}
              <ellipse cx="110" cy="130" rx="22" ry="12" fill="#2d2d3a" />
              {/* Raised arm */}
              <line
                x1="130"
                y1="142"
                x2="155"
                y2="118"
                stroke="#e07b3a"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle cx="155" cy="113" r="10" fill="#f4a261" />
              {/* Other arm */}
              <line
                x1="190"
                y1="156"
                x2="215"
                y2="172"
                stroke="#e07b3a"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-1">Xin chào bạn</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Đăng ký tài khoản mới</h2>

          {/* Phone input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1.5">Số điện thoại</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              <input
                type="tel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer mb-6 select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              Tôi đồng ý với{' '}
              <a href="#" className="text-red-600 font-medium hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="text-red-600 font-medium hover:underline">
                Chính sách bảo mật
              </a>{' '}
              của Batdongsan.com.vn
            </span>
          </label>

          {/* Continue button */}
          <button
            disabled={!agreeTerms || !email}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 active:bg-red-800 text-white font-semibold py-3 rounded-lg transition text-sm tracking-wide mb-5"
          >
            Tiếp tục
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center mb-5">
            <span className="text-sm text-gray-400">Hoặc</span>
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Tiếp tục với Google
          </button>

          {/* Apple */}
          <button className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-gray-900 text-white rounded-lg py-3 text-sm font-medium transition mb-8">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.77M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Tiếp tục với Apple
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500">
            Bạn đã có tài khoản?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-red-600 font-semibold hover:underline"
            >
              Đăng nhập tại đây
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
