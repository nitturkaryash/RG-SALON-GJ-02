import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Paper,
  Button,
  IconButton,
  Tabs,
  Tab,
  Badge,
  useTheme,
} from '@mui/material';
import {
  WhatsApp,
  Message as MessageIcon,
  AutoMode as AutoModeIcon,
  Analytics as AnalyticsIcon,
  CheckCircle,
  Error,
  Add,
  Refresh,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { useWhatsAppService } from './Communications/hooks/useWhatsAppService';

// Import components
import MessageCenter from './Communications/components/MessageCenter';
import AutomationHub from './Communications/components/AutomationHub';
import AnalyticsDashboard from './Communications/components/AnalyticsDashboard';
import ConnectionStatus from './Communications/components/ConnectionStatus';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communications-tabpanel-${index}`}
      aria-labelledby={`communications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: { xs: 3, sm: 4 },
          pt: { xs: 2, sm: 3 }
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `communications-tab-${index}`,
    'aria-controls': `communications-tabpanel-${index}`,
  };
}

const Communications: React.FC = () => {
  const theme = useTheme();
  const { connectionStatus, testConnection } = useWhatsAppService();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const refreshConnection = async () => {
    await testConnection();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Communications"
        subtitle="Manage WhatsApp automation and messaging for your salon"
        icon={<WhatsApp fontSize="large" sx={{ color: '#25D366' }} />}
        action={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshConnection}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? 'Checking...' : 'Refresh Status'}
          </Button>
        }
      />

      {/* Connection Status Overview */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.5 }}
      >
        <ConnectionStatus 
          status={connectionStatus}
          onRefresh={refreshConnection}
        />
      </motion.div>

      {/* Main Navigation Tabs */}
      <Paper sx={{ mt: 3, borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="communications navigation tabs"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<MessageIcon />}
              label="Message Center"
              {...a11yProps(0)}
              iconPosition="start"
            />
            <Tab
              icon={<AutoModeIcon />}
              label="Automation Hub"
              {...a11yProps(1)}
              iconPosition="start"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Analytics"
              {...a11yProps(2)}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <MessageCenter />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AutomationHub />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AnalyticsDashboard />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Communications; 