import type { Endpoint } from 'payload'

import {
  bulkCreateFavorites,
  createFavorite,
  deleteFavorite,
  getFavorites,
} from './favorites'
import { changeMyPassword, meProfile, updateMeProfile, uploadMyAvatar } from './me'
import { myDashboard } from './myDashboard'
import {
  countUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications'

export const accountEndpoints: Endpoint[] = [
  getFavorites,
  createFavorite,
  deleteFavorite,
  bulkCreateFavorites,
  markNotificationRead,
  markAllNotificationsRead,
  countUnreadNotifications,
  myDashboard,
  meProfile,
  updateMeProfile,
  uploadMyAvatar,
  changeMyPassword,
]
