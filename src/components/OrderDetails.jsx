import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import styles from './OrderDetails.module.css'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchOrderDetails()
  }, [id, isAuthenticated, navigate])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.GET_ORDER_BY_ID(id))
      if (response.data.success) {
        setOrder(response.data.order)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Order not found')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Processing':
        return '#ffa500'
      case 'Shipped':
        return '#2196f3'
      case 'Delivered':
        return '#4caf50'
      case 'Cancelled':
      case 'Payment Failed':
        return '#f44336'
      default:
        return '#ffffff'
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading order details...</p>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Order not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.orderDetailsContainer}>
        <div className={styles.orderDetailsContent}>
          <Link to="/orders" className={styles.backLink}>
            ← Back to Orders
          </Link>

          <div className={styles.orderHeader}>
            <div>
              <h1 className={styles.orderNumber}>Order #{order.orderNumber}</h1>
              <p className={styles.orderDate}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={styles.statusBadges}>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
              >
                {order.orderStatus}
              </span>
              <span
                className={styles.paymentBadge}
                style={{ backgroundColor: order.paymentStatus === 'Paid' ? '#4caf50' : '#f44336' }}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className={styles.orderLayout}>
            {/* Order Items */}
            <div className={styles.orderSection}>
              <h2 className={styles.sectionTitle}>Order Items</h2>
              <div className={styles.orderItems}>
                {order.orderItems.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <Link to={`/product/${item.product._id}`} className={styles.itemImageContainer}>
                      <img src={item.image} alt={item.name} className={styles.itemImage} />
                    </Link>
                    <div className={styles.itemDetails}>
                      <Link to={`/product/${item.product._id}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      {item.size && <p className={styles.itemSize}>Size: {item.size}</p>}
                      <p className={styles.itemPrice}>Rs.{item.price} × {item.quantity}</p>
                    </div>
                    <p className={styles.itemTotal}>Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className={styles.orderSection}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.addressCard}>
                <p className={styles.addressName}>{order.shippingAddress.fullName}</p>
                <p className={styles.addressPhone}>{order.shippingAddress.phone}</p>
                <p className={styles.addressLine}>{order.shippingAddress.address}</p>
                <p className={styles.addressLine}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className={styles.orderSection}>
              <h2 className={styles.sectionTitle}>Price Summary</h2>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>Rs.{order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Shipping</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : `Rs.${order.shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Tax</span>
                  <span>Rs.{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.priceRow + ' ' + styles.totalRow}>
                  <span>Total</span>
                  <span>Rs.{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {order.paymentInfo.razorpayPaymentId && (
              <div className={styles.orderSection}>
                <h2 className={styles.sectionTitle}>Payment Information</h2>
                <div className={styles.paymentInfo}>
                  <p className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Payment ID:</span>
                    <span className={styles.paymentValue}>{order.paymentInfo.razorpayPaymentId}</span>
                  </p>
                  <p className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Order ID:</span>
                    <span className={styles.paymentValue}>{order.paymentInfo.razorpayOrderId}</span>
                  </p>
                  {order.paidAt && (
                    <p className={styles.paymentRow}>
                      <span className={styles.paymentLabel}>Paid At:</span>
                      <span className={styles.paymentValue}>
                        {new Date(order.paidAt).toLocaleString('en-IN')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetails
