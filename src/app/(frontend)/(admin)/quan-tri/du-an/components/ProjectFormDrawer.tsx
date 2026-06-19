'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { saveProject, type ProjectStatus, type ProjectSaleStatus } from '../actions'
import type { ProjectItem, InvestorOption } from './ProjectsTable'
import { uploadMedia } from '@/app/services/media'

const PROPERTY_TYPES = [
  { value: 'house', label: 'Nhà riêng' },
  { value: 'apartment', label: 'Chung cư' },
  { value: 'land', label: 'Đất nền' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'shophouse', label: 'Shophouse' },
  { value: 'condotel', label: 'Condotel' },
]

type FormState = {
  name: string
  investorId: string
  address: string
  provinceCode: string
  propertyTypes: string[]
  totalArea: string
  totalUnits: string
  priceFrom: string
  priceTo: string
  startDate: string
  completionDate: string
  status: ProjectStatus
  saleStatus: ProjectSaleStatus
  isFeatured: boolean
  videoUrl: string
}

function toForm(p: ProjectItem): FormState {
  const inv = typeof p.investor === 'object' ? p.investor : null
  return {
    name: p.name ?? '',
    investorId: inv?.id?.toString() ?? '',
    address: p.address ?? '',
    provinceCode: p.provinceCode ?? '',
    propertyTypes: p.propertyTypes ?? [],
    totalArea: p.totalArea?.toString() ?? '',
    totalUnits: p.totalUnits?.toString() ?? '',
    priceFrom: p.priceFrom?.toString() ?? '',
    priceTo: p.priceTo?.toString() ?? '',
    startDate: p.startDate ? p.startDate.slice(0, 10) : '',
    completionDate: p.completionDate ? p.completionDate.slice(0, 10) : '',
    status: (p.status as ProjectStatus) ?? 'draft',
    saleStatus: (p.saleStatus as ProjectSaleStatus) ?? 'active',
    isFeatured: p.isFeatured ?? false,
    videoUrl: p.videoUrl ?? '',
  }
}

const emptyForm = (): FormState => ({
  name: '',
  investorId: '',
  address: '',
  provinceCode: '',
  propertyTypes: [],
  totalArea: '',
  totalUnits: '',
  priceFrom: '',
  priceTo: '',
  startDate: '',
  completionDate: '',
  status: 'draft',
  saleStatus: 'active',
  isFeatured: false,
  videoUrl: '',
})

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

type Props = {
  project: ProjectItem | null
  investors: InvestorOption[]
  onClose: () => void
  onSaved: () => void
}

type TabKey = 'basic' | 'location' | 'manage' | 'media'

export default function ProjectFormDrawer({ project, investors, onClose, onSaved }: Props) {
  const isEdit = !!project?.id
  const [form, setForm] = useState<FormState>(() => project ? toForm(project) : emptyForm())
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingThumb = typeof project?.thumbnail === 'object' ? project?.thumbnail : null
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingThumb?.url ?? null)
  const [thumbnailId, setThumbnailId] = useState<number | null>(existingThumb?.id ?? null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const togglePropertyType = (val: string) => {
    set('propertyTypes', form.propertyTypes.includes(val)
      ? form.propertyTypes.filter((t) => t !== val)
      : [...form.propertyTypes, val]
    )
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    setError(null)
    try {
      const media = await uploadMedia(file, form.name || file.name)
      if (!media.id) throw new Error('Không lấy được ID ảnh')
      setThumbnailId(media.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi upload')
      setPreviewUrl(existingThumb?.url ?? null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('Tên dự án không được để trống')
    setError(null)
    startTransition(async () => {
      try {
        await saveProject(project?.id ?? null, {
          name: form.name.trim(),
          investorId: form.investorId ? Number(form.investorId) : null,
          address: form.address || undefined,
          provinceCode: form.provinceCode || undefined,
          propertyTypes: form.propertyTypes,
          totalArea: form.totalArea ? Number(form.totalArea) : undefined,
          totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined,
          priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined,
          priceTo: form.priceTo ? Number(form.priceTo) : undefined,
          startDate: form.startDate || undefined,
          completionDate: form.completionDate || undefined,
          status: form.status,
          saleStatus: form.saleStatus,
          isFeatured: form.isFeatured,
          thumbnailId: thumbnailId,
          videoUrl: form.videoUrl || undefined,
        })
        onSaved()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Lỗi khi lưu')
      }
    })
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: 'Cơ bản' },
    { key: 'location', label: 'Vị trí' },
    { key: 'manage', label: 'Quản lý' },
    { key: 'media', label: 'Media' },
  ]

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
            {isEdit ? `Chỉnh sửa — ${project.name}` : 'Thêm dự án mới'}
          </h2>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* === TAB: CƠ BẢN === */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên dự án <span className="text-rose-500">*</span>
                </label>
                <input className={inputCls} value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="VD: Khu đô thị Vinhomes Grand Park" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đầu tư</label>
                <select className={inputCls} value={form.investorId}
                  onChange={(e) => set('investorId', e.target.value)}>
                  <option value="">— Chọn chủ đầu tư —</option>
                  {investors.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Loại hình BĐS</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => togglePropertyType(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.propertyTypes.includes(t.value)
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổng diện tích (ha)</label>
                  <input type="number" min={0} className={inputCls} value={form.totalArea}
                    onChange={(e) => set('totalArea', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổng số căn/lô</label>
                  <input type="number" min={0} className={inputCls} value={form.totalUnits}
                    onChange={(e) => set('totalUnits', e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá từ (triệu)</label>
                  <input type="number" min={0} className={inputCls} value={form.priceFrom}
                    onChange={(e) => set('priceFrom', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá đến (triệu)</label>
                  <input type="number" min={0} className={inputCls} value={form.priceTo}
                    onChange={(e) => set('priceTo', e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày khởi công</label>
                  <input type="date" className={inputCls} value={form.startDate}
                    onChange={(e) => set('startDate', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bàn giao</label>
                  <input type="date" className={inputCls} value={form.completionDate}
                    onChange={(e) => set('completionDate', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* === TAB: VỊ TRÍ === */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <input className={inputCls} value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="VD: Đường Nguyễn Văn Linh, Q.7, TP.HCM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã tỉnh/thành</label>
                <input className={inputCls} value={form.provinceCode}
                  onChange={(e) => set('provinceCode', e.target.value)}
                  placeholder="VD: 79 (TP.HCM)" />
              </div>
            </div>
          )}

          {/* === TAB: QUẢN LÝ === */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái hiển thị</label>
                <select className={inputCls} value={form.status}
                  onChange={(e) => set('status', e.target.value as ProjectStatus)}>
                  <option value="draft">Nháp</option>
                  <option value="active">Đang hiển thị</option>
                  <option value="hidden">Tạm ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái mở bán</label>
                <select className={inputCls} value={form.saleStatus}
                  onChange={(e) => set('saleStatus', e.target.value as ProjectSaleStatus)}>
                  <option value="active">Đang mở bán</option>
                  <option value="upcoming">Sắp mở bán</option>
                  <option value="completed">Đã bàn giao</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-slate-700">Hiển thị nổi bật ở trang chủ</span>
              </label>
            </div>
          )}

          {/* === TAB: MEDIA === */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh đại diện</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors group"
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
                      <span className="material-symbols-outlined text-slate-300 text-[40px]">add_photo_alternate</span>
                      <p className="text-xs text-slate-500 mt-1">Click để chọn ảnh</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-500 text-[32px] animate-spin">progress_activity</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link YouTube</label>
                <input className={inputCls} value={form.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Để quản lý thêm ảnh thư viện, phân khu và mô tả chi tiết — vui lòng dùng{' '}
                  <a href="/admin/collections/projects" target="_blank" className="underline font-medium">Payload Admin</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex gap-2 shrink-0">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={pending || uploading}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {(pending || uploading) && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo dự án'}
          </button>
        </footer>
      </aside>
    </div>
  )
}
