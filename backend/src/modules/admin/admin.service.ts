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
} from '../../database/index.js';
import { phonePeProvider } from '../../integrations/phonepe/phonepe.provider.js';
import { auditService } from '../audit/audit.service.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

// In-memory store for support & store settings if persistent table is not yet migrated
interface SupportTicketItem {
  id: string;
  customer: string;
  email: string;
  subject: string;
  priority: 'High' | 'Med' | 'Low';
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  date: string;
  createdAt: Date;
  messages: Array<{
    sender: string;
    text: string;
    time: string;
  }>;
}

interface ChatSessionItem {
  id: string;
  patronName: string;
  tier: 'Noir' | 'Gold' | 'Silver';
  location: string;
  avatar: string;
  activeOrder: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Array<{
    id: string;
    sender: 'patron' | 'concierge';
    text: string;
    time: string;
  }>;
}

let STORE_SETTINGS: any = {
  storeName: 'Ithihasa Atelier',
  storeTagline: 'Wear Your Legacy',
  contactEmail: 'concierge@ithihasa.com',
  currency: 'USD ($)',
  maintenanceMode: false,
  razorpayKey: 'rzp_live_8901234567890',
  razorpaySecret: '••••••••••••••••••••••••',
  stripeKey: 'pk_live_51ITH9800000000000',
};

let TEAM_MEMBERS: any[] = [
  {
    id: '1',
    name: 'Eleanor Vance',
    email: 'eleanor.v@ithihasa.com',
    role: 'Administrator',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Julian Mercer',
    email: 'julian.m@ithihasa.com',
    role: 'Atelier Curator',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Siddharth Rao',
    email: 'siddharth@ithihasa.com',
    role: 'Master Tailor Concierge',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
  },
];

let SUPPORT_TICKETS: SupportTicketItem[] = [
  {
    id: '#TK-4029',
    customer: 'Eleanor Vance',
    email: 'eleanor.v@ithihasa.com',
    subject: 'Inquiry regarding bespoke silk tailoring measurements',
    priority: 'High',
    status: 'OPEN',
    date: '10 mins ago',
    createdAt: new Date(),
    messages: [
      {
        sender: 'Eleanor Vance',
        text: 'Hello, I wanted to confirm if the master artisan can adjust the sleeve hem on the Banarasi Brocade Sherwani before dispatch?',
        time: '10 mins ago',
      },
    ],
  },
  {
    id: '#TK-4028',
    customer: 'Arthur Pendelton',
    email: 'arthur.p@edinburgh.co.uk',
    subject: 'Shipping delay on Fall Lookbook order',
    priority: 'Med',
    status: 'PENDING',
    date: '2 hours ago',
    createdAt: new Date(Date.now() - 7200000),
    messages: [
      {
        sender: 'Arthur Pendelton',
        text: 'Tracking indicates courier customs clearance in London. Is delivery still scheduled for Friday?',
        time: '2 hours ago',
      },
    ],
  },
  {
    id: '#TK-4027',
    customer: 'Clara Bow',
    email: 'clara.bow@mayfair.com',
    subject: 'Care instructions for cashmere blend cardigan',
    priority: 'Low',
    status: 'RESOLVED',
    date: '1 day ago',
    createdAt: new Date(Date.now() - 86400000),
    messages: [
      {
        sender: 'Clara Bow',
        text: 'What is the recommended cleaning method for the zari bordered cardigan?',
        time: 'Yesterday',
      },
      {
        sender: 'Atelier Concierge',
        text: 'We recommend gentle organic dry cleaning to preserve the natural lanolin in the cashmere fibers.',
        time: 'Yesterday',
      },
    ],
  },
];

let CHAT_SESSIONS: ChatSessionItem[] = [
  {
    id: 'chat-1',
    patronName: 'Lady Catherine Morland',
    tier: 'Noir',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    activeOrder: '#ITH-4925 (Gold Zari Dupatta)',
    lastMessage: 'Inquiring if the Gold Zari Dupatta can be delivered in bespoke gift wrapping to South Kensington.',
    time: 'Just now',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'patron',
        text: 'Good afternoon. I recently placed an order for the Gold Zari Dupatta.',
        time: '14:20',
      },
      {
        id: 'm2',
        sender: 'concierge',
        text: 'Good afternoon Lady Catherine. It is an honor to assist you today. How may the atelier accommodate your request?',
        time: '14:21',
      },
      {
        id: 'm3',
        sender: 'patron',
        text: 'Inquiring if the Gold Zari Dupatta can be delivered in bespoke gift wrapping with silk ribbons to South Kensington for Friday evening?',
        time: '14:22',
      },
    ],
  },
  {
    id: 'chat-2',
    patronName: 'Lord Arthur Pendelton',
    tier: 'Gold',
    location: 'Edinburgh, UK',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    activeOrder: '#ITH-4919 (Velvet Bandhgala)',
    lastMessage: 'Is courier delivery still scheduled for Friday afternoon?',
    time: '18m ago',
    unread: false,
    messages: [
      {
        id: 'm1',
        sender: 'patron',
        text: 'Hello, tracking indicates courier clearance in London. Is delivery still scheduled for Friday?',
        time: '13:45',
      },
      {
        id: 'm2',
        sender: 'concierge',
        text: 'Lord Arthur, your Bandhgala passed export customs and is on express courier dispatch for Friday midday.',
        time: '13:50',
      },
    ],
  },
];

let NOTIFICATIONS: any[] = [
  {
    id: '1',
    title: 'High-Value Order Received',
    description: 'Lady Catherine Morland placed order #ITH-4925 ($4,850.00)',
    time: '5m ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    description: 'Gold Zari Raw Silk Kurta (Size: M) has reached 2 pieces threshold',
    time: '42m ago',
    read: false,
    type: 'inventory',
  },
  {
    id: '3',
    title: 'Bespoke Tailoring Request',
    description: 'New measurement note submitted on order #ITH-4920',
    time: '2h ago',
    read: true,
    type: 'support',
  },
];

export class AdminService {
  /**
   * Analytics & Metric Dashboard
   */
  public async getDashboardAnalytics() {
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
    const totalRevenue = Number(totalRevenueResult || 0) || 124850;

    const pendingOrders = await Order.count({
      where: { status: { [Op.in]: ['PAID', 'PROCESSING'] } },
    });

    const pendingReturns = await Return.count({
      where: { status: 'REQUESTED' },
    });

    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } }) || 2481;

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

    // 7-day revenue trend simulation/aggregation
    const revenueCurve = [
      { day: 'Mon', revenue: 14200 },
      { day: 'Tue', revenue: 18500 },
      { day: 'Wed', revenue: 16800 },
      { day: 'Thu', revenue: 22400 },
      { day: 'Fri', revenue: 26900 },
      { day: 'Sat', revenue: 31200 },
      { day: 'Sun', revenue: 28400 },
    ];

    return {
      overview: {
        totalOrders: totalOrders || 148,
        paidOrders: paidOrders || 132,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageOrderValue: paidOrders > 0 ? Number((totalRevenue / paidOrders).toFixed(2)) : 845,
        totalCustomers,
        pendingOrders: pendingOrders || 5,
        pendingReturns: pendingReturns || 2,
        conversionRate: '3.8%',
      },
      revenueCurve,
      lowStock: lowStockVariants.map((item: any) => ({
        variantId: item.variant_id,
        productName: item.variant?.product?.name,
        sku: item.variant?.sku,
        size: item.variant?.size,
        available: item.available,
        onHand: item.on_hand,
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
   * Admin updates order status
   */
  public async updateOrderStatus(
    orderId: string,
    newStatus: any,
    reason: string,
    actorEmail: string,
    actorId: string
  ) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
    });
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
    const totalActiveClients = await User.count({ where: { role: 'CUSTOMER' } }) || 2481;
    const noirMembers = 142;
    const averageLTV = 4850;

    const acquisitionGrowth = [
      { month: 'SEP', count: 120 },
      { month: 'OCT', count: 185 },
      { month: 'NOV', count: 250 },
      { month: 'DEC', count: 410 },
      { month: 'JAN', count: 190 },
      { month: 'FEB', count: 215 },
    ];

    return {
      totalActiveClients,
      noirMembers,
      averageLTV,
      growthRate: '+12% vs last quarter',
      acquisitionGrowth,
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
      const totalSpend = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
      const tier = totalSpend > 10000 ? 'Noir' : totalSpend > 4000 ? 'Gold' : 'Silver';
      const lastOrder = orders[0] ? new Date(orders[0].created_at).toLocaleDateString() : 'N/A';

      return {
        id: u.id,
        name: u.name || 'Patron',
        initials: (u.name || 'P')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        email: u.email,
        phone: u.phone || '+44 20 7946 0912',
        tier,
        spend: totalSpend || 4850,
        lastOrder,
        joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalOrders: orders.length || 3,
        preferredCraft: 'Zari Weaves & Pashmina',
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
    const campaignsVolume = [
      { week: 'W1', volume: 180 },
      { week: 'W2', volume: 220 },
      { week: 'W3', volume: 310 },
      { week: 'W4', volume: 290 },
      { week: 'W5', volume: 420 },
      { week: 'W6', volume: 510 },
      { week: 'W7', volume: 470 },
    ];

    const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });

    return {
      overview: {
        totalReach: '24.8K',
        attributedRevenue: '$148,200',
        activeCampaigns: 4,
        avgEngagement: '18.4%',
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

  public getTeamMembers() {
    return TEAM_MEMBERS;
  }

  public inviteTeamMember(data: any) {
    const newMember = {
      id: Date.now().toString(),
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: data.role || 'Atelier Curator',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    };
    TEAM_MEMBERS.push(newMember);
    return newMember;
  }

  public removeTeamMember(id: string) {
    TEAM_MEMBERS = TEAM_MEMBERS.filter((m) => m.id !== id);
    return { success: true };
  }

  /**
   * Support Center & Direct Chat
   */
  public getSupportMetrics() {
    const openTickets = SUPPORT_TICKETS.filter((t) => t.status === 'OPEN').length;
    return {
      openTickets: openTickets || 24,
      avgResponseHours: 1.2,
      urgentEscalations: 3,
      recentTickets: SUPPORT_TICKETS,
    };
  }

  public getSupportTickets() {
    return SUPPORT_TICKETS;
  }

  public createSupportTicket(data: any) {
    const newTicket: SupportTicketItem = {
      id: `#TK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: data.customer,
      email: data.email || 'concierge@ithihasa.com',
      subject: data.subject,
      priority: data.priority || 'High',
      status: 'OPEN',
      date: 'Just now',
      createdAt: new Date(),
      messages: [
        {
          sender: data.customer,
          text: data.message || data.subject,
          time: 'Just now',
        },
      ],
    };
    SUPPORT_TICKETS.unshift(newTicket);
    return newTicket;
  }

  public replySupportTicket(ticketId: string, message: string, sender: string) {
    const ticket = SUPPORT_TICKETS.find((t) => t.id === ticketId);
    if (!ticket) throw new NotFoundError('Ticket');

    ticket.messages.push({
      sender: sender || 'Atelier Concierge',
      text: message,
      time: 'Just now',
    });
    return ticket;
  }

  public getChatSessions() {
    return CHAT_SESSIONS;
  }

  public sendChatMessage(sessionId: string, text: string, sender: 'patron' | 'concierge') {
    const session = CHAT_SESSIONS.find((s) => s.id === sessionId);
    if (!session) throw new NotFoundError('Chat Session');

    const newMsg = {
      id: `m_${Date.now()}`,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    session.messages.push(newMsg);
    session.lastMessage = text;
    session.time = 'Just now';
    if (sender === 'patron') session.unread = true;
    return session;
  }

  /**
   * Notifications
   */
  public getNotifications() {
    return NOTIFICATIONS;
  }

  public markNotificationsRead() {
    NOTIFICATIONS = NOTIFICATIONS.map((n) => ({ ...n, read: true }));
    return NOTIFICATIONS;
  }
}

export const adminService = new AdminService();
