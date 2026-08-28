# Ithihasa Backend API Reference & Integration Contract

**Base URL**: `http://localhost:5000/api/v1`  
**Protocol**: REST / JSON  
**Header Standards**:
- `Content-Type: application/json`
- `Authorization: Bearer <jwt_access_token>` (for authenticated customer and admin requests)
- `x-session-id: <uuid>` (for guest cart and wishlist interactions prior to login)
- `x-request-id: <uuid>` (automatically returned on all responses for audit/tracing)

---

## 1. Unified Response Envelope

All API endpoints return responses in this consistent structure:

### Success Response:
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 3 items available for Varanasi Raw Silk Kurta (Size: M)",
    "details": { "variantId": "...", "requested": 5, "available": 3 }
  }
}
```

---

## 2. Authentication & Profile (`/auth`, `/account`)

### `POST /auth/google`
Authenticates via Google OAuth 2.0 / Firebase ID token. Returns tokens, user profile, and triggers automatic guest-to-customer cart merge if `guestSessionId` is supplied.
- **Request Body**:
  ```json
  {
    "idToken": "google_id_token_string",
    "guestSessionId": "optional-guest-cart-uuid"
  }
  ```
- **Response `data`**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Aravind S.",
      "role": "CUSTOMER",
      "phone": "9876543210",
      "phoneVerified": true,
      "avatarUrl": "https://..."
    },
    "accessToken": "jwt_token_string",
    "refreshToken": "jwt_refresh_token_string"
  }
  ```

### `POST /auth/refresh`
Refreshes expired access tokens.
- **Request Body**: `{ "refreshToken": "..." }`
- **Response `data`**: `{ "accessToken": "...", "refreshToken": "..." }`

### `POST /auth/phone/send-otp` (Protected)
Sends a 6-digit verification code to the customer's WhatsApp number.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "phone": "9876543210", "purpose": "PHONE_VERIFICATION" }`
- **Response `data`**: `{ "message": "Verification code sent to WhatsApp", "phone": "9876543210", "expiresInMinutes": 5 }`

### `POST /auth/phone/verify-otp` (Protected)
Verifies the WhatsApp code and updates profile to `phone_verified: true`.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "phone": "9876543210", "otp": "123456" }`
- **Response `data`**: `{ "success": true, "message": "Phone number verified and linked successfully" }`

### `GET /account/profile` (Protected)
Retrieves the logged-in customer's profile.

### `PATCH /account/profile` (Protected)
Updates customer name or avatar.
- **Request Body**: `{ "name": "Aravind Sharma", "avatarUrl": "https://..." }`

---

## 3. Delivery Addresses (`/account/addresses`)

### `GET /account/addresses` (Protected)
Lists saved addresses.
- **Response `data`**: Array of address objects (`id`, `recipient_name`, `phone`, `line1`, `line2`, `city`, `state`, `postal_code`, `is_default`).

### `POST /account/addresses` (Protected)
Creates a new delivery address.
- **Request Body**:
  ```json
  {
    "recipientName": "Aravind Sharma",
    "phone": "9876543210",
    "line1": "Flat 402, Royal Palms Residency",
    "line2": "Lavelle Road",
    "landmark": "Near UB City",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "isDefault": true
  }
  ```

### `PATCH /account/addresses/:id` (Protected)
Updates an existing address (IDOR safe).

### `DELETE /account/addresses/:id` (Protected)
Removes an address.

---

## 4. Categories & Catalog (`/categories`, `/products`)

### `GET /categories`
Lists all active categories with hierarchical subcategories and product counts.
- **Response `data`**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Heritage Kurtas",
      "slug": "heritage-kurtas",
      "description": "Handwoven silk and fine cotton kurtas...",
      "imageUrl": "https://...",
      "sortOrder": 1,
      "productCount": 4
    }
  ]
  ```

### `GET /products`
Advanced filtered product catalog listing.
- **Query Parameters**:
  - `categorySlug`: Filter by category (e.g. `heritage-kurtas`)
  - `featured`: `true` | `false`
  - `minPrice`: Number
  - `maxPrice`: Number
  - `size`: (e.g. `S`, `M`, `L`, `38`, `40`)
  - `search`: Search query string
  - `sort`: `price_asc` | `price_desc` | `newest` | `featured`
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
- **Response `data`**: Array of product cards with primary image and active size variants.

### `GET /products/:slug`
Full product detail page payload (PDP).
- **Response `data`**:
  ```json
  {
    "id": "uuid",
    "name": "Varanasi Raw Silk Kurta",
    "slug": "varanasi-raw-silk-kurta",
    "description": "Crafted from pure handloom...",
    "basePrice": 8499.0,
    "compareAtPrice": 10999.0,
    "currency": "INR",
    "category": { "id": "...", "name": "Heritage Kurtas", "slug": "heritage-kurtas" },
    "images": [
      { "id": "...", "url": "https://...", "altText": "Front", "isPrimary": true, "sortOrder": 0 }
    ],
    "variants": [
      { "id": "uuid", "sku": "ITH-VSK-BLK-M", "size": "M", "color": "Midnight Ink", "price": 8499.0, "availableStock": 18 }
    ],
    "reviews": []
  }
  ```

---

## 5. Unified Cart & Quotes (`/cart`)

Works seamlessly for **Guests** (via `x-session-id` header) and **Logged-in Customers** (via `Authorization` token).

### `GET /cart`
Retrieves cart with real-time stock availability and server-calculated quote.
- **Query Parameters**: `coupon` (optional promo code to test quote, e.g. `?coupon=LEGACY10`)
- **Response `data`**:
  ```json
  {
    "id": "cart-uuid",
    "items": [
      {
        "id": "item-uuid",
        "variantId": "variant-uuid",
        "quantity": 1,
        "unitPrice": 8499.0,
        "subtotal": 8499.0,
        "product": { "id": "...", "name": "Varanasi Raw Silk Kurta", "slug": "...", "image": "https://..." },
        "variant": { "sku": "ITH-VSK-BLK-M", "size": "M", "color": "Midnight Ink", "availableStock": 18 }
      }
    ],
    "summary": {
      "subtotal": 8499.0,
      "discountAmount": 849.9,
      "couponCode": "LEGACY10",
      "couponApplied": { "code": "LEGACY10", "description": "10% off", "discount": 849.9 },
      "shippingAmount": 0,
      "taxAmount": 0,
      "totalAmount": 7649.1,
      "currency": "INR"
    }
  }
  ```

### `POST /cart/items`
Adds a product variant to the cart with optimistic validation.
- **Request Body**: `{ "variantId": "variant-uuid", "quantity": 1 }`

### `PATCH /cart/items/:itemId`
Updates quantity.
- **Request Body**: `{ "quantity": 2 }`

### `DELETE /cart/items/:itemId`
Removes an item from the bag.

### `POST /cart/merge` (Protected)
Merges guest session cart items into authenticated user cart upon login.
- **Request Body**: `{ "guestSessionId": "guest-uuid" }`

---

## 6. Wishlist (`/wishlist`)

### `GET /wishlist` (Protected)
Lists all saved items for the customer.

### `POST /wishlist/toggle` (Protected)
Toggles product or specific variant in wishlist.
- **Request Body**: `{ "productId": "uuid", "variantId": "optional-variant-uuid" }`
- **Response `data`**: `{ "added": true, "message": "Added to wishlist" }` | `{ "added": false, "message": "Removed from wishlist" }`

---

## 7. Checkout & Payments (`/checkout`, `/payments`)

### `POST /checkout/initiate` (Protected)
Atomically reserves stock, creates order in `PENDING_PAYMENT`, snapshots item prices and delivery address, and initializes a PhonePe Payment Gateway session.
- **Request Body**:
  ```json
  {
    "shippingAddressId": "address-uuid",
    "couponCode": "LEGACY10",
    "notes": "Please deliver between 10am - 4pm",
    "idempotencyKey": "unique-client-checkout-uuid"
  }
  ```
- **Response `data`**:
  ```json
  {
    "orderId": "order-uuid",
    "orderNumber": "ITH-2026-987654",
    "totalAmount": 7649.1,
    "currency": "INR",
    "redirectUrl": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay/...",
    "merchantTransactionId": "TXN_ITH_2026_987654_1740000000"
  }
  ```

### `GET /payments/status/:orderId` (Protected)
Checks live payment status (polled by Order Confirmation page).
- **Response `data`**: `{ "status": "SUCCESS" | "FAILED" | "INITIATED", "orderId": "..." }`

### `POST /payments/phonepe/webhook` (Public / Checksum Protected)
PhonePe S2S webhook listener that verifies `X-VERIFY` SHA256 checksum and commits reserved stock as sold on `COMPLETED`.

---

## 8. Customer Orders & Returns (`/orders`, `/returns`)

### `GET /orders` (Protected)
Lists customer orders with status, total, and snapshot items.
- **Query Parameters**: `status`, `page`, `limit`

### `GET /orders/:id` (Protected)
Full order details with tracking timeline history (`status_history`).

### `POST /orders/:id/cancel` (Protected)
Cancels order (allowed prior to shipping) and releases reserved stock.
- **Request Body**: `{ "reason": "Placed by mistake" }`

### `POST /returns` (Protected)
Submits return request for delivered items.
- **Request Body**:
  ```json
  {
    "orderId": "order-uuid",
    "reason": "Size fit is larger than expected",
    "customerComments": "Want to exchange or refund",
    "items": [
      { "orderItemId": "order-item-uuid", "quantity": 1, "reason": "Too loose" }
    ]
  }
  ```

---

## 9. Reviews (`/reviews`)

### `GET /reviews/product/:productId`
Fetches approved product reviews with verified purchase tags and 5-star ratings.

### `POST /reviews` (Protected)
Submits a review (automatically checks order history for verified purchase tag).
- **Request Body**:
  ```json
  {
    "productId": "uuid",
    "rating": 5,
    "title": "Exceptional fabric and royal craftsmanship",
    "comment": "The raw silk texture and brushed gold buttons are truly world-class."
  }
  ```

---

## 10. Admin Endpoints (`/admin`)

*Requires `role === 'ADMIN'`*
- `GET /admin/dashboard`: Revenue, total orders, pending returns, low-stock inventory alerts.
- `GET /admin/orders`: Filterable orders table.
- `PATCH /admin/orders/:id/status`: Transition order status (`PACKED`, `SHIPPED`, `DELIVERED`).
- `POST /admin/orders/:orderId/refund`: Issues automated PhonePe refund.
- `POST /admin/products`: Create new product with variants & inventory.
- `POST /admin/categories`: Create category.
- `POST /admin/coupons`: Create promotion codes.
- `GET /admin/audit`: View append-only security logs.
