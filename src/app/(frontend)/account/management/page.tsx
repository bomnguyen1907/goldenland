'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
  Bell,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Filter,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react'
import type { RootState } from '@/app/store'
import { selectUser } from '@/app/store/slices/authSlice'
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUS_OPTIONS } from '@/lib/propertyStatus'
import { fetchManagementDashboard } from '@/app/services/account'
import {
  deleteManagedProperty,
  fetchManagementProperties,
  fetchPropertyFilterOptions,
  type ManagedProperty,
} from '@/app/services/properties'
import type { ManagedPropertyStats } from '@/app/services/account'
import { formatLocationByCodes } from '../../(site)/properties/lib/utils'
import {
  PropertiesAdvancedFilterPopup,
  type FilterState,
} from '../../(site)/properties/components/PropertiesAdvancedFilterPopup'

type RangeOption = {
  id: string
  label: string
  min: number
  max: number
}

type SelectOption = {
  value: string
  label: string
}

const EMPTY_FILTERS: FilterState = {
  verifiedOnly: false,
  propertyTypes: [],
  priceRangeIds: [],
  areaRangeIds: [],
  minPriceInput: '',
  maxPriceInput: '',
  minAreaInput: '',
  maxAreaInput: '',
  provinceCodes: [],
  wardCodes: [],
  streets: [],
  projectIds: [],
  directions: [],
  legalStatuses: [],
  bedroomsList: [],
  bathroomsList: [],
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

const DYNAMIC_LABELS: Record<string, Record<string, string>> = {
  legalStatus: {
    red_book: 'Sổ đỏ/Sổ hồng',
    sale_contract: 'Hợp đồng mua bán',
    pending: 'Đang chờ sổ',
    other: 'Khác',
  },
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-zinc-100 text-zinc-600',
  expired: 'bg-red-100 text-red-600',
  sold: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
}

const POST_TYPE_BADGE: Record<string, string> = {
  normal: 'bg-zinc-100 text-zinc-700',
  silver: 'bg-teal-100 text-teal-700',
  gold: 'bg-amber-100 text-amber-700',
  diamond: 'bg-red-100 text-red-700',
}

const POST_TYPE_LABEL: Record<string, string> = {
  normal: 'Tin thường',
  silver: 'VIP Bạc',
  gold: 'VIP Vàng',
  diamond: 'VIP Kim Cương',
}

const numberFormatter = new Intl.NumberFormat('vi-VN')
const tyFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

function formatPrice(price: number, unit: string): string {
  if (unit === 'negotiable') return 'Thỏa thuận'
  const suffix = unit === 'per_m2' ? '/m2' : unit === 'per_month' ? '/tháng' : ''
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(2)} tỷ${suffix}`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu${suffix}`
  return `${price.toLocaleString('vi-VN')} đ`
}

function formatManagementLocation(property: ManagedProperty): string {
  return formatLocationByCodes({
    provinceCode: property.provinceCode,
    wardCode: property.wardCode,
    street: property.street,
  })
}

const buildRanges = (
  range: { min: number | null; max: number | null },
  steps: number,
  idPrefix: string,
  formatter: (value: number) => string,
): RangeOption[] => {
  if (range.min === null || range.max === null) return []
  if (range.min === range.max) {
    return [{ id: `${idPrefix}-0`, min: range.min, max: range.max, label: formatter(range.min) }]
  }

  const step = Math.max(1, Math.ceil((range.max - range.min) / steps))
  return Array.from({ length: steps }, (_, index) => {
    const min = range.min! + step * index
    const max = index === steps - 1 ? range.max! : Math.min(range.max!, min + step)
    return { id: `${idPrefix}-${index}`, min, max, label: `${formatter(min)} - ${formatter(max)}` }
  })
}

const getSelectedRange = (options: RangeOption[], selected: string[]) => {
  const ranges = options.filter((option) => selected.includes(option.id))
  if (ranges.length === 0) return {}
  return {
    min: Math.min(...ranges.map((item) => item.min)),
    max: Math.max(...ranges.map((item) => item.max)),
  }
}

const parsePositiveNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const getFilterCount = (filters: FilterState) =>
  [
    filters.verifiedOnly ? 1 : 0,
    filters.propertyTypes.length,
    filters.priceRangeIds.length,
    filters.areaRangeIds.length,
    filters.minPriceInput ? 1 : 0,
    filters.maxPriceInput ? 1 : 0,
    filters.minAreaInput ? 1 : 0,
    filters.maxAreaInput ? 1 : 0,
    filters.provinceCodes.length,
    filters.wardCodes.length,
    filters.projectIds.length,
    filters.directions.length,
    filters.legalStatuses.length,
    filters.bedroomsList.length,
    filters.bathroomsList.length,
  ].reduce((sum, value) => sum + value, 0)

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function ManagementInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => selectUser(state))
  const userId = user?.id
  const filterRef = useRef<HTMLDivElement | null>(null)

  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [stats, setStats] = useState<ManagedPropertyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [activeStatus, setActiveStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [balance, setBalance] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [draftFilters, setDraftFilters] = useState<FilterState | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<SelectOption[]>([])
  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([])
  const [wardOptions, setWardOptions] = useState<Array<SelectOption & { provinceCode: string }>>([])
  const [projectOptions, setProjectOptions] = useState<
    Array<SelectOption & { provinceCode: string; wardCode: string }>
  >([])
  const [priceRangeOptions, setPriceRangeOptions] = useState<RangeOption[]>([])
  const [areaRangeOptions, setAreaRangeOptions] = useState<RangeOption[]>([])
  const [dynamicAttributeOptions, setDynamicAttributeOptions] = useState<
    Array<{ key: string; label: string; options: SelectOption[] }>
  >([])

  const justPosted = searchParams.get('posted') === '1'
  const activeFilterCount = useMemo(() => getFilterCount(filters), [filters])
  const accountName = isMounted ? user?.fullName || user?.email || 'Khách hàng' : 'Khách hàng'
  const avatarInitial = String(accountName).trim().charAt(0).toUpperCase() || 'G'
  const totalPosts = stats?.total || 0
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages])
  const legalOptions = useMemo(
    () => dynamicAttributeOptions.find((group) => group.key === 'legalStatus')?.options ?? [],
    [dynamicAttributeOptions],
  )

  const requestFilters = useMemo(() => {
    const selectedPrice = getSelectedRange(priceRangeOptions, filters.priceRangeIds)
    const selectedArea = getSelectedRange(areaRangeOptions, filters.areaRangeIds)

    return {
      verifiedOnly: filters.verifiedOnly,
      propertyTypes: filters.propertyTypes,
      provinceCodes: filters.provinceCodes,
      wardCodes: filters.wardCodes,
      projectIds: filters.projectIds,
      minPrice: parsePositiveNumber(filters.minPriceInput) ?? selectedPrice.min,
      maxPrice: parsePositiveNumber(filters.maxPriceInput) ?? selectedPrice.max,
      minArea: parsePositiveNumber(filters.minAreaInput) ?? selectedArea.min,
      maxArea: parsePositiveNumber(filters.maxAreaInput) ?? selectedArea.max,
      directions: filters.directions,
      legalStatuses: filters.legalStatuses,
      bedroomsList: filters.bedroomsList,
      bathroomsList: filters.bathroomsList,
    }
  }, [areaRangeOptions, filters, priceRangeOptions])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await fetchPropertyFilterOptions()
        setPropertyTypeOptions(
          options.propertyTypes.map((value) => ({
            value,
            label: PROPERTY_TYPE_LABELS[value] || value,
          })),
        )
        setRegionOptions(options.regions.map((item) => ({ value: item.code, label: item.label })))
        setWardOptions(
          options.wards.map((item) => ({
            value: item.code,
            label: item.label,
            provinceCode: item.provinceCode,
          })),
        )
        setProjectOptions(
          options.projects.map((item) => ({
            value: item.id,
            label: item.name,
            provinceCode: item.provinceCode,
            wardCode: item.wardCode,
          })),
        )
        setPriceRangeOptions(
          buildRanges(options.priceRange, 5, 'price', (value) => `${tyFormatter.format(value / 1_000_000_000)} tỷ`),
        )
        setAreaRangeOptions(
          buildRanges(options.areaRange, 5, 'area', (value) => `${numberFormatter.format(value)} m2`),
        )
        setDynamicAttributeOptions(
          options.dynamicAttributes.map((group) => ({
            key: group.key,
            label: group.key,
            options: group.values.map((value) => ({
              value,
              label: DYNAMIC_LABELS[group.key]?.[value] || value,
            })),
          })),
        )
      } catch {}
    }

    void loadFilterOptions()
  }, [])

  useEffect(() => {
    if (!isFilterOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current?.contains(event.target as Node)) return
      setDraftFilters(null)
      setIsFilterOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isFilterOpen])

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await fetchManagementDashboard()
      setStats(data.stats)
      setBalance(data.balance)
    } catch {}
  }, [])

  const refreshAll = useCallback(() => {
    void refreshDashboard()
    setRefreshToken((prev) => prev + 1)
  }, [refreshDashboard])

  useEffect(() => {
    refreshAll()
  }, [refreshAll, userId])

  useEffect(() => {
    if (justPosted) refreshAll()
  }, [justPosted, refreshAll])

  useEffect(() => {
    const handleFocus = () => refreshAll()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAll()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshAll])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!userId) {
        if (cancelled) return
        setProperties([])
        setTotalPages(1)
        setLoading(false)
        return
      }

      if (!cancelled) setLoading(true)
      try {
        const data = await fetchManagementProperties({
          userId,
          status: activeStatus,
          keyword,
          page,
          ...requestFilters,
        })

        if (cancelled) return
        setProperties(data.properties)
        setTotalPages(data.totalPages)
      } catch {
        if (!cancelled) {
          setProperties([])
          setTotalPages(1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [activeStatus, keyword, page, requestFilters, userId, refreshToken])

  const handleSearch = () => {
    setKeyword(keywordInput.trim())
    setPage(1)
  }

  const handleStatusTab = (status: string) => {
    setActiveStatus(status)
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tin này không?')) return
    setDeletingId(id)
    try {
      await deleteManagedProperty(id)
      setProperties((prev) => prev.filter((p) => p.id !== id))
      await refreshDashboard()
    } catch {}
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <header className="flex flex-col gap-4 border-b border-zinc-100 bg-white px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <h1 className="text-2xl font-bold text-[#2c2c2c]">Quản lý tin</h1>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <button className="flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm" type="button">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e03c31] text-white">
              <span className="text-xs font-bold">đ</span>
            </span>
            <span className="mr-1 text-sm font-bold">{numberFormatter.format(balance)} đ</span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>
          <Link
            href="/account/top-up"
            className="flex items-center rounded-full bg-[#2c2c2c] px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nạp tiền
          </Link>
          <button className="relative rounded-full bg-zinc-100 p-2" type="button" aria-label="Thông báo">
            <Bell className="h-6 w-6 text-[#2c2c2c]" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#e03c31] text-[10px] text-white">
              1
            </span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-[#2c2c2c]">
            {avatarInitial}
          </div>
        </div>
      </header>

      <section className="space-y-4 bg-white px-4 py-6 shadow-sm sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              className="block h-10 w-full rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-zinc-500 focus:border-[#e03c31] focus:outline-none focus:ring-1 focus:ring-[#e03c31]"
              placeholder="Nhập mã tin hoặc tiêu đề tin"
              type="text"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <div ref={filterRef} className="relative">
            <button
              className="relative flex h-10 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium hover:bg-zinc-50"
              type="button"
              onClick={() => {
                setDraftFilters({ ...filters })
                setIsFilterOpen((current) => !current)
              }}
            >
              <Filter className="mr-2 h-5 w-5 text-[#2c2c2c]" />
              Lọc
              {activeFilterCount > 0 ? (
                <span className="absolute -right-1 -top-2 rounded-full bg-[#e03c31] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <PropertiesAdvancedFilterPopup
              isOpen={isFilterOpen}
              className="left-1/2 -translate-x-1/2"
              filters={filters}
              draftFilters={draftFilters}
              onDraftChange={setDraftFilters}
              onApply={(next) => {
                setFilters(next)
                setDraftFilters(null)
                setIsFilterOpen(false)
                setPage(1)
              }}
              onCancel={() => {
                setDraftFilters(null)
                setIsFilterOpen(false)
              }}
              onClear={() => setDraftFilters(EMPTY_FILTERS)}
              propertyTypeOptions={propertyTypeOptions}
              regionOptions={regionOptions}
              wardOptions={wardOptions}
              projectOptions={projectOptions}
              legalOptions={legalOptions}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              activeStatus === ''
                ? 'bg-[#2c2c2c] text-white'
                : 'border border-zinc-200 bg-white hover:bg-zinc-50'
            }`}
            type="button"
            onClick={() => handleStatusTab('')}
          >
            Tất cả ({totalPosts})
          </button>
          {PROPERTY_STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                activeStatus === status.value
                  ? 'bg-[#2c2c2c] text-white'
                  : 'border border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
              type="button"
              onClick={() => handleStatusTab(status.value)}
            >
              {status.label} ({stats?.[status.value] || 0})
            </button>
          ))}
        </div>
      </section>

      {justPosted ? (
        <div className="mx-4 mt-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:mx-6 lg:mx-8">
          <span>Tin đăng của bạn đã được gửi, đang chờ kiểm duyệt.</span>
          <button
            type="button"
            onClick={() => router.replace('/account/management')}
            className="ml-4 text-xl leading-none text-emerald-500 hover:text-emerald-700"
          >
            x
          </button>
        </div>
      ) : null}

      <section className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-28 shrink-0 rounded-lg bg-zinc-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-zinc-200" />
                    <div className="h-3 w-1/2 rounded bg-zinc-200" />
                    <div className="h-3 w-1/4 rounded bg-zinc-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#fff8f7] p-8 text-center">
            <div className="pointer-events-none absolute top-10 w-[90%] max-w-3xl -translate-y-1/4 opacity-30">
              <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-zinc-100">
                  <span className="material-symbols-outlined text-[40px] text-zinc-300">home</span>
                </div>
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 w-20 rounded bg-emerald-100" />
                  <div className="h-4 w-full rounded bg-zinc-100" />
                  <div className="h-4 w-3/4 rounded bg-zinc-100" />
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[#2c2c2c]">Chưa có tin đăng nào</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[#727272]">
                Tin đăng của bạn sẽ được tiếp cận hơn 6 triệu người tìm mua/thuê bất động sản mỗi tháng.
              </p>
              <Link
                href="/dang-tin"
                className="mt-8 inline-flex items-center rounded-full bg-[#e03c31] px-8 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Đăng tin ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <article key={property.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-zinc-100 sm:w-36">
                    {property.images?.[0]?.image ? (
                      <Image
                        src={property.images[0].image}
                        alt={property.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 144px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">
                        {property.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:justify-end">
                        {property.postType ? (
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${POST_TYPE_BADGE[property.postType] || 'bg-zinc-100 text-zinc-600'}`}>
                            {POST_TYPE_LABEL[property.postType] || property.postType}
                          </span>
                        ) : null}
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[property.status] || 'bg-zinc-100 text-zinc-600'}`}>
                          {PROPERTY_STATUS_LABELS[property.status as keyof typeof PROPERTY_STATUS_LABELS] || property.status}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#e03c31]">
                      {formatPrice(property.price, property.priceUnit)}
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-500">{formatManagementLocation(property)}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(property.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
                    <button
                      type="button"
                      onClick={() => handleDelete(property.id)}
                      disabled={deletingId === property.id}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {deletingId === property.id ? '...' : 'Xóa'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang đầu"
              title="Trang đầu"
            >
              <ChevronFirst className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Lùi 1 trang"
              title="Lùi 1 trang"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                  page === pageNumber
                    ? 'bg-[#2c2c2c] text-white'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Tiến 1 trang"
              title="Tiến 1 trang"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang cuối"
              title="Trang cuối"
            >
              <ChevronLast className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </section>
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
