import { Router } from 'express';
import { supportController } from './support.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.js';

export const supportRouter = Router();

// Customer Support Endpoints
supportRouter.get('/tickets', optionalAuthenticate, supportController.listCustomerTickets);
supportRouter.post('/tickets', optionalAuthenticate, supportController.createTicket);
supportRouter.get('/tickets/:id', optionalAuthenticate, supportController.getTicket);
supportRouter.post('/tickets/:id/messages', optionalAuthenticate, supportController.sendCustomerMessage);
