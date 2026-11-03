# Simple Authentication API Test
$baseUrl = "http://localhost:8000/api"

Write-Host "=== Authentication Tests ===" -ForegroundColor Cyan

# Test 1: Health
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host "Status: $($health.status)" -ForegroundColor Green

# Test 2: Register
Write-Host "`n2. Register User..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser@example.com"
    password = "Password123!"
    password_confirmation = "Password123!"
}

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body ($registerBody | ConvertTo-Json)
    
    Write-Host "✓ Registered: $($register.user.email)" -ForegroundColor Green
    Write-Host "  Role: $($register.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 3: Login
Write-Host "`n3. Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "Password123!"
}

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body ($loginBody | ConvertTo-Json)
    
    Write-Host "✓ Logged in: $($login.user.email)" -ForegroundColor Green
    Write-Host "  Last login: $($login.user.last_login_at)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
