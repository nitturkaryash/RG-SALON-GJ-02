import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  WhatsApp,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  SignalCellularAlt,
  Message,
  PeopleAlt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting';
  onRefresh: () => void;
}

interface StatisticProps {
  label: string;
  value: string;
  subtext?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const Statistic: React.FC<StatisticProps> = ({ label, value, subtext, color = 'primary' }) => (
  <Box textAlign="center">
    <Typography variant="h4" sx={{ fontWeight: 600, color: `${color}.main` }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    {subtext && (
      <Typography variant="caption" color="text.secondary">
        {subtext}
      </Typography>
    )}
  </Box>
);

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, onRefresh }) => {
  const { stats, config, error } = useWhatsAppService();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'success',
          icon: <CheckCircle />,
          label: 'Connected',
          bgColor: 'rgba(76, 175, 80, 0.1)',
        };
      case 'disconnected':
        return {
          color: 'error',
          icon: <Error />,
          label: 'Disconnected',
          bgColor: 'rgba(244, 67, 54, 0.1)',
        };
      case 'connecting':
        return {
          color: 'warning',
          icon: <Warning />,
          label: 'Connecting...',
          bgColor: 'rgba(255, 152, 0, 0.1)',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ 
        borderRadius: 4, 
        position: 'relative', 
        overflow: 'visible',
        background: `linear-gradient(135deg, ${statusConfig.bgColor} 0%, rgba(255,255,255,0.9) 100%)`,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: `${statusConfig.color}.main`, 
                  mr: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <WhatsApp fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  WhatsApp Business API
                </Typography>
                <Chip 
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  color={statusConfig.color as any}
                  size="medium"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
            
            <Tooltip title="Refresh Connection">
              <IconButton 
                onClick={onRefresh}
                disabled={status === 'connecting'}
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {status === 'connecting' && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress color="warning" />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Checking WhatsApp API connection...
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Statistic 
                label="Messages Sent Today" 
                value={stats?.messagesSent.toString() || "247"} 
                subtext="+12% from yesterday"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Statistic 
                label="Delivery Rate" 
                value={stats ? `${stats.deliveryRate.toFixed(1)}%` : "98.2%"} 
                subtext="Last 30 days"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Statistic 
                label="Response Rate" 
                value={stats ? `${stats.responseRate.toFixed(0)}%` : "65%"} 
                subtext="Client engagement"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Statistic 
                label="Active Automations" 
                value={stats?.activeAutomations.toString() || "8"} 
                subtext="Running campaigns"
                color="success"
              />
            </Grid>
          </Grid>

          {status === 'connected' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                WhatsApp Business API is running smoothly. All automation rules are active.
              </Typography>
            </Box>
          )}

          {status === 'disconnected' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <Error sx={{ mr: 1, fontSize: 16 }} />
                {error || 'Connection failed. Please check your API credentials and try again.'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Phone Number ID: {config.phoneNumberId} | Business Account: {config.businessAccountId}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectionStatus; 