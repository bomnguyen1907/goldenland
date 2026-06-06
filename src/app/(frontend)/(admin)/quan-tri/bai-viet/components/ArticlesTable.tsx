'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { updateArticleStatus, toggleArticleFeatured, deleteArticle } from '../actions'
import ArticleFormDrawer from './ArticleFormDrawer'

export type ArticleItem = {
  id: number
  title?: string
  slug?: string
  excerpt?: string
  thumbnailUrl?: string
  tags?: string
  isFeatured?: boolean
  status?: string
  publishedAt?: string
  viewCount?: number
  createdAt?: string
  category?: { id?: number; name?: string } | null
  author?: { id?: number; fullName?: string; email?: string } | null
}

export type CategoryOption = { id: number; name: string }
export type UserOption = { id: number; fullName?: string; email?: string }

type Props = {
  items: ArticleItem[]
  page: number
  totalPages: number
  totalDocs: number
  currentQ: string
  currentStatus: string
  currentCategory: string
  categories: CategoryOption[]
  users: UserOption[]
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
  { value: 'hidden', label: 'Tạm ẩn' },
]

function statusBadge(s?: string) {
  switch (s) {
    case 'published': return 'bg-emerald-100 text-emerald-700'
    case 'draft': return 'bg-slate-100 text-slate-500'
    case 'hidden': return 'bg-rose-100 text-rose-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}
function statusLabel(s?: string) {
  switch (s) {
    case 'published': return 'Đã xuất bản'
    case 'draft': return 'Nháp'
    case 'hidden': return 'Tạm ẩn'
    default: return s ?? '-'
  }
}

export default function ArticlesTable({
  items, page, totalPages, totalDocs,
  currentQ, currentStatus, currentCategory, categories, users,
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [drawerItem, setDrawerItem] = useState<ArticleItem | null | 'new'>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(sp?.toString() || '')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/quan-tri/bai-viet?${next.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    updateFilter('q', q)
  }

  const goToPage = (p: number) => {
    const next = new URLSearchParams(sp?.toString() || '')
    next.set('page', String(p))
    router.push(`/quan-tri/bai-viet?${next.toString()}`)
  }

  const handleToggleStatus = (item: ArticleItem) => {
    const next = item.status === 'published' ? 'hidden' : 'published'
    setBusyId(item.id)
    startTransition(async () => {
      await updateArticleStatus(item.id, next as any)
      setBusyId(null)
      router.refresh()
    })
  }

  const handleToggleFeatured = (item: ArticleItem) => {
    setBusyId(item.id)
    startTransition(async () => {
      await toggleArticleFeatured(item.id, !item.isFeatured)
      setBusyId(null)
      router.refresh()
    })
  }

  const handleDelete = (item: ArticleItem) => {
    if (!confirm(`Xoá bài viết "${item.title}"? Hành động này không thể hoàn tác.`)) return
    startTransition(async () => {
      await deleteArticle(item.id)
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
                placeholder="Tìm tiêu đề..."
                className="text-sm border border-slate-200 rounded-md px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700">
                <span className="material-symbols-outlined text-[16px]">search</span>
              </button>
            </form>

            <select value={currentStatus} onChange={(e) => updateFilter('status', e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={currentCategory} onChange={(e) => updateFilter('category', e.target.value)}
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button
            onClick={() => setDrawerItem('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm bài viết
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">article</span>
            <p className="mt-2 text-slate-500">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-16">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tiêu đề</th>
                    <th className="px-4 py-3 text-left">Danh mục</th>
                    <th className="px-4 py-3 text-left">Tác giả</th>
                    <th className="px-4 py-3 text-center">Nổi bật</th>
                    <th className="px-4 py-3 text-right">Lượt xem</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((a) => {
                    const cat = typeof a.category === 'object' ? a.category : null
                    const author = typeof a.author === 'object' ? a.author : null
                    const isBusy = busyId === a.id
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-12 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            {a.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-[18px]">article</span>
                            )}
                          </div>
                        </td>

                        {/* Tiêu đề */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDrawerItem(a)}
                            className="font-medium text-slate-800 hover:text-amber-600 text-left line-clamp-2 max-w-[220px]"
                          >
                            {a.title || '-'}
                          </button>
                          {a.publishedAt && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(a.publishedAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </td>

                        {/* Danh mục */}
                        <td className="px-4 py-3">
                          {cat?.name ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {cat.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Tác giả */}
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {author?.fullName || author?.email || '-'}
                        </td>

                        {/* Nổi bật */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleFeatured(a)}
                            disabled={isBusy}
                            className="disabled:opacity-40"
                            title={a.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                          >
                            <span className={`material-symbols-outlined text-[22px] ${a.isFeatured ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}>
                              star
                            </span>
                          </button>
                        </td>

                        {/* Lượt xem */}
                        <td className="px-4 py-3 text-right text-slate-600">
                          {(a.viewCount || 0).toLocaleString('vi-VN')}
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
                            {statusLabel(a.status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
                            <button onClick={() => setDrawerItem(a)}
                              className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100" title="Chỉnh sửa">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(a)}
                              disabled={isBusy}
                              className={`px-2 py-1 rounded disabled:opacity-40 ${
                                a.status === 'published' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={a.status === 'published' ? 'Ẩn bài' : 'Xuất bản'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {a.status === 'published' ? 'visibility_off' : 'publish'}
                              </span>
                            </button>
                            <a href={`/admin/collections/articles/${a.id}`} target="_blank"
                              className="px-2 py-1 rounded text-slate-400 hover:bg-slate-100" title="Chỉnh nội dung (Payload Admin)">
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </a>
                            <button onClick={() => handleDelete(a)}
                              className="px-2 py-1 rounded text-rose-400 hover:bg-rose-50" title="Xoá">
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
                Trang {page} / {totalPages} • {totalDocs.toLocaleString('vi-VN')} bài viết
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
        <ArticleFormDrawer
          article={drawerItem === 'new' ? null : drawerItem}
          categories={categories}
          users={users}
          onClose={() => setDrawerItem(null)}
          onSaved={() => { setDrawerItem(null); router.refresh() }}
        />
      )}
    </>
  )
}