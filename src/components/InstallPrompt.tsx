import { useEffect, useState } from 'react'
import { isMobile, isPWAInstalled, showInstallPrompt } from '../utils/pwa'
import { PhoneIcon } from './Icons'
import './InstallPrompt.css'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Показываем промпт только на мобильных устройствах
    if (!isMobile() || isPWAInstalled()) {
      return
    }

    // Проверяем, было ли уже показано предложение установки
    const installPromptShown = localStorage.getItem('installPromptShown')
    if (installPromptShown) {
      return
    }

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        }
        setDeferredPrompt(null)
        setShowPrompt(false)
        localStorage.setItem('installPromptShown', 'true')
      })
    } else {
      showInstallPrompt()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptShown', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">
          <PhoneIcon size={48} color="var(--accent)" />
        </div>
        <div className="install-prompt-text">
          <h3>Установить MagazinApp</h3>
          <p>Добавьте приложение на главный экран для быстрого доступа</p>
        </div>
        <div className="install-prompt-actions">
          <button onClick={handleInstall} className="install-btn">
            Установить
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Позже
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
