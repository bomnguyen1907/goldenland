import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'

const PAYMENT_METHODS = ['balance', 'bank_transfer', 'momo', 'vnpay', 'zalopay'] as const
const STATUSES = ['paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'cancelled', 'refunded'] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

function randOrderCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${ts}-${rnd}`
}

async function seed() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config: await config })

  // Lấy data có sẵn
  const [usersRes, packagesRes, postingPricesRes, propertiesRes] = await Promise.all([
    payload.find({ collection: 'users', limit: 30, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'packages', limit: 20, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'posting-prices', limit: 20, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'properties', limit: 50, depth: 0, overrideAccess: true }),
  ])

  const users = usersRes.docs
  const packages = packagesRes.docs
  const postingPrices = postingPricesRes.docs
  const properties = propertiesRes.docs

  if (users.length === 0) {
    console.error('Không có users. Hãy seed users trước.')
    process.exit(1)
  }

  console.log(`Users: ${users.length}, Packages: ${packages.length}, PostingPrices: ${postingPrices.length}, Properties: ${properties.length}`)
  console.log('Tạo 50 orders...\n')

  let created = 0

  for (let i = 0; i < 50; i++) {
    const user = pick(users)
    const status = pick(STATUSES)
    const paymentMethod = pick(PAYMENT_METHODS)
    const createdDaysAgo = randInt(0, 90)

    // Random loại đơn
    const roll = Math.random()
    let orderType: 'package' | 'single_post' | 'top_up'
    let originalAmount: number
    let relatedData: Record<string, any> = {}

    if (roll < 0.45 && packages.length > 0) {
      // Mua gói
      orderType = 'package'
      const pkg = pick(packages as any[])
      originalAmount = (pkg.price ?? randInt(500_000, 5_000_000))
      relatedData = { package: pkg.id }
    } else if (roll < 0.75 && postingPrices.length > 0) {
      // Đăng lẻ
      orderType = 'single_post'
      const pp = pick(postingPrices as any[])
      const days = randInt(7, 30)
      originalAmount = Math.round((pp.dailyPrice ?? 50_000) * days)
      relatedData = {
        postingPrice: pp.id,
        ...(properties.length > 0 ? { property: pick(properties).id } : {}),
      }
    } else {
      // Nạp tiền
      orderType = 'top_up'
      originalAmount = pick([100_000, 200_000, 500_000, 1_000_000, 2_000_000] as const)
    }

    // Giảm giá ngẫu nhiên (30% đơn có giảm giá)
    const discountAmount = Math.random() < 0.3 ? Math.round(originalAmount * randInt(5, 20) / 100) : 0
    const totalAmount = Math.max(0, originalAmount - discountAmount)

    const paidAt = status === 'paid' ? daysAgo(randInt(0, createdDaysAgo)) : undefined

    try {
      await payload.create({
        collection: 'orders',
        data: {
          orderCode: randOrderCode(),
          user: user.id,
          orderType,
          ...relatedData,
          originalAmount,
          discountAmount,
          promotionDiscount: 0,
          totalAmount,
          paymentMethod,
          status,
          ...(paidAt ? { paidAt } : {}),
          createdAt: daysAgo(createdDaysAgo),
        } as any,
        overrideAccess: true,
      })
      created++
      process.stdout.write(`\r✓ ${created}/50 orders created`)
    } catch (e: any) {
      console.error(`\n✗ Lỗi order ${i + 1}:`, e.message)
    }
  }

  console.log(`\n\n✓ Đã tạo ${created}/50 orders`)
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})