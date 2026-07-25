/**
 * Axios API client — cookie-based authentication.
 *
 * Key change: withCredentials: true
 *   Tells the browser to send HTTP-only cookies on every cross-origin request.
 *   Without this, the browser strips cookies from cross-origin Axios calls.
 *
 * Removed: Authorization header interceptor
 *   No longer needed — the browser attaches the cookie automatically.
 *   Token is never read or stored in JavaScript.
 *
 * Added: 401 response interceptor
 *   On 401, attempts a silent token refresh via POST /auth/refresh.
 *   If refresh succeeds, retries the original request once.
 *   If refresh fails (refresh token expired), redirects to /login.
 */

import axios, { type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../constants'
import type { Lead, LeadFormData, AuthResponse, DashboardStats, LeadStatus } from '../types'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // ← sends HTTP-only cookies automatically
})

// Track whether a refresh is already in progress to prevent parallel refresh loops
let isRefreshing = false
let refreshSubscribers: Array<(retryConfig: AxiosRequestConfig) => void> = []

const onRefreshComplete = (retryConfig: AxiosRequestConfig) => {
  refreshSubscribers.forEach((cb) => cb(retryConfig))
  refreshSubscribers = []
}

// 401 interceptor — attempt silent token refresh, then retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401, and not for auth endpoints themselves
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    const alreadyRetried = originalRequest?._retry

    if (error.response?.status === 401 && !isAuthEndpoint && !alreadyRetried) {
      if (isRefreshing) {
        // Queue the retry until refresh completes
        return new Promise((resolve) => {
          refreshSubscribers.push((retryConfig) => resolve(apiClient(retryConfig)))
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh — sends refresh_token cookie automatically
        await apiClient.post('/auth/refresh')
        isRefreshing = false
        onRefreshComplete(originalRequest)
        // Retry the original request — new access_token cookie is now set
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — session fully expired
        isRefreshing = false
        refreshSubscribers = []
        // Redirect to login without exposing token details
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth APIs ───────────────────────────────────────────────────────────────

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Server sets HTTP-only cookie in response — we only use the message
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export const logout = async (): Promise<void> => {
  // Server clears cookies — we just need to call the endpoint
  await apiClient.post('/auth/logout')
}

// ─── Public APIs ─────────────────────────────────────────────────────────────

export const submitLead = async (lead: LeadFormData): Promise<Lead> => {
  const { data } = await apiClient.post<Lead>('/leads', lead)
  return data
}

// ─── Protected APIs ──────────────────────────────────────────────────────────

export const getLeads = async (search?: string): Promise<Lead[]> => {
  const { data } = await apiClient.get<Lead[]>('/leads', {
    params: search ? { search } : {},
  })
  return data
}

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead> => {
  const { data } = await apiClient.patch<Lead>(`/leads/${id}/status`, { status })
  return data
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
  return data
}

export default apiClient
