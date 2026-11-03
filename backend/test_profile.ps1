# Profile API Test Script
$baseUrl = "http://localhost:8000/api"

Write-Host "=== Profile Management Tests ===" -ForegroundColor Cyan

# Step 1: Register
Write-Host "`n1. Register User..." -ForegroundColor Yellow
$registerBody = @{
    email = "profile_test@example.com"
    password = "Password123!"
    password_confirmation = "Password123!"
} | ConvertTo-Json

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -WebSession $session
Write-Host "Registered: $($register.user.email)" -ForegroundColor Green

# Step 2: Get departments
Write-Host "`n2. Get Departments..." -ForegroundColor Yellow
$departments = Invoke-RestMethod -Uri "$baseUrl/reference/departments" -Method Get
Write-Host "Found $($departments.departments.Count) departments" -ForegroundColor Green

# Step 3: Get occupations
Write-Host "`n3. Get Occupations..." -ForegroundColor Yellow
$occupations = Invoke-RestMethod -Uri "$baseUrl/reference/occupations" -Method Get
Write-Host "Found $($occupations.occupations.Count) occupations" -ForegroundColor Green

# Step 4: Create profile
Write-Host "`n4. Create Profile..." -ForegroundColor Yellow
$profileBody = @{
    first_name = "Abebe"
    father_name = "Kebede"
    grandfather_name = "Tesfaye"
    gender = "male"
    date_of_birth = "2000-05-15"
    nationality = "Ethiopian"
    phone = "0912345678"
    email = "abebe@example.com"
    region = "Addis Ababa"
    zone = "Addis Ababa"
    woreda = "Bole"
    kebele = "08"
    house_number = "1234"
    emergency_contact_name = "Almaz Kebede"
    emergency_contact_phone = "0911111111"
    emergency_contact_relationship = "Mother"
} | ConvertTo-Json

try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Post -ContentType "application/json" -Body $profileBody -WebSession $session
    Write-Host "Profile created: $($profile.profile.full_name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Step 5: Get profile
Write-Host "`n5. Get Profile..." -ForegroundColor Yellow
try {
    $getProfile = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Get -WebSession $session
    Write-Host "Profile: $($getProfile.profile.full_name)" -ForegroundColor Green
    Write-Host "Phone: $($getProfile.profile.phone)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
