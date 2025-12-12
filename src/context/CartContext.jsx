import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()
const GUEST_CART_KEY = 'guest_cart'

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper functions for localStorage cart
const getGuestCart = () => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY)
    return cartData ? JSON.parse(cartData) : { items: [] }
  } catch (error) {
    console.error('Error reading guest cart:', error)
    return { items: [] }
  }
}

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart:', error)
  }
}

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch (error) {
    console.error('Error clearing guest cart:', error)
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, token } = useAuth()

  // Initialize cart on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Load guest cart from localStorage
      const guestCart = getGuestCart()
      setCart(guestCart)
    }
  }, [])

  // Fetch cart when user is authenticated and sync guest cart
  useEffect(() => {
    if (isAuthenticated && token) {
      syncAndFetchCart()
    } else if (!isAuthenticated) {
      // Load guest cart from localStorage
      const guestCart = getGuestCart()
      setCart(guestCart)
    }
  }, [isAuthenticated, token])

  const syncAndFetchCart = async () => {
    try {
      setLoading(true)
      const guestCart = getGuestCart()

      // If guest cart has items, sync them to the server
      if (guestCart.items && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          try {
            await axios.post(API_ENDPOINTS.CART_ADD, {
              productId: item.productId || item.product?._id,
              quantity: item.quantity,
              size: item.size,
              color: item.color
            })
          } catch (error) {
            console.error('Error syncing cart item:', error)
          }
        }
        // Clear guest cart after syncing
        clearGuestCart()
      }

      // Fetch updated cart from server
      await fetchCart()
    } catch (error) {
      console.error('Error syncing cart:', error)
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

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

  const addToCart = async (productId, quantity = 1, size = null, color = null, productData = null) => {
    // For guest users, use localStorage
    if (!isAuthenticated) {
      try {
        const guestCart = getGuestCart()

        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex(
          item =>
            (item.productId === productId || item.product?._id === productId) &&
            item.size === size &&
            item.color === color
        )

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          guestCart.items[existingItemIndex].quantity += quantity
        } else {
          // Add new item
          const newItem = {
            _id: Date.now().toString(), // temporary ID for guest cart
            productId,
            quantity,
            size,
            color,
            ...(productData && {
              product: productData,
              name: productData.name,
              price: productData.price,
              image: productData.images?.[0] || productData.image
            })
          }
          guestCart.items.push(newItem)
        }

        saveGuestCart(guestCart)
        setCart(guestCart)
        return { success: true, message: 'Item added to cart' }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to add item to cart'
        }
      }
    }

    // For authenticated users, use API
    try {
      const response = await axios.post(API_ENDPOINTS.CART_ADD, {
        productId,
        quantity,
        size,
        color
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
    // For guest users, use localStorage
    if (!isAuthenticated) {
      try {
        const guestCart = getGuestCart()
        const itemIndex = guestCart.items.findIndex(item => item._id === itemId)

        if (itemIndex > -1) {
          if (quantity <= 0) {
            guestCart.items.splice(itemIndex, 1)
          } else {
            guestCart.items[itemIndex].quantity = quantity
          }
          saveGuestCart(guestCart)
          setCart(guestCart)
          return { success: true }
        }
        return { success: false, message: 'Item not found' }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update cart item'
        }
      }
    }

    // For authenticated users, use API
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
    // For guest users, use localStorage
    if (!isAuthenticated) {
      try {
        const guestCart = getGuestCart()
        guestCart.items = guestCart.items.filter(item => item._id !== itemId)
        saveGuestCart(guestCart)
        setCart(guestCart)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to remove item from cart'
        }
      }
    }

    // For authenticated users, use API
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
    // For guest users, use localStorage
    if (!isAuthenticated) {
      try {
        const emptyCart = { items: [] }
        saveGuestCart(emptyCart)
        setCart(emptyCart)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to clear cart'
        }
      }
    }

    // For authenticated users, use API
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
    // For guest users, count all items. For logged-in users, filter for items with product
    if (!isAuthenticated) {
      return cart.items.reduce((total, item) => total + item.quantity, 0)
    }
    return cart.items.filter(item => item.product).reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0
    // For guest users, calculate total from all items. For logged-in users, filter for items with product
    if (!isAuthenticated) {
      return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
    return cart.items.filter(item => item.product).reduce((total, item) => total + (item.price * item.quantity), 0)
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
