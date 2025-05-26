import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chatJid, limit = 50 } = req.body;

    if (!chatJid) {
      return res.status(400).json({ error: 'Chat JID is required' });
    }

    // This would integrate with the WhatsApp MCP server's list_messages tool
    // For now, we'll simulate the response structure
    const mockMessages = [
      {
        id: 'msg_1',
        chatJid,
        content: 'Hello! I would like to book an appointment.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        fromMe: false,
        messageType: 'text'
      },
      {
        id: 'msg_2',
        chatJid,
        content: 'Sure! What service are you looking for?',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        fromMe: true,
        messageType: 'text'
      },
      {
        id: 'msg_3',
        chatJid,
        content: 'Hair cut and styling please.',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        fromMe: false,
        messageType: 'text'
      },
      {
        id: 'msg_4',
        chatJid,
        content: 'Great! Here are our available slots...',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        fromMe: true,
        messageType: 'text'
      },
      {
        id: 'msg_5',
        chatJid,
        content: 'image.jpg',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        fromMe: false,
        messageType: 'image',
        mediaPath: '/uploads/image.jpg'
      }
    ];

    // Limit the number of messages returned
    const limitedMessages = mockMessages.slice(0, limit);

    res.status(200).json({ messages: limitedMessages });
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({ error: 'Failed to list messages' });
  }
} 