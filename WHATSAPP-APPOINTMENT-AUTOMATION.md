# WhatsApp Appointment Automation - Selenium Python Script

This guide explains how to use the automated WhatsApp messaging system for appointment bookings in your salon management system, leveraging a **Selenium-based Python script** for sending messages via WhatsApp Web.

## 🚀 Features

✅ **Automatic appointment messages** when appointments are created, updated, or cancelled.
✅ **Plain text messages** formatted with appointment details.
✅ **WhatsApp Web automation** via Selenium and Python.
✅ **Persistent login sessions** (attempts to keep WhatsApp Web logged in using a Chrome profile).
✅ **Phone number validation** for Indian mobile numbers.
✅ **Error handling** that doesn't block appointment operations if WhatsApp script fails.

## 📋 Prerequisites

1.  **Python 3** installed on the server where your Next.js backend runs.
2.  **Required Python Packages**: `selenium`, `webdriver-manager`.
    Install them using pip: `pip install selenium webdriver-manager`
3.  **Google Chrome** installed on the server.
4.  **ChromeDriver** compatible with your installed Chrome version. `webdriver-manager` should handle this, but manual setup might be needed in some environments.
5.  **Initial WhatsApp Web Login**: You will need to manually log in to WhatsApp Web the first time the script runs, or by running `python3 src/whatsapp/open-source/services/whatsapp_service_selenium.py --action login`.
The session will be stored in `~/.whatsapp_selenium_profile`.

## 🔧 Configuration

*   **Python Script Path**: The API endpoint `src/pages/api/whatsapp/send-selenium.ts` assumes the script is located at `src/whatsapp/open-source/services/whatsapp_service_selenium.py`.
*   **Default Country Code**: The Python script uses `+91` as the default. This can be changed in `whatsapp_service_selenium.py` if needed.
*   **Chrome Profile Directory**: The script saves session data to `~/.whatsapp_selenium_profile`.

## 🎯 How It Works

### When Creating, Updating, or Cancelling Appointments

1.  **User action** (book, update, delete appointment) occurs in `Appointments.tsx`.
2.  The `sendAppointmentWhatsAppNotification` function in `src/utils/whatsappNotifications.ts` is called.
3.  Client phone number is validated (Indian format).
4.  A plain text message with appointment details is formatted.
5.  An API call is made to `/api/whatsapp/send-selenium` with the recipient's phone number and the message.
6.  The API endpoint executes the `whatsapp_service_selenium.py` Python script using `child_process.spawn`.
7.  The Python script:
    *   Sets up Selenium with a persistent Chrome profile to try and use an existing WhatsApp Web session.
    *   If not logged in, it attempts to open WhatsApp Web and waits for a QR scan (this requires manual intervention if the session is lost or it's the first run).
    *   Sends the message to the specified phone number.
    *   Returns a JSON response indicating success or failure.
8.  The API endpoint forwards the script's response to the frontend.
9.  Success/error feedback is shown to the user (e.g., via toast notifications).

## 📱 Message Format Example (Created)

```text
🎉 Appointment Confirmed! 🎉

Hi [Client Name], your appointment for [Service Names] with [Stylist Names] on [Date] at [Time] is confirmed. We look forward to seeing you!
```
(Similar formats for updates and cancellations)

## 🛠 Implementation Details

### File Structure
```
src/
├── pages/
│   ├── api/
│   │   └── whatsapp/
│   │       ├── send-selenium.ts             # API to trigger Python script
│   │       └── test-appointment.ts          # (Optional) Previous test endpoint
│   └── Appointments.tsx                     # Calls notification utility
├── utils/
│   └── whatsappNotifications.ts             # Formats message, calls send-selenium API
└── whatsapp/
    └── open-source/
        └── services/
            └── whatsapp_service_selenium.py # Core Python Selenium script
```

### Key Functions & Scripts

*   **`whatsapp_service_selenium.py`**: Python script using Selenium to interact with WhatsApp Web. Called with `--phone` and `--message` arguments.
*   **`src/pages/api/whatsapp/send-selenium.ts`**: Next.js API route that spawns the Python script.
*   **`src/utils/whatsappNotifications.ts`**: 
    *   `formatWhatsAppMessage()`: Creates the plain text message.
    *   `sendAppointmentWhatsAppNotification()`: Calls the `send-selenium` API.

## 🧪 Testing

1.  **Initial Login/Session Setup**:
    *   Run `python3 src/whatsapp/open-source/services/whatsapp_service_selenium.py --action login` from your project root.
    *   Scan the QR code with your WhatsApp mobile app.
    *   Once logged in, the session should be saved in `~/.whatsapp_selenium_profile`.

2.  **Sending a Test Message via CLI**:
    *   `python3 src/whatsapp/open-source/services/whatsapp_service_selenium.py --action send_message --phone YOUR_PHONE_NUMBER --message "Hello from Selenium!"`
    (Replace `YOUR_PHONE_NUMBER` with a number including country code, e.g., 919876543210).

3.  **Testing via Application Flow**:
    *   Book a new appointment for a client with your own (WhatsApp-enabled) phone number.
    *   Check the Next.js console output for logs from `[Selenium WhatsApp API]` and `[Selenium Script STDOUT/STDERR]`.
    *   Verify if you receive the WhatsApp message.
    *   Test updating and cancelling appointments similarly.

## ⚠️ Important Notes & Troubleshooting

*   **Python Environment**: Ensure the Python environment where your Next.js app runs has `python3` in its PATH and the necessary libraries (`selenium`, `webdriver-manager`) installed.
*   **ChromeDriver & Chrome**: Keep Chrome and ChromeDriver updated and compatible. `webdriver-manager` usually handles this, but issues can arise.
*   **WhatsApp Web UI Changes**: WhatsApp Web's HTML structure can change, potentially breaking the Selenium script. The script might need updates if locators (CSS selectors) change.
*   **Session Stability**: While `user-data-dir` helps, WhatsApp Web sessions can still expire or be invalidated. You might need to re-run the `--action login` periodically or if sending fails due to login issues.
*   **Headless Mode**: The Python script can be configured to run Chrome in headless mode (see comments in `_setup_driver`). This is useful for servers without a GUI, but can sometimes be detected or behave differently.
*   **Error Handling**: The API endpoint and Python script include logging. Check these logs (Next.js console and script STDOUT/STDERR) for troubleshooting.
    *   Common Python script errors include `TimeoutException` (element not found, often due to login issues or UI changes) or `WebDriverException` (driver/browser issues).
*   **Permissions**: Ensure the directory `~/.whatsapp_selenium_profile` can be created and written to by the user running the Next.js application.
*   **Resource Usage**: Running a full browser instance via Selenium can be resource-intensive compared to API-based solutions.

## 📞 Support

1.  **Check Next.js console logs** for errors from the API endpoint.
2.  **Check Python script output** (relayed to Next.js console by the API endpoint).
3.  **Run the Python script directly** (as shown in Testing) to isolate issues.
4.  **Verify WhatsApp Web login status** by temporarily disabling headless mode (if used) and observing the browser.

---

This Selenium-based approach provides a way to automate WhatsApp messages without direct API costs but comes with the maintenance overhead of web automation. 