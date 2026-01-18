import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import './Subscription.css'

const Subscription = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Перенаправляем на страницу выбора магазина, так как subscription больше не нужна
    const shopId = localStorage.getItem('shopId')
    if (!shopId) {
      if (apiService.isAuthenticated()) {
        navigate('/shop-selection')
      } else {
        navigate('/register')
    }
    } else {
      // Если shopId есть, переходим сразу на оплату
    navigate('/payment')
  }
  }, [navigate])
  
  // Компонент только перенаправляет, поэтому возвращаем null
  return null

}

export default Subscription

