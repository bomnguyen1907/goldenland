export function parseBoolean(value: string | undefined): boolean | undefined {
  if (typeof value !== 'string') return undefined

  const normalized = value.toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false

  return undefined
}

export function parseCsv(value: string | undefined): string[] {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseIntInRange(
  value: string | undefined,
  min: number,
  max: number,
): number | undefined {
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < min || parsed > max) return undefined

  return parsed
}

export function parseIntCsvInRange(
  value: string | undefined,
  min: number,
  max: number,
): number[] {
  return parseCsv(value)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isFinite(item) && item >= min && item <= max)
}

export function parseNumberMin(value: string | undefined, min: number): number | undefined {
  if (!value) return undefined

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < min) return undefined

  return parsed
}

export function normalizeMinMaxRange(
  minValue: number | undefined,
  maxValue: number | undefined,
): [number | undefined, number | undefined] {
  if (
    typeof minValue === 'number' &&
    typeof maxValue === 'number' &&
    minValue > maxValue
  ) {
    return [maxValue, minValue]
  }

  return [minValue, maxValue]
}
