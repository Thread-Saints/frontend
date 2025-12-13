import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { API_ENDPOINTS } from '../config/api'
import styles from './Categories.module.css'

function Categories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    window.scrollTo(0, 0)
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

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`)
  }

  return (
    <>
      <Navbar />
      <div className={styles.categoriesContainer}>
        <div className={styles.content}>
          {/* Heading with shadow effect */}
          <div className={styles.headingContainer}>
            <h1 className={styles.heading}>SAINT'S DROP</h1>
            {/* <h1 className={styles.headingShadow}>SAINT'S DROP</h1> */}
            {/* <h1 className={styles.headingShadow2}>SAINT'S DROP</h1> */}
          </div>

          {/* Categories grid */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <p className={styles.loadingText}>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>No categories available</p>
            </div>
          ) : (
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className={styles.categoryImageContainer}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className={styles.categoryImage}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <span className={styles.noImageText}>No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className={styles.categoryName}>{category.name.toUpperCase()}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Categories
