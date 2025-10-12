// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,

  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,

  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/api/categories/${id}`,

  // Upload endpoints
  UPLOAD_SINGLE: `${API_BASE_URL}/api/upload/single`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/api/upload/multiple`,
}

export default API_BASE_URL
