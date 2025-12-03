import { useEffect } from 'react'
import Navbar from './Navbar'
import styles from './TermsAndConditions.module.css'

function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Terms & Conditions</h1>

        {/* Privacy Policy Section */}
        <div className={styles.mainSection}>
          <h2 className={styles.mainHeading}>Privacy Policy</h2>

          <div className={styles.section}>
            <h3 className={styles.heading}>1. Data Protection & Security</h3>
            <p className={styles.text}>
              We collect only the information needed to process your orders and improve your experience.
              All customer data is protected, encrypted, and never shared with third parties without consent.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>2. Use of Personal Information</h3>
            <p className={styles.text}>
              Your name, contact details, and payment information are used solely for order processing,
              shipping, customer service, and personalized recommendations.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>3. Cookies & Tracking</h3>
            <p className={styles.text}>
              Our website uses cookies to enhance your browsing experience, save preferences, and analyze
              site performance. You may disable cookies at any time.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>4. Third-Party Services</h3>
            <p className={styles.text}>
              We may use trusted third-party partners for payments, analytics, or logistics. These partners
              follow strict data-protection standards.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>5. User Rights</h3>
            <p className={styles.text}>
              You can request access, correction, or deletion of your personal data at any point by
              contacting our support team.
            </p>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Terms & Conditions Section */}
        <div className={styles.mainSection}>
          <h2 className={styles.mainHeading}>Terms & Conditions</h2>

          <div className={styles.section}>
            <h3 className={styles.heading}>1. Intellectual Property & Copyright</h3>
            <p className={styles.text}>
              All designs, products, images, videos, and content on Thread Saints are original and protected
              under copyright laws. Any copying, reproduction, or misuse without written permission is
              strictly prohibited.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>2. Product Availability & Pricing</h3>
            <p className={styles.text}>
              All products are subject to availability. Prices may change without prior notice due to demand,
              production, or seasonal factors.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>3. Order Processing & Shipping</h3>
            <p className={styles.text}>
              Orders are confirmed only after successful payment. Delivery timelines depend on location but
              will be communicated clearly at checkout.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>4. Returns & Exchanges</h3>
            <p className={styles.text}>
              Products can be returned or exchanged within the allowed return window if they meet our return
              policy conditions (unused, unwashed, with tags intact).
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>5. Limitation of Liability</h3>
            <p className={styles.text}>
              Thread Saints is not responsible for delays caused by external factors such as courier issues,
              weather, or unforeseen circumstances.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>6. Agreement to Terms</h3>
            <p className={styles.text}>
              By browsing and using our website, you agree to all listed Terms & Conditions, updated as
              needed for customer and platform safety.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Last updated: January 2025
          </p>
          <p className={styles.footerText}>
            For any questions regarding our terms and conditions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
