import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from './Navbar'
import styles from './ProductDetails.module.css'
import { API_ENDPOINTS } from '../config/api'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeSection, setActiveSection] = useState('details')

  useEffect(() => {
    fetchProduct()
  }, [id])

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
            <h1 className={styles.productName}>{product.name}</h1>

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
              <button className={styles.addToCartBtn}>Add To Cart</button>
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
