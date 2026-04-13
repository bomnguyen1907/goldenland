import type { CollectionConfig } from 'payload'

import { activeOrAdmin, adminOnly } from '@/access'

export const Investors: CollectionConfig = {
  slug: 'investors',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: adminOnly,
    read: activeOrAdmin('isActive'),
    update: adminOnly,
    delete: adminOnly,

  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'website',
      type: 'text',
      maxLength: 500,
    },
    {
      name: 'phone',
      type: 'text',
      maxLength: 20,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'address',
      type: 'text',
      maxLength: 500,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}