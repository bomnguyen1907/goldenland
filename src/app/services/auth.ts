import type { AxiosRequestConfig } from 'axios'
import { patchJSON, postJSON, getJSON } from '@/app/lib/api/http'

export type SignInResponse = {
  user: {
    id: number | string
    email: string
    role?: 'admin' | 'user'
    fullName?: string
    phone?: string
    avatarUrl?: string | null
    activePackage?: string | number | { id?: string | number } | null
    active_package_id?: string | number | null
  }
}

export type ProfileResponse = {
  id: string | number
  user: string | number
  displayName?: string
  dateOfBirth?: string
  gender?: string
  bio?: string
  address?: string
  provinceCode?: string
  wardCode?: string
}

export type CurrentUserResponse = SignInResponse['user'] & {
  avatar_id?: string | null
  availableVouchers?: Array<{
    id?: string | null
    quantity?: number | null
    discountValue?: number | null
    appliedFor?: 'normal' | 'vip' | null
  }>
}

export type UpdateAccountPayload = {
  fullName?: string
  phone?: string
  email?: string
  profile?: {
    displayName?: string
    address?: string
  }
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
}

// Register
export async function register(data: RegisterPayload, config?: AxiosRequestConfig): Promise<SignInResponse> {
  return postJSON<SignInResponse, RegisterPayload>('/api/users', data, config)
}

// Sign in
export async function signIn(email: string, password: string, config?: AxiosRequestConfig): Promise<SignInResponse> {
  return postJSON<SignInResponse, { email: string; password: string }>(
    '/api/users/login',
    { email, password },
    config,
  )
}

// Sign out
export async function signOut(config?: AxiosRequestConfig): Promise<void> {
  await postJSON<unknown, Record<string, never>>('/api/users/logout', {}, config)
}

// Fetch current user's profile
export async function fetchMyProfile(config?: AxiosRequestConfig): Promise<ProfileResponse | null> {
  try {
    const response = await getJSON<{ profile: ProfileResponse | null }>('/api/me/profile', config)
    return response.profile
  } catch {
    return null // Profile optional
  }
}

export async function fetchCurrentUser(config?: AxiosRequestConfig): Promise<CurrentUserResponse | null> {
  try {
    const response = await getJSON<{ user: CurrentUserResponse }>('/api/users/me?depth=0', config)
    const user = response.user

    return user
      ? {
          ...user,
          avatarUrl: user.avatarUrl ?? user.avatar_id ?? null,
        }
      : null
  } catch {
    return null
  }
}

export async function updateMyAccount(
  data: UpdateAccountPayload,
  config?: AxiosRequestConfig,
): Promise<{ user: CurrentUserResponse; profile: ProfileResponse | null }> {
  return patchJSON<{ user: CurrentUserResponse; profile: ProfileResponse | null }, UpdateAccountPayload>(
    '/api/me/profile',
    data,
    config,
  )
}

export async function uploadMyAvatar(
  file: File,
  config?: AxiosRequestConfig,
): Promise<{ avatarUrl: string; displayAvatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)

  return postJSON<{ avatarUrl: string; displayAvatarUrl: string }, FormData>(
    '/api/me/avatar',
    formData,
    config,
  )
}

export async function changeMyPassword(
  data: {
    currentPassword: string
    newPassword: string
  },
  config?: AxiosRequestConfig,
): Promise<{ success: boolean }> {
  return postJSON<{ success: boolean }, { currentPassword: string; newPassword: string }>(
    '/api/me/change-password',
    data,
    config,
  )
}
