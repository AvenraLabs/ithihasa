import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const paymentRouter = Router();

// S2S Webhook from PhonePe (Unauthenticated, validated via X-VERIFY checksum)
paymentRouter.post('/phonepe/webhook', paymentController.handleWebhook);

// Status check for customer order confirmation page
paymentRouter.get('/status/:orderId', authenticate, paymentController.getStatus);
