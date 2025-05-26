import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    // This would integrate with the WhatsApp MCP server
    // For now, we'll simulate the response structure
    const mockContacts = [
      {
        id: '1',
        name: 'John Doe',
        phone: '+919876543210',
        lastMessage: 'Thanks for the appointment!',
        lastMessageTime: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        phone: '+919876543211',
        lastMessage: 'See you tomorrow',
        lastMessageTime: new Date().toISOString()
      }
    ];

    // Filter contacts based on query
    const filteredContacts = query 
      ? mockContacts.filter(contact => 
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phone.includes(query)
        )
      : mockContacts;

    res.status(200).json({ contacts: filteredContacts });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
} 