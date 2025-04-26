# PowerShell script to run the sales history migration
Write-Host "Running sales history view migration to add remaining_stock..." -ForegroundColor Green

# Database connection parameters - replace these with your actual values
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "postgres" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }

# Path to migration file
$MIGRATION_FILE = "supabase/migrations/20250615_add_remaining_stock_to_sales_view.sql"

# Check if migration file exists
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "Error: Migration file $MIGRATION_FILE not found." -ForegroundColor Red
    exit 1
}

# Check if psql is available - use Supabase CLI if available
if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
    Write-Host "Using Supabase CLI to run migration..." -ForegroundColor Yellow
    supabase db execute -f $MIGRATION_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration applied successfully via Supabase CLI!" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to apply migration via Supabase CLI." -ForegroundColor Red
        exit 1
    }
} elseif (Get-Command "psql" -ErrorAction SilentlyContinue) {
    # Run the migration with psql
    Write-Host "Applying migration from $MIGRATION_FILE using psql..." -ForegroundColor Yellow

    # Set PGPASSWORD environment variable
    $env:PGPASSWORD = $DB_PASSWORD

    # Run psql command
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $MIGRATION_FILE

    # Check if migration was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration applied successfully via psql!" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to apply migration via psql." -ForegroundColor Red
        exit 1
    }

    # Clear PGPASSWORD for security
    $env:PGPASSWORD = ""
} else {
    Write-Host "Error: Neither Supabase CLI nor psql is installed. Please install one of these tools." -ForegroundColor Red
    Write-Host "You can manually run the SQL file using your database management tool of choice." -ForegroundColor Yellow
    exit 1
}

Write-Host "The sales_product_new view now includes the remaining_stock column." -ForegroundColor Green
Write-Host "Refresh your application to see the changes." -ForegroundColor Green
Write-Host "Done." -ForegroundColor Green 