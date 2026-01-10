import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './Downloads.css'

interface DownloadItem {
  id: string
  title: string
  description: string
  platform: 'windows' | 'android' | 'server'
  version: string
  size: string
  icon: string
  downloadUrl?: string
  comingSoon?: boolean
}

const Downloads = () => {
  const { t } = useTranslation()

  const downloadItems: DownloadItem[] = [
    // Аптека
    {
      id: 'pharmacy-windows',
      title: t('downloads.pharmacy.windows.title'),
      description: t('downloads.pharmacy.windows.description'),
      platform: 'windows',
      version: '1.0.0',
      size: '~150 MB',
      icon: '💊',
      comingSoon: false
    },
    {
      id: 'pharmacy-android',
      title: t('downloads.pharmacy.android.title'),
      description: t('downloads.pharmacy.android.description'),
      platform: 'android',
      version: '1.0.0',
      size: '~50 MB',
      icon: '💊',
      comingSoon: false
    },
    // Магазин
    {
      id: 'shop-windows',
      title: t('downloads.shop.windows.title'),
      description: t('downloads.shop.windows.description'),
      platform: 'windows',
      version: '1.0.0',
      size: '~150 MB',
      icon: '🏪',
      comingSoon: false
    },
    {
      id: 'shop-android',
      title: t('downloads.shop.android.title'),
      description: t('downloads.shop.android.description'),
      platform: 'android',
      version: '1.0.0',
      size: '~50 MB',
      icon: '🏪',
      comingSoon: false
    },
    // Windows сервер (главная-сервер касса 1)
    {
      id: 'server-windows',
      title: t('downloads.server.windows.title'),
      description: t('downloads.server.windows.description'),
      platform: 'server',
      version: '1.0.0',
      size: '~200 MB',
      icon: '🖥️',
      comingSoon: false
    },
    // Просто программа Windows
    {
      id: 'standalone-windows',
      title: t('downloads.standalone.windows.title'),
      description: t('downloads.standalone.windows.description'),
      platform: 'windows',
      version: '1.0.0',
      size: '~120 MB',
      icon: '💻',
      comingSoon: false
    },
    // Просто программа Android
    {
      id: 'standalone-android',
      title: t('downloads.standalone.android.title'),
      description: t('downloads.standalone.android.description'),
      platform: 'android',
      version: '1.0.0',
      size: '~45 MB',
      icon: '📱',
      comingSoon: false
    }
  ]

  const handleDownload = (item: DownloadItem) => {
    if (item.comingSoon) {
      alert(t('downloads.comingSoon'))
      return
    }

    // Здесь будет логика скачивания
    // Пока просто показываем сообщение
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank')
    } else {
      // Временная заглушка - в реальном приложении здесь будет реальная ссылка
      console.log(`Downloading ${item.title}...`)
      alert(`${t('downloads.downloading')} ${item.title}`)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows':
        return '🪟'
      case 'android':
        return '🤖'
      case 'server':
        return '🖥️'
      default:
        return '📦'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'windows':
        return 'Windows'
      case 'android':
        return 'Android'
      case 'server':
        return t('downloads.server.platform')
      default:
        return platform
    }
  }

  const pharmacyItems = downloadItems.filter(item => item.id.includes('pharmacy'))
  const shopItems = downloadItems.filter(item => item.id.includes('shop'))
  const serverItems = downloadItems.filter(item => item.id.includes('server'))
  const standaloneItems = downloadItems.filter(item => item.id.includes('standalone'))

  return (
    <div className="downloads-page">
      <div className="container">
        {/* Header */}
        <div className="downloads-header">
          <Link to="/" className="btn-back">
            ← {t('nav.home')}
          </Link>
          <div>
            <h1 className="downloads-title">{t('downloads.title')}</h1>
            <p className="downloads-subtitle">{t('downloads.subtitle')}</p>
          </div>
        </div>

        {/* Аптека */}
        <div className="downloads-section">
          <h2 className="section-title">
            <span className="section-icon">💊</span>
            {t('downloads.pharmacy.title')}
          </h2>
          <p className="section-description">{t('downloads.pharmacy.description')}</p>
          <div className="downloads-grid">
            {pharmacyItems.map((item) => (
              <div key={item.id} className="download-card">
                <div className="download-card-header">
                  <div className="download-icon">{item.icon}</div>
                  <div className="download-platform">
                    {getPlatformIcon(item.platform)} {getPlatformName(item.platform)}
                  </div>
                </div>
                <h3 className="download-card-title">{item.title}</h3>
                <p className="download-card-description">{item.description}</p>
                <div className="download-card-info">
                  <span className="download-version">v{item.version}</span>
                  <span className="download-size">{item.size}</span>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  className={`btn btn-primary download-btn ${item.comingSoon ? 'coming-soon' : ''}`}
                  disabled={item.comingSoon}
                >
                  {item.comingSoon ? t('downloads.comingSoon') : t('downloads.download')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Магазин */}
        <div className="downloads-section">
          <h2 className="section-title">
            <span className="section-icon">🏪</span>
            {t('downloads.shop.title')}
          </h2>
          <p className="section-description">{t('downloads.shop.description')}</p>
          <div className="downloads-grid">
            {shopItems.map((item) => (
              <div key={item.id} className="download-card">
                <div className="download-card-header">
                  <div className="download-icon">{item.icon}</div>
                  <div className="download-platform">
                    {getPlatformIcon(item.platform)} {getPlatformName(item.platform)}
                  </div>
                </div>
                <h3 className="download-card-title">{item.title}</h3>
                <p className="download-card-description">{item.description}</p>
                <div className="download-card-info">
                  <span className="download-version">v{item.version}</span>
                  <span className="download-size">{item.size}</span>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  className={`btn btn-primary download-btn ${item.comingSoon ? 'coming-soon' : ''}`}
                  disabled={item.comingSoon}
                >
                  {item.comingSoon ? t('downloads.comingSoon') : t('downloads.download')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Windows сервер (главная-сервер касса 1) */}
        <div className="downloads-section">
          <h2 className="section-title">
            <span className="section-icon">🖥️</span>
            {t('downloads.server.title')}
          </h2>
          <p className="section-description">{t('downloads.server.description')}</p>
          <div className="downloads-grid">
            {serverItems.map((item) => (
              <div key={item.id} className="download-card">
                <div className="download-card-header">
                  <div className="download-icon">{item.icon}</div>
                  <div className="download-platform">
                    {getPlatformIcon(item.platform)} {getPlatformName(item.platform)}
                  </div>
                </div>
                <h3 className="download-card-title">{item.title}</h3>
                <p className="download-card-description">{item.description}</p>
                <div className="download-card-info">
                  <span className="download-version">v{item.version}</span>
                  <span className="download-size">{item.size}</span>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  className={`btn btn-primary download-btn ${item.comingSoon ? 'coming-soon' : ''}`}
                  disabled={item.comingSoon}
                >
                  {item.comingSoon ? t('downloads.comingSoon') : t('downloads.download')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Просто программы */}
        <div className="downloads-section">
          <h2 className="section-title">
            <span className="section-icon">📦</span>
            {t('downloads.standalone.title')}
          </h2>
          <p className="section-description">{t('downloads.standalone.description')}</p>
          <div className="downloads-grid">
            {standaloneItems.map((item) => (
              <div key={item.id} className="download-card">
                <div className="download-card-header">
                  <div className="download-icon">{item.icon}</div>
                  <div className="download-platform">
                    {getPlatformIcon(item.platform)} {getPlatformName(item.platform)}
                  </div>
                </div>
                <h3 className="download-card-title">{item.title}</h3>
                <p className="download-card-description">{item.description}</p>
                <div className="download-card-info">
                  <span className="download-version">v{item.version}</span>
                  <span className="download-size">{item.size}</span>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  className={`btn btn-primary download-btn ${item.comingSoon ? 'coming-soon' : ''}`}
                  disabled={item.comingSoon}
                >
                  {item.comingSoon ? t('downloads.comingSoon') : t('downloads.download')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Downloads
