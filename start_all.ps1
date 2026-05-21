# Setup and start script for Resume RAG Platform

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Resume RAG Platform Services..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start Qdrant Docker Container
Write-Host "`n[1/4] Checking and starting Qdrant in Docker..." -ForegroundColor Yellow
if (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue) {
    Write-Host "Docker Desktop is running. Attempting to start/run Qdrant..." -ForegroundColor Gray
    # Try starting existing container or run a new one
    $container = docker ps -a --filter "ancestor=qdrant/qdrant" --format "{{.ID}}"
    if ($container) {
        Write-Host "Existing Qdrant container found. Starting it..." -ForegroundColor Gray
        docker start $container
    } else {
        Write-Host "No existing Qdrant container found. Running a new one..." -ForegroundColor Gray
        docker run -d -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
    }
} else {
    Write-Host "⚠️ Docker Desktop is not running. Please make sure Docker Desktop is started if you want Qdrant via Docker." -ForegroundColor DarkYellow
    Write-Host "Note: If Qdrant is down, backend will fallback to local directory persistent storage (qdrant_db)." -ForegroundColor Gray
}

# 2. Start MySQL
Write-Host "`n[2/4] Checking MySQL Database Service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -ne "Running") {
        Write-Host "Starting MySQL service..." -ForegroundColor Gray
        Start-Process powershell -Verb RunAs -ArgumentList "Start-Service $($mysqlService.Name)" -Wait
    } else {
        Write-Host "MySQL service is already running." -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ MySQL service not found as a Windows service." -ForegroundColor DarkYellow
    Write-Host "If you use XAMPP, WAMP, or Laragon, please start MySQL manually from their control panel." -ForegroundColor Gray
}

# 3. Start Backend in a new window
Write-Host "`n[3/4] Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\mmishra\Downloads\resume-rag-platform\backend; Write-Host 'Starting FastAPI Backend...' -ForegroundColor Green; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --port 8000"

# 4. Start Frontend in a new window
Write-Host "`n[4/4] Starting Frontend (Vite + React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\mmishra\Downloads\resume-rag-platform\frontend; Write-Host 'Starting Vite Frontend...' -ForegroundColor Green; npm run dev"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "🎉 Startup Commands Sent!" -ForegroundColor Green
Write-Host "Check the newly opened PowerShell windows for service logs." -ForegroundColor Gray
Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
