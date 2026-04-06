import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'fullName',
  },
  auth: true,
  fields: [
    // --- Thông tin cơ bản ---
    {
      name: 'fullName',
      type: 'text',
      required: true,
      maxLength: 150,
    },
    {
      name: 'phone',
      type: 'text',
      unique: true,
      maxLength: 20,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },

    // --- Role (hardcode, không tạo collection riêng) ---
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Agent', value: 'agent' },
        { label: 'User', value: 'user' },
      ],
    },

    // --- Tài chính ---
    {
      name: 'balance',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Số dư tài khoản (VNĐ)',
      },
    },

    // --- Trạng thái ---
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },

    // --- Token (ẩn khỏi admin panel) ---
    {
      name: 'verificationToken',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'resetToken',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'resetTokenExp',
      type: 'date',
      admin: {
        hidden: true,
      },
    },

    // --- Theo dõi ---
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Lần đăng nhập cuối',
      },
    },
  ],
}