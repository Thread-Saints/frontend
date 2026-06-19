import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import { optimizeImageUrl } from '../utils/imageUrl'
import styles from './CartSummaryModal.module.css'

function CartSummaryModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { cart, updateCartItem, removeFromCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()

  // Discount states
  const [valentineActive, setValentineActive] = useState(false)
  const [hasWelcomeDiscount, setHasWelcomeDiscount] = useState(false)
  const [isTestAccount, setIsTestAccount] = useState(false)
  const [discountChecked, setDiscountChecked] = useState(false)

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
      setDiscountChecked(true)
    } catch (error) {
      console.error('Error checking discount eligibility:', error)
      setDiscountChecked(true)
    }
  }

  // Fetch discount info when modal opens
  useEffect(() => {
    if (isOpen) {
      checkValentineOffer()
      if (isAuthenticated) {
        checkDiscountEligibility()
      } else {
        setDiscountChecked(true)
      }
    }
  }, [isOpen, isAuthenticated])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const cartItems = cart?.items?.filter(item => isAuthenticated ? item.product : true) || []
  const itemsPrice = getCartTotal()

  // Count total quantity of all items (not just distinct items)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount with correct priority
  // Priority: Valentine's (20% for 2+ items) > Welcome (10% for first-timers)
  let discount = 0
  let discountType = null

  if (valentineActive && itemCount >= 2) {
    // Valentine's: 20% off for 2+ items (works for everyone)
    discount = Math.round(itemsPrice * 0.20)
    discountType = 'valentine'
  } else if (hasWelcomeDiscount && isAuthenticated) {
    // Welcome: 10% off for first-time logged-in users
    discount = Math.round(itemsPrice * 0.10)
    discountType = 'welcome'
  }

  const discountedPrice = itemsPrice - discount

  // Calculate shipping (free if > 4999, else 150 for rest of India)
  const isFreeShipping = discountedPrice > 4999
  const shippingPrice = isFreeShipping ? 0 : 150
  const amountToFreeShipping = 4999 - discountedPrice + 1

  // Calculate total
  const totalPrice = discountedPrice + shippingPrice

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    const result = await updateCartItem(itemId, newQuantity)
    if (!result.success) {
      toast.error(result.message || 'Failed to update quantity')
    }
  }

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId)
    if (result.success) {
      toast.success('Item removed from cart')
    } else {
      toast.error(result.message || 'Failed to remove item')
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Order Summary</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className={styles.itemsList}>
                {cartItems.map((item) => {
                  const product = item.product || item
                  const productName = product.name || item.name
                  const productImage = optimizeImageUrl(product.images?.[0] || product.image || item.image, 200)
                  const productPrice = item.price || product.price || product.salePrice

                  return (
                    <div key={item._id} className={styles.cartItem}>
                      <img
                        src={productImage}
                        alt={productName}
                        className={styles.itemImage}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{productName?.toUpperCase()}</h3>
                        {item.size && (
                          <p className={styles.itemAttribute}>Size: {item.size}</p>
                        )}
                        {item.color && ((item.product?.colorVariants?.length > 1) || (item.product?.colors?.length > 1)) && (
                          <p className={styles.itemAttribute}>Color: {item.color}</p>
                        )}

                        {/* Quantity Controls */}
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={styles.itemPriceSection}>
                        <p className={styles.itemPrice}>Rs.{(productPrice * item.quantity).toFixed(2)}</p>
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

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

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Items Price</span>
                  <span>Rs.{itemsPrice.toFixed(2)}</span>
                </div>

                {discount > 0 && discountType && (
                  <div className={styles.priceRow} style={{ color: discountType === 'valentine' ? '#e91e63' : '#28a745' }}>
                    <span>{discountType === 'valentine' ? "Valentine's Offer (20%)" : 'First Order Discount (10%)'}</span>
                    <span>-Rs.{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.priceRow}>
                  <span>Shipping</span>
                  <span className={isFreeShipping ? styles.freeShipping : ''}>
                    {isFreeShipping ? 'FREE' : `Rs.${shippingPrice.toFixed(2)}`}
                  </span>
                </div>

                {!isFreeShipping && amountToFreeShipping > 0 && (
                  <div className={styles.shippingNote}>
                    Add Rs.{amountToFreeShipping.toFixed(0)} more for FREE shipping
                  </div>
                )}

                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>Rs.{totalPrice.toFixed(2)}</span>
                </div>

                {isTestAccount && (
                  <div className={styles.priceRow} style={{ color: '#ff9800', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    <span>Test Admin Amount</span>
                    <span>Rs.1.00</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              PROCEED TO CHECKOUT
            </button>
            <button className={styles.continueBtn} onClick={handleContinueShopping}>
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSummaryModal
