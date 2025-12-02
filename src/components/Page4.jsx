import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Page4.module.css'
import { API_ENDPOINTS } from '../config/api'

function Page4() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  // Preload all product images for smooth hover effect
  useEffect(() => {
    if (products.length > 0) {
      preloadImages()
    }
  }, [products])

  const preloadImages = () => {
    let loadedCount = 0
    let totalImages = 0

    // Count total images first
    products.forEach(product => {
      const images = getProductImages(product)
      totalImages += images.filter(img => img && img !== '/placeholder-image.png').length
    })

    console.log(`🖼️ Preloading ${totalImages} product images...`)

    // Preload each image
    products.forEach(product => {
      const images = getProductImages(product)
      images.forEach(imageUrl => {
        if (imageUrl && imageUrl !== '/placeholder-image.png') {
          const img = new Image()
          img.onload = () => {
            loadedCount++
            if (loadedCount === totalImages) {
              console.log('✅ All product images preloaded successfully!')
            }
          }
          img.onerror = () => {
            console.warn(`⚠️ Failed to preload image: ${imageUrl}`)
            loadedCount++
          }
          img.src = imageUrl
        }
      })
    })
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS)
      const data = await response.json()

      // Handle different response structures
      if (Array.isArray(data)) {
        setProducts(data)
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products)
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data)
      } else {
        console.error('Unexpected response structure:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Get only first 2 images for a product (optimized for hover)
  const getProductImages = (product) => {
    const images = []

    // Get images from colorVariants (new structure)
    if (product.colorVariants && product.colorVariants.length > 0) {
      product.colorVariants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          images.push(...variant.images)
        }
      })
    }

    // Fallback to legacy images array
    if (images.length === 0 && product.images && product.images.length > 0) {
      images.push(...product.images)
    }

    // Return only first 2 images for performance optimization
    const firstTwoImages = images.slice(0, 2)
    return firstTwoImages.length > 0 ? firstTwoImages : ['/placeholder-image.png']
  }

  // Handle mouse enter - show second image
  const handleMouseEnter = (productId) => {
    setHoveredProduct(productId)
    const product = products.find(p => p._id === productId)
    const images = getProductImages(product)

    // Only switch to second image if it exists
    if (images.length > 1) {
      setCurrentImageIndex(prev => ({ ...prev, [productId]: 1 }))
    }
  }

  // Handle mouse leave - reset to first image
  const handleMouseLeave = (productId) => {
    setHoveredProduct(null)
    setCurrentImageIndex(prev => ({ ...prev, [productId]: 0 }))
  }

  return (
    <div className={styles.page4Container}>
      <div className={styles.content}>
        {loading ? (
          <p className={styles.loadingText}>Loading products...</p>
        ) : products.length === 0 ? (
          <p className={styles.loadingText}>No products available</p>
        ) : (
          <div className={styles.productsGrid}>
            {Array.isArray(products) && products.map((product) => {
              const images = getProductImages(product)
              const currentIndex = currentImageIndex[product._id] || 0
              const currentImage = images[currentIndex]

              return (
                <div
                  key={product._id}
                  className={styles.productCard}
                  onClick={() => navigate(`/product/${product._id}`)}
                  onMouseEnter={() => handleMouseEnter(product._id)}
                  onMouseLeave={() => handleMouseLeave(product._id)}
                >
                  <div className={styles.productImageContainer}>
                    {currentImage && currentImage !== '/placeholder-image.png' ? (
                      <img
                        src={currentImage}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <span className={styles.noImageText}>No Image</span>
                      </div>
                    )}
                  </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>
                    {product.salePrice ? (
                      <>
                        <span className={styles.originalPrice}>₹{product.price}</span>
                        <span className={styles.salePrice}>₹{product.salePrice}</span>
                      </>
                    ) : (
                      <span>₹{product.price}</span>
                    )}
                  </p>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Promotional Section - Saints in Your Area */}
        {!loading && products.length > 0 && (
          <div className={styles.saintsSection}>
            <div className={styles.saintsContent}>
              <div className={styles.dollLeft}>
                <img
                  src="/dolls/pink doll standing.png"
                  alt="Pink Doll"
                  className={styles.dollImage}
                />
              </div>

              <div className={styles.saintsText}>
                <h2 className={styles.saintsTitle}>SAINTS IN YOUR AREA</h2>
                <p className={styles.saintsDescription}>
                  ThreadSaints is a premium Indian streetwear label fusing western luxury with Indian edge — crafting bold, trend-forward fits that let youth own the streets with confidence.
                </p>
              </div>

              <div className={styles.dollRight}>
                <img
                  src="/dolls/black doll standing.png"
                  alt="Black Doll"
                  className={styles.dollImage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page4
