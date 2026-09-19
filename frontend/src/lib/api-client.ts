function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:5000/api`
  }
  return envUrl || 'http://localhost:5000/api'
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; count?: number; message?: string; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const json = await res.json()
    if (!res.ok) {
      return { success: false, error: json.error || `HTTP ${res.status}` }
    }
    return json
  } catch (err: any) {
    console.warn(`[API Client Error] ${endpoint}:`, err.message || err)
    return { success: false, error: err.message || 'Network connection error' }
  }
}
