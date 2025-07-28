import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {error ? (
          <div className="error-card">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Profile Information</h3>
              <div className="profile-info">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Server Response</h3>
              <div className="server-info">
                <p><strong>Message:</strong> {dashboardData?.message}</p>
                <p><strong>Server Time:</strong> {new Date(dashboardData?.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="status-success">Connected</span></p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-button">
                  Update Profile
                </button>
                <button className="action-button">
                  Change Password
                </button>
                <button className="action-button">
                  View Settings
                </button>
                <button className="action-button">
                  Help & Support
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">Just now</span>
                  <span className="activity-text">Logged into dashboard</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">Today</span>
                  <span className="activity-text">Account created</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;