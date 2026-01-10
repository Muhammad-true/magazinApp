import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiService, ShopData, SubscriptionPlan } from '../services/api'
import './ShopSelection.css'

const ShopSelection = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [shops, setShops] = useState<ShopData[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [error, setError] = useState<string>('')
  const [showPlans, setShowPlans] = useState(false)

  useEffect(() => {
    // Проверяем авторизацию
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    // Проверяем, был ли создан новый магазин
    const state = location.state as { newShopCreated?: boolean; newShopId?: string } | null
    
    loadShops().then(() => {
      // Если был создан новый магазин, автоматически выбираем его
      if (state?.newShopCreated && state?.newShopId) {
        setSelectedShopId(state.newShopId)
        // Очищаем state после использования
        window.history.replaceState({}, document.title)
      }
    })
    
    loadPlans()
    
    // Проверяем, есть ли уже выбранный план из предыдущего шага
    const savedPlan = localStorage.getItem('selectedPlan')
    if (savedPlan) {
      try {
        setSelectedPlan(JSON.parse(savedPlan))
      } catch (e) {
        console.warn('Failed to parse saved plan:', e)
      }
    }
  }, [navigate, location])

  const loadPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await apiService.getPlans()
      const activePlans = response.data.plans.filter(plan => plan.isActive)
      
      // Проверяем наличие lemonsqueezyVariantId в планах
      console.log('Loaded plans from DB (ShopSelection):', activePlans.map(p => ({
        id: p.id,
        name: p.name,
        lemonsqueezyVariantId: p.lemonsqueezyVariantId || 'NOT SET'
      })))
      
      setPlans(activePlans)
    } catch (err: any) {
      console.error('Error loading plans:', err)
    } finally {
      setLoadingPlans(false)
    }
  }

  const loadShops = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Получаем ID текущего пользователя
      const savedUserData = localStorage.getItem('userData')
      let currentUserId: string | null = null
      
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          // Новый формат: userData - это объект UserData напрямую
          // Старый формат: userData содержит { user, shop }
          if (parsed.id && parsed.name) {
            currentUserId = parsed.id
          } else if (parsed.user && parsed.user.id) {
            currentUserId = parsed.user.id
          }
        } catch (e) {
          console.warn('Failed to parse saved user data:', e)
        }
      }

      // Пытаемся загрузить магазины через API
      try {
        const response = await apiService.getUserShops()
        if (response.success && response.data.shops.length > 0) {
          // Фильтруем магазины по ownerId текущего пользователя
          let userShops = response.data.shops
          
          if (currentUserId) {
            userShops = response.data.shops.filter(shop => shop.ownerId === currentUserId)
          }
          
          if (userShops.length > 0) {
            setShops(userShops)
            // Обновляем userData в localStorage, чтобы включить только магазины пользователя
            if (savedUserData) {
              try {
                const parsed = JSON.parse(savedUserData)
                // Сохраняем массив магазинов пользователя
                parsed.shops = userShops
                localStorage.setItem('userData', JSON.stringify(parsed))
              } catch (e) {
                console.warn('Failed to update user data:', e)
              }
            }
          } else {
            setShops([])
          }
        } else {
          setShops([])
        }
      } catch (apiErr: any) {
        // Если API не доступен, проверяем localStorage
        if (apiErr.message === 'API_SHOPS_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
          if (savedUserData) {
            try {
              const parsed = JSON.parse(savedUserData)
              let userShops: ShopData[] = []
              
              // Если есть массив магазинов, фильтруем по ownerId
              if (Array.isArray(parsed.shops) && parsed.shops.length > 0) {
                if (currentUserId) {
                  userShops = parsed.shops.filter((shop: ShopData) => shop.ownerId === currentUserId)
                } else {
                  userShops = parsed.shops
                }
              } else if (parsed.shop) {
                // Если только один магазин, проверяем ownerId
                if (!currentUserId || parsed.shop.ownerId === currentUserId) {
                  userShops = [parsed.shop]
                }
              }
              
              setShops(userShops)
            } catch (e) {
              console.warn('Failed to parse saved user data:', e)
            }
          }
        } else {
          throw apiErr
        }
      }
    } catch (err: any) {
      console.error('Error loading shops:', err)
      setError(err.message || t('shopSelection.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    console.log('handleContinue called:', { selectedShopId, selectedPlan, showPlans })
    
    if (!selectedShopId) {
      alert('Пожалуйста, выберите магазин')
      return
    }
    
    // Сохраняем выбранный shopId
    localStorage.setItem('shopId', selectedShopId)
    console.log('Saved shopId to localStorage:', selectedShopId)
    
    // Если план уже выбран (из предыдущего шага), переходим сразу на оплату
    if (selectedPlan) {
      console.log('Plan already selected, navigating to payment')
      navigate('/payment')
    } else {
      // Иначе показываем планы подписки
      console.log('Showing plans selection')
      setShowPlans(true)
    }
  }

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    localStorage.setItem('selectedPlan', JSON.stringify(plan))
    // Переходим на страницу оплаты
    navigate('/payment')
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

  const handleCreateNew = () => {
    // Переходим на страницу регистрации нового магазина
    navigate('/register')
  }

  if (loading) {
    return (
      <div className="shop-selection-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t('shopSelection.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shop-selection-page">
      <div className="container">
        <div className="shop-selection-container">
          <h1 className="shop-selection-title">{t('shopSelection.title')}</h1>
          <p className="shop-selection-subtitle">{t('shopSelection.subtitle')}</p>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!showPlans ? (
            shops.length > 0 ? (
              <>
                <div className="shops-list">
                  <h3 className="shops-list-title">{t('shopSelection.selectShop')}</h3>
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className={`shop-card ${selectedShopId === shop.id ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('Shop selected:', shop.id, shop.name)
                        setSelectedShopId(shop.id)
                      }}
                    >
                      <div className="shop-card-header">
                        <input
                          type="radio"
                          name="shop"
                          value={shop.id}
                          checked={selectedShopId === shop.id}
                          onChange={() => setSelectedShopId(shop.id)}
                        />
                        <div className="shop-info">
                          <h4 className="shop-name">{shop.name}</h4>
                          {shop.inn && (
                            <p className="shop-inn">ИНН: {shop.inn}</p>
                          )}
                          {shop.address && (
                            <p className="shop-address">{shop.address}</p>
                          )}
                          {shop.license && (
                            <div className="shop-license-info">
                              <span className={`license-status ${shop.license.isValid && !shop.license.isExpired ? 'active' : 'expired'}`}>
                                {shop.license.isValid && !shop.license.isExpired 
                                  ? `✓ Активна (осталось ${shop.license.daysRemaining !== null ? shop.license.daysRemaining : '∞'} дн.)`
                                  : '✗ Неактивна'}
                              </span>
                              {shop.license.subscriptionType && (
                                <span className="license-type">
                                  {shop.license.subscriptionType === 'monthly' ? 'Месячная' : 
                                   shop.license.subscriptionType === 'yearly' ? 'Годовая' : 
                                   'Пожизненная'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shop-selection-actions">
                  <button
                    onClick={handleContinue}
                    disabled={!selectedShopId}
                    className="btn btn-primary"
                  >
                    {t('shopSelection.continue')}
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="btn btn-outline"
                  >
                    {t('shopSelection.createNew')}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-shops">
                <p>{t('shopSelection.noShops')}</p>
                <button
                  onClick={handleCreateNew}
                  className="btn btn-primary"
                >
                  {t('shopSelection.createFirstShop')}
                </button>
              </div>
            )
          ) : (
            <>
              <button
                onClick={() => setShowPlans(false)}
                className="btn-back"
                style={{ marginBottom: '20px' }}
              >
                ← {t('common.back')}
              </button>
              
              <h2 className="plans-section-title">{t('subscription.title')}</h2>
              <p className="plans-section-subtitle">{t('subscription.subtitle')}</p>

              {loadingPlans ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="plans-grid">
                  {plans.map((plan) => {
                    const monthlyPrice = plan.durationMonths > 0 
                      ? plan.price / plan.durationMonths 
                      : plan.price

                    return (
                      <div
                        key={plan.id}
                        className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        <h3 className="plan-name">{plan.name}</h3>
                        <div className="plan-price">
                          <span className="price-amount">
                            {formatPrice(plan.price, plan.currency)}
                          </span>
                          {plan.subscriptionType === 'lifetime' ? (
                            <span className="price-period">{t('pricing.oneTimeLabel')}</span>
                          ) : plan.subscriptionType === 'yearly' ? (
                            <span className="price-period">
                              {t('pricing.perYear')} ({formatPrice(monthlyPrice, plan.currency)} {t('pricing.perMonth')})
                            </span>
                          ) : (
                            <span className="price-period">{t('pricing.perMonth')}</span>
                          )}
                        </div>
                        <p className="plan-description">{plan.description}</p>
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                        >
                          {t('pricing.select')}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopSelection
