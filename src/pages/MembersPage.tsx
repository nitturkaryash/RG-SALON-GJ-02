import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Avatar
} from '@mui/material';
import { supabase } from '../utils/supabase/supabaseClient';
import { Search, Person, CardMembership, Star, CalendarMonth, AttachMoney } from '@mui/icons-material';
import { format, differenceInMonths } from 'date-fns';

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
}

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch members using react-query
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      try {
        console.log('Starting membership query...');
        
        // First, query the membership_tiers table to get all membership tiers
        const { data: membershipTiers, error: tiersError } = await supabase
          .from('membership_tiers')
          .select('id, name, price, duration_months, benefits, description');

        if (tiersError) {
          console.error('Error fetching membership tiers:', tiersError);
          // Continue even if we can't get tiers - we'll use service names instead
        }

        console.log('Membership tiers:', membershipTiers);

        // Get the membership tier IDs and names for reference
        const tierIds = membershipTiers?.map(tier => tier.id) || [];
        const tierNames = membershipTiers?.map(tier => tier.name.toLowerCase()) || [];
        const tierPrices = membershipTiers?.map(tier => tier.price) || [];

        console.log('Tier IDs:', tierIds);
        console.log('Tier Names:', tierNames);
        console.log('Tier Prices:', tierPrices);

        // First search approach: Look directly in pos_orders
        const { data: orders, error: ordersError } = await supabase
          .from('pos_orders')
          .select('*')
          .not('client_name', 'is', null);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          throw new Error(`Failed to fetch orders: ${ordersError.message}`);
        }

        console.log(`Found ${orders?.length || 0} orders to analyze`);
        
        if (orders && orders.length > 0) {
          // Log the structure of a few orders to understand the data format
          console.log('Order sample structure:', JSON.stringify(orders[0], null, 2));
        }

        // Collect all potential membership orders using multiple detection approaches
        let membershipOrders: any[] = [];
        
        if (orders && orders.length > 0) {
          // For each order, check if it contains membership services in any form
          for (const order of orders) {
            let isMembershipOrder = false;
            let membershipInfo = null;
            let servicesList: any[] = [];
            
            // First inspect raw order data
            console.log(`Inspecting order ${order.id} for client ${order.client_name}`);
            
            // Check if services field exists
            if (order.services) {
              try {
                // Handle services field based on its type
                if (typeof order.services === 'string') {
                  servicesList = JSON.parse(order.services);
                } else if (Array.isArray(order.services)) {
                  servicesList = order.services;
                } else {
                  console.log(`Order ${order.id} has services in unexpected format: ${typeof order.services}`);
                }
                
                // Log the parsed services for debugging
                console.log(`Order ${order.id} has ${servicesList.length} services:`, servicesList);
                
                // Check if any service is a membership
                for (const service of servicesList) {
                  if (!service) continue;
                  
                  // Extract all potential identifiers
                  const serviceName = ((service.service_name || service.product_name || '') + '').toLowerCase();
                  const serviceType = ((service.type || '') + '').toLowerCase();
                  const serviceCategory = ((service.category || '') + '').toLowerCase();
                  const serviceId = service.service_id || service.product_id || '';
                  const price = parseFloat(service.price || '0');
                  
                  console.log(`Checking service: ${serviceName}, type: ${serviceType}, category: ${serviceCategory}, id: ${serviceId}, price: ${price}`);
                  
                  // Check multiple membership indicators
                  if (
                    // Match by ID
                    tierIds.includes(serviceId) ||
                    // Match by name
                    tierNames.some(name => serviceName.includes(name)) ||
                    // Match by the word "member"
                    serviceName.includes('member') ||
                    serviceType.includes('member') ||
                    serviceCategory.includes('member') ||
                    // Match by price (within 0.1 to handle floating point issues)
                    tierPrices.some(tierPrice => Math.abs(price - tierPrice) < 0.1)
                  ) {
                    console.log(`Found membership indicator in order ${order.id} for service: `, service);
                    isMembershipOrder = true;
                    membershipInfo = service;
                    break;
                  }
                }
              } catch (e) {
                console.error(`Error processing services for order ${order.id}:`, e);
              }
            }
            
            // Fallback: check for membership indicators in the entire order
            if (!isMembershipOrder) {
              const orderStr = JSON.stringify(order).toLowerCase();
              if (
                orderStr.includes('membership') || 
                orderStr.includes('platinum') || 
                orderStr.includes('gold') || 
                orderStr.includes('silver') ||
                // Check if any membership tier IDs are present in the order
                tierIds.some(id => orderStr.includes(id))
              ) {
                console.log(`Found membership indicator in order ${order.id} via text search`);
                isMembershipOrder = true;
              }
            }
            
            // Check the total amount against known membership prices
            if (!isMembershipOrder && order.total) {
              const totalAmount = parseFloat(order.total);
              const isMembershipPrice = tierPrices.some(price => Math.abs(totalAmount - price) < 0.1);
              
              if (isMembershipPrice) {
                console.log(`Order ${order.id} has a total (${totalAmount}) matching a membership price`);
                isMembershipOrder = true;
              }
            }
            
            // If any indicator was found, add to membership orders
            if (isMembershipOrder) {
              membershipOrders.push({
                ...order,
                _membershipInfo: membershipInfo, // Store the detected membership service
                _servicesList: servicesList // Store the parsed services list
              });
            }
          }
        }

        console.log(`Found ${membershipOrders.length} orders with membership indicators`);

        if (membershipOrders.length === 0) {
          console.log('No membership orders found.');
          return [];
        }

        // Map orders to member data
        const membersData: Member[] = membershipOrders.map(order => {
          // Determine the membership tier
          let membershipTierName = 'Membership';
          let membershipPrice = 0;
          let membershipDuration = 12; // Default to 12 months
          let matchedTier = null;
          
          // Try to get tier name from the detected membership service
          if (order._membershipInfo) {
            const membershipService = order._membershipInfo;
            const serviceId = membershipService.service_id || membershipService.product_id;
            const serviceName = membershipService.service_name || membershipService.product_name;
            const servicePrice = parseFloat(membershipService.price || '0');
            
            // Try to match with known tiers
            matchedTier = membershipTiers?.find(tier => 
              tier.id === serviceId || 
              Math.abs(parseFloat(tier.price) - servicePrice) < 0.1 ||
              tier.name.toLowerCase() === serviceName?.toLowerCase()
            );
            
            if (matchedTier) {
              membershipTierName = matchedTier.name;
              membershipPrice = parseFloat(matchedTier.price);
              membershipDuration = matchedTier.duration_months || 12;
            } else if (serviceName) {
              membershipTierName = serviceName;
              membershipPrice = servicePrice;
            }
          } else {
            // Try to match by order total
            const orderTotal = parseFloat(order.total || '0');
            matchedTier = membershipTiers?.find(tier => 
              Math.abs(parseFloat(tier.price) - orderTotal) < 0.1
            );
            
            if (matchedTier) {
              membershipTierName = matchedTier.name;
              membershipPrice = parseFloat(matchedTier.price);
              membershipDuration = matchedTier.duration_months || 12;
            }
          }
          
          return {
            id: order.id,
            name: order.client_name || 'Unknown Client',
            purchaseDate: order.created_at || order.date || new Date().toISOString(),
            membershipTier: membershipTierName,
            membershipPrice: membershipPrice,
            membershipDuration: membershipDuration,
            orderData: {
              id: order.id,
              client_name: order.client_name,
              total: order.total,
              membershipInfo: order._membershipInfo,
              services: order._servicesList
            }
          };
        });

        // Fetch client details to enrich member records
        try {
          const clientNames = [...new Set(membersData.map(member => member.name))];
          
          if (clientNames.length > 0) {
            const { data: clientsData, error: clientsError } = await supabase
              .from('clients')
              .select('id, full_name, phone, email')
              .in('full_name', clientNames);

            if (clientsError) {
              console.error('Error fetching client details:', clientsError);
            } else if (clientsData && clientsData.length > 0) {
              console.log(`Found ${clientsData.length} clients with details`);
              
              // Enhance member records with client details
              membersData.forEach(member => {
                const clientDetails = clientsData.find(client => 
                  client.full_name.toLowerCase() === member.name.toLowerCase()
                );
                
                if (clientDetails) {
                  member.id = clientDetails.id; // Use client ID instead of order ID
                  member.phone = clientDetails.phone;
                  member.email = clientDetails.email;
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching client details:', error);
        }
        
        // Remove duplicates by client name
        const uniqueMembers = Array.from(
          new Map(membersData.map(member => [member.name.toLowerCase(), member])).values()
        );

        console.log(`Returning ${uniqueMembers.length} unique members`);
        return uniqueMembers;
      } catch (error) {
        console.error('Error in members query:', error);
        throw error;
      }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CardMembership sx={{ fontSize: '2rem', color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            Salon Members
          </Typography>
        </Box>
        
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
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                            <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                            <span style={{ minWidth: '70px' }}>Price:</span> Rs. {membershipPrice.toLocaleString()}
                          </Typography>
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
    </Container>
  );
};

export default MembersPage; 