import styles from './Page5.module.css'

function Page5() {
  return (
    <div className={styles.page5Container}>
      <div className={styles.backgroundSplit}>
        <div className={styles.leftPanel}></div>
        <div className={styles.rightPanel}></div>
      </div>
      {/* <div className={styles.dollContainer}>
        <img
          src="/dolls/doll seeing.webp"
          alt="Doll Peeking"
          className={styles.dollImage}
        />
      </div> */}
    </div>
  )
}

export default Page5
