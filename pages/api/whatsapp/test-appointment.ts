import { NextApiRequest, NextApiResponse } from 'next';
import { testWhatsAppIntegration } from '../../../../src/whatsapp/open-source/services/whatsappWebService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    console.log(`[WhatsApp Test] Testing WhatsApp integration with phone: ${phoneNumber}`);

    // Test the WhatsApp integration
    const result = await testWhatsAppIntegration(phoneNumber);

    return res.status(200).json({
      success: true,
      message: 'WhatsApp test completed',
      data: result
    });

  } catch (error) {
    console.error('[WhatsApp Test] Error testing WhatsApp integration:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : null
    });
  }
} 