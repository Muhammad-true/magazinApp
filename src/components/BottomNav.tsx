import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiService } from '../services/api'
import { isMobile } from '../utils/pwa'
import './BottomNav.css'

const BottomNav = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isAuthenticated = apiService.isAuthenticated()

  if (!isMobile()) {
    return null
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">{t('nav.home')}</span>
      </Link>
      
      <Link 
        to="/downloads" 
        className={`bottom-nav-item ${isActive('/downloads') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">📥</span>
        <span className="bottom-nav-label">{t('nav.downloads')}</span>
      </Link>
      
      <Link 
        to="/documentation?type=clothing" 
        className={`bottom-nav-item ${isActive('/documentation') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">📖</span>
        <span className="bottom-nav-label">{t('nav.documentation')}</span>
      </Link>
      
      {isAuthenticated ? (
        <Link 
          to="/account" 
          className={`bottom-nav-item ${isActive('/account') ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">👤</span>
          <span className="bottom-nav-label">{t('nav.account')}</span>
        </Link>
      ) : (
        <Link 
          to="/login" 
          className={`bottom-nav-item ${isActive('/login') ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🔐</span>
          <span className="bottom-nav-label">{t('nav.login')}</span>
        </Link>
      )}
    </nav>
  )
}

export default BottomNav
