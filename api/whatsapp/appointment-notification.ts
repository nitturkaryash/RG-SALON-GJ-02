import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[API CALLED] /api/whatsapp/appointment-notification reached');
  if (req.method === 'POST') {
    // In a real scenario, you'd process req.body here
    // and call the actual WhatsApp sending logic.
    // For now, just confirming the endpoint works.
    console.log('Request body:', req.body);
    return res.status(200).json({ message: 'API endpoint reached successfully (POST)' });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 