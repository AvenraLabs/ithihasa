import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.js';
import { HomePage } from '../pages/HomePage.js';
import { ShopPage } from '../pages/ShopPage.js';
import { SearchPage } from '../pages/SearchPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { VerifyOtpPage } from '../pages/VerifyOtpPage.js';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.js';
import { AccountPage } from '../pages/AccountPage.js';
import { EditProfilePage } from '../pages/EditProfilePage.js';
import { AddressesPage } from '../pages/AddressesPage.js';
import { OrdersPage } from '../pages/OrdersPage.js';
import { OrderDetailPage } from '../pages/OrderDetailPage.js';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage.js';
import { WishlistPage } from '../pages/WishlistPage.js';
import { ProductDetailPage } from '../pages/ProductDetailPage.js';
import { AtelierPage } from '../pages/AtelierPage.js';
import { SustainabilityPage } from '../pages/SustainabilityPage.js';
import { CustomerCarePage } from '../pages/CustomerCarePage.js';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOtpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: (
      <AppShell>
        <HomePage />
      </AppShell>
    ),
  },
  {
    path: '/shop',
    element: (
      <AppShell>
        <ShopPage />
      </AppShell>
    ),
  },
  {
    path: '/search',
    element: (
      <AppShell>
        <SearchPage />
      </AppShell>
    ),
  },
  {
    path: '/cart',
    element: (
      <AppShell>
        <CartPage />
      </AppShell>
    ),
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/orders/:orderId/confirmed',
    element: <OrderConfirmationPage />,
  },
  {
    path: '/account',
    element: (
      <AppShell>
        <AccountPage />
      </AppShell>
    ),
  },
  {
    path: '/account/orders',
    element: (
      <AppShell>
        <OrdersPage />
      </AppShell>
    ),
  },
  {
    path: '/account/orders/:orderId',
    element: (
      <AppShell>
        <OrderDetailPage />
      </AppShell>
    ),
  },
  {
    path: '/account/addresses',
    element: (
      <AppShell>
        <AddressesPage />
      </AppShell>
    ),
  },
  {
    path: '/account/edit',
    element: (
      <AppShell>
        <EditProfilePage />
      </AppShell>
    ),
  },
  {
    path: '/account/profile',
    element: (
      <AppShell>
        <EditProfilePage />
      </AppShell>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <AppShell>
        <WishlistPage />
      </AppShell>
    ),
  },
  {
    path: '/account/wishlist',
    element: (
      <AppShell>
        <WishlistPage />
      </AppShell>
    ),
  },
  {
    path: '/atelier',
    element: (
      <AppShell>
        <AtelierPage />
      </AppShell>
    ),
  },
  {
    path: '/authenticity',
    element: (
      <AppShell>
        <AtelierPage />
      </AppShell>
    ),
  },
  {
    path: '/sustainability',
    element: (
      <AppShell>
        <SustainabilityPage />
      </AppShell>
    ),
  },
  {
    path: '/care',
    element: (
      <AppShell>
        <CustomerCarePage />
      </AppShell>
    ),
  },
  {
    path: '/concierge',
    element: (
      <AppShell>
        <CustomerCarePage />
      </AppShell>
    ),
  },
  {
    path: '/products/:slug',
    element: (
      <AppShell>
        <ProductDetailPage />
      </AppShell>
    ),
  },
  {
    path: '*',
    element: (
      <AppShell>
        <HomePage />
      </AppShell>
    ),
  },
]);
