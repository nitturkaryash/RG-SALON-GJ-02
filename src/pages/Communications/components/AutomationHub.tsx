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
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  AutoMode,
  Add,
  Edit,
  Delete,
  Campaign,
  TrendingUp,
  PlayArrow,
  Pause,
  CheckCircle,
  Error,
  AccessTime,
  People,
  Message,
  Event,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastTriggered: string;
  triggerCount: number;
  category: 'appointment' | 'birthday' | 'follow-up' | 'promotion' | 'reminder';
}

const AutomationHub: React.FC = () => {
  const { automations, toggleAutomation } = useWhatsAppService();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationRule | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return <Event />;
      case 'birthday': return <Star />;
      case 'follow-up': return <TrendingUp />;
      case 'promotion': return <Campaign />;
      case 'reminder': return <AccessTime />;
      default: return <AutoMode />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment': return 'primary';
      case 'birthday': return 'warning';
      case 'follow-up': return 'info';
      case 'promotion': return 'success';
      case 'reminder': return 'error';
      default: return 'default';
    }
  };

  const AutomationCard = ({ automation }: { automation: AutomationRule }) => (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ 
        borderRadius: 3, 
        height: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'grey.100'
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: `${getCategoryColor(automation.category)}.main` }}>
              {getCategoryIcon(automation.category)}
            </Avatar>
          }
          title={automation.name}
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={automation.category}
                color={getCategoryColor(automation.category) as any}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip
                icon={automation.isActive ? <CheckCircle /> : <Error />}
                label={automation.isActive ? 'Active' : 'Inactive'}
                color={automation.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          }
          action={
            <Box>
              <Tooltip title={automation.isActive ? 'Pause' : 'Activate'}>
                <IconButton onClick={() => toggleAutomation(automation.id)}>
                  {automation.isActive ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton onClick={() => {
                  setSelectedAutomation(automation);
                  setOpenDialog(true);
                }}>
                  <Edit />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {automation.description}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Trigger
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {automation.trigger}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Action
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {automation.action}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Last Triggered
              </Typography>
              <Typography variant="body2">
                {automation.lastTriggered}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Total Triggers
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {automation.triggerCount}
              </Typography>
            </Grid>
          </Grid>
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
      {/* Header */}
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
          Automation Hub
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedAutomation(null);
            setOpenDialog(true);
          }}
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
          Create Automation
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ px: { xs: 1, sm: 2 }, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ 
                borderRadius: 3, 
                textAlign: 'center', 
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%'
              }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <AutoMode />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {automations.filter(a => a.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Automations
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ 
                borderRadius: 3, 
                textAlign: 'center', 
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%'
              }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <Message />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                  {automations.reduce((sum, a) => sum + a.triggerCount, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Messages Sent
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ 
                borderRadius: 3, 
                textAlign: 'center', 
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%'
              }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                  92%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Success Rate
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ 
                borderRadius: 3, 
                textAlign: 'center', 
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%'
              }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <People />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                  247
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Clients Reached
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Automation Cards */}
      <Box sx={{ px: { xs: 1, sm: 2 }, flex: 1 }}>
        <Grid container spacing={3}>
          {automations.map((automation) => (
            <Grid item xs={12} lg={6} key={automation.id}>
              <AutomationCard automation={automation} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Automation Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAutomation ? 'Edit Automation' : 'Create New Automation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Automation Name"
                defaultValue={selectedAutomation?.name || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                defaultValue={selectedAutomation?.description || ''}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                defaultValue={selectedAutomation?.category || 'appointment'}
                SelectProps={{ native: true }}
              >
                <option value="appointment">Appointment</option>
                <option value="birthday">Birthday</option>
                <option value="follow-up">Follow-up</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Trigger Event"
                defaultValue={selectedAutomation?.trigger || ''}
                SelectProps={{ native: true }}
              >
                <option value="">Select a trigger</option>
                <option value="Appointment Created">Appointment Created</option>
                <option value="Appointment Completed">Appointment Completed</option>
                <option value="Client Birthday">Client Birthday</option>
                <option value="No visit for 30 days">No visit for 30 days</option>
                <option value="No visit for 90 days">No visit for 90 days</option>
                <option value="Payment Overdue">Payment Overdue</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Action"
                defaultValue={selectedAutomation?.action || ''}
                SelectProps={{ native: true }}
              >
                <option value="">Select an action</option>
                <option value="Send WhatsApp Message">Send WhatsApp Message</option>
                <option value="Send Promotional Message">Send Promotional Message</option>
                <option value="Send Feedback Request">Send Feedback Request</option>
                <option value="Send Payment Reminder">Send Payment Reminder</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    defaultChecked={selectedAutomation?.isActive !== false}
                  />
                }
                label="Activate automation immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedAutomation ? 'Update' : 'Create'} Automation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationHub; 