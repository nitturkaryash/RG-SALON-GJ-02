import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MembershipTier } from '../../types/membershipTier';

interface AddMembershipTierFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tier: Omit<MembershipTier, 'id'> | MembershipTier) => void;
  initialData?: MembershipTier;
  isEditing?: boolean;
}

const AddMembershipTierForm: React.FC<AddMembershipTierFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [tierData, setTierData] = useState<Omit<MembershipTier, 'id'> | MembershipTier>({
    name: '',
    price: 0,
    duration_months: 1,
    benefits: [],
    description: ''
  });
  
  const [newBenefit, setNewBenefit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when opened/closed or when initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTierData({
          ...initialData,
          benefits: initialData.benefits || [],
        });
      } else {
        setTierData({
          name: '',
          price: 0,
          duration_months: 1,
          benefits: [],
          description: ''
        });
      }
      setNewBenefit('');
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle number fields
    if (name === 'price') {
      setTierData({ ...tierData, [name]: parseFloat(value) || 0 });
    } else if (name === 'duration_months') {
      setTierData({ ...tierData, [name]: parseInt(value) || 1 });
    } else {
      setTierData({ ...tierData, [name]: value });
    }
    
    // Clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    
    setTierData({
      ...tierData,
      benefits: [...tierData.benefits, newBenefit.trim()]
    });
    setNewBenefit('');
  };

  const handleDeleteBenefit = (index: number) => {
    const updatedBenefits = [...tierData.benefits];
    updatedBenefits.splice(index, 1);
    setTierData({
      ...tierData,
      benefits: updatedBenefits
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!tierData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (tierData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (tierData.duration_months < 1) {
      newErrors.duration_months = 'Duration must be at least 1 month';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(tierData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: 'rgb(94, 129, 34)', fontWeight: 'bold' }}>
            {isEditing ? 'Edit Membership Tier' : 'Add New Membership Tier'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <form id="membership-tier-form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Tier Name"
                placeholder="Gold, Silver, Platinum..."
                value={tierData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={tierData.price}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                name="duration_months"
                label="Duration (months)"
                type="number"
                value={tierData.duration_months}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.duration_months}
                helperText={errors.duration_months}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={tierData.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                placeholder="Describe this membership tier..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Benefits
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit..."
                  fullWidth
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <Button 
                  variant="contained"
                  sx={{
                    bgcolor: 'rgb(94, 129, 34)',
                    '&:hover': {
                      bgcolor: 'rgb(75, 103, 27)'
                    }
                  }}
                  onClick={handleAddBenefit}
                  disabled={!newBenefit.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tierData.benefits.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No benefits added yet. Add some benefits to make this tier more attractive.
                  </Typography>
                ) : (
                  tierData.benefits.map((benefit, index) => (
                    <Chip
                      key={index}
                      label={benefit}
                      onDelete={() => handleDeleteBenefit(index)}
                      deleteIcon={<DeleteIcon />}
                      sx={{ 
                        bgcolor: 'rgba(94, 129, 34, 0.1)', 
                        color: 'rgb(94, 129, 34)',
                        border: '1px solid rgba(94, 129, 34, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'rgb(94, 129, 34)',
                          '&:hover': {
                            color: 'rgb(75, 103, 27)'
                          }
                        }
                      }}
                    />
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            color: 'rgb(94, 129, 34)',
            borderColor: 'rgb(94, 129, 34)',
            '&:hover': {
              borderColor: 'rgb(75, 103, 27)',
              backgroundColor: 'rgba(94, 129, 34, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          form="membership-tier-form"
          variant="contained"
          sx={{
            bgcolor: 'rgb(94, 129, 34)',
            '&:hover': {
              bgcolor: 'rgb(75, 103, 27)'
            }
          }}
        >
          {isEditing ? 'Save Changes' : 'Create Tier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMembershipTierForm; 