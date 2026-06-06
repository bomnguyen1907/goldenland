import { getPayload } from 'payload'
import config from '@/payload.config'
import ArticlesTable from './components/ArticlesTable'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>
function pickStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function BaiVietPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const status = pickStr(sp.status) || ''
  const categoryId = pickStr(sp.category) || ''
  const q = pickStr(sp.q)?.trim() || ''
  const page = Math.max(1, parseInt(pickStr(sp.page) || '1', 10))
  const limit = 20

  const payload = await getPayload({ config: await config })

  const whereAnd: any[] = []
  if (status) whereAnd.push({ status: { equals: status } })
  if (categoryId) whereAnd.push({ category: { equals: Number(categoryId) } })
  if (q) whereAnd.push({ title: { like: q } })

  const [result, totalCount, publishedCount, featuredCount, categories, users] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: whereAnd.length ? { and: whereAnd } : {},
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    }),
    payload.count({ collection: 'articles', overrideAccess: true }),
    payload.count({ collection: 'articles', where: { status: { equals: 'published' } }, overrideAccess: true }),
    payload.count({ collection: 'articles', where: { isFeatured: { equals: true } }, overrideAccess: true }),
    payload.find({ collection: 'article-categories', sort: 'sort', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'users', limit: 200, depth: 0, overrideAccess: true }),
  ])

  const draftCount = totalCount.totalDocs - publishedCount.totalDocs

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bài viết</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý bài viết & tin tức</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng bài viết</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tất cả trạng thái</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đã xuất bản</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">{draftCount} chưa xuất bản</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Nổi bật</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{featuredCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">Hiển thị trang chủ</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Kết quả lọc</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{result.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">{q ? `"${q}"` : 'Bộ lọc hiện tại'}</p>
        </div>
      </div>

      <ArticlesTable
        items={result.docs as any[]}
        page={result.page ?? 1}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        currentQ={q}
        currentStatus={status}
        currentCategory={categoryId}
        categories={categories.docs as any[]}
        users={users.docs as any[]}
      />
    </div>
  )
}