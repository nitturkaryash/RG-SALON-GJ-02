import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Message,
  Add,
  Edit,
  Delete,
  Send,
  Schedule,
  People,
  Description,
  Preview,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  category: 'appointment' | 'promotion' | 'reminder' | 'custom';
  usageCount: number;
  lastUsed: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
}

const MessageCenter: React.FC = () => {
  const { templates, sendTestMessage, loading } = useWhatsAppService();
  const [tabValue, setTabValue] = useState(0);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment': return 'primary';
      case 'promotion': return 'success';
      case 'reminder': return 'warning';
      default: return 'default';
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setOpenTemplateDialog(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setOpenTemplateDialog(true);
  };

  const handleSendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setSnackbar({ open: true, message: 'Please enter phone number and message', severity: 'error' });
      return;
    }

    try {
      await sendTestMessage(testPhone, testMessage);
      setSnackbar({ open: true, message: 'Test message sent successfully!', severity: 'success' });
      setTestPhone('');
      setTestMessage('');
      setOpenBulkDialog(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    }
  };

  const TemplateCard = ({ template }: { template: MessageTemplate }) => (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ borderRadius: 3, height: '100%' }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: `${getCategoryColor(template.category)}.main` }}>
              <Description />
            </Avatar>
          }
          title={template.name}
          subheader={
            <Chip
              label={template.category}
              color={getCategoryColor(template.category) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          }
          action={
            <Box>
              <Tooltip title="Edit Template">
                <IconButton onClick={() => handleEditTemplate(template)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Template">
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {template.message.substring(0, 100)}...
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Used {template.usageCount} times
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<Preview />}>
                Preview
              </Button>
              <Button size="small" variant="contained" startIcon={<Send />}>
                Use Template
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: { xs: 1, sm: 2 },
        pt: { xs: 1, sm: 2 }
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          color: 'text.primary'
        }}>
          Message Center
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setOpenBulkDialog(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Test Message
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewTemplate}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              bgcolor: '#6B8E23',
              '&:hover': {
                bgcolor: '#5a7a1f'
              }
            }}
          >
            New Template
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Card sx={{ 
        borderRadius: 3, 
        mb: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'grey.100',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ 
              px: 3,
              '& .MuiTab-root': {
                minHeight: 60,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
          >
            <Tab icon={<Description />} label="Templates" iconPosition="start" />
            <Tab icon={<Message />} label="Recent Messages" iconPosition="start" />
            <Tab icon={<Schedule />} label="Scheduled" iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <TemplateCard template={template} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: 'text.primary'
            }}>
              Recent Messages
            </Typography>
            <List sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <ListItem 
                  key={item} 
                  divider={item < 5}
                  sx={{ px: 3, py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Message />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Message to Client {item}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Sent 2 hours ago • Delivered
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label="Delivered" 
                      color="success" 
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 600,
              color: 'text.primary',
              textAlign: 'center'
            }}>
              Scheduled Messages
            </Typography>
            <Typography 
              color="text.secondary"
              sx={{ 
                textAlign: 'center',
                maxWidth: 400,
                px: 2
              }}
            >
              No scheduled messages. Create automated campaigns in the Automation Hub.
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Template Dialog */}
      <Dialog 
        open={openTemplateDialog} 
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                defaultValue={selectedTemplate?.name || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                defaultValue={selectedTemplate?.category || 'custom'}
                SelectProps={{ 
                  native: true,
                  inputProps: { title: 'Select template category' }
                }}
              >
                <option value="appointment">Appointment</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
                <option value="custom">Custom</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                defaultValue={selectedTemplate?.subject || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                defaultValue={selectedTemplate?.message || ''}
                helperText="Use {clientName}, {date}, {time}, etc. for dynamic content"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Template</Button>
        </DialogActions>
      </Dialog>

      {/* Test Message Dialog */}
      <Dialog 
        open={openBulkDialog} 
        onClose={() => setOpenBulkDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Test Message</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Enter phone number (e.g., 9123456789)"
                helperText="Enter 10-digit Indian phone number without country code"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your test message here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSendTestMessage}
            disabled={loading || !testPhone || !testMessage}
          >
            {loading ? 'Sending...' : 'Send Test Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessageCenter; 