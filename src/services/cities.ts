// Re-export City interface from api.ts for convenience
export type { City } from './api'

// Helper function to get city name based on language
export const getCityName = (city: { name: string; nameEn?: string; nameUz?: string; nameTj?: string }, lang: string): string => {
  switch (lang) {
    case 'en':
      return city.nameEn || city.name
    case 'uz':
      return city.nameUz || city.name
    case 'tj':
      return city.nameTj || city.name
    case 'ru':
    default:
      return city.name
  }
}

