import qs from 'qs'

type QueryInput = Record<string, unknown>

const removeEmptyValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as QueryInput)
      .map(([key, nestedValue]) => [key, removeEmptyValues(nestedValue)] as const)
      .filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== '')

    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }

  return value
}

export const buildQuery = (query: QueryInput) =>
  qs.stringify(query, {
    addQueryPrefix: true,
    encode: false,
  })

export const buildPayloadQuery = (query: QueryInput) => buildQuery(query)

export const buildAppQuery = (query: QueryInput) => {
  const cleaned = removeEmptyValues(query) as QueryInput | undefined

  return buildQuery(cleaned ?? {})
}
