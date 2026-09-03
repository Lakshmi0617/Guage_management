# External Access Setup Guide

## For Other Systems to Access Your Application

### Option 1: Direct Tunnel Access (Recommended)

**URL**: `https://gauge-inventory.trycloudflare.com`

**Steps for other systems:**
1. Open browser
2. Go to: `https://gauge-inventory.trycloudflare.com`
3. Access the application directly

### Option 2: Frontend + Backend Setup

**What you need running:**
- ✅ Backend: Running on port 5655
- ✅ Cloudflare Tunnel: Connected
- ✅ Frontend: Built and served by backend

**Access URLs:**
- **Main Application**: `https://gauge-inventory.trycloudflare.com`
- **API Endpoints**: `https://gauge-inventory.trycloudflare.com/api/*`
- **Health Check**: `https://gauge-inventory.trycloudflare.com/health`

### Option 3: Separate Frontend (Advanced)

If you want to run frontend separately on another system:

1. **Copy frontend folder** to the other system
2. **Install dependencies**: `npm install`
3. **Update API URL** in `frontend/src/config/api.js`:
   ```javascript
   production: 'https://gauge-inventory.trycloudflare.com'
   ```
4. **Run frontend**: `npm run dev`
5. **Access**: `http://localhost:3009` on that system

## Current Setup Status

- ✅ Backend: Ready to run
- ✅ Tunnel: Connected
- ✅ Frontend: Built for production
- ✅ Configuration: Updated for tunnel access

## To Start Everything:

```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 5655 --reload

# Terminal 2: Tunnel is already connected
# cloudflared tunnel run d224104f-501e-47d8-9803-6cb72f19e0d1
```

## Access from Any System:

**Main URL**: `https://gauge-inventory.trycloudflare.com`

No additional setup needed on other systems - just internet access!
