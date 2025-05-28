import pywhatkit as kit
import time
from datetime import datetime, timedelta
import logging
import os
from typing import Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.default_country_code = "+91"  # Change this to your country code
        self.message_delay_minutes = 2  # Minimum delay for message sending
    
    def format_phone_number(self, phone: str) -> str:
        """Format phone number to include country code if not present."""
        if not phone:
            return None
        
        # Remove any spaces or special characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Add country code if not present
        if not phone.startswith(self.default_country_code.replace('+', '')):
            phone = self.default_country_code + phone
        else:
            phone = '+' + phone
        
        return phone
    
    def send_message(self, phone: str, message: str, delay_minutes: int = None) -> Dict:
        """Send WhatsApp message using PyWhatKit."""
        try:
            formatted_phone = self.format_phone_number(phone)
            if not formatted_phone:
                return {"success": False, "error": "Invalid phone number"}
            
            # Calculate send time (current time + delay)
            if delay_minutes is None:
                delay_minutes = self.message_delay_minutes
            
            send_time = datetime.now() + timedelta(minutes=delay_minutes)
            hour = send_time.hour
            minute = send_time.minute
            
            logger.info(f"Scheduling WhatsApp message to {formatted_phone} at {hour}:{minute}")
            
            # Send message using PyWhatKit
            kit.sendwhatmsg(formatted_phone, message, hour, minute)
            
            return {
                "success": True,
                "message": f"Message scheduled for {hour}:{minute}",
                "phone": formatted_phone,
                "scheduled_time": send_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_instant_message(self, phone: str, message: str) -> Dict:
        """Send WhatsApp message instantly (requires tab to be open)."""
        try:
            formatted_phone = self.format_phone_number(phone)
            if not formatted_phone:
                return {"success": False, "error": "Invalid phone number"}
            
            logger.info(f"Sending instant WhatsApp message to {formatted_phone}")
            
            # Send instant message (experimental feature)
            kit.sendwhatmsg_instantly(formatted_phone, message, 15, True, 2)
            
            return {
                "success": True,
                "message": "Message sent instantly",
                "phone": formatted_phone
            }
            
        except Exception as e:
            logger.error(f"Error sending instant WhatsApp message: {str(e)}")
            return {"success": False, "error": str(e)}

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