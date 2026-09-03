import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HomeOutlined, UserOutlined, AppstoreOutlined, AimOutlined, FileTextOutlined } from '@ant-design/icons'

// Modern Color Palette - Industrial/Professional (Same as Admin)
const colors = {
  // Sidebar
  sidebarBg: '#1a1f2e',
  sidebarText: '#e4e6eb',
  sidebarHover: '#252b3d',
  sidebarActive: '#2d3548',
  sidebarBorder: '#34495e',
  accent: '#ff6b35',
  accentHover: '#ff8555',
  
  // Content Area
  contentBg: '#f5f7fa',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Text
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  
  // Borders
  border: '#e5e7eb',
  borderDark: '#d1d5db'
}

// Styles
const styles = `
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: #1a1f2e !important;
    line-height: 1;
  }
  
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #1a1f2e;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #1a1f2e;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    line-height: 1;
  }

  /* Sidebar Styles */
  .sidebar {
    width: 260px;
    background: #1a1f2e;
    border: none;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 100;
    overflow-y: auto;
    box-shadow: none;
    margin: 0;
    padding: 0;
    border-right: 1px solid #2d3548;
    box-sizing: border-box;
    transform: translateZ(0);
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid ${colors.sidebarBorder};
  }

  .brand-title {
    font-size: 16px;
    font-weight: 700;
    color: ${colors.sidebarText};
    letter-spacing: -0.3px;
    line-height: 1.3;
    word-wrap: break-word;
    hyphens: auto;
  }

  .brand-subtitle {
    font-size: 11px;
    color: ${colors.textLight};
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .menu {
    flex: 1;
    padding: 16px 12px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: ${colors.sidebarText};
    text-decoration: none;
    border-radius: 8px;
    margin-bottom: 6px;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
    position: relative;
  }

  .menu-item:hover {
    background: ${colors.sidebarHover};
    color: ${colors.accentHover};
  }

  .menu-item.active {
    background: ${colors.sidebarActive};
    color: ${colors.accent};
    box-shadow: inset 3px 0 0 ${colors.accent};
  }

  .menu-item .anticon {
    font-size: 18px;
    margin-right: 12px;
  }

  /* Main Content Styles */
  .admin-content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: calc(100% - 260px);
    position: relative;
    overflow: hidden;
    padding: 0;
    margin: 0 0 0 260px;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 32px 12px 24px;
    background: #1a1f2e;
    border: none;
    position: fixed;
    top: 0;
    left: 260px;
    right: 0;
    z-index: 90;
    height: 64px;
    box-shadow: none;
    margin: 0;
    width: calc(100% - 260px);
    border-bottom: 1px solid #2d3548;
    border-left: none;
    border-radius: 0;
    box-sizing: border-box;
  }

  .topbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #e4e6eb;
    margin-left: 8px;
  }

  .icon-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #e4e6eb;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  .user-info-section {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px 6px 6px;
    border-radius: 8px;
    border: 1px solid #2d3548;
    height: 40px;
    transition: all 0.2s;
  }
  
  .user-info-section:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .user-info-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e4e6eb;
  }

  .user-info-text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .user-role {
    font-size: 10px;
    font-weight: 600;
    color: #ff6b35;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1;
  }

  .user-name {
    font-size: 12px;
    font-weight: 500;
    color: #e4e6eb;
    line-height: 1.2;
  }

  .logout-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background: #ff6b35;
    color: white;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logout-btn:hover {
    background: #ff8555;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }

  .modal-message {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .modal-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .modal-btn-cancel {
    background: #f3f4f6;
    color: #6b7280;
  }

  .modal-btn-cancel:hover {
    background: #e5e7eb;
  }

  .modal-btn-confirm {
    background: #ef4444;
    color: white;
  }

  .modal-btn-confirm:hover {
    background: #dc2626;
  }

  .main-content {
    padding-top: 80px;
    min-height: calc(100vh - 80px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      width: 220px;
    }
    
    .admin-content {
      margin-left: 220px;
      width: calc(100% - 220px);
    }
    
    .topbar {
      left: 220px;
      width: calc(100% - 220px);
      padding: 12px 20px;
    }
    
    .topbar-title {
      font-size: 16px;
    }
  }

  @media (max-width: 576px) {
    .sidebar {
      width: 200px;
    }
    
    .admin-content {
      margin-left: 200px;
      width: calc(100% - 200px);
    }
    
    .topbar {
      left: 200px;
      width: calc(100% - 200px);
    }
    
    .brand-title {
      font-size: 18px;
    }
    
    .menu-item {
      font-size: 13px;
      padding: 10px 14px;
    }
  }
`

export default function OperatorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [displayRole, setDisplayRole] = useState(() => {
    try { return localStorage.getItem('role') || 'operator' } catch { return 'operator' }
  })
  const [displayUsername, setDisplayUsername] = useState(() => {
    try { return localStorage.getItem('username') || 'user' } catch { return 'user' }
  })

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const onLogout = () => {
    try {
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
    } catch {}
    navigate('/')
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  useEffect(() => {
    let abort = false
    const userId = (() => { try { return localStorage.getItem('userId') || '' } catch { return '' } })()
    if (!userId) return
    ;(async () => {
      try {
        const res = await fetch(`/users/${userId}`)
        if (!res.ok) return
        const user = await res.json()
        if (abort) return
        const username = (user?.username ?? '').toString().trim()
        const role = (user?.role ?? '').toString().toLowerCase()
        if (username) {
          setDisplayUsername(username)
          try { localStorage.setItem('username', username) } catch {}
        }
        if (role) {
          setDisplayRole(role)
          try { localStorage.setItem('role', role) } catch {}
        }
      } catch {}
    })()
    return () => { abort = true }
  }, [])

  return (
    <div className="admin-layout">
      <style>{styles}</style>
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-title">Gauge Inventory Management</div>
          <div className="brand-subtitle">Operator Panel</div>
        </div>

        <nav className="menu">
          <NavLink
            to="gauge-inventory"
            className={({isActive}) => {
              const onOperatorHome = location.pathname === '/operator'
              return `menu-item${(isActive || onOperatorHome) ? ' active' : ''}`
            }}
          >
            <AppstoreOutlined />
            <span>Gauge Inventory</span>
          </NavLink>
          <NavLink to="gauge-tracker" className={({isActive}) => `menu-item${isActive ? ' active' : ''}`}>
            <AimOutlined />
            <span>Gauge Tracker</span>
          </NavLink>
          <NavLink to="calibration-report" className={({isActive}) => `menu-item${isActive ? ' active' : ''}`}>
            <FileTextOutlined />
            <span>Calibration Report</span>
          </NavLink>
        </nav>
      </aside>

      <div className="topbar">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="user-info-section">
            <div className="user-info-icon">
              <UserOutlined />
            </div>
            <div className="user-info-text">
              <span className="user-role">{(displayRole || 'operator').toUpperCase()}</span>
              <span className="user-name">{displayUsername || 'user'}</span>
            </div>
          </div>
          <button className="logout-btn" type="button" onClick={handleLogoutClick}>Logout</button>
        </div>
      </div>
      
      <main className="admin-content">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-message">Are you sure you want to logout? You will need to sign in again to access the system.</p>
            <div className="modal-buttons">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-confirm" 
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}