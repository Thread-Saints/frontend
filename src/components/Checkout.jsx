import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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
  }, [isAuthenticated, cart, navigate])

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

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const calculatePrices = () => {
    const itemsPrice = getCartTotal()
    const shippingPrice = itemsPrice > 1000 ? 0 : 50 // Free shipping above Rs. 1000
    const taxPrice = Math.round(itemsPrice * 0.18) // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice

    return { itemsPrice, shippingPrice, taxPrice, totalPrice }
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      alert('Please fill all shipping address fields')
      return
    }

    setLoading(true)

    try {
      const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices()

      // Create order items from cart
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      }))

      // Create order on backend
      const orderResponse = await axios.post(API_ENDPOINTS.CREATE_ORDER, {
        orderItems,
        shippingAddress,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      })

      if (!orderResponse.data.success) {
        alert(orderResponse.data.message || 'Failed to create order')
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
              alert('Payment successful! Your order has been placed.')
              navigate(`/orders/${order._id}`)
            } else {
              alert('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed')
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
            alert('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculatePrices()

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
              <form onSubmit={handlePayment} className={styles.form}>
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
                {cart.items.map((item) => (
                  <div key={item._id} className={styles.orderItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{item.name}</p>
                      {item.size && <p className={styles.itemSize}>Size: {item.size}</p>}
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
