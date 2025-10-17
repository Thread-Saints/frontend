import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBox } from 'react-icons/fa'
import axios from 'axios'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'
import styles from './Orders.module.css'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchOrders()
  }, [isAuthenticated, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.GET_ORDERS)
      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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
          <p className={styles.loadingText}>Loading orders...</p>
        </div>
      </>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyOrders}>
          <FaBox className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>Start shopping to see your orders here!</p>
          <Link to="/" className={styles.shopNowBtn}>
            Shop Now
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.ordersContainer}>
        <div className={styles.ordersContent}>
          <h1 className={styles.pageTitle}>My Orders</h1>

          <div className={styles.ordersList}>
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className={styles.orderCard}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderNumber}>
                      Order #{order.orderNumber}
                    </h3>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <p className={styles.moreItems}>
                      +{order.orderItems.length - 3} more item(s)
                    </p>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    <span className={styles.totalLabel}>Total Amount:</span>
                    <span className={styles.totalAmount}>Rs.{order.totalPrice.toFixed(2)}</span>
                  </div>
                  <span className={styles.viewDetails}>View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Orders
