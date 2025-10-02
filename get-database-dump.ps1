# ================================================================
# Windows PowerShell Script to Get Complete Database Dump
# Project: mtyudylsozncvilibxda
# ================================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE DATABASE DUMP - Windows Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$DB_HOST = "db.mtyudylsozncvilibxda.supabase.co"
$DB_NAME = "postgres"
$DB_USER = "postgres"

Write-Host "Step 1: Get your database password" -ForegroundColor Yellow
Write-Host "  Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  Select project: mtyudylsozncvilibxda" -ForegroundColor White
Write-Host "  Click: Settings → Database" -ForegroundColor White
Write-Host "  Copy the database password" -ForegroundColor White
Write-Host ""

# Prompt for password
$PASSWORD = Read-Host "Enter your database password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Step 2: Checking for required tools..." -ForegroundColor Yellow
Write-Host ""

# Check if pg_dump is available
$pgDumpExists = Get-Command pg_dump -ErrorAction SilentlyContinue

if ($pgDumpExists) {
    Write-Host "✓ PostgreSQL tools found!" -ForegroundColor Green
    Write-Host "  Using pg_dump to create complete dump..." -ForegroundColor White
    Write-Host ""
    
    # Set password as environment variable
    $env:PGPASSWORD = $PlainPassword
    
    # Run pg_dump
    Write-Host "Creating complete database dump..." -ForegroundColor Cyan
    pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f COMPLETE_DUMP_WITH_DATA.sql -v
    
    # Clear password
    $env:PGPASSWORD = $null
    
    if (Test-Path "COMPLETE_DUMP_WITH_DATA.sql") {
        $fileSize = (Get-Item "COMPLETE_DUMP_WITH_DATA.sql").Length / 1MB
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  SUCCESS! Dump created successfully!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  File: COMPLETE_DUMP_WITH_DATA.sql" -ForegroundColor White
        Write-Host "  Size: $($fileSize.ToString('F2')) MB" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "✗ PostgreSQL tools not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Attempting with Supabase CLI (via npx)..." -ForegroundColor Yellow
    Write-Host ""
    
    # Build connection string
    $connString = "postgresql://${DB_USER}:${PlainPassword}@${DB_HOST}:5432/${DB_NAME}"
    
    # Try with npx supabase
    Write-Host "Running: npx supabase db dump..." -ForegroundColor Cyan
    npx --yes supabase db dump --db-url $connString -f COMPLETE_DUMP_WITH_DATA.sql
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path "COMPLETE_DUMP_WITH_DATA.sql")) {
        $fileSize = (Get-Item "COMPLETE_DUMP_WITH_DATA.sql").Length / 1MB
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  SUCCESS! Dump created successfully!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  File: COMPLETE_DUMP_WITH_DATA.sql" -ForegroundColor White
        Write-Host "  Size: $($fileSize.ToString('F2')) MB" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Red
        Write-Host "  Could not create dump automatically" -ForegroundColor Red
        Write-Host "================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install PostgreSQL tools manually:" -ForegroundColor Yellow
        Write-Host "  1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "  2. Install PostgreSQL (select 'Command Line Tools')" -ForegroundColor White
        Write-Host "  3. Add to PATH during installation" -ForegroundColor White
        Write-Host "  4. Rerun this script" -ForegroundColor White
        Write-Host ""
        Write-Host "OR use Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "  2. Select: mtyudylsozncvilibxda" -ForegroundColor White
        Write-Host "  3. Database → Backups → Download" -ForegroundColor White
        Write-Host ""
    }
}

# Clear sensitive data
$PlainPassword = $null
$BSTR = $null

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Cyan
Write-Host ""


