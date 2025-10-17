import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaShoppingBag } from 'react-icons/fa'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import styles from './Cart.module.css'

function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

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
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
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
              {cart.items.map((item) => (
                <div key={item._id} className={styles.cartItem}>
                  <Link to={`/product/${item.product._id}`} className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className={styles.itemDetails}>
                    <Link to={`/product/${item.product._id}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    {item.size && (
                      <p className={styles.itemSize}>Size: {item.size}</p>
                    )}
                    <p className={styles.itemPrice}>Rs.{item.price}</p>
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
                      Rs.{(item.price * item.quantity).toFixed(2)}
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
              ))}
            </div>

            {/* Cart Summary */}
            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>Rs.{getCartTotal().toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryRow + ' ' + styles.summaryTotal}>
                  <span>Total</span>
                  <span>Rs.{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button className={styles.checkoutBtn}>
                Proceed to Checkout
              </button>

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
