'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { formatVND, formatDateTime, relativeTime } from '../../../lib/format'
import { toggleUserActive } from '../actions'
import UserDetailDrawer from './UserDetailDrawer'

export type UserItem = {
  id: string | number
  fullName?: string
  email?: string
  phone?: string
  avatar_id?: string
  role?: string
  balance?: number
  isVerified?: boolean
  isActive?: boolean
  lastLoginAt?: string
  createdAt?: string
  activePackage?: { id?: string | number; name?: string } | null
  packageExpiresAt?: string
}

type Props = {
  items: UserItem[]
  page: number
  totalPages: number
  totalDocs: number
  currentQ: string
  currentRole: string
  currentStatus: string
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Bị khoá' },
  { value: 'unverified', label: 'Chưa xác thực' },
]

const roleOptions = [
  { value: '', label: 'Tất cả role' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
]

export default function UsersTable({
  items, page, totalPages, totalDocs,
  currentQ, currentRole, currentStatus,
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [detailId, setDetailId] = useState<string | number | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const detailItem = detailId !== null ? items.find((i) => String(i.id) === String(detailId)) ?? null : null

  const goToPage = (p: number) => {
    const next = new URLSearchParams(sp?.toString() || '')
    next.set('page', String(p))
    router.push(`/quan-tri/nguoi-dung?${next.toString()}`)
  }

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(sp?.toString() || '')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/quan-tri/nguoi-dung?${next.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    updateFilter('q', q)
  }

  const handleToggleActive = (id: string | number, current: boolean) => {
    setBusyId(String(id))
    startTransition(async () => {
      await toggleUserActive(id, !current)
      setBusyId(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <form onSubmit={handleSearch} className="flex gap-1">
            <input
              name="q"
              defaultValue={currentQ}
              placeholder="Tìm tên, email, SĐT..."
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
            </button>
          </form>

          <select
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={currentRole}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">group</span>
            <p className="mt-2 text-slate-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Người dùng</th>
                    <th className="px-4 py-3 text-left">Liên hệ</th>
                    <th className="px-4 py-3 text-left">Gói</th>
                    <th className="px-4 py-3 text-right">Số dư</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Đăng nhập</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((u) => {
                    const pkg = typeof u.activePackage === 'object' ? u.activePackage : null
                    const isBusy = busyId === String(u.id)
                    const packageExpired = u.packageExpiresAt ? new Date(u.packageExpiresAt) < new Date() : false
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {u.avatar_id ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.avatar_id} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => setDetailId(u.id)}
                                className="font-medium text-slate-800 hover:text-amber-600 text-left line-clamp-1"
                              >
                                {u.fullName || '-'}
                              </button>
                              {u.role === 'admin' && (
                                <span className="inline-flex px-1.5 py-0 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 mt-0.5">
                                  ADMIN
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700 text-xs line-clamp-1">{u.email}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{u.phone || '-'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {pkg ? (
                            <div>
                              <p className={`text-xs font-medium ${packageExpired ? 'text-slate-400' : 'text-violet-700'}`}>
                                {pkg.name}
                              </p>
                              {u.packageExpiresAt && (
                                <p className={`text-[11px] mt-0.5 ${packageExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                                  {packageExpired ? 'Hết hạn' : 'HH:'} {formatDateTime(u.packageExpiresAt).split(' ')[0]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Không có</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-slate-800 text-sm">{formatVND(u.balance)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                              u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {u.isActive ? 'Hoạt động' : 'Bị khoá'}
                            </span>
                            {!u.isVerified && (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-fit bg-amber-100 text-amber-700">
                                Chưa xác thực
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {u.lastLoginAt ? relativeTime(u.lastLoginAt) : 'Chưa đăng nhập'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => setDetailId(u.id)}
                              className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => handleToggleActive(u.id, !!u.isActive)}
                              disabled={isBusy || isPending || u.role === 'admin'}
                              className={`px-2 py-1 rounded disabled:opacity-40 ${
                                u.isActive
                                  ? 'text-rose-500 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.isActive ? 'Khoá tài khoản' : 'Mở khoá'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {u.isActive ? 'lock' : 'lock_open'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
              <span className="text-slate-500">
                Trang {page} / {totalPages} • {totalDocs.toLocaleString('vi-VN')} người dùng
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailItem && (
        <UserDetailDrawer
          user={detailItem}
          onClose={() => setDetailId(null)}
          onUpdated={() => {
            setDetailId(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}