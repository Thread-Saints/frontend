import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import SignupPopup from './SignupPopup'
import LoginModal from './LoginModal'
import { useAuth } from '../context/AuthContext'
import styles from './Home.module.css'

function Home() {
  const { isAuthenticated } = useAuth()
  const [showPopup, setShowPopup] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [prefilledEmail, setPrefilledEmail] = useState('')

  useEffect(() => {
    // Don't show popup if user is authenticated
    if (isAuthenticated) {
      return
    }

    // Check if popup was shown recently (within last 5 minutes)
    const lastShown = localStorage.getItem('signupPopupLastShown')
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

    // Show popup immediately if it was never shown or if 5 minutes have passed
    if (!lastShown || now - parseInt(lastShown) >= fiveMinutes) {
      // Show popup after 3 seconds of landing on page
      const initialTimer = setTimeout(() => {
        setShowPopup(true)
        localStorage.setItem('signupPopupLastShown', now.toString())
      }, 3000)

      // Set up recurring timer for every 5 minutes
      const recurringTimer = setInterval(() => {
        if (!isAuthenticated) {
          setShowPopup(true)
          localStorage.setItem('signupPopupLastShown', Date.now().toString())
        }
      }, fiveMinutes)

      return () => {
        clearTimeout(initialTimer)
        clearInterval(recurringTimer)
      }
    }
  }, [isAuthenticated])

  const handleClosePopup = () => {
    setShowPopup(false)
    localStorage.setItem('signupPopupLastShown', Date.now().toString())
  }

  const handleOpenLogin = (email) => {
    setPrefilledEmail(email)
    setShowLoginModal(true)
  }

  const handleCloseLogin = () => {
    setShowLoginModal(false)
    setPrefilledEmail('')
  }

  return (
    <>
      <Navbar />
      <SignupPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        onOpenLogin={handleOpenLogin}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLogin}
        prefilledEmail={prefilledEmail}
      />
      <div className={styles.container}>
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