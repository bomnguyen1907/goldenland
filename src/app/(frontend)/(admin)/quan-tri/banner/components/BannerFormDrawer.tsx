'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { saveBanner, type BannerPosition } from '../actions'
import type { BannerItem } from './BannersSection'
import { uploadMedia } from '@/app/services/media'

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'home_hero', label: 'Trang chủ — Hero' },
  { value: 'home_middle', label: 'Trang chủ — Giữa' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'listing_list', label: 'Danh sách tin' },
  { value: 'listing_detail', label: 'Chi tiết tin' },
  { value: 'popup', label: 'Popup' },
]

type FormState = {
  name: string
  link: string
  position: BannerPosition
  startDate: string
  endDate: string
  sort: string
  isActive: boolean
}

function toForm(b: BannerItem): FormState {
  return {
    name: b.name ?? '',
    link: b.link ?? '',
    position: (b.position as BannerPosition) ?? 'home_hero',
    startDate: b.startDate ? b.startDate.slice(0, 10) : '',
    endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    sort: b.sort?.toString() ?? '0',
    isActive: b.isActive ?? true,
  }
}

const emptyForm = (): FormState => ({
  name: '',
  link: '',
  position: 'home_hero',
  startDate: '',
  endDate: '',
  sort: '0',
  isActive: true,
})

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

type Props = {
  banner: BannerItem | null
  onClose: () => void
  onSaved: () => void
}

export default function BannerFormDrawer({ banner, onClose, onSaved }: Props) {
  const isEdit = !!banner?.id
  const [form, setForm] = useState<FormState>(() => (banner ? toForm(banner) : emptyForm()))
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existingImg = typeof banner?.image === 'object' ? banner?.image : null
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImg?.url ?? null)
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(
    existingImg?.id ?? null,
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    setError(null)

    try {
      const media = await uploadMedia(file, form.name || file.name)
      if (!media.id) throw new Error('Không lấy được ID ảnh')
      setUploadedMediaId(media.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi upload ảnh')
      setPreviewUrl(existingImg?.url ?? null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('Tên banner không được để trống')
    if (!uploadedMediaId) return setError('Vui lòng chọn ảnh banner')
    setError(null)

    startTransition(async () => {
      try {
        await saveBanner(banner?.id ?? null, {
          name: form.name.trim(),
          imageId: uploadedMediaId,
          link: form.link.trim() || undefined,
          position: form.position,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          sort: Number(form.sort) || 0,
          isActive: form.isActive,
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
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-2 shrink-0">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <h2 className="font-semibold text-slate-800">
            {isEdit ? `Chỉnh sửa — ${banner.name}` : 'Thêm banner mới'}
          </h2>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Ảnh */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ảnh banner <span className="text-rose-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors group"
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-[32px]">upload</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <span className="material-symbols-outlined text-slate-300 text-[40px]">
                    {uploading ? 'progress_activity' : 'add_photo_alternate'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {uploading ? 'Đang tải ảnh...' : 'Click để chọn ảnh'}
                  </p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-[32px] animate-spin">
                    progress_activity
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP. Khuyến nghị tỉ lệ 16:5</p>
          </div>

          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên nội bộ <span className="text-rose-500">*</span>
            </label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VD: Banner khuyến mãi tháng 6"
            />
          </div>

          {/* Vị trí */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí hiển thị</label>
            <select
              className={inputCls}
              value={form.position}
              onChange={(e) => set('position', e.target.value as BannerPosition)}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đường dẫn khi click
            </label>
            <input
              className={inputCls}
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian hiển thị
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Bắt đầu</p>
                <input
                  type="date"
                  className={inputCls}
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Kết thúc</p>
                <input
                  type="date"
                  className={inputCls}
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Để trống = không giới hạn thời gian</p>
          </div>

          {/* Thứ tự & trạng thái */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Thứ tự (nhỏ → trước)
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.sort}
                onChange={(e) => set('sort', e.target.value)}
                placeholder="0"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-sm text-slate-700">Hiển thị ngay</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={pending || uploading}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {(pending || uploading) && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Thêm banner'}
          </button>
        </footer>
      </aside>
    </div>
  )
}
