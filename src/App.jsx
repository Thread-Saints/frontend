import './App.css'
import { AuthProvider } from './context/AuthContext'
import Home from './components/Home'
import Page2 from './components/Page2'

function App() {
  return (
    <AuthProvider>
      <div>
        <Home />
        {/* <div style={{ height: '50vh' }}></div> */}
        <Page2 />
      </div>
    </AuthProvider>
  )
}

export default App
