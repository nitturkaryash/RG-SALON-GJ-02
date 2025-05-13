import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { sendDirectTextMessage } from '../utils/whatsapp';

const WhatsappDirectTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('9021264696');
  const [message, setMessage] = useState('This is a test message from RG Salon app. If you receive this, WhatsApp integration is working!');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean; error?: string; data?: any}>({});

  const handleSendMessage = async () => {
    setIsLoading(true);
    setResult({});
    
    try {
      console.log('Sending direct WhatsApp message to:', phoneNumber);
      const response = await sendDirectTextMessage(phoneNumber, message);
      
      console.log('WhatsApp API response:', response);
      setResult({
        success: true,
        data: response
      });
      
      alert('Message sent successfully! Check the phone.');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      alert('Failed to send message. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          WhatsApp Direct Test
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            placeholder="Enter phone number (e.g., 9021264696)"
          />
          
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSendMessage}
            disabled={isLoading || !phoneNumber || !message}
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Message'}
          </Button>
        </Box>
        
        {result.success && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="body1" color="success.main">
              ✅ Message sent successfully!
            </Typography>
            <Typography variant="caption" component="pre" sx={{ mt: 1, overflow: 'auto', maxHeight: 200 }}>
              {JSON.stringify(result.data, null, 2)}
            </Typography>
          </Box>
        )}
        
        {result.error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography variant="body1" color="error">
              ❌ Error: {result.error}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default WhatsappDirectTest; 