import { getPayload } from 'payload'
import config from '@/payload.config'
import ProjectsTable from './components/ProjectsTable'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>
function pickStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function DuAnPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const status = pickStr(sp.status) || ''
  const saleStatus = pickStr(sp.saleStatus) || ''
  const q = pickStr(sp.q)?.trim() || ''
  const page = Math.max(1, parseInt(pickStr(sp.page) || '1', 10))
  const limit = 20

  const payload = await getPayload({ config: await config })

  const whereAnd: any[] = []
  if (status) whereAnd.push({ status: { equals: status } })
  if (saleStatus) whereAnd.push({ saleStatus: { equals: saleStatus } })
  if (q) whereAnd.push({ name: { like: q } })

  const [result, totalCount, activeCount, featuredCount, investors] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: whereAnd.length ? { and: whereAnd } : {},
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    }),
    payload.count({ collection: 'projects', overrideAccess: true }),
    payload.count({ collection: 'projects', where: { status: { equals: 'active' } }, overrideAccess: true }),
    payload.count({ collection: 'projects', where: { isFeatured: { equals: true } }, overrideAccess: true }),
    payload.find({ collection: 'investors', limit: 200, depth: 0, overrideAccess: true }),
  ])

  const totalViews = (result.docs as any[]).reduce((sum, p) => sum + (p.views || 0), 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dự án</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý dự án bất động sản</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng dự án</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tất cả trạng thái</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đang hiển thị</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">{totalCount.totalDocs - activeCount.totalDocs} đang ẩn</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Nổi bật</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{featuredCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">Hiển thị trang chủ</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Lượt xem</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{totalViews.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Trang hiện tại</p>
        </div>
      </div>

      <ProjectsTable
        items={result.docs as any[]}
        page={result.page ?? 1}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        currentQ={q}
        currentStatus={status}
        currentSaleStatus={saleStatus}
        investors={investors.docs as any[]}
      />
    </div>
  )
}