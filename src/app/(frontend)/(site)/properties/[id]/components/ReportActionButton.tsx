'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  submitPropertyReport,
  type PropertyReportReason,
} from '@/app/services/properties'
import type { RootState } from '@/app/store'
import { selectIsLoggedIn } from '@/app/store/slices/authSlice'
import { RegisterForm } from '../../../components/RegisterForm'
import { SignInForm } from '../../../components/SignInForm'

type ReportActionButtonProps = {
  propertyId: number
  title: string
}

const REPORT_REASONS: Array<{
  value: PropertyReportReason
  label: string
  description: string
}> = [
  {
    value: 'scam',
    label: 'Tin giả / lừa đảo',
    description: 'Thông tin có dấu hiệu giả mạo, thu phí bất thường hoặc dẫn dụ giao dịch.',
  },
  {
    value: 'wrong_info',
    label: 'Sai thông tin',
    description: 'Giá, diện tích, vị trí hoặc thông tin mô tả không đúng thực tế.',
  },
  {
    value: 'duplicate',
    label: 'Tin trùng lặp',
    description: 'Tin đăng này đã xuất hiện nhiều lần trên hệ thống.',
  },
  {
    value: 'wrong_image',
    label: 'Ảnh không đúng',
    description: 'Hình ảnh không thuộc bất động sản hoặc gây hiểu nhầm.',
  },
  {
    value: 'sold_not_removed',
    label: 'Đã bán nhưng chưa gỡ',
    description: 'Bất động sản không còn khả dụng nhưng tin vẫn đang hiển thị.',
  },
  {
    value: 'other',
    label: 'Khác',
    description: 'Vấn đề khác cần đội ngũ kiểm duyệt xem xét.',
  },
]

export function ReportActionButton({ propertyId, title }: ReportActionButtonProps) {
  const isLoggedIn = useSelector((state: RootState) => selectIsLoggedIn(state))
  const [isOpen, setIsOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [reason, setReason] = useState<PropertyReportReason | ''>('')
  const [detail, setDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedReason = useMemo(
    () => REPORT_REASONS.find((item) => item.value === reason),
    [reason],
  )
  const requiresDetail = reason === 'other'
  const canSubmit = Boolean(reason) && (!requiresDetail || detail.trim().length >= 10)
  const isAuthOpen = showSignIn || showRegister

  useEffect(() => {
    if (!isAuthOpen && !isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isAuthOpen, isOpen])

  const openReportFlow = () => {
    setMessage(null)
    setError(null)

    if (isLoggedIn) {
      setIsOpen(true)
      return
    }

    setShowSignIn(true)
    setShowRegister(false)
  }

  const closeAuthModal = () => {
    setShowSignIn(false)
    setShowRegister(false)
  }

  const handleAuthSuccess = () => {
    closeAuthModal()
    setIsOpen(true)
  }

  const closeDialog = () => {
    if (isSubmitting) return
    setIsOpen(false)
    setReason('')
    setDetail('')
    setMessage(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || !reason) return

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await submitPropertyReport({
        propertyId,
        reason,
        detail: detail.trim() || undefined,
      })

      setMessage(response.message || 'Đã gửi báo cáo.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi báo cáo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        aria-label={`Báo cáo tin đăng: ${title}`}
        className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center w-10 h-10"
        onClick={openReportFlow}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
          flag
        </span>
      </button>

      {isAuthOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-6"
          onClick={closeAuthModal}
        >
          <div
            aria-modal="true"
            className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0px_24px_48px_rgba(0,0,0,0.25)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            {showSignIn ? (
              <SignInForm
                onClose={closeAuthModal}
                onSwitchToRegister={() => {
                  setShowSignIn(false)
                  setShowRegister(true)
                }}
                onSuccess={handleAuthSuccess}
                redirectAdmin={false}
              />
            ) : null}

            {showRegister ? (
              <RegisterForm
                onClose={closeAuthModal}
                onSwitchToSignIn={() => {
                  setShowRegister(false)
                  setShowSignIn(true)
                }}
                onSuccess={handleAuthSuccess}
              />
            ) : null}

            <button
              aria-label="Đóng cửa sổ đăng nhập"
              className="absolute right-4 top-4 z-50 rounded-md px-2 py-1 text-2xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              onClick={closeAuthModal}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {isOpen && isLoggedIn && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 px-4 py-4 sm:items-center"
          role="dialog"
        >
          <div className="w-full max-w-[520px] overflow-hidden rounded-lg border border-outline-variant/20 bg-white shadow-[0px_24px_60px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant/20 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-on-surface">Báo cáo tin đăng</h2>
                <p className="mt-1 line-clamp-1 text-sm text-secondary">{title}</p>
              </div>
              <button
                aria-label="Đóng báo cáo"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                onClick={closeDialog}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {message ? (
              <div className="px-5 py-6">
                <div className="flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <p>{message}</p>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                    onClick={closeDialog}
                    type="button"
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-5">
                <div className="space-y-2">
                  {REPORT_REASONS.map((item) => {
                    const checked = item.value === reason

                    return (
                      <label
                        className={`flex cursor-pointer gap-3 rounded-md border px-4 py-3 transition-colors ${
                          checked
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/25 hover:bg-surface-container-low'
                        }`}
                        key={item.value}
                      >
                        <input
                          checked={checked}
                          className="mt-1 h-4 w-4 accent-primary"
                          name="report-reason"
                          onChange={() => {
                            setReason(item.value)
                            setError(null)
                          }}
                          type="radio"
                          value={item.value}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-on-surface">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-secondary">
                            {item.description}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>

                {selectedReason && (
                  <p className="mt-3 text-xs text-secondary">
                    Lý do đã chọn: <span className="font-semibold">{selectedReason.label}</span>
                  </p>
                )}

                <div className="mt-4">
                  <label
                    className="mb-1.5 block text-sm font-medium text-on-surface"
                    htmlFor="report-detail"
                  >
                    Chi tiết bổ sung {requiresDetail ? '' : '(không bắt buộc)'}
                  </label>
                  <textarea
                    className="min-h-[96px] w-full resize-none rounded-md border border-outline-variant/30 bg-white px-3 py-2 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
                    id="report-detail"
                    maxLength={1000}
                    onChange={(event) => {
                      setDetail(event.target.value)
                      setError(null)
                    }}
                    placeholder="Mô tả ngắn vấn đề bạn phát hiện..."
                    value={detail}
                  />
                  <p className="mt-1 text-right text-xs text-secondary">{detail.length}/1000</p>
                </div>

                {error && (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    className="rounded-md border border-outline-variant/40 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSubmitting}
                    onClick={closeDialog}
                    type="button"
                  >
                    Hủy
                  </button>
                  <button
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmit}
                    type="button"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
