// API Configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:5655',
  production: 'https://gauge-inventory.trycloudflare.com', // Your tunnel URL
  staging: 'https://staging-subdomain.trycloudflare.com'
}

// Detect environment
const getEnvironment = () => {
  if (import.meta.env.DEV) return 'development'
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development'
  }
  return 'production'
}

// Set API base URL
const API_BASE_URL = API_CONFIG[getEnvironment()]

if (typeof window !== 'undefined') {
  window.__API_BASE__ = window.__API_BASE__ || API_BASE_URL
  console.log(`API Base URL set to: ${window.__API_BASE__}`)
}

export default API_BASE_URL
