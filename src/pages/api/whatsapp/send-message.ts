import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipient, message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    // This would integrate with the WhatsApp MCP server's send_message tool
    // For now, we'll simulate the response
    console.log(`Sending message to ${recipient}: ${message}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    const response = {
      success: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient,
      message
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
} 