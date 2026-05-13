import type { Property } from '@/payload-types'
import { FALLBACK_IMAGE } from '../../lib/utils'

function getImageUrl(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : FALLBACK_IMAGE
}

export function PropertyGallery({
  title,
  images,
}: {
  title: string
  images: NonNullable<Property['images']>
}) {
  const primaryImage = images[0]?.image
  const galleryImages = images.slice(1, 5)
  const extraCount = Math.max(images.length - 5, 0)

  return (
    <div className="mb-10">
      <div className="rounded-xl overflow-hidden relative w-full h-[500px] mb-4 group">
        <img
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={getImageUrl(primaryImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button
          className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur-md text-on-surface px-4 py-2 rounded-lg font-lexend text-sm font-medium flex items-center gap-2 hover:bg-white transition-colors shadow-lg z-10"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">map</span>
          View Map
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 h-32">
        {galleryImages.map((image, index) => {
          const imageUrl = getImageUrl(image?.image)
          const showExtra = index === 3 && extraCount > 0

          return (
            <div key={index} className="rounded-xl overflow-hidden relative group cursor-pointer">
              <img
                alt={`${title} ${index + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={imageUrl}
              />
              {showExtra && (
                <div className="absolute inset-0 bg-on-background/50 flex items-center justify-center transition-colors hover:bg-on-background/40">
                  <span className="text-white font-headline text-xl font-medium tracking-tight">
                    +{extraCount} ảnh
                  </span>
                </div>
              )}
            </div>
          )
        })}
        {galleryImages.length < 4 &&
          Array.from({ length: 4 - galleryImages.length }).map((_, index) => (
            <div key={`placeholder-${index}`} className="rounded-xl bg-surface-container" />
          ))}
      </div>
    </div>
  )
}
