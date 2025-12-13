import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import styles from './CartSummaryModal.module.css'

function CartSummaryModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { cart, updateCartItem, removeFromCart, getCartItemCount, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()

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

  // Calculate discount (10% if order > 20000, otherwise 0)
  const hasFirstOrderDiscount = itemsPrice >= 20000
  const discountPercentage = hasFirstOrderDiscount ? 10 : 0
  const discount = (itemsPrice * discountPercentage) / 100

  // Calculate shipping (free if > 4999, else region-based)
  const isFreeShipping = itemsPrice >= 4999
  const shippingPrice = isFreeShipping ? 0 : 150 // Default to "Rest of India" for cart
  const freeShippingThreshold = 4999
  const amountToFreeShipping = freeShippingThreshold - itemsPrice

  // Calculate total
  const totalPrice = itemsPrice - discount + shippingPrice

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
                  const productImage = product.images?.[0] || product.image || item.image
                  const productPrice = item.price || product.price || product.salePrice

                  return (
                    <div key={item._id} className={styles.cartItem}>
                      <img
                        src={productImage}
                        alt={productName}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{productName?.toUpperCase()}</h3>
                        {item.size && (
                          <p className={styles.itemAttribute}>Size: {item.size}</p>
                        )}
                        {item.color && (
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

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Items Price</span>
                  <span>Rs.{itemsPrice.toFixed(2)}</span>
                </div>

                {hasFirstOrderDiscount && (
                  <div className={`${styles.priceRow} ${styles.discount}`}>
                    <span>First Order Discount (10%)</span>
                    <span>-Rs.{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.priceRow}>
                  <span>Shipping {!isFreeShipping && '(Rest of India)'}</span>
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
