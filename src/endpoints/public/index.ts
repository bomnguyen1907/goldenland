import type { Endpoint } from 'payload'

import { divisionEndpoints } from './divisions'
import { propertyFilters } from './propertyFilters'
import { searchNews } from './searchNews'
import { searchProjects } from './searchProjects'
import { searchProperties } from './searchProperties'

export const publicEndpoints: Endpoint[] = [
  ...divisionEndpoints,
  searchProperties,
  propertyFilters,
  searchProjects,
  searchNews,
]
