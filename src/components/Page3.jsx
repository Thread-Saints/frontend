import { useState, useEffect } from 'react'
import styles from './Page3.module.css'
import { API_ENDPOINTS } from '../config/api'

function Page3() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES)
      const data = await response.json()

      // Handle different response structures
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories)
      } else if (data.data && Array.isArray(data.data)) {
        setCategories(data.data)
      } else {
        console.error('Unexpected response structure:', data)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page3Container}>
      <div className={styles.content}>
        {/* Heading with shadow effect */}
        <div className={styles.headingContainer}>
          <h2 className={styles.heading}>SAINT'S DROP</h2>
          <h2 className={styles.headingShadow}>SAINT'S DROP</h2>
        </div>

        {/* Categories horizontal scroll */}
        <div className={styles.categoriesSection}>
          {loading ? (
            <p className={styles.loadingText}>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className={styles.loadingText}>No categories available</p>
          ) : (
            <div className={styles.categoriesScroll}>
              {Array.isArray(categories) && categories.map((category) => (
                <div key={category._id} className={styles.categoryCard}>
                  <div className={styles.categoryImagePlaceholder}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className={styles.categoryImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span className={styles.noImageText}>No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drop it all button */}
        <button className={styles.dropItAllBtn}>DROP IT ALL</button>
      </div>
    </div>
  )
}

export default Page3
