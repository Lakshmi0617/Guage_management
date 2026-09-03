@echo off
echo Starting Cloudflare Tunnel for Gauge Inventory Backend...
echo.

REM Check if cloudflared is installed
cloudflared --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: cloudflared is not installed or not in PATH
    echo Please install it first: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

REM Check if tunnel config exists
if not exist "cloudflare-tunnel.yml" (
    echo ERROR: cloudflare-tunnel.yml not found
    echo Please configure it first using TUNNEL_SETUP.md
    pause
    exit /b 1
)

echo Starting tunnel...
cloudflared tunnel run --config cloudflare-tunnel.yml

pause
