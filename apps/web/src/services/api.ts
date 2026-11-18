import { ApiError, ApiResponse, PaginatedResponse } from '@generalstaff/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || 'An error occurred',
          code: data.code,
          statusCode: response.status,
          details: data.details,
        };
        return { success: false, data: null as T, errors: { _: [error.message] } };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        data: null as T,
        errors: { _: [error instanceof Error ? error.message : 'Network error'] },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Division endpoints
  async getDivisions(params?: { page?: number; pageSize?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.search) query.set('search', params.search);
    return this.get<PaginatedResponse<any>>(`/divisions?${query.toString()}`);
  }

  async getDivision(id: string) {
    return this.get<any>(`/divisions/${id}`);
  }

  async createDivision(data: any) {
    return this.post<any>('/divisions', data);
  }

  async updateDivision(id: string, data: any) {
    return this.put<any>(`/divisions/${id}`, data);
  }

  async deleteDivision(id: string) {
    return this.delete<any>(`/divisions/${id}`);
  }

  async calculateDivisionStats(data: any) {
    return this.post<any>('/divisions/calculate', data);
  }

  async validateDivision(data: any) {
    return this.post<any>('/divisions/validate', data);
  }

  // Share endpoints
  async createShareLink(divisionId: string, expiresIn?: number) {
    return this.post<any>('/shares', { divisionId, expiresIn });
  }

  async getShareLink(slug: string) {
    return this.get<any>(`/shares/${slug}`);
  }

  // Analysis endpoints
  async createAnalysis(divisionId: string) {
    return this.post<any>('/analysis', { divisionId });
  }

  async getAnalysis(id: string) {
    return this.get<any>(`/analysis/${id}`);
  }

  // Static data endpoints
  async getCountries() {
    return this.get<any[]>('/static/countries');
  }

  async getEquipment() {
    return this.get<any[]>('/static/equipment');
  }

  async getBattalions() {
    return this.get<any[]>('/static/battalions');
  }

  async getSupportCompanies() {
    return this.get<any[]>('/static/support-companies');
  }

  async getDoctrines() {
    return this.get<any[]>('/static/doctrines');
  }

  async getNationalSpirits() {
    return this.get<any[]>('/static/national-spirits');
  }

  async getTechnologies() {
    return this.get<any[]>('/static/technologies');
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.post<{ user: any; tokens: any }>('/auth/login', credentials);
  }

  async register(data: { email: string; password: string; username: string }) {
    return this.post<{ user: any; tokens: any }>('/auth/register', data);
  }

  async refreshToken(refreshToken: string) {
    return this.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  }

  async logout() {
    return this.post<void>('/auth/logout', {});
  }

  async getMe() {
    return this.get<any>('/auth/me');
  }
}

const api = new ApiClient();

// Named exports for backwards compatibility with DivisionDesigner
export const divisionApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.getDivisions(params),

  get: (id: string) =>
    api.getDivision(id),

  create: (data: any) =>
    api.createDivision(data),

  update: (id: string, data: any) =>
    api.updateDivision(id, data),

  delete: (id: string) =>
    api.deleteDivision(id),

  clone: (id: string) =>
    api.post(`/divisions/${id}/clone`, {}),
};

export const staticApi = {
  countries: () =>
    api.getCountries(),

  equipment: (countryTag: string, category?: string) =>
    api.get(`/static/equipment/${countryTag}${category ? `?category=${category}` : ''}`),

  doctrines: (countryTag: string) =>
    api.get(`/static/doctrines/${countryTag}`),

  spirits: (countryTag: string) =>
    api.get(`/static/spirits/${countryTag}`),

  technologies: (countryTag: string) =>
    api.get(`/static/technologies/${countryTag}`),
};

export const shareApi = {
  create: (divisionId: string, days: number = 30) =>
    api.createShareLink(divisionId, days),

  get: (slug: string) =>
    api.getShareLink(slug),

  delete: (slug: string) =>
    api.delete<any>(`/shares/${slug}`),
};

export const analysisApi = {
  create: (divisionId: string) =>
    api.createAnalysis(divisionId),

  get: (analysisId: string) =>
    api.getAnalysis(analysisId),

  list: (divisionId: string) =>
    api.get(`/analysis/division/${divisionId}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.login({ email, password }),

  register: (email: string, password: string, username: string) =>
    api.register({ email, password, username }),

  me: () =>
    api.getMe(),

  refresh: () =>
    api.post('/auth/refresh', {}),
};

// Default export
export default api;