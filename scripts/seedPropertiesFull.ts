import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'

const TITLES = [
  'Bán nhà mặt phố trung tâm',
  'Bán đất nền ven biển',
  'Bán biệt thự nghỉ dưỡng sang trọng',
  'Nhà liền kề khu đô thị mới',
  'Bán shophouse sinh lời cao',
  'Căn hộ mini giá rẻ cho sinh viên',
  'Bán nhà cấp 4 tiện xây mới',
  'Chính chủ cần bán gấp căn góc',
  'Bán đất thổ cư sổ đỏ chính chủ',
  'Căn hộ Penthouse view toàn thành phố',
  'Bán nhà trong ngõ ô tô đỗ cửa'
]

const DESCRIPTIONS = [
  'Vị trí đắc địa, giao thông thuận tiện. Gần trường học, bệnh viện, chợ. Khu dân cư văn minh, an ninh tốt. Không gian thoáng đãng, mang đến cuộc sống lý tưởng cho gia đình bạn.',
  'Thiết kế hiện đại, tối ưu công năng sử dụng. Đầy đủ nội thất cao cấp chỉ việc xách vali về ở. Tòa nhà trang bị thang máy tốc độ cao, hệ thống phòng cháy chữa cháy an toàn.',
  'Cơ hội đầu tư sinh lời cao. Tiềm năng tăng giá trong tương lai khi có dự án hạ tầng lớn đi qua. Xung quanh đầy đủ các tiện ích ngoại khu vượt trội.',
  'Không gian sống trong lành, nhiều tiện ích xung quanh. Phù hợp cho gia đình có người già và trẻ nhỏ. An ninh 24/7, bãi đỗ xe thông minh rộng rãi.',
  'Giấy tờ pháp lý rõ ràng, sổ đỏ sẵn sàng giao dịch. Sang tên nhanh chóng trong ngày. Hỗ trợ vay vốn ngân hàng lên đến 70% giá trị với lãi suất ưu đãi.'
]

const PROPERTY_TYPES_NO_APARTMENT = ['house', 'land', 'villa', 'townhouse', 'shophouse', 'warehouse', 'commercial']
const DIRECTIONS = ['east', 'west', 'south', 'north', 'northeast', 'southeast', 'northwest', 'southwest']
const LEGAL_STATUSES = ['red_book', 'sale_contract', 'pending', 'other']
const FURNITURE_STATUSES = ['luxury', 'full', 'basic', 'none']

// Location Mocks (Ho Chi Minh City and Hanoi approx)
const LOCATIONS = [
  { provinceCode: '79', wardCode: '26740', street: 'Nguyễn Huệ', district: 'Quận 1', city: 'TP. Hồ Chí Minh', baseLat: 10.7732, baseLng: 106.7034 },
  { provinceCode: '79', wardCode: '26743', street: 'Lê Duẩn', district: 'Quận 1', city: 'TP. Hồ Chí Minh', baseLat: 10.7828, baseLng: 106.6993 },
  { provinceCode: '79', wardCode: '26875', street: 'Nguyễn Thị Minh Khai', district: 'Quận 3', city: 'TP. Hồ Chí Minh', baseLat: 10.7769, baseLng: 106.6951 },
  
  { provinceCode: '1', wardCode: '00001', street: 'Tràng Tiền', district: 'Quận Hoàn Kiếm', city: 'Hà Nội', baseLat: 21.0253, baseLng: 105.8524 },
  { provinceCode: '1', wardCode: '00025', street: 'Kim Mã', district: 'Quận Ba Đình', city: 'Hà Nội', baseLat: 21.0315, baseLng: 105.8202 },
  
  { provinceCode: '48', wardCode: '20230', street: 'Võ Nguyên Giáp', district: 'Quận Sơn Trà', city: 'Đà Nẵng', baseLat: 16.0601, baseLng: 108.2435 },
  { provinceCode: '48', wardCode: '20194', street: 'Bạch Đằng', district: 'Quận Hải Châu', city: 'Đà Nẵng', baseLat: 16.0664, baseLng: 108.2231 },

  { provinceCode: '74', wardCode: '25834', street: 'Đại lộ Bình Dương', district: 'TP. Thủ Dầu Một', city: 'Bình Dương', baseLat: 10.9806, baseLng: 106.6745 },
  { provinceCode: '74', wardCode: '25846', street: 'Phạm Ngọc Thạch', district: 'TP. Thủ Dầu Một', city: 'Bình Dương', baseLat: 11.0022, baseLng: 106.6661 },

  { provinceCode: '77', wardCode: '26155', street: 'Đồng Khởi', district: 'TP. Biên Hòa', city: 'Đồng Nai', baseLat: 10.9575, baseLng: 106.8427 },
  { provinceCode: '77', wardCode: '26161', street: 'Phạm Văn Thuận', district: 'TP. Biên Hòa', city: 'Đồng Nai', baseLat: 10.9416, baseLng: 106.8306 },
]

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const getRandomBoolean = () => Math.random() >= 0.5
const randomOffset = () => (Math.random() - 0.5) * 0.01 // Add slight variation to coords

async function seed() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config: await config })

  console.log('--- Cleaning up previous seed properties ---')
  await payload.delete({
    collection: 'properties',
    where: {
      or: [
        { title: { contains: 'Mã TS' } },
        { title: { contains: 'tại' } }
      ]
    }
  })

  console.log('--- Seeding 100 realistic properties with FULL metadata ---')

  for (let i = 1; i <= 100; i++) {
    const hasProject = Math.random() >= 0.4
    const projectId = hasProject ? getRandomInt(72, 104) : null

    let propertyType = 'apartment'
    if (!hasProject) {
      propertyType = getRandomItem(PROPERTY_TYPES_NO_APARTMENT)
    } else {
      const projectTypes = ['apartment', 'apartment', 'villa', 'townhouse', 'shophouse', 'condotel', 'land']
      propertyType = getRandomItem(projectTypes)
    }

    const listingType = 'sale'
    const loc = getRandomItem(LOCATIONS)
    const houseNumber = getRandomInt(1, 200)
    const titleBase = getRandomItem(TITLES)
    const title = `${titleBase} tại ${loc.street}, ${loc.city}`
    const slug = `${title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')}-${getRandomInt(10000, 99999)}`
    const description = `${getRandomItem(DESCRIPTIONS)} ${getRandomItem(DESCRIPTIONS)}`
    
    let price = getRandomInt(1, 20) * 1000000000 // 1 to 20 tỷ
    let priceUnit = 'total'

    const area = getRandomInt(30, 300)
    const bedrooms = propertyType === 'land' || propertyType === 'warehouse' ? 0 : getRandomInt(1, 5)
    const bathrooms = propertyType === 'land' || propertyType === 'warehouse' ? 0 : getRandomInt(1, 4)

    const numImages = getRandomInt(1, 5)
    const images = Array.from({ length: numImages }, (_, idx) => ({
      image: `https://ccwmekftdqxobmxscvzy.supabase.co/storage/v1/object/public/Properties/property-${i}/${idx + 1}.jpg`,
      sort: idx + 1
    }))

    const userId = getRandomInt(1, 11)
    


    const isVerified = getRandomBoolean()

    try {
      await payload.create({
        collection: 'properties',
        data: {
          title,
          slug,
          description,
          listingType,
          postType: getRandomBoolean() ? 'normal' : 'vip',
          price,
          priceUnit,
          propertyType: propertyType as any,
          area,
          bedrooms,
          bathrooms,
          roadWidth: getRandomBoolean() ? getRandomInt(3, 20) : undefined,
          facadeWidth: getRandomBoolean() ? getRandomInt(4, 15) : undefined,
          direction: getRandomItem(DIRECTIONS) as any,
          legalStatus: getRandomItem(LEGAL_STATUSES) as any,
          furnitureStatus: getRandomItem(FURNITURE_STATUSES) as any,
          
          // FULL LOCATION
          provinceCode: loc.provinceCode,
          wardCode: loc.wardCode,
          street: loc.street,
          address: `Số ${houseNumber} ${loc.street}, ${loc.district}, ${loc.city}`,
          latitude: loc.baseLat + randomOffset(),
          longitude: loc.baseLng + randomOffset(),

          // MEDIA
          images,
          videoUrl: getRandomBoolean() ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined,

          // STATUS & VERIFICATION
          status: 'active',
          label: getRandomItem(['normal', 'vip', 'hot', 'premium']) as any,
          isVerified,
          verifiedBy: isVerified ? getRandomInt(1, 11) : undefined,
          verifiedAt: isVerified ? new Date(Date.now() - getRandomInt(1, 10) * 86400000).toISOString() : undefined,

          // SEO
          seoTitle: `${title} | BĐS`.substring(0, 70),
          seoDescription: description.substring(0, 150),
          seoKeywords: `bán nhà, ${propertyType}, ${loc.street}, bđs`,

          user: userId,
          project: projectId,
        },
      })
      console.log(`Created full property ${i}/100: ${title}`)
    } catch (error) {
      console.error(`Failed to create property ${i}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('--- Full Property seed complete ---')
  process.exit(0)
}

seed()
