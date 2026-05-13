import type { Project, Property } from '@/payload-types'
import { formatLocation, formatPrice } from '../lib/utils'
import { notFound } from 'next/navigation'
import { Breadcrumb, HeaderActions, LocationLine, PropertyStats } from './components/DetailHeader'
import { PropertyGallery } from './components/PropertyGallery'
import {
  DescriptionSection,
  FeaturesSection,
  MapSection,
  MetaInfo,
  ProjectSection,
  type FeatureItem,
  type MetaItem,
} from './components/DetailSections'
import { ConsultationForm, ContactCard } from './components/DetailSidebar'
import { ForYouSection } from './components/ForYouSection'
import {
  fetchForYouProperties,
  fetchPropertyDetail,
  type PropertyDetailResponse,
} from '@/app/services/properties'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function formatArea(property: Property): string {
  return property.area ? `${property.area} m²` : 'Đang cập nhật'
}

function formatDate(value?: string | null): string {
  if (!value) return 'Đang cập nhật'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: 'Nhà riêng',
  apartment: 'Chung cư',
  land: 'Đất nền',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  shophouse: 'Shophouse',
  penthouse: 'Penthouse',
  condotel: 'Condotel',
  warehouse: 'Kho/Xưởng',
  commercial: 'Mặt bằng',
}

const DIRECTION_LABELS: Record<string, string> = {
  east: 'Đông',
  west: 'Tây',
  south: 'Nam',
  north: 'Bắc',
  northeast: 'Đông Bắc',
  southeast: 'Đông Nam',
  northwest: 'Tây Bắc',
  southwest: 'Tây Nam',
}

const LEGAL_STATUS_LABELS: Record<string, string> = {
  red_book: 'Sổ đỏ/Sổ hồng',
  sale_contract: 'Hợp đồng mua bán',
  pending: 'Đang chờ sổ',
  other: 'Giấy tờ khác',
}

const FURNITURE_STATUS_LABELS: Record<string, string> = {
  luxury: 'Nội thất cao cấp',
  full: 'Nội thất đầy đủ',
  basic: 'Nội thất cơ bản',
  none: 'Không nội thất',
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: 'Bán',
  rent: 'Cho thuê',
}

const POST_TYPE_LABELS: Record<string, string> = {
  normal: 'Tin thường',
  vip: 'Tin VIP',
}

const PROJECT_SALE_STATUS_LABELS: Record<string, string> = {
  active: 'Đang mở bán',
  upcoming: 'Sắp mở bán',
  completed: 'Đã bàn giao',
}

function buildFeatureItems(property: Property): FeatureItem[] {
  const items: FeatureItem[] = []

  const pushItem = (label: string, value: string | number | null | undefined, icon: string) => {
    if (value === null || value === undefined) return
    const text = String(value).trim()
    if (!text) return
    items.push({ label, value: text, icon })
  }

  pushItem('Loại giao dịch', LISTING_TYPE_LABELS[property.listingType], 'sell')
  pushItem('Loại bất động sản', PROPERTY_TYPE_LABELS[property.propertyType], 'home_work')
  pushItem('Diện tích', property.area ? `${property.area} m²` : null, 'aspect_ratio')
  pushItem('Phòng ngủ', property.bedrooms, 'bed')
  pushItem('Phòng tắm', property.bathrooms, 'bathtub')
  pushItem('Đường rộng', property.roadWidth ? `${property.roadWidth} m` : null, 'swap_horiz')
  pushItem('Mặt tiền', property.facadeWidth ? `${property.facadeWidth} m` : null, 'straighten')
  pushItem(
    'Hướng cửa chính',
    property.direction ? DIRECTION_LABELS[property.direction] : null,
    'explore',
  )
  pushItem(
    'Pháp lý',
    property.legalStatus ? LEGAL_STATUS_LABELS[property.legalStatus] : null,
    'description',
  )
  pushItem(
    'Nội thất',
    property.furnitureStatus ? FURNITURE_STATUS_LABELS[property.furnitureStatus] : null,
    'chair',
  )

  return items
}

function buildProjectInfo(project: Project): FeatureItem[] {
  const items: FeatureItem[] = []

  const pushItem = (label: string, value: string | number | null | undefined, icon: string) => {
    if (value === null || value === undefined) return
    const text = String(value).trim()
    if (!text) return
    items.push({ label, value: text, icon })
  }

  const priceFrom = project.priceFrom ? `${project.priceFrom} triệu` : ''
  const priceTo = project.priceTo ? `${project.priceTo} triệu` : ''
  const priceRange = priceFrom && priceTo ? `${priceFrom} - ${priceTo}` : priceFrom || priceTo

  pushItem(
    'Chủ đầu tư',
    project.investor && typeof project.investor === 'object' ? project.investor.name : null,
    'apartment',
  )
  pushItem('Địa chỉ', project.address, 'location_on')
  pushItem('Tổng diện tích', project.totalArea ? `${project.totalArea} ha` : null, 'square_foot')
  pushItem('Tổng số căn/lô', project.totalUnits, 'home')
  pushItem('Giá', priceRange, 'payments')
  pushItem(
    'Trạng thái mở bán',
    project.saleStatus ? PROJECT_SALE_STATUS_LABELS[project.saleStatus] : null,
    'calendar_today',
  )

  return items
}

function getProjectTitle(project: Project): string {
  return project.name || 'Dự án liên quan'
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  let property: Property | undefined
  let forYouProperties: any[] = []

  try {
    const response = await fetchPropertyDetail(id)
    property = response.property

    if (property) {
      const docs = await fetchForYouProperties(property)
      forYouProperties = docs.map((p) => ({
        id: p.id,
        title: p.title,
        price: formatPrice(p),
        area: p.area ? `${p.area} m²` : 'Đang cập nhật',
        location: formatLocation(p),
        image: typeof p.images?.[0]?.image === 'string' ? p.images[0].image : '',
        imageAlt: p.title,
        updatedAt: p.updatedAt,
      }))
    }
  } catch {
    notFound()
  }

  if (!property) {
    notFound()
  }

  const locationText = formatLocation(property)
  const priceText = formatPrice(property)
  const areaText = formatArea(property)
  const bedrooms = property.bedrooms ?? 0
  const bathrooms = property.bathrooms ?? 0
  const images: NonNullable<Property['images']> = Array.isArray(property.images)
    ? property.images
    : []
  const featureItems = buildFeatureItems(property)

  const metaItems: MetaItem[] = [
    { label: 'Ngày đăng', value: formatDate(property.createdAt) },
    {
      label: 'Ngày hết hạn',
      value: property.status === 'expired' ? formatDate(property.updatedAt) : 'Đang cập nhật',
    },
    {
      label: 'Loại tin',
      value: property.postType ? POST_TYPE_LABELS[property.postType] : 'Đang cập nhật',
    },
    { label: 'Mã tin', value: `#${property.id}` },
  ]

  const project = typeof property.project === 'object' ? property.project : null
  const projectItems = project ? buildProjectInfo(project) : []
  const projectTitle = project ? getProjectTitle(project) : ''

  const headerActions = (
    <>
      <button
        aria-label="Share"
        className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center w-10 h-10"
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
          share
        </span>
      </button>
      <button
        aria-label="Report"
        className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center w-10 h-10"
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
          flag
        </span>
      </button>
      <button
        aria-label="Favorite"
        className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center w-10 h-10"
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
          favorite
        </span>
      </button>
    </>
  )

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <Breadcrumb title={property.title} />
      <HeaderActions title={property.title} actions={headerActions} />
      <LocationLine locationText={locationText} />
      <PropertyStats
        priceText={priceText}
        areaText={areaText}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
      />
      <PropertyGallery title={property.title} images={images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <DescriptionSection description={property.description} />
          <FeaturesSection items={featureItems} />
          <MapSection locationText={locationText} />
          <MetaInfo items={metaItems} />
          <ForYouSection properties={forYouProperties} />
          {project && <ProjectSection title={projectTitle} items={projectItems} />}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <ContactCard property={property} />
            <ConsultationForm />
          </div>
        </div>
      </div>
    </main>
  )
}
