import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [serverData, setServerData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test API connection
    Promise.all([
      fetch('/api/test').then(res => res.json()),
      fetch('/api/health').then(res => res.json())
    ])
    .then(([testData, healthData]) => {
      setServerData(testData)
      setHealthData(healthData)
      setLoading(false)
    })
    .catch(error => {
      console.error('API Error:', error)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading...</h2>
          <p>Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Full-Stack Vite + Express App</h1>
        <p>Frontend served by Express backend</p>
      </div>

      <div className="cards">
        <div className="card">
          <h2>Server Connection</h2>
          {serverData ? (
            <div className="status success">
              <p><strong>Status:</strong> Connected ✅</p>
              <p><strong>Message:</strong> {serverData.message}</p>
              <p><strong>Deployment:</strong> {serverData.deployment || 'Local'}</p>
              <p><strong>Time:</strong> {new Date(serverData.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <div className="status error">
              <p>❌ Connection failed</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Health Check</h2>
          {healthData ? (
            <div className="status success">
              <p><strong>Status:</strong> {healthData.status}</p>
              <p><strong>Environment:</strong> {healthData.environment}</p>
              <p><strong>Port:</strong> {healthData.port}</p>
              <p><strong>Time:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <div className="status error">
              <p>❌ Health check failed</p>
            </div>
          )}
        </div>
      </div>

      <div className="info">
        <h3>Project Structure</h3>
        <ul>
          <li><strong>Frontend:</strong> React + Vite in <code>/client</code></li>
          <li><strong>Backend:</strong> Express.js in <code>/server</code></li>
          <li><strong>Build:</strong> <code>heroku-postbuild</code> script builds frontend</li>
          <li><strong>Deploy:</strong> Express serves <code>client/dist</code> with SPA routing</li>
        </ul>
      </div>
    </div>
  )
}

export default App
