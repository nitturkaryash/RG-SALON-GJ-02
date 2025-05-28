import time
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import os
import argparse
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhatsAppSeleniumService:
    def __init__(self):
        self.driver = None
        self.is_logged_in = False
        self.default_country_code = "+91"  # Change this to your country code
        self.wait_timeout = 30
        # Define a persistent path for the user data directory - making it unique for testing
        # self.user_data_dir = os.path.join(os.path.expanduser("~"), ".whatsapp_selenium_profile")
        self.user_data_dir = os.path.join(os.path.expanduser("~"), f".whatsapp_selenium_profile_selenium_instance_{int(time.time())}")
        
    def _setup_driver(self):
        """Setup Chrome driver with appropriate options."""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            # Ensure the profile directory exists
            if not os.path.exists(self.user_data_dir):
                os.makedirs(self.user_data_dir)
            chrome_options.add_argument(f"--user-data-dir={self.user_data_dir}")
            
            # Optional: Run headless if you don't need to see the browser
            # chrome_options.add_argument("--headless=new") # Use "--headless=new" for modern Chrome
            # chrome_options.add_argument("--disable-gpu") # Often needed for headless

            # Keep browser open (for development/testing) - consider if needed for production
            # chrome_options.add_experimental_option("detach", True)
            
            # Setup Chrome service
            # Ensure ChromeDriver is in PATH or specify its location
            try:
                service = Service(ChromeDriverManager().install())
            except Exception as e:
                logger.error(f"Failed to automatically install ChromeDriver: {e}")
                logger.info("Ensure ChromeDriver is in your PATH or specify the executable_path for Service.")
                # Example if ChromeDriver is manually placed:
                # service = Service(executable_path=\'/path/to/chromedriver\')
                raise # Re-raise the exception if chromedriver setup fails critically

            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.maximize_window() # Optional, may not be needed for headless
            
            logger.info(f"✅ Chrome driver setup successful with user data dir: {self.user_data_dir}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to setup Chrome driver: {str(e)}")
            return False
    
    def format_phone_number(self, phone: str) -> str:
        """Format phone number to include country code if not present."""
        if not phone:
            return None
        
        # Remove any spaces, dashes, or special characters except +
        phone = ''.join(c for c in phone if c.isdigit() or c == '+')
        
        # Add country code if not present
        if not phone.startswith('+'):
            if phone.startswith(self.default_country_code.replace('+', '')):
                phone = '+' + phone
            else:
                phone = self.default_country_code + phone
        
        return phone
    
    def login_to_whatsapp_web(self) -> Dict:
        """Login to WhatsApp Web and wait for QR code scan."""
        try:
            if not self.driver:
                if not self._setup_driver():
                    return {"success": False, "error": "Failed to setup browser"}
            
            logger.info("🌐 Opening WhatsApp Web...")
            self.driver.get("https://web.whatsapp.com")
            
            # Wait for either QR code or chat list (if already logged in)
            try:
                # Check if already logged in (chat list appears)
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
                )
                self.is_logged_in = True
                logger.info("✅ Already logged in to WhatsApp Web")
                return {"success": True, "message": "Already logged in"}
                
            except TimeoutException:
                # Not logged in, wait for QR code scan
                logger.info("📱 Please scan the QR code with your phone...")
                
                # Wait for QR code to appear
                try:
                    WebDriverWait(self.driver, 30).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-ref]'))
                    )
                    logger.info("📋 QR code displayed. Waiting for scan...")
                    
                    # Wait for successful login (chat list appears)
                    WebDriverWait(self.driver, 120).until(  # 2 minutes timeout
                        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
                    )
                    
                    self.is_logged_in = True
                    logger.info("✅ Successfully logged in to WhatsApp Web")
                    return {"success": True, "message": "Successfully logged in"}
                    
                except TimeoutException:
                    return {"success": False, "error": "QR code scan timeout. Please try again."}
                    
        except Exception as e:
            logger.error(f"❌ WhatsApp Web login failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_message(self, phone: str, message: str) -> Dict:
        """Send WhatsApp message to a phone number."""
        try:
            if not self.driver: # Ensure driver is setup if called directly
                if not self._setup_driver():
                    return {"success": False, "error": "Failed to setup browser for send_message"}

            if not self.is_logged_in:
                login_result = self.login_to_whatsapp_web()
                if not login_result["success"]:
                    return login_result
            
            formatted_phone = self.format_phone_number(phone)
            if not formatted_phone:
                return {"success": False, "error": "Invalid phone number"}
            
            logger.info(f"📤 Sending message to {formatted_phone}")
            
            # Navigate to chat with the phone number
            chat_url = f"https://web.whatsapp.com/send?phone={formatted_phone.replace('+', '')}"
            self.driver.get(chat_url)
            
            # Wait for chat to load
            try:
                # Wait for message input box
                message_box = WebDriverWait(self.driver, 30).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="message-composer"] div[contenteditable="true"]'))
                )
                
                # Clear any existing text and type the message
                message_box.clear()
                message_box.send_keys(message)
                
                # Wait a moment for the message to be typed
                time.sleep(2)
                
                # Find and click send button
                send_button = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="send"]')
                send_button.click()
                
                # Wait to ensure message is sent
                time.sleep(3)
                
                logger.info("✅ Message sent successfully")
                return {
                    "success": True,
                    "message": "Message sent successfully",
                    "phone": formatted_phone,
                    "sent_at": datetime.now().isoformat()
                }
                
            except TimeoutException:
                return {"success": False, "error": "Could not find message input. Please check if WhatsApp Web is properly loaded."}
            except NoSuchElementException:
                return {"success": False, "error": "Could not find send button. Message might not have been typed correctly."}
                
        except Exception as e:
            logger.error(f"❌ Error sending message: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_message_to_existing_chat(self, contact_name: str, message: str) -> Dict:
        """Send message to an existing chat by contact name."""
        try:
            if not self.is_logged_in:
                login_result = self.login_to_whatsapp_web()
                if not login_result["success"]:
                    return login_result
            
            logger.info(f"📤 Sending message to {contact_name}")
            
            # Go to WhatsApp Web main page
            self.driver.get("https://web.whatsapp.com")
            
            # Wait for chat list to load
            WebDriverWait(self.driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
            )
            
            # Search for the contact
            search_box = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="search"] input')
            search_box.clear()
            search_box.send_keys(contact_name)
            
            time.sleep(2)
            
            # Click on the first search result
            first_result = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="chat-list"] > div:first-child'))
            )
            first_result.click()
            
            # Wait for chat to open and find message input
            message_box = WebDriverWait(self.driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="message-composer"] div[contenteditable="true"]'))
            )
            
            # Type and send message
            message_box.clear()
            message_box.send_keys(message)
            time.sleep(2)
            
            send_button = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="send"]')
            send_button.click()
            
            time.sleep(3)
            
            logger.info("✅ Message sent to existing chat")
            return {
                "success": True,
                "message": "Message sent successfully",
                "contact": contact_name,
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error sending message to existing chat: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_unread_messages(self) -> Dict:
        """Get list of unread messages (for future use)."""
        try:
            if not self.is_logged_in:
                return {"success": False, "error": "Not logged in"}
            
            # This is a placeholder for future implementation
            # You can extend this to read unread messages
            
            return {"success": True, "unread_messages": []}
            
        except Exception as e:
            logger.error(f"❌ Error getting unread messages: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def close(self):
        """Close the browser driver."""
        try:
            if self.driver:
                self.driver.quit()
                self.driver = None
                self.is_logged_in = False
                logger.info("👋 Browser closed")
        except Exception as e:
            logger.error(f"❌ Error closing browser: {str(e)}")
    
    def __del__(self):
        self.close()

class SalonMessageTemplates:
    """Templates for different salon operations."""
    
    @staticmethod
    def order_created(client_name: str, order_id: str, items: list, total_amount: float) -> str:
        """Template for new order creation."""
        items_text = "\n".join([f"• {item['name']} - Qty: {item['quantity']}" for item in items])
        
        return f"""🎉 *New Order Created* 🎉

*Client:* {client_name}
*Order ID:* #{order_id}
*Date:* {datetime.now().strftime('%d/%m/%Y %H:%M')}

*Items:*
{items_text}

*Total Amount:* ₹{total_amount:.2f}

Thank you for choosing our salon! 💄✨"""
    
    @staticmethod
    def order_updated(client_name: str, order_id: str, status: str, items: list = None) -> str:
        """Template for order updates."""
        items_text = ""
        if items:
            items_text = "\n*Updated Items:*\n" + "\n".join([f"• {item['name']} - Qty: {item['quantity']}" for item in items])
        
        return f"""📝 *Order Updated* 📝

*Client:* {client_name}
*Order ID:* #{order_id}
*New Status:* {status}
*Updated:* {datetime.now().strftime('%d/%m/%Y %H:%M')}
{items_text}

We'll keep you posted on any further updates! 💅"""
    
    @staticmethod
    def order_deleted(client_name: str, order_id: str, reason: str = None) -> str:
        """Template for order cancellation."""
        reason_text = f"\n*Reason:* {reason}" if reason else ""
        
        return f"""❌ *Order Cancelled* ❌

*Client:* {client_name}
*Order ID:* #{order_id}
*Cancelled:* {datetime.now().strftime('%d/%m/%Y %H:%M')}
{reason_text}

If you have any questions, please contact us. We're here to help! 🤝"""
    
    @staticmethod
    def appointment_reminder(client_name: str, service: str, date: str, time: str) -> str:
        """Template for appointment reminders."""
        return f"""⏰ *Appointment Reminder* ⏰

Hi {client_name}! 👋

This is a friendly reminder about your upcoming appointment:

*Service:* {service}
*Date:* {date}
*Time:* {time}

Please arrive 10 minutes early. Looking forward to seeing you! ✨

Reply CONFIRM to confirm your appointment."""
    
    @staticmethod
    def inventory_low_stock(item_name: str, current_stock: int, min_threshold: int) -> str:
        """Template for low stock alerts."""
        return f"""⚠️ *Low Stock Alert* ⚠️

*Item:* {item_name}
*Current Stock:* {current_stock}
*Minimum Required:* {min_threshold}

Please reorder this item soon to avoid stockouts! 📦"""
    
    @staticmethod
    def client_welcome(client_name: str, phone: str) -> str:
        """Template for new client welcome."""
        return f"""🌟 *Welcome to Our Salon!* 🌟

Hi {client_name}! 👋

Thank you for choosing us! We're excited to have you as our client.

*Your Details:*
*Name:* {client_name}
*Phone:* {phone}

We'll send you updates about your appointments and special offers.

Welcome to the family! 💕"""

# Global instance for the service
whatsapp_service = None

def get_whatsapp_service():
    """Get or create WhatsApp service instance."""
    global whatsapp_service
    if whatsapp_service is None:
        whatsapp_service = WhatsAppSeleniumService()
    return whatsapp_service

# Main execution block for command-line usage
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WhatsApp Selenium Service CLI")
    parser.add_argument("--action", type=str, required=True, choices=['send_message', 'login', 'send_to_existing_chat'], help="Action to perform (e.g., send_message)")
    parser.add_argument("--phone", type=str, help="Phone number for the action (required for send_message)")
    parser.add_argument("--message", type=str, help="Message content for the action (required for send_message, send_to_existing_chat)")
    parser.add_argument("--contact_name", type=str, help="Contact name for sending to existing chat")
    # Add other arguments as needed for different actions

    args = parser.parse_args()

    # Use a single service instance for the CLI execution.
    # The user_data_dir in __init__ will handle session persistence.
    service = WhatsAppSeleniumService() 
    result = None

    try:
        if args.action == "send_message":
            if not args.phone or not args.message:
                result = {"success": False, "error": "Phone and message are required for send_message action"}
            else:
                # login_to_whatsapp_web will be called by send_message if not logged in
                result = service.send_message(args.phone, args.message)
        elif args.action == "send_to_existing_chat":
            if not args.contact_name or not args.message:
                result = {"success": False, "error": "Contact name and message are required for send_to_existing_chat action"}
            else:
                result = service.send_message_to_existing_chat(args.contact_name, args.message)
        elif args.action == "login":
            result = service.login_to_whatsapp_web()
            # For login action, explicitly keep it alive for a bit if not detached, or provide clear instructions
            if result.get("success") and "Successfully logged in" in result.get("message", ""):
                logger.info("Login successful. The session is now stored in the profile. You can close this manually if the browser doesn't close automatically, or the script can be terminated.")
            elif result.get("success") and "Already logged in" in result.get("message", ""):
                 logger.info("Already logged in. Session is active.")

        else:
            result = {"success": False, "error": f"Unknown action: {args.action}"}
    except Exception as e:
        logger.error(f"Error during CLI action '{args.action}': {e}")
        result = {"success": False, "error": str(e)}
    finally:
        if result:
            print(json.dumps(result)) # Print result as JSON
        
        # Decide on closing strategy. For CLI send_message, it should close.
        # For initial login, user might need time or script might need to indicate it can be closed.
        if args.action == "send_message" or args.action == "send_to_existing_chat" or (args.action == "login" and not service.is_logged_in):
             # Delay slightly to ensure message is processed by WhatsApp Web if sent
            if args.action == "send_message" or args.action == "send_to_existing_chat":
                time.sleep(5) # Give a few seconds for message to go through UI
            service.close()
        elif args.action == "login" and service.is_logged_in :
            logger.info("Browser session is active and logged in. Close browser manually or it will close if script is terminated.")
            # service.close() # Or close after a delay / specific condition

    # The service.close() will be called by __del__ when the script ends
    # or you can explicitly call it if needed:
    # service.close() 