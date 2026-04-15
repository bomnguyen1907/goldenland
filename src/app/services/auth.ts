import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

type ApiErrorResponse = {
  error?: string
}

export type SignInResponse = {
  user: {
    id: number | string
    email: string,
    fullName?: string,
    phone?: string,
    avatarUrl?: string,
  }
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
}

// Register
export async function register(data: RegisterPayload, config?: AxiosRequestConfig): Promise<SignInResponse> {
  try {
    const response = await axios.post<SignInResponse>('/api/users', data, config)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as ApiErrorResponse | undefined
      const errorMessage = payload?.error ?? error.message

      throw new Error(errorMessage)
    }

    throw error
  }
}

// Sign in
export async function signIn(email: string, password: string, config?: AxiosRequestConfig): Promise<SignInResponse> {
  try {
    const response = await axios.post<SignInResponse>('/api/users/login', { email, password }, config)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as ApiErrorResponse | undefined
      const errorMessage = payload?.error ?? error.message

      throw new Error(errorMessage)
    }

    throw error
  }
}

// Sign out
export async function signOut(config?: AxiosRequestConfig): Promise<void> {
  try {
    await axios.post('/api/users/logout', {}, config)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as ApiErrorResponse | undefined
      const errorMessage = payload?.error ?? error.message

      throw new Error(errorMessage)
    }

    throw error
  }
}
