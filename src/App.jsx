import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
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
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import Footer2 from './components/Footer2'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '30px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{
              fontFamily: 'Rasputin, serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#333',
              letterSpacing: '1px'
            }}>COMING SOON</span>
          </div>
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
              <>
                <MyProfile />
                <Footer2 />
              </>
            } />
            <Route path="/admin" element={
              <>
                <ProtectedRoute adminOnly={true}>
                  <Admin />
                </ProtectedRoute>
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
