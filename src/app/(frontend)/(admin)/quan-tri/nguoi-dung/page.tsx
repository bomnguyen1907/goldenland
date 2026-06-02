import { getPayload } from 'payload'
import config from '@/payload.config'
import UsersTable from './components/UsersTable'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>
function pickStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function NguoiDungPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const q = pickStr(sp.q)?.trim() || ''
  const role = pickStr(sp.role) || ''
  const status = pickStr(sp.status) || ''
  const page = Math.max(1, parseInt(pickStr(sp.page) || '1', 10))
  const limit = 20

  const payload = await getPayload({ config: await config })

  const whereAnd: any[] = []
  if (role === 'admin' || role === 'user') {
    whereAnd.push({ role: { equals: role } })
  }
  if (status === 'active') whereAnd.push({ isActive: { equals: true } })
  if (status === 'inactive') whereAnd.push({ isActive: { equals: false } })
  if (status === 'unverified') whereAnd.push({ isVerified: { equals: false } })
  if (q) {
    whereAnd.push({
      or: [
        { fullName: { like: q } },
        { email: { like: q } },
        { phone: { like: q } },
      ],
    })
  }

  const [result, totalCount, inactiveCount] = await Promise.all([
    payload.find({
      collection: 'users',
      where: whereAnd.length ? { and: whereAnd } : {},
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    }),
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'users', where: { isActive: { equals: false } }, overrideAccess: true }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Người dùng</h1>
        <p className="text-sm text-slate-500 mt-1">
          {result.totalDocs.toLocaleString('vi-VN')} người dùng theo bộ lọc
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount.totalDocs.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tất cả tài khoản</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {(totalCount.totalDocs - inactiveCount.totalDocs).toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{inactiveCount.totalDocs} bị khoá</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Kết quả tìm kiếm</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{result.totalDocs.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{q ? `"${q}"` : 'Bộ lọc hiện tại'}</p>
        </div>
      </div>

      <UsersTable
        items={result.docs as any[]}
        page={result.page ?? 1}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        currentQ={q}
        currentRole={role}
        currentStatus={status}
      />
    </div>
  )
}