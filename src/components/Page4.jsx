import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Page4.module.css'
import { API_ENDPOINTS } from '../config/api'

// Color name to hex code mapping
const getColorHexFromName = (colorName) => {
  const colorMap = {
    // Basic colors
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#8B4513',
    'grey': '#808080',
    'gray': '#808080',
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',

    // Extended colors
    'navy': '#000080',
    'navy blue': '#000080',
    'royal blue': '#4169E1',
    'sky blue': '#87CEEB',
    'light blue': '#ADD8E6',
    'dark blue': '#00008B',
    'maroon': '#800000',
    'burgundy': '#800020',
    'wine': '#722F37',
    'crimson': '#DC143C',
    'olive': '#808000',
    'khaki': '#C3B091',
    'tan': '#D2B48C',
    'mustard': '#FFDB58',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'charcoal': '#36454F',
    'slate': '#708090',
    'lavender': '#E6E6FA',
    'violet': '#EE82EE',
    'magenta': '#FF00FF',
    'cyan': '#00FFFF',
    'teal': '#008080',
    'turquoise': '#40E0D0',
    'mint': '#98FF98',
    'lime': '#00FF00',
    'forest green': '#228B22',
    'olive green': '#556B2F',
    'sage': '#9DC183',
    'peach': '#FFE5B4',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'rust': '#B7410E',
    'copper': '#B87333',
    'camel': '#C19A6B',
    'sand': '#C2B280',
    'ivory': '#FFFFF0',
    'off white': '#FAF9F6',
    'off-white': '#FAF9F6',

    // Fashion-specific colors
    'ash': '#B2BEB5',
    'ash grey': '#B2BEB5',
    'charcoal grey': '#36454F',
    'stone': '#928E85',
    'taupe': '#483C32',
    'nude': '#E3BC9A',
    'blush': '#DE5D83',
    'rose': '#FF007F',
    'dusty pink': '#DCAE96',
    'hot pink': '#FF69B4',
    'neon pink': '#FF10F0',
    'pastel pink': '#FFD1DC',
    'electric blue': '#7DF9FF',
    'cobalt': '#0047AB',
    'indigo': '#4B0082',
    'mauve': '#E0B0FF',
    'plum': '#8E4585',
    'emerald': '#50C878',
    'jade': '#00A86B',
    'army green': '#4B5320',
    'moss': '#8A9A5B',
    'seafoam': '#93E9BE',
    'aqua': '#00FFFF',
    'chocolate': '#7B3F00',
    'mocha': '#3B2719',
    'coffee': '#6F4E37',
    'espresso': '#3C312A',
    'caramel': '#FFD59A',
    'cognac': '#9A463D',
    'mahogany': '#C04000',

    // Thread Saints specific fashion colors
    'acid pink': '#FF10F0',
    'acid grey': '#D3D3D3',
    'acid gray': '#D3D3D3',
    'acid blue': '#7DF9FF',
    'graphite grey': '#3E3E3E',
    'graphite gray': '#3E3E3E',
    'cloudy grey': '#B8B8B8',
    'cloudy gray': '#B8B8B8',
    'cloud grey': '#C0C0C0',
    'cloud gray': '#C0C0C0',
    'ash cloud wash': '#E0E0E0',
    'washed grey': '#A9A9A9',
    'washed gray': '#A9A9A9',
    'washed black': '#3A3A3A',
    'washed blue': '#6495ED',
    'dirty white': '#E8E8E8',
    'acid washed black': '#4A4A4A',
    'charcoal wash': '#464646',
    'waste land olive': '#6B7346',
    'wasteland olive': '#6B7346',
  }

  // Normalize color name (lowercase, trim)
  const normalized = colorName.toLowerCase().trim()

  // Return mapped color or default to a medium grey
  return colorMap[normalized] || '#666666'
}

function Page4() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const [selectedColors, setSelectedColors] = useState({})

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

  // Get images for specific color or all images
  const getProductImages = (product, selectedColor = null) => {
    const images = []

    // If a color is selected, get only that color's images
    if (selectedColor && product.colorVariants && product.colorVariants.length > 0) {
      const selectedVariant = product.colorVariants.find(v => v.color === selectedColor)
      if (selectedVariant && selectedVariant.images) {
        images.push(...selectedVariant.images.slice(0, 2))
      }
    } else {
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
    }

    // Return only first 2 images for performance optimization
    const firstTwoImages = images.slice(0, 2)
    return firstTwoImages.length > 0 ? firstTwoImages : ['/placeholder-image.png']
  }

  // Get available colors for a product
  const getAvailableColors = (product) => {
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants.map(variant => ({
        color: variant.color,
        // Use database colorHex if available, otherwise map from color name
        colorHex: variant.colorHex || getColorHexFromName(variant.color)
      }))
    }
    return []
  }

  // Handle color selection
  const handleColorSelect = (e, productId, color) => {
    e.stopPropagation() // Prevent navigation when clicking color dot
    setSelectedColors(prev => ({ ...prev, [productId]: color }))
    setCurrentImageIndex(prev => ({ ...prev, [productId]: 0 }))
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
              const selectedColor = selectedColors[product._id]
              const images = getProductImages(product, selectedColor)
              const currentIndex = currentImageIndex[product._id] || 0
              const currentImage = images[currentIndex]
              const availableColors = getAvailableColors(product)

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
                    {availableColors.length > 0 && (
                      <div className={styles.colorSelector}>
                        {availableColors.map((colorInfo) => (
                          <div
                            key={colorInfo.color}
                            className={`${styles.colorDot} ${selectedColor === colorInfo.color ? styles.colorDotActive : ''}`}
                            style={{ backgroundColor: colorInfo.colorHex }}
                            onClick={(e) => handleColorSelect(e, product._id, colorInfo.color)}
                            title={colorInfo.color}
                          />
                        ))}
                      </div>
                    )}
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
