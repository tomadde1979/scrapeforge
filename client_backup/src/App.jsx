import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [healthData, setHealthData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthData(data)
      setMessage('Server connection successful!')
    } catch (error) {
      setMessage(`Connection error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <h1>Vite + Express Fullstack</h1>
        <p>Frontend served by Express.js backend</p>
        
        <div className="card">
          <h2>Server Status</h2>
          {healthData ? (
            <div className="status-info">
              <div className="status-item">
                <strong>Status:</strong> {healthData.status}
              </div>
              <div className="status-item">
                <strong>Environment:</strong> {healthData.environment}
              </div>
              <div className="status-item">
                <strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <p>Loading server status...</p>
          )}
          
          <button onClick={checkHealth} disabled={isLoading} className="refresh-btn">
            {isLoading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="info">
          <h3>Project Structure</h3>
          <ul>
            <li><strong>Frontend:</strong> Vite + React in <code>/client</code></li>
            <li><strong>Backend:</strong> Express.js in root directory</li>
            <li><strong>Build:</strong> Vite builds to <code>/client/dist</code></li>
            <li><strong>Serving:</strong> Express serves static files with SPA fallback</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App