'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '@/app/store/slices/authSlice'
import type { RootState } from '@/app/store'
import { SignInForm } from '../components/SignInForm'
import { RegisterForm } from '../components/RegisterForm'
import { useState } from 'react'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'
  const isLoggedIn = useSelector((state: RootState) => selectIsLoggedIn(state as any))
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    if (isLoggedIn) router.replace(next)
  }, [isLoggedIn, next, router])

  const handleSuccess = () => router.replace(next)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        {showRegister ? (
          <RegisterForm
            onClose={handleSuccess}
            onSwitchToSignIn={() => setShowRegister(false)}
          />
        ) : (
          <SignInForm
            onClose={handleSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
