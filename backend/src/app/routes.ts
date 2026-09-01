import { Router } from 'express';

import { authRouter } from '../modules/auth/index.js';
import { userRouter } from '../modules/users/index.js';
import { addressRouter } from '../modules/addresses/index.js';
import { categoryRouter } from '../modules/categories/index.js';
import { productRouter } from '../modules/products/index.js';
import { inventoryRouter } from '../modules/inventory/index.js';
import { cartRouter } from '../modules/cart/index.js';
import { wishlistRouter } from '../modules/wishlist/index.js';
import { couponRouter } from '../modules/coupons/index.js';
import { checkoutRouter } from '../modules/checkout/index.js';
import { orderRouter } from '../modules/orders/index.js';
import { paymentRouter } from '../modules/payments/index.js';
import { returnRouter } from '../modules/returns/index.js';
import { reviewRouter } from '../modules/reviews/index.js';
import { merchandisingRouter } from '../modules/merchandising/index.js';
import { adminRouter } from '../modules/admin/index.js';
import { uploadRouter } from '../modules/upload/upload.routes.js';

export const apiRouter = Router();

// Module Sub-Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/account', userRouter);
apiRouter.use('/account/addresses', addressRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/returns', returnRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/merchandising', merchandisingRouter);
apiRouter.use('/upload', uploadRouter);

// Administrative Sub-Routers (RBAC protected)
apiRouter.use('/admin', adminRouter);
apiRouter.use('/admin/inventory', inventoryRouter);
apiRouter.use('/admin/upload', uploadRouter);

// Public settings endpoint — readable by storefront (no auth required)
import { adminController } from '../modules/admin/admin.controller.js';
apiRouter.get('/settings', adminController.getSettings.bind(adminController));
