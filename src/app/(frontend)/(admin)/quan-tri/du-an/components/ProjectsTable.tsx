'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { updateProjectStatus, toggleProjectFeatured, deleteProject } from '../actions'
import ProjectFormDrawer from './ProjectFormDrawer'

export type ProjectItem = {
  id: number
  name?: string
  slug?: string
  address?: string
  provinceCode?: string
  propertyTypes?: string[]
  totalArea?: number
  totalUnits?: number
  priceFrom?: number
  priceTo?: number
  startDate?: string
  completionDate?: string
  status?: string
  saleStatus?: string
  isFeatured?: boolean
  views?: number
  videoUrl?: string
  thumbnail?: { id?: number; url?: string } | null
  investor?: { id?: number; name?: string } | null
}

export type InvestorOption = { id: number; name: string }

type Props = {
  items: ProjectItem[]
  page: number
  totalPages: number
  totalDocs: number
  currentQ: string
  currentStatus: string
  currentSaleStatus: string
  investors: InvestorOption[]
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'draft', label: 'Nháp' },
  { value: 'hidden', label: 'Tạm ẩn' },
]

const saleStatusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang mở bán' },
  { value: 'upcoming', label: 'Sắp mở bán' },
  { value: 'completed', label: 'Đã bàn giao' },
]

function statusBadge(status?: string) {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700'
    case 'draft': return 'bg-slate-100 text-slate-500'
    case 'hidden': return 'bg-rose-100 text-rose-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}
function statusLabel(status?: string) {
  switch (status) {
    case 'active': return 'Hiển thị'
    case 'draft': return 'Nháp'
    case 'hidden': return 'Tạm ẩn'
    default: return status ?? '-'
  }
}
function saleLabel(s?: string) {
  switch (s) {
    case 'active': return 'Đang mở bán'
    case 'upcoming': return 'Sắp mở bán'
    case 'completed': return 'Đã bàn giao'
    default: return s ?? '-'
  }
}

export default function ProjectsTable({
  items, page, totalPages, totalDocs,
  currentQ, currentStatus, currentSaleStatus, investors,
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [drawerItem, setDrawerItem] = useState<ProjectItem | null | 'new'>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(sp?.toString() || '')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/quan-tri/du-an?${next.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    updateFilter('q', q)
  }

  const goToPage = (p: number) => {
    const next = new URLSearchParams(sp?.toString() || '')
    next.set('page', String(p))
    router.push(`/quan-tri/du-an?${next.toString()}`)
  }

  const handleToggleStatus = (item: ProjectItem) => {
    const next = item.status === 'active' ? 'hidden' : 'active'
    setBusyId(item.id)
    startTransition(async () => {
      await updateProjectStatus(item.id, next as any)
      setBusyId(null)
      router.refresh()
    })
  }

  const handleToggleFeatured = (item: ProjectItem) => {
    setBusyId(item.id)
    startTransition(async () => {
      await toggleProjectFeatured(item.id, !item.isFeatured)
      setBusyId(null)
      router.refresh()
    })
  }

  const handleDelete = (item: ProjectItem) => {
    if (!confirm(`Xoá dự án "${item.name}"? Hành động này không thể hoàn tác.`)) return
    startTransition(async () => {
      await deleteProject(item.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <form onSubmit={handleSearch} className="flex gap-1">
              <input
                name="q"
                defaultValue={currentQ}
                placeholder="Tìm tên dự án..."
                className="text-sm border border-slate-200 rounded-md px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700">
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
              value={currentSaleStatus}
              onChange={(e) => updateFilter('saleStatus', e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {saleStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => setDrawerItem('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm dự án
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">apartment</span>
            <p className="mt-2 text-slate-500">Không tìm thấy dự án nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-20">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tên dự án</th>
                    <th className="px-4 py-3 text-left">Chủ đầu tư</th>
                    <th className="px-4 py-3 text-left">Mở bán</th>
                    <th className="px-4 py-3 text-center">Nổi bật</th>
                    <th className="px-4 py-3 text-right">Lượt xem</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p) => {
                    const thumb = typeof p.thumbnail === 'object' ? p.thumbnail : null
                    const inv = typeof p.investor === 'object' ? p.investor : null
                    const isBusy = busyId === p.id
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-16 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            {thumb?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-[20px]">apartment</span>
                            )}
                          </div>
                        </td>

                        {/* Tên */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDrawerItem(p)}
                            className="font-medium text-slate-800 hover:text-amber-600 text-left line-clamp-1 max-w-[200px]"
                          >
                            {p.name || '-'}
                          </button>
                          {p.address && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.address}</p>
                          )}
                        </td>

                        {/* Chủ đầu tư */}
                        <td className="px-4 py-3 text-slate-600 text-xs">{inv?.name || '-'}</td>

                        {/* Mở bán */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            p.saleStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            p.saleStatus === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {saleLabel(p.saleStatus)}
                          </span>
                        </td>

                        {/* Nổi bật */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            disabled={isBusy}
                            title={p.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                            className="disabled:opacity-40"
                          >
                            <span className={`material-symbols-outlined text-[22px] ${p.isFeatured ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}>
                              {p.isFeatured ? 'star' : 'star'}
                            </span>
                          </button>
                        </td>

                        {/* Lượt xem */}
                        <td className="px-4 py-3 text-right text-slate-600">
                          {(p.views || 0).toLocaleString('vi-VN')}
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>
                            {statusLabel(p.status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => setDrawerItem(p)}
                              className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(p)}
                              disabled={isBusy}
                              className={`px-2 py-1 rounded disabled:opacity-40 ${
                                p.status === 'active' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={p.status === 'active' ? 'Tạm ẩn' : 'Hiển thị'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {p.status === 'active' ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
              <span className="text-slate-500">
                Trang {page} / {totalPages} • {totalDocs.toLocaleString('vi-VN')} dự án
              </span>
              <div className="flex gap-1">
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  Trước
                </button>
                <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {drawerItem !== null && (
        <ProjectFormDrawer
          project={drawerItem === 'new' ? null : drawerItem}
          investors={investors}
          onClose={() => setDrawerItem(null)}
          onSaved={() => { setDrawerItem(null); router.refresh() }}
        />
      )}
    </>
  )
}