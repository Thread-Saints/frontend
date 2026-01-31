import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import { getRegionFromPincode } from '../utils/pincodeUtils'
import styles from './Checkout.module.css'

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, getCartTotal } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [phonePeConfig, setPhonePeConfig] = useState(null)
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountChecked, setDiscountChecked] = useState(false)
  const [discountType, setDiscountType] = useState(null) // 'valentine' or 'welcome'
  const [valentineActive, setValentineActive] = useState(false)
  const [isTestAccount, setIsTestAccount] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [saveAddress, setSaveAddress] = useState(false)
  const [makeDefault, setMakeDefault] = useState(false)

  // Get buy now item from navigation state
  const buyNowItem = location.state?.buyNowItem

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    region: 'rest-of-india' // Default to Rest of India
  })

  const [email, setEmail] = useState('') // Mandatory email for both guest and logged-in users

  useEffect(() => {
    // Check if we have items (either from buy now or cart)
    // No auth check - allow guest checkout!
    if (!buyNowItem && (!cart || cart.items.length === 0)) {
      navigate('/cart')
      return
    }

    fetchPhonePeConfig()
    checkValentineOffer() // Check Valentine's for everyone (guests + logged-in)

    // Only check discount and fetch addresses for authenticated users
    if (isAuthenticated) {
      checkDiscountEligibility()
      fetchSavedAddresses()
      // Auto-fill email for logged-in users
      if (user && user.email) {
        setEmail(user.email)
      }
    } else {
      // For guests, always use new address
      setUseNewAddress(true)
      setDiscountChecked(true) // Guests don't need to wait for discount check
    }
  }, [isAuthenticated, cart, navigate, buyNowItem, user])

  // Show toast when discount is applied
  useEffect(() => {
    const { currentDiscountType, itemCount } = calculatePrices()
    if (currentDiscountType === 'valentine') {
      toast.success("Valentine's 20% Discount Applied! 💕", { toastId: 'valentine-discount' })
    } else if (currentDiscountType === 'welcome') {
      toast.success('10% Welcome Discount Applied! 🎉', { toastId: 'welcome-discount' })
    } else if (valentineActive && itemCount === 1 && !isAuthenticated) {
      // Hint for guests with 1 item during Valentine's
      toast.info('Add 1 more item to get 20% Valentine\'s discount! 💕', { toastId: 'valentine-hint' })
    }
  }, [valentineActive, hasDiscount, cart, buyNowItem])

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ADDRESSES)
      if (response.data.success) {
        const addresses = response.data.addresses
        setSavedAddresses(addresses)

        // Auto-select default address or first address
        const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id)
          // Auto-detect region from default address pincode
          const region = getRegionFromPincode(defaultAddr.pincode)
          setShippingAddress({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            region: region
          })
        } else {
          setUseNewAddress(true)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setUseNewAddress(true)
    }
  }

  const handleAddressSelect = (addressId) => {
    const selected = savedAddresses.find(addr => addr._id === addressId)
    if (selected) {
      setSelectedAddressId(addressId)
      setUseNewAddress(false)
      // Auto-detect region from saved address pincode
      const region = getRegionFromPincode(selected.pincode)
      setShippingAddress({
        fullName: selected.fullName,
        phone: selected.phone,
        address: selected.address,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
        region: region
      })
    }
  }

  const fetchPhonePeConfig = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_PHONEPE_CONFIG)
      if (response.data.success) {
        setPhonePeConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching PhonePe config:', error)
    }
  }

  // Check Valentine's offer (public - works for everyone)
  const checkValentineOffer = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_VALENTINE)
      if (response.data.success && response.data.valentineActive) {
        setValentineActive(true)
      }
    } catch (error) {
      console.error('Error checking Valentine offer:', error)
    }
  }

  const checkDiscountEligibility = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_DISCOUNT_ELIGIBILITY)
      if (response.data.success) {
        // Store welcome eligibility - actual discount applied in calculatePrices
        if (response.data.welcomeEligible) {
          setHasDiscount(true)
        }
        // Valentine's info is also returned for logged-in users
        if (response.data.valentineActive) {
          setValentineActive(true)
        }
        // Check if test account (₹1 payment)
        if (response.data.isTestAccount) {
          setIsTestAccount(true)
        }
      }
      setDiscountChecked(true)
    } catch (error) {
      console.error('Error checking discount eligibility:', error)
      setDiscountChecked(true)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const updatedAddress = {
      ...shippingAddress,
      [name]: value
    }

    // Auto-detect region from pincode
    if (name === 'pincode' && value.length === 6) {
      const region = getRegionFromPincode(value)
      updatedAddress.region = region
    }

    setShippingAddress(updatedAddress)
  }

  const calculatePrices = () => {
    // Calculate total based on buy now item or cart
    let itemsPrice
    let itemCount
    if (buyNowItem) {
      itemsPrice = buyNowItem.price * buyNowItem.quantity
      itemCount = buyNowItem.quantity // Count quantity, not just 1
    } else {
      itemsPrice = getCartTotal()
      // Count total quantity of all items, not just distinct items
      itemCount = cart?.items?.filter(item => item.product)?.reduce((sum, item) => sum + item.quantity, 0) || 0
    }

    // Determine which discount to apply
    // Priority: Valentine's (20% for 2+ items) > Welcome (10% for first-timers)
    let discount = 0
    let currentDiscountType = null

    if (valentineActive && itemCount >= 2) {
      // Valentine's: 20% off for 2+ items (works for everyone)
      discount = Math.round(itemsPrice * 0.20)
      currentDiscountType = 'valentine'
    } else if (hasDiscount && isAuthenticated) {
      // Welcome: 10% off for first-time logged-in users
      discount = Math.round(itemsPrice * 0.10)
      currentDiscountType = 'welcome'
    }

    const discountedPrice = itemsPrice - discount

    // New shipping logic based on region
    let shippingPrice = 0
    if (discountedPrice <= 4999) {
      // Free shipping for orders above Rs.4999
      shippingPrice = shippingAddress.region === 'delhi-ncr' ? 90 : 150
    }

    // No tax field
    const totalPrice = discountedPrice + shippingPrice

    return { itemsPrice, discount, discountedPrice, shippingPrice, totalPrice, currentDiscountType, itemCount }
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    // Validate email
    if (!email || !email.trim()) {
      toast.warning('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.warning('Please enter a valid email address')
      return
    }

    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.region) {
      toast.warning('Please fill all shipping address fields')
      return
    }

    setLoading(true)

    try {
      const { itemsPrice, discount, shippingPrice, totalPrice, currentDiscountType } = calculatePrices()

      // Create order items from buy now or cart
      let orderItems
      if (buyNowItem) {
        // Buy now mode - only include the selected item
        orderItems = [{
          product: buyNowItem.product._id,
          name: buyNowItem.name,
          image: buyNowItem.image,
          price: buyNowItem.price,
          quantity: buyNowItem.quantity,
          size: buyNowItem.size,
          color: buyNowItem.color
        }]
      } else {
        // Cart mode - filter out items with deleted products
        orderItems = cart.items.filter(item => item.product).map(item => ({
          product: item.product._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }))
      }

      // Determine discount code based on discount type
      let discountCode = null
      let finalDiscount = 0
      if (currentDiscountType === 'valentine') {
        discountCode = 'VALENTINE20'
        finalDiscount = discount
      } else if (currentDiscountType === 'welcome' && isAuthenticated) {
        discountCode = 'WELCOME10'
        finalDiscount = discount
      }

      // Create order on backend (now creates PhonePe payment)
      const orderResponse = await axios.post(API_ENDPOINTS.CREATE_PAYMENT, {
        orderItems,
        shippingAddress,
        itemsPrice,
        discount: finalDiscount,
        discountCode: discountCode,
        shippingPrice,
        totalPrice,
        email: email  // Mandatory email for both guest and logged-in users
      })

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || 'Failed to create order')
        setLoading(false)
        return
      }

      const { order, redirectUrl, merchantTransactionId } = orderResponse.data

      // Check if PhonePe checkout bundle is loaded
      if (window.PhonePeCheckout && typeof window.PhonePeCheckout.transact === 'function') {
        // Open payment in iframe (modal-like experience)
        window.PhonePeCheckout.transact({
          tokenUrl: redirectUrl,
          type: "IFRAME",
          callback: async function(response) {

            // PhonePe callback returns only 'USER_CANCEL' or 'CONCLUDED'
            // It does NOT tell you if payment succeeded or failed
            if (response === 'USER_CANCEL') {
              toast.info('Payment cancelled')
              setLoading(false)
              return
            }

            if (response === 'CONCLUDED') {
              // Payment reached terminal state - need to verify status with backend

              try {
                // Check payment status from backend
                const statusResponse = await axios.get(
                  API_ENDPOINTS.CHECK_PAYMENT_STATUS(merchantTransactionId)
                )

                if (statusResponse.data.success && statusResponse.data.order &&
                    statusResponse.data.order.paymentStatus === 'Paid') {
                  // Payment successful
                  try {
                    // Save address to profile if checkbox was checked and it's a new address (authenticated users only)
                    if (isAuthenticated && saveAddress && useNewAddress) {
                      try {
                        await axios.post(API_ENDPOINTS.ADD_ADDRESS, {
                          ...shippingAddress,
                          isDefault: makeDefault
                        })
                        toast.success('Payment successful! Address saved to your profile.')
                      } catch (error) {
                        console.error('Error saving address:', error)
                        toast.success('Payment successful! Your order has been placed.')
                      }
                    } else {
                      toast.success('Payment successful! Your order has been placed.')
                    }

                    // Redirect based on user type
                    if (isAuthenticated) {
                      // Authenticated users: go to order details
                      navigate(`/orders/${order._id}`)
                    } else {
                      // Guest users: show confirmation message and redirect to home
                      toast.success(`Order confirmed! Transaction ID: ${merchantTransactionId}. Please save this for reference.`, {
                        autoClose: 10000
                      })
                      setTimeout(() => {
                        navigate('/')
                      }, 3000)
                    }
                  } catch (error) {
                    console.error('Post-payment error:', error)
                    toast.success('Payment successful! Your order has been placed.')
                    navigate(`/orders/${order._id}`)
                  }
                } else {
                  // Payment failed or pending
                  const status = statusResponse.data.paymentStatus || 'Unknown'
                  console.error('Payment not successful. Status:', status)
                  toast.error(`Payment ${status.toLowerCase()}. Please check your order status.`)
                }
              } catch (error) {
                console.error('Error checking payment status:', error)
                toast.error('Unable to verify payment status. Please check your orders page.')
              }

              setLoading(false)
            }
          }
        })
      } else {
        // Fallback: redirect if PhonePe bundle not loaded
        console.warn('PhonePe checkout bundle not loaded, redirecting...')
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  // Don't render if no items (either from buy now or cart)
  if (!buyNowItem && (!cart || cart.items.length === 0)) {
    return null
  }

  const { itemsPrice, discount, shippingPrice, totalPrice, currentDiscountType, itemCount } = calculatePrices()

  return (
    <>
      <Navbar />
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutContent}>
          <h1 className={styles.pageTitle}>Checkout</h1>

          <div className={styles.checkoutLayout}>
            {/* Shipping Form */}
            <div className={styles.shippingSection}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>

              {/* Guest Checkout Banner - Only show if no discount applied */}
              {!isAuthenticated && !currentDiscountType && (
                <div className={styles.guestBanner}>
                  <p className={styles.guestBannerText}>
                    {valentineActive ? (
                      <>💕 <strong>Valentine's Special!</strong> Get 20% off when you buy 2+ items! Login to track your orders.</>
                    ) : (
                      <><strong>Login or create an account</strong> to get 10% off your first order and track your orders!</>
                    )}
                  </p>
                </div>
              )}

              {/* Saved Addresses - Only for authenticated users */}
              {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                <div className={styles.savedAddressesSection}>
                  <h3 className={styles.subTitle}>Select Address</h3>
                  <div className={styles.addressOptions}>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`${styles.addressOption} ${
                          selectedAddressId === addr._id ? styles.selectedAddress : ''
                        }`}
                        onClick={() => handleAddressSelect(addr._id)}
                      >
                        <div className={styles.radioButton}>
                          {selectedAddressId === addr._id && (
                            <div className={styles.radioInner}></div>
                          )}
                        </div>
                        <div className={styles.addressInfo}>
                          <p className={styles.addressName}>{addr.fullName}</p>
                          <p className={styles.addressLine}>{addr.address}</p>
                          <p className={styles.addressLine}>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className={styles.addressLine}>Phone: {addr.phone}</p>
                          {addr.isDefault && (
                            <span className={styles.defaultLabel}>Default</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.newAddressBtn}
                    onClick={() => {
                      setUseNewAddress(true)
                      setSelectedAddressId(null)
                      setShippingAddress({
                        fullName: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: ''
                      })
                    }}
                  >
                    + Use New Address
                  </button>
                </div>
              )}

              {/* Show form if using new address or no saved addresses */}
              {(useNewAddress || savedAddresses.length === 0 || !isAuthenticated) && (
                <>
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className={styles.backToSavedBtn}
                      onClick={() => {
                        setUseNewAddress(false)
                        const defaultAddr = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0]
                        if (defaultAddr) {
                          handleAddressSelect(defaultAddr._id)
                        }
                      }}
                    >
                      ← Use Saved Address
                    </button>
                  )}
                  <h3 className={styles.subTitle}>
                    {savedAddresses.length > 0 ? 'New Address' : 'Enter Address'}
                  </h3>
                </>
              )}

              <form onSubmit={handlePayment} className={styles.form}>
                {/* Email Field - Mandatory for everyone */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="your.email@example.com"
                    required
                    disabled={isAuthenticated && user && user.email} // Read-only for logged-in users with email
                  />
                  {!isAuthenticated && (
                    <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Required for order confirmation and updates
                    </small>
                  )}
                </div>

                {(useNewAddress || savedAddresses.length === 0 || !selectedAddressId || !isAuthenticated) && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                      />
                    </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Address *</label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    rows="3"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleInputChange}
                        className={styles.input}
                        pattern="[0-9]{6}"
                        maxLength="6"
                        required
                      />
                      {shippingAddress.pincode && shippingAddress.pincode.length === 6 && (
                        <small style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                          Delivery Region: <strong>{shippingAddress.region === 'delhi-ncr' ? 'Delhi-NCR (₹90 shipping)' : 'Rest of India (₹150 shipping)'}</strong>
                          {' • '}Free shipping on orders above ₹4,999
                        </small>
                      )}
                    </div>

                    {/* Save Address Checkboxes - Only for authenticated users */}
                    {isAuthenticated && (
                      <div className={styles.saveAddressSection}>
                        <div className={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            id="saveAddress"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className={styles.checkbox}
                          />
                          <label htmlFor="saveAddress" className={styles.checkboxLabel}>
                            Save this address to my profile
                          </label>
                        </div>

                        {saveAddress && (
                          <div className={styles.checkboxGroup}>
                            <input
                              type="checkbox"
                              id="makeDefault"
                              checked={makeDefault}
                              onChange={(e) => setMakeDefault(e.target.checked)}
                              className={styles.checkbox}
                            />
                            <label htmlFor="makeDefault" className={styles.checkboxLabel}>
                              Make this my default address
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className={styles.paymentBtn}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>

              <div className={styles.orderItems}>
                {buyNowItem ? (
                  // Show buy now item
                  <div className={styles.orderItem}>
                    <img src={buyNowItem.image} alt={buyNowItem.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{buyNowItem.name}</p>
                      {buyNowItem.size && <p className={styles.itemSize}>Size: {buyNowItem.size}</p>}
                      {buyNowItem.color && ((buyNowItem.product?.colorVariants?.length > 1) || (buyNowItem.product?.colors?.length > 1)) && <p className={styles.itemColor}>Color: {buyNowItem.color}</p>}
                      <p className={styles.itemQuantity}>Qty: {buyNowItem.quantity}</p>
                    </div>
                    <p className={styles.itemPrice}>Rs.{(buyNowItem.price * buyNowItem.quantity).toFixed(2)}</p>
                  </div>
                ) : (
                  // Show cart items
                  cart.items.filter(item => item.product).map((item) => (
                    <div key={item._id} className={styles.orderItem}>
                      <img src={item.image} alt={item.name} className={styles.itemImage} />
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        {item.size && <p className={styles.itemSize}>Size: {item.size}</p>}
                        {item.color && ((item.product?.colorVariants?.length > 1) || (item.product?.colors?.length > 1)) && <p className={styles.itemColor}>Color: {item.color}</p>}
                        <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                      </div>
                      <p className={styles.itemPrice}>Rs.{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Items Price</span>
                  <span>Rs.{itemsPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && currentDiscountType && (
                  <div className={styles.priceRow} style={{ color: currentDiscountType === 'valentine' ? '#e91e63' : '#28a745' }}>
                    <span>{currentDiscountType === 'valentine' ? "Valentine's Offer (20%)" : 'First Order Discount (10%)'}</span>
                    <span>-Rs.{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.priceRow}>
                  <span>Shipping ({shippingAddress.region === 'delhi-ncr' ? 'Delhi-NCR' : 'Rest of India'})</span>
                  <span>{shippingPrice === 0 ? 'FREE' : `Rs.${shippingPrice.toFixed(2)}`}</span>
                </div>
                {shippingPrice > 0 && (
                  <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '0.5rem', display: 'block' }}>
                    Add Rs.{(4999 - (itemsPrice - discount) + 1).toFixed(0)} more for FREE shipping
                  </small>
                )}
                <div className={styles.divider}></div>
                <div className={styles.priceRow + ' ' + styles.totalRow}>
                  <span>Total</span>
                  <span>Rs.{totalPrice.toFixed(2)}</span>
                </div>
                {isTestAccount && (
                  <div className={styles.priceRow} style={{ color: '#ff9800', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    <span>Test Admin Amount</span>
                    <span>Rs.1.00</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Checkout
