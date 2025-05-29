import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Box, 
  Alert, 
  Divider, 
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { supabase } from '../utils/supabase/supabaseClient';
import { Search, Person, CardMembership, Star, CalendarMonth, AttachMoney, AccountBalanceWallet, Delete } from '@mui/icons-material';
import { format, differenceInMonths } from 'date-fns';
import { toast } from 'react-toastify';

interface Member {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  purchaseDate: string;
  membershipTier?: string;
  membershipPrice?: number;
  membershipDuration?: number; // in months
  orderData?: any; // Store the original order data for debugging
  currentBalance?: number;
  totalMembershipAmount?: number;
}

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const queryClient = useQueryClient();

  // Fetch members using dedicated members table and enrich with client & tier details
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      // 1) Fetch raw membership records
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, client_id, client_name, tier_id, purchase_date, expires_at, current_balance, total_membership_amount')
        .order('purchase_date', { ascending: false });
      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      // 2) Load client details
      const clientIds = Array.from(new Set(membersData.map(m => m.client_id)));
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, phone, email')
        .in('id', clientIds);
      if (clientsError) console.error('Error fetching clients:', clientsError);

      // 3) Load membership tier details
      const tierIds = Array.from(new Set(membersData.map(m => m.tier_id)));
      const { data: tiersData, error: tiersError } = await supabase
        .from('membership_tiers')
        .select('id, name, price, duration_months')
        .in('id', tierIds);
      if (tiersError) console.error('Error fetching tiers:', tiersError);

      // 4) Combine into Member[] with computed balance after membership usage
      // Fetch membership payments for these clients
      const membershipClientIds = Array.from(new Set(membersData.map(m => m.client_id)));
      const { data: ordersData } = await supabase
        .from('pos_orders')
        .select('client_id, payments')
        .in('client_id', membershipClientIds);
      const paymentsByClient: Record<string, number> = {};
      if (ordersData) {
        ordersData.forEach(order => {
          (order.payments || []).forEach((p: any) => {
            if (p.payment_method === 'membership') {
              paymentsByClient[order.client_id] = (paymentsByClient[order.client_id] || 0) + (p.amount || 0);
            }
          });
        });
      }
      return membersData.map(m => {
        const client = clientsData?.find(c => c.id === m.client_id);
        const tier = tiersData?.find(t => t.id === m.tier_id);
        const membershipPrice = tier?.price || 0;
        const used = paymentsByClient[m.client_id] || 0;
        const balance = membershipPrice - used;
        return {
          id: m.id,
          name: client?.full_name || m.client_name,
          phone: client?.phone,
          email: client?.email,
          purchaseDate: m.purchase_date,
          membershipTier: tier?.name,
          membershipPrice: tier?.price,
          membershipDuration: tier?.duration_months,
          currentBalance: m.current_balance,
          totalMembershipAmount: m.total_membership_amount
        };
      });
    }
  });

  // Filter members based on search term
  const filteredMembers = members?.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone && member.phone.includes(searchTerm)) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.membershipTier && member.membershipTier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate remaining membership duration
  const getMembershipStatus = (purchaseDate: string, durationMonths: number = 12) => {
    const startDate = new Date(purchaseDate);
    const today = new Date();
    const monthsPassed = differenceInMonths(today, startDate);
    const remainingMonths = durationMonths - monthsPassed;
    
    return {
      isActive: remainingMonths > 0,
      remainingMonths: Math.max(0, remainingMonths),
      expiryDate: new Date(startDate.setMonth(startDate.getMonth() + durationMonths))
    };
  };

  // Get color based on membership tier
  const getMembershipColor = (tierName: string) => {
    const tier = tierName.toLowerCase();
    if (tier.includes('gold')) return '#FFD700';  // Gold
    if (tier.includes('silver')) return '#C0C0C0'; // Silver
    if (tier.includes('platinum')) return '#E5E4E2'; // Platinum
    if (tier.includes('diamond')) return '#B9F2FF'; // Diamond
    return '#6B8E23'; // Default - Olive
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) {
        throw error;
      }

      toast.success('Membership deleted successfully');
      queryClient.invalidateQueries(['members']);
    } catch (error) {
      console.error('Error deleting membership:', error);
      toast.error('Failed to delete membership');
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  // Handle delete click
  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Divider sx={{ mb: 3 }} />
        
        <TextField
          fullWidth
          placeholder="Search by name, phone, email, or membership tier..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error loading members: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <Grid container spacing={2}>
            {filteredMembers.map((member) => {
              const membershipStatus = getMembershipStatus(member.purchaseDate, member.membershipDuration);
              const membershipColor = getMembershipColor(member.membershipTier || '');
              const membershipPrice = member.membershipPrice || 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={member.id || member.name}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 2, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Delete button */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: membershipStatus.isActive ? 80 : 8, // Adjust position if "ACTIVE" badge exists
                        zIndex: 2
                      }}
                      color="error"
                      onClick={() => handleDeleteClick(member)}
                    >
                      <Delete />
                    </IconButton>
                    
                    {/* Status indicator */}
                    {membershipStatus.isActive && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'success.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        ACTIVE
                      </Box>
                    )}
                    
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: membershipColor, 
                          width: 56, 
                          height: 56,
                          mr: 2,
                          color: member.membershipTier?.toLowerCase().includes('gold') ? '#000' : '#fff'
                        }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {member.name}
                          </Typography>
                          
                          {/* Membership Tier Badge */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 0.5,
                            p: 0.75,
                            borderRadius: 1,
                            backgroundColor: membershipColor,
                            color: member.membershipTier?.toLowerCase().includes('gold') ? '#000' : '#fff',
                            fontWeight: 'bold',
                            width: 'fit-content'
                          }}>
                            <CardMembership fontSize="small" sx={{ mr: 0.5 }} />
                            {member.membershipTier}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        {member.phone && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                            <span style={{ minWidth: '70px' }}>Phone:</span> {member.phone}
                          </Typography>
                        )}
                        {member.email && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                            <span style={{ minWidth: '70px' }}>Email:</span> {member.email}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                          <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                          <span style={{ minWidth: '70px' }}>Member since:</span> {format(new Date(member.purchaseDate), 'MMM d, yyyy')}
                        </Typography>
                        
                        {membershipPrice > 0 && (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                              <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                              <span style={{ minWidth: '70px' }}>Total Amount:</span> Rs. {member.totalMembershipAmount?.toLocaleString() || membershipPrice.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color={member.currentBalance && member.currentBalance > 0 ? "success.main" : "error.main"} sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                              <AccountBalanceWallet fontSize="small" sx={{ mr: 1 }} />
                              <span style={{ minWidth: '70px' }}>Balance:</span> Rs. {member.currentBalance?.toLocaleString() || '0'}
                            </Typography>
                          </>
                        )}
                        
                        <Box sx={{ 
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: '1px dashed rgba(0,0,0,0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" fontWeight="500" color={membershipStatus.isActive ? 'success.main' : 'text.secondary'}>
                            {membershipStatus.isActive 
                              ? `${membershipStatus.remainingMonths} months remaining` 
                              : 'Membership expired'}
                          </Typography>
                          
                          <Chip 
                            size="small" 
                            label={membershipStatus.isActive 
                              ? `Expires ${format(membershipStatus.expiryDate, 'MMM d, yyyy')}` 
                              : 'Renew membership'} 
                            color={membershipStatus.isActive ? 'default' : 'primary'}
                            variant={membershipStatus.isActive ? 'outlined' : 'filled'}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 5, 
            bgcolor: 'background.paper', 
            borderRadius: 2,
            border: '1px dashed rgba(0, 0, 0, 0.12)'
          }}>
            <CardMembership sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No members found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Add members through the POS by selling membership tiers'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Membership?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the membership for {memberToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MembersPage; 