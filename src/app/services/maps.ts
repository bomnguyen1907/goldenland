export type GeocodedAddress = {
  latitude: number | null
  longitude: number | null
  address?: Record<string, unknown>
}

export type NearbyPlace = {
  id: string
  name: string
  lat: number
  lng: number
  distance: number
}

export type NearbyPlaceCategory = {
  label: string
  icon: string
  query: string
  value: string
}

type OverpassElement = {
  id?: string | number
  lat?: number
  lon?: number
  center?: {
    lat?: number
    lon?: number
  }
  tags?: {
    name?: string
    'name:vi'?: string
  }
}

type OverpassResponse = {
  elements?: OverpassElement[]
}

export const NEARBY_PLACE_CATEGORIES: NearbyPlaceCategory[] = [
  { label: 'Trường học', icon: '🏫', query: 'amenity=school', value: 'school' },
  { label: 'Siêu thị', icon: '🛒', query: 'shop=supermarket', value: 'supermarket' },
  { label: 'Công viên', icon: '🌳', query: 'leisure=park', value: 'park' },
  { label: 'Bệnh viện', icon: '🏥', query: 'amenity=hospital', value: 'hospital' },
  { label: 'Nhà hàng', icon: '🍜', query: 'amenity=restaurant', value: 'restaurant' },
]

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const OVERPASS_INTERPRETER_URL = 'https://overpass-api.de/api/interpreter'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const toFiniteNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function geocodeVietnamAddress(
  query: string,
  options?: {
    addressDetails?: boolean
    signal?: AbortSignal
  },
): Promise<GeocodedAddress | null> {
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    countrycodes: 'vn',
    q: query,
  })

  if (options?.addressDetails) {
    params.set('addressdetails', '1')
  }

  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
    signal: options?.signal,
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const first = Array.isArray(data) ? data[0] : null

  if (!isRecord(first)) {
    return null
  }

  return {
    latitude: toFiniteNumber(first.lat),
    longitude: toFiniteNumber(first.lon),
    address: isRecord(first.address) ? first.address : undefined,
  }
}

export function buildGoogleMapsEmbedURL(params: {
  latitude?: number | null
  longitude?: number | null
  query?: string
  zoom?: number
}): string {
  const zoom = params.zoom ?? 15
  const hasCoordinates =
    typeof params.latitude === 'number' &&
    Number.isFinite(params.latitude) &&
    typeof params.longitude === 'number' &&
    Number.isFinite(params.longitude)

  const query = hasCoordinates
    ? `${params.latitude},${params.longitude}`
    : params.query?.trim()

  return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed` : ''
}

export async function fetchNearbyPlaces(params: {
  lat: number
  lng: number
  query: string
  limit?: number
  radiusMeters?: number
  signal?: AbortSignal
}): Promise<NearbyPlace[]> {
  const [key, value] = params.query.split('=')

  if (!key || !value) {
    return []
  }

  const radiusMeters = params.radiusMeters ?? 2000
  const limit = params.limit ?? 8
  const overpassQuery = `[out:json][timeout:10];
(
node["${key}"="${value}"](around:${radiusMeters},${params.lat},${params.lng});
way["${key}"="${value}"](around:${radiusMeters},${params.lat},${params.lng});
);
out center ${limit};`

  const response = await fetch(OVERPASS_INTERPRETER_URL, {
    method: 'POST',
    body: overpassQuery,
    signal: params.signal,
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as OverpassResponse

  return (data.elements ?? [])
    .map((element): NearbyPlace | null => {
      const lat = toFiniteNumber(element.lat ?? element.center?.lat)
      const lng = toFiniteNumber(element.lon ?? element.center?.lon)

      if (lat === null || lng === null) {
        return null
      }

      return {
        id: String(element.id ?? `${lat},${lng}`),
        name: element.tags?.name || element.tags?.['name:vi'] || 'Không rõ tên',
        lat,
        lng,
        distance: haversine(params.lat, params.lng, lat, lng),
      }
    })
    .filter((place): place is NearbyPlace => Boolean(place))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}
