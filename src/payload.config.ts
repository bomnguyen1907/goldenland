import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Profiles } from './collections/Profiles'
import { Properties } from './collections/Properties'
import { Projects } from './collections/Projects'
import { Media } from './collections/Media'
import { Investors } from './collections/Investors'
import { Articles } from './collections/Articles'
import { ArticleCategories } from './collections/ArticleCategories'
import { Contacts } from './collections/Contacts'
import { Reports } from './collections/Reports'
import { Packages } from './collections/Packages'
import { PostingPrices } from './collections/PostingPrices'
import { Vouchers } from './collections/Vouchers'
import { Orders } from './collections/Orders'
import { Notifications } from './collections/Notifications'
import { Favorites } from './collections/Favorites'
import { ViewHistory } from './collections/ViewHistory'
import { SpamBlacklist } from './collections/SpamBlacklist'
import { Promotions } from './collections/Promotions'

import { Settings } from './globals/Settings'

import { endpoints } from './endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [Settings],
  endpoints,
  collections: [
    Users,
    Profiles,
    Properties,
    Projects,
    Media,
    Investors,
    Articles,
    ArticleCategories,
    Contacts,
    Reports,
    Packages,
    PostingPrices,
    Vouchers,
    Orders,
    Notifications,
    Favorites,
    ViewHistory,
    SpamBlacklist,
    Promotions,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // Giới hạn pool để không vượt quá server limit (Neon/Supabase free = 15 sessions)
      // Dành ít nhất 3 connection cho Payload Admin, còn lại cho app
      max: 8,
      idleTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT || '',
        region: process.env.S3_REGION || 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
