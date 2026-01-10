import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const { t } = useTranslation()

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">{t('hero.title')}</h1>
              <p className="hero-subtitle">{t('hero.subtitle')}</p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  {t('hero.cta')}
                </Link>
                <a href="#features" className="btn btn-outline">
                  {t('hero.learnMore')}
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-placeholder">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop" 
                  alt="Store Management"
                  loading="lazy"
                  srcSet="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop 400w, https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop 800w"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="container">
          <h2 className="section-title">{t('features.title')}</h2>
          <p className="section-subtitle">{t('features.subtitle')}</p>
          
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">📦</div>
              <h3 className="feature-title">{t('features.products.title')}</h3>
              <p className="feature-description">{t('features.products.description')}</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🛒</div>
              <h3 className="feature-title">{t('features.orders.title')}</h3>
              <p className="feature-description">{t('features.orders.description')}</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">{t('features.analytics.title')}</h3>
              <p className="feature-description">{t('features.analytics.description')}</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">{t('features.support.title')}</h3>
              <p className="feature-description">{t('features.support.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="section screenshots-section">
        <div className="container">
          <h2 className="section-title">Скриншоты приложения</h2>
          <p className="section-subtitle">Посмотрите, как выглядит приложение для магазинов и аптек</p>
          
          <div className="screenshots-grid">
            <div className="screenshot-card">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Dashboard"
                loading="lazy"
                srcSet="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop 300w, https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop 600w"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <p>Панель управления</p>
            </div>
            <div className="screenshot-card">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" 
                alt="Products"
                loading="lazy"
                srcSet="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop 300w, https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop 600w"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <p>Управление товарами</p>
            </div>
            <div className="screenshot-card">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop" 
                alt="Analytics"
                loading="lazy"
                srcSet="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop 300w, https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop 600w"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <p>Аналитика и отчеты</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="section pricing-preview-section">
        <div className="container">
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.subtitle')}</p>
          
          <div className="pricing-preview">
            <Link to="/register" className="btn btn-primary btn-large">
              {t('hero.cta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

