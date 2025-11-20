import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Page4.module.css'
import { API_ENDPOINTS } from '../config/api'

function Page4() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

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

  return (
    <div className={styles.page4Container}>
      <div className={styles.content}>
        {loading ? (
          <p className={styles.loadingText}>Loading products...</p>
        ) : products.length === 0 ? (
          <p className={styles.loadingText}>No products available</p>
        ) : (
          <div className={styles.productsGrid}>
            {Array.isArray(products) && products.map((product) => (
              <div
                key={product._id}
                className={styles.productCard}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className={styles.productImageContainer}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
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
            ))}
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
