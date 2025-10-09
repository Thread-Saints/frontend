import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './components/Home'
import Page2 from './components/Page2'
import Admin from './components/Admin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <div>
              <Home />
              {/* <div style={{ height: '50vh' }}></div> */}
              <Page2 />
            </div>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
