import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This would integrate with the WhatsApp MCP server's list_chats tool
    // For now, we'll simulate the response structure
    const mockChats = [
      {
        jid: '919876543210@s.whatsapp.net',
        name: 'John Doe',
        isGroup: false,
        lastMessage: 'Thanks for the great service!',
        unreadCount: 2
      },
      {
        jid: '919876543211@s.whatsapp.net',
        name: 'Jane Smith',
        isGroup: false,
        lastMessage: 'Can I book an appointment?',
        unreadCount: 0
      },
      {
        jid: '120363025246781234@g.us',
        name: 'Salon Staff Group',
        isGroup: true,
        lastMessage: 'Meeting at 5 PM today',
        unreadCount: 5
      }
    ];

    res.status(200).json({ chats: mockChats });
  } catch (error) {
    console.error('Error listing chats:', error);
    res.status(500).json({ error: 'Failed to list chats' });
  }
} 