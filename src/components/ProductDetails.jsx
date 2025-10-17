import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import Navbar from './Navbar'
import styles from './ProductDetails.module.css'
import { API_ENDPOINTS } from '../config/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeSection, setActiveSection] = useState('details')
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, checkIsInWishlist, wishlist } = useWishlist()
  const { isAuthenticated } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (wishlist && id) {
      setIsInWishlist(checkIsInWishlist(id))
    }
  }, [wishlist, id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id))
      const data = await response.json()

      if (data.success && data.product) {
        setProduct(data.product)
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0])
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ))
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size')
      return
    }

    setAddingToCart(true)
    const result = await addToCart(id, quantity, selectedSize)
    setAddingToCart(false)

    if (result.success) {
      alert('Item added to cart!')
    } else {
      alert(result.message || 'Failed to add item to cart')
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist')
      return
    }

    setAddingToWishlist(true)

    if (isInWishlist) {
      // Find the wishlist item ID
      const wishlistItem = wishlist.items.find(
        item => item.product._id === id || item.product === id
      )
      if (wishlistItem) {
        const result = await removeFromWishlist(wishlistItem._id)
        if (result.success) {
          setIsInWishlist(false)
        }
      }
    } else {
      const result = await addToWishlist(id)
      if (result.success) {
        setIsInWishlist(true)
        alert('Item added to wishlist!')
      } else {
        alert(result.message || 'Failed to add item to wishlist')
      }
    }

    setAddingToWishlist(false)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading product...</p>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Product not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.productDetailsContainer}>
        <div className={styles.productContent}>
          {/* Product Images */}
          <div className={styles.productImages}>
            <div className={styles.mainImage}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${selectedImage === index ? styles.activeThumbnail : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>{product.name}</h1>
              <button
                className={styles.wishlistBtn}
                onClick={handleToggleWishlist}
                disabled={addingToWishlist}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
              </button>
            </div>

            <div className={styles.priceSection}>
              {product.salePrice ? (
                <>
                  <span className={styles.originalPrice}>Rs.{product.price}</span>
                  <span className={styles.salePrice}>Rs.{product.salePrice}</span>
                  <span className={styles.saleBadge}>Sale</span>
                </>
              ) : (
                <span className={styles.price}>Rs.{product.price}</span>
              )}
            </div>

            <div className={styles.reviews}>
              <div className={styles.stars}>
                {renderStars(Math.round(product.rating || 0))}
              </div>
              <span className={styles.reviewCount}>{product.reviewCount || 0} Reviews</span>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.sizesSection}>
                <div className={styles.sizeOptions}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSizeBtn : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.quantitySection}>
              <label className={styles.label}>Quantity</label>
              <div className={styles.quantitySelector}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add To Cart'}
              </button>
              <button className={styles.buyNowBtn}>Buy Now</button>
            </div>

            {/* Description */}
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            {/* Expandable Sections */}
            <div className={styles.infoSections}>
              <div className={styles.infoSection}>
                <button
                  className={styles.infoHeader}
                  onClick={() => setActiveSection(activeSection === 'details' ? '' : 'details')}
                >
                  Product Details
                  <span className={styles.arrow}>{activeSection === 'details' ? '−' : '+'}</span>
                </button>
                {activeSection === 'details' && (
                  <div className={styles.infoContent}>
                    {product.productDetails || 'No additional details available.'}
                  </div>
                )}
              </div>

              <div className={styles.infoSection}>
                <button
                  className={styles.infoHeader}
                  onClick={() => setActiveSection(activeSection === 'washing' ? '' : 'washing')}
                >
                  Washing Instructions
                  <span className={styles.arrow}>{activeSection === 'washing' ? '−' : '+'}</span>
                </button>
                {activeSection === 'washing' && (
                  <div className={styles.infoContent}>
                    {product.washingInstructions || 'Standard washing instructions apply.'}
                  </div>
                )}
              </div>

              <div className={styles.infoSection}>
                <button
                  className={styles.infoHeader}
                  onClick={() => setActiveSection(activeSection === 'returns' ? '' : 'returns')}
                >
                  Returns & Refunds
                  <span className={styles.arrow}>{activeSection === 'returns' ? '−' : '+'}</span>
                </button>
                {activeSection === 'returns' && (
                  <div className={styles.infoContent}>
                    {product.returnsPolicy || 'Standard return policy applies.'}
                  </div>
                )}
              </div>

              <div className={styles.infoSection}>
                <button
                  className={styles.infoHeader}
                  onClick={() => setActiveSection(activeSection === 'shipping' ? '' : 'shipping')}
                >
                  Shipping & Delivery
                  <span className={styles.arrow}>{activeSection === 'shipping' ? '−' : '+'}</span>
                </button>
                {activeSection === 'shipping' && (
                  <div className={styles.infoContent}>
                    {product.shippingInfo || 'Standard shipping: 5-7 business days.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetails
