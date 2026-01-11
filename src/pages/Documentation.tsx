import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import './Documentation.css'

const Documentation = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const businessType = searchParams.get('type') || 'clothing' // 'pharmacy' или 'clothing'
  const [activeSection, setActiveSection] = useState<string>('getting-started')

  // Если выбрана аптека - показываем сообщение "скоро будет"
  if (businessType === 'pharmacy') {
    return (
      <div className="documentation-page">
        <div className="container">
          <div className="docs-header">
            <Link to="/" className="btn-back">
              ← {t('nav.home')}
            </Link>
            <div>
              <h1 className="docs-title">💊 Обучение для аптек</h1>
              <p className="docs-subtitle">Руководство по работе с системой</p>
            </div>
          </div>
          
          <div className="coming-soon-container">
            <div className="coming-soon-icon">🚧</div>
            <h2 className="coming-soon-title">
              Скоро будет доступно!
            </h2>
            <p className="coming-soon-text">
              Мы работаем над созданием подробного руководства для аптек. 
              Оно будет включать все необходимые инструкции с простыми объяснениями и иконками.
            </p>
            <div className="coming-soon-note">
              <p>
                💡 <strong>Следите за обновлениями!</strong> Руководство появится в ближайшее время.
              </p>
            </div>
            <Link to="/documentation?type=clothing" className="btn btn-primary coming-soon-link">
              Посмотреть руководство для магазинов →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Для магазина одежды - полное руководство
  const sections = [
    { id: 'getting-started', label: 'Начало работы', icon: '🚀' },
    { id: 'cashier', label: 'Работа с кассой', icon: '💰' },
    { id: 'products', label: 'Товары и склад', icon: '📦' },
    { id: 'clients', label: 'Клиенты', icon: '👥' },
    { id: 'reports', label: 'Отчеты', icon: '📊' },
    { id: 'admin', label: 'Админ-панель', icon: '⚙️' }
  ]

  return (
    <div className="documentation-page">
      <div className="container">
        {/* Header */}
        <div className="docs-header">
          <Link to="/" className="btn-back">
            ← {t('nav.home')}
          </Link>
          <div>
            <h1 className="docs-title">👕 Обучение для магазинов</h1>
            <p className="docs-subtitle">Простое руководство по работе с системой учета</p>
          </div>
        </div>

        <div className="docs-content">
          {/* Sidebar Navigation */}
          <aside className="docs-sidebar">
            <nav className="docs-nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`docs-nav-item ${activeSection === section.id ? 'active' : ''}`}
                >
                  <span className="docs-nav-icon">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="docs-main">
            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">🚀</span>
                  Начало работы
                </h2>
                
                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>📥 Установка программы</h3>
                      <p>Скачайте и установите программу на ваш компьютер</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">💻</span>
                          <div>
                            <strong>Для Windows:</strong>
                            <p>Запустите установочный файл и следуйте инструкциям</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>🔑 Первый запуск</h3>
                      <p>При первом запуске программа попросит вас ввести данные</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🌐</span>
                          <div>
                            <strong>Введите адрес сервера:</strong>
                            <p>Например: http://192.168.1.34:8080/api</p>
                            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                              💡 Адрес можно найти в настройках на главном компьютере
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>👤 Вход в систему</h3>
                      <p>Введите ваш логин и пароль</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔐</span>
                          <div>
                            <strong>Данные для входа:</strong>
                            <p>Логин и пароль вам предоставит администратор</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>✅ Готово!</h3>
                      <p>Теперь вы можете начать работу с программой</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🎉</span>
                          <div>
                            <strong>Что дальше?</strong>
                            <p>Изучите разделы ниже, чтобы узнать, как работать с кассой, товарами и отчетами</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Cashier Section */}
            {activeSection === 'cashier' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">💰</span>
                  Работа с кассой
                </h2>

                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>🔄 Открытие смены</h3>
                      <p>Перед началом работы нужно открыть смену</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">▶️</span>
                          <div>
                            <strong>Как открыть:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Нажмите кнопку <strong>"Открыть смену"</strong></li>
                              <li>Укажите начальную сумму в кассе (если нужно)</li>
                              <li>Готово! Можно начинать продажи</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>🔍 Поиск товара</h3>
                      <p>Найдите товар для продажи</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔎</span>
                          <div>
                            <strong>Способы поиска:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Введите название товара</li>
                              <li>Введите артикул</li>
                              <li>Отсканируйте штрихкод сканером</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>👕 Выбор размера и цвета</h3>
                      <p>Выберите нужную вариацию товара</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🎨</span>
                          <div>
                            <strong>Что выбрать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Размер (S, M, L, XL и т.д.)</li>
                              <li>Цвет товара</li>
                              <li>Количество штук</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>👤 Добавление клиента (необязательно)</h3>
                      <p>Если у покупателя есть карта лояльности</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">💳</span>
                          <div>
                            <strong>Как добавить:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Нажмите <strong>"Выбрать клиента"</strong></li>
                              <li>Отсканируйте карту или введите номер телефона</li>
                              <li>Скидки и бонусы применятся автоматически</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                      <h3>✅ Оформление чека</h3>
                      <p>Завершите продажу</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🧾</span>
                          <div>
                            <strong>Что сделать:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Проверьте итоговую сумму</li>
                              <li>Нажмите <strong>"Оформить чек"</strong></li>
                              <li>Чек будет сохранен автоматически</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">6</div>
                    <div className="step-content">
                      <h3>🔒 Закрытие смены</h3>
                      <p>В конце рабочего дня закройте смену</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📋</span>
                          <div>
                            <strong>Как закрыть:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Нажмите <strong>"Закрыть смену"</strong></li>
                              <li>Проверьте итоговую сумму</li>
                              <li>Подтвердите закрытие</li>
                              <li>Будет создан отчет о работе</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">📦</span>
                  Товары и склад
                </h2>

                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>➕ Добавление товара</h3>
                      <p>Добавьте новый товар в систему</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📝</span>
                          <div>
                            <strong>Что нужно указать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Название товара</li>
                              <li>Категорию (футболки, джинсы и т.д.)</li>
                              <li>Размеры (S, M, L, XL)</li>
                              <li>Цвета</li>
                              <li>Цену продажи</li>
                              <li>Количество на складе</li>
                              <li>Фотографии товара</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>✏️ Редактирование товара</h3>
                      <p>Измените информацию о товаре</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔄</span>
                          <div>
                            <strong>Как изменить:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Найдите товар в списке</li>
                              <li>Нажмите на товар или кнопку "Редактировать"</li>
                              <li>Измените нужные данные</li>
                              <li>Сохраните изменения</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>📊 Управление складом</h3>
                      <p>Изменяйте количество товаров на складе</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📥</span>
                          <div>
                            <strong>Что можно сделать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li><strong>Добавить</strong> - увеличить количество (при поступлении товара)</li>
                              <li><strong>Списать</strong> - уменьшить количество (при порче, утере)</li>
                              <li><strong>Установить</strong> - задать точное количество (при инвентаризации)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Clients Section */}
            {activeSection === 'clients' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">👥</span>
                  Работа с клиентами
                </h2>

                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>➕ Добавление клиента</h3>
                      <p>Добавьте нового клиента в базу</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📝</span>
                          <div>
                            <strong>Что нужно указать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Имя клиента</li>
                              <li>Номер телефона</li>
                              <li>Номер карты лояльности (если есть)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>🔍 Поиск клиента</h3>
                      <p>Найдите клиента в базе</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔎</span>
                          <div>
                            <strong>Как искать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>По имени</li>
                              <li>По номеру телефона</li>
                              <li>По номеру карты</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>🎁 Бонусы клиента</h3>
                      <p>Управляйте бонусами клиента</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">⭐</span>
                          <div>
                            <strong>Что можно сделать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Посмотреть количество бонусов</li>
                              <li>Начислить бонусы вручную</li>
                              <li>Списать бонусы</li>
                              <li>Посмотреть историю покупок</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">📊</span>
                  Отчеты и статистика
                </h2>

                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>📈 Просмотр отчетов</h3>
                      <p>Посмотрите статистику продаж</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <div>
                            <strong>Что можно посмотреть:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Выручку за день, неделю, месяц</li>
                              <li>Количество проданных товаров</li>
                              <li>Средний чек</li>
                              <li>Топ самых продаваемых товаров</li>
                              <li>Продажи по категориям</li>
                              <li>Продажи по цветам</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>📅 Выбор периода</h3>
                      <p>Выберите период для анализа</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🗓️</span>
                          <div>
                            <strong>Доступные периоды:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Сегодня</li>
                              <li>Неделя</li>
                              <li>Месяц</li>
                              <li>Произвольный период (выберите даты)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Admin Section */}
            {activeSection === 'admin' && (
              <section className="docs-section">
                <h2 className="docs-section-title">
                  <span className="section-icon">⚙️</span>
                  Админ-панель
                </h2>

                <div className="guide-card">
                  <div className="guide-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>🏠 Дашборд</h3>
                      <p>Главная страница с общей статистикой</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">📊</span>
                          <div>
                            <strong>Что показывает:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Выручку, прибыль, чистый доход</li>
                              <li>Графики продаж</li>
                              <li>Количество чеков</li>
                              <li>Средний чек</li>
                              <li>Активные смены кассиров</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>👤 Управление пользователями</h3>
                      <p>Добавляйте и настраивайте пользователей</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔐</span>
                          <div>
                            <strong>Что можно сделать:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Добавить нового пользователя</li>
                              <li>Настроить права доступа</li>
                              <li>Изменить пароль</li>
                              <li>Назначить роль (администратор, кассир)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>⚙️ Настройки</h3>
                      <p>Настройте параметры магазина</p>
                      <div className="step-details">
                        <div className="detail-item">
                          <span className="detail-icon">🔧</span>
                          <div>
                            <strong>Что можно настроить:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Название магазина</li>
                              <li>Адрес сервера</li>
                              <li>Другие параметры системы</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}

export default Documentation
