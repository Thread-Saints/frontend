// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,

  // Add more endpoints here as needed
  // Example:
  // PRODUCTS: `${API_BASE_URL}/api/products`,
  // USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
}

export default API_BASE_URL
