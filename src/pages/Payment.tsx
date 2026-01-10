import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { apiService, SubscribeData, SubscriptionPlan } from '../services/api'
import './Payment.css'

const Payment = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Инициализируем план из localStorage один раз при монтировании
  const initialPlan = useMemo(() => {
    try {
      const savedPlan = localStorage.getItem('selectedPlan')
      if (savedPlan) {
        return JSON.parse(savedPlan)
      }
    } catch (e) {
      console.error('Error parsing saved plan:', e)
    }
    return null
  }, [])

  // Проверяем авторизацию синхронно перед рендером
  const isAuthorized = useMemo(() => {
    const shopId = localStorage.getItem('shopId')
    const token = localStorage.getItem('userToken')
    return !!(shopId && token)
  }, [])

  const [plan, setPlan] = useState<SubscriptionPlan | null>(initialPlan)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [showPlanSelection, setShowPlanSelection] = useState(false)
  const [paymentData, setPaymentData] = useState({
    provider: 'lemonsqueezy',
    transactionId: '',
  })

  useEffect(() => {
    // Если план уже загружен из localStorage, ничего не делаем
    if (initialPlan) {
      return
    }

    // Если план не выбран, загружаем планы
    loadPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await apiService.getPlans()
      const activePlans = response.data.plans.filter(plan => plan.isActive)
      
      // Проверяем наличие lemonsqueezyVariantId в планах
      console.log('Loaded plans from DB:', activePlans.map(p => ({
        id: p.id,
        name: p.name,
        lemonsqueezyVariantId: p.lemonsqueezyVariantId || 'NOT SET'
      })))
      
      setPlans(activePlans)
      if (activePlans.length > 0) {
        // Если планов несколько - показываем выбор, иначе выбираем автоматически
        if (activePlans.length > 1) {
          setShowPlanSelection(true)
        } else {
          setPlan(activePlans[0])
          localStorage.setItem('selectedPlan', JSON.stringify(activePlans[0]))
        }
      }
    } catch (err: any) {
      console.error('Error loading plans:', err)
      // Если не удалось загрузить планы, показываем ошибку, но не перенаправляем
      // Пользователь может остаться на странице и попробовать снова
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleSelectPlan = (selectedPlan: SubscriptionPlan) => {
    setPlan(selectedPlan)
    setShowPlanSelection(false)
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan))
  }

  const handleLemonSqueezyCheckout = async () => {
    if (!plan) return

    const shopId = localStorage.getItem('shopId')
    const token = localStorage.getItem('userToken')

    if (!shopId || !token) {
      navigate('/register')
      return
    }

    // Проверяем наличие lemonsqueezyVariantId в плане
    if (!plan.lemonsqueezyVariantId) {
      alert('Ошибка: у выбранного плана не указан Lemon Squeezy Variant ID. Обратитесь в поддержку.')
      console.error('Plan missing lemonsqueezyVariantId:', plan)
      return
    }

    console.log('Creating checkout with:', {
      shopId,
      subscriptionPlanId: plan.id,
      lemonsqueezyVariantId: plan.lemonsqueezyVariantId
    })

    setLoading(true)
    try {
      // Получаем checkout URL от бэкенда с custom данными (shop_id)
      // Бэкенд должен получить lemonsqueezyVariantId из плана по subscriptionPlanId
      const response = await apiService.createLemonSqueezyCheckout({
        shopId,
        subscriptionPlanId: plan.id,
      })

      if (response.success && response.checkoutUrl) {
        // Открываем checkout Lemon Squeezy
        // Webhook автоматически создаст лицензию после успешной оплаты
        window.location.href = response.checkoutUrl
      } else {
        throw new Error('Не удалось создать checkout')
      }
    } catch (error: any) {
      alert(error.message || t('common.error'))
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!plan) return

    const shopId = localStorage.getItem('shopId')
    const token = localStorage.getItem('userToken')

    if (!shopId || !token) {
      navigate('/register')
      return
    }

    // Для ручной оплаты или других провайдеров
    const transactionId = paymentData.transactionId || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    setLoading(true)
    try {
      const subscribeData: SubscribeData = {
        shopId,
        subscriptionPlanId: plan.id,
        paymentProvider: paymentData.provider,
        paymentTransactionId: transactionId,
        paymentAmount: plan.price,
        paymentCurrency: plan.currency,
        autoRenew: false,
      }

      const response = await apiService.subscribe(subscribeData, token)
      
      // Сохраняем данные лицензии
      localStorage.setItem('licenseData', JSON.stringify(response.data))
      
      navigate('/success')
    } catch (error: any) {
      alert(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    // Валидация и нормализация валюты
    let validCurrency = 'USD' // значение по умолчанию
    
    if (currency && typeof currency === 'string') {
      // Убираем пробелы и приводим к нижнему регистру для проверки
      const normalized = currency.trim().toLowerCase()
      
      // Маппинг для сомони (валюта Таджикистана)
      if (normalized === 'с' || normalized === 'сом' || normalized === 'сомони' || normalized === 'tjs') {
        validCurrency = 'TJS'
      } else {
        // Проверяем стандартный код валюты (3 символа, только буквы)
        const upperNormalized = normalized.toUpperCase()
        if (upperNormalized.length === 3 && /^[A-Z]{3}$/.test(upperNormalized)) {
          validCurrency = upperNormalized
        }
      }
    }
    
    try {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: validCurrency,
      }).format(price)
    } catch (error) {
      // Если валюта все еще невалидна, используем простой формат
      console.warn('Invalid currency code:', currency, 'using USD instead')
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
        currency: 'USD',
    }).format(price)
  }
  }

  // Отладочная информация
  useEffect(() => {
    console.log('Payment component state:', {
      isAuthorized,
      plan: plan ? plan.name : null,
      loadingPlans,
      showPlanSelection,
      plansCount: plans.length,
    })
  }, [isAuthorized, plan, loadingPlans, showPlanSelection, plans.length])

  // Если не авторизован, показываем сообщение и кнопку для регистрации
  if (!isAuthorized) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-container">
            <p>Необходима авторизация</p>
            <button onClick={() => navigate('/register')} className="btn btn-primary">
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Если загружаются планы - показываем загрузку
  if (loadingPlans) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading-container">
          <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Если показываем выбор планов
  if (showPlanSelection && plans.length > 0) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-container">
            <div className="payment-header">
              <h1 className="payment-title">{t('subscription.title')}</h1>
              <p className="payment-subtitle">{t('subscription.subtitle')}</p>
            </div>

            <div className="plans-grid" style={{ marginTop: '2rem' }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`plan-card ${plan?.id === p.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{p.name}</h3>
                  <div className="plan-price">
                    {formatPrice(p.price, p.currency)}
                    {p.subscriptionType === 'monthly' && ' / ' + t('pricing.perMonth')}
                    {p.subscriptionType === 'yearly' && ' / ' + t('pricing.perYear')}
                    {p.subscriptionType === 'lifetime' && ' ' + t('pricing.oneTimeLabel')}
                  </div>
                  <p>{p.description}</p>
                  <button
                    onClick={() => handleSelectPlan(p)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {t('pricing.select')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если план есть - показываем форму оплаты
  if (plan) {
  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          <div className="payment-header">
            <h1 className="payment-title">{t('payment.title')}</h1>
            <p className="payment-subtitle">{t('payment.subtitle')}</p>
          </div>

          <div className="payment-content">
            <div className="payment-summary card">
              <h2 className="summary-title">Детали заказа</h2>
              <div className="summary-item">
                <span className="summary-label">{t('payment.plan')}</span>
                <span className="summary-value">{plan.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('payment.amount')}</span>
                <span className="summary-value summary-amount">
                  {formatPrice(plan.price, plan.currency)}
                </span>
              </div>
              <div className="summary-description">
                {plan.description}
              </div>
            </div>

              {paymentData.provider === 'lemonsqueezy' ? (
                <div className="payment-form card">
                  <div className="form-group">
                    <p className="payment-note">
                      Нажмите кнопку ниже, чтобы перейти к безопасной оплате через Lemon Squeezy
                    </p>
                  </div>
                  <button
                    onClick={handleLemonSqueezyCheckout}
                    className="btn btn-primary btn-large"
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    {loading ? t('payment.processing') : `${t('payment.pay')} - ${formatPrice(plan.price, plan.currency)}`}
                  </button>
                  <div className="payment-note" style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    <p>Оплата обрабатывается через Lemon Squeezy. После успешной оплаты webhook автоматически создаст лицензию, и вы будете перенаправлены на страницу успеха.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="payment-form card">
              <div className="form-group">
                <label className="form-label">{t('payment.provider')}</label>
                <select
                  value={paymentData.provider}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, provider: e.target.value }))}
                  className="form-input"
                >
                      <option value="lemonsqueezy">Lemon Squeezy</option>
                  <option value="manual">Ручная оплата</option>
                </select>
              </div>

                  {paymentData.provider === 'manual' && (
                    <>
              <div className="form-group">
                <label className="form-label">{t('payment.transactionId')}</label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="form-input"
                  placeholder="Оставьте пустым для автогенерации"
                />
                <small className="form-hint">
                  Если оплата уже произведена, введите ID транзакции
                </small>
              </div>
              <div className="payment-note">
                <p>
                          <strong>Инструкция:</strong> После оплаты введите ID транзакции или оставьте поле пустым для автогенерации.
                </p>
              </div>
                    </>
                  )}

                  {paymentData.provider === 'manual' && (
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? t('payment.processing') : t('payment.pay')}
              </button>
                  )}
            </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если план не выбран и не загружаются планы - показываем ошибку
  return (
    <div className="payment-page">
      <div className="container">
        <div className="error-container">
          <p>{t('payment.noPlan')}</p>
          <button onClick={() => navigate('/shop-selection')} className="btn btn-primary">
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment
