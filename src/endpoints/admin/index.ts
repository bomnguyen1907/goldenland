import type { Endpoint } from 'payload'

import { adminDashboardStats } from './dashboardStats'

export const adminEndpoints: Endpoint[] = [
  adminDashboardStats,
]
