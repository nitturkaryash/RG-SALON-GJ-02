'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Button,
} from '@mui/material';
import { supabase } from '../lib/supabase';
import {
  Search,
  Person,
  CardMembership,
  Star,
  CalendarMonth,
  AttachMoney,
  AccountBalanceWallet,
  Delete,
} from '@mui/icons-material';
import { format, differenceInMonths } from 'date-fns';
import { toast } from 'react-toastify';

// Animation constants
const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
};

const clamp = (val: number, min = 0, max = 100) =>
  Math.min(Math.max(val, min), max);
const round = (val: number, p = 3) => parseFloat(val.toFixed(p));
const adjust = (
  val: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) => round(toMin + ((toMax - toMin) * (val - fromMin)) / (fromMax - fromMin));
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// Holographic Card Component
const HolographicMemberCard = ({
  member,
  onDelete,
}: {
  member: Member;
  onDelete: (member: Member) => void;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const animationHandlers = useMemo(() => {
    let rafId: number | null = null;

    const updateTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const { clientWidth: width, clientHeight: height } = card;
      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const props: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(centerY, centerX) / 50, 0, 1)}`,
        '--rotate-x': `${round(-(centerY / 5))}deg`,
        '--rotate-y': `${round(centerX / 4)}deg`,
      };
      Object.entries(props).forEach(([p, v]) => wrap.style.setProperty(p, v));
    };

    const smoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const loop = (currentTime: number) => {
        const progress = clamp((currentTime - startTime) / duration);
        const eased = easeInOutCubic(progress);
        const currentX = adjust(eased, 0, 1, startX, targetX);
        const currentY = adjust(eased, 0, 1, startY, targetY);
        updateTransform(currentX, currentY, card, wrap);
        if (progress < 1) rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    return {
      updateTransform,
      smoothAnimation,
      cancel: () => rafId && cancelAnimationFrame(rafId),
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!cardRef.current || !wrapRef.current || !animationHandlers) return;
      const rect = cardRef.current.getBoundingClientRect();
      animationHandlers.updateTransform(
        e.clientX - rect.left,
        e.clientY - rect.top,
        cardRef.current,
        wrapRef.current
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    if (!wrapRef.current || !cardRef.current || !animationHandlers) return;
    animationHandlers.cancel();
    wrapRef.current.classList.add('active');
    cardRef.current.classList.add('active');
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (!wrapRef.current || !cardRef.current || !animationHandlers) return;
      wrapRef.current.classList.remove('active');
      cardRef.current.classList.remove('active');
      animationHandlers.smoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY,
        cardRef.current,
        wrapRef.current
      );
    },
    [animationHandlers]
  );

  useEffect(() => {
    if (!animationHandlers || !wrapRef.current || !cardRef.current) return;

    const wrap = wrapRef.current;
    const card = cardRef.current;
    const { INITIAL_DURATION } = ANIMATION_CONFIG;

    const initialX = wrap.clientWidth / 2;
    const initialY = wrap.clientHeight / 2;

    animationHandlers.updateTransform(initialX, initialY, card, wrap);
    animationHandlers.smoothAnimation(
      INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap
    );
  }, [animationHandlers]);

  // Calculate membership status within the component
  const membershipStatus = useMemo(() => {
    const startDate = new Date(member.purchaseDate);
    const today = new Date();
    const monthsPassed = differenceInMonths(today, startDate);
    const durationMonths = member.membershipDuration || 12;
    const remainingMonths = durationMonths - monthsPassed;

    return {
      isActive: remainingMonths > 0,
      remainingMonths: Math.max(0, remainingMonths),
      expiryDate: new Date(
        startDate.setMonth(startDate.getMonth() + durationMonths)
      ),
    };
  }, [member.purchaseDate, member.membershipDuration]);

  // Get color based on membership tier
  const membershipColor = useMemo(() => {
    const tier = (member.membershipTier || '').toLowerCase();
    if (tier.includes('gold')) return '#FFD700'; // Gold
    if (tier.includes('silver')) return '#C0C0C0'; // Silver
    if (tier.includes('platinum')) return '#E5E4E2'; // Platinum
    if (tier.includes('diamond')) return '#B9F2FF'; // Diamond
    return '#6B8E23'; // Default - Olive
  }, [member.membershipTier]);
  const membershipPrice = member.membershipPrice || 0;

  return (
    <div
      ref={wrapRef}
      className='hc-wrapper'
      style={{
        height: '100%',
        perspective: '1000px',
      }}
    >
      <div
        ref={cardRef}
        className='hc-card'
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          height: '100%',
          borderRadius: '8px',
          background: 'white',
          position: 'relative',
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          className='hc-inside'
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'white',
          }}
        >
          <div className='hc-shine' />
          <div className='hc-glare' />
          <div
            className='hc-content-wrapper'
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Delete button */}
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: membershipStatus.isActive ? 80 : 8,
                zIndex: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
              color='error'
              onClick={() => onDelete(member)}
            >
              <Delete />
            </IconButton>

            {/* Status indicator */}
            {membershipStatus.isActive && (
              <Box
                sx={{
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
                  zIndex: 1,
                }}
              >
                ACTIVE
              </Box>
            )}

            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: membershipColor,
                    width: 56,
                    height: 56,
                    mr: 2,
                    color: member.membershipTier?.toLowerCase().includes('gold')
                      ? '#000'
                      : '#fff',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 500, mb: 0.5 }}>
                    {member.name}
                  </Typography>

                  {/* Membership Tier Badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 0.5,
                      p: 0.75,
                      borderRadius: 1,
                      backgroundColor: membershipColor,
                      color: member.membershipTier
                        ?.toLowerCase()
                        .includes('gold')
                        ? '#000'
                        : '#fff',
                      fontWeight: 'bold',
                      width: 'fit-content',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardMembership fontSize='small' sx={{ mr: 0.5 }} />
                    {member.membershipTier}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ mt: 2, flexGrow: 1 }}>
                {member.phone && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ minWidth: '70px' }}>Phone:</span>{' '}
                    {member.phone}
                  </Typography>
                )}
                {member.email && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ minWidth: '70px' }}>Email:</span>{' '}
                    {member.email}
                  </Typography>
                )}

                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
                >
                  <CalendarMonth fontSize='small' sx={{ mr: 1 }} />
                  <span style={{ minWidth: '70px' }}>Member since:</span>{' '}
                  {format(new Date(member.purchaseDate), 'MMM d, yyyy')}
                </Typography>

                {membershipPrice > 0 && (
                  <>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
                    >
                      <AttachMoney fontSize='small' sx={{ mr: 1 }} />
                      <span style={{ minWidth: '70px' }}>
                        Total Amount:
                      </span>{' '}
                      Rs.{' '}
                      {member.totalMembershipAmount?.toLocaleString() ||
                        membershipPrice.toLocaleString()}
                    </Typography>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceWallet
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                      <Typography variant='body2'>
                        Balance:{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          Rs.{' '}
                          {member.currentBalance?.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </Typography>
                    </Box>

                    {member.benefitAmount && member.benefitAmount > 0 && (
                      <Box
                        sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
                      >
                        <Star sx={{ mr: 1, color: 'gold' }} />
                        <Typography variant='body2'>
                          Benefit Amount:{' '}
                          <span style={{ fontWeight: 'bold' }}>
                            Rs.{' '}
                            {member.benefitAmount.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </Typography>
                      </Box>
                    )}
                  </>
                )}

                <Box
                  sx={{
                    mt: 'auto',
                    pt: 1.5,
                    borderTop: '1px dashed rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant='body2'
                    fontWeight='500'
                    color={
                      membershipStatus.isActive
                        ? 'success.main'
                        : 'text.secondary'
                    }
                  >
                    {membershipStatus.isActive
                      ? `${membershipStatus.remainingMonths} months remaining`
                      : 'Membership expired'}
                  </Typography>

                  <Chip
                    size='small'
                    label={
                      membershipStatus.isActive
                        ? `Expires ${format(membershipStatus.expiryDate, 'MMM d, yyyy')}`
                        : 'Renew membership'
                    }
                    color={membershipStatus.isActive ? 'default' : 'primary'}
                    variant={membershipStatus.isActive ? 'outlined' : 'filled'}
                  />
                </Box>
              </Box>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  benefitAmount?: number;
}

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const queryClient = useQueryClient();

  // Fetch members using dedicated members table and enrich with client & tier details
  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      // 1) Fetch raw membership records
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(
          'id, client_id, client_name, tier_id, purchase_date, expires_at, current_balance, total_membership_amount, benefit_amount'
        )
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
      const membershipClientIds = Array.from(
        new Set(membersData.map(m => m.client_id))
      );
      const { data: ordersData } = await supabase
        .from('pos_orders')
        .select('client_id, payments')
        .in('client_id', membershipClientIds);
      const paymentsByClient: Record<string, number> = {};
      if (ordersData) {
        ordersData.forEach(order => {
          (order.payments || []).forEach((p: any) => {
            if (p.payment_method === 'membership') {
              paymentsByClient[order.client_id] =
                (paymentsByClient[order.client_id] || 0) + (p.amount || 0);
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
          totalMembershipAmount: m.total_membership_amount,
          benefitAmount: m.benefit_amount,
        };
      });
    },
  });

  // Filter members based on search term
  const filteredMembers = members?.filter(
    member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.membershipTier &&
        member.membershipTier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate remaining membership duration
  const getMembershipStatus = (
    purchaseDate: string,
    durationMonths: number = 12
  ) => {
    const startDate = new Date(purchaseDate);
    const today = new Date();
    const monthsPassed = differenceInMonths(today, startDate);
    const remainingMonths = durationMonths - monthsPassed;

    return {
      isActive: remainingMonths > 0,
      remainingMonths: Math.max(0, remainingMonths),
      expiryDate: new Date(
        startDate.setMonth(startDate.getMonth() + durationMonths)
      ),
    };
  };

  // Get color based on membership tier
  const getMembershipColor = (tierName: string) => {
    const tier = tierName.toLowerCase();
    if (tier.includes('gold')) return '#FFD700'; // Gold
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
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Divider sx={{ mb: 3 }} />

        <TextField
          fullWidth
          placeholder='Search by name, phone, email, or membership tier...'
          variant='outlined'
          size='small'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
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
          <Alert severity='error' sx={{ mt: 2 }}>
            Error loading members:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <Grid container spacing={2}>
            {filteredMembers.map(member => (
              <Grid item xs={12} sm={6} md={4} key={member.id || member.name}>
                <HolographicMemberCard
                  member={member}
                  onDelete={handleDeleteClick}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed rgba(0, 0, 0, 0.12)',
            }}
          >
            <CardMembership
              sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }}
            />
            <Typography variant='h6' color='text.secondary'>
              No members found
            </Typography>
            <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Add members through the POS by selling membership tiers'}
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
            Are you sure you want to delete the membership for{' '}
            {memberToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        .hc-wrapper {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out;
        }

        .hc-wrapper.active {
          transform: rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
        }

        .hc-card {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out;
        }

        .hc-card.active {
          transform: rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
        }

        .hc-inside {
          position: relative;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(
              circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
              rgba(107, 142, 35, 0.1) 0%,
              rgba(107, 142, 35, 0.05) 40%,
              transparent 80%
            ),
            white;
          border-radius: inherit;
          overflow: hidden;
        }

        .hc-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 30%,
            transparent 60%
          );
          opacity: calc(var(--pointer-from-center, 0) * 0.8);
          transition: opacity 0.2s ease;
          pointer-events: none;
          border-radius: inherit;
        }

        .hc-glare {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent 20%,
            rgba(107, 142, 35, 0.15) var(--background-x, 50%),
            transparent 80%
          );
          opacity: calc(var(--pointer-from-center, 0) * 0.6);
          transition: opacity 0.2s ease;
          pointer-events: none;
          border-radius: inherit;
          mix-blend-mode: overlay;
        }

        .hc-content-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: inherit;
        }

        .hc-wrapper.active .hc-shine {
          opacity: calc(var(--pointer-from-center, 0) * 1.2);
        }

        .hc-wrapper.active .hc-glare {
          opacity: calc(var(--pointer-from-center, 0) * 0.8);
        }

        .hc-inside::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(
              45deg,
              rgba(107, 142, 35, 0.05) 0%,
              rgba(255, 215, 0, 0.05) 25%,
              rgba(107, 142, 35, 0.05) 50%,
              rgba(255, 215, 0, 0.05) 75%,
              rgba(107, 142, 35, 0.05) 100%
            );
          opacity: calc(var(--pointer-from-center, 0) * 0.3);
          transition: opacity 0.3s ease;
          pointer-events: none;
          border-radius: inherit;
          mix-blend-mode: overlay;
        }

        @media (max-width: 768px) {
          .hc-wrapper {
            transform: none !important;
          }
          
          .hc-card {
            transform: none !important;
          }
          
          .hc-shine,
          .hc-glare,
          .hc-inside::before {
            opacity: 0 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hc-wrapper,
          .hc-card,
          .hc-shine,
          .hc-glare,
          .hc-inside::before {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
          
          .hc-wrapper.active,
          .hc-card.active {
            transform: none !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default MembersPage;
