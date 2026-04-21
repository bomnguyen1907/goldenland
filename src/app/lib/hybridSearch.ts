export type SearchTab = 'all' | 'property' | 'project' | 'news'

export type SearchChipKey = 'district' | 'bedrooms' | 'price' | 'keyword'

export type SearchChip = {
  key: SearchChipKey
  label: string
  value: string
  editText: string
}

export type ParsedSearchFilters = {
  district?: number
  bedrooms?: number
  minPrice?: number
  maxPrice?: number
}

export type ParsedSearchResult = {
  tab: SearchTab
  keyword: string
  filters: ParsedSearchFilters
  chips: SearchChip[]
}

const DISTRICT_PARSE_RE = /\b(?:q\.?|quan)\s*(\d{1,2})\b/i
const BEDROOMS_PARSE_RE = /\b(\d{1,2})\s*(?:pn|phong\s*ngu)\b/i
const PRICE_RANGE_PARSE_RE =
  /(?:\btu\b\s*)?(\d+(?:[.,]\d+)?)\s*(ty|trieu)\s*(?:-|den|toi|~)\s*(\d+(?:[.,]\d+)?)\s*(ty|trieu)?/i
const PRICE_SINGLE_PARSE_RE = /(\d+(?:[.,]\d+)?)\s*(ty|trieu)\b/i

const DISTRICT_REMOVE_RE = /\b(?:q\.?|quận|quan)\s*\d{1,2}\b/giu
const BEDROOMS_REMOVE_RE = /\b\d{1,2}\s*(?:pn|phong\s*ngu|phòng\s*ngủ)\b/giu
const PRICE_RANGE_REMOVE_RE =
  /(?:\btu\b\s*)?\d+(?:[.,]\d+)?\s*(?:ty|tỷ|trieu|triệu)\s*(?:-|đến|den|toi|tới|~)\s*\d+(?:[.,]\d+)?\s*(?:ty|tỷ|trieu|triệu)?/giu
const PRICE_SINGLE_REMOVE_RE = /\d+(?:[.,]\d+)?\s*(?:ty|tỷ|trieu|triệu)\b/giu

const normalize = (input: string): string => {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

const toNumber = (raw: string): number => Number(raw.replace(',', '.'))

const toVnd = (value: number, unitRaw?: string): number => {
  const unit = (unitRaw || '').toLowerCase()

  if (unit.includes('ty')) return Math.round(value * 1_000_000_000)
  if (unit.includes('trieu')) return Math.round(value * 1_000_000)

  return Math.round(value)
}

const compactWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const formatPrice = (value: number): string => {
  if (value >= 1_000_000_000) {
    const ty = value / 1_000_000_000
    return `${ty % 1 === 0 ? ty.toFixed(0) : ty.toFixed(1)} tỷ`
  }

  const trieu = value / 1_000_000
  return `${trieu % 1 === 0 ? trieu.toFixed(0) : trieu.toFixed(1)} triệu`
}

const parseDistrict = (normalizedInput: string): number | undefined => {
  const match = normalizedInput.match(DISTRICT_PARSE_RE)
  if (!match) return undefined

  return Number(match[1])
}

const parseBedrooms = (normalizedInput: string): number | undefined => {
  const match = normalizedInput.match(BEDROOMS_PARSE_RE)
  if (!match) return undefined

  return Number(match[1])
}

const parsePrice = (
  normalizedInput: string,
): Pick<ParsedSearchFilters, 'minPrice' | 'maxPrice'> | undefined => {
  const rangeMatch = normalizedInput.match(PRICE_RANGE_PARSE_RE)
  if (rangeMatch) {
    const left = toNumber(rangeMatch[1])
    const leftUnit = rangeMatch[2]
    const right = toNumber(rangeMatch[3])
    const rightUnit = rangeMatch[4] || leftUnit

    const minPrice = toVnd(left, leftUnit)
    const maxPrice = toVnd(right, rightUnit)

    return {
      minPrice: Math.min(minPrice, maxPrice),
      maxPrice: Math.max(minPrice, maxPrice),
    }
  }

  const singleMatch = normalizedInput.match(PRICE_SINGLE_PARSE_RE)
  if (!singleMatch) return undefined

  const amount = toNumber(singleMatch[1])
  const unit = singleMatch[2]

  return {
    maxPrice: toVnd(amount, unit),
  }
}

const buildKeyword = (input: string, tab: SearchTab): string => {
  if (tab === 'news') return compactWhitespace(input)

  return compactWhitespace(
    input
      .replace(DISTRICT_REMOVE_RE, ' ')
      .replace(BEDROOMS_REMOVE_RE, ' ')
      .replace(PRICE_RANGE_REMOVE_RE, ' ')
      .replace(PRICE_SINGLE_REMOVE_RE, ' '),
  )
}

export function parseSearch(input: string, tab: SearchTab): ParsedSearchResult {
  const rawInput = compactWhitespace(input)
  const normalized = normalize(rawInput)

  const filters: ParsedSearchFilters = {}

  if (tab !== 'news') {
    const district = parseDistrict(normalized)
    if (typeof district === 'number' && district > 0) filters.district = district
  }

  if (tab === 'property' || tab === 'all') {
    const bedrooms = parseBedrooms(normalized)
    if (typeof bedrooms === 'number' && bedrooms > 0) filters.bedrooms = bedrooms

    const price = parsePrice(normalized)
    if (price?.minPrice) filters.minPrice = price.minPrice
    if (price?.maxPrice) filters.maxPrice = price.maxPrice
  }

  const keyword = buildKeyword(rawInput, tab)
  const chips: SearchChip[] = []

  if (filters.district) {
    chips.push({
      key: 'district',
      label: `Quận ${filters.district}`,
      value: String(filters.district),
      editText: `quận ${filters.district}`,
    })
  }

  if (filters.bedrooms) {
    chips.push({
      key: 'bedrooms',
      label: `${filters.bedrooms} phòng ngủ`,
      value: String(filters.bedrooms),
      editText: `${filters.bedrooms} phòng ngủ`,
    })
  }

  if (filters.minPrice || filters.maxPrice) {
    const label =
      typeof filters.minPrice === 'number' && typeof filters.maxPrice === 'number'
        ? `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`
        : `Dưới ${formatPrice(filters.maxPrice as number)}`

    chips.push({
      key: 'price',
      label,
      value: label,
      editText: label.toLowerCase(),
    })
  }

  if (keyword) {
    chips.push({
      key: 'keyword',
      label: `Từ khóa: ${keyword}`,
      value: keyword,
      editText: keyword,
    })
  }

  return {
    tab,
    keyword,
    filters,
    chips,
  }
}

export function getSearchPlaceholder(tab: SearchTab): string {
  if (tab === 'property') return 'VD: căn hộ quận 7 2 phòng ngủ 2 tỷ'
  if (tab === 'project') return 'VD: Vinhomes quận 9'
  if (tab === 'news') return 'VD: lãi suất vay mua nhà 2026'

  return 'VD: quận 7 2 phòng ngủ 2 tỷ hoặc tên dự án, tin tức'
}

export function suggestMissingFilters(parsed: ParsedSearchResult, tab: SearchTab): string[] {
  const suggestions: string[] = []

  if ((tab === 'property' || tab === 'all') && !parsed.filters.district) suggestions.push('quận 7')
  if ((tab === 'property' || tab === 'all') && !parsed.filters.bedrooms) {
    suggestions.push('2 phòng ngủ')
  }
  if ((tab === 'property' || tab === 'all') && !parsed.filters.minPrice && !parsed.filters.maxPrice) {
    suggestions.push('2 tỷ')
  }

  if ((tab === 'project' || tab === 'all') && !parsed.keyword) suggestions.push('Vinhomes')

  if (tab === 'news' && !parsed.keyword) suggestions.push('thị trường căn hộ')

  return suggestions
}

export function removeSearchTokenByChip(input: string, chip: SearchChip): string {
  if (chip.key === 'keyword') {
    return compactWhitespace(input.replace(chip.value, ' '))
  }

  if (chip.key === 'district') {
    return compactWhitespace(input.replace(DISTRICT_REMOVE_RE, ' '))
  }

  if (chip.key === 'bedrooms') {
    return compactWhitespace(input.replace(BEDROOMS_REMOVE_RE, ' '))
  }

  return compactWhitespace(
    input.replace(PRICE_RANGE_REMOVE_RE, ' ').replace(PRICE_SINGLE_REMOVE_RE, ' '),
  )
}
