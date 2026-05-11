'use client'

import type { Property } from '@/payload-types'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavoriteThunk, selectFavoriteIdSet } from '@/app/store/slices/favoritesSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { formatPrice, formatLocation, FALLBACK_IMAGE } from '../lib/utils'
import Link from 'next/link'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const favoriteIdSet = useSelector((state: RootState) => selectFavoriteIdSet(state))
  const isFavorite = favoriteIdSet.has(property.id)

  const firstImage = property.images?.[0]?.image
  const imageUrl = typeof firstImage === 'string' ? firstImage : FALLBACK_IMAGE

  const priceLabel = formatPrice(property)
  const locationLabel = formatLocation(property)
  const areaLabel = property.area ? `${property.area} m²` : 'Đang cập nhật'

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-64 md:h-[340px] flex gap-1 bg-zinc-100">
        <div className="w-2/3 h-full relative">
          <img alt={property.title} className="w-full h-full object-cover" src={imageUrl} />
          {property.postType === 'vip' && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <span className="material-symbols-outlined text-[12px]">award_star</span>
              Tin ưu tiên
            </div>
          )}
        </div>
        <div className="w-1/3 flex flex-col gap-1">
          {property.images?.slice(1, 3).map((img, idx) => (
            <div key={idx} className="h-1/2 relative">
              <img
                alt={`${property.title} ${idx + 2}`}
                className="w-full h-full object-cover"
                src={typeof img.image === 'string' ? img.image : FALLBACK_IMAGE}
              />
              {idx === 1 && (property.images?.length || 0) > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium text-sm">
                  +{(property.images?.length || 0) - 3} ảnh
                </div>
              )}
            </div>
          ))}
          {(!property.images || property.images.length < 2) && (
            <div className="h-full bg-zinc-200 animate-pulse" />
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-3">
          <Link
            href={`/properties/${property.id}`}
            className="group-hover:text-primary transition-colors"
          >
            <h3 className="text-lg font-bold font-lexend text-on-surface line-clamp-2 leading-snug">
              {property.title}
            </h3>
          </Link>
          <button
            onClick={() => dispatch(toggleFavoriteThunk(property.id))}
            className={`p-2 rounded-full hover:bg-surface-container transition-colors ${
              isFavorite ? 'text-primary' : 'text-secondary'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-primary font-bold font-lexend text-lg">{priceLabel}</div>
          <div className="text-primary font-bold font-lexend text-lg">{areaLabel}</div>
        </div>

        <div className="flex items-center gap-1 text-secondary text-sm mb-4">
          <span className="material-symbols-outlined text-lg shrink-0 text-secondary/70">
            location_on
          </span>
          <span className="truncate">{locationLabel}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-secondary">
              {typeof property.user === 'object'
                ? property.user.email?.charAt(0).toUpperCase()
                : 'U'}
            </div>
            <span className="text-xs text-secondary font-medium">
              {typeof property.user === 'object' ? property.user.email : 'Người đăng'}
            </span>
          </div>
          <span className="text-[11px] text-secondary/60">
            {new Date(property.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </article>
  )
}
