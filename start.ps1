Write-Host "🚀 ATLAS GLOBAL LOGISTICS - DOCKER LAUNCH (WINDOWS)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray

# Check Docker installation
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Docker is not installed or not in PATH."
    exit
}

# Check Docker status
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Docker is not running. Please start Docker Desktop."
    exit
}

# Create database folder if missing
if (!(Test-Path "./database")) {
    New-Item -ItemType Directory -Path "./database"
}

# Check for SQL files
$sqlFiles = Get-ChildItem "./database/*.sql" -ErrorAction SilentlyContinue
if (!$sqlFiles) {
    Write-Warning "⚠️  No SQL files found in ./database/"
    Write-Warning "📦 Ensure schema.sql is present for initial setup."
}

# Build and Launch
Write-Host "📦 Building containers and launching ecosystem..." -ForegroundColor Yellow
docker-compose up -d --build

Write-Host "`n✅ Atlas Global Logistics is now active!" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host "🖥️  Web Dashboard: http://localhost:3001"
Write-Host "📊 Backend API:   http://localhost:3000/docs"
Write-Host "🔧 DB Admin:      http://localhost:8080"
Write-Host "----------------------------------------"
Write-Host "Use 'docker-compose logs -f' to view output."
