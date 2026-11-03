# Authentication API Test Script for Hawagalan TVET College
# Tests: Register, Login, Get User, Logout

$baseUrl = "http://localhost:8000/api"

Write-Host "=== Hawagalan TVET College - Authentication API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health Check: $($health.status)" -ForegroundColor Green
    Write-Host "  Service: $($health.service)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register new user
Write-Host "2. Testing Registration..." -ForegroundColor Yellow
$registerData = @{
    email = "test@example.com"
    password = "Password123!"
    password_confirmation = "Password123!"
} | ConvertTo-Json

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData `
        -WebSession $session
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($register.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($register.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($register.user.role)" -ForegroundColor Gray
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✗ Registration failed:" -ForegroundColor Red
    Write-Host "  $($errorDetails.message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login with created user
Write-Host "3. Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

try {
    $session2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData `
        -WebSession $session2
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Email: $($login.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($login.user.role)" -ForegroundColor Gray
    Write-Host "  Last Login: $($login.user.last_login_at)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get authenticated user
Write-Host "4. Testing Get User (authenticated)..." -ForegroundColor Yellow
try {
    $user = Invoke-RestMethod -Uri "$baseUrl/auth/user" `
        -Method Get `
        -WebSession $session2
    
    Write-Host "✓ Get User successful!" -ForegroundColor Green
    Write-Host "  Email: $($user.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($user.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get User failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Logout
Write-Host "5. Testing Logout..." -ForegroundColor Yellow
try {
    $logout = Invoke-RestMethod -Uri "$baseUrl/auth/logout" `
        -Method Post `
        -WebSession $session2
    
    Write-Host "✓ Logout successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Logout failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Try to access protected route after logout (should fail)
Write-Host "6. Testing Protected Route After Logout (should fail)..." -ForegroundColor Yellow
try {
    $user = Invoke-RestMethod -Uri "$baseUrl/auth/user" `
        -Method Get `
        -WebSession $session2
    
    Write-Host "✗ Unexpected: Still authenticated after logout" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly unauthenticated after logout" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
