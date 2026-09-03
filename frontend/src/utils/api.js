// API utility functions for authentication

// Get the stored JWT token
export const getToken = () => {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

// Check if user is authenticated  
export const isAuthenticated = () => {
  const token = getToken()
  return !!token
}

// Create headers with Authorization token
export const getAuthHeaders = (contentType = 'application/json') => {
  const token = getToken()
  const headers = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  
  return headers
}

// Make authenticated API request
export const apiRequest = async (url, options = {}) => {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }
  
  const response = await fetch(url, mergedOptions)
  
  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    window.location.href = '/'
    throw new Error('Authentication expired')
  }
  
  return response
}

// API methods object
export const api = {
  get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url, data, options = {}) => apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' })
}