import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.js';

export const adminRouter = Router();

// Allow optional authentication so development and token-bearing requests work seamlessly
adminRouter.use(optionalAuthenticate);

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
adminRouter.post('/categories', adminController.createCategory);
adminRouter.patch('/categories/:id', adminController.updateCategory);

// Coupons CRUD
adminRouter.get('/coupons', adminController.listCoupons);
adminRouter.post('/coupons', adminController.createCoupon);
adminRouter.patch('/coupons/:id', adminController.updateCoupon);

// Audit Trail
adminRouter.get('/audit', adminController.getAuditLogs);
