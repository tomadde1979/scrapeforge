import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setUser(data.user)
        setMessage(`Login successful! Welcome ${data.user.name}`)
        setEmail('')
        setPassword('')
      } else {
        setMessage(`Login failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setMessage('Logged out successfully')
  }

  const testHealthCheck = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setMessage(`Server Status: ${data.status} | Environment: ${data.environment} | Port: ${data.port}`)
    } catch (error) {
      setMessage(`Health check failed: ${error.message}`)
    }
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Railway Fullstack App</h1>
        <p>Vite + React frontend with Express backend</p>
        
        {user ? (
          <div className="card user-info">
            <h2>Welcome back!</h2>
            <div className="user-details">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <button onClick={testHealthCheck} className="secondary">
            Check Server Health
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('successful') || message.includes('Status: OK') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="info">
          <h3>API Endpoints</h3>
          <ul>
            <li><code>POST /api/auth/login</code> - Mock login endpoint</li>
            <li><code>GET /api/health</code> - Server health check</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App