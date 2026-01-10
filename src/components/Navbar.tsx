import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Navbar.css'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏪</span>
            <span className="brand-text">MagazinApp</span>
            <span className="brand-tagline">Магазины & Аптеки</span>
          </Link>

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
              to="/register" 
              className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
            >
              {t('nav.register')}
            </Link>
          </div>

          <div className="navbar-actions">
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
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

