@echo off
title RG Salon - Client Phone Number Test

echo.
echo ========================================
echo   RG Salon - Client Phone Number Test
echo ========================================
echo.
echo Testing WhatsApp messages to ACTUAL CLIENT numbers
echo (No more test number 9021264696!)
echo.

:: Check if server is running
echo [1/2] Checking server status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing; Write-Host '✅ Server is running on port 3001' -ForegroundColor Green } catch { Write-Host '❌ Server not running. Please start with: node server.js' -ForegroundColor Red; pause; exit 1 }"

echo.
echo [2/2] Testing client phone numbers...
echo.

:: Run the test
node test-client-whatsapp.js

echo.
echo ========================================
echo Test completed! Check results above.
echo ========================================
echo.
pause 