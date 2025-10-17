import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaUserCircle, FaShoppingCart, FaHeart } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import LoginModal from './LoginModal'
import styles from './Navbar.module.css'

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const profileDropdownRef = useRef(null)
  const { isAuthenticated, user, logout } = useAuth()
  const { getCartItemCount } = useCart()

  useEffect(() => {
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

  return (
    <>
      <nav className={styles.navbar}>
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
                <a href="#" className={styles.dropdownItem}>T-SHIRTS</a>
                <a href="#" className={styles.dropdownItem}>JEANS</a>
                <a href="#" className={styles.dropdownItem}>JACKETS</a>
                <a href="#" className={styles.dropdownItem}>HOODIES</a>
                <a href="#" className={styles.dropdownItem}>ALL</a>
              </div>
            )}
          </div>
        </div>
        <div className={styles.navIcons}>
          {isAuthenticated ? (
            <>
              <button className={styles.iconButton}>
                <FaHeart size={24} />
              </button>
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
