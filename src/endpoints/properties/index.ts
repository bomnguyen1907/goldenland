import type { Endpoint } from 'payload'

import { submitProperty } from './submitProperty'
import { submitReport } from './submitReport'
import { trackView } from './trackView'

export const propertyEndpoints: Endpoint[] = [
  submitProperty,
  submitReport,
  trackView,
]
