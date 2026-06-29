import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'

const TARGET_EMAIL = 'admin@gmail.com'
const NEW_PASSWORD = 'Admin@123'

async function main() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config: await config })

  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: TARGET_EMAIL } },
    limit: 1,
    depth: 0,
  })

  if (found.docs.length === 0) {
    console.error(`Không tìm thấy user với email ${TARGET_EMAIL}`)
    process.exit(1)
  }

  const user = found.docs[0] as any

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      password: NEW_PASSWORD,
      isVerified: true,
    },
  })

  console.log('\n=== Reset mật khẩu thành công ===')
  console.log(`Email   : ${TARGET_EMAIL}`)
  console.log(`Password: ${NEW_PASSWORD}`)
  console.log('Đăng nhập tại: /dang-nhap')
  console.log('\nLưu ý: vào /quan-tri đổi mật khẩu mới ngay sau khi đăng nhập.\n')

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})