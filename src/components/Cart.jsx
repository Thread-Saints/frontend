import { useState } from 'react'
import { FaTrash, FaShoppingBag } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import styles from './Cart.module.css'

function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const [updating, setUpdating] = useState(null)

  // Removed authentication redirect - cart now works for guest users too

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
              {cart.items.filter(item => isAuthenticated ? item.product : true).map((item) => {
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
