import type { Endpoint } from 'payload'

import { accountEndpoints } from './account'
import { adminEndpoints } from './admin'
import { billingEndpoints } from './billing'
import { propertyEndpoints } from './properties'
import { publicEndpoints } from './public'

export const endpoints: Endpoint[] = [
  ...publicEndpoints,
  ...propertyEndpoints,
  ...accountEndpoints,
  ...billingEndpoints,
  ...adminEndpoints,
]
