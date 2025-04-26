@echo off
setlocal

rem Define database connection parameters
set DB_NAME=postgres
set DB_USER=postgres
set DB_HOST=localhost

echo Creating sales_product_new view...

rem Prompt for password if needed (Note: this will be visible)
if not defined PGPASSWORD (
  set /p PGPASSWORD=Please enter the password for PostgreSQL user %DB_USER%: 
)

rem Run the SQL script
psql -U %DB_USER% -h %DB_HOST% -d %DB_NAME% -f create_sales_product_view.sql

if %ERRORLEVEL% EQU 0 (
  echo sales_product_new view created successfully!
  rem Verify that the view exists
  psql -U %DB_USER% -h %DB_HOST% -d %DB_NAME% -c "SELECT COUNT(*) FROM sales_product_new LIMIT 1;"
) else (
  echo Failed to create sales_product_new view. Please check the error messages above.
)

pause 