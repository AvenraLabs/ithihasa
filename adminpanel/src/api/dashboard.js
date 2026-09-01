import { apiClient } from './client.js';

export async function fetchDashboardAnalytics() {
  try {
    return await apiClient('/admin/dashboard');
  } catch (err) {
    console.warn('Dashboard analytics fetch note:', err);
    return {
      overview: {
        totalOrders: 0,
        paidOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        pendingReturns: 0,
        conversionRate: '0.0%',
        revenueGrowth: '0.0%',
        ordersGrowth: '0.0%',
        patronsGrowth: '0.0%',
        aovGrowth: '0.0%',
      },
      revenueCurve: [
        { day: 'Mon', revenue: 0 },
        { day: 'Tue', revenue: 0 },
        { day: 'Wed', revenue: 0 },
        { day: 'Thu', revenue: 0 },
        { day: 'Fri', revenue: 0 },
        { day: 'Sat', revenue: 0 },
        { day: 'Sun', revenue: 0 },
      ],
      lowStock: [],
      recentOrders: [],
      categoryPerformance: {
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
        items: [],
      },
    };
  }
}
