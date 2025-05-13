import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { sendManualNotification } from '../hooks/useAppointments';
import { toast } from 'react-hot-toast';
import { sendDirectTextMessage } from '../utils/whatsapp';

const TestNotifications = () => {
  const [appointmentId, setAppointmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hello! This is a test message from RG Salon.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Test appointment notification
  const handleTestAppointmentNotification = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      if (!appointmentId) {
        setError('Please enter an appointment ID');
        return;
      }
      
      await sendManualNotification(appointmentId);
      setResult({ success: true, message: 'Notification sent successfully' });
      
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test direct text message
  const handleSendDirectText = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      if (!phoneNumber) {
        setError('Please enter a phone number');
        return;
      }
      
      // Send direct message using direct utility
      const response = await sendDirectTextMessage(phoneNumber, message);
      console.log('Direct message response:', response);
      
      setResult({ 
        success: true, 
        message: 'Direct message sent successfully',
        response
      });
      
      toast.success('Message sent successfully!');
      
    } catch (err) {
      console.error('Error sending direct message:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to send message: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test WhatsApp Notifications
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {result && result.success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {result.message}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Test Appointment Notification
          </Typography>
          <TextField
            fullWidth
            label="Appointment ID"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            margin="normal"
            size="small"
          />
          <Button 
            variant="contained" 
            onClick={handleTestAppointmentNotification}
            disabled={isLoading || !appointmentId}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Sending...' : 'Test Notification'}
          </Button>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Send Direct Text Message
          </Typography>
          <TextField
            fullWidth
            label="Phone Number"
            placeholder="ex: 9021264696"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
          />
          <Button 
            variant="contained" 
            onClick={handleSendDirectText}
            disabled={isLoading || !phoneNumber}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestNotifications; 