import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaHeart, FaShoppingCart } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { optimizeImageUrl } from '../utils/imageUrl'
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
    const result = await clearWishlist()
    if (result.success) {
      toast.success('Wishlist cleared')
    }
  }

  const handleMoveToCart = async (item) => {
    if (!item.product) {
      toast.error('This product is no longer available')
      return
    }
    setUpdating(item._id)

    // Prepare product data for cart
    const productData = {
      _id: item.product._id,
      name: item.name || item.product.name,
      price: item.salePrice || item.price || item.product.price,
      images: item.product.images || [item.image],
      image: item.image || item.product.images?.[0]
    }

    const result = await addToCart(item.product._id, 1, null, null, productData)
    if (result.success) {
      await removeFromWishlist(item._id)
      toast.success('Item moved to cart!')
    } else {
      toast.error(result.message || 'Failed to add item to cart')
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
            {wishlist.items.filter(item => item.product).map((item) => (
              <div key={item._id} className={styles.wishlistItem}>
                <Link to={`/product/${item.product._id}`} className={styles.itemImageContainer}>
                  <img
                    src={optimizeImageUrl(item.image, 300)}
                    alt={item.name}
                    className={styles.itemImage}
                    loading="lazy"
                    decoding="async"
                  />
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
