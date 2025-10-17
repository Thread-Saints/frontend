import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, token } = useAuth()

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, token])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.CART)
      if (response.data.success) {
        setCart(response.data.cart)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1, size = null) => {
    try {
      const response = await axios.post(API_ENDPOINTS.CART_ADD, {
        productId,
        quantity,
        size
      })

      if (response.data.success) {
        setCart(response.data.cart)
        return { success: true, message: 'Item added to cart' }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart'
      }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await axios.put(API_ENDPOINTS.CART_UPDATE(itemId), {
        quantity
      })

      if (response.data.success) {
        setCart(response.data.cart)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart item'
      }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.CART_REMOVE(itemId))

      if (response.data.success) {
        setCart(response.data.cart)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart'
      }
    }
  }

  const clearCart = async () => {
    try {
      const response = await axios.delete(API_ENDPOINTS.CART_CLEAR)

      if (response.data.success) {
        setCart(response.data.cart)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart'
      }
    }
  }

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    getCartTotal
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
