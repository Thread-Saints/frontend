import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import CartSummaryModal from './CartSummaryModal'
import styles from './ProductDetails.module.css'
import { API_ENDPOINTS } from '../config/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeSection, setActiveSection] = useState('details')
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, checkIsInWishlist, wishlist } = useWishlist()
  const { isAuthenticated } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loadedThumbnails, setLoadedThumbnails] = useState(new Set())

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (wishlist && id) {
      setIsInWishlist(checkIsInWishlist(id))
    }
  }, [wishlist, id])

  // Scroll to top when component mounts or product changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Preload images for current color variant
  useEffect(() => {
    if (product && selectedColor) {
      preloadCurrentColorImages()
    }
  }, [product, selectedColor])

  // Setup Intersection Observer for lazy loading thumbnails
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index)
            setLoadedThumbnails(prev => new Set([...prev, index]))
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )

    // Observe all thumbnail containers
    const thumbnails = document.querySelectorAll('[data-thumbnail]')
    thumbnails.forEach(thumb => observer.observe(thumb))

    return () => observer.disconnect()
  }, [product, selectedColor])

  const preloadCurrentColorImages = () => {
    const images = getCurrentImages()
    if (images.length === 0) return

    console.log(`🖼️ Preloading ${images.length} images for selected color...`)

    let loadedCount = 0
    images.forEach((imageUrl, index) => {
      const img = new Image()
      img.onload = () => {
        loadedCount++
        if (loadedCount === images.length) {
          console.log('✅ All images preloaded for current color!')
        }
      }
      img.onerror = () => {
        console.warn(`⚠️ Failed to preload image: ${imageUrl}`)
        loadedCount++
      }
      img.src = imageUrl
    })
  }

  // Preload images for a specific color on hover
  const preloadColorImages = (color) => {
    if (!product) return

    let images = []

    // Get images for the hovered color
    if (product.colorVariants && product.colorVariants.length > 0) {
      const variant = product.colorVariants.find(v => v.color === color)
      images = variant ? variant.images : []
    } else {
      images = product.images || []
    }

    // Preload images
    images.forEach(imageUrl => {
      const img = new Image()
      img.src = imageUrl
    })
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id))
      const data = await response.json()

      if (data.success && data.product) {
        setProduct(data.product)
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0])
        }

        // Check if color is specified in URL query parameter
        const colorFromUrl = searchParams.get('color')

        // Handle color selection based on colorVariants or legacy colors
        if (data.product.colorVariants && data.product.colorVariants.length > 0) {
          // If color is specified in URL and exists, use it
          if (colorFromUrl) {
            const matchingVariant = data.product.colorVariants.find(
              v => v.color.toLowerCase() === colorFromUrl.toLowerCase()
            )
            if (matchingVariant) {
              setSelectedColor(matchingVariant.color)
            } else {
              // Fallback to first color if URL color not found
              setSelectedColor(data.product.colorVariants[0].color)
            }
          } else {
            // Use first color variant if no URL parameter
            setSelectedColor(data.product.colorVariants[0].color)
          }
        } else if (data.product.colors && data.product.colors.length > 0) {
          // Fallback to legacy colors
          if (colorFromUrl && data.product.colors.includes(colorFromUrl)) {
            setSelectedColor(colorFromUrl)
          } else {
            setSelectedColor(data.product.colors[0])
          }
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

  // Get images based on selected color (for color variants) or all images (legacy)
  const getCurrentImages = () => {
    if (!product) return []

    // If product has color variants, get images for selected color
    if (product.colorVariants && product.colorVariants.length > 0) {
      const selectedVariant = product.colorVariants.find(v => v.color === selectedColor)
      return selectedVariant ? selectedVariant.images : product.colorVariants[0].images
    }

    // Fallback to legacy images
    return product.images || []
  }

  // Get available colors (from color variants or legacy colors)
  const getAvailableColors = () => {
    if (!product) return []

    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants.map(v => v.color)
    }

    return product.colors || []
  }

  // Get stock for selected color + size combination
  const getSelectedStock = () => {
    if (!product) return 0

    if (product.colorVariants && product.colorVariants.length > 0 && selectedColor) {
      const variant = product.colorVariants.find(v => v.color === selectedColor)
      if (!variant) return 0

      // If product has sizes and sizeStock, get stock for specific size
      if (selectedSize && variant.sizeStock && variant.sizeStock.length > 0) {
        const sizeStockItem = variant.sizeStock.find(s => s.size === selectedSize)
        return sizeStockItem ? sizeStockItem.stock : 0
      }

      // If no size selected, sum all size stocks for this color
      if (variant.sizeStock && variant.sizeStock.length > 0) {
        return variant.sizeStock.reduce((sum, s) => sum + s.stock, 0)
      }

      return 0
    }

    return product.stock
  }

  // Get stock for a specific size (for showing out of stock sizes)
  const getSizeStock = (size) => {
    if (!product || !selectedColor) return 0

    if (product.colorVariants && product.colorVariants.length > 0) {
      const variant = product.colorVariants.find(v => v.color === selectedColor)
      if (variant && variant.sizeStock) {
        const sizeStockItem = variant.sizeStock.find(s => s.size === size)
        return sizeStockItem ? sizeStockItem.stock : 0
      }
    }

    return product.stock
  }

  const handleAddToCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size')
      return
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.warning('Please select a color')
      return
    }

    // Check stock availability
    const availableStock = getSelectedStock()
    if (availableStock === 0) {
      toast.error('This item is out of stock')
      return
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    setAddingToCart(true)

    // Prepare product data for guest cart
    const productData = {
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      images: getCurrentImages(),
      image: getCurrentImages()[0]
    }

    const result = await addToCart(id, quantity, selectedSize, selectedColor, productData)
    setAddingToCart(false)

    if (result.success) {
      toast.success('Item added to cart!')
      setShowCartModal(true) // Open cart modal after successful add
    } else {
      toast.error(result.message || 'Failed to add item to cart')
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      return
    }

    setAddingToWishlist(true)

    if (isInWishlist) {
      // Find the wishlist item ID
      const wishlistItem = wishlist.items.find(
        item => item.product && (item.product._id === id || item.product === id)
      )
      if (wishlistItem) {
        const result = await removeFromWishlist(wishlistItem._id)
        if (result.success) {
          setIsInWishlist(false)
          toast.success('Removed from wishlist')
        }
      }
    } else {
      const result = await addToWishlist(id)
      if (result.success) {
        setIsInWishlist(true)
        toast.success('Item added to wishlist!')
      } else {
        toast.error(result.message || 'Failed to add item to wishlist')
      }
    }

    setAddingToWishlist(false)
  }

  const handleBuyNow = async () => {
    // No login required for Buy Now - supports guest checkout!

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size')
      return
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.warning('Please select a color')
      return
    }

    // Check stock availability
    const availableStock = getSelectedStock()
    if (availableStock === 0) {
      toast.error('This item is out of stock')
      return
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    // Add to cart first
    const productData = {
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      images: getCurrentImages(),
      image: getCurrentImages()[0]
    }

    const result = await addToCart(id, quantity, selectedSize, selectedColor, productData)

    if (result.success) {
      // Open cart modal instead of navigating directly to checkout
      setShowCartModal(true)
    } else {
      toast.error(result.message || 'Failed to add item to cart')
    }
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
            <div className={styles.mainImage} onClick={() => setShowImageZoom(true)}>
              {getCurrentImages().length > 0 ? (
                <img
                  key={`${selectedColor}-${selectedImage}`}
                  src={getCurrentImages()[selectedImage]}
                  alt={product.name}
                  className={styles.image}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>
            {getCurrentImages().length > 1 && (
              <div className={styles.thumbnails}>
                {getCurrentImages().map((img, index) => (
                  <div
                    key={index}
                    data-thumbnail
                    data-index={index}
                    className={`${styles.thumbnail} ${selectedImage === index ? styles.activeThumbnail : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    {(loadedThumbnails.has(index) || index < 3) ? (
                      <img src={img} alt={`${product.name} ${index + 1}`} />
                    ) : (
                      <div className={styles.thumbnailPlaceholder}></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>{product.name.toUpperCase()}</h1>
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

            {/* Colors - Only show if more than 1 color available */}
            {getAvailableColors().length > 1 && (
              <div className={styles.colorsSection}>
                <label className={styles.label}>Colors Available</label>
                <div className={styles.colorOptions}>
                  {getAvailableColors().map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorBtn} ${selectedColor === color ? styles.activeColorBtn : ''}`}
                      onMouseEnter={() => preloadColorImages(color)}
                      onClick={() => {
                        setSelectedColor(color)
                        setSelectedImage(0) // Reset to first image when color changes
                        setQuantity(1) // Reset quantity when color changes
                      }}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.sizesSection}>
                <div className={styles.sizeHeader}>
                  <label className={styles.label}>Size</label>
                  {/* Hide size chart button for jackets, jeans, and sweatshirts */}
                  {product.category &&
                   !['jackets', 'jeans', 'sweatshirts'].includes(product.category.toLowerCase()) && (
                    <button
                      className={styles.sizeChartBtn}
                      onClick={() => setShowSizeChart(true)}
                    >
                      Size Chart (Cm)
                    </button>
                  )}
                </div>
                <div className={styles.sizeOptions}>
                  {product.sizes.map((size) => {
                    const sizeStock = getSizeStock(size)
                    return (
                      <button
                        key={size}
                        className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSizeBtn : ''} ${sizeStock === 0 ? styles.outOfStockSize : ''}`}
                        onClick={() => {
                          setSelectedSize(size)
                          setQuantity(1) // Reset quantity when size changes
                        }}
                        disabled={sizeStock === 0}
                        title={sizeStock === 0 ? 'Out of stock' : `${sizeStock} in stock`}
                      >
                        {size}
                      </button>
                    )
                  })}
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
                  onClick={() => setQuantity(Math.min(getSelectedStock(), quantity + 1))}
                  disabled={getSelectedStock() === 0}
                >
                  +
                </button>
              </div>
              {getSelectedStock() > 0 && getSelectedStock() <= 5 && (
                <span className={styles.lowStock}>Only {getSelectedStock()} left!</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={addingToCart || getSelectedStock() === 0}
              >
                {addingToCart ? 'Adding...' : getSelectedStock() === 0 ? 'Out of Stock' : 'Add To Cart'}
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={getSelectedStock() === 0}
              >
                {getSelectedStock() === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
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
                    {product.description && (
                      <div style={{ marginBottom: product.productDetails ? '1rem' : '0' }}>
                        {product.description}
                      </div>
                    )}
                    {product.productDetails && (
                      <div>
                        {product.productDetails}
                      </div>
                    )}
                    {!product.description && !product.productDetails && 'No additional details available.'}
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
                    <p style={{ marginBottom: '1rem' }}>
                      To maintain the quality, color, and print of your Thread Saints tees, please follow these care guidelines:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                      <li>Hand wash only for best durability</li>
                      <li>Machine wash - use mesh laundry bag</li>
                      <li>Always wash inside out to protect the print</li>
                      <li>Hand wash - do not twist or wring</li>
                      <li>Hang dry naturally</li>
                      <li>Do not dry clean</li>
                      <li>Do not iron the print directly – iron inside out if needed</li>
                      <li>Avoid steam dryers and bleach</li>
                      <li>Do not use hot water</li>
                    </ul>
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
                    <p style={{ marginBottom: '1rem' }}>
                      At Thread Saints, we want every piece you wear to feel perfect. If something isn't right, we offer a simple and hassle-free exchange process.
                    </p>

                    <h4 style={{ color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                      Damaged or Defective Products
                    </h4>
                    <p style={{ marginBottom: '1rem' }}>
                      Returns/exchanges are accepted only if the product is damaged or defective upon delivery.
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <li>Notify us within 48 hours of delivery with photo proof of damage or defect</li>
                      <li>Items must be unused and in original packaging</li>
                      <li>Once we verify the defective or damaged product, we will re-deliver either exchange or replace the product within 7-14 days</li>
                    </ul>

                    <h4 style={{ color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                      Exchange Available Within 7 Days of Delivery
                    </h4>
                    <p style={{ marginBottom: '1rem' }}>
                      You can request an exchange within 7 days of receiving your order.
                    </p>

                    <p style={{ marginBottom: '0.5rem' }}>To be eligible for an exchange, please ensure:</p>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <li>The product is unworn and unwashed</li>
                      <li>All original tags and packaging are intact</li>
                      <li>The request is raised within the 7-day window</li>
                    </ul>

                    <h4 style={{ color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                      Important: Exchange Is Only for the Same Size
                    </h4>
                    <p style={{ marginBottom: '0.5rem' }}>
                      We allow exchange only for the same size of the same product.<br />
                      (Example: M → M, not M → L or S)
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                      This is done to maintain exclusivity and preserve limited-drop inventory.
                    </p>

                    <h4 style={{ color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                      How to Request an Exchange
                    </h4>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <li>Share your order details with our support team</li>
                      <li>Send clear photos of the product and packaging</li>
                      <li>Once approved, we will arrange the exchange pickup</li>
                    </ul>

                    <h4 style={{ color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                      Additional Notes
                    </h4>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <li>No returns or refunds</li>
                      <li>Exchange is subject to product inspection and availability</li>
                      {/* <li>If the item is out of stock, store credit will be offered</li> */}
                    </ul>

                    <p style={{ marginTop: '1.5rem', fontStyle: 'italic' }}>
                      Your satisfaction matters to us, and we aim to create a smooth experience for every Thread Saint.
                    </p>
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
                    <div className={styles.shippingDetails}>
                      <p className={styles.shippingTitle}>Delivery Timeline:</p>
                      <ul className={styles.shippingList}>
                        <li><strong>All Over India:</strong> 7-10 working days</li>
                        <li><strong>Delhi-NCR:</strong> 5-7 working days</li>
                      </ul>

                      <p className={styles.shippingTitle}>Shipping Charges:</p>
                      <ul className={styles.shippingList}>
                        <li><strong>Free Shipping</strong> on orders above ₹4,999</li>
                        <li><strong>Delhi-NCR:</strong> ₹90 (orders below ₹4,999)</li>
                        <li><strong>Rest of India:</strong> ₹150 (orders below ₹4,999)</li>
                      </ul>

                      <p className={styles.shippingTitle}>Order Processing:</p>
                      <ul className={styles.shippingList}>
                        <li>Orders processed within 24-48 hours of confirmation</li>
                        <li>Tracking ID sent via email/WhatsApp after dispatch</li>
                      </ul>

                      <p className={styles.shippingNote}>
                        <strong>Special Offer:</strong> Orders above ₹20,000 eligible for 20% discount
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className={styles.modalOverlay} onClick={() => setShowSizeChart(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModal}
              onClick={() => setShowSizeChart(false)}
            >
              ×
            </button>
            <img
              src="/Group 52.png"
              alt="Size Chart"
              className={styles.sizeChartImage}
            />
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageZoom && (
        <div className={styles.imageZoomOverlay} onClick={() => setShowImageZoom(false)}>
          <div className={styles.imageZoomContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModal}
              onClick={() => setShowImageZoom(false)}
            >
              ×
            </button>

            {/* Thumbnails for Desktop (Left Side) */}
            {getCurrentImages().length > 1 && (
              <div className={styles.zoomThumbnailsDesktop}>
                {getCurrentImages().map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.zoomThumbnail} ${selectedImage === index ? styles.zoomThumbnailActive : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            <div className={styles.zoomedImageWrapper}>
              <img
                src={getCurrentImages()[selectedImage]}
                alt={product.name}
                className={styles.zoomedImage}
              />

              {/* Thumbnails for Mobile (Bottom) */}
              {getCurrentImages().length > 1 && (
                <div className={styles.zoomThumbnailsMobile}>
                  {getCurrentImages().map((img, index) => (
                    <div
                      key={index}
                      className={`${styles.zoomThumbnail} ${selectedImage === index ? styles.zoomThumbnailActive : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary Modal */}
      <CartSummaryModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
      />
    </>
  )
}

export default ProductDetails
