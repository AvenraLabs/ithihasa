import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { productService } from '../products/product.service.js';
import { categoryService } from '../categories/category.service.js';
import { couponService } from '../coupons/coupon.service.js';
import { auditService } from '../audit/audit.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class AdminController {
  // Dashboard Analytics
  public async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await adminService.getDashboardAnalytics();
      sendSuccess(res, analytics, 200);
    } catch (error) {
      next(error);
    }
  }

  // Orders Management
  public async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getOrders(req.query as any);
      sendSuccess(res, result.orders, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  public async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, reason } = req.body;
      const order = await adminService.updateOrderStatus(
        req.params.id,
        status,
        reason || 'Status updated via atelier administration',
        req.user?.email || 'admin@ithihasa.com',
        req.user?.userId || 'admin'
      );
      sendSuccess(res, order, 200);
    } catch (error) {
      next(error);
    }
  }

  // Inventory & Stock
  public async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await adminService.getInventory(req.query as any);
      sendSuccess(res, products, 200);
    } catch (error) {
      next(error);
    }
  }

  public async adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { variantId, delta, reason } = req.body;
      const movement = await adminService.adjustInventoryStock(
        variantId,
        delta,
        reason || 'ADMIN_STOCK_ADJUSTMENT',
        req.user?.email || 'admin@ithihasa.com'
      );
      sendSuccess(res, movement, 200);
    } catch (error) {
      next(error);
    }
  }

  // Customer Insights & CRM
  public async getCustomerInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await adminService.getCustomerInsights();
      sendSuccess(res, insights, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await adminService.getCustomersList(req.query as any);
      sendSuccess(res, customers, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerDossier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dossier = await adminService.getCustomerDossier(req.params.id);
      sendSuccess(res, dossier, 200);
    } catch (error) {
      next(error);
    }
  }

  // Marketing & Campaigns
  public async getMarketingStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getMarketingStats();
      sendSuccess(res, stats, 200);
    } catch (error) {
      next(error);
    }
  }

  // Settings & Team
  public async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = adminService.getSettings();
      sendSuccess(res, settings, 200);
    } catch (error) {
      next(error);
    }
  }

  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = adminService.updateSettings(req.body);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getTeamMembers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = adminService.getTeamMembers();
      sendSuccess(res, members, 200);
    } catch (error) {
      next(error);
    }
  }

  public async inviteTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = adminService.inviteTeamMember(req.body);
      sendSuccess(res, member, 201);
    } catch (error) {
      next(error);
    }
  }

  public async removeTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = adminService.removeTeamMember(req.params.id);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Support & Concierge Chat
  public async getSupportMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = adminService.getSupportMetrics();
      sendSuccess(res, metrics, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getSupportTickets(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tickets = adminService.getSupportTickets();
      sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  public async createSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = adminService.createSupportTicket(req.body);
      sendSuccess(res, ticket, 201);
    } catch (error) {
      next(error);
    }
  }

  public async replySupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = adminService.replySupportTicket(
        req.params.id,
        req.body.message,
        req.user?.email || 'Atelier Concierge'
      );
      sendSuccess(res, ticket, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getChatSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = adminService.getChatSessions();
      sendSuccess(res, sessions, 200);
    } catch (error) {
      next(error);
    }
  }

  public async sendChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = adminService.sendChatMessage(
        req.params.sessionId,
        req.body.text,
        req.body.sender || 'concierge'
      );
      sendSuccess(res, session, 200);
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  public async getNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = adminService.getNotifications();
      sendSuccess(res, notifications, 200);
    } catch (error) {
      next(error);
    }
  }

  public async markNotificationsRead(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = adminService.markNotificationsRead();
      sendSuccess(res, notifications, 200);
    } catch (error) {
      next(error);
    }
  }

  // Returns & Refunds
  public async getReturns(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returns = await adminService.getReturns();
      sendSuccess(res, returns, 200);
    } catch (error) {
      next(error);
    }
  }

  public async issueRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refund = await adminService.issueRefund(
        req.params.orderId,
        req.body,
        req.user?.email || 'admin@ithihasa.com',
        req.user?.userId || 'admin'
      );
      sendSuccess(res, refund, 201);
    } catch (error) {
      next(error);
    }
  }

  // Product Catalog CRUD
  public async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body, req.user?.userId || 'admin');
      sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories(true);
      sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  }

  public async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      sendSuccess(res, category, 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      sendSuccess(res, category, 200);
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await Category.findByPk(req.params.id);
      if (category) await category.destroy();
      sendSuccess(res, { success: true, message: 'Category deleted' }, 200);
    } catch (error) {
      next(error);
    }
  }

  public async listCoupons(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await couponService.getCoupons(true);
      sendSuccess(res, coupons, 200);
    } catch (error) {
      next(error);
    }
  }

  public async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.createCoupon(req.body);
      sendSuccess(res, coupon, 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      sendSuccess(res, coupon, 200);
    } catch (error) {
      next(error);
    }
  }

  public async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.deleteProduct(req.params.id);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const logs = await auditService.getLogs(limit);
      sendSuccess(res, logs, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
