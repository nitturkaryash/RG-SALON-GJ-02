import { NextApiRequest, NextApiResponse } from 'next';
import { WhatsAppService } from '../../../whatsapp/business-api/services/whatsappService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await WhatsAppService.sendTestMessage(phoneNumber);

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Test message sent successfully',
        data: result.data 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send test message' 
    });
  }
} 