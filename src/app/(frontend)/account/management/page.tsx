'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectUser } from '@/app/store/slices/authSlice'
import type { RootState } from '@/app/store'
import Link from 'next/link'
import { Suspense } from 'react'
import qs from 'qs'

type Property = {
  id: number
  title: string
  price: number
  priceUnit: string
  address?: string
  status: string
  listingType: string
  propertyType: string
  area?: number
  createdAt: string
  images?: { image: string; sort: number }[]
}

type Stats = {
  active: number
  pending: number
  drafts: number
  expired: number
  sold: number
  total: number
}

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'draft', label: 'Nháp' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'sold', label: 'Đã bán' },
]

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
  sold: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hiển thị',
  pending: 'Chờ duyệt',
  draft: 'Nháp',
  expired: 'Hết hạn',
  sold: 'Đã bán',
  rejected: 'Bị từ chối',
}

const PRICE_UNIT: Record<string, string> = {
  total: '', per_m2: '/m²', per_month: '/tháng', negotiable: '',
}

function formatPrice(price: number, unit: string): string {
  if (unit === 'negotiable') return 'Thỏa thuận'
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(2)} tỷ${PRICE_UNIT[unit] || ''}`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu${PRICE_UNIT[unit] || ''}`
  return `${price.toLocaleString('vi-VN')} đ`
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function ManagementInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => selectUser(state as any))

  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [activeStatus, setActiveStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const justPosted = searchParams.get('posted') === '1'

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/my/dashboard')
      const data = await res.json()
      setStats(data.properties)
    } catch {}
  }, [])

  const loadProperties = useCallback(async (status: string, p: number) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const where: any = { user: { equals: user.id } }
      if (status) where.status = { equals: status }

      const query = qs.stringify(
        { where, sort: '-createdAt', limit: 10, page: p, depth: 0 },
        { encodeValuesOnly: true },
      )
      const res = await fetch(`/api/properties?${query}`)
      const data = await res.json()
      setProperties(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadProperties(activeStatus, page)
  }, [activeStatus, page, loadProperties])

  const handleStatusTab = (status: string) => {
    setActiveStatus(status)
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tin này không?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      setProperties((prev) => prev.filter((p) => p.id !== id))
      loadStats()
    } catch {}
    setDeletingId(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-2">
      {justPosted && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
          <span>Tin đăng của bạn đã được gửi, đang chờ kiểm duyệt.</span>
          <button onClick={() => router.replace('/account/management')} className="text-emerald-500 hover:text-emerald-700 ml-4">×</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Quản lý tin đăng</h1>
        <Link
          href="/dang-tin"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Đăng tin mới
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <StatCard label="Đang hiển thị" value={stats.active} color="text-emerald-600" />
          <StatCard label="Chờ duyệt" value={stats.pending} color="text-yellow-600" />
          <StatCard label="Nháp" value={stats.drafts} color="text-gray-500" />
          <StatCard label="Hết hạn" value={stats.expired} color="text-red-500" />
          <StatCard label="Đã bán" value={stats.sold} color="text-blue-600" />
        </div>
      )}

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeStatus === tab.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-4">
              <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🏠</div>
          <p className="font-medium">Chưa có tin đăng nào</p>
          <Link href="/dang-tin" className="mt-3 inline-block text-sm text-emerald-600 hover:underline">
            Đăng tin ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.images?.[0]?.image ? (
                  <img src={p.images[0].image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{p.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </div>
                <p className="text-emerald-600 font-bold text-sm mt-0.5">
                  {formatPrice(p.price, p.priceUnit)}
                </p>
                {p.address && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {p.address}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link
                  href={`/account/management/${p.id}/edit`}
                  className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {deletingId === p.id ? '...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                page === i + 1
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ManagementPage() {
  return (
    <Suspense>
      <ManagementInner />
    </Suspense>
  )
}
