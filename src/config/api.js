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

  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  CART_UPDATE: (itemId) => `${API_BASE_URL}/api/cart/update/${itemId}`,
  CART_REMOVE: (itemId) => `${API_BASE_URL}/api/cart/remove/${itemId}`,
  CART_CLEAR: `${API_BASE_URL}/api/cart/clear`,

  // Wishlist endpoints
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  WISHLIST_ADD: `${API_BASE_URL}/api/wishlist/add`,
  WISHLIST_REMOVE: (itemId) => `${API_BASE_URL}/api/wishlist/remove/${itemId}`,
  WISHLIST_CLEAR: `${API_BASE_URL}/api/wishlist/clear`,
  WISHLIST_CHECK: (productId) => `${API_BASE_URL}/api/wishlist/check/${productId}`,
}

export default API_BASE_URL
