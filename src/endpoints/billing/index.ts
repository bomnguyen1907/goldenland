import type { Endpoint } from 'payload'

import { calculatePackagePrice } from './calculatePackagePrice'
import { payosWebhook } from './payosWebhook'
import { purchasePackage } from './purchasePackage'
import { topUp } from './topUp'
import { topUpStatus } from './topUpStatus'

export const billingEndpoints: Endpoint[] = [
  calculatePackagePrice,
  purchasePackage,
  topUp,
  payosWebhook,
  topUpStatus,
]
