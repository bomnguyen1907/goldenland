'use client'

import React from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavoriteThunk, selectFavoriteIdSet } from '@/app/store/slices/favoritesSlice'
import type { AppDispatch, RootState } from '@/app/store'

export type PropertyItem = {
  id: number
  title: string
  price: string
  area: string
  location: string
  image: string
  imageAlt: string
  updatedAt?: string | null
}

interface PropertyGridItemProps {
  property: PropertyItem
}

export function PropertyGridItem({ property }: PropertyGridItemProps) {
  const dispatch = useDispatch<AppDispatch>()
  const favoriteIdSet = useSelector((state: RootState) => selectFavoriteIdSet(state as any))
  const isFavorite = favoriteIdSet.has(property.id)

  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg border border-outline-variant/20 bg-white transition-all hover:shadow-xl">
      <Link href={`/properties/${property.id}`}>
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

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs italic text-secondary">
              {property.updatedAt
                ? new Date(property.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'Đang cập nhật'}
            </span>

            <button
              aria-label={`${isFavorite ? 'Bỏ khỏi' : 'Thêm vào'} danh sách yêu thích: ${property.title}`}
              className="favorite-toggle inline-flex h-8 w-8 items-center justify-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void dispatch(toggleFavoriteThunk(property.id))
              }}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-lg transition-all duration-100 ${
                  isFavorite
                    ? 'material-symbols-filled text-red-500 scale-125'
                    : 'text-zinc-500 hover:text-red-500 hover:scale-125'
                }`}
              >
                {isFavorite ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
