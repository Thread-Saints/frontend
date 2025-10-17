import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, token } = useAuth()

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist()
    } else {
      setWishlist(null)
    }
  }, [isAuthenticated, token])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.WISHLIST)
      if (response.data.success) {
        setWishlist(response.data.wishlist)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.WISHLIST_ADD, {
        productId
      })

      if (response.data.success) {
        setWishlist(response.data.wishlist)
        return { success: true, message: 'Item added to wishlist' }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to wishlist'
      }
    }
  }

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.WISHLIST_REMOVE(itemId))

      if (response.data.success) {
        setWishlist(response.data.wishlist)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from wishlist'
      }
    }
  }

  const clearWishlist = async () => {
    try {
      const response = await axios.delete(API_ENDPOINTS.WISHLIST_CLEAR)

      if (response.data.success) {
        setWishlist(response.data.wishlist)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear wishlist'
      }
    }
  }

  const checkIsInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false
    return wishlist.items.some(item => item.product._id === productId || item.product === productId)
  }

  const getWishlistItemCount = () => {
    if (!wishlist || !wishlist.items) return 0
    return wishlist.items.length
  }

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    fetchWishlist,
    checkIsInWishlist,
    getWishlistItemCount
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
