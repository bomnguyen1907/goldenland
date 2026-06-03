import { getPayload } from 'payload'
import config from '@/payload.config'
import BannersSection from './components/BannersSection'

export const dynamic = 'force-dynamic'

export default async function BannerPage() {
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'banners',
    sort: 'sort',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  const banners = result.docs
  const now = new Date()

  const activeCount = banners.filter((b) => b.isActive).length
  const expiredCount = banners.filter((b) => {
    if (!b.isActive) return false
    if (!b.endDate) return false
    return new Date(b.endDate) < now
  }).length
  const soonExpireCount = banners.filter((b) => {
    if (!b.isActive || !b.endDate) return false
    const end = new Date(b.endDate)
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Banner</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý banner quảng cáo theo từng vị trí</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng banner</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{banners.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tất cả vị trí</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đang hiển thị</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">{banners.length - activeCount} đang tắt</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Sắp hết hạn</p>
          <p className={`text-2xl font-bold mt-1 ${soonExpireCount > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
            {soonExpireCount}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Trong 7 ngày tới</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đã hết hạn</p>
          <p className={`text-2xl font-bold mt-1 ${expiredCount > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
            {expiredCount}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Đang bật nhưng quá hạn</p>
        </div>
      </div>

      <BannersSection banners={banners as any[]} />
    </div>
  )
}