'use client'

import { useEffect, useRef, useTransition, useState } from 'react'
import { formatVND, formatDateTime } from '../../../lib/format'
import { updateOrderStatus, type OrderStatus } from '../actions'
import type { OrderItem } from './OrdersTable'

type Props = {
  order: OrderItem
  onClose: () => void
  onUpdated: () => void
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

const orderTypeLabels: Record<string, string> = {
  package: 'Mua gói đăng tin',
  single_post: 'Đăng tin lẻ',
  top_up: 'Nạp tiền ví',
}

const paymentMethodLabels: Record<string, string> = {
  balance: 'Số dư tài khoản',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
}

function Row({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 shrink-0 w-40">{label}</span>
      <span className={`text-sm text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>
        {value ?? '-'}
      </span>
    </div>
  )
}

export default function OrderDetailDrawer({ order, onClose, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition()
  const [adminNote, setAdminNote] = useState(order.adminNote || '')
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<OrderStatus | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const user = typeof order.user === 'object' ? order.user : null
  const pkg = typeof order.package === 'object' ? order.package : null
  const pp = typeof order.postingPrice === 'object' ? order.postingPrice : null
  const property = typeof order.property === 'object' ? order.property : null
  const voucher = typeof order.voucher === 'object' ? order.voucher : null
  const promotion = typeof order.promotion === 'object' ? order.promotion : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmAction) setConfirmAction(null)
        else onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, confirmAction])

  const handleStatus = (status: OrderStatus) => {
    setError(null)
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, status, adminNote || undefined)
        onUpdated()
      } catch (e: any) {
        setError(e?.message || 'Lỗi khi cập nhật')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-slate-400 shrink-0">receipt_long</span>
            <p className="font-mono text-sm font-semibold text-slate-800 truncate">{order.orderCode}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusBadge(order.status)}`}>
              {statusLabels[order.status ?? ''] ?? order.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500 shrink-0 ml-2">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Thông tin đơn */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Thông tin đơn hàng</p>
            <div className="bg-slate-50 rounded-lg px-4">
              <Row label="Loại đơn" value={orderTypeLabels[order.orderType ?? ''] ?? order.orderType} />
              <Row label="Ngày tạo" value={formatDateTime(order.createdAt)} />
              {order.paidAt && <Row label="Ngày thanh toán" value={formatDateTime(order.paidAt)} />}
              {order.paymentRef && <Row label="Mã giao dịch" value={order.paymentRef} mono />}
              <Row label="Phương thức" value={paymentMethodLabels[order.paymentMethod ?? ''] ?? order.paymentMethod} />
            </div>
          </div>

          {/* Khách hàng */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Khách hàng</p>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{user?.fullName || '-'}</p>
                <p className="text-xs text-slate-500">{user?.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Dịch vụ</p>
            <div className="bg-slate-50 rounded-lg px-4">
              {pkg && <Row label="Gói đăng tin" value={pkg.name} />}
              {pp && <Row label="Loại tin" value={pp.name} />}
              {property && <Row label="Tin đăng" value={property.title} />}
              {voucher && <Row label="Voucher" value={(voucher as any).code} />}
              {promotion && <Row label="Khuyến mãi" value={(promotion as any).name} />}
              {!pkg && !pp && <Row label="Loại" value={orderTypeLabels[order.orderType ?? ''] ?? '-'} />}
            </div>
          </div>

          {/* Tài chính */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Chi tiết thanh toán</p>
            <div className="bg-slate-50 rounded-lg px-4">
              <Row label="Giá gốc" value={formatVND(order.originalAmount)} />
              {(order.discountAmount || 0) > 0 && (
                <Row label="Giảm voucher" value={`- ${formatVND(order.discountAmount)}`} />
              )}
              {(order.promotionDiscount || 0) > 0 && (
                <Row label="Giảm khuyến mãi" value={`- ${formatVND(order.promotionDiscount)}`} />
              )}
              <div className="flex items-center justify-between py-2 mt-1">
                <span className="text-sm font-semibold text-slate-700">Thành tiền</span>
                <span className="text-base font-bold text-emerald-600">{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Ghi chú nội bộ
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Ghi chú xử lý (chỉ admin thấy)..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {/* Confirm dialog */}
          {confirmAction && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 mb-3">
                {confirmAction === 'cancelled' && 'Huỷ đơn hàng này?'}
                {confirmAction === 'refunded' && 'Xác nhận hoàn tiền cho đơn này?'}
                {confirmAction === 'paid' && 'Đánh dấu đơn hàng này là đã thanh toán?'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { handleStatus(confirmAction); setConfirmAction(null) }}
                  disabled={isPending}
                  className="flex-1 px-3 py-1.5 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 text-sm font-medium hover:bg-white"
                >
                  Huỷ bỏ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!confirmAction && (
          <div className="border-t border-slate-200 px-5 py-4 flex flex-wrap gap-2">
            {/* Lưu ghi chú */}
            <button
              onClick={() => handleStatus(order.status as OrderStatus)}
              disabled={isPending || adminNote === (order.adminNote || '')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Lưu ghi chú
            </button>

            {order.status === 'paid' && (
              <button
                onClick={() => setConfirmAction('refunded')}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 text-sm font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors"
              >
                Hoàn tiền cho khách
              </button>
            )}

            {order.status === 'pending' && (
              <button
                onClick={() => setConfirmAction('cancelled')}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Huỷ đơn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}