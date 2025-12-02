import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import Navbar from './Navbar'
import styles from './MyProfile.module.css'

function MyProfile() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedSection, setSelectedSection] = useState('profile')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

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

  // Fetch addresses when addresses section is opened
  useEffect(() => {
    if (selectedSection === 'addresses' && !showAddressForm) {
      fetchAddresses()
    }
  }, [selectedSection, showAddressForm])

  const fetchAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ADDRESSES)
      if (response.data.success) {
        setAddresses(response.data.addresses)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      const response = await axios.put(API_ENDPOINTS.UPDATE_PROFILE, {
        name,
        email
      })

      if (response.data.success) {
        toast.success('Profile updated successfully')
        // Update user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'))
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          name: response.data.user.name,
          email: response.data.user.email
        }))
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(API_ENDPOINTS.ADD_ADDRESS, addressForm)

      if (response.data.success) {
        toast.success('Address added successfully')
        setShowAddressForm(false)
        // Reset form
        setAddressForm({
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        })
        // Refresh addresses
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error(error.response?.data?.message || 'Failed to add address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const response = await axios.delete(API_ENDPOINTS.DELETE_ADDRESS(addressId))

      if (response.data.success) {
        toast.success('Address deleted successfully')
        fetchAddresses()
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error(error.response?.data?.message || 'Failed to delete address')
    }
  }

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
                    <button
                      onClick={handleProfileSave}
                      disabled={savingProfile}
                      className={styles.saveButton}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
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
                <button
                  className={styles.addButton}
                  onClick={() => {
                    setSelectedSection('addresses')
                    setShowAddressForm(true)
                  }}
                >
                  + Add
                </button>
              </div>
              {selectedSection === 'addresses' && (
                <div className={styles.sectionContent}>
                  {showAddressForm ? (
                    <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          value={addressForm.fullName}
                          onChange={handleAddressChange}
                          className={styles.input}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          className={styles.input}
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <textarea
                          name="address"
                          placeholder="Address"
                          value={addressForm.address}
                          onChange={handleAddressChange}
                          className={styles.textarea}
                          rows="3"
                          required
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            className={styles.input}
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={addressForm.state}
                            onChange={handleAddressChange}
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          className={styles.input}
                          pattern="[0-9]{6}"
                          required
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton}>
                          Save Address
                        </button>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : loadingAddresses ? (
                    <div className={styles.emptyState}>
                      <p>Loading addresses...</p>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className={styles.addressesList}>
                      {addresses.map((addr) => (
                        <div key={addr._id} className={styles.addressCard}>
                          <div className={styles.addressDetails}>
                            <p className={styles.addressName}>{addr.fullName}</p>
                            <p className={styles.addressText}>{addr.address}</p>
                            <p className={styles.addressText}>
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className={styles.addressPhone}>Phone: {addr.phone}</p>
                            {addr.isDefault && (
                              <span className={styles.defaultBadge}>Default</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No addresses saved yet</p>
                    </div>
                  )}
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
