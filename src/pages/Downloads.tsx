import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
    DesktopIcon,
    PackageIcon,
    PhoneIcon,
    StoreIcon
} from '../components/Icons'
import './Downloads.css'

interface DownloadItem {
  id: string
  title: string
  description: string
  platform: 'windows' | 'android' | 'server'
  version: string
  size: string
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>
  downloadUrl?: string
  comingSoon?: boolean
}

const Downloads = () => {
  const { t } = useTranslation()

  const downloadItems: DownloadItem[] = [
    // Магазин
    {
      id: 'shop-windows',
      title: t('downloads.shop.windows.title'),
      description: t('downloads.shop.windows.description'),
      platform: 'windows',
      version: '1.0.0',
      size: '~150 MB',
      icon: StoreIcon,
      comingSoon: false,
      downloadUrl: 'https://drive.google.com/file/d/1qtjAUGUOwYvNFNlIWr8Wd6sf25I1vrc0/view?usp=sharing'
    },
    {
      id: 'shop-android',
      title: t('downloads.shop.android.title'),
      description: t('downloads.shop.android.description'),
      platform: 'android',
      version: '1.0.0',
      size: '~50 MB',
      icon: StoreIcon,
      comingSoon: false
    },
    // Windows сервер (главная-сервер касса 1)
    {
      id: 'server-windows',
      title: t('downloads.server.windows.title'),
      description: 'Сервер с встроенным MySQL. При установке нужен пароль root MySQL (создайте/введите свой). Подходит, если БД не стоит.',
      platform: 'server',
      version: '1.0.0',
      size: '~200 MB',
      icon: DesktopIcon,
      comingSoon: false,
      downloadUrl: 'https://drive.google.com/file/d/1z_2OVIBJAnSPDEAwo54ejfo7qdWjwKoQ/view?usp=sharing'
    },
    // Сервер без встроенного MySQL (только сервер)
    {
      id: 'server-windows-lite',
      title: 'Сервер без MySQL (Windows)',
      description: 'Установите отдельно MySQL/PostgreSQL и используйте этот сервер',
      platform: 'server',
      version: '1.0.0',
      size: '~180 MB',
      icon: DesktopIcon,
      comingSoon: false,
      downloadUrl: 'https://drive.google.com/file/d/18cJ6uig05FM4YOPxhdmyWychmu-N9AJk/view?usp=sharing'
    },
    // Просто программа Windows
    {
      id: 'standalone-windows',
      title: t('downloads.standalone.windows.title'),
      description: t('downloads.standalone.windows.description'),
      platform: 'windows',
      version: '1.0.0',
      size: '~120 MB',
      icon: DesktopIcon,
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
      icon: PhoneIcon,
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
        return <DesktopIcon size={16} color="currentColor" />
      case 'android':
        return <PhoneIcon size={16} color="currentColor" />
      case 'server':
        return <DesktopIcon size={16} color="currentColor" />
      default:
        return <PackageIcon size={16} color="currentColor" />
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
                  <div className="download-icon">
                    {React.createElement(item.icon, { size: 32, color: 'var(--accent)' })}
                  </div>
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
            <span className="section-icon">
              <DesktopIcon size={24} />
            </span>
            {t('downloads.server.title')}
          </h2>
          <p className="section-description">
            Выберите подходящий сервер:
            <br />• Уже есть MySQL/PostgreSQL → «Сервер без MySQL (Windows)», нужен ваш root пароль БД.
            <br />• Базы нет → «Сервер с MySQL (Windows)», установщик поставит MySQL, введите свой root пароль при установке.
          </p>
          <div className="downloads-grid">
            {serverItems.map((item) => (
              <div key={item.id} className="download-card">
                <div className="download-card-header">
                  <div className="download-icon">
                    {React.createElement(item.icon, { size: 32, color: 'var(--accent)' })}
                  </div>
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
                  <div className="download-icon">
                    {React.createElement(item.icon, { size: 32, color: 'var(--accent)' })}
                  </div>
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
