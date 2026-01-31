import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaShoppingCart, FaHeart } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { API_ENDPOINTS } from '../config/api'
import LoginModal from './LoginModal'
import styles from './Navbar.module.css'

function Navbar() {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [valentineActive, setValentineActive] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const dropdownRef = useRef(null)
  const profileDropdownRef = useRef(null)
  const { isAuthenticated, user, logout } = useAuth()
  const { getCartItemCount } = useCart()
  const { getWishlistItemCount } = useWishlist()

  useEffect(() => {
    fetchCategories()
    checkValentineOffer()

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES)
      const data = await response.json()

      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories)
      } else if (data.data && Array.isArray(data.data)) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const checkValentineOffer = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CHECK_VALENTINE)
      const data = await response.json()
      if (data.success && data.valentineActive) {
        setValentineActive(true)
      }
    } catch (error) {
      console.error('Error checking Valentine offer:', error)
    }
  }

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`)
    setIsDropdownOpen(false)
  }

  return (
    <>
      {/* Valentine's Announcement Bar */}
      {valentineActive && showAnnouncement && (
        <div className={styles.announcementBar}>
          <p className={styles.announcementText}>
            💕 Valentine's Special: Buy 2+ items & get <strong>20% OFF!</strong> (Feb 1-14)
          </p>
          <button
            className={styles.announcementClose}
            onClick={() => setShowAnnouncement(false)}
            aria-label="Close announcement"
          >
            ×
          </button>
        </div>
      )}
      <nav className={`${styles.navbar} ${valentineActive && showAnnouncement ? styles.navbarWithAnnouncement : ''}`}>
        <Link to="/" className={styles.logo}>
          <img src="/Vector.png" alt="TS Logo" />
        </Link>
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              className={styles.navLink}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Categories
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className={styles.dropdownItem}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name.toUpperCase()}
                  </button>
                ))}
                <Link
                  to="/categories"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  ALL CATEGORIES
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className={styles.navIcons}>
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className={styles.iconButton}>
                <FaHeart size={24} />
                {getWishlistItemCount() > 0 && (
                  <span className={styles.wishlistBadge}>{getWishlistItemCount()}</span>
                )}
              </Link>
              <Link to="/cart" className={styles.iconButton}>
                <FaShoppingCart size={24} />
                {getCartItemCount() > 0 && (
                  <span className={styles.cartBadge}>{getCartItemCount()}</span>
                )}
              </Link>
              <div className={styles.profileDropdown} ref={profileDropdownRef}>
                <button
                  className={styles.profileButton}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <FaUserCircle size={32} />
                </button>
                {isProfileDropdownOpen && (
                  <div className={styles.profileDropdownMenu}>
                    <div className={styles.profileEmail}>{user?.email}</div>
                    <Link to="/profile" className={styles.dropdownLink}>
                      My Profile
                    </Link>
                    <Link to="/orders" className={styles.dropdownLink}>
                      My Orders
                    </Link>
                    <button onClick={logout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className={styles.loginButton}
              onClick={() => setIsLoginModalOpen(true)}
            >
              LOGIN
            </button>
          )}
        </div>
      </nav>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

export default Navbar
