import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import styles from './MyProfile.module.css'

function MyProfile() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedSection, setSelectedSection] = useState('profile')

  // Prefill user data when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user, isAuthenticated, navigate])

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.content}>
          <img
            src="/Welcome to Thread Saints.png"
            alt="Welcome to Thread Saints"
            className={styles.welcomeTitle}
          />

          <div className={styles.mainLayout}>
            {/* Profile Section */}
            <div className={styles.section}>
              <button
                className={`${styles.menuItem} ${selectedSection === 'profile' ? styles.activeMenuItem : ''}`}
                onClick={() => setSelectedSection(selectedSection === 'profile' ? '' : 'profile')}
              >
                Profile
              </button>
              {selectedSection === 'profile' && (
                <div className={styles.sectionContent}>
                  <div className={styles.profileInputs}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.input}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* My Orders Section */}
            <div className={styles.section}>
              <button
                className={styles.menuItem}
                onClick={() => navigate('/orders')}
              >
                My Orders
              </button>
            </div>

            {/* Addresses Section */}
            <div className={styles.section}>
              <div className={styles.menuItemWithAction}>
                <span
                  className={styles.menuItemText}
                  onClick={() => setSelectedSection(selectedSection === 'addresses' ? '' : 'addresses')}
                >
                  Addresses
                </span>
                <button className={styles.addButton}>+ Add</button>
              </div>
              {selectedSection === 'addresses' && (
                <div className={styles.sectionContent}>
                  <div className={styles.emptyState}>
                    <p>No addresses saved yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Section */}
            <div className={styles.section}>
              <button
                className={styles.menuItem}
                onClick={() => setSelectedSection(selectedSection === 'terms' ? '' : 'terms')}
              >
                Terms and Condition
              </button>
              {selectedSection === 'terms' && (
                <div className={styles.sectionContent}>
                  <div className={styles.textContent}>
                    <p>Terms and Conditions content will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className={styles.section}>
              <button
                className={styles.menuItem}
                onClick={() => setSelectedSection(selectedSection === 'contact' ? '' : 'contact')}
              >
                Contact Us
              </button>
              {selectedSection === 'contact' && (
                <div className={styles.sectionContent}>
                  <div className={styles.textContent}>
                    <p>Contact information will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Section */}
            <div className={styles.section}>
              <button
                className={styles.menuItem}
                onClick={() => setSelectedSection(selectedSection === 'shipping' ? '' : 'shipping')}
              >
                Shipping Policy
              </button>
              {selectedSection === 'shipping' && (
                <div className={styles.sectionContent}>
                  <div className={styles.textContent}>
                    <p>Shipping policy content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MyProfile
