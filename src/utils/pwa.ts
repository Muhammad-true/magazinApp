// Утилиты для PWA

export const isPWAInstalled = (): boolean => {
  // Проверяем, запущено ли приложение в режиме standalone (установлено)
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
}

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export const showInstallPrompt = () => {
  // Показываем кнопку установки, если доступно
  const deferredPrompt = (window as any).deferredPrompt
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      (window as any).deferredPrompt = null
    })
  }
}

export const registerInstallPrompt = () => {
  // Сохраняем событие beforeinstallprompt для показа кнопки установки
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    ;(window as any).deferredPrompt = e
  })
}
