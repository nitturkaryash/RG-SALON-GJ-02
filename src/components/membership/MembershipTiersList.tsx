import React, { useState } from 'react';
import { Grid, Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MembershipTierCard from './MembershipTierCard';
import AddMembershipTierForm from './AddMembershipTierForm';
import { MembershipTier } from '../../types/membershipTier';
import { useMembershipTiers } from '../../hooks/useMembershipTiers';

const MembershipTiersList: React.FC = () => {
  const { tiers, isLoading, createTier, updateTier, deleteTier } = useMembershipTiers();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | undefined>(undefined);
  const [viewingTier, setViewingTier] = useState<MembershipTier | undefined>(undefined);

  const handleOpenForm = () => {
    setEditingTier(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTier(undefined);
  };

  const handleEditTier = (tier: MembershipTier) => {
    setEditingTier(tier);
    setIsFormOpen(true);
  };

  const handleViewDetails = (tier: MembershipTier) => {
    setViewingTier(tier);
    // Could implement a detailed view dialog here
    console.log('Viewing tier details:', tier);
  };

  const handleFormSubmit = (tierData: Omit<MembershipTier, 'id'> | MembershipTier) => {
    if ('id' in tierData && editingTier) {
      // Update existing tier
      updateTier(tierData.id, tierData);
    } else {
      // Create new tier
      createTier(tierData as Omit<MembershipTier, 'id'>);
    }
    handleCloseForm();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'rgb(94, 129, 34)'
          }}
        >
          Membership Tiers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          sx={{
            bgcolor: 'rgb(94, 129, 34)',
            borderRadius: '20px',
            '&:hover': {
              bgcolor: 'rgb(75, 103, 27)'
            }
          }}
        >
          Add New Tier
        </Button>
      </Box>

      {tiers.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No membership tiers found. Create your first tier to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {tiers.map(tier => (
            <Grid item xs={12} sm={6} md={4} key={tier.id}>
              <MembershipTierCard
                tier={tier}
                onEdit={handleEditTier}
                onDelete={deleteTier}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddMembershipTierForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTier}
        isEditing={!!editingTier}
      />
    </>
  );
};

export default MembershipTiersList; 