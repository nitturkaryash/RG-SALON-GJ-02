#!/usr/bin/env python3
"""
WhatsApp API Test Script
This script tests all the WhatsApp endpoints to ensure they're working correctly.
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_whatsapp_health():
    """Test if WhatsApp service is available"""
    try:
        response = requests.get(f"{BASE_URL}/api/whatsapp/test")
        print(f"✅ Health Check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return False

def test_send_message():
    """Test sending a basic WhatsApp message"""
    phone = input("Enter your phone number (with country code, e.g., +918007120161): ")
    
    data = {
        "phone": phone,
        "message": "🧪 Test message from your salon management system! If you receive this, WhatsApp automation is working perfectly! 🎉",
        "delay_minutes": 1,
        "instant": False
    }
    
    try:
        print("📤 Sending test message...")
        response = requests.post(f"{BASE_URL}/api/whatsapp/send-message", 
                               json=data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        
        if response.status_code == 200 and result.get('success'):
            print("✅ Message sent successfully!")
            print("📱 Check your phone for the test message")
            return True
        else:
            print(f"❌ Message failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_order_notification():
    """Test order creation notification"""
    phone = input("Enter phone number for order test (with country code): ")
    
    data = {
        "client_name": "John Doe",
        "client_phone": phone,
        "order_id": "TEST123",
        "items": [
            {"name": "Hair Cut", "quantity": 1},
            {"name": "Hair Wash", "quantity": 1}
        ],
        "total_amount": 1500.00
    }
    
    try:
        print("📤 Sending order notification...")
        response = requests.post(f"{BASE_URL}/api/whatsapp/order-created", 
                               json=data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        
        if response.status_code == 200 and result.get('success'):
            print("✅ Order notification sent successfully!")
            return True
        else:
            print(f"❌ Order notification failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Order test failed: {e}")
        return False

def test_appointment_reminder():
    """Test appointment reminder"""
    phone = input("Enter phone number for appointment test (with country code): ")
    
    data = {
        "client_name": "Jane Smith",
        "client_phone": phone,
        "service": "Hair Cut & Style",
        "date": "25/12/2024",
        "time": "2:30 PM"
    }
    
    try:
        print("📤 Sending appointment reminder...")
        response = requests.post(f"{BASE_URL}/api/whatsapp/appointment-reminder", 
                               json=data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        
        if response.status_code == 200 and result.get('success'):
            print("✅ Appointment reminder sent successfully!")
            return True
        else:
            print(f"❌ Appointment reminder failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Appointment test failed: {e}")
        return False

def main():
    print("🧪 WhatsApp API Testing Script")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing API Health...")
    if not test_whatsapp_health():
        print("❌ Server not responding. Make sure Flask server is running on port 5000")
        return
    
    print("\n⚠️  IMPORTANT SETUP STEPS:")
    print("1. Make sure Chrome browser is open")
    print("2. Go to web.whatsapp.com and scan QR code")
    print("3. Keep WhatsApp Web logged in")
    print("4. Don't close the browser tab")
    
    input("\nPress Enter when WhatsApp Web is ready...")
    
    # Test 2: Simple message
    print("\n2️⃣ Testing Simple Message...")
    if test_send_message():
        time.sleep(5)  # Wait between tests
        
        # Test 3: Order notification
        print("\n3️⃣ Testing Order Notification...")
        if test_order_notification():
            time.sleep(5)  # Wait between tests
            
            # Test 4: Appointment reminder
            print("\n4️⃣ Testing Appointment Reminder...")
            test_appointment_reminder()
    
    print("\n🎉 Testing Complete!")
    print("\nIf all tests passed, your WhatsApp automation is ready to use!")
    print("You can now integrate it into your React frontend.")

if __name__ == "__main__":
    main() 