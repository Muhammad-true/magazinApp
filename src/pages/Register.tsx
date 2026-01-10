import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { apiService, RegisterData, UserData } from '../services/api'
import './Register.css'

const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    inn: '',
    description: '',
    address: '',
  })

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    if (apiService.isAuthenticated()) {
      setIsAuthenticated(true)
      loadUserData()
    }
  }, [])

  const loadUserData = async () => {
    try {
      // Сначала пытаемся загрузить из localStorage
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          // Новый формат: userData - это объект UserData напрямую
          // Старый формат: userData содержит { user, shop }
          let userData: UserData | null = null
          if (parsed.id && parsed.name) {
            userData = parsed
          } else if (parsed.user) {
            userData = parsed.user
          }

          if (userData) {
            // Автоматически заполняем личные данные
            setFormData(prev => ({
              ...prev,
              name: userData!.name || '',
              email: userData!.email || '',
              phone: userData!.phone || '',
            }))
          }
        } catch (e) {
          console.warn('Failed to parse saved user data:', e)
        }
      }

      // Пытаемся загрузить через API
      try {
        const profileResponse = await apiService.getProfile()
        if (profileResponse.success) {
          const userData = profileResponse.data.user
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          }))
        }
      } catch (apiErr: any) {
        // Если API не доступен, используем данные из localStorage
        if (apiErr.message === 'API_PROFILE_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
          console.info('Profile API endpoint not available, using localStorage data')
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('common.required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('common.required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('common.invalidEmail')
    }

    // Пароль обязателен только если пользователь не авторизован
    if (!isAuthenticated) {
      if (!formData.password) {
        newErrors.password = t('common.required')
      } else if (formData.password.length < 6) {
        newErrors.password = t('common.minLength', { count: 6 })
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('common.required')
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = t('common.required')
    }

    if (!formData.inn.trim()) {
      newErrors.inn = t('common.required')
    }

    if (!formData.address.trim()) {
      newErrors.address = t('common.required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      const response = await apiService.register(formData)
      
      // Сохраняем данные в localStorage для следующих шагов
      localStorage.setItem('userToken', response.data.token)
      localStorage.setItem('shopId', response.data.shop.id)
      localStorage.setItem('userData', JSON.stringify(response.data))
      
      // После регистрации нового магазина переходим к выбору магазина
      // Передаем флаг, что был создан новый магазин
      navigate('/shop-selection', { state: { newShopCreated: true, newShopId: response.data.shop.id } })
    } catch (error: any) {
      setErrors({ submit: error.message || t('common.error') })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-container">
          <div className="register-header">
            <h1 className="register-title">{t('register.title')}</h1>
            <p className="register-subtitle">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-section">
              <h2 className="form-section-title">{t('register.personalInfo')}</h2>
              
              <div className="form-group">
                <label className="form-label">{t('register.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isAuthenticated}
                  readOnly={isAuthenticated}
                  className={`form-input ${errors.name ? 'error' : ''} ${isAuthenticated ? 'disabled' : ''}`}
                  placeholder={t('register.name')}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('register.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isAuthenticated}
                  readOnly={isAuthenticated}
                  className={`form-input ${errors.email ? 'error' : ''} ${isAuthenticated ? 'disabled' : ''}`}
                  placeholder={t('register.email')}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {!isAuthenticated && (
                <div className="form-group">
                  <label className="form-label">{t('register.password')}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder={t('register.password')}
                  />
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('register.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isAuthenticated}
                  readOnly={isAuthenticated}
                  className={`form-input ${errors.phone ? 'error' : ''} ${isAuthenticated ? 'disabled' : ''}`}
                  placeholder="+998901234567"
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">{t('register.shopInfo')}</h2>
              
              <div className="form-group">
                <label className="form-label">{t('register.shopName')}</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className={`form-input ${errors.shopName ? 'error' : ''}`}
                  placeholder={t('register.shopName')}
                />
                {errors.shopName && <div className="form-error">{errors.shopName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('register.inn')}</label>
                <input
                  type="text"
                  name="inn"
                  value={formData.inn}
                  onChange={handleChange}
                  className={`form-input ${errors.inn ? 'error' : ''}`}
                  placeholder={t('register.inn')}
                />
                {errors.inn && <div className="form-error">{errors.inn}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('register.description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder={t('register.description')}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('register.address')}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`form-input ${errors.address ? 'error' : ''}`}
                  placeholder={t('register.address')}
                />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>
            </div>

            {errors.submit && (
              <div className="alert alert-error">{errors.submit}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('register.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register

