import React from 'react';
import { Container, Paper } from '@mui/material';
import MembershipTiersList from '../components/membership/MembershipTiersList';

const MembershipTiers: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <MembershipTiersList />
      </Paper>
    </Container>
  );
};

export default MembershipTiers; 