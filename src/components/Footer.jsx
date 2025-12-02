import { useState, useEffect } from 'react'
import styles from './Footer.module.css'

function Footer() {
  const [email, setEmail] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselImages = [
    '/corosal/Property 1=Frame 1.png',
    '/corosal/Property 1=Frame 2.png',
    '/corosal/Property 1=Frame 9.png',
    '/corosal/Property 1=Frame 10.png',
    '/corosal/Property 1=Frame 11.png',
    '/corosal/Property 1=Frame 12.png',
    '/corosal/Property 1=Frame 14.png',
    '/corosal/Property 1=Frame 15.png'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % carouselImages.length
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [carouselImages.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Email submitted:', email)
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      {/* Split section with doll */}
      <div className={styles.splitSection}>
        <div className={styles.backgroundSplit}>
          <img
            src={carouselImages[currentImageIndex]}
            alt="Carousel"
            className={styles.carouselImage}
            key={currentImageIndex}
          />
        </div>
        <div className={styles.dollContainer}>
          <img
            src="/dolls/doll seeing.png"
            alt="Doll Peeking"
            className={styles.dollImage}
          />
        </div>
      </div>

      {/* Footer content */}
      <div className={styles.container}>
        <div className={styles.newsletter}>
          <h3 className={styles.heading}>Subscribe to our email</h3>
          <p className={styles.termsText}>
            By subscribing you agree to{' '}
            <a href="/terms" className={styles.link}>Terms of use</a>
            {' '}and{' '}
            <a href="/privacy" className={styles.link}>Privacy Policy</a>
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>Sign Up</button>
          </form>
        </div>

        <div className={styles.links}>
          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Collections</h4>
            <a href="/collections/tshirts" className={styles.footerLink}>Tshirts</a>
            <a href="/collections/sweatshirts" className={styles.footerLink}>Sweatshirts</a>
            <a href="/collections/jeans" className={styles.footerLink}>Jeans</a>
            <a href="/collections/hoodies" className={styles.footerLink}>Hoodies</a>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Need Help</h4>
            <a href="/contact" className={styles.footerLink}>Contact Us</a>
            <a href="/shipping" className={styles.footerLink}>Shipping Policy</a>
            <a href="/returns" className={styles.footerLink}>Return & Exchange Policy</a>
          </div>
        </div>
      </div>

      {/* Thread Saints branding */}
      <div className={styles.brandingSection}>
        <img src="/Group 24.png" alt="Thread Saints" className={styles.brandingImage} />
      </div>
    </footer>
  )
}

export default Footer
