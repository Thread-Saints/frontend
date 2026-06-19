import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../config/api'
import styles from './SignupPopup.module.css'

function SignupPopup({ isOpen, onClose, onOpenLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.warning('Please enter your email')
      return
    }

    setLoading(true)

    try {
      // Call newsletter API
      const response = await axios.post(API_ENDPOINTS.NEWSLETTER, { email })

      if (response.data.success) {
        const { userExists, hasDiscount } = response.data

        if (userExists) {
          if (hasDiscount) {
            toast.info('You already have an account! Login to use your 10% discount')
          } else {
            toast.info('You already have an account! Please login')
          }
        } else {
          toast.success('Great! Complete signup to get 10% OFF on your first order')
        }

        // Close signup popup
        onClose()

        // Open login modal with prefilled email
        if (onOpenLogin) {
          onOpenLogin(email)
        }
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      toast.error(error.response?.data?.message || 'Failed to process. Please try again.')
    } finally {
      setEmail('')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.header}>
          <img
            src="/Group 24.webp"
            alt="Thread Saints"
            className={styles.logo}
          />
          <div className={styles.dollsContainer}>
            <img
              src="/dolls/pink doll standing.webp"
              alt="Pink Doll"
              className={styles.dollLeft}
            />
            <img
              src="/dolls/black doll standing.webp"
              alt="Black Doll"
              className={styles.dollRight}
            />
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>
            Sign up to get 10% OFF
          </h2>
          <p className={styles.subtitle}>
            on your first order
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              required
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get 10% OFF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPopup
