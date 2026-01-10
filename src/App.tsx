import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import Account from './pages/Account'
import Documentation from './pages/Documentation'
import Downloads from './pages/Downloads'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Payment from './pages/Payment'
import Register from './pages/Register'
import ShopSelection from './pages/ShopSelection'
import Success from './pages/Success'
import { registerInstallPrompt } from './utils/pwa'

function AppContent() {
  const location = useLocation()
  
  // Скрываем BottomNav на некоторых страницах
  const hideBottomNav = ['/login', '/register', '/payment', '/success'].includes(location.pathname)

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/shop-selection" element={<ShopSelection />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
      <InstallPrompt />
    </div>
  )
}

function App() {
  useEffect(() => {
    // Регистрируем обработчик для показа кнопки установки PWA
    registerInstallPrompt()
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
