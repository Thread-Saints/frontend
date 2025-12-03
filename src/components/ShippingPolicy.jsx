import { useEffect } from 'react'
import Navbar from './Navbar'
import styles from './ShippingPolicy.module.css'

function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Shipping Policy</h1>

        <div className={styles.section}>
          <h2 className={styles.heading}>1. Shipping Timeline</h2>
          <ul className={styles.list}>
            <li><strong>All Over India:</strong> Orders are shipped within 7–10 working days.</li>
            <li><strong>Delhi–NCR:</strong> Faster delivery within 5–7 working days.</li>
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.heading}>2. Shipping Charges</h2>
          <ul className={styles.list}>
            <li><strong>Free Shipping</strong> on all orders above ₹4,999.</li>
            <li><strong>Delhi–NCR:</strong> Flat shipping charge of ₹90 for orders below ₹4,999.</li>
            <li><strong>Rest of India:</strong> Flat shipping charge of ₹150 for orders below ₹4,999.</li>
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.heading}>3. Special Offer</h2>
          <ul className={styles.list}>
            <li>Orders above <strong>₹20,000</strong> are eligible for an exclusive <strong>20% discount</strong>.</li>
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.heading}>4. Order Processing</h2>
          <ul className={styles.list}>
            <li>All orders are processed within <strong>24–48 hours</strong> of confirmation.</li>
            <li>Orders placed on weekends or holidays will be processed on the next working day.</li>
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.heading}>5. Tracking Information</h2>
          <ul className={styles.list}>
            <li>Once your order is shipped, you will receive a <strong>tracking ID via email or WhatsApp</strong>.</li>
            <li>You can track your order using this ID on the respective courier partner's website.</li>
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.heading}>6. Delivery Delays</h2>
          <ul className={styles.list}>
            <li>Unforeseen delays due to weather, festivals, or logistics partner issues may occur.</li>
            <li>We ensure your orders reach you as quickly as possible.</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            For any shipping-related queries, feel free to contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShippingPolicy
