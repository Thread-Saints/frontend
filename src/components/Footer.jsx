import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  const [email, setEmail] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const splitSectionRef = useRef(null)

  const carouselImages = [
    '/corosal/Property 1=Frame 1.webp',
    '/corosal/Property 1=Frame 2.webp',
    '/corosal/Property 1=Frame 9.webp',
    '/corosal/Property 1=Frame 10.webp',
    '/corosal/Property 1=Frame 11.webp',
    '/corosal/Property 1=Frame 12.webp',
    '/corosal/Property 1=Frame 14.webp',
    '/corosal/Property 1=Frame 15.webp'
  ]

  // Preload carousel images only once the footer is about to scroll into view,
  // instead of eagerly fetching all of them on every page load.
  useEffect(() => {
    const target = splitSectionRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          carouselImages.forEach(imageSrc => {
            const img = new Image()
            img.src = imageSrc
          })
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextImageIndex((currentImageIndex + 1) % carouselImages.length)

      // After fade transition completes (600ms), update current image
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
        setIsTransitioning(false)
      }, 600)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [currentImageIndex, carouselImages.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      {/* Split section with doll */}
      <div className={styles.splitSection} ref={splitSectionRef}>
        <div className={styles.backgroundSplit}>
          {/* Current image layer */}
          <img
            src={carouselImages[currentImageIndex]}
            alt="Carousel"
            className={`${styles.carouselImage} ${styles.currentImage} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
            loading="lazy"
            decoding="async"
          />
          {/* Next image layer (for cross-fade) */}
          <img
            src={carouselImages[nextImageIndex]}
            alt="Carousel"
            className={`${styles.carouselImage} ${styles.nextImage} ${isTransitioning ? styles.fadeIn : styles.fadeOut}`}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={styles.dollContainer}>
          <img
            src="/dolls/doll seeing.webp"
            alt="Doll Peeking"
            className={styles.dollImage}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Footer content */}
      <div className={styles.container}>
        <div className={styles.newsletter}>
          <h3 className={styles.heading}>Subscribe to our email</h3>
          <p className={styles.termsText}>
            By subscribing you will be getting updates on our new drops on your mail
           
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
            <button type="submit" className={styles.button}>Subscribe</button>
          </form>
        </div>

        <div className={styles.links}>
          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Collections</h4>
            <Link to="/category/T-Shirts" className={styles.footerLink}>T-Shirts</Link>
            <Link to="/category/Sweatshirts" className={styles.footerLink}>Sweatshirts</Link>
            <Link to="/category/Jeans" className={styles.footerLink}>Jeans</Link>
            <Link to="/category/Jackets" className={styles.footerLink}>Jackets</Link>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnHeading}>Need Help</h4>
            <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
            <Link to="/shipping-policy" className={styles.footerLink}>Shipping Policy</Link>
            <Link to="/exchange-policy" className={styles.footerLink}>Return & Exchange Policy</Link>
            <Link to="/terms-and-conditions" className={styles.footerLink}>Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* Thread Saints branding */}
      <div className={styles.brandingSection}>
        <img src="/Group 24.webp" alt="Thread Saints" className={styles.brandingImage} loading="lazy" decoding="async" />
        <p className={styles.managedByText}>Managed by Jawa hospitality</p>
      </div>
    </footer>
  )
}

export default Footer
