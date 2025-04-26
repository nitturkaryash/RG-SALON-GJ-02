import { useEffect, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePOS } from './usePOS'
import { useAppointments } from './useAppointments'
import { useServices } from './useServices'
import { useStylists } from './useStylists'
import { supabase } from '../utils/supabase/supabaseClient'
import { 
  format, 
  subDays, 
  isToday,
  isThisWeek,
  isThisMonth,
  parseISO, 
  isSameDay,
  startOfDay,
  endOfDay,
  isWithinInterval,
  differenceInDays,
  eachDayOfInterval,
} from 'date-fns'

// Analytics data types
export interface DailySales {
  date: string;
  sales: number;
}

export interface ServiceSales {
  serviceName: string;
  revenue: number;
  count: number;
}

export interface AnalyticsSummary {
  periodSales: number;
  previousPeriodSales: number;
  salesChangePercentage: number;
  periodAppointments: number;
  topServices: ServiceSales[];
  newCustomers: number;
  repeatCustomers: number;
  retentionRate: number;
  averageTicketPrice: number;
  previousAverageTicketPrice: number;
  averageTicketChangePercentage: number;
  staffUtilization: {
    average: number;
    byStaff: {
      stylistId: string;
      stylistName: string;
      rate: number;
    }[];
  };
  dailySalesTrend: DailySales[];
  stylistRevenue: {
    stylistId: string;
    stylistName: string;
    revenue: number;
  }[];
}

export interface DashboardSettings {
  visibleMetrics: {
    dailySales: boolean;
    topServices: boolean;
    appointments: boolean;
    retentionRate: boolean;
    averageTicket: boolean;
    staffUtilization: boolean;
    stylistRevenue: boolean;
  };
  chartTypes: {
    salesTrend: 'line' | 'bar';
  };
  refreshInterval: number; // in milliseconds
}

// Add props for date range
interface UseDashboardAnalyticsProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export function useDashboardAnalytics({ startDate, endDate }: UseDashboardAnalyticsProps) {
  const queryClient = useQueryClient()
  const { orders, isLoading: loadingOrders } = usePOS();
  const { appointments, isLoading: loadingAppointments } = useAppointments();
  const { services, isLoading: loadingServices } = useServices();
  const { stylists, isLoading: loadingStylists } = useStylists();
  
  // Default dashboard settings
  const [settings, setSettings] = useState<DashboardSettings>({
    visibleMetrics: {
      dailySales: true,
      topServices: true,
      appointments: true,
      retentionRate: true,
      averageTicket: true,
      staffUtilization: true,
      stylistRevenue: true,
    },
    chartTypes: {
      salesTrend: 'line',
    },
    refreshInterval: 30000, // 30 seconds
  });

  // Setup Supabase real-time subscriptions
  useEffect(() => {
    console.log('Setting up Supabase real-time subscriptions for dashboard...');
    
    // Create a single channel for all subscriptions (more reliable)
    const dashboardChannel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pos_orders'
      }, (payload) => {
        console.log('POS orders changed:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments'
      }, (payload) => {
        console.log('Appointments changed:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'services'
      }, (payload) => {
        console.log('Services changed:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'collection_services'
      }, (payload) => {
        console.log('Collection services changed:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
        queryClient.invalidateQueries({ queryKey: ['collectionServices'] });
      })
      .subscribe();
    
    console.log('Dashboard real-time subscriptions set up');
    
    // Test Supabase connection at setup
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('services')
          .select('count', { count: 'exact', head: true });
          
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection successful for dashboard');
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };
    
    testConnection();

    // Cleanup subscription when component unmounts
    return () => {
      console.log('Cleaning up dashboard real-time subscriptions');
      dashboardChannel.unsubscribe();
    };
  }, [queryClient]);
  
  // Process analytics data - Now uses startDate and endDate from queryKey
  const getAnalyticsSummary = useCallback(async ({ queryKey }: { queryKey: any[] }): Promise<AnalyticsSummary> => {
    // Destructure dates from the query key
    const [_key, currentStartDate, currentEndDate] = queryKey;
    
    try {
      console.log(`Fetching analytics data for dashboard from ${currentStartDate} to ${currentEndDate}...`);
      
      // Convert string dates to Date objects at the start/end of the day for accurate comparison
      const start = startOfDay(parseISO(currentStartDate));
      const end = endOfDay(parseISO(currentEndDate));
      const interval = { start, end };
      
      // Calculate previous period for comparison
      const durationInDays = differenceInDays(end, start) + 1;
      const prevStart = startOfDay(subDays(start, durationInDays));
      const prevEnd = endOfDay(subDays(end, durationInDays));
      const prevInterval = { start: prevStart, end: prevEnd };
      
      console.log(`Current Period: ${format(start, 'yyyy-MM-dd')} - ${format(end, 'yyyy-MM-dd')} (${durationInDays} days)`);
      console.log(`Previous Period: ${format(prevStart, 'yyyy-MM-dd')} - ${format(prevEnd, 'yyyy-MM-dd')}`);

      // --- Data Fetching/Handling (Simplified - assumes data is available from hooks) ---
      // In a real scenario, you might pass the date range to the underlying hooks 
      // or fetch directly within this function if needed.
      // For now, we filter the data available from usePOS, useAppointments etc.
      
      if (loadingOrders || loadingAppointments || loadingServices || loadingStylists) {
        console.warn('Still loading initial data, analytics might be incomplete.');
        // Consider returning a loading state or minimal default summary
      }

      const safeOrders = orders || [];
      const safeAppointments = appointments || [];
      const safeServices = services || [];
      const safeStylists = stylists || [];

      // Filter orders by complete status and date range
      const completedOrders = safeOrders.filter(order => order.status === 'completed');
      
      const periodOrders = completedOrders.filter(order => 
        isWithinInterval(parseISO(order.created_at), interval)
      );
      
      const previousPeriodOrders = completedOrders.filter(order => 
        isWithinInterval(parseISO(order.created_at), prevInterval)
      );
      
      // Sales calculations for the period
      const periodSales = periodOrders.reduce((sum, order) => sum + order.total, 0);
      const previousPeriodSales = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
      
      // Calculate sales change percentage
      const salesChangePercentage = previousPeriodSales === 0 
        ? (periodSales > 0 ? 100 : 0) // Avoid division by zero, show 100% if sales increased from 0
        : ((periodSales - previousPeriodSales) / previousPeriodSales) * 100;
      
      // Appointments for the period
      const periodAppointments = safeAppointments.filter((appointment: any) => 
        isWithinInterval(parseISO(appointment.start_time), interval)
      ).length;
      
      // Top services by revenue for the period
      const serviceRevenueMap = new Map<string, ServiceSales>();
      periodOrders.forEach(order => {
        if (order.services && Array.isArray(order.services)) {
          order.services.forEach(service => {
            if (serviceRevenueMap.has(service.service_id)) {
              const current = serviceRevenueMap.get(service.service_id)!;
              serviceRevenueMap.set(service.service_id, {
                serviceName: service.service_name,
                revenue: current.revenue + service.price,
                count: current.count + 1,
              });
            } else {
              serviceRevenueMap.set(service.service_id, {
                serviceName: service.service_name,
                revenue: service.price,
                count: 1,
              });
            }
          });
        }
      });
      
      const topServices = Array.from(serviceRevenueMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Customer retention (Based on orders within the period)
      const customerVisitMap = new Map<string, number>();
      periodOrders.forEach(order => {
        if (order.client_name) {
          const customer = order.client_name;
          customerVisitMap.set(customer, (customerVisitMap.get(customer) || 0) + 1);
        }
      });
      
      const newCustomers = Array.from(customerVisitMap.values()).filter(count => count === 1).length;
      const repeatCustomers = Array.from(customerVisitMap.values()).filter(count => count > 1).length;
      const totalCustomers = newCustomers + repeatCustomers;
      const retentionRate = totalCustomers === 0 ? 0 : (repeatCustomers / totalCustomers) * 100;
      
      // Average ticket price (Using period and previous period orders)
      const averageTicketPrice = periodOrders.length === 0 
        ? 0 
        : periodSales / periodOrders.length; // Simpler calculation
      
      const previousAverageTicketPrice = previousPeriodOrders.length === 0 
        ? 0 
        : previousPeriodSales / previousPeriodOrders.length; // Simpler calculation
      
      const averageTicketChangePercentage = previousAverageTicketPrice === 0 
        ? (averageTicketPrice > 0 ? 100 : 0) // Avoid division by zero
        : ((averageTicketPrice - previousAverageTicketPrice) / previousAverageTicketPrice) * 100;
      
      // Staff utilization (Consider if this should be range-based or current snapshot)
      // Keeping current logic (based on all appointments) for simplicity, 
      // but could be filtered by date range if needed.
      const stylistAppointmentMap = new Map<string, number>();
      safeStylists.forEach(stylist => {
        stylistAppointmentMap.set(stylist.id, 0);
      });
      
      // Count appointments for each stylist
      safeAppointments.forEach((appointment: any) => {
        if (appointment.stylist_id && stylistAppointmentMap.has(appointment.stylist_id)) {
          stylistAppointmentMap.set(
            appointment.stylist_id, 
            (stylistAppointmentMap.get(appointment.stylist_id) || 0) + 1
          );
        }
      });
      
      // Calculate utilization rates (assuming 8-hour day, 30-minute slots = 16 possible appointments per day)
      const SLOTS_PER_DAY = 16;
      const staffUtilizationData = safeStylists.map(stylist => {
        const appointmentCount = stylistAppointmentMap.get(stylist.id) || 0;
        const rate = (appointmentCount / SLOTS_PER_DAY) * 100;
        return {
          stylistId: stylist.id,
          stylistName: stylist.name,
          rate: Math.min(rate, 100), // Cap at 100%
        };
      });
      
      const averageUtilization = safeStylists.length === 0 ? 0 : 
        staffUtilizationData.reduce((sum, item) => sum + item.rate, 0) / safeStylists.length;
      
      // Calculate revenue per stylist for the period
      const stylistRevenueMap = new Map<string, number>();
      safeStylists.forEach(stylist => {
        stylistRevenueMap.set(stylist.id, 0);
      });
      
      // Sum revenue for each stylist from completed orders *in the period*
      periodOrders.forEach(order => {
        if (order.stylist_id && stylistRevenueMap.has(order.stylist_id)) {
          stylistRevenueMap.set(
            order.stylist_id,
            (stylistRevenueMap.get(order.stylist_id) || 0) + order.total
          );
        }
      });
      
      // Format stylist revenue data
      const stylistRevenue = safeStylists
        .map(stylist => ({
          stylistId: stylist.id,
          stylistName: stylist.name,
          revenue: stylistRevenueMap.get(stylist.id) || 0,
        }))
        .sort((a, b) => b.revenue - a.revenue); // Sort by revenue (highest first)
      
      // Daily sales trend *for the selected period*
      const daysInPeriod = eachDayOfInterval(interval);
      
      const dailySalesTrend = daysInPeriod.map(date => {
        const dayOrders = periodOrders.filter(order => isSameDay(parseISO(order.created_at), date));
        const daySales = dayOrders.reduce((sum, order) => sum + order.total, 0);
        return {
          date: format(date, 'MM/dd'),
          sales: daySales,
        };
      });
      
      console.log('Analytics calculation complete.');
      
      return {
        periodSales,
        previousPeriodSales,
        salesChangePercentage,
        periodAppointments,
        topServices,
        newCustomers,
        repeatCustomers,
        retentionRate,
        averageTicketPrice,
        previousAverageTicketPrice,
        averageTicketChangePercentage,
        staffUtilization: {
          average: averageUtilization,
          byStaff: staffUtilizationData,
        },
        dailySalesTrend,
        stylistRevenue,
      };
    } catch (error) {
      console.error('Error in getAnalyticsSummary:', error);
      return {
        periodSales: 0,
        previousPeriodSales: 0,
        salesChangePercentage: 0,
        periodAppointments: 0,
        topServices: [],
        newCustomers: 0,
        repeatCustomers: 0,
        retentionRate: 0,
        averageTicketPrice: 0,
        previousAverageTicketPrice: 0,
        averageTicketChangePercentage: 0,
        staffUtilization: { average: 0, byStaff: [] },
        dailySalesTrend: [],
        stylistRevenue: [],
      };
    }
  }, [orders, appointments, services, stylists, loadingOrders, loadingAppointments, loadingServices, loadingStylists]);
  
  // Use query for analytics data - Pass dates in queryKey
  const { data: analyticsSummary, refetch, isLoading: loadingAnalytics } = useQuery({
    // Query key now includes the date range
    queryKey: ['dashboard-analytics', startDate, endDate], 
    queryFn: getAnalyticsSummary, // Automatically receives queryKey
    enabled: !!startDate && !!endDate, // Only run query if dates are valid
    refetchInterval: settings.refreshInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000, // Consider data stale after 5 seconds
  });
  
  // Function to manually refresh data
  const refreshDashboard = useCallback(() => {
    console.log('Manually refreshing dashboard data');
    queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['stylists'] });
    refetch();
  }, [queryClient, refetch]);
  
  // Update dashboard settings
  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  return {
    analyticsSummary,
    isLoading: loadingOrders || loadingAppointments || loadingServices || loadingStylists || loadingAnalytics,
    refetchAnalytics: refreshDashboard,
    settings,
    updateSettings,
  };
} 