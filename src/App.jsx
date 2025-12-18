import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { useEffect } from 'react'
import { initGA, trackPageView } from './utils/analytics'
import Home from './components/Home'
import Page2 from './components/Page2'
import Page3 from './components/Page3'
import Page4 from './components/Page4'
// Page5 removed - split section now in Footer
import Categories from './components/Categories'
import CategoryProducts from './components/CategoryProducts'
import ProductDetails from './components/ProductDetails'
import Cart from './components/Cart'
import Wishlist from './components/Wishlist'
import Checkout from './components/Checkout'
import Orders from './components/Orders'
import OrderDetails from './components/OrderDetails'
import MyProfile from './components/MyProfile'
import Admin from './components/Admin'
import ExchangePolicy from './components/ExchangePolicy'
import ShippingPolicy from './components/ShippingPolicy'
import TermsAndConditions from './components/TermsAndConditions'
import ContactUs from './components/ContactUs'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import Footer2 from './components/Footer2'

// Component to track page views
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && measurementId !== 'G-9RQ074EKEV') {
      initGA(measurementId);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AnalyticsTracker />
            <Routes>
            <Route path="/" element={
              <>
                <Home />
                <Page2 />
                <Page3 />
                <Page4 />
                <Footer />
              </>
            } />
            <Route path="/categories" element={
              <>
                <Categories />
                <Footer2 />
              </>
            } />
            <Route path="/category/:name" element={
              <>
                <CategoryProducts />
                <Footer2 />
              </>
            } />
            <Route path="/product/:id" element={
              <>
                <ProductDetails />
                <Footer2 />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Cart />
                <Footer2 />
              </>
            } />
            <Route path="/wishlist" element={
              <>
                <Wishlist />
                <Footer2 />
              </>
            } />
            <Route path="/checkout" element={
              <>
                <Checkout />
                <Footer2 />
              </>
            } />
            <Route path="/orders" element={
              <>
                <Orders />
                <Footer2 />
              </>
            } />
            <Route path="/orders/:id" element={
              <>
                <OrderDetails />
                <Footer2 />
              </>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <MyProfile />
                  <Footer2 />
                </>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <>
                <ProtectedRoute adminOnly={true}>
                  <Admin />
                </ProtectedRoute>
                <Footer2 />
              </>
            } />
            <Route path="/exchange-policy" element={
              <>
                <ExchangePolicy />
                <Footer2 />
              </>
            } />
            <Route path="/shipping-policy" element={
              <>
                <ShippingPolicy />
                <Footer2 />
              </>
            } />
            <Route path="/terms-and-conditions" element={
              <>
                <TermsAndConditions />
                <Footer2 />
              </>
            } />
            <Route path="/contact" element={
              <>
                <ContactUs />
                <Footer2 />
              </>
            } />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            style={{ marginTop: '40px', zIndex: 999999 }}
          />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
