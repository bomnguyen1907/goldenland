'use client'

import { useState, useTransition, useEffect } from 'react'
import { saveArticle, type ArticleStatus } from '../actions'
import type { ArticleItem, CategoryOption, UserOption } from './ArticlesTable'

type FormState = {
  title: string
  excerpt: string
  thumbnailUrl: string
  categoryId: string
  tags: string
  isFeatured: boolean
  status: ArticleStatus
  publishedAt: string
  authorId: string
}

function toForm(a: ArticleItem): FormState {
  const cat = typeof a.category === 'object' ? a.category : null
  const author = typeof a.author === 'object' ? a.author : null
  return {
    title: a.title ?? '',
    excerpt: a.excerpt ?? '',
    thumbnailUrl: a.thumbnailUrl ?? '',
    categoryId: cat?.id?.toString() ?? '',
    tags: a.tags ?? '',
    isFeatured: a.isFeatured ?? false,
    status: (a.status as ArticleStatus) ?? 'draft',
    publishedAt: a.publishedAt ? a.publishedAt.slice(0, 10) : '',
    authorId: author?.id?.toString() ?? '',
  }
}

const emptyForm = (): FormState => ({
  title: '',
  excerpt: '',
  thumbnailUrl: '',
  categoryId: '',
  tags: '',
  isFeatured: false,
  status: 'draft',
  publishedAt: '',
  authorId: '',
})

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

type Props = {
  article: ArticleItem | null
  categories: CategoryOption[]
  users: UserOption[]
  onClose: () => void
  onSaved: () => void
}

export default function ArticleFormDrawer({ article, categories, users, onClose, onSaved }: Props) {
  const isEdit = !!article?.id
  const [form, setForm] = useState<FormState>(() => article ? toForm(article) : emptyForm())
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) return setError('Tiêu đề không được để trống')
    setError(null)
    startTransition(async () => {
      try {
        await saveArticle(article?.id ?? null, {
          title: form.title.trim(),
          excerpt: form.excerpt || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          tags: form.tags || undefined,
          isFeatured: form.isFeatured,
          status: form.status,
          publishedAt: form.publishedAt || undefined,
          authorId: form.authorId ? Number(form.authorId) : null,
        })
        onSaved()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Lỗi khi lưu')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-slate-900/40" />
      <aside
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-2 shrink-0">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <h2 className="font-semibold text-slate-800 truncate">
            {isEdit ? `Chỉnh sửa — ${article.title}` : 'Thêm bài viết mới'}
          </h2>
          {isEdit && (
            <a
              href={`/admin/collections/articles/${article.id}`}
              target="_blank"
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-amber-600 shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              Chỉnh nội dung
            </a>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input className={inputCls} value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: 5 điều cần biết khi mua nhà lần đầu" />
          </div>

          {/* Tóm tắt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt</label>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="Mô tả ngắn hiển thị ở danh sách bài viết..." />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL ảnh đại diện</label>
            <input className={inputCls} value={form.thumbnailUrl}
              onChange={(e) => set('thumbnailUrl', e.target.value)}
              placeholder="https://..." />
            {form.thumbnailUrl && (
              <div className="mt-2 w-full h-28 rounded-lg overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.thumbnailUrl} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
              <select className={inputCls} value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">— Chọn danh mục —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tác giả */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tác giả</label>
              <select className={inputCls} value={form.authorId}
                onChange={(e) => set('authorId', e.target.value)}>
                <option value="">— Chọn tác giả —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <input className={inputCls} value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="bất động sản, mua nhà, đầu tư (cách nhau bởi dấu phẩy)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select className={inputCls} value={form.status}
                onChange={(e) => set('status', e.target.value as ArticleStatus)}>
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
                <option value="hidden">Tạm ẩn</option>
              </select>
            </div>

            {/* Ngày xuất bản */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày xuất bản</label>
              <input type="date" className={inputCls} value={form.publishedAt}
                onChange={(e) => set('publishedAt', e.target.value)} />
            </div>
          </div>

          {/* Nổi bật */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="w-4 h-4 accent-amber-500" />
            <span className="text-sm text-slate-700">Bài viết nổi bật (hiển thị trang chủ)</span>
          </label>

          {/* Note về richText */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">info</span>
              <span>
                Để chỉnh sửa <strong>nội dung bài viết</strong> (richText editor), vui lòng dùng{' '}
                {isEdit ? (
                  <a href={`/admin/collections/articles/${article.id}`} target="_blank"
                    className="underline font-medium">Payload Admin →</a>
                ) : (
                  <span className="font-medium">Payload Admin sau khi tạo bài</span>
                )}.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex gap-2 shrink-0">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={pending}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {pending && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </button>
        </footer>
      </aside>
    </div>
  )
}