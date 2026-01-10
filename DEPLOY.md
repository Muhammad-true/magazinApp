# Инструкция по деплою на Vercel

## Быстрый старт

### Способ 1: Через веб-интерфейс Vercel (Рекомендуется)

1. **Зайдите на [vercel.com](https://vercel.com)**
   - Зарегистрируйтесь (можно через GitHub)
   - Это бесплатно для публичных проектов

2. **Добавьте новый проект**
   - Нажмите "Add New Project"
   - Подключите ваш GitHub репозиторий
   - Или загрузите проект через drag & drop

3. **Настройки проекта**
   - Framework Preset: **Vite** (автоматически определится)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `.` (корень проекта)

4. **Добавьте переменную окружения**
   - Перейдите в Settings → Environment Variables
   - Добавьте новую переменную:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://api.magazinapp.com/api/v1` (или ваш API URL)
     - **Environment**: Production, Preview, Development (отметьте все)

5. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки
   - Получите URL вида: `https://your-project.vercel.app`

### Способ 2: Через Vercel CLI

1. **Установите Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Войдите в Vercel**
   ```bash
   vercel login
   ```

3. **Деплой проекта**
   ```bash
   # Перейдите в папку проекта
   cd d:\magazini_man\magazinApp
   
   # Первый деплой (preview)
   vercel
   
   # Следуйте инструкциям:
   # - Set up and deploy? Y
   # - Which scope? (выберите ваш аккаунт)
   # - Link to existing project? N
   # - Project name? (нажмите Enter для автоматического имени)
   # - Directory? ./
   # - Override settings? N
   ```

4. **Добавьте переменную окружения**
   ```bash
   vercel env add VITE_API_URL
   # Введите значение: https://api.magazinapp.com/api/v1
   # Выберите окружения: Production, Preview, Development
   ```

5. **Продакшн деплой**
   ```bash
   vercel --prod
   ```

## Настройка домена

1. **В панели Vercel**
   - Перейдите в Settings → Domains
   - Нажмите "Add Domain"

2. **Добавьте домен**
   - Введите ваш домен (например, `magazinapp.com`)
   - Следуйте инструкциям по настройке DNS

3. **DNS настройки**
   - Добавьте CNAME запись:
     - **Name**: `@` или `www`
     - **Value**: `cname.vercel-dns.com`
   - Или A запись (если требуется):
     - **Value**: IP адрес от Vercel (будет указан в инструкциях)

## Важные моменты

### 1. API должен быть доступен по HTTPS
   - Убедитесь, что ваш API сервер (`159.89.99.252:8080`) доступен по HTTPS
   - Или используйте домен с SSL сертификатом

### 2. Настройка CORS на бэкенде
   - Добавьте домен Vercel в разрешенные источники:
     ```javascript
     // Пример для Express.js
     app.use(cors({
       origin: [
         'https://your-project.vercel.app',
         'https://magazinapp.com',
         'http://localhost:3000' // для разработки
       ],
       credentials: true
     }));
     ```

### 3. Переменные окружения
   - Все переменные, начинающиеся с `VITE_`, будут доступны в браузере
   - Не храните секретные данные в `VITE_*` переменных
   - Используйте Environment Variables в настройках Vercel

### 4. Автоматический деплой
   - При подключении GitHub репозитория, каждый push в main ветку автоматически деплоится
   - Pull Request создают preview деплои

## Проверка деплоя

После деплоя проверьте:

1. ✅ Сайт открывается по URL Vercel
2. ✅ Все страницы работают (роутинг)
3. ✅ API запросы проходят успешно
4. ✅ Изображения и статические файлы загружаются
5. ✅ Мультиязычность работает

## Обновление проекта

После изменений в коде:

```bash
# Если используете CLI
vercel --prod

# Или просто сделайте push в GitHub (если подключен)
git push origin main
```

## Поддержка

Если возникли проблемы:
- Проверьте логи в панели Vercel → Deployments
- Убедитесь, что переменные окружения установлены
- Проверьте, что API доступен и CORS настроен правильно
