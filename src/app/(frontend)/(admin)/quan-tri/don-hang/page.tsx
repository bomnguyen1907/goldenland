import { getPayload } from 'payload'
import config from '@/payload.config'
import { formatCompactVND } from '../../lib/format'
import OrdersTable from './components/OrdersTable'

export const dynamic = 'force-dynamic'

const STATUS_OPTIONS = ['paid', 'cancelled', 'refunded'] as const
const ORDER_TYPE_OPTIONS = ['package', 'single_post', 'top_up'] as const

const statusLabels: Record<string, string> = {
  paid: 'Đã thanh toán',
  cancelled: 'Đã huỷ',
  refunded: 'Hoàn tiền',
}

type SearchParams = Record<string, string | string[] | undefined>
function pickStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function DonHangPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const status = pickStr(sp.status) || ''
  const orderType = pickStr(sp.orderType) || ''
  const range = pickStr(sp.range) || '30'
  const page = Math.max(1, parseInt(pickStr(sp.page) || '1', 10))
  const limit = 20

  const payload = await getPayload({ config: await config })

  const since = range !== 'all'
    ? new Date(Date.now() - (parseInt(range, 10) || 30) * 86_400_000).toISOString()
    : null

  const whereAnd: any[] = []
  if (STATUS_OPTIONS.includes(status as any)) {
    whereAnd.push({ status: { equals: status } })
  }
  if (ORDER_TYPE_OPTIONS.includes(orderType as any)) {
    whereAnd.push({ orderType: { equals: orderType } })
  }
  if (since) {
    whereAnd.push({ createdAt: { greater_than_equal: since } })
  }

  const [result, paidTotal, refundedCount] = await Promise.all([
    payload.find({
      collection: 'orders',
      where: whereAnd.length ? { and: whereAnd } : {},
      sort: '-createdAt',
      page,
      limit,
      depth: 2,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'paid' } },
          ...(since ? [{ createdAt: { greater_than_equal: since } }] : []),
        ],
      },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    }),
    payload.count({
      collection: 'orders',
      where: { status: { equals: 'refunded' } },
      overrideAccess: true,
    }),
  ])

  const totalRevenue = paidTotal.docs.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0)
  const rangeLabel = range === 'all' ? 'tất cả' : `${range} ngày qua`

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
        <p className="text-sm text-slate-500 mt-1">
          {result.totalDocs.toLocaleString('vi-VN')} đơn theo bộ lọc hiện tại
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Doanh thu ({rangeLabel})</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCompactVND(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{paidTotal.totalDocs} đơn thành công</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Hoàn tiền</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{refundedCount.totalDocs}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tổng tất cả thời gian</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng đơn (bộ lọc)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{result.totalDocs.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {status ? statusLabels[status] : 'Tất cả trạng thái'}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {([['', 'Tất cả'], ['paid', 'Đã thanh toán'], ['cancelled', 'Đã huỷ'], ['refunded', 'Hoàn tiền']] as const).map(([val, label]) => {
          const active = status === val
          const params = new URLSearchParams()
          if (val) params.set('status', val)
          if (orderType) params.set('orderType', orderType)
          if (range !== '30') params.set('range', range)
          return (
            <a
              key={val}
              href={`/quan-tri/don-hang?${params.toString()}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      <OrdersTable
        items={result.docs as any[]}
        page={result.page ?? 1}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        currentStatus={status}
        currentOrderType={orderType}
        currentRange={range}
      />
    </div>
  )
}