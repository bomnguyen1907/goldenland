'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleBannerActive, deleteBanner } from '../actions'
import BannerFormDrawer from './BannerFormDrawer'

export type BannerItem = {
  id: number
  name?: string
  image?: { id?: number; url?: string; filename?: string } | null
  link?: string
  position?: string
  startDate?: string
  endDate?: string
  sort?: number
  isActive?: boolean
}

const POSITIONS: { value: string; label: string }[] = [
  { value: 'home_hero', label: 'Trang chủ — Hero' },
  { value: 'home_middle', label: 'Trang chủ — Giữa' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'listing_list', label: 'Danh sách tin' },
  { value: 'listing_detail', label: 'Chi tiết tin' },
  { value: 'popup', label: 'Popup' },
]

function positionLabel(val?: string) {
  return POSITIONS.find((p) => p.value === val)?.label ?? val ?? '-'
}

function expirySatus(endDate?: string) {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 7) return 'soon'
  return 'ok'
}

export default function BannersSection({ banners }: { banners: BannerItem[] }) {
  const router = useRouter()
  const [drawerItem, setDrawerItem] = useState<BannerItem | null | 'new'>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [filterPos, setFilterPos] = useState('')

  const filtered = filterPos ? banners.filter((b) => b.position === filterPos) : banners

  const handleToggle = (id: number, current: boolean) => {
    setBusyId(String(id))
    startTransition(async () => {
      await toggleBannerActive(id, !current)
      setBusyId(null)
      router.refresh()
    })
  }

  const handleDelete = (banner: BannerItem) => {
    if (!confirm(`Xoá banner "${banner.name}"? Hành động này không thể hoàn tác.`)) return
    startTransition(async () => {
      await deleteBanner(banner.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Tất cả vị trí</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">{filtered.length} banner</span>
          </div>
          <button
            onClick={() => setDrawerItem('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm banner
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">view_carousel</span>
            <p className="mt-2 text-slate-500">Chưa có banner nào</p>
            <button
              onClick={() => setDrawerItem('new')}
              className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
            >
              Thêm banner đầu tiên
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-24">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tên</th>
                    <th className="px-4 py-3 text-left">Vị trí</th>
                    <th className="px-4 py-3 text-left">Thời gian</th>
                    <th className="px-4 py-3 text-center">Thứ tự</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => {
                    const img = typeof b.image === 'object' ? b.image : null
                    const isBusy = busyId === String(b.id)
                    const expiry = expirySatus(b.endDate)
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        {/* Ảnh */}
                        <td className="px-4 py-3">
                          <div className="w-20 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            {img?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img.url} alt={b.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-[24px]">image</span>
                            )}
                          </div>
                        </td>

                        {/* Tên + link */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDrawerItem(b)}
                            className="font-medium text-slate-800 hover:text-amber-600 text-left line-clamp-1"
                          >
                            {b.name || '-'}
                          </button>
                          {b.link && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{b.link}</p>
                          )}
                        </td>

                        {/* Vị trí */}
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {positionLabel(b.position)}
                          </span>
                        </td>

                        {/* Thời gian */}
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {b.startDate || b.endDate ? (
                            <div>
                              {b.startDate && (
                                <p>Từ: {new Date(b.startDate).toLocaleDateString('vi-VN')}</p>
                              )}
                              {b.endDate && (
                                <p className={expiry === 'expired' ? 'text-rose-500' : expiry === 'soon' ? 'text-amber-500' : ''}>
                                  Đến: {new Date(b.endDate).toLocaleDateString('vi-VN')}
                                  {expiry === 'expired' && ' ⚠ Hết hạn'}
                                  {expiry === 'soon' && ' ⚠ Sắp hết'}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Không giới hạn</span>
                          )}
                        </td>

                        {/* Sort */}
                        <td className="px-4 py-3 text-center text-slate-500">{b.sort ?? 0}</td>

                        {/* Trạng thái */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {b.isActive ? 'Đang hiển thị' : 'Đã tắt'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => setDrawerItem(b)}
                              className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleToggle(b.id, !!b.isActive)}
                              disabled={isBusy}
                              className={`px-2 py-1 rounded disabled:opacity-40 ${
                                b.isActive
                                  ? 'text-amber-500 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={b.isActive ? 'Tắt banner' : 'Bật banner'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {b.isActive ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(b)}
                              className="px-2 py-1 rounded text-rose-400 hover:bg-rose-50"
                              title="Xoá"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {drawerItem !== null && (
        <BannerFormDrawer
          banner={drawerItem === 'new' ? null : drawerItem}
          onClose={() => setDrawerItem(null)}
          onSaved={() => {
            setDrawerItem(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}