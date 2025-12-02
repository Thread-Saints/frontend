import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import styles from './Checkout.module.css'

function Checkout() {
  const navigate = useNavigate()
  const { cart, getCartTotal, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState('')
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountChecked, setDiscountChecked] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [saveAddress, setSaveAddress] = useState(false)
  const [makeDefault, setMakeDefault] = useState(false)

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/cart')
    }

    if (!cart || cart.items.length === 0) {
      navigate('/cart')
    }

    fetchRazorpayKey()
    checkDiscountEligibility()
    fetchSavedAddresses()
  }, [isAuthenticated, cart, navigate])

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
          setShippingAddress({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode
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
      setShippingAddress({
        fullName: selected.fullName,
        phone: selected.phone,
        address: selected.address,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode
      })
    }
  }

  const fetchRazorpayKey = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_RAZORPAY_KEY)
      if (response.data.success) {
        setRazorpayKey(response.data.key)
      }
    } catch (error) {
      console.error('Error fetching Razorpay key:', error)
    }
  }

  const checkDiscountEligibility = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_DISCOUNT_ELIGIBILITY)
      if (response.data.success && response.data.eligible) {
        setHasDiscount(true)
        toast.success('10% Welcome Discount Applied! 🎉')
      }
      setDiscountChecked(true)
    } catch (error) {
      console.error('Error checking discount eligibility:', error)
      setDiscountChecked(true)
    }
  }

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const calculatePrices = () => {
    const itemsPrice = getCartTotal()
    const discount = hasDiscount ? Math.round(itemsPrice * 0.10) : 0 // 10% discount
    const discountedPrice = itemsPrice - discount
    const shippingPrice = discountedPrice > 1000 ? 0 : 50 // Free shipping above Rs. 1000
    const taxPrice = Math.round(discountedPrice * 0.18) // 18% GST
    const totalPrice = discountedPrice + shippingPrice + taxPrice

    return { itemsPrice, discount, discountedPrice, shippingPrice, taxPrice, totalPrice }
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.warning('Please fill all shipping address fields')
      return
    }

    setLoading(true)

    try {
      const { itemsPrice, discount, discountedPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices()

      // Create order items from cart (filter out items with deleted products)
      const orderItems = cart.items.filter(item => item.product).map(item => ({
        product: item.product._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))

      // Create order on backend
      const orderResponse = await axios.post(API_ENDPOINTS.CREATE_ORDER, {
        orderItems,
        shippingAddress,
        itemsPrice,
        discount,
        discountCode: hasDiscount ? 'WELCOME10' : null,
        shippingPrice,
        taxPrice,
        totalPrice
      })

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || 'Failed to create order')
        setLoading(false)
        return
      }

      const { order, razorpayOrder } = orderResponse.data

      // Initialize Razorpay payment
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Thread Saints',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(API_ENDPOINTS.VERIFY_PAYMENT, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id
            })

            if (verifyResponse.data.success) {
              // Save address to profile if checkbox was checked and it's a new address
              if (saveAddress && useNewAddress) {
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
              navigate(`/orders/${order._id}`)
            } else {
              toast.error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
          }
          setLoading(false)
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const { itemsPrice, discount, shippingPrice, taxPrice, totalPrice } = calculatePrices()

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

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && !useNewAddress && (
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
              {(useNewAddress || savedAddresses.length === 0) && (
                <>
                  {savedAddresses.length > 0 && (
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
                {(useNewAddress || savedAddresses.length === 0 || !selectedAddressId) && (
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
                        required
                      />
                    </div>

                    {/* Save Address Checkboxes */}
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
                {cart.items.filter(item => item.product).map((item) => (
                  <div key={item._id} className={styles.orderItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{item.name}</p>
                      {item.size && <p className={styles.itemSize}>Size: {item.size}</p>}
                      {item.color && <p className={styles.itemColor}>Color: {item.color}</p>}
                      <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                    </div>
                    <p className={styles.itemPrice}>Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>Rs.{itemsPrice.toFixed(2)}</span>
                </div>
                {hasDiscount && discount > 0 && (
                  <div className={styles.priceRow} style={{ color: '#28a745' }}>
                    <span>First Order Discount (10%)</span>
                    <span>-Rs.{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.priceRow}>
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'FREE' : `Rs.${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Tax (18% GST)</span>
                  <span>Rs.{taxPrice.toFixed(2)}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.priceRow + ' ' + styles.totalRow}>
                  <span>Total</span>
                  <span>Rs.{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Checkout
