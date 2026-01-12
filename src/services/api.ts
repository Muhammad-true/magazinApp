// Определяем базовый URL API
// ВАЖНО: Если сайт работает на HTTPS, API также должен работать на HTTPS
// Иначе браузер заблокирует запросы (Mixed Content)
const getApiBaseUrl = (): string => {
  // Если указана переменная окружения - используем её (приоритет)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Проверяем, работает ли сайт на HTTPS
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  
  // Если сайт на HTTPS, но API на HTTP - пытаемся использовать HTTPS версию
  // ВНИМАНИЕ: Это работает только если сервер API поддерживает HTTPS
  if (isHttps) {
    // Пробуем HTTPS версию API (если сервер поддерживает)
    const httpUrl = 'http://159.89.99.252:8080/api/v1'
    const httpsUrl = httpUrl.replace('http://', 'https://')
    // Возвращаем HTTPS версию (пользователь должен настроить SSL на сервере)
    // Если сервер не поддерживает HTTPS, нужно настроить переменную окружения VITE_API_URL
    return httpsUrl
  }
  
  // Для локальной разработки (HTTP) используем HTTP
  return 'http://159.89.99.252:8080/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  shopName: string
  inn: string
  description: string
  address: string
  cityId?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      name: string
      email: string
      phone: string
      role: string
    }
    shop: {
      id: string
      name: string
      inn: string
      description: string
      address: string
      cityId?: string
    }
    token: string
  }
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  subscriptionType: 'monthly' | 'yearly' | 'lifetime'
  price: number
  currency: string
  durationMonths: number
  isActive: boolean
  features: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  lemonsqueezyVariantId?: string
}

export interface PlansResponse {
  success: boolean
  data: {
    plans: SubscriptionPlan[]
  }
}

export interface SubscribeData {
  shopId: string
  subscriptionPlanId: string
  paymentProvider: string
  paymentTransactionId: string
  paymentAmount: number
  paymentCurrency?: string
  autoRenew: boolean
}

export interface PaymentIntentRequest {
  shopId: string
  subscriptionPlanId: string
  amount: number
  currency: string
}

export interface PaymentIntentResponse {
  success: boolean
  clientSecret: string
  paymentIntentId: string
}

export interface LemonSqueezyCheckoutRequest {
  shopId: string
  subscriptionPlanId: string
}

export interface LemonSqueezyCheckoutResponse {
  success: boolean
  checkoutUrl: string
}

export interface LicenseData {
  id: string
  licenseKey: string
  shopId: string
  activationType: string
  subscriptionType: string
  subscriptionStatus: string
  activatedAt: string
  expiresAt: string
  lastPaymentDate: string
  nextPaymentDate: string
  paymentProvider: string
  paymentTransactionId: string
  paymentAmount: number
  paymentCurrency: string
  userId: string
  isActive: boolean
  autoRenew: boolean
  isValid: boolean
  isExpired: boolean
  daysRemaining: number
  createdAt: string
  updatedAt: string
}

export interface SubscribeResponse {
  success: boolean
  message: string
  data: LicenseData
}

export interface City {
  id: string
  name: string
  nameEn?: string
  nameUz?: string
  nameTj?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CitiesResponse {
  success: boolean
  data: {
    cities: City[]
  }
}

export interface CityResponse {
  success: boolean
  data: City
}

export interface FindCityByLocationRequest {
  latitude: number
  longitude: number
}

export interface LoginData {
  phone: string
  password: string
}

export interface UserRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string
  isActive: boolean
  isSystem: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface UserAddress {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface UserData {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  inn?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isActive: boolean
  isGuest: boolean
  role: UserRole
  addresses: UserAddress[]
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: UserData
    token: string
    refreshToken: string
  }
}

export interface ShopLicense {
  licenseKey?: string
  activatedAt: string
  expiresAt: string
  daysRemaining: number | null
  price: number
  currency: string
  subscriptionType: 'monthly' | 'yearly' | 'lifetime'
  subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'pending'
  isValid: boolean
  isExpired: boolean
}

export interface City {
  id: string
  name: string
}

export interface ShopData {
  id: string
  name: string
  inn: string
  description: string
  logo?: string
  email?: string
  phone?: string
  address: string
  rating?: number
  isActive: boolean
  ownerId: string
  productsCount?: number
  subscribersCount?: number
  isSubscribed?: boolean
  createdAt: string
  license?: ShopLicense
  city?: City
  cityId?: string
}

export interface UserProfileResponse {
  success: boolean
  data: {
    user: UserData
    shop?: ShopData
  }
}

export interface LicensesResponse {
  success: boolean
  data: {
    licenses: LicenseData[]
  }
}

export interface TrialLicenseRequest {
  shopId: string
}

export interface TrialLicenseResponse {
  success: boolean
  message: string
  data: LicenseData
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export interface UserShopsResponse {
  success: boolean
  data: {
    shops: ShopData[]
    pagination?: PaginationData
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = 'Network error'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/shop-registration/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPlans(): Promise<PlansResponse> {
    return this.request<PlansResponse>('/subscriptions/plans', {
      method: 'GET',
    })
  }

  async subscribe(data: SubscribeData, token: string): Promise<SubscribeResponse> {
    return this.request<SubscribeResponse>('/shop-registration/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async getCities(): Promise<CitiesResponse> {
    const url = `${API_BASE_URL}/cities/`
    console.log('Fetching cities from:', url) // Отладка
    
    try {
      // Сначала пробуем стандартный запрос
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cities API error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Cities raw response:', data) // Отладка
      
      // Если ответ - массив городов напрямую
      if (Array.isArray(data)) {
        return {
          success: true,
          data: { cities: data }
        }
      }
      
      // Если ответ - объект с полем cities
      if (data.cities && Array.isArray(data.cities)) {
        return {
          success: true,
          data: { cities: data.cities }
        }
      }
      
      // Если ответ - объект с полем data.cities (стандартный формат)
      if (data.data && data.data.cities && Array.isArray(data.data.cities)) {
        return {
          success: true,
          data: { cities: data.data.cities }
        }
      }
      
      // Если ответ уже в формате CitiesResponse
      if (data.success && data.data && data.data.cities) {
        return data as CitiesResponse
      }
      
      // Если ничего не подошло, возвращаем пустой массив
      console.warn('Unexpected cities response format:', data)
      return {
        success: true,
        data: { cities: [] }
      }
    } catch (error: any) {
      console.error('Error fetching cities:', error)
      console.error('API URL:', url)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      // Более детальное сообщение об ошибке
      let errorMessage = 'Не удалось загрузить города'
      
      // Проверяем на Mixed Content ошибку
      if (error.message && (error.message.includes('Mixed Content') || error.message.includes('Failed to fetch'))) {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
        if (isHttps && url.startsWith('http://')) {
          errorMessage = 'Ошибка безопасности: сайт использует HTTPS, но API работает на HTTP. Пожалуйста, настройте SSL сертификат на сервере API или используйте HTTPS версию API через переменную окружения VITE_API_URL.'
        } else {
          errorMessage = `Не удалось подключиться к API. Проверьте, что сервер запущен на ${API_BASE_URL}`
        }
      } else if (error.message) {
        errorMessage = `Ошибка: ${error.message}`
      }
      
      throw new Error(errorMessage)
    }
  }

  async getCityById(id: string): Promise<CityResponse> {
    return this.request<CityResponse>(`/cities/${id}`, {
      method: 'GET',
    })
  }

  async findCityByLocation(data: FindCityByLocationRequest): Promise<CityResponse> {
    return this.request<CityResponse>('/cities/find-by-location', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('userToken')
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('Требуется авторизация')
    }

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
  }

  async login(data: LoginData): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch((error) => {
      // Обработка ошибок согласно API документации
      if (error.message?.includes('400')) {
        throw new Error('Неверные данные. Проверьте формат телефона и пароля.')
      }
      if (error.message?.includes('401')) {
        throw new Error('Неверный телефон или пароль.')
      }
      if (error.message?.includes('404')) {
        throw new Error('Эндпоинт входа еще не реализован на сервере. Пожалуйста, используйте регистрацию для создания нового аккаунта.')
      }
      if (error.message?.includes('500')) {
        throw new Error('Ошибка сервера. Попробуйте позже.')
      }
      throw error
    })
  }

  async getProfile(): Promise<UserProfileResponse> {
    // Пока эндпоинт может быть не готов, возвращаем ошибку, которую обработает Account
    return this.authenticatedRequest<UserProfileResponse>('/auth/me', {
      method: 'GET',
    }).catch((error) => {
      // Если эндпоинт не найден, пробрасываем ошибку для обработки в компоненте
      if (error.message?.includes('404')) {
        throw new Error('API_PROFILE_NOT_AVAILABLE')
      }
      throw error
    })
  }

  async getMyLicenses(): Promise<LicensesResponse> {
    // Пока эндпоинт может быть не готов, возвращаем ошибку, которую обработает Account
    return this.authenticatedRequest<LicensesResponse>('/licenses/my', {
      method: 'GET',
    }).catch((error) => {
      // Если эндпоинт не найден, пробрасываем ошибку для обработки в компоненте
      if (error.message?.includes('404')) {
        throw new Error('API_LICENSES_NOT_AVAILABLE')
      }
      throw error
    })
  }

  async getUserShops(): Promise<UserShopsResponse> {
    // Получаем список магазинов пользователя (защищенный эндпоинт)
    // Используем /shops/ для авторизованных пользователей
    return this.authenticatedRequest<UserShopsResponse>('/shops/', {
      method: 'GET',
    }).catch((error) => {
      // Если эндпоинт не найден, пробрасываем ошибку для обработки в компоненте
      if (error.message?.includes('404')) {
        throw new Error('API_SHOPS_NOT_AVAILABLE')
      }
      throw error
    })
  }

  async createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return this.authenticatedRequest<PaymentIntentResponse>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createTrialLicense(data: TrialLicenseRequest): Promise<TrialLicenseResponse> {
    return this.authenticatedRequest<TrialLicenseResponse>('/licenses/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error('Trial license creation error:', error)
      throw error
    })
  }

  async createLemonSqueezyCheckout(data: LemonSqueezyCheckoutRequest): Promise<LemonSqueezyCheckoutResponse> {
    console.log('Creating Lemon Squeezy checkout request:', {
      endpoint: '/payments/lemonsqueezy/checkout',
      data,
      baseUrl: API_BASE_URL,
      fullUrl: `${API_BASE_URL}/payments/lemonsqueezy/checkout`
    })
    
    // Эндпоинт публичный, авторизация не требуется
    return this.request<LemonSqueezyCheckoutResponse>('/payments/lemonsqueezy/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error('Lemon Squeezy checkout error:', error)
      throw error
    })
  }

  logout(): void {
    localStorage.removeItem('userToken')
    localStorage.removeItem('shopId')
    localStorage.removeItem('userData')
    localStorage.removeItem('licenseData')
    localStorage.removeItem('refreshToken')
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

export const apiService = new ApiService()

