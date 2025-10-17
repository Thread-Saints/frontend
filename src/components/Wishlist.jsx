import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaHeart, FaShoppingCart } from 'react-icons/fa'
import Navbar from './Navbar'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import styles from './Wishlist.module.css'

function Wishlist() {
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleRemoveItem = async (itemId) => {
    setUpdating(itemId)
    await removeFromWishlist(itemId)
    setUpdating(null)
  }

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist()
    }
  }

  const handleMoveToCart = async (item) => {
    setUpdating(item._id)
    const result = await addToCart(item.product._id, 1)
    if (result.success) {
      await removeFromWishlist(item._id)
      alert('Item moved to cart!')
    } else {
      alert(result.message || 'Failed to add item to cart')
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading wishlist...</p>
        </div>
      </>
    )
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyWishlist}>
          <FaHeart className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyText}>Save your favorite items for later!</p>
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
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlistContent}>
          <div className={styles.wishlistHeader}>
            <h1 className={styles.wishlistTitle}>My Wishlist</h1>
            <button onClick={handleClearWishlist} className={styles.clearBtn}>
              Clear Wishlist
            </button>
          </div>

          <div className={styles.wishlistGrid}>
            {wishlist.items.map((item) => (
              <div key={item._id} className={styles.wishlistItem}>
                <Link to={`/product/${item.product._id}`} className={styles.itemImageContainer}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                </Link>

                <div className={styles.itemDetails}>
                  <Link to={`/product/${item.product._id}`} className={styles.itemName}>
                    {item.name}
                  </Link>

                  <div className={styles.priceSection}>
                    {item.salePrice ? (
                      <>
                        <span className={styles.originalPrice}>Rs.{item.price}</span>
                        <span className={styles.salePrice}>Rs.{item.salePrice}</span>
                      </>
                    ) : (
                      <span className={styles.price}>Rs.{item.price}</span>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.moveToCartBtn}
                      onClick={() => handleMoveToCart(item)}
                      disabled={updating === item._id}
                    >
                      <FaShoppingCart /> Move to Cart
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={updating === item._id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Wishlist
