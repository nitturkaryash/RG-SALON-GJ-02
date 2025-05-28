import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API CALLED] /api/whatsapp/appointment-notification reached');
  if (req.method === 'POST') {
    return res.status(200).json({ message: 'API endpoint reached successfully (POST)' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 