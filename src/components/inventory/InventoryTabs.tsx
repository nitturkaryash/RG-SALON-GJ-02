import React, { useState } from 'react';
import { Box, Tab, Tabs, styled } from '@mui/material';
import PurchaseTab from './PurchaseTab';
import SalesTab from './SalesTab';
import ConsumptionTab from './ConsumptionTab';
import BalanceStockTab from './BalanceStockTab';
import { useInventory } from '../../hooks/useInventory';

// Custom styled Tabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#7FA650', // Green indicator
    height: '3px',
  },
}));

// Custom styled Tab
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  color: '#666666',
  '&.Mui-selected': {
    color: '#7FA650', // Green text when selected
  },
  '&:hover': {
    color: '#648541',
    opacity: 1,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: string) {
  return {
    id: `inventory-tab-${index}`,
    'aria-controls': `inventory-tabpanel-${index}`,
  };
}

const InventoryTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('purchases');
  const {
    purchasesQuery,
    salesQuery,
    consumptionQuery,
    balanceStockQuery,
    recalculateBalanceStock
  } = useInventory();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log('Tab changed to:', newValue);
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="inventory tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <StyledTab label="Purchases" value="purchases" {...a11yProps('purchases')} />
          <StyledTab label="Sales" value="sales" {...a11yProps('sales')} />
          <StyledTab label="Consumption" value="consumption" {...a11yProps('consumption')} />
          {/* <StyledTab label="Balance Stock" value="balance_stock" {...a11yProps('balance_stock')} /> */}
        </StyledTabs>
      </Box>
      
      <TabPanel value={activeTab} index="purchases">
        <PurchaseTab
          purchases={purchasesQuery.data || []}
          isLoading={purchasesQuery.isLoading}
          error={purchasesQuery.error as Error}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index="sales">
        <SalesTab
          sales={salesQuery.data || []}
          isLoading={salesQuery.isLoading}
          error={salesQuery.error as Error}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index="consumption">
        <ConsumptionTab
          consumption={consumptionQuery.data || []}
          isLoading={consumptionQuery.isLoading}
          error={consumptionQuery.error as Error}
        />
      </TabPanel>
      
      {/* <TabPanel value={activeTab} index="balance_stock">
        <BalanceStockTab
          balanceStock={balanceStockQuery.data || []}
          isLoading={balanceStockQuery.isLoading}
          error={balanceStockQuery.error as Error}
          recalculateBalanceStock={recalculateBalanceStock}
        />
      </TabPanel> */}
    </Box>
  );
};

export default InventoryTabs; 