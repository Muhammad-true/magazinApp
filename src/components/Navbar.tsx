import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { apiService } from '../services/api'
import { isMobile } from '../utils/pwa'
import { StoreIcon, HomeIcon, StarIcon, MoneyIcon, DownloadIcon, BookIcon, UserIcon, LockIcon } from './Icons'
import './Navbar.css'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated())
  }, [location])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const isActive = (path: string) => location.pathname === path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const mobile = isMobile()

  const handleLinkClick = () => {
    closeMenu()
  }

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (mobile) {
      e.preventDefault()
      closeMenu()
      // Небольшая задержка для закрытия меню перед скроллом
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }

  return (
    <>
      <nav className={`navbar ${mobile ? 'navbar-mobile' : ''}`}>
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
              <StoreIcon size={28} className="brand-icon" />
              <span className="brand-text">MagazinApp</span>
            </Link>

            {!mobile && (
              <div className="navbar-menu">
                <Link 
                  to="/" 
                  className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                >
                  {t('nav.home')}
                </Link>
                <a 
                  href="#features" 
                  className="navbar-link"
                >
                  {t('nav.features')}
                </a>
                <a 
                  href="#pricing" 
                  className="navbar-link"
                >
                  {t('nav.pricing')}
                </a>
                <Link 
                  to="/downloads" 
                  className={`navbar-link ${isActive('/downloads') ? 'active' : ''}`}
                >
                  {t('nav.downloads')}
                </Link>
                <Link 
                  to="/documentation?type=clothing" 
                  className={`navbar-link ${isActive('/documentation') ? 'active' : ''}`}
                >
                  {t('nav.documentation')}
                </Link>
                {isAuthenticated ? (
                  <Link 
                    to="/account" 
                    className={`navbar-link ${isActive('/account') ? 'active' : ''}`}
                  >
                    {t('nav.account')}
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link 
                      to="/register" 
                      className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="navbar-actions">
              {!mobile && (
                <div className="language-selector">
                  <button
                    className={`lang-btn ${i18n.language === 'ru' ? 'active' : ''}`}
                    onClick={() => changeLanguage('ru')}
                  >
                    RU
                  </button>
                  <button
                    className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    EN
                  </button>
                  <button
                    className={`lang-btn ${i18n.language === 'uz' ? 'active' : ''}`}
                    onClick={() => changeLanguage('uz')}
                  >
                    UZ
                  </button>
                </div>
              )}
              
              {mobile && (
                <>
                  <button 
                    className="mobile-nav-btn"
                    onClick={toggleMenu}
                    title={t('nav.pricing')}
                  >
                    <MoneyIcon size={20} />
                  </button>
                  <button 
                    className="mobile-nav-btn"
                    onClick={toggleMenu}
                    title={t('nav.downloads')}
                  >
                    <DownloadIcon size={20} />
                  </button>
                  <button 
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Menu"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobile && (
        <div 
          className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
        >
          <div 
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <StoreIcon size={28} className="brand-icon" />
              <span className="brand-text">MagazinApp</span>
              <button className="close-btn" onClick={closeMenu}>✕</button>
            </div>
            
            <div className="mobile-menu-content">
              <Link 
                to="/" 
                className={`mobile-menu-link ${isActive('/') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <HomeIcon size={24} className="menu-icon" />
                {t('nav.home')}
              </Link>
              <a 
                href="#features" 
                className="mobile-menu-link"
                onClick={(e) => {
                  handleAnchorClick(e, '#features')
                  handleLinkClick()
                }}
              >
                <StarIcon size={24} className="menu-icon" />
                {t('nav.features')}
              </a>
              <a 
                href="#pricing" 
                className="mobile-menu-link"
                onClick={(e) => {
                  handleAnchorClick(e, '#pricing')
                  handleLinkClick()
                }}
              >
                <MoneyIcon size={24} className="menu-icon" />
                {t('nav.pricing')}
              </a>
              <Link 
                to="/downloads" 
                className={`mobile-menu-link ${isActive('/downloads') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <DownloadIcon size={24} className="menu-icon" />
                {t('nav.downloads')}
              </Link>
              <Link 
                to="/documentation?type=clothing" 
                className={`mobile-menu-link ${isActive('/documentation') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <BookIcon size={24} className="menu-icon" />
                {t('nav.documentation')}
              </Link>
              {isAuthenticated ? (
                <Link 
                  to="/account" 
                  className={`mobile-menu-link ${isActive('/account') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <UserIcon size={24} className="menu-icon" />
                  {t('nav.account')}
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`mobile-menu-link ${isActive('/login') ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <LockIcon size={24} className="menu-icon" />
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/register" 
                    className={`mobile-menu-link ${isActive('/register') ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <span className="menu-icon">✍️</span>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-menu-footer">
              <div className="language-selector-mobile">
                <div className="language-label">{t('common.language')}</div>
                <div className="language-buttons">
                  <button
                    className={`lang-btn-mobile ${i18n.language === 'ru' ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage('ru')
                      closeMenu()
                    }}
                  >
                    <span className="lang-flag">🇷🇺</span>
                    <span className="lang-name">Русский</span>
                  </button>
                  <button
                    className={`lang-btn-mobile ${i18n.language === 'en' ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage('en')
                      closeMenu()
                    }}
                  >
                    <span className="lang-flag">🇬🇧</span>
                    <span className="lang-name">English</span>
                  </button>
                  <button
                    className={`lang-btn-mobile ${i18n.language === 'uz' ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage('uz')
                      closeMenu()
                    }}
                  >
                    <span className="lang-flag">🇺🇿</span>
                    <span className="lang-name">O'zbek</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar

