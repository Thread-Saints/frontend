import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Home from './components/Home'
import Page2 from './components/Page2'
import Page3 from './components/Page3'
import Page4 from './components/Page4'
import ProductDetails from './components/ProductDetails'
import Cart from './components/Cart'
import Wishlist from './components/Wishlist'
import Admin from './components/Admin'
import ProtectedRoute from './components/ProtectedRoute'

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
              <div>
                <Home />
                <Page2 />
                <Page3 />
                <Page4 />
              </div>
            } />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
