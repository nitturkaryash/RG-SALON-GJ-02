import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // For now, just return a success response
    // You can integrate your WhatsApp service here later
    return res.status(200).json({ 
      success: true, 
      message: 'Test endpoint working',
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process request' 
    });
  }
}
