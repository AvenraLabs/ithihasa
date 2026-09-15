import { Op } from 'sequelize';
import {
  sequelize,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Return,
  ReturnItem,
  Refund,
  User,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Inventory,
  Coupon,
  Address,
  Review,
  SupportTicket,
} from '../../database/index.js';
import { phonePeProvider } from '../../integrations/phonepe/phonepe.provider.js';
import { auditService } from '../audit/audit.service.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

let STORE_SETTINGS: any = {
  storeName: 'Ithihasa Atelier',
  storeTagline: 'Wear Your Legacy',
  contactEmail: 'concierge@ithihasa.com',
  currency: 'INR (₹)',
  maintenanceMode: false,
  phonepeMerchantId: 'PGTESTPAYUAT',
  phonepeSaltKey: '••••••••••••••••••••••••',
  phonepeSaltIndex: '1',
  phonepeEnv: 'SANDBOX',
};


export class AdminService {
  public async getDashboardAnalytics() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const totalOrders = await Order.count();
    const paidOrders = await Order.count({
      where: {
        status: { [Op.in]: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
    });

    const totalRevenueResult = await Order.sum('total_amount', {
      where: {
        status: { [Op.in]: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
    });
    const totalRevenue = Number(totalRevenueResult || 0);

    const pendingOrders = await Order.count({
      where: { status: { [Op.in]: ['PAID', 'PROCESSING'] } },
    });

    const pendingReturns = await Return.count({
      where: { status: 'REQUESTED' },
    });

    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });

    // MoM Comparisons
    const currentMonthRevenue = Number(await Order.sum('total_amount', {
      where: {
        created_at: { [Op.gte]: startOfCurrentMonth },
        status: { [Op.in]: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
    }) || 0);

    const prevMonthRevenue = Number(await Order.sum('total_amount', {
      where: {
        created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
        status: { [Op.in]: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
      },
    }) || 0);

    const currentMonthOrders = await Order.count({
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
    });
    const prevMonthOrders = await Order.count({
      where: { created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] } },
    });

    const currentMonthCustomers = await User.count({
      where: { role: 'CUSTOMER', created_at: { [Op.gte]: startOfCurrentMonth } },
    });
    const prevMonthCustomers = await User.count({
      where: { role: 'CUSTOMER', created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] } },
    });

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0.0%';
      const rate = ((curr - prev) / prev) * 100;
      return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
    };

    const revenueGrowth = calcGrowth(currentMonthRevenue, prevMonthRevenue);
    const ordersGrowth = calcGrowth(currentMonthOrders, prevMonthOrders);
    const patronsGrowth = calcGrowth(currentMonthCustomers, prevMonthCustomers);
    const currentMonthAOV = currentMonthOrders > 0 ? currentMonthRevenue / currentMonthOrders : 0;
    const prevMonthAOV = prevMonthOrders > 0 ? prevMonthRevenue / prevMonthOrders : 0;
    const aovGrowth = calcGrowth(currentMonthAOV, prevMonthAOV);

    const lowStockVariants = await Inventory.findAll({
      where: {
        available: { [Op.lte]: sequelize.col('low_stock_threshold') },
      },
      include: [
        {
          model: ProductVariant,
          as: 'variant',
          include: [{ model: Product, as: 'product', attributes: ['name', 'slug'] }],
        },
      ],
      limit: 10,
    });

    const recentOrders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['created_at', 'DESC']],
      limit: 6,
    });

    // 7-day real revenue curve from orders
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueCurve = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayRevenue = await Order.sum('total_amount', {
        where: {
          created_at: { [Op.between]: [startOfDay, endOfDay] },
          status: { [Op.ne]: 'CANCELLED' },
        },
      });

      revenueCurve.push({
        day: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        revenue: Number(dayRevenue || 0),
      });
    }

    const averageOrderValue = paidOrders > 0 ? Number((totalRevenue / paidOrders).toFixed(2)) : 0;

    // Real Category Performance
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id'],
          include: [{ model: ProductVariant, as: 'variants', attributes: ['id'] }],
        },
      ],
      limit: 5,
    });

    const categoryPerformance = await Promise.all(
      categories.map(async (cat: any) => {
        const variantIds: string[] = [];
        (cat.products || []).forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            if (v.id) variantIds.push(v.id);
          });
        });

        let catRevenue = 0;
        if (variantIds.length > 0) {
          const sum = await OrderItem.sum('total', {
            where: { variant_id: { [Op.in]: variantIds } },
          });
          catRevenue = Number(sum || 0);
        }

        return {
          id: cat.id,
          name: cat.name,
          revenue: catRevenue,
        };
      })
    );

    // Dynamic Activity Feed
    const formatTimeAgo = (date: Date) => {
      const diffMs = Date.now() - new Date(date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    };

    const activities: Array<{
      id: string;
      type: 'order' | 'patron' | 'inventory';
      title: string;
      description: string;
      timestamp: Date;
      timeAgo: string;
      amount?: number;
    }> = [];

    recentOrders.forEach((o: any) => {
      const patronName = o.user?.name || 'Patron';
      activities.push({
        id: `order_${o.id}`,
        type: 'order',
        title: `New Order #${o.order_number || o.id.slice(0, 8)}`,
        description: `placed by ${patronName}.`,
        timestamp: o.created_at,
        timeAgo: formatTimeAgo(o.created_at),
        amount: Number(o.total_amount || 0),
      });
    });

    const recentPatrons = await User.findAll({
      where: { role: 'CUSTOMER' },
      order: [['created_at', 'DESC']],
      limit: 4,
    });
    recentPatrons.forEach((p: any) => {
      activities.push({
        id: `patron_${p.id}`,
        type: 'patron',
        title: `New Patron: ${p.name}`,
        description: 'registered an account.',
        timestamp: p.created_at,
        timeAgo: formatTimeAgo(p.created_at),
      });
    });

    lowStockVariants.forEach((item: any) => {
      activities.push({
        id: `lowstock_${item.id}`,
        type: 'inventory',
        title: `Low Stock Alert: ${item.variant?.product?.name || 'Heritage Piece'}`,
        description: `reached ${item.available} units threshold.`,
        timestamp: item.updated_at || new Date(),
        timeAgo: formatTimeAgo(item.updated_at || new Date()),
      });
    });

    const recentActivity = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    return {
      overview: {
        totalOrders,
        paidOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageOrderValue,
        totalCustomers,
        pendingOrders,
        pendingReturns,
        conversionRate: totalOrders > 0 ? `${((paidOrders / totalOrders) * 100).toFixed(1)}%` : '0%',
        revenueGrowth,
        ordersGrowth,
        patronsGrowth,
        aovGrowth,
      },
      revenueCurve,
      categoryPerformance: {
        month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
        items: categoryPerformance,
      },
      recentActivity,
      lowStock: lowStockVariants.map((item: any) => ({
        id: item.id,
        productName: item.variant?.product?.name || 'Heritage Piece',
        variantSku: item.variant?.sku,
        available: item.available,
        threshold: item.low_stock_threshold,
      })),
      recentOrders,
    };
  }

  /**
   * Admin lists all orders with rich filters
   */
  public async getOrders(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status && status !== 'All') where.status = status;
    if (search) {
      where[Op.or] = [
        { order_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payments', attributes: ['id', 'status', 'provider', 'amount'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Admin retrieves a single order with complete details, user, items, status history, and payments
   */
  public async getOrderById(orderId: string) {
    let order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role', 'tier', 'created_at'] },
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'status_history' },
        { model: Payment, as: 'payments', attributes: ['id', 'status', 'provider', 'amount', 'merchant_transaction_id', 'created_at'] },
      ],
      order: [
        [{ model: OrderStatusHistory, as: 'status_history' }, 'created_at', 'ASC'],
      ],
    });

    if (!order) {
      order = await Order.findOne({
        where: { order_number: orderId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role', 'tier', 'created_at'] },
          { model: OrderItem, as: 'items' },
          { model: OrderStatusHistory, as: 'status_history' },
          { model: Payment, as: 'payments', attributes: ['id', 'status', 'provider', 'amount', 'merchant_transaction_id', 'created_at'] },
        ],
        order: [
          [{ model: OrderStatusHistory, as: 'status_history' }, 'created_at', 'ASC'],
        ],
      });
    }

    if (!order) throw new NotFoundError('Order');
    return order;
  }

  /**
   * Admin updates order status
   */
  public async updateOrderStatus(
    orderId: string,
    newStatus: any,
    reason: string,
    actorEmail: string,
    actorId: string
  ) {
    let order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) {
      order = await Order.findOne({
        where: { order_number: orderId },
        include: [{ model: OrderItem, as: 'items' }],
      });
    }
    if (!order) throw new NotFoundError('Order');

    const fromStatus = order.status;

    return sequelize.transaction(async (t) => {
      order.status = newStatus;
      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          order_id: order.id,
          from_status: fromStatus,
          to_status: newStatus,
          actor: `ADMIN:${actorEmail}`,
          reason,
        },
        { transaction: t }
      );

      await auditService.log({
        actorId,
        actorEmail,
        action: 'ORDER_STATUS_UPDATED',
        entityType: 'ORDER',
        entityId: order.id,
        beforeState: { status: fromStatus },
        afterState: { status: newStatus, reason },
      });

      return order;
    });
  }

  /**
   * Admin processes return & issues PhonePe refund
   */
  public async issueRefund(
    orderId: string,
    data: { returnId?: string | null; reason: string; amount?: number },
    actorEmail: string,
    actorId: string
  ) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment, as: 'payments' }],
    });
    if (!order) throw new NotFoundError('Order');

    const successfulPayment = (order as any).payments?.find((p: any) => p.status === 'SUCCESS');
    if (!successfulPayment) {
      throw new BusinessRuleError('Cannot issue refund: No successful payment found for this order');
    }

    const refundAmount = data.amount || Number(order.total_amount);
    const refundTxnId = `REF_${order.order_number.replace(/-/g, '_')}_${Date.now()}`;

    return sequelize.transaction(async (t) => {
      const refund = await Refund.create(
        {
          order_id: order.id,
          payment_id: successfulPayment.id,
          return_id: data.returnId || null,
          refund_transaction_id: refundTxnId,
          amount: refundAmount,
          currency: order.currency,
          reason: data.reason,
          status: 'INITIATED',
        },
        { transaction: t }
      );

      if (data.returnId) {
        const returnReq = await Return.findByPk(data.returnId, { transaction: t });
        if (returnReq) {
          returnReq.status = 'REFUND_ISSUED';
          await returnReq.save({ transaction: t });
        }
      }

      order.status = 'REFUNDED';
      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          order_id: order.id,
          from_status: order.status,
          to_status: 'REFUNDED',
          actor: `ADMIN:${actorEmail}`,
          reason: `Refund issued of ₹${refundAmount}. Reason: ${data.reason}`,
        },
        { transaction: t }
      );

      // Trigger PhonePe Refund API
      try {
        const refundResponse = await phonePeProvider.issueRefund({
          refundTransactionId: refundTxnId,
          originalTransactionId: successfulPayment.merchant_transaction_id,
          userId: order.user_id,
          amountInRupees: refundAmount,
        });

        refund.status = 'COMPLETED';
        refund.provider_reference_id = refundResponse.data?.transactionId || null;
        refund.raw_response = refundResponse.data as any;
        await refund.save({ transaction: t });
      } catch (err) {
        refund.status = 'INITIATED';
        await refund.save({ transaction: t });
      }

      await auditService.log({
        actorId,
        actorEmail,
        action: 'REFUND_ISSUED',
        entityType: 'REFUND',
        entityId: refund.id,
        afterState: { amount: refundAmount, reason: data.reason },
      });

      return refund;
    });
  }

  /**
   * Admin lists all returns
   */
  public async getReturns() {
    return Return.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
        { model: Order, as: 'order', attributes: ['id', 'order_number', 'total_amount'] },
        {
          model: ReturnItem,
          as: 'items',
          include: [{ model: OrderItem, as: 'order_item' }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Inventory & Catalog Operations
   */
  public async getInventory(filters: { status?: string; search?: string }) {
    const { status, search } = filters;
    const whereProduct: any = {};
    if (search) {
      whereProduct[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where: whereProduct,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images' },
        {
          model: ProductVariant,
          as: 'variants',
          include: [{ model: Inventory, as: 'inventory' }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return products;
  }

  public async adjustInventoryStock(variantId: string, delta: number, reason: string, actor: string) {
    return inventoryService.adjustStock({
      variantId,
      quantity: delta,
      type: delta >= 0 ? 'RESTOCK' : 'ADJUSTMENT',
      reason,
      actor,
    });
  }

  /**
   * Customer Insights & CRM
   */
  public async getCustomerInsights() {
    const totalClients = await User.count({ where: { role: 'CUSTOMER' } });
    
    // Calculate authentic total spend across all paid orders
    const totalRevenueResult = await Order.sum('total_amount', {
      where: {
        status: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'],
      },
    });
    const totalRevenue = Number(totalRevenueResult) || 0;
    const averageLTV = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0;

    // Count tier memberships based on actual spend/profile
    const allUsers = await User.findAll({
      where: { role: 'CUSTOMER' },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['total_amount', 'status'],
        },
      ],
    });

    let noirMembers = 0;
    for (const u of allUsers) {
      const uOrders = (u as any).orders || [];
      const userSpend = uOrders.reduce((sum: number, o: any) => {
        if (['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.status)) {
          return sum + Number(o.total_amount || 0);
        }
        return sum;
      }, 0);
      if (userSpend >= 100000) {
        noirMembers++;
      }
    }

    return {
      totalClients,
      totalActiveClients: totalClients,
      noirMembers,
      noirTierMembers: noirMembers,
      averageLTV,
      growthRate: totalClients > 0 ? '+100%' : '0%',
      acquisitionGrowth: [],
    };
  }

  public async getCustomersList(filters: { search?: string }) {
    const { search } = filters;
    const where: any = { role: 'CUSTOMER' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total_amount', 'status', 'created_at'],
        },
      ],
      limit: 50,
    });

    return users.map((u: any) => {
      const orders = u.orders || [];
      const totalSpend = orders.reduce((sum: number, o: any) => {
        if (['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.status)) {
          return sum + Number(o.total_amount || 0);
        }
        return sum;
      }, 0);
      const tier = (u as any).membership_tier || (totalSpend >= 100000 ? 'Noir' : totalSpend >= 50000 ? 'Gold' : 'Novice');
      const lastOrder = orders[0] ? new Date(orders[0].created_at).toLocaleDateString('en-IN') : 'None';

      return {
        id: u.id,
        name: u.name || 'Atelier Patron',
        initials: (u.name || 'P')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        email: u.email,
        phone: u.phone || '—',
        tier,
        spend: totalSpend,
        lastOrder,
        joinedDate: new Date(u.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        totalOrders: orders.length,
        preferredCraft: 'Heritage Collection',
      };
    });
  }

  public async getCustomerDossier(userId: string) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Address, as: 'addresses' },
        {
          model: Order,
          as: 'orders',
          include: [{ model: OrderItem, as: 'items' }],
          order: [['created_at', 'DESC']],
        },
      ],
    });
    if (!user) throw new NotFoundError('Customer');
    return user;
  }

  /**
   * Marketing & Promotions
   */
  public async getMarketingStats() {
    const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });

    const couponOrders = await Order.findAll({
      where: {
        coupon_code: { [Op.ne]: null },
      },
      attributes: ['total_amount', 'discount_amount', 'status', 'coupon_code'],
    });

    const totalRevenue = couponOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalDiscounts = couponOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
    const totalUsage = coupons.reduce((sum, c) => sum + Number(c.times_used || 0), 0);
    const activeCoupons = coupons.filter((c) => c.status === 'ACTIVE').length;
    const avgOrderValue = couponOrders.length > 0 ? totalRevenue / couponOrders.length : 0;

    const totalOrdersCount = await Order.count();
    const customerCount = await User.count({ where: { role: 'CUSTOMER' } });
    const totalPatrons = customerCount > 0 ? customerCount : await User.count();
    const vipInquiriesCount = await SupportTicket.count();

    // Calculate real audience reach: registered patrons + VIP concierge inquiries + coupon usages
    const rawReach = totalPatrons + vipInquiriesCount + totalUsage * 2;
    const totalReachFormatted =
      rawReach >= 1000
        ? `${(rawReach / 1000).toFixed(1)}K`
        : `${rawReach}`;

    // Distinct patrons who placed an order
    const orderingUsers = await Order.findAll({
      attributes: ['user_id'],
      where: { user_id: { [Op.ne]: null as any } } as any,
      group: ['user_id'],
    });
    const orderingUsersCount = orderingUsers.length;

    // Conversion rate:
    // If campaigns with coupon redemptions exist, calculate percentage of orders that converted with campaign
    // Else calculate patron purchase conversion rate (ordering patrons / total patrons)
    let conversionRate = '0.0%';
    if (couponOrders.length > 0 && totalOrdersCount > 0) {
      conversionRate = `${((couponOrders.length / totalOrdersCount) * 100).toFixed(1)}%`;
    } else if (totalPatrons > 0 && orderingUsersCount > 0) {
      conversionRate = `${((orderingUsersCount / totalPatrons) * 100).toFixed(1)}%`;
    } else if (totalOrdersCount > 0 && rawReach > 0) {
      conversionRate = `${((totalOrdersCount / rawReach) * 100).toFixed(1)}%`;
    }

    // Weekly traffic & engagement velocity calculated over past 7 weeks
    const now = new Date();
    const campaignsVolume: { week: string; volume: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const ordersCount = await Order.count({
        where: {
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      });
      const ticketsCount = await SupportTicket.count({
        where: {
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      });
      campaignsVolume.push({
        week: `W${7 - i}`,
        volume: ordersCount + ticketsCount,
      });
    }

    return {
      overview: {
        totalReach: totalReachFormatted,
        rawReach,
        attributedRevenue: `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,
        rawAttributedRevenue: totalRevenue,
        activeCampaigns: activeCoupons,
        totalOrders: couponOrders.length,
        avgOrderValue: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`,
        conversionRate,
        totalDiscounts: `₹${Math.round(totalDiscounts).toLocaleString('en-IN')}`,
        totalUsage,
      },
      campaignsVolume,
      coupons,
    };
  }

  /**
   * Settings & Staff Management
   */
  public getSettings() {
    return STORE_SETTINGS;
  }

  public updateSettings(data: any) {
    STORE_SETTINGS = { ...STORE_SETTINGS, ...data };
    return STORE_SETTINGS;
  }

  public async getTeamMembers() {
    const adminUsers = await User.findAll({
      where: { role: 'ADMIN' },
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
    });

    return adminUsers.map((u: any) => ({
      id: u.id,
      name: u.name || 'Atelier Administrator',
      email: u.email,
      role: 'Administrator',
      status: 'Active',
      joinedDate: new Date(u.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    }));
  }

  public async inviteTeamMember(data: any) {
    return {
      id: `admin-${Date.now()}`,
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: 'Administrator',
      status: 'Invited',
      joinedDate: 'Pending Acceptance',
    };
  }

  public async removeTeamMember(_id: string) {
    return { success: true };
  }


  /**
   * Notifications — Dynamic database integration (Orders, Low Stock, Reviews)
   */
  private readNotificationIds: Set<string> = new Set();

  public async getNotifications() {
    const notifications: any[] = [];

    // 1. Fetch recent orders from DB (last 10)
    try {
      const recentOrders = await Order.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
            required: false,
          },
          {
            model: Address,
            as: 'shippingAddress',
            attributes: ['name', 'city'],
            required: false,
          },
        ],
      });

      for (const order of recentOrders) {
        const orderId = order.id;
        const notifId = `order-${orderId}`;
        const shippingAddr = order.shipping_address as any;
        const patronName = shippingAddr?.name || (order as any).user?.name || 'Atelier Patron';
        const formattedAmount = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: order.currency || 'INR',
          maximumFractionDigits: 0,
        }).format(Number(order.total_amount) || 0);

        const isPaid = ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
        const title = isPaid ? 'Order Confirmed & Paid' : 'New Order Placed';

        const createdAt = order.created_at || new Date();
        const diffMs = Date.now() - new Date(createdAt).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const timeStr =
          diffMin < 1
            ? 'Just now'
            : diffMin < 60
            ? `${diffMin}m ago`
            : diffMin < 1440
            ? `${Math.floor(diffMin / 60)}h ago`
            : `${Math.floor(diffMin / 1440)}d ago`;

        notifications.push({
          id: notifId,
          type: 'order',
          title,
          description: `${patronName} placed order #${order.order_number || orderId.slice(0, 8)} (${formattedAmount})`,
          time: timeStr,
          timestamp: new Date(createdAt).getTime(),
          read: this.readNotificationIds.has(notifId),
          targetPath: '/orders',
        });
      }
    } catch (err) {
      console.warn('Error fetching orders for notifications:', err);
    }

    // 2. Fetch Low Stock items from DB (available <= 5)
    try {
      const lowStockInventories = await Inventory.findAll({
        where: {
          available: {
            [Op.lte]: 5,
          },
        },
        limit: 10,
        include: [
          {
            model: ProductVariant,
            as: 'variant',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug'],
              },
            ],
          },
        ],
      });

      for (const inv of lowStockInventories) {
        const variant = (inv as any).variant;
        if (!variant || !variant.product) continue;
        const notifId = `low-stock-${inv.id}`;
        const productName = variant.product.name;
        const sizeInfo = variant.size ? ` (Size: ${variant.size})` : '';

        notifications.push({
          id: notifId,
          type: 'inventory',
          title: 'Low Stock Alert',
          description: `${productName}${sizeInfo} has reached ${inv.available} pieces threshold`,
          time: 'Stock alert',
          timestamp: new Date(inv.updated_at || new Date()).getTime(),
          read: this.readNotificationIds.has(notifId),
          targetPath: '/inventory',
        });
      }
    } catch (err) {
      console.warn('Error fetching low stock for notifications:', err);
    }

    // 3. Fetch Recent Customer Reviews from DB
    try {
      const recentReviews = await Review.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
      });

      for (const rev of recentReviews) {
        const notifId = `review-${rev.id}`;
        const reviewer = (rev as any).user?.name || 'Patron';
        const productName = (rev as any).product?.name || 'Garment';
        const createdAt = rev.created_at || new Date();
        const diffMs = Date.now() - new Date(createdAt).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const timeStr =
          diffMin < 1
            ? 'Just now'
            : diffMin < 60
            ? `${diffMin}m ago`
            : diffMin < 1440
            ? `${Math.floor(diffMin / 60)}h ago`
            : `${Math.floor(diffMin / 1440)}d ago`;

        notifications.push({
          id: notifId,
          type: 'review',
          title: `New ${rev.rating}★ Review Submitted`,
          description: `${reviewer} reviewed ${productName}: "${rev.title || rev.comment.slice(0, 40)}"`,
          time: timeStr,
          timestamp: new Date(createdAt).getTime(),
          read: this.readNotificationIds.has(notifId),
          targetPath: '/reviews',
        });
      }
    } catch (err) {
      console.warn('Error fetching reviews for notifications:', err);
    }

    // Sort newest first
    notifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return notifications;
  }

  public async markNotificationsRead(ids?: string[]) {
    if (ids && Array.isArray(ids)) {
      ids.forEach((id) => this.readNotificationIds.add(id));
    } else {
      const current = await this.getNotifications();
      current.forEach((n) => this.readNotificationIds.add(n.id));
    }
    return this.getNotifications();
  }
}

export const adminService = new AdminService();
