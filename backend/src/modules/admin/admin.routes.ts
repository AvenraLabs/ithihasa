import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

export const adminRouter = Router();

// Enforce strict authentication and ADMIN role on all admin routes
adminRouter.use(authenticate, requireRole('ADMIN'));

// Analytics & Dashboard
adminRouter.get('/dashboard', adminController.getDashboard);

// Order Management
adminRouter.get('/orders', adminController.getOrders);
adminRouter.patch('/orders/:id/status', adminController.updateOrderStatus);

// Inventory & Stock
adminRouter.get('/inventory', adminController.getInventory);
adminRouter.post('/inventory/adjust', adminController.adjustInventory);

// Customer Insights & CRM
adminRouter.get('/customers/insights', adminController.getCustomerInsights);
adminRouter.get('/customers', adminController.getCustomers);
adminRouter.get('/customers/:id', adminController.getCustomerDossier);

// Marketing & Campaigns
adminRouter.get('/marketing/stats', adminController.getMarketingStats);

// Settings & Staff
adminRouter.get('/settings', adminController.getSettings);
adminRouter.put('/settings', adminController.updateSettings);
adminRouter.get('/team', adminController.getTeamMembers);
adminRouter.post('/team', adminController.inviteTeamMember);
adminRouter.delete('/team/:id', adminController.removeTeamMember);

// Support & Concierge Chat
adminRouter.get('/support/metrics', adminController.getSupportMetrics);
adminRouter.get('/support/tickets', adminController.getSupportTickets);
adminRouter.post('/support/tickets', adminController.createSupportTicket);
adminRouter.post('/support/tickets/:id/reply', adminController.replySupportTicket);
adminRouter.get('/support/chat/sessions', adminController.getChatSessions);
adminRouter.post('/support/chat/:sessionId/messages', adminController.sendChatMessage);

// Notifications
adminRouter.get('/notifications', adminController.getNotifications);
adminRouter.patch('/notifications/mark-read', adminController.markNotificationsRead);

// Returns & Refunds
adminRouter.get('/returns', adminController.getReturns);
adminRouter.post('/orders/:orderId/refund', adminController.issueRefund);

// Product & Category Management
adminRouter.post('/products', adminController.createProduct);
adminRouter.delete('/products/:id', adminController.deleteProduct);
adminRouter.delete('/inventory/:id', adminController.deleteProduct);
adminRouter.get('/categories', adminController.getCategories);
adminRouter.post('/categories', adminController.createCategory);
adminRouter.patch('/categories/:id', adminController.updateCategory);
adminRouter.delete('/categories/:id', adminController.deleteCategory);

// Coupons CRUD
adminRouter.get('/coupons', adminController.listCoupons);
adminRouter.post('/coupons', adminController.createCoupon);
adminRouter.patch('/coupons/:id', adminController.updateCoupon);

// Merchandising & Storefront CMS
import { merchandisingController } from '../merchandising/index.js';
adminRouter.get('/merchandising/storefront', merchandisingController.getStorefront);
adminRouter.put('/merchandising/storefront', merchandisingController.updateStorefront);

// Media & Asset Ingestion
import { uploadRouter } from '../upload/upload.routes.js';
adminRouter.use('/upload', uploadRouter);

// Audit Trail
adminRouter.get('/audit', adminController.getAuditLogs);

