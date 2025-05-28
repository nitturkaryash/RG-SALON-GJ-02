import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const recipient = Array.isArray(fields.recipient) ? fields.recipient[0] : fields.recipient;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!recipient || !file) {
      return res.status(400).json({ error: 'Recipient and file are required' });
    }

    // Ensure upload directory exists
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // This would integrate with the WhatsApp MCP server's send_file tool
    console.log(`Sending file to ${recipient}: ${file.originalFilename}`);

    // Mock successful response
    const response = {
      success: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient,
      fileName: file.originalFilename,
      fileSize: file.size,
      filePath: file.filepath
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error sending file:', error);
    res.status(500).json({ error: 'Failed to send file' });
  }
} 