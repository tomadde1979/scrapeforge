import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectResults, setProjectResults] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    platforms: [],
    keywords: '',
    domains: '',
    includeFollowers: false,
    includeCommenters: false,
    useHeadlessMode: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (projectsRes.ok && statsRes.ok) {
        const [projectsData, statsData] = await Promise.all([
          projectsRes.json(),
          statsRes.json()
        ]);
        setProjects(projectsData);
        setStats(statsData);
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newProject.name.trim()) {
      alert('Please enter a project name');
      return;
    }
    if (newProject.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        const project = await response.json();
        setProjects([project, ...projects]);
        setShowCreateModal(false);
        setNewProject({
          name: '',
          description: '',
          platforms: [],
          keywords: '',
          domains: '',
          includeFollowers: false,
          includeCommenters: false,
          useHeadlessMode: true
        });
        alert(`Project "${project.name}" created successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to create project: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Create project error:', error);
      alert('Network error while creating project. Please try again.');
    }
  };

  const handleStartScraping = async (projectId, platforms) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/start-scraping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platforms })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Scraping started:', result);
        fetchDashboardData(); // Refresh data
        alert(`Scraping started successfully for ${platforms.join(', ')}!`);
      } else {
        const errorData = await response.json();
        console.error('Scraping failed:', errorData);
        alert(`Failed to start scraping: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Start scraping error:', error);
      alert('Network error while starting scraping. Please try again.');
    }
  };

  const viewProjectResults = async (project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const results = await response.json();
        setProjectResults(results);
        setSelectedProject(project);
      }
    } catch (error) {
      console.error('Fetch results error:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading ScrapeForge dashboard...</p>
      </div>
    );
  }

  return (
    <div className="scrapeforge-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>🔥 ScrapeForge</h1>
          <p>Email scraping dashboard - {user?.email}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowCreateModal(true)} className="create-project-btn">
            + New Project
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
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
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3>{stats.activeProjects}</h3>
                    <p>Active Projects</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📧</div>
                  <div className="stat-content">
                    <h3>{stats.emailsFound}</h3>
                    <p>Emails Found</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>{stats.profilesScanned}</h3>
                    <p>Profiles Scanned</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <h3>{stats.successRate}%</h3>
                    <p>Success Rate</p>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            <section className="projects-section">
              <h2>Scraping Projects</h2>
              {projects.length === 0 ? (
                <div className="empty-state">
                  <h3>No projects yet</h3>
                  <p>Create your first scraping project to get started</p>
                  <button onClick={() => setShowCreateModal(true)} className="create-first-project-btn">
                    Create First Project
                  </button>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge ${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="project-description">{project.description}</p>
                      <div className="project-details">
                        <div className="detail-item">
                          <strong>Platforms:</strong> {project.platforms.join(', ')}
                        </div>
                        <div className="detail-item">
                          <strong>Keywords:</strong> {project.keywords}
                        </div>
                        <div className="detail-item">
                          <strong>Mode:</strong> {project.useHeadlessMode ? 'Headless Browser' : 'API Mode'}
                        </div>
                      </div>
                      <div className="project-actions">
                        <button 
                          onClick={() => viewProjectResults(project)}
                          className="view-results-btn"
                        >
                          View Results
                        </button>
                        {project.status === 'active' && (
                          <button 
                            onClick={() => handleStartScraping(project.id, project.platforms)}
                            className="start-scraping-btn"
                          >
                            Start Scraping
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            {stats?.recentActivity && (
              <section className="activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <span className="activity-action">{activity.action}</span>
                        <span className="activity-project">{activity.project}</span>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Scraping Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-modal">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="project-form">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g., Fitness Influencers Campaign"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe your scraping goals..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-checkboxes">
                  {['instagram', 'linkedin', 'twitter', 'reddit'].map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newProject.platforms.includes(platform)}
                        onChange={(e) => {
                          const platforms = e.target.checked
                            ? [...newProject.platforms, platform]
                            : newProject.platforms.filter(p => p !== platform);
                          setNewProject({...newProject, platforms});
                        }}
                      />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={newProject.keywords}
                  onChange={(e) => setNewProject({...newProject, keywords: e.target.value})}
                  placeholder="fitness, health, wellness"
                />
              </div>
              <div className="form-group">
                <label>Target Domains</label>
                <input
                  type="text"
                  value={newProject.domains}
                  onChange={(e) => setNewProject({...newProject, domains: e.target.value})}
                  placeholder="@gmail.com, @company.com"
                />
              </div>
              <div className="form-group">
                <div className="checkbox-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newProject.includeFollowers}
                      onChange={(e) => setNewProject({...newProject, includeFollowers: e.target.checked})}
                    />
                    Include Followers
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newProject.includeCommenters}
                      onChange={(e) => setNewProject({...newProject, includeCommenters: e.target.checked})}
                    />
                    Include Commenters
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newProject.useHeadlessMode}
                      onChange={(e) => setNewProject({...newProject, useHeadlessMode: e.target.checked})}
                    />
                    Headless Browser Mode
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedProject && (
        <div className="modal-overlay">
          <div className="modal-content results-modal">
            <div className="modal-header">
              <h2>Results: {selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} className="close-modal">
                ×
              </button>
            </div>
            <div className="results-content">
              {projectResults.length === 0 ? (
                <p>No results found yet. Start scraping to see results here.</p>
              ) : (
                <div className="results-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Profile</th>
                        <th>Platform</th>
                        <th>Email</th>
                        <th>Source</th>
                        <th>Found</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectResults.map(result => (
                        <tr key={result.id}>
                          <td>{result.profileName}</td>
                          <td>{result.platform}</td>
                          <td>{result.email || 'N/A'}</td>
                          <td>{result.emailSource}</td>
                          <td>{new Date(result.foundAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;