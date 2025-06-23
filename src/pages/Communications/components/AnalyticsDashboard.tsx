import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Message,
  People,
  Schedule,
  CheckCircle,
  Error,
  Visibility,
  ThumbUp,
  Reply,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, color }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <Card sx={{ 
      borderRadius: 3, 
      height: '100%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'grey.100',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }
    }}>
      <CardContent sx={{ 
        textAlign: 'center', 
        p: { xs: 2.5, sm: 3.5 },
        '&:last-child': { pb: { xs: 2.5, sm: 3.5 } }
      }}>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          mx: 'auto', 
          mb: 2.5, 
          width: { xs: 52, sm: 60 }, 
          height: { xs: 52, sm: 60 },
          boxShadow: `0 4px 12px ${color === 'primary' ? 'rgba(25, 118, 210, 0.3)' : 
                                    color === 'success' ? 'rgba(46, 125, 50, 0.3)' :
                                    color === 'info' ? 'rgba(2, 136, 209, 0.3)' :
                                    color === 'warning' ? 'rgba(237, 108, 2, 0.3)' : 'rgba(0,0,0,0.2)'}`
        }}>
          {icon}
        </Avatar>
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          color: `${color}.main`, 
          mb: 1.5,
          fontSize: { xs: '1.75rem', sm: '2.125rem' }
        }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 2,
          color: 'text.primary',
          fontSize: { xs: '1rem', sm: '1.125rem' }
        }}>
          {title}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: changeType === 'increase' ? 'success.50' : 
                   changeType === 'decrease' ? 'error.50' : 'grey.50',
          borderRadius: 2,
          py: 0.5,
          px: 1.5,
          mx: 1
        }}>
          {changeType === 'increase' && <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />}
          {changeType === 'decrease' && <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: '1rem' }} />}
          <Typography 
            variant="body2" 
            sx={{ 
              color: changeType === 'increase' ? 'success.main' : 
                     changeType === 'decrease' ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {change}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const AnalyticsDashboard: React.FC = () => {
  const { stats, loading } = useWhatsAppService();
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      title: 'Messages Sent',
      value: stats ? stats.messagesSent.toLocaleString() : '1,247',
      change: '+12% from last week',
      changeType: 'increase' as const,
      icon: <Message />,
      color: 'primary',
    },
    {
      title: 'Delivery Rate',
      value: stats ? `${stats.deliveryRate.toFixed(1)}%` : '98.5%',
      change: '+0.3% from last week',
      changeType: 'increase' as const,
      icon: <CheckCircle />,
      color: 'success',
    },
    {
      title: 'Response Rate',
      value: stats ? `${stats.responseRate.toFixed(0)}%` : '67%',
      change: '+5% from last week',
      changeType: 'increase' as const,
      icon: <Reply />,
      color: 'info',
    },
    {
      title: 'Active Clients',
      value: '892', // This would come from clients data in real app
      change: '-2% from last week',
      changeType: 'decrease' as const,
      icon: <People />,
      color: 'warning',
    },
  ];

  const topPerformingMessages = [
    {
      id: '1',
      template: 'Birthday Wishes',
      category: 'Promotion',
      sent: 45,
      delivered: 44,
      read: 38,
      replied: 12,
      rate: 86.4,
    },
    {
      id: '2',
      template: 'Appointment Confirmation',
      category: 'Appointment',
      sent: 156,
      delivered: 154,
      read: 149,
      replied: 8,
      rate: 95.5,
    },
    {
      id: '3',
      template: 'Follow-up Feedback',
      category: 'Follow-up',
      sent: 89,
      delivered: 87,
      read: 72,
      replied: 23,
      rate: 80.9,
    },
    {
      id: '4',
      template: 'Payment Reminder',
      category: 'Reminder',
      sent: 34,
      delivered: 33,
      read: 28,
      replied: 15,
      rate: 82.4,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Promotion': return 'success';
      case 'Appointment': return 'primary';
      case 'Follow-up': return 'info';
      case 'Reminder': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Filters */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 5, px: 1 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ px: 1 }}>
        {/* Message Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'grey.100'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TrendingUp />
                </Avatar>
              }
              title="Message Performance Trends"
              subheader="Delivery and engagement metrics over time"
              sx={{ pb: 2 }}
            />
            <CardContent sx={{ pt: 0 }}>
              {/* Placeholder for Chart */}
              <Box sx={{ 
                height: 300, 
                bgcolor: 'grey.50', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'grey.300',
                mx: 1,
                mb: 1
              }}>
                <Typography color="text.secondary">
                  Chart component will be integrated here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'grey.100'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Analytics />
                </Avatar>
              }
              title="Quick Stats"
              subheader="At a glance metrics"
              sx={{ pb: 2 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Avg Response Time
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      4.2 min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Best Day
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Tuesday
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Best Time
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      2-4 PM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Automation Rate
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                      78%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
                Message Types Distribution
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Appointments</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>45%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={45} color="primary" sx={{ height: 8, borderRadius: 4, bgcolor: 'primary.50' }} />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Promotions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>30%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={30} color="success" sx={{ height: 8, borderRadius: 4, bgcolor: 'success.50' }} />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Reminders</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>15%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={15} color="warning" sx={{ height: 8, borderRadius: 4, bgcolor: 'warning.50' }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Others</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>10%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={10} color="info" sx={{ height: 8, borderRadius: 4, bgcolor: 'info.50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Templates */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'grey.100',
            mt: 2
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ThumbUp />
                </Avatar>
              }
              title="Top Performing Message Templates"
              subheader="Templates with highest engagement rates"
              sx={{ pb: 2 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              <List sx={{ py: 0 }}>
                {topPerformingMessages.map((message, index) => (
                  <ListItem 
                    key={message.id} 
                    divider={index < topPerformingMessages.length - 1}
                    sx={{ 
                      px: 2, 
                      py: 3,
                      '&:first-of-type': { pt: 2 },
                      '&:last-child': { pb: 2 }
                    }}
                  >
                    <ListItemIcon sx={{ mr: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: `${getCategoryColor(message.category)}.main`, 
                        width: 36, 
                        height: 36,
                        fontSize: '0.875rem'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {index + 1}
                        </Typography>
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {message.template}
                          </Typography>
                          <Chip 
                            label={message.category} 
                            color={getCategoryColor(message.category) as any}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Sent: {message.sent} • Delivered: {message.delivered} • Read: {message.read} • Replied: {message.replied}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={message.rate} 
                                color={getCategoryColor(message.category) as any}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: `${getCategoryColor(message.category)}.50`
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              color: `${getCategoryColor(message.category)}.main`, 
                              fontWeight: 600,
                              minWidth: '42px',
                              textAlign: 'right'
                            }}>
                              {message.rate}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end"
                        sx={{ 
                          bgcolor: 'grey.50',
                          '&:hover': { bgcolor: 'grey.100' },
                          borderRadius: 2
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 