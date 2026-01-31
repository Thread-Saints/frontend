// Centralized API configuration
// const API_BASE_URL = 'http://localhost:5000'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.threadsaints.com'


export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  NEWSLETTER: `${API_BASE_URL}/api/auth/newsletter`,

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

  // Payment endpoints
  CREATE_PAYMENT: `${API_BASE_URL}/api/payment/create-order`,
  PAYMENT_CALLBACK: `${API_BASE_URL}/api/payment/callback`,
  PAYMENT_REDIRECT: `${API_BASE_URL}/api/payment/redirect`,
  GET_ORDERS: `${API_BASE_URL}/api/payment/orders`,
  GET_ORDER_BY_ID: (id) => `${API_BASE_URL}/api/payment/orders/${id}`,
  GET_PHONEPE_CONFIG: `${API_BASE_URL}/api/payment/phonepe-config`,
  CHECK_PAYMENT_STATUS: (txnId) => `${API_BASE_URL}/api/payment/check-status/${txnId}`,
  CHECK_DISCOUNT_ELIGIBILITY: `${API_BASE_URL}/api/payment/check-discount`,
  CHECK_VALENTINE: `${API_BASE_URL}/api/payment/check-valentine`,

  // Admin Order endpoints
  GET_ALL_ORDERS_ADMIN: `${API_BASE_URL}/api/payment/admin/orders`,
  UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}/api/payment/admin/orders/${id}/status`,

  // Profile endpoints
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile`,
  GET_ADDRESSES: `${API_BASE_URL}/api/profile/addresses`,
  ADD_ADDRESS: `${API_BASE_URL}/api/profile/addresses`,
  UPDATE_ADDRESS: (addressId) => `${API_BASE_URL}/api/profile/addresses/${addressId}`,
  DELETE_ADDRESS: (addressId) => `${API_BASE_URL}/api/profile/addresses/${addressId}`,

  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact`,
  CONTACT_GET_ALL: `${API_BASE_URL}/api/contact/admin`,
  CONTACT_GET_STATS: `${API_BASE_URL}/api/contact/admin/stats`,
  CONTACT_UPDATE_STATUS: (id) => `${API_BASE_URL}/api/contact/admin/${id}/status`,
  CONTACT_DELETE: (id) => `${API_BASE_URL}/api/contact/admin/${id}`,
}

export default API_BASE_URL
