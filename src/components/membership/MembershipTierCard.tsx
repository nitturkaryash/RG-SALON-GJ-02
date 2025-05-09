import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MembershipTier } from '../../types/membershipTier';
import { Edit, Delete, AccessTime, AttachMoney, Star } from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: '1px solid #e0e0e0',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const PriceArea = styled(Box)(() => ({
  backgroundColor: 'rgb(94, 129, 34)',
  color: '#fff',
  padding: '12px',
  textAlign: 'center',
  borderRadius: '0 0 4px 4px',
}));

interface MembershipTierCardProps {
  tier: MembershipTier;
  onEdit: (tier: MembershipTier) => void;
  onDelete: (id: string) => void;
  onViewDetails: (tier: MembershipTier) => void;
}

const MembershipTierCard: React.FC<MembershipTierCardProps> = ({ 
  tier, 
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  return (
    <StyledCard>
      <CardContent sx={{ pb: 1, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }} noWrap>
              {tier.name}
            </Typography>
          </Box>
          <Star sx={{ color: 'rgb(94, 129, 34)' }} fontSize="large" />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AccessTime fontSize="small" sx={{ mr: 1 }} />
          Duration: {tier.duration_months} {tier.duration_months === 1 ? 'month' : 'months'}
        </Typography>
        
        {tier.description && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {tier.description}
          </Typography>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Benefits:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(tier.benefits || []).map((benefit, index) => (
              <Chip 
                key={index} 
                label={benefit} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(94, 129, 34, 0.1)', 
                  color: 'rgb(94, 129, 34)',
                  border: '1px solid rgba(94, 129, 34, 0.2)'
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </CardContent>
      
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}>
          <Button 
            size="small" 
            variant="outlined" 
            sx={{ 
              color: 'rgb(94, 129, 34)',
              borderColor: 'rgb(94, 129, 34)',
              '&:hover': {
                borderColor: 'rgb(75, 103, 27)',
                backgroundColor: 'rgba(94, 129, 34, 0.04)'
              }
            }}
            onClick={() => onViewDetails(tier)}
          >
            Details
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            sx={{ 
              color: 'rgb(94, 129, 34)',
              borderColor: 'rgb(94, 129, 34)',
              '&:hover': {
                borderColor: 'rgb(75, 103, 27)',
                backgroundColor: 'rgba(94, 129, 34, 0.04)'
              }
            }}
            onClick={() => onEdit(tier)}
            startIcon={<Edit />}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => onDelete(tier.id)}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </CardActions>
        
        <PriceArea>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ₹{new Intl.NumberFormat('en-IN').format(tier.price)}
          </Typography>
        </PriceArea>
      </Box>
    </StyledCard>
  );
};

export default MembershipTierCard; 