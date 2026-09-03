import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined, LoginOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const year = new Date().getFullYear()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    try { 
      localStorage.setItem('theme', 'light')
      // Clear any previous login data
      localStorage.removeItem('role')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
    } catch {}
  }, [])

  async function handleSubmit() {
    setError('')
    setMessage('')
    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: String(password).trim() }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))
      if (!res.ok) {
        const contentType = (res.headers.get('content-type') || '').toLowerCase()
        const raw = await res.text().catch(() => '')
        let msg = 'Login failed'
        if (contentType.includes('application/json')) {
          try {
            const j = raw ? JSON.parse(raw) : {}
            msg = j?.detail || j?.message || msg
          } catch {}
        } else if (raw) {
          msg = raw
        }
        if (res.status === 401) {
          msg = 'Incorrect username or password. Login failed. Please try again!'
        }
        throw new Error(msg)
      }
      const data = await res.json()
      if (data && data.success) {
        const role = (data.user?.role ?? data.role ?? (Array.isArray(data.user?.roles) ? data.user.roles[0] : undefined) ?? 'user').toString().toLowerCase()
        setMessage(`Welcome (${role})!`)
        
        // Persist user data and token in localStorage
        try {
          localStorage.setItem('role', role)
          // Store JWT token
          if (data.token) {
            localStorage.setItem('token', data.token)
          }
          const userId = (data.user?.id ?? data.id ?? '').toString()
          if (userId) localStorage.setItem('userId', userId)
          const persistedUsername = (
            data.user?.username ??
            data.user?.userName ??
            data.user?.name ??
            data.username ??
            data.userName ??
            data.name ??
            username ??
            ''
          )?.toString()?.trim()
          localStorage.setItem('username', persistedUsername || (username?.toString()?.trim() || ''))
        } catch {}
        
        // Navigate based on role
        if (role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/operator')
        }
      } else {
        throw new Error(data?.message || 'Invalid credentials')
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Unable to reach server. Please ensure the backend is running and try again.')
      } else {
        setError(typeof err?.message === 'string' ? err.message : 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          height: 100%;
          width: 100%;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 60px 100px 40px 40px;
          position: relative;
          background: #4a4a4a;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/login.png');
          background-size: cover;
          background-position: center left;
          background-repeat: no-repeat;
          opacity: 1;
          z-index: 0;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          position: relative;
          z-index: 2;
        }

        .login-header {
          background: white;
          padding: 32px 32px 24px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .login-title {
          font-size: 26px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 6px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .login-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .login-form {
          padding: 32px;
          background: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 16px;
          z-index: 2;
          pointer-events: none;
        }

        .eye-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 16px;
          cursor: pointer;
          z-index: 2;
          transition: color 0.2s;
        }

        .eye-icon:hover {
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 12px 44px 12px 44px;
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }

        .form-input:focus {
          border-color: #ff6b35;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .login-button {
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, #ff6b35 0%, #ff8555 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          padding: 20px 32px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .footer-text {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        .footer-version {
          font-size: 11px;
          color: #9ca3af;
        }

        @media (max-width: 992px) {
          .login-container {
            justify-content: center;
            align-items: center;
            padding: 24px;
          }

          .login-container::before {
            opacity: 0.4;
          }
        }

        @media (max-width: 576px) {
          .login-card {
            max-width: 100%;
          }

          .login-header {
            padding: 28px 24px 20px;
          }

          .login-form {
            padding: 28px 24px;
          }

          .login-title {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Gauge Inventory Management</h2>
            <p className="login-subtitle">Sign in to access the dashboard</p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">USERNAME</label>
              <div className="input-wrapper">
                <UserOutlined className="input-icon" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <div className="input-wrapper">
                <LockOutlined className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {showPassword ? (
                  <EyeInvisibleOutlined className="eye-icon" onClick={() => setShowPassword(false)} />
                ) : (
                  <EyeOutlined className="eye-icon" onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="alert alert-success">
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            <button type="button" onClick={handleSubmit} className="login-button" disabled={loading}>
              {loading ? (
                <>Logging in...</>
              ) : (
                <>
                  <LoginOutlined />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

  
        </div>
      </div>
    </>
  )
}