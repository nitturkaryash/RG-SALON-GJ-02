@echo off
echo 💅 RG Salon Appointment Messages for 9021264696
echo ================================================
echo.

echo Choose appointment notification type:
echo 1. 🎉 Appointment Confirmation
echo 2. 📅 Appointment Rescheduling  
echo 3. ❌ Appointment Cancellation
echo 4. ⏰ 24-Hour Reminder
echo 5. 🚨 2-Hour Final Reminder
echo 6. 📋 Send All Test Notifications
echo.

set /p choice="Enter your choice (1-6): "

echo.
echo 📤 Sending notification...
echo.

node appointment-notifications.js %choice%

echo.
echo 🏁 Done! 
echo 📞 Business Contact: +91-8956860024
pause 