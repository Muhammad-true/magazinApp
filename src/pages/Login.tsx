import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { apiService, LoginData } from '../services/api'
import './Login.css'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<LoginData>({
    phone: '',
    password: '',
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = t('common.required')
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('common.invalidPhone')
    }

    if (!formData.password) {
      newErrors.password = t('common.required')
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
      const response = await apiService.login(formData)
      
      if (response.success) {
        // Сохраняем данные в localStorage
        localStorage.setItem('userToken', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
        
        // Перенаправляем на страницу аккаунта
        navigate('/account')
      } else {
        setErrors({ submit: response.message || t('common.error') })
      }
    } catch (error: any) {
      setErrors({ submit: error.message || t('common.error') })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">{t('login.title')}</h1>
            <p className="login-subtitle">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                {t('login.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder={t('login.phonePlaceholder')}
                disabled={loading}
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('login.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={t('login.password')}
                disabled={loading}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? t('login.processing') : t('login.submit')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {t('login.noAccount')}{' '}
              <Link to="/register" className="link">
                {t('login.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
