import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import type { AuthToken, CommonResponse, SchemaErrorResponse } from '../types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:16000'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as CommonResponse<unknown> | undefined)?.resultMsg
    if (message) {
      return message
    }
  }
  return error instanceof Error ? error.message : fallback
}

const SCHEMA_VALIDATE_ERROR_CODE = '8000'

export const http = axios.create({
  baseURL: API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function reissueAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState()
  if (!refreshToken) {
    return null
  }
  try {
    const response = await axios.post<CommonResponse<AuthToken>>(
      `${API_BASE_URL}/api/v1/auth/reissue`,
      { refreshToken },
    )
    const tokens = response.data.data
    if (!tokens) {
      logout()
      return null
    }
    setTokens(tokens.accessToken, tokens.refreshToken)
    return tokens.accessToken
  } catch {
    logout()
    return null
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<CommonResponse<SchemaErrorResponse>>) => {
    const responseBody = error.response?.data
    if (responseBody?.resultCode === SCHEMA_VALIDATE_ERROR_CODE) {
      const firstMessage = responseBody.data?.errorList[0]?.message
      if (firstMessage) {
        useToastStore.getState().show(firstMessage)
      }
    }

    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }
    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = reissueAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newAccessToken = await refreshPromise
    if (!newAccessToken) {
      return Promise.reject(error)
    }

    originalRequest.headers = originalRequest.headers ?? {}
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    return http(originalRequest)
  },
)
