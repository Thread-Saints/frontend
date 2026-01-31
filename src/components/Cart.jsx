import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FaTrash, FaShoppingBag } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import styles from './Cart.module.css'

function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const [updating, setUpdating] = useState(null)

  // Discount states
  const [valentineActive, setValentineActive] = useState(false)
  const [hasWelcomeDiscount, setHasWelcomeDiscount] = useState(false)
  const [isTestAccount, setIsTestAccount] = useState(false)

  // Check Valentine's offer (public - works for everyone)
  const checkValentineOffer = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_VALENTINE)
      if (response.data.success && response.data.valentineActive) {
        setValentineActive(true)
      }
    } catch (error) {
      console.error('Error checking Valentine offer:', error)
    }
  }

  // Check discount eligibility for logged-in users
  const checkDiscountEligibility = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_DISCOUNT_ELIGIBILITY)
      if (response.data.success) {
        if (response.data.welcomeEligible) {
          setHasWelcomeDiscount(true)
        }
        if (response.data.valentineActive) {
          setValentineActive(true)
        }
        if (response.data.isTestAccount) {
          setIsTestAccount(true)
        }
      }
    } catch (error) {
      console.error('Error checking discount eligibility:', error)
    }
  }

  // Fetch discount info on mount
  useEffect(() => {
    checkValentineOffer()
    if (isAuthenticated) {
      checkDiscountEligibility()
    }
  }, [isAuthenticated])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    await updateCartItem(itemId, newQuantity)
    setUpdating(null)
  }

  const handleRemoveItem = async (itemId) => {
    setUpdating(itemId)
    await removeFromCart(itemId)
    setUpdating(null)
  }

  const handleClearCart = async () => {
    const result = await clearCart()
    if (result.success) {
      toast.success('Cart cleared')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading cart...</p>
        </div>
      </>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyCart}>
          <FaShoppingBag className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyText}>Add some items to get started!</p>
          <Link to="/" className={styles.shopNowBtn}>
            Shop Now
          </Link>
        </div>
      </>
    )
  }

  // Calculate prices and discounts
  const cartItems = cart.items.filter(item => isAuthenticated ? item.product : true)
  const itemsPrice = getCartTotal()
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount with correct priority
  let discount = 0
  let discountType = null

  if (valentineActive && itemCount >= 2) {
    discount = Math.round(itemsPrice * 0.20)
    discountType = 'valentine'
  } else if (hasWelcomeDiscount && isAuthenticated) {
    discount = Math.round(itemsPrice * 0.10)
    discountType = 'welcome'
  }

  const discountedPrice = itemsPrice - discount
  const isFreeShipping = discountedPrice > 4999
  const shippingPrice = isFreeShipping ? 0 : 150
  const amountToFreeShipping = 4999 - discountedPrice + 1
  const totalPrice = discountedPrice + shippingPrice

  return (
    <>
      <Navbar />
      <div className={styles.cartContainer}>
        <div className={styles.cartContent}>
          <div className={styles.cartHeader}>
            <h1 className={styles.cartTitle}>Shopping Cart</h1>
            <button onClick={handleClearCart} className={styles.clearBtn}>
              Clear Cart
            </button>
          </div>

          <div className={styles.cartLayout}>
            {/* Cart Items */}
            <div className={styles.cartItems}>
              {cartItems.map((item) => {
                const productId = item.product?._id || item.productId
                const productName = item.name || item.product?.name
                const productImage = item.image || item.product?.images?.[0]
                const productPrice = item.price || item.product?.price

                return (
                  <div key={item._id} className={styles.cartItem}>
                    {productId ? (
                      <Link to={`/product/${productId}`} className={styles.itemImage}>
                        <img src={productImage} alt={productName} />
                      </Link>
                    ) : (
                      <div className={styles.itemImage}>
                        <img src={productImage} alt={productName} />
                      </div>
                    )}

                    <div className={styles.itemDetails}>
                      {productId ? (
                        <Link to={`/product/${productId}`} className={styles.itemName}>
                          {productName}
                        </Link>
                      ) : (
                        <p className={styles.itemName}>{productName}</p>
                      )}
                      {item.size && (
                        <p className={styles.itemSize}>Size: {item.size}</p>
                      )}
                      {item.color && ((item.product?.colorVariants?.length > 1) || (item.product?.colors?.length > 1)) && (
                        <p className={styles.itemColor}>Color: {item.color}</p>
                      )}
                      <p className={styles.itemPrice}>Rs.{productPrice}</p>
                    </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={updating === item._id}
                      >
                        −
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={updating === item._id}
                      >
                        +
                      </button>
                    </div>

                    <p className={styles.itemTotal}>
                      Rs.{(productPrice * item.quantity).toFixed(2)}
                    </p>

                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={updating === item._id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                )
              })}
            </div>

            {/* Cart Summary */}
            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              {/* Discount Hints */}
              {valentineActive && itemCount === 1 && (
                <div className={styles.discountHint} style={{ background: 'rgba(233, 30, 99, 0.1)', borderColor: '#e91e63' }}>
                  Add 1 more item to get <strong>20% Valentine's discount!</strong>
                </div>
              )}

              {!isAuthenticated && !valentineActive && (
                <div className={styles.discountHint} style={{ background: 'rgba(40, 167, 69, 0.1)', borderColor: '#28a745' }}>
                  Login to get <strong>10% off</strong> your first order!
                </div>
              )}

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Items Price</span>
                  <span>Rs.{itemsPrice.toFixed(2)}</span>
                </div>

                {discount > 0 && discountType && (
                  <div className={styles.summaryRow} style={{ color: discountType === 'valentine' ? '#e91e63' : '#28a745' }}>
                    <span>{discountType === 'valentine' ? "Valentine's Offer (20%)" : 'First Order Discount (10%)'}</span>
                    <span>-Rs.{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span style={{ color: isFreeShipping ? '#4CAF50' : 'inherit', fontWeight: isFreeShipping ? '600' : 'normal' }}>
                    {isFreeShipping ? 'FREE' : `Rs.${shippingPrice.toFixed(2)}`}
                  </span>
                </div>

                {!isFreeShipping && amountToFreeShipping > 0 && (
                  <div className={styles.shippingNote}>
                    Add Rs.{amountToFreeShipping.toFixed(0)} more for FREE shipping
                  </div>
                )}

                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryRow + ' ' + styles.summaryTotal}>
                  <span>Total</span>
                  <span>Rs.{totalPrice.toFixed(2)}</span>
                </div>

                {isTestAccount && (
                  <div className={styles.summaryRow} style={{ color: '#ff9800', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    <span>Test Admin Amount</span>
                    <span>Rs.1.00</span>
                  </div>
                )}
              </div>

              <Link to="/checkout" className={styles.checkoutBtn}>
                Proceed to Checkout
              </Link>

              <Link to="/" className={styles.continueShoppingBtn}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart
