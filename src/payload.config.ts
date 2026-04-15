import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Profiles } from './collections/Profiles'
import { Listings } from './collections/Listings'
import { Projects } from './collections/Projects'
import { Media } from './collections/Media'
import { Investors } from './collections/Investors'
import { Articles } from './collections/Articles'
import { ArticleCategories } from './collections/ArticleCategories'
import { Banners } from './collections/Banners'
import { Contacts } from './collections/Contacts'
import { Reports } from './collections/Reports'
import { Packages } from './collections/Packages'
import { PostingPrices } from './collections/PostingPrices'
import { Vouchers } from './collections/Vouchers'
import { Orders } from './collections/Orders'
import { Notifications } from './collections/Notifications'
import { SavedListings } from './collections/SavedListings'
import { ViewHistory } from './collections/ViewHistory'
import { SpamBlacklist } from './collections/SpamBlacklist'

import { Settings } from './app/globals/Settings'

import { divisionEndpoints } from './endpoints/divisions'
import { purchasePackage } from './endpoints/purchasePackage'
import { searchListings } from './endpoints/searchListings'
import { toggleSavedListing } from './endpoints/toggleSavedListing'
import { trackView } from './endpoints/trackView'
import {
  markNotificationRead,
  markAllNotificationsRead,
  countUnreadNotifications,
} from './endpoints/notifications'
import { myDashboard } from './endpoints/myDashboard'
import { projectDetail, projects } from './endpoints/projects'
import { getNewListings } from './endpoints/listings'

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
  endpoints: [
    ...divisionEndpoints,
    purchasePackage,
    searchListings,
    toggleSavedListing,
    trackView,
    markNotificationRead,
    markAllNotificationsRead,
    countUnreadNotifications,
    myDashboard,
    projects,
    projectDetail,
    getNewListings,
  ],
  collections: [Users, Profiles, Listings, Projects, Media, Investors, Articles, ArticleCategories, Banners, Contacts, Reports, Packages, PostingPrices, Vouchers, Orders,
    Notifications, SavedListings, ViewHistory, SpamBlacklist
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  sharp,
  plugins: [],
})
