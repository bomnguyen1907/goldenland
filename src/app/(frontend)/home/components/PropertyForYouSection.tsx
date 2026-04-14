'use client'
import type { Listing } from '@/payload-types'
import { fetchNewListings } from '@/app/services/listings'
import { useEffect, useState } from 'react'

type PropertyItem = {
  id: number
  title: string
  price: string
  area: string
  location: string
  image: string
  imageAlt: string
}

const PAGE_SIZE = 8
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80'

function hasUrl(value: unknown): value is { url?: string | null } {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatPrice(listing: Listing): string {
  if (listing.priceUnit === 'negotiable') {
    return 'Thỏa thuận'
  }

  const amount =
    listing.price >= 1000 ? `${(listing.price / 1000).toFixed(1)} tỷ` : `${listing.price} triệu`

  if (listing.priceUnit === 'per_month') {
    return `${amount}/tháng`
  }

  if (listing.priceUnit === 'per_m2') {
    return `${amount}/m²`
  }

  return amount
}

function mapListingToProperty(listing: Listing): PropertyItem {
  const firstImage = listing.images?.[0]?.image
  const image = hasUrl(firstImage) && firstImage.url ? firstImage.url : FALLBACK_IMAGE

  return {
    id: listing.id,
    title: listing.title,
    price: formatPrice(listing),
    area: listing.area ? `${listing.area} m²` : 'Đang cập nhật',
    location: listing.address ?? 'Đang cập nhật',
    image,
    imageAlt: listing.title,
  }
}

export function PropertyForYouSection() {
  const [properties, setProperties] = useState<PropertyItem[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    const loadInitialListings = async () => {
      try {
        const response = await fetchNewListings({ limit: PAGE_SIZE, page: 1 })

        setProperties(response.data.map(mapListingToProperty))
        setCurrentPage(response.page)
        setHasMore(response.hasMore)
      } catch (error) {
        console.error('Fetch new listings failed:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    void loadInitialListings()
  }, [])

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) {
      return
    }

    setIsLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      const response = await fetchNewListings({ limit: PAGE_SIZE, page: nextPage })

      setProperties((previous) => [...previous, ...response.data.map(mapListingToProperty)])
      setCurrentPage(response.page)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error('Load more listings failed:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-8 pb-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <h2 className="font-lexend text-3xl font-bold uppercase tracking-tighter text-on-surface">
          Bất động sản dành cho bạn
        </h2>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-4 text-sm font-medium md:flex">
            <a className="text-secondary transition-colors hover:text-primary" href="#">
              Tin nhà đất bán mới nhất
            </a>
            <span className="text-outline-variant">|</span>
            <a className="text-secondary transition-colors hover:text-primary" href="#">
              Tin nhà đất cho thuê mới nhất
            </a>
          </div>
        </div>
      </div>

      {isInitialLoading && (
        <div className="py-10 text-center text-secondary">Đang tải danh sách bất động sản...</div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="group cursor-pointer overflow-hidden rounded-lg border border-outline-variant/20 bg-white transition-all hover:shadow-xl"
          >
            <div className="relative h-[208px] min-h-[208px] max-h-[208px] overflow-hidden">
              <img
                alt={property.imageAlt}
                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={property.image}
              />
            </div>

            <div className="flex h-[180px] flex-col justify-between p-4">
              <div>
                <h4 className="font-lexend mb-2 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] font-bold text-on-surface transition-colors group-hover:text-primary">
                  {property.title}
                </h4>

                <div className="font-lexend text-lg font-bold text-primary">
                  {property.price}
                  <span className="mx-1 font-normal text-secondary">·</span>
                  {property.area}
                </div>

                <div className="mt-2 flex min-w-0 items-center gap-1 text-sm text-secondary">
                  <span className="material-symbols-outlined shrink-0 text-base">location_on</span>
                  <span className="min-w-0 flex-1 truncate">{property.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="text-xs italic text-secondary">Đăng hôm nay</span>

                <button
                  aria-label={`Thêm ${property.title} vào mục yêu thích`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 transition-colors hover:border-primary hover:bg-primary/10"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg text-secondary hover:text-primary">
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isInitialLoading && properties.length === 0 && (
        <div className="py-10 text-center text-secondary">Hiện chưa có bất động sản nào.</div>
      )}

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleLoadMore}
          disabled={isInitialLoading || isLoadingMore || !hasMore}
          className="rounded-full border border-outline px-6 py-2 font-semibold text-on-surface transition-all hover:border-primary hover:bg-primary hover:text-white"
          type="button"
        >
          {isLoadingMore ? 'Đang tải...' : hasMore ? 'Xem thêm' : 'Đã hiển thị hết'}
        </button>
      </div>
    </section>
  )
}
