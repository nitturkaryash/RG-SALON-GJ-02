import React, { useState } from 'react';
import { sendTemplateMessage, sendAppointmentConfirmation, sendAppointmentUpdate, sendAppointmentCancellation } from '../utils/whatsapp';
import { Button, TextField, Typography, Box, Card, CardContent, Grid, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Divider, RadioGroup, Radio, FormControlLabel, FormLabel } from '@mui/material';

export default function TestTemplates() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('appointment_confirmation');
  const [headerType, setHeaderType] = useState<'image' | 'text'>('image');
  const [headerValue, setHeaderValue] = useState('https://placehold.co/400x225/e4e6eb/ffffff.png?text=Salon+Logo');
  const [status, setStatus] = useState<{success?: boolean; message: string}>({ message: '' });

  const templates = {
    appointment_confirmation: 'Appointment Confirmation',
    appointment_reminder: 'Appointment Reminder',
    appointment_change: 'Appointment Change',
    appointment_cancellation: 'Appointment Cancellation',
  };

  const handleSendTemplate = async () => {
    setLoading(true);
    try {
      // Generate a unique ID for the appointment
      const uniqueId = Math.random().toString(36).substring(2, 10);
      
      // Sample data for testing
      const testData = {
        clientName: clientName,
        clientPhone: phone,
        services: ['Haircut', 'Color Treatment'],
        stylists: ['John Doe'],
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        notes: 'Test appointment',
        id: uniqueId
      };

      let result;
      switch (selectedTemplate) {
        case 'appointment_confirmation':
          result = await sendAppointmentConfirmation({
            ...testData,
            // Override the default image with our test image
            _headerOverride: { type: headerType, value: headerValue }
          });
          break;
        case 'appointment_reminder':
          result = await sendTemplateMessage(
            phone,
            'appointment_reminder',
            [
              clientName,
              'Monday, May 15, 2023',
              '10:00 AM', 
              'Haircut, Color Treatment', 
              'John Doe',
              '+918956860024'
            ],
            { type: headerType, value: headerValue }
          );
          break;
        case 'appointment_change':
          result = await sendAppointmentUpdate({
            ...testData,
            // Override the default image with our test image
            _headerOverride: { type: headerType, value: headerValue }
          });
          break;
        case 'appointment_cancellation':
          result = await sendAppointmentCancellation({
            ...testData,
            // Override the default image with our test image
            _headerOverride: { type: headerType, value: headerValue }
          });
          break;
      }

      setStatus({
        success: true,
        message: `Template ${selectedTemplate} sent successfully!`
      });
      console.log('Template sent successfully:', result);
    } catch (error) {
      console.error('Failed to send template:', error);
      setStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        WhatsApp Template Test
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Send Template Message
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number (with country code)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919876543210"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="template-label">Template</InputLabel>
                <Select
                  labelId="template-label"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  label="Template"
                >
                  {Object.entries(templates).map(([key, name]) => (
                    <MenuItem key={key} value={key}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Header Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Message Header Options
              </Typography>
              
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Header Type</FormLabel>
                <RadioGroup 
                  row 
                  value={headerType} 
                  onChange={(e) => setHeaderType(e.target.value as 'image' | 'text')}
                >
                  <FormControlLabel value="image" control={<Radio />} label="Image" />
                  <FormControlLabel value="text" control={<Radio />} label="Text" />
                </RadioGroup>
              </FormControl>
              
              <TextField
                fullWidth
                label={headerType === 'image' ? "Image URL" : "Header Text"}
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
                placeholder={headerType === 'image' ? "https://example.com/image.jpg" : "APPOINTMENT DETAILS"}
                variant="outlined"
                margin="normal"
              />
              
              {headerType === 'image' && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Preview (if URL is valid):
                  </Typography>
                  <img 
                    src={headerValue} 
                    alt="Header preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '150px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/e4e6eb/ffffff.png?text=Invalid+URL';
                    }}
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendTemplate}
                disabled={loading || !phone || !clientName}
                fullWidth
              >
                {loading ? 'Sending...' : 'Send Template'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Template Information
          </Typography>
          <Typography variant="body1">
            Make sure the following templates are approved in your WhatsApp Business Manager:
          </Typography>
          <ul>
            <li><strong>appointment_confirmation</strong> - For new appointments</li>
            <li><strong>appointment_reminder</strong> - For upcoming appointments</li>
            <li><strong>appointment_change</strong> - For updated appointments</li>
            <li><strong>appointment_cancellation</strong> - For cancelled appointments</li>
          </ul>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Text Headers in WhatsApp Templates
          </Typography>
          <Typography variant="body1" paragraph>
            All templates use text headers that:
          </Typography>
          <ul>
            <li><strong>Provide immediate context</strong> - Customers see the purpose immediately</li>
            <li><strong>Improve readability</strong> - Makes messages stand out in chat lists</li>
            <li><strong>Create consistency</strong> - Professional, standardized look</li>
            <li><strong>Meet WhatsApp requirements</strong> - Approved format for business messaging</li>
          </ul>
        </CardContent>
      </Card>

      <Snackbar
        open={!!status.message}
        autoHideDuration={6000}
        onClose={() => setStatus({ message: '' })}
      >
        <Alert severity={status.success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {status.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 