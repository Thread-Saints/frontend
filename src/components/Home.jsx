import Navbar from './Navbar'
import styles from './Home.module.css'

function Home() {
  return (
    <>
      <Navbar />
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