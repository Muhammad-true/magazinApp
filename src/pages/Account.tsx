import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { apiService, LicenseData, ShopData, UserData } from '../services/api'
import './Account.css'

const Account = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [licenses, setLicenses] = useState<LicenseData[]>([])
  const [copied, setCopied] = useState<string>('')

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }

    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Сначала пытаемся загрузить из localStorage (если API еще не готов)
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          // Новый формат: userData - это объект UserData напрямую
          // Старый формат: userData содержит { user, shop }
          if (parsed.id && parsed.name) {
            // Новый формат - объект UserData
            setUserData(parsed)
          } else if (parsed.user) {
            // Старый формат - объект с полями user и shop
            setUserData(parsed.user)
            if (parsed.shop) {
              setShopData(parsed.shop)
            }
          }
        } catch (e) {
          console.warn('Failed to parse saved user data:', e)
        }
      }

      // Пытаемся загрузить лицензии из localStorage
      const savedLicenseData = localStorage.getItem('licenseData')
      if (savedLicenseData) {
        try {
          const parsed = JSON.parse(savedLicenseData)
          if (parsed) {
            setLicenses([parsed])
          }
        } catch (e) {
          console.warn('Failed to parse saved license data:', e)
        }
      }

      let loadedShopData: ShopData | null = shopData || null
      let loadedLicenses: LicenseData[] = licenses

      // Пытаемся загрузить через API (если эндпоинты готовы)
      try {
        const profileResponse = await apiService.getProfile()
        if (profileResponse.success) {
          setUserData(profileResponse.data.user)
          if (profileResponse.data.shop) {
            loadedShopData = profileResponse.data.shop
            setShopData(profileResponse.data.shop)
          }
        }
      } catch (apiErr: any) {
        // Если API не доступен (404 или другая ошибка), используем данные из localStorage
        if (apiErr.message === 'API_PROFILE_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
          console.info('Profile API endpoint not available, using localStorage data')
        } else if (!savedUserData) {
          console.warn('API not available and no localStorage data:', apiErr)
        }
      }

      // Если shopData еще не загружен, пытаемся загрузить магазины пользователя
      if (!loadedShopData) {
        try {
          const shopsResponse = await apiService.getUserShops()
          if (shopsResponse.success && shopsResponse.data.shops.length > 0) {
            // Используем первый магазин
            loadedShopData = shopsResponse.data.shops[0]
            setShopData(shopsResponse.data.shops[0])
            
            // Если у магазина есть лицензия, конвертируем её в формат LicenseData
            if (loadedShopData.license) {
              const shopLicense = loadedShopData.license
              const currentUserData = userData || (savedUserData ? JSON.parse(savedUserData) : null)
              
              // Используем licenseKey из shop.license, если есть, иначе из localStorage
              let licenseKey = shopLicense.licenseKey || ''
              if (!licenseKey && savedLicenseData) {
                try {
                  const parsedLicense = JSON.parse(savedLicenseData)
                  if (parsedLicense.licenseKey && parsedLicense.shopId === loadedShopData.id) {
                    licenseKey = parsedLicense.licenseKey
                  }
                } catch (e) {
                  console.warn('Failed to parse license data:', e)
                }
              }
              
              const licenseData: LicenseData = {
                id: loadedShopData.id, // Используем ID магазина как ID лицензии
                licenseKey: licenseKey, // Ключ лицензии из shop.license или localStorage
                shopId: loadedShopData.id,
                activationType: 'subscription',
                subscriptionType: shopLicense.subscriptionType,
                subscriptionStatus: shopLicense.subscriptionStatus,
                activatedAt: shopLicense.activatedAt,
                expiresAt: shopLicense.expiresAt,
                lastPaymentDate: shopLicense.activatedAt,
                nextPaymentDate: shopLicense.expiresAt,
                paymentProvider: '',
                paymentTransactionId: '',
                paymentAmount: shopLicense.price,
                paymentCurrency: shopLicense.currency,
                userId: currentUserData?.id || '',
                isActive: shopLicense.isValid && !shopLicense.isExpired,
                autoRenew: false,
                isValid: shopLicense.isValid,
                isExpired: shopLicense.isExpired,
                daysRemaining: shopLicense.daysRemaining !== null ? shopLicense.daysRemaining : 0,
                createdAt: shopLicense.activatedAt,
                updatedAt: shopLicense.activatedAt
              }
              loadedLicenses = [licenseData]
              setLicenses([licenseData])
            }
          }
        } catch (apiErr: any) {
          // Если API не доступен, проверяем localStorage
          if (apiErr.message === 'API_SHOPS_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
            // Пытаемся найти shopId в localStorage и восстановить данные магазина
            const shopId = localStorage.getItem('shopId')
            if (shopId && savedUserData) {
              try {
                const parsed = JSON.parse(savedUserData)
                // Проверяем, есть ли информация о магазине в старом формате
                if (parsed.shop && parsed.shop.id === shopId) {
                  loadedShopData = parsed.shop
                  setShopData(parsed.shop)
                }
              } catch (e) {
                console.warn('Failed to parse shop data from localStorage:', e)
              }
            }
          }
        }
      } else if (loadedShopData.license && loadedLicenses.length === 0) {
        // Если shopData уже загружен и у него есть лицензия, конвертируем её
        const shopLicense = loadedShopData.license
        const currentUserData = userData || (savedUserData ? JSON.parse(savedUserData) : null)
        
        // Используем licenseKey из shop.license, если есть, иначе из localStorage
        let licenseKey = shopLicense.licenseKey || ''
        if (!licenseKey && savedLicenseData) {
          try {
            const parsedLicense = JSON.parse(savedLicenseData)
            if (parsedLicense.licenseKey && parsedLicense.shopId === loadedShopData.id) {
              licenseKey = parsedLicense.licenseKey
            }
          } catch (e) {
            console.warn('Failed to parse license data:', e)
          }
        }
        
        const licenseData: LicenseData = {
          id: loadedShopData.id,
          licenseKey: licenseKey,
          shopId: loadedShopData.id,
          activationType: 'subscription',
          subscriptionType: shopLicense.subscriptionType,
          subscriptionStatus: shopLicense.subscriptionStatus,
          activatedAt: shopLicense.activatedAt,
          expiresAt: shopLicense.expiresAt,
          lastPaymentDate: shopLicense.activatedAt,
          nextPaymentDate: shopLicense.expiresAt,
          paymentProvider: '',
          paymentTransactionId: '',
          paymentAmount: shopLicense.price,
          paymentCurrency: shopLicense.currency,
          userId: currentUserData?.id || '',
          isActive: shopLicense.isValid && !shopLicense.isExpired,
          autoRenew: false,
          isValid: shopLicense.isValid,
          isExpired: shopLicense.isExpired,
          daysRemaining: shopLicense.daysRemaining !== null ? shopLicense.daysRemaining : 0,
          createdAt: shopLicense.activatedAt,
          updatedAt: shopLicense.activatedAt
        }
        loadedLicenses = [licenseData]
        setLicenses([licenseData])
      }

      // Пытаемся загрузить лицензии через API для получения licenseKey
      // Если лицензии уже загружены из магазина, обновляем их licenseKey из API
      try {
        const licensesResponse = await apiService.getMyLicenses()
        if (licensesResponse.success && licensesResponse.data.licenses.length > 0) {
          // Если лицензии уже есть из магазина, обновляем их licenseKey
          if (loadedLicenses.length > 0) {
            const updatedLicenses = loadedLicenses.map(shopLicense => {
              const apiLicense = licensesResponse.data.licenses.find(
                (l: LicenseData) => l.shopId === shopLicense.shopId
              )
              if (apiLicense) {
                return { ...shopLicense, licenseKey: apiLicense.licenseKey }
              }
              return shopLicense
            })
            setLicenses(updatedLicenses)
          } else {
            // Если лицензий из магазина нет, используем данные из API
            setLicenses(licensesResponse.data.licenses)
          }
        }
      } catch (apiErr: any) {
        // Если API не доступен (404 или другая ошибка), используем данные из localStorage или магазина
        if (apiErr.message === 'API_LICENSES_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
          console.info('Licenses API endpoint not available, using shop license data or localStorage')
          // Если лицензии из магазина есть, но licenseKey пустой, пытаемся получить из localStorage
          if (loadedLicenses.length > 0 && !loadedLicenses[0].licenseKey && savedLicenseData) {
            try {
              const parsedLicense = JSON.parse(savedLicenseData)
              if (parsedLicense.licenseKey) {
                const updatedLicenses = loadedLicenses.map(l => ({
                  ...l,
                  licenseKey: parsedLicense.licenseKey
                }))
                setLicenses(updatedLicenses)
              }
            } catch (e) {
              console.warn('Failed to update license key from localStorage:', e)
            }
          }
        } else if (!savedLicenseData && loadedLicenses.length === 0) {
          console.warn('API not available and no localStorage data:', apiErr)
        }
      }

      // Если нет данных ни из API, ни из localStorage
      if (!savedUserData && !userData) {
        // Не выбрасываем ошибку сразу, показываем сообщение пользователю
        setError('Нет данных пользователя. Пожалуйста, войдите в систему или зарегистрируйтесь.')
        setLoading(false)
        return
      }
    } catch (err: any) {
      console.error('Error loading account data:', err)
      setError(err.message || t('account.error'))
      
      // Если ошибка авторизации, перенаправляем на вход
      if (err.message?.includes('авторизац') || err.message?.includes('401') || err.message?.includes('Нет данных')) {
        apiService.logout()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    apiService.logout()
    navigate('/')
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('account.active')
      case 'expired':
        return t('account.expired')
      case 'cancelled':
        return t('account.cancelled')
      case 'pending':
        return t('account.pending')
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active'
      case 'expired':
        return 'status-expired'
      case 'cancelled':
        return 'status-cancelled'
      case 'pending':
        return 'status-pending'
      default:
        return ''
    }
  }

  const getSubscriptionTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return t('account.monthly')
      case 'yearly':
        return t('account.yearly')
      case 'lifetime':
        return t('account.lifetime')
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateDaysRemaining = (expiresAt: string): number => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }


  if (loading) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t('account.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !userData) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={loadData} className="btn btn-primary">
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <div className="account-header-left">
            <button 
              onClick={() => navigate('/')} 
              className="btn-back"
              title={t('nav.home')}
            >
              ← {t('nav.home')}
            </button>
            <div>
              <h1 className="account-title">{t('account.title')}</h1>
              <p className="account-subtitle">{t('account.subtitle')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline">
            {t('account.logout')}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="account-content">
          {/* Личная информация */}
          <div className="account-section">
            <h2 className="section-title">{t('account.personalInfo')}</h2>
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">{t('register.name')}</span>
                <span className="info-value">{userData?.name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('register.email')}</span>
                <span className="info-value">{userData?.email || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('register.phone')}</span>
                <span className="info-value">{userData?.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Информация о магазине */}
          {shopData && (
            <div className="account-section">
              <h2 className="section-title">{t('account.shopInfo')}</h2>
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">{t('register.shopName')}</span>
                  <span className="info-value">{shopData.name || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID магазина</span>
                  <span className="info-value">{shopData.id || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('register.inn')}</span>
                  <span className="info-value">{shopData.inn || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('register.address')}</span>
                  <span className="info-value">{shopData.address || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Лицензии */}
          <div className="account-section">
            <h2 className="section-title">{t('account.licenses')}</h2>
            {licenses.length === 0 ? (
              <div className="empty-state">
                <p>{t('account.noLicenses')}</p>
              </div>
            ) : (
              <div className="licenses-list">
                {licenses.map((license) => (
                  <div key={license.id} className="license-card">
                    <div className="license-header">
                      <div className="license-key-display">
                        <div className="license-shop-id">
                          <span className="license-key-label">{t('success.shopId')}</span>
                          <div className="license-value-container">
                            <code className="license-shop-id-value">{license.shopId}</code>
                            <button
                              onClick={() => copyToClipboard(license.shopId, `shopId-${license.id}`)}
                              className="copy-btn"
                              title={t('success.copy')}
                            >
                              {copied === `shopId-${license.id}` ? '✓' : '📋'}
                            </button>
                          </div>
                        </div>
                        <div className="license-key-wrapper">
                          <span className="license-key-label">{t('account.licenseKey')}</span>
                          <div className="license-value-container">
                            <code className="license-key-value">
                              {license.licenseKey || '-'}
                            </code>
                            {license.licenseKey && (
                              <button
                                onClick={() => copyToClipboard(license.licenseKey, `licenseKey-${license.id}`)}
                                className="copy-btn"
                                title={t('success.copy')}
                              >
                                {copied === `licenseKey-${license.id}` ? '✓' : '📋'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusClass(license.subscriptionStatus)}`}>
                        {getStatusLabel(license.subscriptionStatus)}
                      </span>
                    </div>
                    
                    <div className="license-details">
                      <div className="license-detail-item">
                        <span className="detail-label">{t('account.subscriptionType')}</span>
                        <span className="detail-value">
                          {getSubscriptionTypeLabel(license.subscriptionType)}
                        </span>
                      </div>
                      <div className="license-detail-item">
                        <span className="detail-label">{t('account.expiresAt')}</span>
                        <span className="detail-value">
                          {formatDate(license.expiresAt)}
                        </span>
                      </div>
                      {(() => {
                        const daysRemaining = license.daysRemaining > 0 
                          ? license.daysRemaining 
                          : calculateDaysRemaining(license.expiresAt)
                        
                        return daysRemaining > 0 ? (
                          <div className="license-detail-item">
                            <span className="detail-label">{t('account.daysRemaining')}</span>
                            <span className="detail-value highlight">
                              {daysRemaining}
                            </span>
                          </div>
                        ) : null
                      })()}
                      {license.paymentAmount > 0 && (
                        <div className="license-detail-item">
                          <span className="detail-label">Сумма оплаты</span>
                          <span className="detail-value">
                            {license.paymentAmount} {license.paymentCurrency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Навигационные кнопки внизу */}
        <div className="account-footer">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-outline"
          >
            ← {t('nav.home')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
