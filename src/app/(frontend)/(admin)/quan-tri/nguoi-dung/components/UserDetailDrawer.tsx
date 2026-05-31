'use client'

import { useEffect, useRef, useTransition, useState } from 'react'
import { formatVND, formatDateTime, relativeTime } from '../../../lib/format'
import { toggleUserActive, toggleUserVerified, adjustBalance } from '../actions'
import type { UserItem } from './UsersTable'

type Props = {
  user: UserItem
  onClose: () => void
  onUpdated: () => void
}

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000]

export default function UserDetailDrawer({ user, onClose, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [balanceInput, setBalanceInput] = useState('')
  const [balanceMode, setBalanceMode] = useState<'add' | 'deduct'>('add')
  const [showBalanceForm, setShowBalanceForm] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const pkg = typeof user.activePackage === 'object' ? user.activePackage : null
  const packageExpired = user.packageExpiresAt ? new Date(user.packageExpiresAt) < new Date() : false

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const run = (fn: () => Promise<void>) => {
    setError(null)
    startTransition(async () => {
      try { await fn() } catch (e: any) { setError(e?.message || 'Lỗi xử lý') }
    })
  }

  const handleToggleActive = () =>
    run(async () => { await toggleUserActive(user.id, !user.isActive); onUpdated() })

  const handleToggleVerified = () =>
    run(async () => { await toggleUserVerified(user.id, !user.isVerified); onUpdated() })

  const handleAdjustBalance = () => {
    const amount = parseInt(balanceInput.replace(/\D/g, ''), 10)
    if (!amount || amount <= 0) return
    const delta = balanceMode === 'add' ? amount : -amount
    run(async () => {
      await adjustBalance(user.id, delta)
      setBalanceInput('')
      setShowBalanceForm(false)
      onUpdated()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Chi tiết người dùng</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Avatar + tên */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {user.avatar_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_id} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-400 text-[32px]">person</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-lg leading-tight">{user.fullName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {user.role === 'admin' && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">Admin</span>
                )}
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {user.isActive ? 'Hoạt động' : 'Bị khoá'}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.isVerified ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                  {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tài khoản</p>
            <div className="bg-slate-50 rounded-lg px-4 divide-y divide-slate-100">
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-slate-500">Ngày tham gia</span>
                <span className="text-sm text-slate-800">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-slate-500">Đăng nhập lần cuối</span>
                <span className="text-sm text-slate-800">
                  {user.lastLoginAt ? relativeTime(user.lastLoginAt) : 'Chưa đăng nhập'}
                </span>
              </div>
            </div>
          </div>

          {/* Số dư */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số dư ví</p>
              <button
                onClick={() => setShowBalanceForm((v) => !v)}
                className="text-xs text-amber-600 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Điều chỉnh
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-emerald-600">{formatVND(user.balance)}</p>
            </div>

            {showBalanceForm && (
              <div className="mt-2 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => setBalanceMode('add')}
                    className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${balanceMode === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    + Nạp
                  </button>
                  <button
                    onClick={() => setBalanceMode('deduct')}
                    className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${balanceMode === 'deduct' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    − Trừ
                  </button>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setBalanceInput(String(a))}
                      className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      {(a / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập số tiền (VNĐ)"
                    className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={handleAdjustBalance}
                    disabled={!balanceInput || isPending}
                    className="px-4 py-1.5 rounded bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gói đăng tin */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Gói đăng tin</p>
            <div className="bg-slate-50 rounded-lg px-4 py-3">
              {pkg ? (
                <div>
                  <p className={`font-medium ${packageExpired ? 'text-slate-400' : 'text-violet-700'}`}>
                    {pkg.name}
                  </p>
                  {user.packageExpiresAt && (
                    <p className={`text-xs mt-1 ${packageExpired ? 'text-rose-500' : 'text-slate-500'}`}>
                      {packageExpired ? '⚠ Hết hạn:' : 'Hết hạn:'} {formatDateTime(user.packageExpiresAt)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Không có gói đang dùng</p>
              )}
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Xem thêm</p>
            <div className="flex gap-2">
              <a
                href={`/quan-tri/don-hang?q=${encodeURIComponent(user.email || '')}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Đơn hàng
              </a>
              <a
                href={`/quan-tri/tin-dang?q=${encodeURIComponent(user.email || '')}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[16px]">home_work</span>
                Tin đăng
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        {user.role !== 'admin' && (
          <div className="border-t border-slate-200 px-5 py-4 flex gap-2">
            <button
              onClick={handleToggleVerified}
              disabled={isPending}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {user.isVerified ? 'Bỏ xác thực' : 'Xác thực ngay'}
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isPending}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                user.isActive
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isPending ? 'Đang xử lý...' : user.isActive ? 'Khoá tài khoản' : 'Mở khoá'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}