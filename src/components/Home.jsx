import { useState, useEffect, useRef } from 'react'
import { FaUserCircle, FaShoppingCart, FaHeart } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import styles from './Home.module.css'

function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const profileDropdownRef = useRef(null)
  const { isAuthenticated, user, logout } = useAuth()

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
      <div className={styles.comingSoonRibbon}>
        <span className={styles.comingSoonText}>COMING SOON</span>
      </div>
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <img src="/Vector.png" alt="TS Logo" />
          </div>
          <div className={styles.navLinks}>
            <a href="#" className={styles.navLink}>Home</a>
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
                <button className={styles.iconButton}>
                  <FaShoppingCart size={24} />
                </button>
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
        <img src="/hero-image.png" alt="Hero" className={styles.heroOverlay} />
        <div className={styles.headerContainer}>
          <div className={styles.headerBorder}></div>
          <img src="/Group 24.png" alt="Thread Saints" className={styles.headerText} />
        </div>
        <button className={styles.flexButton}>FLEX NOW</button>
        <div className={styles.ticker}>
          <div className={styles.tickerContent}>
            <div className={styles.tickerText}>
              "Own the Streets, Wear the Saints."
            </div>
            <div className={styles.tickerText}>
              "Own the Streets, Wear the Saints."
            </div>
            <div className={styles.tickerText}>
              "Own the Streets, Wear the Saints."
            </div>
            <div className={styles.tickerText}>
              "Own the Streets, Wear the Saints."
            </div>
            <div className={styles.tickerText}>
             " Own the Streets, Wear the Saints."
            </div>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      {/* <div className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h1 className={styles.aboutTitle}>ABOUT US</h1>
          <div className={styles.aboutBody}>
            <div className={styles.aboutText}>
              <p className={styles.aboutDescription}>
                ThreadSaints is a premium Indian streetwear label fusing western luxury with Indian edge — crafting bold, trend-forward fits that let youth own the streets with confidence.
              </p>
              <p className={styles.aboutDescription}>
                Street is our runway, every corner is a flex, and our drops are made to last longer than your playlist obsession.
              </p>
              <p className={styles.aboutDescription}>
                This isn't "fast fashion." This is premium drip with Indian edge. Luxe cuts, bold vibes, and clothes that scream main character energy.
              </p>
            </div>
            <div className={styles.aboutImage}>
              <img src="/aboutus.png" alt="About Us" className={styles.aboutImageContent} />
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}

export default Home