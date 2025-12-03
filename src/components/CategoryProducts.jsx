import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { API_ENDPOINTS } from '../config/api'
import styles from './CategoryProducts.module.css'

function CategoryProducts() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  useEffect(() => {
    fetchCategoryProducts()
  }, [name])

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [name])

  // Preload images for better hover performance
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(product => {
        const images = getProductImages(product)
        // Preload first 3 images for each product
        images.slice(0, 3).forEach(imageUrl => {
          if (imageUrl && imageUrl !== '/placeholder-image.png') {
            const img = new Image()
            img.src = imageUrl
          }
        })
      })
    }
  }, [products])

  const fetchCategoryProducts = async () => {
    setLoading(true)
    try {
      // Fetch all products
      const response = await fetch(API_ENDPOINTS.PRODUCTS)
      const data = await response.json()

      let allProducts = []
      if (Array.isArray(data)) {
        allProducts = data
      } else if (data.products && Array.isArray(data.products)) {
        allProducts = data.products
      } else if (data.data && Array.isArray(data.data)) {
        allProducts = data.data
      }

      // Filter products by category name (case-insensitive)
      const filteredProducts = allProducts.filter(product => {
        if (product.category && typeof product.category === 'object') {
          return product.category.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
        } else if (typeof product.category === 'string') {
          return product.category.toLowerCase() === decodeURIComponent(name).toLowerCase()
        }
        return false
      })

      // Expand products into color variants
      const expandedProducts = []
      filteredProducts.forEach(product => {
        if (product.colorVariants && product.colorVariants.length > 0) {
          // Create a separate item for each color variant
          product.colorVariants.forEach(variant => {
            expandedProducts.push({
              ...product,
              _id: `${product._id}_${variant.color}`, // Unique ID for each variant
              originalProductId: product._id, // Keep original product ID
              selectedColorVariant: variant,
              colorName: variant.color,
              colorHex: variant.colorHex || '#000000',
              variantImages: variant.images || []
            })
          })
        } else {
          // If no color variants, add the product as is
          expandedProducts.push(product)
        }
      })

      setProducts(expandedProducts)
    } catch (error) {
      console.error('Error fetching category products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Get all available images for a product/variant
  const getProductImages = (product) => {
    // If this is an expanded color variant, use its specific images
    if (product.variantImages && product.variantImages.length > 0) {
      return product.variantImages
    }

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

    return images.length > 0 ? images : ['/placeholder-image.png']
  }

  // Handle mouse enter - start cycling images
  const handleMouseEnter = (productId) => {
    setHoveredProduct(productId)
    const product = products.find(p => p._id === productId)
    const images = getProductImages(product)

    if (images.length > 1) {
      // Preload remaining images on hover for smooth cycling
      images.slice(3).forEach(imageUrl => {
        if (imageUrl && imageUrl !== '/placeholder-image.png') {
          const img = new Image()
          img.src = imageUrl
        }
      })

      setCurrentImageIndex(prev => ({ ...prev, [productId]: 1 }))

      // Cycle through remaining images
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => {
          const current = prev[productId] || 0
          const next = (current + 1) % images.length
          return { ...prev, [productId]: next }
        })
      }, 1000) // Change image every 1 second

      // Store interval ID for cleanup
      return interval
    }
  }

  // Handle mouse leave - reset to first image
  const handleMouseLeave = (productId, interval) => {
    setHoveredProduct(null)
    setCurrentImageIndex(prev => ({ ...prev, [productId]: 0 }))
    if (interval) clearInterval(interval)
  }

  return (
    <>
      <Navbar />
      <div className={styles.categoryProductsContainer}>
        <div className={styles.content}>
          {/* Category title */}
          <h1 className={styles.categoryTitle}>{decodeURIComponent(name).toUpperCase()}</h1>

          {/* Products grid */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <p className={styles.loadingText}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.comingSoonContent}>
                <h2 className={styles.comingSoonTitle}>NEW PRODUCTS COMING SOON</h2>
                <p className={styles.comingSoonText}>
                  We're working on bringing you amazing new {decodeURIComponent(name).toLowerCase()} products.
                  Check back soon!
                </p>
                <button
                  className={styles.backButton}
                  onClick={() => navigate('/categories')}
                >
                  BROWSE ALL CATEGORIES
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((product) => {
                const images = getProductImages(product)
                const currentIndex = currentImageIndex[product._id] || 0
                const currentImage = images[currentIndex]

                return (
                  <div
                    key={product._id}
                    className={styles.productCard}
                    onClick={() => {
                      const productId = product.originalProductId || product._id
                      if (product.colorName) {
                        navigate(`/product/${productId}?color=${encodeURIComponent(product.colorName)}`)
                      } else {
                        navigate(`/product/${productId}`)
                      }
                    }}
                    onMouseEnter={(e) => {
                      const interval = handleMouseEnter(product._id)
                      e.currentTarget.dataset.intervalId = interval
                    }}
                    onMouseLeave={(e) => {
                      const interval = e.currentTarget.dataset.intervalId
                      handleMouseLeave(product._id, interval)
                    }}
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
                      {product.colorName && (
                        <p className={styles.colorName}>{product.colorName}</p>
                      )}
                      <p className={styles.productPrice}>
                        {product.salePrice ? (
                          <>
                            <span className={styles.originalPrice}>Rs.{product.price}</span>
                            <span className={styles.salePrice}>Rs.{product.salePrice}</span>
                          </>
                        ) : (
                          <span>Rs.{product.price}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CategoryProducts
