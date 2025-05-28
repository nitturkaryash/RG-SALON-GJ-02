import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TestTube as TestIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface AutoMessageConfig {
  enabled: boolean;
  messageTypes: {
    orderCreated: boolean;
    orderUpdated: boolean;
    orderDeleted: boolean;
    appointmentCreated: boolean;
    appointmentUpdated: boolean;
    appointmentCancelled: boolean;
    inventoryLow: boolean;
    clientWelcome: boolean;
    paymentReceived: boolean;
  };
}

const AutomationSettings: React.FC = () => {
  const [config, setConfig] = useState<AutoMessageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testClientName, setTestClientName] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch current configuration
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      } else {
        toast.error('Failed to load configuration');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save configuration
  const saveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Configuration saved successfully');
        setConfig(data.config);
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/whatsapp/config', {
        method: 'PUT',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Configuration reset to defaults');
        setConfig(data.config);
      } else {
        toast.error('Failed to reset configuration');
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      toast.error('Error resetting configuration');
    } finally {
      setSaving(false);
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!testPhoneNumber || !testClientName) {
      toast.error('Please enter both phone number and client name');
      return;
    }

    try {
      setSendingTest(true);
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          clientName: testClientName,
          appointmentDate: new Date().toISOString(),
          services: [{ name: 'Test Service', price: 100, duration: 30 }],
          stylist: 'Test Stylist',
          messageType: 'confirmation'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Test message sent successfully');
        setTestDialogOpen(false);
        setTestPhoneNumber('');
        setTestClientName('');
      } else {
        toast.error(data.error || 'Failed to send test message');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Error sending test message');
    } finally {
      setSendingTest(false);
    }
  };

  const handleToggleEnabled = () => {
    if (!config) return;
    setConfig({ ...config, enabled: !config.enabled });
  };

  const handleToggleMessageType = (messageType: keyof typeof config.messageTypes) => {
    if (!config) return;
    setConfig({
      ...config,
      messageTypes: {
        ...config.messageTypes,
        [messageType]: !config.messageTypes[messageType]
      }
    });
  };

  const getMessageTypeLabel = (key: string) => {
    const labels: Record<string, string> = {
      orderCreated: 'Order Created',
      orderUpdated: 'Order Updated',
      orderDeleted: 'Order Cancelled',
      appointmentCreated: 'Appointment Created',
      appointmentUpdated: 'Appointment Updated',
      appointmentCancelled: 'Appointment Cancelled',
      inventoryLow: 'Low Stock Alerts',
      clientWelcome: 'Client Welcome',
      paymentReceived: 'Payment Received'
    };
    return labels[key] || key;
  };

  const getMessageTypeDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      orderCreated: 'Send confirmation when new orders are placed',
      orderUpdated: 'Notify when order details are modified',
      orderDeleted: 'Send cancellation notice when orders are deleted',
      appointmentCreated: 'Confirm new appointment bookings',
      appointmentUpdated: 'Notify when appointment details change',
      appointmentCancelled: 'Send cancellation notice for appointments',
      inventoryLow: 'Alert managers when inventory runs low',
      clientWelcome: 'Welcome new clients to the salon',
      paymentReceived: 'Confirm successful payments'
    };
    return descriptions[key] || '';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Alert severity="error">
        Failed to load configuration. Please refresh the page.
      </Alert>
    );
  }

  const enabledCount = Object.values(config.messageTypes).filter(Boolean).length;
  const totalCount = Object.keys(config.messageTypes).length;

  return (
    <Box>
      <Card>
        <CardHeader
          avatar={<WhatsAppIcon color="primary" />}
          title="WhatsApp Automation Settings"
          subheader="Configure automatic messaging for CRUD operations"
          action={
            <Chip 
              label={config.enabled ? 'Enabled' : 'Disabled'} 
              color={config.enabled ? 'success' : 'default'}
              variant="outlined"
            />
          }
        />
        
        <CardContent>
          {/* Master Toggle */}
          <Box mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={handleToggleEnabled}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" component="div">
                    Enable WhatsApp Automation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Master switch to enable/disable all automated WhatsApp messaging
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider />

          {/* Message Type Settings */}
          <Box mt={3} mb={3}>
            <Typography variant="h6" gutterBottom>
              Message Types ({enabledCount}/{totalCount} enabled)
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(config.messageTypes).map(([key, enabled]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enabled}
                            onChange={() => handleToggleMessageType(key as keyof typeof config.messageTypes)}
                            disabled={!config.enabled}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2" component="div">
                              {getMessageTypeLabel(key)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getMessageTypeDescription(key)}
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box mt={3} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={saveConfig}
              disabled={saving}
            >
              Save Configuration
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetToDefaults}
              disabled={saving}
            >
              Reset to Defaults
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={() => setTestDialogOpen(true)}
              disabled={!config.enabled}
            >
              Send Test Message
            </Button>
          </Box>

          {/* Status Information */}
          <Box mt={3}>
            <Alert severity={config.enabled ? 'success' : 'warning'}>
              {config.enabled 
                ? `Automation is active. ${enabledCount} message types are enabled.`
                : 'Automation is disabled. No automatic messages will be sent.'
              }
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Test Message Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test WhatsApp Message</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Phone Number"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="+919876543210"
              fullWidth
            />
            <TextField
              label="Client Name"
              value={testClientName}
              onChange={(e) => setTestClientName(e.target.value)}
              placeholder="John Doe"
              fullWidth
            />
            <Alert severity="info">
              This will send a test appointment confirmation message to verify your WhatsApp setup.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={sendTestMessage}
            variant="contained"
            disabled={sendingTest || !testPhoneNumber || !testClientName}
          >
            {sendingTest ? <CircularProgress size={20} /> : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationSettings; 