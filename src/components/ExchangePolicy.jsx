import { useEffect } from 'react'
import Navbar from './Navbar'
import styles from './ExchangePolicy.module.css'

function ExchangePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Return & Exchange Policy</h1>

        <div className={styles.section}>
          <p className={styles.intro}>
            At Thread Saints, we want every piece you wear to feel perfect. If something isn't right,
            we offer a simple and hassle-free exchange process.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.heading}>Exchange Available Within 7 Days of Delivery</h2>
          <p className={styles.text}>
            You can request an exchange within 7 days of receiving your order.
          </p>
          <p className={styles.text}>To be eligible for an exchange, please ensure:</p>
          <ul className={styles.list}>
            <li>The product is unworn and unwashed</li>
            <li>All original tags and packaging are intact</li>
            <li>The request is raised within the 7-day window</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2 className={styles.heading}>Important: Exchange Is Only for the Same Size</h2>
          <p className={styles.text}>
            We allow exchange only for the same size of the same product. (Example: M → M, not M → L or S)
          </p>
          <p className={styles.text}>
            This is done to maintain exclusivity and preserve limited-drop inventory.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.heading}>How to Request an Exchange</h2>
          <ol className={styles.orderedList}>
            <li>Share your order details with our support team</li>
            <li>Send clear photos of the product and packaging</li>
            <li>Once approved, we will arrange the exchange pickup</li>
          </ol>
        </div>

        <div className={styles.section}>
          <h2 className={styles.heading}>Additional Notes</h2>
          <ul className={styles.list}>
            <li>No returns or refunds</li>
            <li>Exchange is subject to product inspection and availability</li>
            {/* <li>If the item is out of stock, store credit will be offered</li> */}
          </ul>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Your satisfaction matters to us, and we aim to create a smooth experience for every Thread Saint.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ExchangePolicy
