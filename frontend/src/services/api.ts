// Generic API client abstraction configured for future backend integration
const API_BASE_URL = (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || 'http://localhost:8001/api';
const API_URLS = [API_BASE_URL, 'http://localhost:8000/api'].filter((url, index, all) => all.indexOf(url) === index);


export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body ?? {}) });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body ?? {}) });
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const token = localStorage.getItem('lld_mentor_token');
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    let lastError: unknown;
    for (const baseUrl of [this.baseUrl, ...API_URLS.filter((url) => url !== this.baseUrl)]) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          // An HTTP error means the backend was reached. Do not retry it
          // against another base URL or hide the useful server message.
          throw new Error(`API Error: ${body.detail || `HTTP ${response.status}`}`);
        }
        return response.status === 204 ? (undefined as T) : response.json();
      } catch (error) {
        lastError = error;
        if (error instanceof Error && error.message.startsWith('API Error:')) throw error;
      }
    }
    const detail = lastError instanceof Error ? lastError.message : 'unknown network error';
    throw new Error(`Backend request failed for ${endpoint}: ${detail}`);
  }
}

export const api = new ApiClient();
