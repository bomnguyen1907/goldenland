'use client'

import { useState, useEffect } from 'react'
import type { Property } from '@/payload-types'
import { fetchNewProperties } from '@/app/services/properties'
import { PropertyCard } from './components/PropertyCard'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true)
      try {
        const response = await fetchNewProperties({ limit: 10, page: 1 })
        setProperties(response.data)
        setTotalDocs(response.totalDocs)
        setHasMore(response.hasMore)
        setPage(1)
      } catch (error) {
        console.error('Failed to fetch properties:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProperties()
  }, [])

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return
    setIsLoading(true)
    try {
      const nextPage = page + 1
      const response = await fetchNewProperties({ limit: 10, page: nextPage })
      setProperties((prev) => [...prev, ...response.data])
      setPage(nextPage)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error('Failed to load more properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="pt-24 pb-16 max-w-screen-2xl mx-auto px-8">
      {/* Breadcrumbs & Header */}
      <section className="mb-8">
        <nav className="flex text-xs text-secondary gap-2 mb-4 font-body">
          <a href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </a>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-on-surface">Bán nhà đất trên toàn quốc</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-lexend tracking-tight text-on-surface">
              Bán nhà đất trên toàn quốc
            </h1>
            <p className="text-sm text-secondary mt-1">
              Hiện có{' '}
              <span className="font-bold text-on-surface">{totalDocs.toLocaleString()}</span> tin
              đăng nhà đất
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-outline-variant/30 px-4 py-2 rounded-lg text-sm hover:bg-surface-container transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">history_edu</span>
              Biến động giá
            </button>
            <button className="flex items-center gap-2 bg-white border border-outline-variant/30 px-4 py-2 rounded-lg text-sm hover:bg-surface-container transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">map</span>
              Xem bản đồ
            </button>
          </div>
        </div>
      </section>

      {/* Filter Bar - Simplified for now */}
      <section className="bg-white shadow-[0px_12px_32px_rgba(27,28,28,0.06)] rounded-xl p-2 mb-10 sticky top-20 z-40 border border-outline-variant/10">
        <div className="flex flex-col gap-4 p-2">
          <div className="flex gap-3">
            <div className="flex-1 relative flex items-center bg-white border border-outline-variant/50 rounded-lg overflow-hidden h-14">
              <span className="material-symbols-outlined absolute left-4 text-secondary">
                search
              </span>
              <input
                className="w-full h-full pl-12 pr-32 border-none focus:ring-0 text-on-surface"
                placeholder="Tìm kiếm nhà đất..."
                type="text"
              />
              <button className="absolute right-2 bg-primary text-white px-6 py-2 rounded font-bold text-sm hover:opacity-90">
                Tìm kiếm
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-medium text-on-surface bg-white hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">tune</span>
              Lọc
            </button>
            <div className="flex items-center gap-3 px-4 py-2 border border-outline-variant/50 rounded-lg bg-white">
              <span className="flex items-center gap-1 text-sm font-medium text-secondary">
                <span
                  className="material-symbols-outlined text-green-600 text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                Tin xác thực
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-9 h-5 bg-zinc-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {['Loại nhà đất', 'Khoảng giá', 'Diện tích'].map((label) => (
              <button
                key={label}
                className="flex items-center gap-4 px-4 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface bg-white hover:bg-surface-container-low transition-colors"
              >
                {label}{' '}
                <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-6 border-b border-outline-variant/30 text-sm font-medium">
              <button className="pb-3 border-b-2 border-primary text-primary">Thông thường</button>
              <button className="pb-3 text-secondary hover:text-on-surface transition-colors">
                Mới nhất
              </button>
              <button className="pb-3 text-secondary hover:text-on-surface transition-colors">
                Giá thấp đến cao
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded bg-surface-container-high text-on-surface">
                <span className="material-symbols-outlined">view_list</span>
              </button>
              <button className="p-2 rounded hover:bg-surface-container text-secondary transition-colors">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-secondary text-sm">Đang tải...</p>
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Space */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
            <h3 className="font-lexend font-bold text-lg mb-4">Lọc theo khu vực</h3>
            <div className="space-y-3">
              {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai'].map((city) => (
                <div
                  key={city}
                  className="flex justify-between items-center text-sm text-secondary hover:text-primary cursor-pointer transition-colors"
                >
                  <span>{city}</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h3 className="font-lexend font-bold text-lg text-primary mb-2">Đăng tin ngay</h3>
            <p className="text-sm text-secondary mb-4">
              Tiếp cận hàng triệu khách hàng tiềm năng một cách nhanh chóng.
            </p>
            <a
              href="/dang-tin"
              className="block w-full py-3 bg-primary text-white text-center font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Đăng tin miễn phí
            </a>
          </div>
        </aside>
      </div>
    </main>
  )
}
