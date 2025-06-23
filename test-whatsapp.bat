@echo off
echo 📱 WhatsApp Notification Test for 9021264696
echo ============================================
echo.

echo 🚀 Starting server check...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing; Write-Host '✅ Server is running on port 3001' } catch { Write-Host '❌ Server not running. Please start with: node server.js'; exit 1 }"

echo.
echo 📤 Sending ALL notifications to 9021264696...
echo ⏳ This will take about 18 seconds...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/whatsapp/send-all-notifications' -Method POST -ContentType 'application/json' -Body '{}' -UseBasicParsing; $json = $response.Content | ConvertFrom-Json; if($json.success) { Write-Host '🎉 SUCCESS! Sent' $json.successCount'/'$json.totalNotifications 'notifications to' $json.targetNumber -ForegroundColor Green; Write-Host '📱 Check WhatsApp on 9021264696 for the messages!' -ForegroundColor Green } else { Write-Host '❌ FAILED:' $json.error -ForegroundColor Red } } catch { Write-Host '❌ ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo 🏁 Test completed!
echo 📞 Support: +91-8956860024
pause 