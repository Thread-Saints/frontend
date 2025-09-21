import { useState, useEffect, useRef } from 'react'
import styles from './Home.module.css'

function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <>
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
            <span className={styles.icon}>♡</span>
            <span className={styles.icon}>🛒</span>
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
      <div className={styles.aboutSection}>
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
      </div>
    </>
  )
}

export default Home