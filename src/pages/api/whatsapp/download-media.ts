import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, chatJid } = req.body;

    if (!messageId || !chatJid) {
      return res.status(400).json({ error: 'Message ID and Chat JID are required' });
    }

    // This would integrate with the WhatsApp MCP server's download_media tool
    console.log(`Downloading media for message ${messageId} from chat ${chatJid}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    const response = {
      success: true,
      messageId,
      chatJid,
      filePath: `/uploads/downloaded_${messageId}.jpg`,
      fileName: `media_${messageId}.jpg`,
      fileSize: 1024000,
      mimeType: 'image/jpeg'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error downloading media:', error);
    res.status(500).json({ error: 'Failed to download media' });
  }
} 