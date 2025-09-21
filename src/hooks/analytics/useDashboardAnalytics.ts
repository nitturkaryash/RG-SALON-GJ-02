import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePOS } from '../orders/usePOS';
import { useAppointments } from '../appointments/useAppointments';
import { useServices } from '../products/useServices';
import { useStylists } from '../useStylists';
import { supabase } from '../../lib/supabase';
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
  getHours,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

// Helper for deep merging settings
const isObject = (item: any): item is object => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

const mergeDeep = <T extends object>(target: T, source: Partial<T>): T => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof T;
      if (
        isObject(source[sourceKey]) &&
        target[sourceKey] &&
        isObject(target[sourceKey])
      ) {
        output[sourceKey] = mergeDeep(
          target[sourceKey] as object,
          source[sourceKey] as object
        ) as T[keyof T];
      } else if (source[sourceKey] !== undefined) {
        output[sourceKey] = source[sourceKey] as T[keyof T];
      }
    });
  }
  return output;
};

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

// Enhanced analytics interfaces
export interface PaymentMethodBreakdown {
  paymentMethod: string;
  amount: number;
  count: number;
  percentage: number;
  isSplit?: boolean;
}

export interface SplitPaymentDetails {
  orderId: string;
  totalAmount: number;
  customerName?: string;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  date: string;
}

export interface PeakHoursData {
  hour: string;
  appointments: number;
  revenue: number;
  efficiency: number;
}

export interface AppointmentStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  revenue?: number;
}

export interface ServiceCategoryBreakdown {
  category: string;
  revenue: number;
  count: number;
  percentage: number;
  averagePrice: number;
}

export interface MonthlyComparison {
  metric: string;
  currentMonth: number;
  previousMonth: number;
  changePercentage: number;
}

// New comprehensive analytics
export interface StockAnalytics {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
  criticalItems: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    reorderLevel: number;
    status: 'out_of_stock' | 'low_stock' | 'critical';
    category: string;
    description: string;
    mrp: number;
    value: number;
  }>;
  inventoryValue: number;
  topSellingProducts: Array<{
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface CustomerBehaviorAnalytics {
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageVisitInterval: number;
  customerLifetimeValue: number;
  topCustomers: Array<{
    customerName: string;
    totalSpent: number;
    visitCount: number;
    lastVisit: string;
  }>;
  visitFrequencyDistribution: Array<{
    range: string;
    customerCount: number;
  }>;
}

export interface StaffPerformanceAnalytics {
  totalStaff: number;
  averageRevenue: number;
  topPerformers: Array<{
    stylistId: string;
    stylistName: string;
    revenue: number;
    appointmentCount: number;
    serviceCount: number;
    efficiency: number;
    performanceScore: number;
    performanceRating: string;
    incentiveEligible: boolean;
    suggestedIncentive: number;
    industryStandardMet: boolean;
  }>;
  staffUtilization: {
    average: number;
    byStaff: Array<{
      stylistId: string;
      stylistName: string;
      utilizationRate: number;
      hoursWorked: number;
      revenuePerHour: number;
    }>;
  };
}

export interface AppointmentAnalytics {
  totalAppointments: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageServiceDuration: number;
  bookingLeadTime: number;
  repeatBookingRate: number;
  statusBreakdown: AppointmentStatusBreakdown[];
  peakBookingHours: PeakHoursData[];
  stylistRevenue: {
    stylistId: string;
    stylistName: string;
    revenue: number;
    appointmentCount: number;
  }[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  serviceVsProductRatio: {
    services: number;
    products: number;
  };
  averageTransactionValue: number;
  revenueGrowthRate: number;
  dailyRevenueGoal: number;
  monthlyProjection: number;
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
  dailySalesTrend: DailySales[];
  stylistRevenue: {
    stylistId: string;
    stylistName: string;
    revenue: number;
    appointmentCount: number;
  }[];

  // Enhanced analytics
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  splitPaymentDetails: SplitPaymentDetails[];
  peakHours: PeakHoursData[];
  appointmentStatusBreakdown: AppointmentStatusBreakdown[];
  serviceCategoryBreakdown: ServiceCategoryBreakdown[];
  monthlyComparison: MonthlyComparison[];
  totalCustomers: number;
  averageServiceTime: number;
  weeklyGrowthRate: number;

  // New comprehensive analytics
  stockAnalytics: StockAnalytics;
  customerBehavior: CustomerBehaviorAnalytics;
  staffPerformance: StaffPerformanceAnalytics;
  appointmentAnalytics: AppointmentAnalytics;
  revenueAnalytics: RevenueAnalytics;

  // Real-time metrics
  todaysMetrics: {
    revenue: number;
    appointments: number;
    walkIns: number;
    averageTicket: number;
    topService: string;
    busyHour: string;
  };

  // Operational insights
  operationalInsights: {
    bottlenecks: string[];
    opportunities: string[];
    recommendations: string[];
    alerts: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      action?: string;
    }>;
  };

  // New enhanced features
  upcomingAppointments: UpcomingAppointment[];
  criticalAlerts: CriticalAlert[];
  stockShortageAlerts: StockAlert[];

  // Enhanced appointment reminders
  appointmentReminders: {
    today: UpcomingAppointment[];
    tomorrow: UpcomingAppointment[];
    thisWeek: UpcomingAppointment[];
    overdue: UpcomingAppointment[];
  };
}

export interface DashboardSettings {
  visibleMetrics: {
    // Core metrics
    dailySales: boolean;
    topServices: boolean;
    appointments: boolean;
    retentionRate: boolean;
    averageTicket: boolean;

    // Payment analytics
    paymentMethods: boolean;
    splitPayments: boolean;
    paymentTrends: boolean;

    // Operational analytics
    peakHours: boolean;
    appointmentStatus: boolean;
    serviceCategories: boolean;
    monthlyComparison: boolean;

    // Customer analytics
    customerBehavior: boolean;
    customerRetention: boolean;
    customerLifetimeValue: boolean;
    visitFrequency: boolean;

    // Advanced analytics
    revenueBreakdown: boolean;
    operationalInsights: boolean;
    realTimeMetrics: boolean;
    todaysSummary: boolean;

    // New enhanced features
    upcomingAppointments: boolean;
    criticalAlerts: boolean;
    appointmentReminders: boolean;
  };
  chartTypes: {
    salesTrend: 'line' | 'bar';
    topServices: 'bar' | 'pie' | 'doughnut';
    customerRetention: 'pie' | 'doughnut' | 'bar';
    paymentMethods: 'pie' | 'doughnut' | 'bar';
    peakHours: 'line' | 'bar';
    appointmentStatus: 'pie' | 'doughnut' | 'bar';
    serviceCategories: 'pie' | 'doughnut' | 'bar';
    customerBehavior: 'line' | 'bar' | 'area';
    revenueBreakdown: 'pie' | 'doughnut' | 'bar';
  };
  refreshInterval: number;
  alertThresholds: {
    lowRevenue: number;
    highCancellation: number;
  };
}

// Add props for date range
interface UseDashboardAnalyticsProps {
  startDate: string;
  endDate: string;
}

export function useDashboardAnalytics({
  startDate,
  endDate,
}: UseDashboardAnalyticsProps) {
  const queryClient = useQueryClient();
  const { orders, loading: loadingOrders } = usePOS();
  const { appointments, isLoading: loadingAppointments } = useAppointments();
  const { services, isLoading: loadingServices } = useServices();
  const { stylists, isLoading: loadingStylists } = useStylists();

  // Enhanced dashboard settings
  const [settings, setSettings] = useState<DashboardSettings>({
    visibleMetrics: {
      // Core metrics
      dailySales: true,
      topServices: true,
      appointments: true,
      retentionRate: true,
      averageTicket: true,

      // Payment analytics
      paymentMethods: true,
      splitPayments: true,
      paymentTrends: false,

      // Operational analytics
      peakHours: true,
      appointmentStatus: true,
      serviceCategories: true,
      monthlyComparison: false,

      // Customer analytics
      customerBehavior: true,
      customerRetention: true,
      customerLifetimeValue: false,
      visitFrequency: false,

      // Advanced analytics
      revenueBreakdown: true,
      operationalInsights: true,
      realTimeMetrics: true,
      todaysSummary: true,

      // New enhanced features
      upcomingAppointments: true,
      criticalAlerts: true,
      appointmentReminders: true,
    },
    chartTypes: {
      salesTrend: 'line',
      topServices: 'bar',
      customerRetention: 'pie',
      paymentMethods: 'pie',
      peakHours: 'bar',
      appointmentStatus: 'doughnut',
      serviceCategories: 'pie',
      customerBehavior: 'line',
      revenueBreakdown: 'doughnut',
    },
    refreshInterval: 30000,
    alertThresholds: {
      lowRevenue: 1000,
      highCancellation: 20,
    },
  });

  // Setup Supabase real-time subscriptions
  useEffect(() => {
    console.log('Setting up comprehensive real-time subscriptions...');

    const dashboardChannel = supabase
      .channel('comprehensive_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_orders',
        },
        payload => {
          console.log('POS orders changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        payload => {
          console.log('Appointments changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_balance_stock',
        },
        payload => {
          console.log('Inventory changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        payload => {
          console.log('Clients changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
      )
      .subscribe();

    return () => {
      dashboardChannel.unsubscribe();
    };
  }, [queryClient]);

  // Comprehensive analytics processing
  const getAnalyticsSummary = useCallback(
    async ({ queryKey }: { queryKey: any[] }): Promise<AnalyticsSummary> => {
      const [_key, currentStartDate, currentEndDate] = queryKey;

      try {
        console.log(
          `Fetching comprehensive analytics from ${currentStartDate} to ${currentEndDate}...`
        );

        const start = startOfDay(parseISO(currentStartDate));
        const end = endOfDay(parseISO(currentEndDate));
        const interval = { start, end };

        const durationInDays = differenceInDays(end, start) + 1;
        const prevStart = startOfDay(subDays(start, durationInDays));
        const prevEnd = endOfDay(subDays(end, durationInDays));
        const prevInterval = { start: prevStart, end: prevEnd };

        if (
          loadingOrders ||
          loadingAppointments ||
          loadingServices ||
          loadingStylists
        ) {
          console.warn('Still loading initial data...');
        }

        const safeOrders = orders || [];
        const safeAppointments = appointments || [];
        const safeServices = services || [];
        const safeStylists = stylists || [];

        // Filter completed orders
        const completedOrders = safeOrders.filter(
          order => order.status === 'completed'
        );
        const periodOrders = completedOrders.filter(order =>
          isWithinInterval(parseISO(order.created_at), interval)
        );
        const previousPeriodOrders = completedOrders.filter(order =>
          isWithinInterval(parseISO(order.created_at), prevInterval)
        );

        // **1. ENHANCED PAYMENT ANALYTICS**
        const paymentMethodMap = new Map<
          string,
          { amount: number; count: number; isSplit: boolean }
        >();
        const splitPaymentDetails: SplitPaymentDetails[] = [];

        periodOrders.forEach(order => {
          if (
            order.is_split_payment &&
            order.payments &&
            Array.isArray(order.payments)
          ) {
            // Handle split payments
            const splitDetail: SplitPaymentDetails = {
              orderId: order.id,
              totalAmount: order.total,
              customerName: order.client_name,
              paymentMethods: [],
              date: order.created_at,
            };

            order.payments.forEach((payment: any) => {
              const method = payment.payment_method || 'cash';
              const amount = payment.amount || 0;

              if (paymentMethodMap.has(method)) {
                const current = paymentMethodMap.get(method)!;
                paymentMethodMap.set(method, {
                  amount: current.amount + amount,
                  count: current.count + 1,
                  isSplit: true,
                });
              } else {
                paymentMethodMap.set(method, {
                  amount,
                  count: 1,
                  isSplit: true,
                });
              }

              splitDetail.paymentMethods.push({
                method,
                amount,
                percentage: (amount / order.total) * 100,
              });
            });

            splitPaymentDetails.push(splitDetail);
          } else {
            // Handle single payments
            const method = order.payment_method || 'cash';
            if (paymentMethodMap.has(method)) {
              const current = paymentMethodMap.get(method)!;
              paymentMethodMap.set(method, {
                amount: current.amount + order.total,
                count: current.count + 1,
                isSplit: false,
              });
            } else {
              paymentMethodMap.set(method, {
                amount: order.total,
                count: 1,
                isSplit: false,
              });
            }
          }
        });

        const totalPaymentAmount = Array.from(paymentMethodMap.values()).reduce(
          (sum, data) => sum + data.amount,
          0
        );
        const paymentMethodBreakdown = Array.from(
          paymentMethodMap.entries()
        ).map(([method, data]) => ({
          paymentMethod: method,
          amount: data.amount,
          count: data.count,
          percentage:
            totalPaymentAmount > 0
              ? (data.amount / totalPaymentAmount) * 100
              : 0,
          isSplit: data.isSplit,
        }));

        // **2. INVENTORY ANALYTICS WITH PRODUCT MASTER INTEGRATION**
        let stockAnalytics: StockAnalytics = {
          totalProducts: 0,
          outOfStock: 0,
          lowStock: 0,
          inStock: 0,
          criticalItems: [],
          inventoryValue: 0,
          topSellingProducts: [],
        };

        try {
          console.log(
            'Fetching inventory data with product master integration...'
          );

          // First, try to get inventory data with product master join
          let inventoryData: any[] = [];
          let hasProductMaster = false;

          try {
            console.log(
              'Attempting to fetch inventory with product_master join...'
            );
            const { data: inventoryWithMaster, error: masterError } =
              await supabase.from('inventory_balance_stock').select(`
              *,
              product_master(
                id,
                name,
                description,
                category,
                mrp_incl_gst
              )
            `);

            if (
              !masterError &&
              inventoryWithMaster &&
              inventoryWithMaster.length > 0
            ) {
              console.log(
                'Successfully fetched inventory with product_master:',
                inventoryWithMaster.length,
                'items'
              );
              inventoryData = inventoryWithMaster;
              hasProductMaster = true;
            } else {
              console.log(
                'Product master join failed or no data:',
                masterError?.message || 'No data'
              );
              throw new Error('Product master join failed');
            }
          } catch (masterErr) {
            console.log(
              'Product master approach failed, trying alternative...'
            );

            // Alternative: Try to get data from product_master directly and join with inventory
            try {
              const { data: productMasterData, error: pmError } =
                await supabase.from('product_master').select(`
                id,
                name,
                description,
                category,
                mrp_incl_gst,
                stock_quantity
              `);

              if (!pmError && productMasterData) {
                console.log(
                  'Found product_master table with',
                  productMasterData.length,
                  'products'
                );

                // Convert product_master data to inventory format
                inventoryData = productMasterData.map(product => ({
                  product_name: product.name,
                  product_id: product.id,
                  balance_qty: product.stock_quantity || 0,
                  product_master: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    mrp_incl_gst: product.mrp_incl_gst,
                  },
                }));
                hasProductMaster = true;
                console.log(
                  'Successfully converted product_master data to inventory format'
                );
              } else {
                console.log(
                  'Product master table fetch failed:',
                  pmError?.message
                );
                throw new Error('Product master not available');
              }
            } catch (pmErr) {
              console.log('Product master table approach also failed:', pmErr);

              // Final fallback: Use basic inventory_balance_stock
              const { data: basicInventoryData, error: basicError } =
                await supabase.from('inventory_balance_stock').select('*');

              if (!basicError && basicInventoryData) {
                console.log(
                  'Using basic inventory_balance_stock data:',
                  basicInventoryData.length,
                  'items'
                );
                inventoryData = basicInventoryData;
                hasProductMaster = false;
              } else {
                console.log(
                  'Even basic inventory fetch failed:',
                  basicError?.message
                );
                throw new Error('No inventory data available');
              }
            }
          }

          if (inventoryData && inventoryData.length > 0) {
            console.log(
              'Processing inventory data:',
              inventoryData.length,
              'items, hasProductMaster:',
              hasProductMaster
            );

            const outOfStockItems = inventoryData.filter(
              item => (item.balance_qty || 0) <= 0
            );
            const lowStockItems = inventoryData.filter(
              item =>
                (item.balance_qty || 0) > 0 &&
                (item.balance_qty || 0) <= settings.alertThresholds.lowRevenue
            );
            const inStockItems = inventoryData.filter(
              item =>
                (item.balance_qty || 0) > settings.alertThresholds.lowRevenue
            );

            // Get critical items with enhanced product details
            const criticalItems = [...outOfStockItems, ...lowStockItems]
              .map(item => {
                const productMaster = item.product_master;
                const productName =
                  productMaster?.name || item.product_name || 'Unknown Product';
                const productId =
                  productMaster?.id || item.product_id || item.id || 'unknown';
                const category =
                  productMaster?.category || item.category || 'Uncategorized';
                const description =
                  productMaster?.description || item.description || '';
                const mrp =
                  productMaster?.mrp_incl_gst || item.mrp_incl_gst || 0;
                const currentStock = item.balance_qty || 0;

                return {
                  productId,
                  productName,
                  currentStock,
                  reorderLevel: settings.alertThresholds.lowRevenue,
                  status: (currentStock <= 0 ? 'out_of_stock' : 'low_stock') as
                    | 'out_of_stock'
                    | 'low_stock'
                    | 'critical',
                  category,
                  description:
                    description.length > 60
                      ? description.substring(0, 60) + '...'
                      : description,
                  mrp,
                  value: currentStock * mrp,
                };
              })
              .sort((a, b) => a.currentStock - b.currentStock); // Most critical first

            stockAnalytics = {
              totalProducts: inventoryData.length,
              outOfStock: outOfStockItems.length,
              lowStock: lowStockItems.length,
              inStock: inStockItems.length,
              criticalItems,
              inventoryValue: inventoryData.reduce((sum, item) => {
                const stock = item.balance_qty || 0;
                const price =
                  item.product_master?.mrp_incl_gst || item.mrp_incl_gst || 0;
                return sum + stock * price;
              }, 0),
              topSellingProducts: [], // Would need sales data calculation
            };

            console.log('Stock analytics calculated successfully:', {
              total: stockAnalytics.totalProducts,
              critical: stockAnalytics.criticalItems.length,
              outOfStock: stockAnalytics.outOfStock,
              lowStock: stockAnalytics.lowStock,
              inventoryValue: stockAnalytics.inventoryValue,
              hasProductMaster,
              sampleCriticalItem: stockAnalytics.criticalItems[0],
            });
          } else {
            console.log('No inventory data found');
          }
        } catch (err) {
          console.error('Complete inventory fetch failed:', err);

          // Ultimate fallback with empty data but proper structure
          stockAnalytics = {
            totalProducts: 0,
            outOfStock: 0,
            lowStock: 0,
            inStock: 0,
            criticalItems: [],
            inventoryValue: 0,
            topSellingProducts: [],
          };
        }

        // **3. CUSTOMER BEHAVIOR ANALYTICS**
        const customerVisitMap = new Map<
          string,
          { visits: number; totalSpent: number; lastVisit: string }
        >();
        periodOrders.forEach(order => {
          if (order.client_name) {
            const customer = order.client_name;
            if (customerVisitMap.has(customer)) {
              const current = customerVisitMap.get(customer)!;
              customerVisitMap.set(customer, {
                visits: current.visits + 1,
                totalSpent: current.totalSpent + order.total,
                lastVisit: order.created_at,
              });
            } else {
              customerVisitMap.set(customer, {
                visits: 1,
                totalSpent: order.total,
                lastVisit: order.created_at,
              });
            }
          }
        });

        const newCustomers = Array.from(customerVisitMap.values()).filter(
          data => data.visits === 1
        ).length;
        const returningCustomers = Array.from(customerVisitMap.values()).filter(
          data => data.visits > 1
        ).length;
        const totalCustomers = newCustomers + returningCustomers;
        const retentionRate =
          totalCustomers === 0
            ? 0
            : (returningCustomers / totalCustomers) * 100;

        const topCustomers = Array.from(customerVisitMap.entries())
          .map(([name, data]) => ({
            customerName: name,
            totalSpent: data.totalSpent,
            visitCount: data.visits,
            lastVisit: data.lastVisit,
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        const customerBehavior: CustomerBehaviorAnalytics = {
          newCustomers,
          returningCustomers,
          customerRetentionRate: retentionRate,
          averageVisitInterval: 0, // Would need historical data
          customerLifetimeValue:
            totalCustomers > 0
              ? Array.from(customerVisitMap.values()).reduce(
                  (sum, data) => sum + data.totalSpent,
                  0
                ) / totalCustomers
              : 0,
          topCustomers,
          visitFrequencyDistribution: [
            { range: '1 visit', customerCount: newCustomers },
            {
              range: '2-5 visits',
              customerCount: Array.from(customerVisitMap.values()).filter(
                data => data.visits >= 2 && data.visits <= 5
              ).length,
            },
            {
              range: '6+ visits',
              customerCount: Array.from(customerVisitMap.values()).filter(
                data => data.visits > 5
              ).length,
            },
          ],
        };

        // **4. STAFF PERFORMANCE ANALYTICS**
        const stylistRevenueMap = new Map<
          string,
          { revenue: number; appointmentCount: number; serviceCount: number }
        >();

        periodOrders.forEach(order => {
          if (order.stylist_id) {
            if (stylistRevenueMap.has(order.stylist_id)) {
              const current = stylistRevenueMap.get(order.stylist_id)!;
              stylistRevenueMap.set(order.stylist_id, {
                revenue: current.revenue + order.total,
                appointmentCount: current.appointmentCount + 1,
                serviceCount:
                  current.serviceCount + (order.services?.length || 0),
              });
            } else {
              stylistRevenueMap.set(order.stylist_id, {
                revenue: order.total,
                appointmentCount: 1,
                serviceCount: order.services?.length || 0,
              });
            }
          }
        });

        // Calculate performance scores
        const calculatePerformanceScore = (
          revenue: number,
          appointments: number,
          efficiency: number
        ) => {
          return Math.min((revenue / 10000) * 100, 100); // Use fixed minimum revenue of 10000
        };

        const getPerformanceRating = (score: number) => {
          if (score >= 90) return 'Excellent';
          if (score >= 75) return 'Good';
          if (score >= 50) return 'Average';
          return 'Needs Improvement';
        };

        const staffPerformance: StaffPerformanceAnalytics = {
          totalStaff: safeStylists.length,
          averageRevenue:
            safeStylists.length > 0
              ? Array.from(stylistRevenueMap.values()).reduce(
                  (sum, data) => sum + data.revenue,
                  0
                ) / safeStylists.length
              : 0,
          topPerformers: safeStylists
            .map(stylist => {
              const perfData = stylistRevenueMap.get(stylist.id) || {
                revenue: 0,
                appointmentCount: 0,
                serviceCount: 0,
              };
              const efficiency =
                perfData.appointmentCount > 0
                  ? perfData.revenue / perfData.appointmentCount
                  : 0;
              const performanceScore = calculatePerformanceScore(
                perfData.revenue,
                perfData.appointmentCount,
                efficiency
              );
              const performanceRating = getPerformanceRating(performanceScore);

              return {
                stylistId: stylist.id,
                stylistName: stylist.name,
                revenue: perfData.revenue,
                appointmentCount: perfData.appointmentCount,
                serviceCount: perfData.serviceCount,
                efficiency: efficiency,
                performanceScore: Math.round(performanceScore),
                performanceRating,
                incentiveEligible: false,
                suggestedIncentive: 0,
                industryStandardMet: false,
              };
            })
            .sort((a, b) => b.revenue - a.revenue),
          staffUtilization: {
            average: 0,
            byStaff: [],
          },
        };

        // **5. APPOINTMENT ANALYTICS**
        const periodAppointmentsList = safeAppointments.filter(
          (appointment: any) =>
            isWithinInterval(parseISO(appointment.start_time), interval)
        );

        const statusMap = new Map<string, number>();
        periodAppointmentsList.forEach((appointment: any) => {
          const status = appointment.status || 'scheduled';
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        const totalAppointmentsCount = periodAppointmentsList.length;
        const appointmentStatusBreakdown = Array.from(statusMap.entries()).map(
          ([status, count]) => ({
            status,
            count,
            percentage:
              totalAppointmentsCount > 0
                ? (count / totalAppointmentsCount) * 100
                : 0,
          })
        );

        const appointmentAnalytics: AppointmentAnalytics = {
          totalAppointments: totalAppointmentsCount,
          completionRate:
            totalAppointmentsCount > 0
              ? ((statusMap.get('completed') || 0) / totalAppointmentsCount) *
                100
              : 0,
          cancellationRate:
            totalAppointmentsCount > 0
              ? ((statusMap.get('cancelled') || 0) / totalAppointmentsCount) *
                100
              : 0,
          noShowRate:
            totalAppointmentsCount > 0
              ? ((statusMap.get('no_show') || 0) / totalAppointmentsCount) * 100
              : 0,
          averageServiceDuration: 60, // Would need actual duration calculation
          bookingLeadTime: 0, // Would need booking vs appointment date
          repeatBookingRate: 0, // Would need customer booking history
          statusBreakdown: appointmentStatusBreakdown,
          peakBookingHours: [], // Would need hourly booking data
          stylistRevenue: [],
        };

        // **6. REVENUE ANALYTICS**
        const periodSales = periodOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const previousPeriodSales = previousPeriodOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const salesChangePercentage =
          previousPeriodSales === 0
            ? periodSales > 0
              ? 100
              : 0
            : ((periodSales - previousPeriodSales) / previousPeriodSales) * 100;

        const serviceRevenue = periodOrders.reduce((sum, order) => {
          return (
            sum +
            (order.services
              ?.filter(s => s.type === 'service')
              .reduce((serviceSum, service) => serviceSum + service.price, 0) ||
              0)
          );
        }, 0);

        const productRevenue = periodSales - serviceRevenue;

        const revenueAnalytics: RevenueAnalytics = {
          totalRevenue: periodSales,
          serviceRevenue,
          productRevenue,
          serviceVsProductRatio: {
            services:
              periodSales > 0 ? (serviceRevenue / periodSales) * 100 : 0,
            products:
              periodSales > 0 ? (productRevenue / periodSales) * 100 : 0,
          },
          averageTransactionValue:
            periodOrders.length > 0 ? periodSales / periodOrders.length : 0,
          revenueGrowthRate: salesChangePercentage,
          dailyRevenueGoal: 5000, // Configurable
          monthlyProjection: (periodSales / durationInDays) * 30,
        };

        // **7. TODAY'S METRICS**
        const todayOrders = periodOrders.filter(order =>
          isToday(parseISO(order.created_at))
        );
        const todaysMetrics = {
          revenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
          appointments: safeAppointments.filter((apt: any) =>
            isToday(parseISO(apt.start_time))
          ).length,
          walkIns: todayOrders.filter(order => order.is_walk_in).length,
          averageTicket:
            todayOrders.length > 0
              ? todayOrders.reduce((sum, order) => sum + order.total, 0) /
                todayOrders.length
              : 0,
          topService: 'Haircut', // Would need service analysis
          busyHour: '2 PM', // Would need hourly analysis
        };

        // **8. UPCOMING APPOINTMENTS & REMINDERS**
        let upcomingAppointments: UpcomingAppointment[] = [];
        let appointmentReminders = {
          today: [] as UpcomingAppointment[],
          tomorrow: [] as UpcomingAppointment[],
          thisWeek: [] as UpcomingAppointment[],
          overdue: [] as UpcomingAppointment[],
        };

        try {
          const { data: futureAppointments, error: appointmentsError } =
            await supabase
              .from('appointments')
              .select(
                `
            id,
            start_time,
            end_time,
            duration,
            status,
            client_id,
            client_name,
            is_for_someone_else,
            booker_name,
            booker_phone,
            booker_email,
            clients!inner (
              id,
              full_name,
              phone,
              email
            ),
            services (
              id,
              name,
              duration,
              price
            ),
            stylists (
              id,
              name
            )
          `
              )
              .gte('start_time', new Date().toISOString())
              .lte(
                'start_time',
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              )
              .order('start_time', { ascending: true });

          if (!appointmentsError && futureAppointments) {
            upcomingAppointments = futureAppointments.map((apt: any) => {
              const appointmentDate = new Date(apt.start_time);
              const now = new Date();
              const tomorrow = new Date(now);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const endOfWeek = new Date(now);
              endOfWeek.setDate(endOfWeek.getDate() + 7);

              const isToday =
                appointmentDate.toDateString() === now.toDateString();
              const isTomorrow =
                appointmentDate.toDateString() === tomorrow.toDateString();
              const isThisWeek = appointmentDate <= endOfWeek;

              // Calculate time until appointment
              const timeDiff = appointmentDate.getTime() - now.getTime();
              const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
              const minutesUntil = Math.floor(
                (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
              );

              let timeUntilAppointment = '';
              if (hoursUntil < 0) {
                timeUntilAppointment = 'Overdue';
              } else if (hoursUntil === 0) {
                timeUntilAppointment = `${minutesUntil}m`;
              } else if (hoursUntil < 24) {
                timeUntilAppointment = `${hoursUntil}h ${minutesUntil}m`;
              } else {
                const days = Math.floor(hoursUntil / 24);
                timeUntilAppointment = `${days} day${days > 1 ? 's' : ''}`;
              }

              // Enhanced client name resolution with better fallback logic
              const getClientName = () => {
                // First try from the joined clients table
                if (apt.clients?.full_name) {
                  return apt.clients.full_name;
                }

                // Then try direct client_name field
                if (apt.client_name && apt.client_name !== 'Walk-in Customer') {
                  return apt.client_name;
                }

                // For someone else bookings, use booker name
                if (apt.is_for_someone_else && apt.booker_name) {
                  return `${apt.booker_name} (Booking for someone else)`;
                }

                // Default fallback
                return 'Walk-in Customer';
              };

              const appointment: UpcomingAppointment = {
                id: apt.id,
                clientName: getClientName(),
                serviceName: apt.services?.name || 'Service Consultation',
                stylistName: apt.stylists?.name || 'Staff Member',
                appointmentTime: apt.start_time,
                duration: apt.duration || apt.services?.duration || 60,
                price: apt.services?.price || 0,
                status: apt.status || 'scheduled',
                isToday,
                isTomorrow,
                isThisWeek,
                timeUntilAppointment,
              };

              // Categorize appointments
              if (timeDiff < 0) {
                appointmentReminders.overdue.push(appointment);
              } else if (isToday) {
                appointmentReminders.today.push(appointment);
              } else if (isTomorrow) {
                appointmentReminders.tomorrow.push(appointment);
              } else if (isThisWeek) {
                appointmentReminders.thisWeek.push(appointment);
              }

              return appointment;
            });
          }
        } catch (err) {
          console.warn('Could not fetch upcoming appointments:', err);
        }

        // **9. CRITICAL ALERTS & STOCK PROTECTION**
        const criticalAlerts: CriticalAlert[] = [];
        const stockShortageAlerts: StockAlert[] = [];

        // Check for negative stock (critical protection)
        if (stockAnalytics.criticalItems) {
          stockAnalytics.criticalItems.forEach(item => {
            if (item.currentStock < 0) {
              criticalAlerts.push({
                id: `negative-stock-${item.productName}`,
                type: 'negative_stock',
                severity: 'critical',
                title: 'NEGATIVE STOCK DETECTED',
                message: `${item.productName} has negative stock: ${item.currentStock}`,
                action: 'Immediate stock correction required',
                data: item,
                timestamp: new Date().toISOString(),
              });

              stockShortageAlerts.push({
                productId: item.productId,
                productName: item.productName,
                currentStock: item.currentStock,
                minimumRequired: item.reorderLevel,
                shortage: Math.abs(item.currentStock),
                estimatedRunoutDate: 'Already out of stock',
                priority: 'critical',
                isNegative: true,
              });
            } else if (item.currentStock <= item.reorderLevel) {
              const priority =
                item.currentStock === 0
                  ? 'critical'
                  : item.currentStock <= item.reorderLevel * 0.5
                    ? 'high'
                    : 'medium';

              criticalAlerts.push({
                id: `low-stock-${item.productName}`,
                type: 'stock_shortage',
                severity: priority,
                title: `${priority.toUpperCase()} STOCK ALERT`,
                message: `${item.productName} is running low: ${item.currentStock} remaining`,
                action: 'Reorder stock immediately',
                data: item,
                timestamp: new Date().toISOString(),
              });

              stockShortageAlerts.push({
                productId: item.productId,
                productName: item.productName,
                currentStock: item.currentStock,
                minimumRequired: item.reorderLevel,
                shortage: item.reorderLevel - item.currentStock,
                estimatedRunoutDate: 'Within 3-7 days',
                priority: priority as 'critical' | 'high' | 'medium',
                isNegative: false,
              });
            }
          });
        }

        // Check for revenue drops
        if (salesChangePercentage < -settings.alertThresholds.lowRevenue) {
          criticalAlerts.push({
            id: 'revenue-drop',
            type: 'revenue_drop',
            severity: 'high',
            title: 'REVENUE DROP ALERT',
            message: `Revenue has dropped by ${Math.abs(salesChangePercentage).toFixed(1)}%`,
            action: 'Review business performance and marketing strategies',
            data: {
              currentRevenue: periodSales,
              previousRevenue: previousPeriodSales,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Check for high cancellation rates
        const cancellationRate = appointmentAnalytics.cancellationRate;
        if (cancellationRate > settings.alertThresholds.highCancellation) {
          criticalAlerts.push({
            id: 'high-cancellation',
            type: 'appointment_conflict',
            severity: 'medium',
            title: 'HIGH CANCELLATION RATE',
            message: `Appointment cancellation rate is ${cancellationRate.toFixed(1)}%`,
            action: 'Review booking policies and customer communication',
            data: { cancellationRate },
            timestamp: new Date().toISOString(),
          });
        }

        // **10. OPERATIONAL INSIGHTS ENHANCEMENT**
        const operationalInsights = {
          bottlenecks: [
            'Long wait times during peak hours',
            'Inventory shortages',
          ],
          opportunities: ['Increase product sales', 'Offer loyalty programs'],
          recommendations: [
            'Hire additional staff for peak hours',
            'Implement online booking',
          ],
          alerts: criticalAlerts.map(
            (
              a
            ): {
              type: 'warning' | 'error' | 'info';
              message: string;
              action: string;
            } => ({
              type:
                a.severity === 'critical' || a.severity === 'high'
                  ? 'error'
                  : a.severity === 'medium'
                    ? 'warning'
                    : 'info',
              message: a.message,
              action: a.action,
            })
          ),
        };

        // **11. STOCK PROTECTION SYSTEM**
        const stockProtectionSystem = {
          validateStock: (
            productName: string,
            requestedQuantity: number,
            currentStock: number
          ) => {
            if (currentStock - requestedQuantity < 0) {
              return {
                valid: false,
                error: `Insufficient stock for ${productName}. Available: ${currentStock}, Requested: ${requestedQuantity}`,
                suggestion: `Maximum quantity available: ${currentStock}`,
              };
            }
            return { valid: true };
          },

          preventNegativeStock: (inventoryData: any[]) => {
            const violations = inventoryData.filter(
              item => item.balance_qty < 0
            );
            if (violations.length > 0) {
              criticalAlerts.push({
                id: 'stock-protection-violation',
                type: 'critical_stock',
                severity: 'critical',
                title: 'STOCK PROTECTION VIOLATION',
                message: `${violations.length} products have negative stock - system integrity compromised`,
                action:
                  'Immediate manual correction required - check inventory audit logs',
                data: violations,
                timestamp: new Date().toISOString(),
              });
            }
            return violations;
          },

          generateReorderSuggestions: (stockAnalytics: StockAnalytics) => {
            const suggestions: {
              productName: string;
              currentStock: number;
              suggestedOrderQuantity: number;
              priority: 'out_of_stock' | 'low_stock' | 'critical';
              estimatedCost: number;
            }[] = [];
            stockAnalytics.criticalItems.forEach(item => {
              const suggestedOrder = Math.max(
                item.reorderLevel * 2, // Minimum 2x reorder level
                50 // Minimum 50 units
              );
              suggestions.push({
                productName: item.productName,
                currentStock: item.currentStock,
                suggestedOrderQuantity: suggestedOrder,
                priority: item.status,
                estimatedCost: suggestedOrder * 100, // Placeholder cost calculation
              });
            });
            return suggestions;
          },
        };

        // Continue with existing analytics calculations...
        const topServices = Array.from(new Map<string, ServiceSales>().values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const averageTicketPrice =
          periodOrders.length === 0 ? 0 : periodSales / periodOrders.length;
        const previousAverageTicketPrice =
          previousPeriodOrders.length === 0
            ? 0
            : previousPeriodSales / previousPeriodOrders.length;
        const averageTicketChangePercentage =
          previousAverageTicketPrice === 0
            ? averageTicketPrice > 0
              ? 100
              : 0
            : ((averageTicketPrice - previousAverageTicketPrice) /
                previousAverageTicketPrice) *
              100;

        const dailySalesTrend = eachDayOfInterval(interval).map(date => {
          const dayOrders = periodOrders.filter(order =>
            isSameDay(parseISO(order.created_at), date)
          );
          const daySales = dayOrders.reduce(
            (sum, order) => sum + order.total,
            0
          );
          return {
            date: format(date, 'MM/dd'),
            sales: daySales,
          };
        });

        const stylistRevenue = safeStylists
          .map(stylist => ({
            stylistId: stylist.id,
            stylistName: stylist.name,
            revenue: stylistRevenueMap.get(stylist.id)?.revenue || 0,
            appointmentCount:
              stylistRevenueMap.get(stylist.id)?.appointmentCount || 0,
          }))
          .sort((a, b) => b.revenue - a.revenue);

        // Peak hours analysis
        const hourlyData = new Map<
          number,
          { appointments: number; revenue: number }
        >();
        for (let hour = 0; hour < 24; hour++) {
          hourlyData.set(hour, { appointments: 0, revenue: 0 });
        }

        periodAppointmentsList.forEach((appointment: any) => {
          const hour = parseISO(appointment.start_time).getHours();
          const current = hourlyData.get(hour)!;
          hourlyData.set(hour, {
            appointments: current.appointments + 1,
            revenue: current.revenue + (appointment.service_price || 0),
          });
        });

        const peakHours = Array.from(hourlyData.entries())
          .filter(([hour, data]) => data.appointments > 0)
          .map(([hour, data]) => ({
            hour: `${hour}:00`,
            appointments: data.appointments,
            revenue: data.revenue,
            efficiency:
              data.appointments > 0 ? data.revenue / data.appointments : 0,
          }))
          .sort((a, b) => b.appointments - a.appointments)
          .slice(0, 12);

        // Service category breakdown
        const categoryMap = new Map<
          string,
          { revenue: number; count: number }
        >();
        periodOrders.forEach(order => {
          if (order.services && Array.isArray(order.services)) {
            order.services.forEach(service => {
              const category = service.category || 'General Services';
              if (categoryMap.has(category)) {
                const current = categoryMap.get(category)!;
                categoryMap.set(category, {
                  revenue: current.revenue + service.price,
                  count: current.count + 1,
                });
              } else {
                categoryMap.set(category, {
                  revenue: service.price,
                  count: 1,
                });
              }
            });
          }
        });

        const totalCategoryRevenue = Array.from(categoryMap.values()).reduce(
          (sum, cat) => sum + cat.revenue,
          0
        );
        const serviceCategoryBreakdown = Array.from(categoryMap.entries()).map(
          ([category, data]) => ({
            category,
            revenue: data.revenue,
            count: data.count,
            percentage:
              totalCategoryRevenue > 0
                ? (data.revenue / totalCategoryRevenue) * 100
                : 0,
            averagePrice: data.count > 0 ? data.revenue / data.count : 0,
          })
        );

        const monthlyComparison: MonthlyComparison[] = [
          {
            metric: 'Revenue',
            currentMonth: periodSales,
            previousMonth: previousPeriodSales,
            changePercentage: salesChangePercentage,
          },
          {
            metric: 'Appointments',
            currentMonth: periodAppointmentsList.length,
            previousMonth: 0,
            changePercentage: 0,
          },
          {
            metric: 'Average Ticket',
            currentMonth: averageTicketPrice,
            previousMonth: previousAverageTicketPrice,
            changePercentage: averageTicketChangePercentage,
          },
        ];

        console.log('Comprehensive analytics calculation complete.');

        return {
          periodSales,
          previousPeriodSales,
          salesChangePercentage,
          periodAppointments: periodAppointmentsList.length,
          topServices,
          newCustomers,
          repeatCustomers: returningCustomers,
          retentionRate,
          averageTicketPrice,
          previousAverageTicketPrice,
          averageTicketChangePercentage,
          dailySalesTrend,
          stylistRevenue,
          paymentMethodBreakdown,
          splitPaymentDetails,
          peakHours,
          appointmentStatusBreakdown,
          serviceCategoryBreakdown,
          monthlyComparison,
          totalCustomers,
          averageServiceTime: 60,
          weeklyGrowthRate: salesChangePercentage,

          // Enhanced analytics
          stockAnalytics,
          customerBehavior,
          staffPerformance,
          appointmentAnalytics,
          revenueAnalytics,
          todaysMetrics,
          operationalInsights,
          upcomingAppointments,
          appointmentReminders,
          criticalAlerts,
          stockShortageAlerts,
        };
      } catch (error) {
        console.error('Error in comprehensive analytics:', error);
        // Return empty analytics structure
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
          dailySalesTrend: [],
          stylistRevenue: [],
          paymentMethodBreakdown: [],
          splitPaymentDetails: [],
          peakHours: [],
          appointmentStatusBreakdown: [],
          serviceCategoryBreakdown: [],
          monthlyComparison: [],
          totalCustomers: 0,
          averageServiceTime: 0,
          weeklyGrowthRate: 0,
          stockAnalytics: {
            totalProducts: 0,
            outOfStock: 0,
            lowStock: 0,
            inStock: 0,
            criticalItems: [],
            inventoryValue: 0,
            topSellingProducts: [],
          },
          customerBehavior: {
            newCustomers: 0,
            returningCustomers: 0,
            customerRetentionRate: 0,
            averageVisitInterval: 0,
            customerLifetimeValue: 0,
            topCustomers: [],
            visitFrequencyDistribution: [],
          },
          staffPerformance: {
            totalStaff: 0,
            averageRevenue: 0,
            topPerformers: [],
            staffUtilization: {
              average: 0,
              byStaff: [],
            },
          },
          appointmentAnalytics: {
            totalAppointments: 0,
            completionRate: 0,
            cancellationRate: 0,
            noShowRate: 0,
            averageServiceDuration: 0,
            bookingLeadTime: 0,
            repeatBookingRate: 0,
            statusBreakdown: [],
            peakBookingHours: [],
            stylistRevenue: [],
          },
          revenueAnalytics: {
            totalRevenue: 0,
            serviceRevenue: 0,
            productRevenue: 0,
            serviceVsProductRatio: { services: 0, products: 0 },
            averageTransactionValue: 0,
            revenueGrowthRate: 0,
            dailyRevenueGoal: 0,
            monthlyProjection: 0,
          },
          todaysMetrics: {
            revenue: 0,
            appointments: 0,
            walkIns: 0,
            averageTicket: 0,
            topService: '',
            busyHour: '',
          },
          operationalInsights: {
            bottlenecks: [],
            opportunities: [],
            recommendations: [],
            alerts: [],
          },
          upcomingAppointments: [],
          appointmentReminders: {
            today: [],
            tomorrow: [],
            thisWeek: [],
            overdue: [],
          },
          criticalAlerts: [],
          stockShortageAlerts: [],
        };
      }
    },
    [
      orders,
      appointments,
      services,
      stylists,
      loadingOrders,
      loadingAppointments,
      loadingServices,
      loadingStylists,
      settings.alertThresholds,
    ]
  );

  // Use query for analytics data
  const {
    data: analyticsSummary,
    refetch,
    isLoading: loadingAnalytics,
  } = useQuery({
    queryKey: ['dashboard-analytics', startDate, endDate],
    queryFn: getAnalyticsSummary,
    enabled:
      !loadingOrders &&
      !loadingAppointments &&
      !loadingServices &&
      !loadingStylists &&
      !!startDate &&
      !!endDate,
    refetchInterval: settings.refreshInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000,
  });

  // Function to manually refresh data
  const refreshDashboard = useCallback(async () => {
    console.log('Manually refreshing comprehensive dashboard data');
    try {
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      return { success: false, error };
    }
  }, [queryClient, refetch]);

  // Update dashboard settings with proper reactivity
  const updateSettings = useCallback(
    (newSettings: Partial<DashboardSettings>) => {
      console.log('Updating dashboard settings with:', newSettings);
      setSettings(prev => mergeDeep(prev, newSettings));
    },
    []
  );

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-settings', JSON.stringify(settings));
      console.log('Dashboard settings saved to localStorage.');
    } catch (error) {
      console.warn('Failed to save dashboard settings to localStorage:', error);
    }
  }, [settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('dashboard-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(currentSettings => mergeDeep(currentSettings, parsed));
        console.log('Dashboard settings loaded and merged from localStorage');
      }
    } catch (error) {
      console.warn(
        'Failed to load dashboard settings from localStorage:',
        error
      );
    }
  }, []);

  return {
    analyticsSummary,
    isLoading:
      loadingOrders ||
      loadingAppointments ||
      loadingServices ||
      loadingStylists ||
      loadingAnalytics,
    refetchAnalytics: refreshDashboard,
    settings,
    updateSettings,
  };
}

export interface UpcomingAppointment {
  id: string;
  clientName: string;
  serviceName: string;
  stylistName: string;
  appointmentTime: string;
  duration: number;
  price: number;
  status: string;
  isToday: boolean;
  isTomorrow: boolean;
  isThisWeek: boolean;
  timeUntilAppointment: string;
}

export interface CriticalAlert {
  id: string;
  type:
    | 'stock_shortage'
    | 'negative_stock'
    | 'appointment_conflict'
    | 'revenue_drop'
    | 'staff_utilization'
    | 'critical_stock';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
  data?: any;
  timestamp: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumRequired: number;
  shortage: number;
  estimatedRunoutDate: string;
  priority: 'critical' | 'high' | 'medium';
  isNegative: boolean;
}
