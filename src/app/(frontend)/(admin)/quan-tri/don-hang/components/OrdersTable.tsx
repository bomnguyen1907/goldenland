'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { formatVND, formatDateTime, relativeTime } from '../../../lib/format'
import OrderDetailDrawer from './OrderDetailDrawer'

export type OrderItem = {
  id: string | number
  orderCode?: string
  orderType?: string
  status?: string
  totalAmount?: number
  originalAmount?: number
  discountAmount?: number
  promotionDiscount?: number
  paymentMethod?: string
  paymentRef?: string
  adminNote?: string
  paidAt?: string
  createdAt?: string
  user?: { id?: string | number; fullName?: string; email?: string } | null
  package?: { id?: string | number; name?: string } | null
  postingPrice?: { id?: string | number; name?: string } | null
  property?: { id?: string | number; title?: string } | null
  voucher?: { id?: string | number; code?: string } | null
  promotion?: { id?: string | number; name?: string } | null
}

type Props = {
  items: OrderItem[]
  page: number
  totalPages: number
  totalDocs: number
  currentStatus: string
  currentOrderType: string
  currentRange: string
}

const orderTypeLabels: Record<string, string> = {
  package: 'Mua gói',
  single_post: 'Đăng lẻ',
  top_up: 'Nạp tiền',
}

const orderTypeBadge: Record<string, string> = {
  package: 'bg-violet-100 text-violet-700',
  single_post: 'bg-blue-100 text-blue-700',
  top_up: 'bg-emerald-100 text-emerald-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã huỷ',
  refunded: 'Hoàn tiền',
}

function statusBadge(status?: string) {
  switch (status) {
    case 'paid': return 'bg-emerald-100 text-emerald-700'
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'cancelled': return 'bg-slate-100 text-slate-500'
    case 'refunded': return 'bg-rose-100 text-rose-700'
    default: return 'bg-slate-100 text-slate-500'
  }
}

const paymentMethodLabels: Record<string, string> = {
  balance: 'Số dư',
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
}

const rangeOptions = [
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
  { value: 'all', label: 'Tất cả' },
]

const orderTypeOptions = [
  { value: '', label: 'Tất cả loại' },
  { value: 'package', label: 'Mua gói' },
  { value: 'single_post', label: 'Đăng lẻ' },
  { value: 'top_up', label: 'Nạp tiền' },
]

export default function OrdersTable({
  items, page, totalPages, totalDocs,
  currentStatus, currentOrderType, currentRange,
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [detailId, setDetailId] = useState<string | number | null>(null)

  const detailItem = detailId !== null ? items.find((i) => String(i.id) === String(detailId)) ?? null : null

  const goToPage = (p: number) => {
    const next = new URLSearchParams(sp?.toString() || '')
    next.set('page', String(p))
    router.push(`/quan-tri/don-hang?${next.toString()}`)
  }

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(sp?.toString() || '')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/quan-tri/don-hang?${next.toString()}`)
  }

  return (
    <>
      <div className="space-y-3">
        {/* Sub-filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={currentOrderType}
            onChange={(e) => updateFilter('orderType', e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {orderTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {rangeOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => updateFilter('range', o.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  currentRange === o.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            <p className="mt-2 text-slate-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã đơn</th>
                    <th className="px-4 py-3 text-left">Loại</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-left">Gói / Dịch vụ</th>
                    <th className="px-4 py-3 text-left">Thanh toán</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Thời gian</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((o) => {
                    const user = typeof o.user === 'object' ? o.user : null
                    const pkg = typeof o.package === 'object' ? o.package : null
                    const pp = typeof o.postingPrice === 'object' ? o.postingPrice : null
                    const serviceName = pkg?.name ?? pp?.name ?? (o.orderType === 'top_up' ? 'Nạp tiền ví' : '-')
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setDetailId(o.id)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-medium text-slate-800">{o.orderCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${orderTypeBadge[o.orderType ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
                            {orderTypeLabels[o.orderType ?? ''] ?? o.orderType}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-slate-800 line-clamp-1">{user?.fullName || '-'}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{user?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <p className="text-slate-700 line-clamp-1 text-xs">{serviceName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {paymentMethodLabels[o.paymentMethod ?? ''] ?? o.paymentMethod ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatVND(o.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(o.status)}`}>
                            {statusLabels[o.status ?? ''] ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          <div>{relativeTime(o.paidAt ?? o.createdAt)}</div>
                          <div className="text-slate-400">{formatDateTime(o.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDetailId(o.id)}
                            className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                          >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
              <span className="text-slate-500">
                Trang {page} / {totalPages} • {totalDocs.toLocaleString('vi-VN')} đơn
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailItem && (
        <OrderDetailDrawer
          order={detailItem}
          onClose={() => setDetailId(null)}
          onUpdated={() => {
            setDetailId(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}