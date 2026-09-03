# Cloudflare Tunnel Setup Guide

## Prerequisites
1. Install Cloudflare CLI (`cloudflared`)
2. Login to Cloudflare account

## Setup Steps

### 1. Install cloudflared
```bash
# Windows (using PowerShell)
winget install --id Cloudflare.cloudflared

# Or download from: https://github.com/cloudflare/cloudflared/releases/latest
```

### 2. Login to Cloudflare
```bash
cloudflared tunnel login
```

### 3. Create a Tunnel
```bash
cloudflared tunnel create <tunnel-name>
```

### 4. Generate Configuration File
Replace the placeholders in `cloudflare-tunnel.yml`:
- `<your-tunnel-id>`: Use the ID from step 3
- `<path-to-credentials-file>`: Usually `%USERPROFILE%\.cloudflared\<tunnel-id>.json`
- `<your-subdomain>`: Choose a subdomain for your tunnel

### 5. Start the Tunnel
```bash
cloudflared tunnel run <tunnel-name>
```

## Frontend Configuration Updates

### Option 1: Update Vite Proxy (Development)
Update `frontend/vite.config.js` to use the tunnel URL:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3009,
    open: false,
    proxy: {
      '/api': {
        target: 'https://<your-subdomain>.trycloudflare.com',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'https://<your-subdomain>.trycloudflare.com',
        changeOrigin: true,
        secure: false
      },
      // ... other routes
    }
  }
})
```

### Option 2: Update Production API Base URL
Update `frontend/src/main.jsx` for production builds:

```javascript
// Replace line 28 with:
window.__API_BASE__ = window.__API_BASE__ || 'https://<your-subdomain>.trycloudflare.com'
```

## Access Flow
```
Customer Browser → React Frontend (port 3009) → Cloudflare Tunnel → FastAPI Backend (port 5655)
```

## Commands Summary
```bash
# Start backend (in one terminal)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 5655 --reload

# Start tunnel (in another terminal)
cloudflared tunnel run <tunnel-name>

# Start frontend (in third terminal)
cd frontend
npm run dev
```

## Production Deployment
For production, you can:
1. Build the frontend: `npm run build`
2. Serve the static files from your backend or a web server
3. Only tunnel the backend, serving both API and frontend

## Troubleshooting
- Check tunnel status: `cloudflared tunnel list`
- View tunnel logs: Add `--loglevel debug` to the run command
- Ensure backend is accessible locally first: `curl http://localhost:5655/health`
