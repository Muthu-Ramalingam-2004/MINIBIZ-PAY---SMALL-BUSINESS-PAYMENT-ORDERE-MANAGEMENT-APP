function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (envUrl && envUrl.trim() !== '') {
    let cleaned = envUrl.trim().replace(/\/+$/, '')
    if (!cleaned.endsWith('/api') && !cleaned.includes('/api/')) {
      cleaned = `${cleaned}/api`
    }
    return cleaned
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://minibiz-pay-backend.onrender.com/api'
    }
    const protocol = window.location.protocol
    return `${protocol}//${hostname}:5000/api`
  }
  return 'http://localhost:5000/api'
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<{ success: boolean; data?: T; count?: number; message?: string; error?: string }> {
  const { timeoutMs = 10000, ...fetchOptions } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const baseUrl = getApiBaseUrl()
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`

    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const json = await res.json()
    if (!res.ok) {
      return { success: false, error: json.error || `HTTP ${res.status}` }
    }
    return json
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      console.warn(`[API Client Timeout] ${endpoint} timed out after ${timeoutMs}ms`)
      return { success: false, error: 'Server response timed out. Please try again.' }
    }
    console.warn(`[API Client Error] ${endpoint}:`, err.message || err)
    return { success: false, error: err.message || 'Network connection error' }
  }
}

