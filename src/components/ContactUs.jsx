import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../config/api'
import Navbar from './Navbar'
import styles from './ContactUs.module.css'

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.post(API_ENDPOINTS.CONTACT_SUBMIT, formData)

      if (response.data.success) {
        toast.success(response.data.message)

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.contactContainer}>
        <div className={styles.content}>
          {/* Header Section */}
          <div className={styles.header}>
            <h1 className={styles.title}>GET IN TOUCH</h1>
            <p className={styles.subtitle}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className={styles.mainContent}>
            {/* Contact Information */}
            <div className={styles.contactInfo}>
              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h3 className={styles.infoTitle}>Email Us</h3>
                <p className={styles.infoText}>thrdsaints@gmail.com</p>
                {/* <p className={styles.infoText}>orders@threadsaints.com</p> */}
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h3 className={styles.infoTitle}>Call Us</h3>
                <p className={styles.infoText}>+91 79929 96999</p>
                <p className={styles.infoSubtext}>Mon-Sun: 11 AM - 6 PM IST</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={styles.infoTitle}>Follow Us</h3>
                <div className={styles.socialLinks}>
                  <a href="https://www.threads.com/@threadsaints.co?igshid=NTc4MTIwNjQ2YQ%3D%3D" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Threads</a>
                  <a href="https://www.facebook.com/profile.php?id=61583191670523&mibextid=wwXIfr&rdid=bqtXBTBxi8LPsetX&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1EnkkG4hpm%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Facebook</a>
                  <a href="https://www.instagram.com/threadsaints.co" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Instagram</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formSection}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                      pattern="[0-9]{10}"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.label}>Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={styles.faqSection}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>What are your shipping times?</h3>
                <p className={styles.faqAnswer}>
                  We deliver across India in 7-10 working days, and Delhi-NCR in 5-7 working days.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>Do you offer international shipping?</h3>
                <p className={styles.faqAnswer}>
                  Currently, we only ship within India. International shipping coming soon!
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>What is your exchange policy?</h3>
                <p className={styles.faqAnswer}>
                  We offer same-size exchanges within 7 days of delivery. Check our Exchange Policy for details.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>How can I track my order?</h3>
                <p className={styles.faqAnswer}>
                  Once shipped, you'll receive a tracking link via email and SMS to monitor your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactUs
