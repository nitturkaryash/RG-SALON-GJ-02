#!/usr/bin/env python3
"""
WhatsApp Test Script for Salon Management System
Test the WhatsApp automation functionality
"""

import requests
import json
import time

# Base URL for the API
BASE_URL = "http://localhost:5000/api/whatsapp"

def test_whatsapp_service():
    """Test the WhatsApp service endpoints"""
    print("🧪 Testing WhatsApp Service")
    print("=" * 40)
    
    # Test 1: Check if service is available
    try:
        response = requests.get(f"{BASE_URL}/test")
        result = response.json()
        print("✅ Service Status:", result)
    except Exception as e:
        print("❌ Service test failed:", e)
        return False
    
    # Test 2: Initialize WhatsApp (this will open browser)
    print("\n📱 Testing WhatsApp initialization...")
    try:
        response = requests.post(f"{BASE_URL}/login")
        result = response.json()
        print("✅ WhatsApp login result:", result)
        
        if not result.get('success'):
            print("⚠️  WhatsApp Web not initialized. Please scan QR code manually.")
            return False
            
    except Exception as e:
        print("❌ WhatsApp initialization failed:", e)
        return False
    
    return True

def test_send_message():
    """Test sending a simple message"""
    phone = input("Enter phone number for testing (with country code, e.g., +919876543210): ")
    
    if not phone:
        print("❌ Phone number required")
        return False
    
    test_message = "🧪 WhatsApp Test from Salon Management System!\n\nIf you receive this, the automation is working! ✅"
    
    try:
        print(f"📤 Sending test message to {phone}...")
        
        response = requests.post(f"{BASE_URL}/send-message", json={
            "phone": phone,
            "message": test_message
        })
        
        result = response.json()
        
        if result.get('success'):
            print("✅ Message sent successfully!")
            print("📱 Check your WhatsApp for the message")
            return True
        else:
            print("❌ Message failed:", result.get('error'))
            return False
            
    except Exception as e:
        print("❌ Failed to send message:", e)
        return False

def test_order_notification():
    """Test order creation notification"""
    phone = input("Enter phone number for order notification test: ")
    
    if not phone:
        print("❌ Phone number required")
        return False
    
    sample_order = {
        "client_name": "John Doe",
        "client_phone": phone,
        "order_id": f"ORD-{int(time.time())}",
        "items": [
            {"name": "Hair Cut", "quantity": 1},
            {"name": "Hair Color", "quantity": 1}
        ],
        "total_amount": 2500.00
    }
    
    try:
        print("📋 Sending order creation notification...")
        
        response = requests.post(f"{BASE_URL}/order-created", json=sample_order)
        result = response.json()
        
        if result.get('success'):
            print("✅ Order notification sent successfully!")
            return True
        else:
            print("❌ Order notification failed:", result.get('error'))
            return False
            
    except Exception as e:
        print("❌ Failed to send order notification:", e)
        return False

def test_appointment_reminder():
    """Test appointment reminder"""
    phone = input("Enter phone number for appointment reminder test: ")
    
    if not phone:
        print("❌ Phone number required")
        return False
    
    appointment_data = {
        "client_name": "Jane Smith",
        "client_phone": phone,
        "service": "Hair Cut & Style",
        "date": "15/12/2024",
        "time": "2:30 PM"
    }
    
    try:
        print("⏰ Sending appointment reminder...")
        
        response = requests.post(f"{BASE_URL}/appointment-reminder", json=appointment_data)
        result = response.json()
        
        if result.get('success'):
            print("✅ Appointment reminder sent successfully!")
            return True
        else:
            print("❌ Appointment reminder failed:", result.get('error'))
            return False
            
    except Exception as e:
        print("❌ Failed to send appointment reminder:", e)
        return False

def main():
    """Main test function"""
    print("🎉 WhatsApp Automation Test Suite")
    print("=" * 50)
    print("This script will test the WhatsApp automation functionality.")
    print("Make sure the Flask server is running on localhost:5000")
    print()
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/api/whatsapp/test")
        if response.status_code != 200:
            print("❌ Flask server not responding. Please start the server first:")
            print("   cd backend && source .venv/bin/activate && python app.py")
            return
    except:
        print("❌ Flask server not running. Please start the server first:")
        print("   cd backend && source .venv/bin/activate && python app.py")
        return
    
    print("✅ Flask server is running")
    print()
    
    # Run tests
    tests = {
        "1": ("WhatsApp Service", test_whatsapp_service),
        "2": ("Send Message", test_send_message),
        "3": ("Order Notification", test_order_notification),
        "4": ("Appointment Reminder", test_appointment_reminder)
    }
    
    while True:
        print("\nAvailable Tests:")
        for key, (name, _) in tests.items():
            print(f"  {key}. {name}")
        print("  q. Quit")
        
        choice = input("\nSelect test to run (1-4 or q): ").strip()
        
        if choice.lower() == 'q':
            break
        
        if choice in tests:
            name, test_func = tests[choice]
            print(f"\n🔄 Running {name} test...")
            try:
                success = test_func()
                if success:
                    print(f"✅ {name} test completed successfully!")
                else:
                    print(f"❌ {name} test failed!")
            except KeyboardInterrupt:
                print("\n⚠️  Test interrupted by user")
            except Exception as e:
                print(f"❌ {name} test failed with error: {e}")
        else:
            print("Invalid choice. Please select 1-4 or q.")
    
    print("\n🎉 Test session completed!")

if __name__ == "__main__":
    main() 