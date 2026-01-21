import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import {
    BookIcon,
    ChartIcon,
    CopyIcon,
    LockIcon,
    MoneyIcon, PackageIcon,
    PhoneIcon,
    ShirtIcon,
    TagIcon, UsersIcon
} from '../components/Icons'
import { apiService, City, RegisterData, ShopData } from '../services/api'
import { getCityName } from '../services/cities'
import './LandingPage.css'

const LandingPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated())
  }, [])
  
  // Безопасное получение массива из переводов (закомментировано, не используется)
  // const getFeaturesArray = (key: string): string[] => {
  //   try {
  //     const features = t(key, { returnObjects: true })
  //     if (Array.isArray(features)) {
  //       return features.filter((item): item is string => typeof item === 'string')
  //     }
  //     return []
  //   } catch {
  //     return []
  //   }
  // }
  const [step, setStep] = useState<'info' | 'business-type' | 'register' | 'shop-selection' | 'success'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [shops, setShops] = useState<ShopData[]>([])
  const [loadingShops, setLoadingShops] = useState(false)
  const [isCreatingNewShop, setIsCreatingNewShop] = useState(false)
  const [trialLoading, setTrialLoading] = useState(false)
  const [hasLicense, setHasLicense] = useState<boolean | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    inn: '',
    description: '',
    address: '',
    cityId: '',
  })
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesError, setCitiesError] = useState<string | null>(null)
  const [licenseData] = useState<any>(null)

  // Загрузка городов при монтировании компонента
  useEffect(() => {
    loadCities()
  }, [])

  // Проверка наличия лицензии при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      checkLicense()
    }
  }, [isAuthenticated])

  const checkLicense = async () => {
    try {
      const response = await apiService.getMyLicenses()
      if (response.success && response.data.licenses.length > 0) {
        // Проверяем, есть ли активная лицензия
        const activeLicense = response.data.licenses.find(
          (license: any) => license.isActive && !license.isExpired
        )
        setHasLicense(!!activeLicense)
      } else {
        setHasLicense(false)
      }
    } catch (error: any) {
      // Если API не доступен, проверяем localStorage
      const savedLicenseData = localStorage.getItem('licenseData')
      if (savedLicenseData) {
        try {
          const parsed = JSON.parse(savedLicenseData)
          setHasLicense(!!parsed.isActive && !parsed.isExpired)
        } catch (e) {
          setHasLicense(false)
        }
      } else {
        setHasLicense(false)
      }
    }
  }

  const handleGetTrialLicense = async () => {
    if (!apiService.isAuthenticated()) {
      alert('Для получения пробного ключа необходимо войти в систему')
      navigate('/login')
      return
    }

    // Проверяем наличие лицензии
    if (hasLicense === null) {
      await checkLicense()
    }

    if (hasLicense) {
      alert('У вас уже есть активная лицензия. Пробный ключ недоступен.')
      navigate('/account')
      return
    }

    // Получаем shopId
    const shopId = localStorage.getItem('shopId')
    if (!shopId) {
      alert('Ошибка: магазин не найден. Пожалуйста, создайте магазин сначала.')
      setStep('business-type')
      return
    }

    setTrialLoading(true)
    try {
      const response = await apiService.createTrialLicense({ shopId })
      
      if (response.success && response.data) {
        // Сохраняем лицензию
        localStorage.setItem('licenseData', JSON.stringify(response.data))
        setHasLicense(true)
        
        // Показываем успешное сообщение и переходим в аккаунт
        alert(`Пробный ключ успешно создан!\n\nКлюч лицензии: ${response.data.licenseKey}\n\nСрок действия: 7 дней`)
        navigate('/account')
      } else {
        throw new Error(response.message || 'Не удалось создать пробный ключ')
      }
    } catch (error: any) {
      console.error('Error creating trial license:', error)
      let errorMessage = 'Произошла ошибка при создании пробного ключа'
      
      if (error.message?.includes('409') || error.message?.includes('уже есть')) {
        errorMessage = 'У вас уже есть активная лицензия. Пробный ключ недоступен.'
        setHasLicense(true)
      } else if (error.message?.includes('404')) {
        errorMessage = 'Магазин не найден. Пожалуйста, создайте магазин сначала.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setTrialLoading(false)
    }
  }

  // Предзаполнение формы для авторизованных пользователей
  useEffect(() => {
    if (step === 'register' && apiService.isAuthenticated() && isCreatingNewShop) {
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          const userData = parsed.id && parsed.name ? parsed : (parsed.user || parsed)
          if (userData) {
            setFormData(prev => ({
              ...prev,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              password: '' // Пароль не предзаполняем
            }))
          }
        } catch (e) {
          console.warn('Failed to parse user data:', e)
        }
      }
    }
  }, [step, isCreatingNewShop])


  const loadCities = async () => {
    try {
      setCitiesLoading(true)
      setCitiesError(null)
      const response = await apiService.getCities()
      console.log('Cities API response:', response) // Отладка
      
      if (response.success && response.data && response.data.cities) {
        // Фильтруем только активные города, если поле isActive есть
        const activeCities = response.data.cities.filter(city => city.isActive !== false)
        console.log('Loaded cities:', activeCities) // Отладка
        setCities(activeCities)
        if (activeCities.length === 0) {
          setCitiesError('Список городов пуст. Возможно, нет активных городов в базе данных.')
        }
      } else {
        console.error('Error loading cities: Invalid response format', response)
        setCitiesError('Не удалось загрузить список городов: неверный формат ответа')
      }
    } catch (err: any) {
      console.error('Error loading cities:', err)
      const errorMsg = err.message || 'Неизвестная ошибка'
      setCitiesError(errorMsg)
    } finally {
      setCitiesLoading(false)
    }
  }

  // Импортируем изображения
  const screenshots = [
    { id: 1, title: 'Дашборд', image: '/assets/дашбоард.png' },
    { id: 2, title: 'Дашборд 2', image: '/assets/дашбоард2.png' },
    { id: 3, title: 'Дашборд 3', image: '/assets/дашбоард3.png' },
    { id: 4, title: 'Касса и продажи', image: '/assets/kassa1.png' },
    { id: 5, title: 'Чек', image: '/assets/kassa_chek.png' },
    { id: 6, title: 'Склад', image: '/assets/sklad.png' },
    { id: 7, title: 'Склад 2', image: '/assets/sklad2.png' },
    { id: 8, title: 'Отчеты', image: '/assets/otchot.png' },
    { id: 9, title: 'Отчеты 2', image: '/assets/otchot2.png' },
    { id: 10, title: 'Отчеты 3', image: '/assets/otchot3.png' },
    { id: 11, title: 'Пользователи', image: '/assets/users.png' },
  ]

  const [activeScreenshot, setActiveScreenshot] = useState<number | null>(null)
  const [screenshotZoom, setScreenshotZoom] = useState<number>(1)
  const pinchState = useRef<{
    initialDistance: number
    initialZoom: number
  } | null>(null)

  const handleOpenScreenshot = (index: number) => {
    setActiveScreenshot(index)
    setScreenshotZoom(1)
  }

  const handleCloseScreenshot = () => {
    setActiveScreenshot(null)
    setScreenshotZoom(1)
  }

  const handlePrevScreenshot = () => {
    setActiveScreenshot(prev =>
      prev === null ? null : (prev - 1 + screenshots.length) % screenshots.length,
    )
  }

  const handleNextScreenshot = () => {
    setActiveScreenshot(prev =>
      prev === null ? null : (prev + 1) % screenshots.length,
    )
  }

  const clampZoom = (value: number) => Math.min(Math.max(value, 0.6), 3)

  const handleDoubleTap = () => {
    setScreenshotZoom((z) => (z > 1 ? 1 : 2))
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const [t1, t2] = Array.from(e.touches)
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      pinchState.current = { initialDistance: dist, initialZoom: screenshotZoom }
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault()
      const [t1, t2] = Array.from(e.touches)
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const nextZoom = clampZoom(pinchState.current.initialZoom * (dist / pinchState.current.initialDistance))
      setScreenshotZoom(nextZoom)
    }
  }

  const handleTouchEnd = () => {
    pinchState.current = null
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activeScreenshot === null) return
      if (event.key === 'Escape') handleCloseScreenshot()
      if (event.key === 'ArrowLeft') handlePrevScreenshot()
      if (event.key === 'ArrowRight') handleNextScreenshot()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeScreenshot, screenshots.length])

  const loadShops = async (): Promise<ShopData[]> => {
    setLoadingShops(true)
    
    // Получаем ID текущего пользователя
    const savedUserData = localStorage.getItem('userData')
    let currentUserId: string | null = null
    
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData)
        if (parsed.id && parsed.name) {
          currentUserId = parsed.id
        } else if (parsed.user && parsed.user.id) {
          currentUserId = parsed.user.id
        }
      } catch (e) {
        console.warn('Failed to parse saved user data:', e)
      }
    }
    
    try {
      const shopsResponse = await apiService.getUserShops()
      if (shopsResponse.success && shopsResponse.data.shops.length > 0) {
        let userShops = shopsResponse.data.shops
        
        if (currentUserId) {
          userShops = shopsResponse.data.shops.filter(shop => shop.ownerId === currentUserId)
        }
        
        setShops(userShops)
        return userShops
      } else {
        setShops([])
        return []
      }
    } catch (apiErr: any) {
      if (apiErr.message === 'API_SHOPS_NOT_AVAILABLE' || apiErr.message?.includes('404')) {
        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData)
            let userShops: ShopData[] = []
            
            if (Array.isArray(parsed.shops) && parsed.shops.length > 0) {
              if (currentUserId) {
                userShops = parsed.shops.filter((shop: ShopData) => shop.ownerId === currentUserId)
              } else {
                userShops = parsed.shops
              }
            } else if (parsed.shop) {
              if (!currentUserId || parsed.shop.ownerId === currentUserId) {
                userShops = [parsed.shop]
              }
            }
            
            setShops(userShops)
            return userShops
          } catch (e) {
            console.warn('Failed to parse saved user data:', e)
            setShops([])
            return []
          }
        } else {
          setShops([])
          return []
        }
      } else {
        setShops([])
        return []
      }
    } finally {
      setLoadingShops(false)
    }
  }
  
  // Используем loadShops в других местах
  useEffect(() => {
    if (isAuthenticated && step === 'shop-selection') {
      loadShops()
    }
  }, [isAuthenticated, step])

  // const handleGetStarted = async () => {
  //   if (apiService.isAuthenticated()) {
  //     // Если авторизован - загружаем магазины и показываем выбор
  //     const loadedShops = await loadShops()
  //     if (loadedShops.length > 0) {
  //       setStep('shop-selection')
  //     } else {
  //       // Если магазинов нет - переходим к созданию нового
  //       setIsCreatingNewShop(true)
  //       setStep('business-type')
  //     }
  //   } else {
  //     // Если не авторизован - переходим к регистрации
  //     setStep('business-type')
  //   }
  // }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Валидация
    if (!formData.name.trim()) {
      setError(t('register.name') + ' ' + t('common.required'))
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('common.invalidEmail'))
      return
    }
    // Пароль не обязателен для авторизованных пользователей при создании нового магазина
    if (!isCreatingNewShop || !apiService.isAuthenticated()) {
    if (!formData.password || formData.password.length < 6) {
      setError(t('common.minLength', { count: 6 }))
      return
      }
    }
    if (!formData.phone.trim()) {
      setError(t('register.phone') + ' ' + t('common.required'))
      return
    }
    if (!formData.shopName.trim()) {
      setError(t('register.shopName') + ' ' + t('common.required'))
      return
    }
    if (!formData.inn.trim()) {
      setError(t('register.inn') + ' ' + t('common.required'))
      return
    }
    if (!formData.address.trim()) {
      setError(t('register.address') + ' ' + t('common.required'))
      return
    }
    if (!selectedCity) {
      setError(t('register.city') + ' ' + t('common.required'))
      return
    }
    
    setLoading(true)
    try {
      const registerData = {
        ...formData,
        cityId: selectedCity.id
      }
      const response = await apiService.register(registerData)
      
      if (response.success) {
        localStorage.setItem('userToken', response.data.token)
        localStorage.setItem('shopId', response.data.shop.id)
        localStorage.setItem('userData', JSON.stringify(response.data))
        // После регистрации переходим в аккаунт
        navigate('/account')
      } else {
        setError(response.message || t('common.error'))
      }
    } catch (error: any) {
      const errorMessage = error.message || t('common.error')
      setError(errorMessage)
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="landing-page">
      {/* Language Selector - только в углу */}
      <div className="language-selector-fixed">
        <button onClick={() => changeLanguage('ru')} className={i18n.language === 'ru' ? 'active' : ''}>RU</button>
        <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>EN</button>
        <button onClick={() => changeLanguage('uz')} className={i18n.language === 'uz' ? 'active' : ''}>UZ</button>
        <button onClick={() => changeLanguage('tj')} className={i18n.language === 'tj' ? 'active' : ''}>TJ</button>
      </div>

      {step === 'info' && (
        <div className="container landing-snap">
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div className="logo" style={{ fontSize: '24px', fontWeight: 700, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              MagazinApp
            </div>
            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <a href="#features" style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.features')}</a>
              <a href="#pricing" style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.pricing')}</a>
              <Link to="/downloads" style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.downloads')}</Link>
              <Link to="/documentation" style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.documentation')}</Link>
              {isAuthenticated ? (
                <Link to="/account" style={{ color: 'var(--accent)', fontSize: '15px', cursor: 'pointer', fontWeight: 500 }}>{t('nav.account')}</Link>
              ) : (
                <>
                  <Link to="/login" style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.login')}</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); setStep('business-type'); }} style={{ color: 'var(--muted)', fontSize: '15px', cursor: 'pointer' }}>{t('nav.register')}</a>
                </>
              )}
            </nav>
          </header>

          {/* Product Selection Section */}
          <section className="snap-section" style={{ marginTop: '60px', marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 800, 
                color: 'var(--text)', 
                marginBottom: '16px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.2'
              }}>
                Выберите программу для вашего бизнеса
                </h1>
              <p style={{ 
                fontSize: '20px', 
                color: 'var(--muted)', 
                maxWidth: '700px', 
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Libbis POS — современная система только для магазинов
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
              gap: '32px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
            className="products-grid"
            >
              {/* Магазин */}
              <div 
                style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(14px)',
                borderRadius: 'var(--radius)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  padding: '40px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ 
                  fontSize: '5rem', 
                  marginBottom: '24px',
                  textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <ShirtIcon size={80} color="var(--accent)" />
                </div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 700, 
                  color: 'var(--text)', 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  MagazinApp для Магазинов
                </h2>
                <p style={{ 
                color: 'var(--muted)',
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Универсальная система для магазинов одежды, обуви и других товаров
                </p>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: '0 0 24px 0',
                  color: 'var(--muted)',
                  fontSize: '14px'
                }}>
                  <li style={{ marginBottom: '10px', paddingLeft: '24px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span>
                    Управление товарами и размерами
                  </li>
                  <li style={{ marginBottom: '10px', paddingLeft: '24px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span>
                    Касса и быстрые продажи
                  </li>
                  <li style={{ marginBottom: '10px', paddingLeft: '24px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span>
                    Склад и инвентаризация
                  </li>
                  <li style={{ marginBottom: '10px', paddingLeft: '24px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span>
                    Отчеты и аналитика
                  </li>
                </ul>
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setStep('business-type')
                    }}
                    className="cta-button"
                    style={{ 
                      width: '100%',
                      padding: '16px 32px',
                      fontSize: '18px',
                      fontWeight: 600
                    }}
                  >
                    Выбрать для магазина →
                  </button>
                  <Link 
                    to="/documentation"
                    onClick={(e) => e.stopPropagation()}
                    className="cta-button ghost"
                    style={{ 
                      width: '100%',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: 500,
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                  >
                    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                      <BookIcon size={20} />
                    </span>
                    Обучение для магазинов
                  </Link>
              </div>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              marginTop: '40px',
              padding: '24px',
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '14px',
                margin: 0
              }}>
                💡 <strong style={{ color: 'var(--text)' }}>В будущем</strong> будут доступны программы для других типов бизнеса
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="snap-section" id="features" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <h2 className="section-title">{t('features.title')}</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '16px', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.6' }}>
              Полнофункциональная система управления для магазинов с современным интерфейсом и мощными возможностями
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <MoneyIcon size={32} color="var(--accent)" />
                </div>
                <h3>{t('features.sales.title')}</h3>
                <p>{t('features.sales.desc')}</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Быстрая продажа товаров</li>
                  <li>Поддержка сканеров штрих-кодов</li>
                  <li>Печать чеков и накладных</li>
                  <li>Обработка возвратов</li>
                  <li>Работа в офлайн-режиме</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <PackageIcon size={32} color="var(--accent)" />
                </div>
                <h3>{t('features.warehouse.title')}</h3>
                <p>{t('features.warehouse.desc')}</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Учет остатков товаров</li>
                  <li>Управление поставками</li>
                  <li>Списание и корректировки</li>
                  <li>Инвентаризация склада</li>
                  <li>Аналитика и отчеты</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <ChartIcon size={32} color="var(--accent)" />
                </div>
                <h3>Отчеты и аналитика</h3>
                <p>Детальная аналитика продаж и движения товаров</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Отчеты по продажам</li>
                  <li>Анализ прибыльности</li>
                  <li>Топ товаров и категорий</li>
                  <li>Статистика по периодам</li>
                  <li>Экспорт данных</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">☁️</div>
                <h3>Облачная синхронизация</h3>
                <p>Доступ к данным с любого устройства</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Автоматическая синхронизация</li>
                  <li>Резервное копирование данных</li>
                  <li>Мультиустройственный доступ</li>
                  <li>История изменений</li>
                  <li>Безопасное хранение</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <TagIcon size={32} color="var(--accent)" />
                </div>
                <h3>Маркировка и печать</h3>
                <p>Профессиональная маркировка товаров</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Печать ценников</li>
                  <li>Генерация штрих-кодов</li>
                  <li>Этикетки для товаров</li>
                  <li>Настройка шаблонов</li>
                  <li>Пакетная печать</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <UsersIcon size={32} color="var(--accent)" />
                </div>
                <h3>Управление персоналом</h3>
                <p>Контроль работы сотрудников</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Учет рабочего времени</li>
                  <li>Разграничение прав доступа</li>
                  <li>Отчеты по продавцам</li>
                  <li>Система ролей</li>
                  <li>История операций</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💳</div>
                <h3>Финансы и платежи</h3>
                <p>Полный финансовый учет</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Учет наличных и безнала</li>
                  <li>Интеграция с платежными системами</li>
                  <li>Кассовые смены</li>
                  <li>Финансовые отчеты</li>
                  <li>Контроль задолженностей</li>
                </ul>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <PhoneIcon size={32} color="var(--accent)" />
                </div>
                <h3>Мобильное приложение</h3>
                <p>Работайте с любого устройства</p>
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Приложение для Android и iOS</li>
                  <li>Полный функционал на мобильных</li>
                  <li>Удобный интерфейс</li>
                  <li>Быстрая работа</li>
                  <li>Офлайн-режим</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Получение ключа */}
          <h2 id="pricing" className="section-title">Тарифы и получение ключа</h2>
          
          {/* Пробная версия */}
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '700px',
            margin: '0 auto 40px',
            padding: '40px 20px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎁</div>
            <h3 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>
              7 дней бесплатной пробной версии
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '20px', lineHeight: '1.6' }}>
              Попробуйте все возможности системы бесплатно в течение 7 дней. Полный доступ ко всем функциям без ограничений.
            </p>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(34, 197, 94, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: 'var(--text)',
              fontWeight: 500,
              marginBottom: '24px'
            }}>
              <span>✓</span>
              <span>Все функции доступны</span>
            </div>
            {hasLicense === true ? (
              <div style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '14px',
                marginTop: '20px'
              }}>
                У вас уже есть активная лицензия. Пробный ключ недоступен.
              </div>
            ) : (
              <button
                onClick={handleGetTrialLicense}
                disabled={trialLoading || !isAuthenticated}
                className="btn-primary"
                style={{
                  marginTop: '20px',
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  opacity: (!isAuthenticated || trialLoading) ? 0.6 : 1,
                  cursor: (!isAuthenticated || trialLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                {trialLoading ? (
                  <>
                    <span className="spinner" style={{ display: 'inline-block', marginRight: '8px', width: '16px', height: '16px' }}></span>
                    Создание ключа...
                  </>
                ) : !isAuthenticated ? (
                  'Войдите для получения ключа'
                ) : (
                  '🎁 Получить пробный ключ на 7 дней'
                )}
              </button>
            )}
            </div>

          {/* Получение ключа */}
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px 20px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <LockIcon size={48} color="var(--accent)" />
            </div>
            <h3 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>
              Для получения ключа лицензии напишите нам
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '30px', lineHeight: '1.6' }}>
              Свяжитесь с нами через Telegram, и мы предоставим вам ключ лицензии для активации программы.
            </p>
            <a 
              href="https://t.me/magazinapp_support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                padding: '16px 32px',
                fontSize: '1.1rem'
              }}
            >
              <span>💬</span>
              Написать в Telegram
            </a>
          </div>

          {/* Screenshots Gallery */}
          <section className="snap-section" id="screenshots" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <h2 className="section-title">Интерфейс приложения</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '16px', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.6' }}>
              Посмотрите, как выглядит наше приложение изнутри
            </p>
            <div className="screenshots-container">
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                className="screenshot-card"
                style={{
                  minWidth: '320px',
                  maxWidth: '400px',
                  background: 'var(--glass)',
                  backdropFilter: 'blur(14px)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => handleOpenScreenshot(index)}
              >
                <div style={{
                  width: '100%',
                  height: '240px',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.2)',
                  position: 'relative'
                }}>
                  <img 
                    src={screenshot.image} 
                    alt={screenshot.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted);">Изображение не найдено</div>'
                      }
                    }}
                  />
                </div>
                <div style={{
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    color: 'var(--text)',
                    fontSize: '18px',
                    fontWeight: 600,
                    margin: 0
                  }}>
                    {screenshot.title}
                  </h4>
                </div>
              </div>
            ))}
            </div>
          </section>

          {activeScreenshot !== null && (
            <div className="screenshot-modal" onClick={handleCloseScreenshot}>
              <div className="screenshot-modal__backdrop" />
              <div
                className="screenshot-modal__content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="screenshot-modal__close" onClick={handleCloseScreenshot}>
                  ✕
              </button>
                <button className="screenshot-modal__nav screenshot-modal__nav--prev" onClick={handlePrevScreenshot}>
                  ‹
                </button>
                <div
                  className="screenshot-modal__image-wrapper"
                  onDoubleClick={handleDoubleTap}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  <img
                    src={screenshots[activeScreenshot].image}
                    alt={screenshots[activeScreenshot].title}
                    style={{
                      transform: `scale(${screenshotZoom})`,
                      transition: 'transform 0.15s ease',
                      transformOrigin: 'center center',
                      touchAction: 'none',
                    }}
                  />
                  <div className="screenshot-modal__caption">
                    {screenshots[activeScreenshot].title}
                    <span className="screenshot-modal__counter">
                      {activeScreenshot + 1} / {screenshots.length}
                    </span>
            </div>
          </div>
                <button className="screenshot-modal__nav screenshot-modal__nav--next" onClick={handleNextScreenshot}>
                  ›
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer style={{ marginTop: '80px', textAlign: 'center', color: 'var(--muted)', paddingBottom: '40px', fontSize: '14px', lineHeight: 1.6 }}>
            © 2025 MagazinApp — Связь:
            {' '}<a href="mailto:sales@magazinapp.example" style={{ color: 'var(--accent)' }}>sales@magazinapp.example</a>,
            {' '}<a href="mailto:sodiqov.online@gmail.com" style={{ color: 'var(--accent)' }}>sodiqov.online@gmail.com</a>,
            {' '}<a href="https://t.me/MuhammadTrue" style={{ color: 'var(--accent)' }}>Telegram: @MuhammadTrue</a>
          </footer>
        </div>
      )}

      {step === 'business-type' && (
        <section className="form-section">
          <div className="container">
            <div className="form-container">
              <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>
                <>
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <ShirtIcon size={20} />
                  </span>
                  Регистрация для магазина
                </>
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '40px', fontSize: '16px' }}>
                Создайте аккаунт и начните использовать систему для магазинов
              </p>
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                  <ShirtIcon size={24} color="var(--accent)" />
                </div>
                <h3 style={{ 
                  color: 'var(--text)', 
                  fontSize: '20px', 
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Libbis POS для магазинов
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                  Универсальная система для управления магазином одежды и других товаров
                </p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button onClick={() => setStep('info')} className="btn-secondary" style={{ marginRight: '12px' }}>
                  ← {t('common.back')}
                </button>
                <button
                  onClick={() => setStep('register')} 
                  className="btn-primary"
                  style={{ padding: '14px 28px', fontSize: '16px' }}
                >
                  Продолжить регистрацию →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 'shop-selection' && (
        <section className="form-section">
          <div className="container">
            <div className="form-container" style={{ maxWidth: '800px' }}>
              <h2>Выберите магазин</h2>
              <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '30px' }}>
                Выберите существующий магазин или создайте новый
              </p>
              
              {loadingShops ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                  <p style={{ color: 'var(--muted)', marginTop: '20px' }}>Загрузка магазинов...</p>
                </div>
              ) : shops.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '30px' }}>
                    {shops.map((shop) => (
                      <div
                        key={shop.id}
                        onClick={() => {
                          localStorage.setItem('shopId', shop.id)
                          navigate('/account')
                        }}
                  style={{
                          padding: '20px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                    cursor: 'pointer',
                          transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                          e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                        <h4 style={{ color: 'var(--text)', marginBottom: '8px', fontSize: '18px' }}>{shop.name}</h4>
                        {shop.inn && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>ИНН: {shop.inn}</p>}
                        {shop.address && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{shop.address}</p>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button onClick={() => setStep('info')} className="btn-secondary">
                      {t('common.back')}
                </button>
                <button
                      onClick={() => {
                        setIsCreatingNewShop(true)
                        setStep('business-type')
                      }} 
                      className="btn-primary"
                    >
                      Создать новый магазин
                </button>
              </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>У вас пока нет магазинов</p>
                  <button 
                    onClick={() => {
                      setIsCreatingNewShop(true)
                      setStep('business-type')
                    }} 
                    className="btn-primary"
                  >
                    Создать магазин
                  </button>
                  <button 
                    onClick={() => setStep('info')} 
                    className="btn-secondary"
                    style={{ marginLeft: '12px' }}
                  >
                  {t('common.back')}
                </button>
              </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 'register' && (
        <section className="form-section">
          <div className="container">
            <div className="form-container">
              <h2>{t('register.title')}</h2>
              <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '32px', fontSize: '14px' }}>
                {t('register.subtitle')}
              </p>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              {isCreatingNewShop && apiService.isAuthenticated() && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '14px',
                  color: 'var(--muted)'
                }}>
                  <strong style={{ color: 'var(--text)' }}>Создание нового магазина</strong>
                  <p style={{ marginTop: '8px', marginBottom: 0 }}>
                    Ваши личные данные уже есть в системе и будут использованы для нового магазина. Поля личных данных заблокированы.
                  </p>
                </div>
              )}
              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('register.name')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => !(isCreatingNewShop && apiService.isAuthenticated()) && setFormData({ ...formData, name: e.target.value })}
                      disabled={isCreatingNewShop && apiService.isAuthenticated()}
                      readOnly={isCreatingNewShop && apiService.isAuthenticated()}
                      style={isCreatingNewShop && apiService.isAuthenticated() ? {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      } : {}}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('register.email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => !(isCreatingNewShop && apiService.isAuthenticated()) && setFormData({ ...formData, email: e.target.value })}
                      disabled={isCreatingNewShop && apiService.isAuthenticated()}
                      readOnly={isCreatingNewShop && apiService.isAuthenticated()}
                      style={isCreatingNewShop && apiService.isAuthenticated() ? {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      } : {}}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('register.password')}</label>
                    <input
                      type="password"
                      required={!isCreatingNewShop || !apiService.isAuthenticated()}
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={isCreatingNewShop && apiService.isAuthenticated() ? 'Оставьте пустым, если не меняете' : ''}
                    />
                    {isCreatingNewShop && apiService.isAuthenticated() && (
                      <small style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Оставьте пустым, если не хотите менять пароль
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>{t('register.phone')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => !(isCreatingNewShop && apiService.isAuthenticated()) && setFormData({ ...formData, phone: e.target.value })}
                      disabled={isCreatingNewShop && apiService.isAuthenticated()}
                      readOnly={isCreatingNewShop && apiService.isAuthenticated()}
                      style={isCreatingNewShop && apiService.isAuthenticated() ? {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      } : {}}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('register.shopName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('register.inn')}</label>
                    <input
                      type="text"
                      required
                      value={formData.inn}
                      onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('register.city')}</label>
                    {citiesLoading ? (
                      <div style={{ padding: '14px 18px', color: 'var(--muted)', fontSize: '14px' }}>
                        {t('common.loading')}...
                      </div>
                    ) : citiesError || cities.length === 0 ? (
                      <div style={{ 
                        padding: '14px 18px', 
                        color: '#ef4444', 
                        fontSize: '14px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div>{citiesError || t('common.error')}</div>
                        <button
                          type="button"
                          onClick={loadCities}
                          disabled={citiesLoading}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            cursor: citiesLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                          }}
                        >
                          {citiesLoading ? t('common.loading') : t('common.retry')}
                        </button>
                      </div>
                    ) : (
                      <select
                        required
                        value={selectedCity?.id || ''}
                        onChange={(e) => {
                          const city = cities.find(c => c.id === e.target.value)
                          setSelectedCity(city || null)
                          setFormData({ ...formData, cityId: city?.id || '' })
                        }}
                      >
                        <option value="" disabled>{t('register.select_city')}</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {getCityName(city, i18n.language)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('register.address')}</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('register.description')} ({t('common.optional') || 'необязательно'})</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep('business-type')} className="btn-secondary">
                    {t('common.back')}
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? t('common.loading') : t('register.submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}


      {step === 'success' && licenseData && (
        <section className="success-section">
          <div className="container">
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2>{t('success.title')}</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>{t('success.subtitle')}</p>
              <div className="license-info">
                <div className="license-item">
                  <label>{t('success.shopId')}:</label>
                  <code>{licenseData.shopId}</code>
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(licenseData.shopId)
                        alert(t('success.copied'))
                      } catch (err) {
                        console.error('Failed to copy:', err)
                      }
                    }}
                    title={t('success.copy')}
                  >
                    <CopyIcon size={20} />
                  </button>
                </div>
                <div className="license-item">
                  <label>{t('success.licenseKey')}:</label>
                  <code>{licenseData.licenseKey}</code>
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(licenseData.licenseKey)
                        alert(t('success.copied'))
                      } catch (err) {
                        console.error('Failed to copy:', err)
                      }
                    }}
                    title={t('success.copy')}
                  >
                    <CopyIcon size={20} />
                  </button>
                </div>
                {licenseData.expiresAt && (
                  <div className="license-item" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                    <label>{t('success.expiresAt') || 'Истекает'}:</label>
                    <code style={{ color: 'var(--accent2)' }}>
                      {new Date(licenseData.expiresAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'tj' ? 'tg-TJ' : 'ru-RU')}
                    </code>
                  </div>
                )}
              </div>
              <p className="success-note">
                {t('success.instructions')}
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    const data = {
                      shopId: licenseData.shopId,
                      licenseKey: licenseData.licenseKey,
                      expiresAt: licenseData.expiresAt
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `license-${licenseData.licenseKey}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="btn-secondary"
                >
                  {t('success.download')}
                </button>
                <button 
                  onClick={() => { 
                    if (apiService.isAuthenticated()) {
                      navigate('/account')
                    } else {
                      setStep('info')
                      window.location.reload()
                    }
                  }} 
                  className="btn-primary"
                >
                  {apiService.isAuthenticated() ? t('nav.account') : t('success.continue')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default LandingPage

