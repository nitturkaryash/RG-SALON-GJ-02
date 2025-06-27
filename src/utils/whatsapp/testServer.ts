import express from 'express';
import { WhatsAppService } from '../../whatsapp/business-api/services/whatsappService.js';

const app = express();
app.use(express.json());

const PORT = 3001;

app.post('/test', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    console.log('Sending test message to:', phoneNumber);
    const result = await WhatsAppService.sendTestMessage(phoneNumber);
    console.log('Test message result:', result);

    if (result.success) {
      return res.json({ 
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
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
}); 