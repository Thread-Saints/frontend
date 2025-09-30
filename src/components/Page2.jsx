import styles from './Page2.module.css'

function Page2() {
  return (
    <div className={styles.page2Container}>
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/IMG_5108.MOV" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.content}>
        <h2 className={styles.tagline}>"No Mid Fits, Only Main Character Energy"</h2>
      </div>
    </div>
  )
}

export default Page2