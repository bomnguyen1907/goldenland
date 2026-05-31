import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'

const USERS = [
  { fullName: 'Nguyễn Thị Lan Anh', phone: '0901234501' },
  { fullName: 'Trần Minh Khoa', phone: '0912345602' },
  { fullName: 'Lê Thị Hương Giang', phone: '0923456703' },
  { fullName: 'Phạm Quốc Hùng', phone: '0934567804' },
  { fullName: 'Hoàng Thị Mỹ Linh', phone: '0945678905' },
  { fullName: 'Vũ Đình Phong', phone: '0956789006' },
  { fullName: 'Đặng Thị Thu Hà', phone: '0967890107' },
  { fullName: 'Bùi Văn Tú', phone: '0978901208' },
  { fullName: 'Đỗ Thị Thanh Tâm', phone: '0989012309' },
  { fullName: 'Ngô Xuân Trường', phone: '0990123410' },
  { fullName: 'Lý Thị Ngọc Bích', phone: '0901234511' },
  { fullName: 'Đinh Văn Hải', phone: '0912345612' },
  { fullName: 'Phan Thị Kim Yến', phone: '0923456713' },
  { fullName: 'Hồ Minh Tuấn', phone: '0934567814' },
  { fullName: 'Võ Thị Bảo Châu', phone: '0945678915' },
  { fullName: 'Tô Văn Dũng', phone: '0956789016' },
  { fullName: 'Lưu Thị Phương Thảo', phone: '0967890117' },
  { fullName: 'Dương Quang Vinh', phone: '0978901218' },
  { fullName: 'Mạc Thị Hồng Nhung', phone: '0989012319' },
  { fullName: 'Kiều Văn Sơn', phone: '0990123420' },
  { fullName: 'Trương Thị Bích Ngọc', phone: '0901234521' },
  { fullName: 'Cao Minh Nhật', phone: '0912345622' },
  { fullName: 'Lâm Thị Thu Hiền', phone: '0923456723' },
  { fullName: 'Đào Văn Khánh', phone: '0934567824' },
  { fullName: 'Tăng Thị Diễm Quỳnh', phone: '0945678925' },
  { fullName: 'Nghiêm Công Đạt', phone: '0956789026' },
  { fullName: 'Quách Thị Hải Yến', phone: '0967890127' },
  { fullName: 'Bế Văn Long', phone: '0978901228' },
  { fullName: 'Hứa Thị Thanh Vân', phone: '0989012329' },
  { fullName: 'Thái Quốc Bảo', phone: '0990123430' },
]

const BALANCES = [0, 0, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

async function seed() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config: await config })

  // Lấy packages để assign cho một số user
  const packagesRes = await payload.find({
    collection: 'packages',
    limit: 10,
    depth: 0,
    overrideAccess: true,
  })
  const packages = packagesRes.docs

  console.log(`Tạo ${USERS.length} users...\n`)
  let created = 0

  for (let i = 0; i < USERS.length; i++) {
    const { fullName, phone } = USERS[i]
    const index = i + 20 // tránh trùng với seedUsers cũ (1-11)
    const email = `user${index}@goldenland.vn`
    const balance = pick(BALANCES)
    const isVerified = Math.random() > 0.15
    const isActive = Math.random() > 0.05
    const createdDaysAgo = Math.floor(Math.random() * 180) // trong 6 tháng

    // 30% user có gói đang active
    const hasPackage = Math.random() < 0.3 && packages.length > 0
    const activePackage = hasPackage ? pick(packages as any[]) : null
    const packageExpiresAt = hasPackage
      ? new Date(Date.now() + Math.floor(Math.random() * 90) * 86_400_000).toISOString()
      : undefined

    try {
      await payload.create({
        collection: 'users',
        data: {
          email,
          password: 'goldenland@2024',
          fullName,
          phone,
          role: 'user',
          balance,
          isVerified,
          isActive,
          ...(activePackage ? { activePackage: activePackage.id, packageExpiresAt } : {}),
          lastLoginAt: Math.random() > 0.3 ? daysAgo(Math.floor(Math.random() * 30)) : undefined,
          createdAt: daysAgo(createdDaysAgo),
        } as any,
        overrideAccess: true,
      })
      created++
      process.stdout.write(`\r✓ ${created}/${USERS.length} — ${fullName}`)
    } catch (e: any) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        process.stdout.write(`\r⚠ Bỏ qua ${email} (đã tồn tại)`)
      } else {
        console.error(`\n✗ Lỗi ${email}:`, e.message)
      }
    }
  }

  console.log(`\n\n✓ Đã tạo ${created}/${USERS.length} users`)
  console.log('Password mặc định: goldenland@2024')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})