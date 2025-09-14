import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import InventoryTabs from '../components/inventory/InventoryTabs';

function Inventory() {
  return (
    <Container maxWidth='lg'>
      <Box sx={{ my: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Inventory Management
        </Typography>
        <InventoryTabs />
      </Box>
    </Container>
  );
}

export default Inventory;
