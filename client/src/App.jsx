import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

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
      
      if (response.ok) {
        setMessage(`✅ ${data.message} - Welcome ${data.user.email}!`)
      } else {
        setMessage(`❌ Login failed: ${data.message}`)
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testHealthCheck = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setMessage(`🚀 Server health: ${data.status} (Port: ${data.port})`)
    } catch (error) {
      setMessage(`❌ Health check failed: ${error.message}`)
    }
  }

  return (
    <div className="App">
      <div className="container">
        <h1>🚂 Railway Fullstack App</h1>
        <p>Vite + React frontend with Express backend</p>
        
        <div className="card">
          <h2>Login Test</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="card">
          <button onClick={testHealthCheck} className="secondary">
            Test Server Health
          </button>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App