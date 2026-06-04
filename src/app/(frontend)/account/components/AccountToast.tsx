'use client'

import { useEffect } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type AccountToastState = {
  message: string
  type: 'success' | 'error' | 'info'
} | null

type Props = {
  toast: AccountToastState
  onClose: () => void
  durationMs?: number
}

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
  },
  error: {
    icon: XCircle,
    className: 'border-error/20 bg-error/5 text-error',
    iconClassName: 'text-error',
  },
  info: {
    icon: Info,
    className: 'border-outline-variant/40 bg-white text-on-surface',
    iconClassName: 'text-primary',
  },
} as const

export function AccountToast({ toast, onClose, durationMs = 3000 }: Props) {
  useEffect(() => {
    if (!toast || durationMs <= 0) return

    const timer = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, onClose, toast])

  if (!toast) return null

  const style = TOAST_STYLES[toast.type]
  const Icon = style.icon

  return (
    <div className="pointer-events-none fixed right-4 top-6 z-[80] flex w-[min(92vw,380px)] justify-end">
      <div
        className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl shadow-black/10 ${style.className}`}
        role="status"
      >
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`} />
        <p className="min-w-0 flex-1 font-medium leading-5">{toast.message}</p>
        <button
          aria-label="Đóng thông báo"
          className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
