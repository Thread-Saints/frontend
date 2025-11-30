import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import styles from './LoginModal.module.css'

function LoginModal({ isOpen, onClose, prefilledEmail = '' }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()

  // Set prefilled email when modal opens with prefilled email
  useEffect(() => {
    if (prefilledEmail && isOpen) {
      setEmail(prefilledEmail)
      setIsLogin(false) // Switch to signup mode when coming from newsletter
    }
  }, [prefilledEmail, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isLogin
      ? await login(email, password)
      : await signup(name, email, password)

    setLoading(false)

    if (result.success) {
      setName('')
      setEmail('')
      setPassword('')
      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!')
      onClose()
    } else {
      setError(result.message)
      toast.error(result.message || (isLogin ? 'Login failed' : 'Signup failed'))
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setName('')
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <h2 className={styles.title}>{isLogin ? 'LOGIN' : 'SIGN UP'}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
                minLength={2}
                maxLength={50}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={toggleMode} className={styles.toggleButton}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal
