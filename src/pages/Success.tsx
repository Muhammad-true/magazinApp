import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LicenseData } from '../services/api'
import { CopyIcon, CheckIcon } from '../components/Icons'
import './Success.css'

const Success = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null)
  const [copied, setCopied] = useState<string>('')

  useEffect(() => {
    const savedLicense = localStorage.getItem('licenseData')
    // const savedUserData = localStorage.getItem('userData')

    if (!savedLicense) {
      navigate('/register')
      return
    }

    setLicenseData(JSON.parse(savedLicense))
  }, [navigate])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = () => {
    if (!licenseData) return

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const data = {
      shopId: licenseData.shopId,
      licenseKey: licenseData.licenseKey,
      shopName: userData.shop?.name || '',
      expiresAt: licenseData.expiresAt,
      subscriptionType: licenseData.subscriptionType,
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
  }

  if (!licenseData) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-container">
          <div className="success-icon">
            <CheckIcon size={64} color="white" />
          </div>
          <h1 className="success-title">{t('success.title')}</h1>
          <p className="success-subtitle">{t('success.subtitle')}</p>

          <div className="license-info card">
            <div className="license-item">
              <label className="license-label">{t('success.shopId')}</label>
              <div className="license-value-container">
                <code className="license-value">{licenseData.shopId}</code>
                <button
                  onClick={() => copyToClipboard(licenseData.shopId, 'shopId')}
                  className="copy-btn"
                  title={t('success.copy')}
                >
                  {copied === 'shopId' ? (
                    <CheckIcon size={20} />
                  ) : (
                    <CopyIcon size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="license-item">
              <label className="license-label">{t('success.licenseKey')}</label>
              <div className="license-value-container">
                <code className="license-value license-key">{licenseData.licenseKey}</code>
                <button
                  onClick={() => copyToClipboard(licenseData.licenseKey, 'licenseKey')}
                  className="copy-btn"
                  title={t('success.copy')}
                >
                  {copied === 'licenseKey' ? (
                    <CheckIcon size={20} />
                  ) : (
                    <CopyIcon size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="license-details">
              <div className="detail-item">
                <span className="detail-label">Тип подписки:</span>
                <span className="detail-value">{licenseData.subscriptionType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Статус:</span>
                <span className="detail-value">{licenseData.subscriptionStatus}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Истекает:</span>
                <span className="detail-value">
                  {new Date(licenseData.expiresAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {licenseData.daysRemaining > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Осталось дней:</span>
                  <span className="detail-value">{licenseData.daysRemaining}</span>
                </div>
              )}
            </div>
          </div>

          <div className="success-instructions">
            <p>{t('success.instructions')}</p>
          </div>

          <div className="success-actions">
            <button onClick={downloadData} className="btn btn-outline">
              {t('success.download')}
            </button>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              {t('success.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success

