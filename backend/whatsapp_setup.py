#!/usr/bin/env python3
"""
WhatsApp Setup Script for Salon Management System
This script helps set up WhatsApp automation for your salon management system using Selenium.
"""

import subprocess
import sys
import os
import time
from datetime import datetime, timedelta
from whatsapp_service_selenium import WhatsAppSeleniumService

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required Python packages."""
    print("\n📦 Installing dependencies...")
    
    dependencies = [
        "selenium>=4.0.0",
        "webdriver-manager>=3.8.0",
        "requests>=2.25.0",
        "flask>=2.3.2",
        "flask-cors>=4.0.0"
    ]
    
    for dep in dependencies:
        try:
            print(f"Installing {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {dep}: {e}")
            return False
    
    print("✅ All dependencies installed successfully")
    return True

def check_chrome_browser():
    """Check if Chrome browser is available."""
    print("\n🌐 Checking for Chrome browser...")
    
    # Check common Chrome locations
    chrome_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",  # macOS
        "/usr/bin/google-chrome",  # Linux
        "/usr/bin/chromium-browser",  # Linux (Chromium)
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",  # Windows
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",  # Windows
    ]
    
    chrome_found = False
    for path in chrome_paths:
        if os.path.exists(path):
            print(f"✅ Chrome found at: {path}")
            chrome_found = True
            break
    
    if not chrome_found:
        print("⚠️  Chrome browser not found in common locations")
        print("   Please ensure Google Chrome is installed and accessible")
        print("   Selenium WebDriver requires Chrome to send WhatsApp messages")
    
    return chrome_found

def setup_whatsapp_web():
    """Guide user through WhatsApp Web setup."""
    print("\n📱 Setting up WhatsApp Web...")
    print("=" * 50)
    print("IMPORTANT: Follow these steps carefully:")
    print()
    print("1. The script will open Chrome automatically")
    print("2. WhatsApp Web will load automatically")
    print("3. Scan the QR code with your phone's WhatsApp")
    print("4. Make sure to check 'Keep me signed in'")
    print("5. The browser session will be saved for future use")
    print()
    print("⚠️  CRITICAL REQUIREMENTS:")
    print("   - Your phone must have internet connection")
    print("   - Don't interrupt the browser automation")
    print("   - The session will be saved in './whatsapp_session' folder")
    print()
    
    response = input("Ready to proceed with WhatsApp Web setup? (y/n): ")
    return response.lower() == 'y'

def test_whatsapp_functionality():
    """Test WhatsApp functionality with a test message."""
    print("\n🧪 Testing WhatsApp functionality...")
    
    phone = input("Enter your phone number (with country code, e.g., +919876543210): ")
    if not phone:
        print("❌ Phone number is required for testing")
        return False
    
    test_message = """🧪 *WhatsApp Automation Test* 🧪

This is a test message from your Salon Management System!

If you received this message, the WhatsApp automation is working perfectly! ✅

Time: """ + datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    
    try:
        print(f"📤 Sending test message to {phone}")
        print("⏰ This will open Chrome and send the message...")
        
        # Initialize WhatsApp service
        whatsapp_service = WhatsAppSeleniumService()
        
        result = whatsapp_service.send_message(phone, test_message)
        
        if result['success']:
            print("✅ Test message sent successfully!")
            print(f"📱 Check your WhatsApp for the message")
            return True
        else:
            print(f"❌ Test failed: {result['message']}")
            return False
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure Chrome browser is installed")
        print("2. Check your internet connection")
        print("3. Verify the phone number format")
        print("4. Make sure WhatsApp Web can be accessed")
        return False

def create_env_file():
    """Create environment file for WhatsApp configuration."""
    print("\n⚙️  Creating environment configuration...")
    
    env_content = """# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_DEFAULT_COUNTRY_CODE=+91
WHATSAPP_MESSAGE_DELAY_MINUTES=2
WHATSAPP_MANAGER_PHONE=

# Salon Configuration
SALON_NAME=Your Salon Name
SALON_PHONE=
SALON_ADDRESS=

# Business Hours (for appointment scheduling)
BUSINESS_START_HOUR=9
BUSINESS_END_HOUR=20
"""
    
    env_file_path = '.env.whatsapp'
    with open(env_file_path, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Environment file created: {env_file_path}")
    print("📝 Please edit this file with your salon's information")
    return True

def display_usage_examples():
    """Display usage examples for the React app."""
    print("\n📖 Usage Examples for Your React App")
    print("=" * 50)
    
    examples = {
        "Order Created": """
// Send notification when order is created
const sendOrderNotification = async (orderData) => {
  try {
    const response = await fetch('/api/whatsapp/order-created', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: orderData.clientName,
        client_phone: orderData.clientPhone,
        order_id: orderData.orderId,
        items: orderData.items, // [{ name: "Product", quantity: 2 }]
        total_amount: orderData.totalAmount
      })
    });
    
    const result = await response.json();
    console.log('WhatsApp notification sent:', result);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};""",
        
        "Order Updated": """
// Send notification when order status changes
const sendOrderUpdateNotification = async (orderData) => {
  try {
    await fetch('/api/whatsapp/order-updated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: orderData.clientName,
        client_phone: orderData.clientPhone,
        order_id: orderData.orderId,
        status: orderData.newStatus, // e.g., "Completed", "In Progress"
        items: orderData.items // optional
      })
    });
  } catch (error) {
    console.error('Update notification failed:', error);
  }
};""",
        
        "Appointment Reminder": """
// Send appointment reminder
const sendAppointmentReminder = async (appointmentData) => {
  try {
    await fetch('/api/whatsapp/appointment-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: appointmentData.clientName,
        client_phone: appointmentData.clientPhone,
        service: appointmentData.serviceName,
        date: appointmentData.date, // "15/12/2024"
        time: appointmentData.time  // "2:30 PM"
      })
    });
  } catch (error) {
    console.error('Reminder failed:', error);
  }
};"""
    }
    
    for title, code in examples.items():
        print(f"\n{title}:")
        print(code)

def main():
    """Main setup function."""
    print("🎉 WhatsApp Automation Setup for Salon Management System")
    print("=" * 60)
    
    # Step 1: Check Python version
    if not check_python_version():
        return
    
    # Step 2: Install dependencies
    if not install_dependencies():
        return
    
    # Step 3: Check Chrome browser
    check_chrome_browser()
    
    # Step 4: Guide through WhatsApp Web setup
    if not setup_whatsapp_web():
        print("❌ Setup incomplete. Please complete WhatsApp Web setup first.")
        return
    
    # Step 5: Create environment file
    create_env_file()
    
    # Step 6: Test functionality
    test_choice = input("\nWould you like to test the WhatsApp functionality? (y/n): ")
    if test_choice.lower() == 'y':
        test_whatsapp_functionality()
    
    # Step 7: Display usage examples
    display_usage_examples()
    
    print("\n🎉 Setup Complete!")
    print("=" * 30)
    print("✅ WhatsApp automation is ready to use")
    print("📚 Check the usage examples above")
    print("🚀 Start your Flask server: python app.py")
    print("📱 Keep WhatsApp Web logged in and Chrome browser open")
    print("\n📞 Support: If you encounter issues, check the troubleshooting guide")

if __name__ == "__main__":
    main() 