#!/usr/bin/env node

/**
 * WhatsApp Business API Diagnostic Script
 * 
 * This script diagnoses why WhatsApp messages aren't being delivered
 * and provides solutions for common issues.
 */

const WHATSAPP_TOKEN = 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD';
const PHONE_NUMBER_ID = '649515451575660';
const BUSINESS_ACCOUNT_ID = '593695986423772';
const TARGET_PHONE = '9021264696';

console.log('🔍 WhatsApp Business API Diagnostic Tool');
console.log('=' .repeat(50));
console.log(`📱 Target Number: ${TARGET_PHONE}`);
console.log(`⏰ Diagnostic Time: ${new Date().toLocaleString('en-IN')}`);
console.log('');

async function checkTokenValidity() {
  console.log('1️⃣ Checking WhatsApp Business API Token...');
  
  try {
    const response = await fetch('https://graph.facebook.com/v21.0/me', {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token is VALID');
      console.log(`   App Name: ${data.name || 'Unknown'}`);
      console.log(`   App ID: ${data.id || 'Unknown'}`);
      return true;
    } else {
      console.log('❌ Token is INVALID or EXPIRED');
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      console.log(`   Error Code: ${data.error?.code || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error checking token');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkPhoneNumberStatus() {
  console.log('\n2️⃣ Checking Phone Number Configuration...');
  
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Phone Number ID is VALID');
      console.log(`   Display Number: ${data.display_phone_number || 'Unknown'}`);
      console.log(`   Verified Name: ${data.verified_name || 'Unknown'}`);
      console.log(`   Status: ${data.status || 'Unknown'}`);
      return true;
    } else {
      console.log('❌ Phone Number ID is INVALID');
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      console.log(`   Error Code: ${data.error?.code || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error checking phone number');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkBusinessAccount() {
  console.log('\n3️⃣ Checking Business Account Status...');
  
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${BUSINESS_ACCOUNT_ID}`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Business Account is ACCESSIBLE');
      console.log(`   Account Name: ${data.name || 'Unknown'}`);
      console.log(`   Account ID: ${data.id || 'Unknown'}`);
      return true;
    } else {
      console.log('❌ Business Account is INACCESSIBLE');
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      console.log(`   Error Code: ${data.error?.code || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error checking business account');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testMessageDelivery() {
  console.log('\n4️⃣ Testing Message Delivery...');
  
  const formattedPhone = `91${TARGET_PHONE}`;
  
  try {
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: `🧪 DIAGNOSTIC TEST

This is a diagnostic test message sent at ${new Date().toLocaleString('en-IN')}.

If you receive this message, the WhatsApp Business API is working correctly!

Message ID: ${Date.now()}

RG Salon Diagnostic Tool 🔧`
      }
    };

    console.log(`📤 Sending test message to ${formattedPhone}...`);
    
    const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Message sent successfully to WhatsApp API');
      console.log(`   Message ID: ${data.messages?.[0]?.id || 'Unknown'}`);
      console.log(`   Contact Input: ${data.contacts?.[0]?.input || 'Unknown'}`);
      console.log(`   WhatsApp ID: ${data.contacts?.[0]?.wa_id || 'Unknown'}`);
      return { success: true, data };
    } else {
      console.log('❌ Message failed to send');
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      console.log(`   Error Code: ${data.error?.code || 'Unknown'}`);
      console.log(`   Error Subcode: ${data.error?.error_subcode || 'Unknown'}`);
      
      // Specific error handling
      if (data.error?.code === 132000) {
        console.log('');
        console.log('🚨 CRITICAL: Recipient must opt-in first!');
        console.log(`   The number ${TARGET_PHONE} needs to send a message to your business WhatsApp number first.`);
        console.log('   This is a WhatsApp Business API requirement for the first message.');
      }
      
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Network error sending message');
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkMessageTemplates() {
  console.log('\n5️⃣ Checking Available Message Templates...');
  
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${BUSINESS_ACCOUNT_ID}/message_templates`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Found ${data.data?.length || 0} message templates`);
      if (data.data && data.data.length > 0) {
        data.data.slice(0, 3).forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (${template.status})`);
        });
        if (data.data.length > 3) {
          console.log(`   ... and ${data.data.length - 3} more templates`);
        }
      } else {
        console.log('   No templates found. This might explain delivery issues.');
      }
      return true;
    } else {
      console.log('❌ Could not retrieve templates');
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error checking templates');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function provideSolutions(tokenValid, phoneValid, businessValid, messageResult) {
  console.log('\n📋 DIAGNOSTIC SUMMARY & SOLUTIONS');
  console.log('=' .repeat(50));
  
  if (!tokenValid) {
    console.log('❌ ISSUE: Invalid WhatsApp Business API Token');
    console.log('💡 SOLUTION:');
    console.log('   1. Check if the token has expired (tokens expire every 60 days)');
    console.log('   2. Generate a new token from Facebook Developer Console');
    console.log('   3. Update the token in your environment variables');
    console.log('');
  }
  
  if (!phoneValid) {
    console.log('❌ ISSUE: Invalid Phone Number ID');
    console.log('💡 SOLUTION:');
    console.log('   1. Verify the Phone Number ID in Facebook Business Manager');
    console.log('   2. Ensure the phone number is properly verified');
    console.log('   3. Check if the phone number is still active');
    console.log('');
  }
  
  if (!businessValid) {
    console.log('❌ ISSUE: Business Account Access Problem');
    console.log('💡 SOLUTION:');
    console.log('   1. Check Business Manager permissions');
    console.log('   2. Verify business account is still active');
    console.log('   3. Ensure proper role assignments');
    console.log('');
  }
  
  if (messageResult && !messageResult.success) {
    if (messageResult.error?.code === 132000) {
      console.log('❌ ISSUE: Recipient Opt-in Required (Error 132000)');
      console.log('💡 SOLUTION:');
      console.log(`   1. Ask the person with phone ${TARGET_PHONE} to send ANY message`);
      console.log('   2. They should send it to your business WhatsApp number: +91-8956860024');
      console.log('   3. The message can be anything like "Hi" or "Hello"');
      console.log('   4. After they send the message, try sending notifications again');
      console.log('   5. This is a one-time requirement per recipient');
      console.log('');
    } else if (messageResult.error?.code === 131047) {
      console.log('❌ ISSUE: Template Message Required');
      console.log('💡 SOLUTION:');
      console.log('   1. For first-time contact, use approved message templates');
      console.log('   2. Create templates in Facebook Business Manager');
      console.log('   3. Get templates approved by WhatsApp');
      console.log('');
    } else if (messageResult.error?.code === 100) {
      console.log('❌ ISSUE: Invalid Parameter');
      console.log('💡 SOLUTION:');
      console.log('   1. Check phone number format');
      console.log('   2. Verify message content and structure');
      console.log('   3. Ensure all required fields are present');
      console.log('');
    }
  }
  
  if (tokenValid && phoneValid && businessValid && messageResult?.success) {
    console.log('✅ ALL SYSTEMS OPERATIONAL!');
    console.log('💬 If messages are still not arriving, check:');
    console.log('   1. WhatsApp app is installed and active on target device');
    console.log('   2. Device has internet connection');
    console.log('   3. WhatsApp notifications are enabled');
    console.log('   4. Check spam/blocked messages folder in WhatsApp');
    console.log('   5. Recipient may need to opt-in first (send a message to your business number)');
    console.log('');
  }
  
  console.log('📞 For WhatsApp Business API Support:');
  console.log('   • Facebook Business Support: https://business.facebook.com/help');
  console.log('   • WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp');
  console.log('   • Business Phone: +91-8956860024');
}

async function main() {
  try {
    const tokenValid = await checkTokenValidity();
    const phoneValid = await checkPhoneNumberStatus();
    const businessValid = await checkBusinessAccount();
    const messageResult = await testMessageDelivery();
    await checkMessageTemplates();
    
    provideSolutions(tokenValid, phoneValid, businessValid, messageResult);
    
    console.log('\n🏁 Diagnostic Complete!');
    console.log('📱 Check WhatsApp on', TARGET_PHONE, 'for the test message.');
    
  } catch (error) {
    console.log('\n❌ Diagnostic failed with error:', error.message);
  }
}

// Run the diagnostic
main(); 