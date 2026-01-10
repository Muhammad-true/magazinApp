import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { apiService, SubscriptionPlan } from '../services/api'
import './Subscription.css'

const Subscription = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Перенаправляем на страницу выбора магазина, так как subscription больше не нужна
    const shopId = localStorage.getItem('shopId')
    if (!shopId) {
      if (apiService.isAuthenticated()) {
        navigate('/shop-selection')
      } else {
        navigate('/register')
      }
    } else {
      // Если shopId есть, переходим сразу на оплату
      navigate('/payment')
    }
  }, [navigate])

  const checkUserShops = async () => {
    try {
      // Пытаемся загрузить магазины
      try {
        const shopsResponse = await apiService.getUserShops()
        if (shopsResponse.success && shopsResponse.data.shops.length > 0) {
          // Если есть магазины - показываем выбор
          navigate('/shop-selection')
          return
        }
      } catch (apiErr: any) {
        // Если API не доступен, проверяем localStorage
        const savedUserData = localStorage.getItem('userData')
        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData)
            if (parsed.shop && parsed.shop.id) {
              // Есть магазин в localStorage - используем его
              localStorage.setItem('shopId', parsed.shop.id)
    loadPlans()
              return
            }
          } catch (e) {
            // Игнорируем ошибку парсинга
          }
        }
      }
      
      // Если магазинов нет - переходим на регистрацию
      navigate('/register')
    } catch (err) {
      // В случае ошибки переходим на регистрацию
      navigate('/register')
    }
  }

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPlans()
      setPlans(response.data.plans.filter(plan => plan.isActive))
    } catch (err: any) {
      setError(err.message || t('subscription.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    localStorage.setItem('selectedPlan', JSON.stringify(plan))
    navigate('/payment')
  }

  const parseFeatures = (featuresStr: string) => {
    try {
      return JSON.parse(featuresStr)
    } catch {
      return {}
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="subscription-page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="subscription-page">
      <div className="container">
        <div className="subscription-header">
          <h1 className="section-title">{t('subscription.title')}</h1>
          <p className="section-subtitle">{t('subscription.subtitle')}</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const features = parseFeatures(plan.features)
            const isPopular = plan.subscriptionType === 'yearly'
            const monthlyPrice = plan.durationMonths > 0 
              ? plan.price / plan.durationMonths 
              : plan.price

            return (
              <div
                key={plan.id}
                className={`plan-card card ${isPopular ? 'popular' : ''}`}
              >
                {isPopular && (
                  <div className="plan-badge">{t('pricing.popular')}</div>
                )}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-price">
                  <span className="price-amount">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  {plan.subscriptionType === 'lifetime' ? (
                    <span className="price-period">{t('pricing.oneTime')}</span>
                  ) : plan.subscriptionType === 'yearly' ? (
                    <span className="price-period">
                      {t('pricing.perYear')} ({formatPrice(monthlyPrice, plan.currency)} {t('pricing.perMonth')})
                    </span>
                  ) : (
                    <span className="price-period">{t('pricing.perMonth')}</span>
                  )}
                </div>

                {plan.subscriptionType === 'yearly' && (
                  <div className="plan-savings">
                    {t('pricing.save')} {formatPrice(plan.price - (monthlyPrice * 12), plan.currency)}
                  </div>
                )}

                <ul className="plan-features">
                  {Object.entries(features).map(([key, value]) => (
                    value && (
                      <li key={key} className="plan-feature">
                        <span className="feature-icon">✓</span>
                        <span>{key.replace(/_/g, ' ')}</span>
                      </li>
                    )
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="btn btn-primary plan-select-btn"
                >
                  {t('pricing.select')}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Subscription

