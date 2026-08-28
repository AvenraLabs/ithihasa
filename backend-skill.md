# Ithihasa — Production Ecommerce Backend Skill

## 0. Mission

You are the senior backend architect for **Ithihasa — "Wear Your Legacy."**

Ithihasa is a premium clothing ecommerce platform with:

* React frontend
* PWA
* Android/iOS applications through Capacitor
* Express backend
* Sequelize ORM
* PostgreSQL
* GCP deployment
* Caddy reverse proxy
* PM2 process management
* GitHub Actions CI/CD

The backend must be designed as a **real production ecommerce system**, not as a CRUD demo.

The system must support:

* customer accounts
* product catalog
* product variants
* inventory
* cart
* wishlist
* checkout
* payments
* orders
* order tracking
* shipping
* coupons
* discounts
* returns
* refunds
* reviews
* notifications
* customer addresses
* admin management
* analytics
* audit logging
* role-based access control
* secure authentication
* idempotent transactional operations

The backend must remain modular enough that the system can grow without turning into a giant Express application.

---

# 1. NON-NEGOTIABLE ARCHITECTURE RULES

Use:

* Node.js
* Express
* TypeScript
* Sequelize
* PostgreSQL

Architecture:

```text
HTTP Request
    ↓
Route
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository / Data Access
    ↓
Sequelize
    ↓
PostgreSQL
```

Controllers must remain thin.

Business logic belongs in services.

Database queries belong in repositories/data-access modules.

Do not put business logic directly inside Express route handlers.

Do not put business logic directly inside Sequelize models.

Do not create one enormous `server.js`, `app.js`, `controller.js`, or `service.js`.

---

# 2. PROJECT STRUCTURE

Use a modular feature-oriented architecture.

Recommended structure:

```text
src/
├── app/
│   ├── app.ts
│   ├── server.ts
│   ├── routes.ts
│   └── container.ts
│
├── config/
│   ├── env.ts
│   ├── database.ts
│   ├── cors.ts
│   └── security.ts
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── admins/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── carts/
│   ├── wishlists/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── coupons/
│   ├── discounts/
│   ├── returns/
│   ├── refunds/
│   ├── reviews/
│   ├── addresses/
│   ├── notifications/
│   ├── search/
│   ├── media/
│   ├── analytics/
│   └── audit/
│
├── database/
│   ├── models/
│   ├── migrations/
│   ├── seeders/
│   └── index.ts
│
├── middleware/
│   ├── auth.ts
│   ├── rbac.ts
│   ├── error-handler.ts
│   ├── rate-limit.ts
│   ├── request-id.ts
│   └── validation.ts
│
├── common/
│   ├── errors/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   ├── pagination/
│   └── logger/
│
├── integrations/
│   ├── payments/
│   ├── shipping/
│   ├── email/
│   ├── sms/
│   └── storage/
│
└── tests/
```

Each module should normally contain:

```text
products/
├── product.routes.ts
├── product.controller.ts
├── product.service.ts
├── product.repository.ts
├── product.validation.ts
├── product.types.ts
├── product.constants.ts
└── index.ts
```

Do not create unnecessary files merely for the sake of abstraction.

Use the structure when it improves separation of concerns.

---

# 3. MODULE DEPENDENCY RULE

Modules must have clear boundaries.

Example:

```text
OrderService
    ↓
InventoryService
    ↓
PaymentService
    ↓
ShippingService
```

Do not create circular dependencies.

Avoid:

```text
ProductService → OrderService → ProductService
```

When shared behavior is required, extract it into:

* a domain service
* a repository
* a shared utility
* an integration abstraction

Do not solve circular dependencies with hacks.

---

# 4. USER ROLES

At minimum support:

```text
CUSTOMER
ADMIN
```

The architecture must be ready for future roles such as:

```text
SUPER_ADMIN
CATALOG_MANAGER
ORDER_MANAGER
INVENTORY_MANAGER
CUSTOMER_SUPPORT
MARKETING_MANAGER
```

Do not hardcode authorization checks based only on email addresses.

Use role-based authorization.

Example:

```text
CUSTOMER
    ↓
Own profile
Own addresses
Own cart
Own wishlist
Own orders
Own reviews

ADMIN
    ↓
Customers
Products
Categories
Variants
Inventory
Orders
Payments
Returns
Refunds
Coupons
Reviews
Analytics
Audit logs
```

---

# 5. AUTHORIZATION

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Every protected admin endpoint must verify both.

Example:

```text
GET /api/admin/orders

Authentication
    ↓
Valid user
    ↓
Role = ADMIN
    ↓
Allow
```

A customer must never be able to access:

```text
/api/admin/*
```

merely because the frontend hides the admin UI.

Authorization must always be enforced by the backend.

---

# 6. ADMIN SECURITY

Admin endpoints require stronger protection than ordinary customer endpoints.

At minimum:

* authenticated admin
* RBAC
* rate limiting
* audit logging
* secure session/token handling
* validation
* no trust in frontend role information

For sensitive operations such as:

* refunds
* cancelling large orders
* modifying inventory
* changing product prices
* changing admin roles

record an audit event.

Example:

```text
ADMIN_CHANGED_PRODUCT_PRICE

actor:
admin_user_id

target:
product_id

before:
₹4,500

after:
₹4,200

timestamp:
...

request_id:
...
```

---

# 7. AUTHENTICATION

Authentication implementation must be secure and consistent.

Support:

* customer registration
* login
* logout
* refresh/session management
* password reset
* email verification if enabled
* account recovery
* admin authentication

Do not store plaintext passwords.

Use an appropriate password hashing algorithm.

Do not store secrets in PostgreSQL.

Do not put private secrets in the React frontend.

Never trust:

```text
role
userId
price
discount
inventory
payment status
```

sent by the client.

The server is authoritative.

---

# 8. DATABASE

PostgreSQL is the source of truth.

Use Sequelize for:

* models
* associations
* migrations
* transactions
* queries

Production schema changes must be performed through migrations.

Do not rely on:

```text
sequelize.sync({ alter: true })
```

for production deployments.

Use versioned migrations.

---

# 9. DATABASE NAMING

Use consistent naming.

Recommended:

```text
snake_case
```

for PostgreSQL columns and tables.

Example:

```text
users
products
product_variants
inventory_items
orders
order_items
payments
shipping_addresses
```

Primary keys should use a consistent strategy across the system.

Prefer UUIDs where appropriate for public-facing entities.

Never expose sequential internal IDs unnecessarily.

---

# 10. CORE DATABASE ENTITIES

The initial domain model should include at least:

```text
users
roles
user_roles

addresses

categories
products
product_images
product_variants
product_options
product_option_values

inventory
inventory_movements

carts
cart_items

wishlists
wishlist_items

orders
order_items
order_status_history

payments
payment_transactions
payment_webhooks

shipments
shipment_items
tracking_events

coupons
coupon_redemptions

returns
return_items

refunds

reviews

notifications

audit_logs
```

Additional entities may be introduced when required by business rules.

---

# 11. PRODUCT MODEL

A product is not necessarily an inventory item.

Example:

```text
Product:
Ithihasa Heritage Shirt
```

Variants:

```text
Black / S
Black / M
Black / L
Black / XL
White / S
White / M
...
```

Each purchasable variant must have a unique identity.

Do not store:

```text
size
color
stock
sku
```

only on the parent product when variants exist.

---

# 12. PRODUCT FIELDS

Products should support concepts such as:

```text
id
name
slug
description
short_description
brand
category_id
status
visibility
base_price
compare_at_price
currency
metadata
created_at
updated_at
```

Products may also require:

```text
seo_title
seo_description
published_at
```

Do not overload a single JSON column with data that should be relational.

Use JSON/JSONB for genuinely flexible metadata.

---

# 13. PRODUCT VARIANTS

A variant should support:

```text
id
product_id
sku
barcode
price
compare_at_price
currency
status
attributes
created_at
updated_at
```

Example:

```text
Product
  ↓
Variant
  ├── SKU
  ├── Size = M
  ├── Color = Black
  └── Inventory = 12
```

SKU must be unique.

Never identify inventory only by product ID when variants exist.

---

# 14. PRODUCT IMAGES

Products may have multiple images.

Support:

```text
product_id
variant_id nullable
url
alt_text
sort_order
is_primary
metadata
```

Images should be stored externally rather than inside PostgreSQL.

PostgreSQL stores metadata.

Object storage/CDN stores image files.

The frontend receives optimized URLs.

---

# 15. CATEGORIES

Support:

```text
categories
```

with:

* name
* slug
* parent_id
* description
* image
* sort_order
* status

Support nested categories if required.

Do not hardcode categories in frontend code.

---

# 16. INVENTORY

Inventory is authoritative backend state.

At minimum track:

```text
on_hand
reserved
available
```

Conceptually:

```text
available = on_hand - reserved
```

Do not trust frontend stock counts.

Inventory operations must be transactional.

---

# 17. INVENTORY MOVEMENTS

Never simply overwrite stock without recording why.

Record inventory movements:

```text
PURCHASE
SALE
RESERVATION
RELEASE
RETURN
ADJUSTMENT
DAMAGE
RESTOCK
```

Example:

```text
SKU:
ITH-SHIRT-BLK-M

Before:
20

Movement:
SALE

Quantity:
2

After:
18
```

This makes inventory auditable.

---

# 18. INVENTORY CONCURRENCY

Inventory is a concurrency problem.

Example:

```text
Stock = 1

Customer A → checkout
Customer B → checkout
```

Both requests must not successfully purchase the same final unit.

Use PostgreSQL transactions and appropriate row-level locking/atomic updates.

Never rely only on:

```text
SELECT stock
```

followed later by:

```text
UPDATE stock
```

without concurrency protection.

---

# 19. CART

Support:

```text
guest cart
authenticated customer cart
```

If guest users are supported, use a secure cart/session identifier.

Cart contains:

```text
cart
cart_items
```

Cart item references the product variant.

Never trust the client-provided final price.

Server recalculates:

```text
item price
quantity
discount
tax
shipping
total
```

---

# 20. CART MERGING

When a guest logs in:

```text
Guest cart
    +
Customer cart
    ↓
Merge
    ↓
Validate inventory
    ↓
Recalculate
```

Do not blindly overwrite one cart.

Resolve duplicate variants according to a defined business rule.

---

# 21. WISHLIST

Support:

```text
add
remove
list
```

Wishlist should reference product/variant appropriately.

Prevent duplicates using a database constraint where appropriate.

---

# 22. CHECKOUT

Checkout is a server-controlled process.

The client submits intent.

The server calculates the authoritative order:

```text
cart
 ↓
validate products
 ↓
validate inventory
 ↓
calculate prices
 ↓
apply coupon
 ↓
calculate shipping
 ↓
calculate taxes
 ↓
create order
 ↓
reserve inventory
 ↓
initiate payment
```

Never accept:

```text
total = 3999
```

from the client as authoritative.

---

# 23. PRICE CALCULATION

Price calculation must be centralized.

Create a pricing service.

Example:

```text
PricingService
├── calculateItemSubtotal()
├── calculateDiscount()
├── calculateShipping()
├── calculateTax()
└── calculateOrderTotal()
```

Do not duplicate price calculation across:

* cart
* checkout
* order
* admin
* frontend

The server must produce the authoritative final amount.

---

# 24. MONEY

Never use floating-point arithmetic for financial calculations.

Do not rely on:

```text
float
```

for monetary values.

Use an appropriate exact representation, typically integer minor units or PostgreSQL `NUMERIC`, consistently across the system.

Example:

```text
₹4,500.00
```

should not become:

```text
4499.999999
```

internally.

Currency must be explicit.

---

# 25. ORDERS

Once an order is created, preserve a historical snapshot.

An order must not depend on the product's current price/name/image remaining unchanged.

`order_items` should preserve relevant purchase-time information such as:

```text
product_id
variant_id
sku
product_name
variant_description
unit_price
quantity
discount
tax
subtotal
total
```

If the product price later changes:

```text
Product price = ₹5,000
```

an old order should still display:

```text
Purchased price = ₹4,500
```

---

# 26. ORDER STATUS

Use explicit order states.

Example:

```text
PENDING_PAYMENT
PAID
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
```

Only allow valid state transitions.

Do not allow arbitrary:

```text
status = anything
```

from the frontend.

---

# 27. ORDER STATUS HISTORY

Every meaningful status transition should be recorded.

Example:

```text
PAID
 ↓
PROCESSING
 ↓
PACKED
 ↓
SHIPPED
 ↓
DELIVERED
```

Store:

```text
order_id
from_status
to_status
actor
reason
created_at
```

This gives customer support and administrators a complete history.

---

# 28. PAYMENTS

Payment providers must be isolated behind an integration interface.

Example:

```text
PaymentService
      ↓
PaymentProvider
      ↓
Razorpay / Stripe / other provider
```

Do not spread provider-specific code throughout:

```text
OrderService
CartService
Controller
```

Provider-specific implementation belongs in:

```text
integrations/payments/
```

---

# 29. PAYMENT WEBHOOKS

Never assume the browser redirect means payment succeeded.

Payment provider webhook/server verification is authoritative.

Example:

```text
Customer pays
    ↓
Provider
    ↓
Webhook
    ↓
Backend verifies event
    ↓
Transaction
    ↓
Payment = SUCCESS
    ↓
Order = PAID
```

Webhook processing must be idempotent.

Store provider event IDs and prevent duplicate processing.

---

# 30. IDEMPOTENCY

Critical operations must support idempotency.

Especially:

```text
create order
create payment
payment webhook
refund
retry checkout
```

Example:

```text
POST /checkout
Idempotency-Key: abc123
```

If the same request arrives twice, it must not create two orders.

---

# 31. TRANSACTIONS

Use Sequelize transactions for operations requiring atomicity.

Example order creation:

```text
BEGIN
    validate cart
    validate inventory
    reserve inventory
    create order
    create order items
    create order history
COMMIT
```

If anything fails:

```text
ROLLBACK
```

Do not leave:

```text
inventory reserved
+
order missing
```

---

# 32. SHIPPING

Shipping must be abstracted.

Example:

```text
ShippingService
      ↓
ShippingProvider
      ↓
Provider implementation
```

Support concepts such as:

```text
shipping method
shipping fee
address
shipment
tracking number
carrier
shipment status
tracking events
```

Do not couple the entire order system to one shipping provider.

---

# 33. TAX

Tax calculation must be backend controlled.

The architecture must allow:

```text
taxable amount
tax rate
tax type
tax amount
```

For Indian operations, keep the architecture capable of GST concepts such as:

```text
CGST
SGST
IGST
```

without hardcoding tax rules throughout the codebase.

Tax logic belongs in a dedicated tax/pricing module.

Actual tax rules must be confirmed before production.

---

# 34. COUPONS

Support coupons with:

```text
code
type
value
minimum_order_value
maximum_discount
start_at
expires_at
usage_limit
per_user_limit
status
```

Possible discount types:

```text
PERCENTAGE
FIXED_AMOUNT
```

Validate coupons on the server.

Prevent:

* expired coupons
* over-limit usage
* unauthorized stacking
* negative totals

Coupon redemption should be transactional where necessary.

---

# 35. DISCOUNTS

Keep promotion logic separate from the frontend.

The backend determines:

```text
eligible?
discount?
final price?
```

Never trust a client-generated discount amount.

If multiple promotions exist, define explicit precedence and stacking rules.

---

# 36. RETURNS

Support return requests.

Example:

```text
Customer
 ↓
Return request
 ↓
Order validation
 ↓
Item eligibility
 ↓
Admin review
 ↓
Approved
 ↓
Return shipment
 ↓
Received
 ↓
Inspection
 ↓
Refund
```

Return status should be explicit.

Do not simply modify the original order status to represent every return event.

---

# 37. REFUNDS

Refunds must be separately tracked.

Support:

```text
refund_id
order_id
payment_id
amount
currency
reason
status
provider_reference
created_at
```

Refund operations require authorization and audit logging.

Never allow the frontend to choose an arbitrary refund amount without backend validation.

---

# 38. REVIEWS

Support:

```text
product
customer
rating
title
body
status
created_at
```

Consider verified-purchase logic.

Prevent obvious duplicate reviews according to the business rules.

Admin should be able to moderate reviews.

Do not expose unapproved moderation states publicly.

---

# 39. CUSTOMER ADDRESSES

Customers can manage:

```text
name
phone
address_line_1
address_line_2
city
state
postal_code
country
```

Support:

```text
default_shipping
default_billing
```

Do not trust address IDs without verifying ownership.

Example:

```text
GET /addresses/:id
```

must verify the address belongs to the authenticated customer.

---

# 40. ADMIN ORDER MANAGEMENT

Admin must be able to:

```text
view orders
search orders
filter orders
sort orders
view order details
view customer information
view payment status
view shipment status
view order history
update allowed statuses
cancel orders
process returns
process refunds
```

Admin order detail should provide a complete timeline:

```text
Order created
Payment initiated
Payment completed
Order processing
Packed
Shipped
Delivered
```

---

# 41. ADMIN PRODUCT MANAGEMENT

Admin must be able to:

```text
create product
edit product
archive product
publish product
unpublish product
manage categories
manage variants
manage SKUs
manage prices
manage images
manage product metadata
```

Do not permanently delete products that are referenced by historical orders unless the data model explicitly supports safe archival.

Prefer:

```text
ACTIVE
DRAFT
ARCHIVED
```

states.

---

# 42. ADMIN INVENTORY MANAGEMENT

Admin must be able to:

```text
view stock
adjust stock
view inventory movements
view low-stock products
view reserved stock
release erroneous reservations
```

Manual inventory adjustments require:

```text
reason
actor
timestamp
quantity
```

and should create an audit record.

---

# 43. ADMIN CUSTOMER MANAGEMENT

Admin should be able to:

```text
search customers
view customer
view orders
view order history
view addresses where permitted
view account status
disable/enable account
```

Avoid exposing unnecessary sensitive information.

Never display passwords.

Never display secrets.

---

# 44. ADMIN DASHBOARD

Initial admin dashboard should support useful business metrics:

```text
total orders
revenue
orders today
orders this week
orders this month
average order value
pending orders
processing orders
low stock items
pending returns
pending refunds
```

Analytics must be backed by server/database queries.

Do not calculate authoritative business metrics only in React.

---

# 45. SEARCH

Start with PostgreSQL capabilities unless requirements justify a dedicated search engine.

Support:

```text
product name
description
SKU
category
attributes
```

Use appropriate PostgreSQL indexes and full-text/trigram capabilities where useful.

Do not immediately add Elasticsearch/OpenSearch merely because the application is ecommerce.

Introduce dedicated search infrastructure only when actual scale/search requirements justify it.

---

# 46. PAGINATION

Never return unbounded lists.

Admin endpoints such as:

```text
/orders
/products
/customers
/reviews
```

must paginate.

Support:

```text
page
limit
sort
filters
```

or cursor-based pagination where appropriate.

Enforce maximum page size server-side.

Never allow:

```text
limit=1000000
```

to become an expensive database query.

---

# 47. FILTERING AND SORTING

Whitelist allowed sort/filter fields.

Never directly concatenate arbitrary client values into SQL.

Use Sequelize query construction safely.

Example:

```text
sort:
created_at
price
name
```

must be mapped from a known whitelist.

---

# 48. DATABASE INDEXING

Add indexes based on actual access patterns.

Important candidates include:

```text
users.email
users.created_at

products.slug
products.status
products.category_id

product_variants.sku
product_variants.product_id

inventory.variant_id

cart.user_id
cart_items.cart_id

orders.user_id
orders.status
orders.created_at

payments.order_id
payments.status

shipments.order_id

reviews.product_id
reviews.user_id
```

Do not create indexes blindly on every column.

Use PostgreSQL query plans to identify slow queries.

---

# 49. N+1 QUERY PREVENTION

Do not implement:

```text
fetch 100 orders
↓
for each order
    fetch customer
    fetch items
    fetch payment
```

without considering query cost.

Use:

* Sequelize includes carefully
* joins
* batched queries
* dedicated queries

where appropriate.

Do not blindly eager-load huge object graphs.

---

# 50. API RESPONSE FORMAT

Use a consistent response shape.

Example:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

Do not expose raw Sequelize errors to clients.

Do not expose PostgreSQL errors.

Do not expose stack traces in production.

---

# 51. ERROR HANDLING

Create typed application errors.

Examples:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
PaymentError
InventoryError
BusinessRuleError
```

Central error middleware converts these into safe HTTP responses.

Controllers should not contain repetitive try/catch blocks for every request unless required.

---

# 52. VALIDATION

Validate input at the API boundary.

Validate:

* body
* params
* query
* headers where relevant

Use a consistent schema validation library.

Never assume the frontend validation is sufficient.

Frontend validation is for UX.

Backend validation is for security and correctness.

---

# 53. SECURITY

Production backend must include appropriate protection against:

* SQL injection
* authentication abuse
* brute-force attacks
* credential stuffing
* broken authorization
* IDOR
* mass assignment
* malicious payloads
* oversized requests
* unsafe file uploads
* abuse of admin endpoints

Use appropriate:

* Helmet/security headers
* CORS configuration
* rate limiting
* request size limits
* input validation
* authentication middleware
* authorization middleware

Do not allow arbitrary origins in production.

---

# 54. MASS ASSIGNMENT PROTECTION

Never blindly do:

```text
Model.create(req.body)
```

or:

```text
Model.update(req.body)
```

for privileged resources.

Explicitly select accepted fields.

A customer must never be able to submit:

```json
{
  "role": "ADMIN"
}
```

and have the backend accept it.

---

# 55. FILE UPLOADS

Product images and other media should not be uploaded directly into the application server's local filesystem as the permanent storage layer.

Use object storage.

Recommended architecture:

```text
Admin
 ↓
Backend
 ↓
Signed upload URL
 ↓
Object storage
 ↓
CDN
 ↓
Frontend
```

PostgreSQL stores metadata.

---

# 56. EMAIL / SMS / NOTIFICATIONS

Create provider abstractions.

Example:

```text
NotificationService
    ├── EmailProvider
    └── SMSProvider
```

Events may include:

```text
WELCOME
ORDER_CREATED
PAYMENT_SUCCESS
ORDER_SHIPPED
ORDER_DELIVERED
RETURN_APPROVED
REFUND_COMPLETED
PASSWORD_RESET
```

Do not place email/SMS provider code inside order controllers.

---

# 57. ASYNCHRONOUS WORK

Do not make important user requests wait unnecessarily for:

* email sending
* SMS sending
* analytics events
* non-critical notifications
* image processing

Use a background job system when the workload justifies it.

Keep the initial implementation simple if traffic is low.

Do not introduce a queue merely for architectural fashion.

---

# 58. AUDIT LOGGING

Audit sensitive administrative/business actions.

At minimum record:

```text
actor
action
entity_type
entity_id
before
after
ip
user_agent
request_id
created_at
```

Examples:

```text
PRODUCT_CREATED
PRODUCT_PRICE_CHANGED
PRODUCT_ARCHIVED
INVENTORY_ADJUSTED
ORDER_STATUS_CHANGED
REFUND_CREATED
CUSTOMER_DISABLED
ADMIN_ROLE_CHANGED
COUPON_CREATED
```

Audit logs should be append-oriented and protected from normal customer modification.

---

# 59. OBSERVABILITY

Every request should have a request/correlation ID.

Logs should make it possible to trace:

```text
HTTP request
 ↓
controller
 ↓
service
 ↓
database/payment provider
```

Log structured data.

Do not log:

* passwords
* payment secrets
* authentication tokens
* full card numbers
* sensitive personal information unnecessarily

---

# 60. HEALTH CHECKS

Provide:

```text
GET /health
```

for basic process health.

Optionally:

```text
GET /ready
```

for readiness checks.

Health endpoints must not expose secrets or database credentials.

Use them for:

* GCP
* deployment verification
* PM2
* monitoring
* CI/CD smoke checks

---

# 61. CONFIGURATION

All environment-specific configuration must come from environment variables or secure configuration.

Examples:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET / session configuration
FRONTEND_URL
PAYMENT_PROVIDER_KEY
PAYMENT_PROVIDER_SECRET
STORAGE_BUCKET
STORAGE_REGION
EMAIL_PROVIDER_KEY
```

Never commit secrets.

Provide:

```text
.env.example
```

with variable names but no real secrets.

---

# 62. CORS

Production CORS must explicitly allow the known frontend origins.

Do not use:

```text
origin: "*"
```

for authenticated production APIs unless the endpoint is intentionally public and safe.

Support the required:

* web origin
* PWA origin
* Capacitor/native origins where applicable

without weakening security.

---

# 63. CACHING

Do not add Redis prematurely.

Start with PostgreSQL and application-level caching where sufficient.

When caching is introduced:

```text
cache
 ↓
database
```

must never cause stale transactional data to become authoritative.

Never cache:

* payment state
* inventory mutation results
* authorization decisions
* order creation state

without a deliberate consistency strategy.

---

# 64. TRANSACTIONAL BOUNDARIES

Transactions must be designed around business invariants.

Examples:

### Checkout

```text
cart validation
+
inventory reservation
+
order creation
```

### Payment confirmation

```text
payment verification
+
payment state
+
order state
```

### Refund

```text
refund record
+
payment provider operation
+
order/refund state
```

External provider calls must be carefully designed around transaction boundaries because PostgreSQL cannot atomically roll back an external API call.

Use explicit state machines and retry-safe operations.

---

# 65. WEBHOOK SECURITY

Webhook endpoints must:

* verify provider signatures
* validate payloads
* record event IDs
* be idempotent
* avoid trusting client redirects
* handle retries
* log processing results safely

Never expose an unverified webhook as a successful payment.

---

# 66. API VERSIONING

Design the API so versioning is possible.

Example:

```text
/api/v1/products
/api/v1/orders
/api/v1/admin/orders
```

Do not prematurely create multiple versions.

But structure the router so a future version can be introduced without rewriting the entire application.

---

# 67. PUBLIC VS ADMIN ROUTES

Keep route boundaries explicit.

Example:

```text
/api/v1/auth/*
/api/v1/products/*
/api/v1/categories/*
/api/v1/cart/*
/api/v1/wishlist/*
/api/v1/checkout/*
/api/v1/orders/*
/api/v1/account/*

/api/v1/admin/products/*
/api/v1/admin/orders/*
/api/v1/admin/inventory/*
/api/v1/admin/customers/*
/api/v1/admin/payments/*
/api/v1/admin/refunds/*
/api/v1/admin/returns/*
/api/v1/admin/reviews/*
/api/v1/admin/coupons/*
/api/v1/admin/analytics/*
/api/v1/admin/audit/*
```

Customers must never rely on frontend routing for admin protection.

---

# 68. CUSTOMER ORDER ACCESS

Every customer order query must enforce ownership.

Correct:

```text
WHERE order.id = requested_id
AND order.user_id = authenticated_user_id
```

Do not implement:

```text
GET /orders/:id
```

by ID alone.

This prevents IDOR vulnerabilities.

---

# 69. ADMIN ORDER ACCESS

Admins can query orders globally according to their role.

Use authorization rules to determine whether an admin can:

* view
* modify
* cancel
* refund
* manage shipments

Do not give every future admin role unrestricted permissions.

---

# 70. SOFT DELETE / ARCHIVAL

Be careful with deletion.

Historical ecommerce records must remain consistent.

Prefer states such as:

```text
ACTIVE
INACTIVE
ARCHIVED
```

for products and other entities that participate in historical records.

Never casually hard-delete:

* orders
* payment transactions
* refunds
* audit logs

---

# 71. DATABASE CONSTRAINTS

Business invariants should be enforced at the database level where possible.

Examples:

```text
unique SKU
unique product slug
unique coupon code
unique wishlist item per customer/product
valid foreign keys
non-negative quantities
```

Do not rely exclusively on JavaScript checks.

Application validation and database constraints should work together.

---

# 72. TESTING

Minimum test categories:

## Unit tests

Test:

* pricing
* discounts
* tax calculation
* inventory rules
* order state transitions
* coupon rules

## Integration tests

Test:

* authentication
* authorization
* product APIs
* cart
* checkout
* orders
* payment webhook handling
* admin APIs

## Critical scenarios

Must test:

```text
two users purchasing final stock
duplicate checkout request
duplicate payment webhook
expired coupon
invalid coupon
unauthorized order access
customer accessing another customer's address
customer accessing admin endpoint
refund retry
payment failure
inventory reservation failure
```

---

# 73. MIGRATIONS

Every schema change must have a migration.

Example:

```text
20260826-create-users
20260827-create-products
20260828-create-orders
```

Never modify production database structure manually without recording the change in migration history.

Migrations must be:

* deterministic
* reviewable
* reversible where practical

---

# 74. SEEDING

Development seed data may include:

```text
admin user
test customer
categories
products
variants
inventory
coupons
```

Never seed fake production credentials.

Use environment-specific behavior.

---

# 75. API DOCUMENTATION

Document the API.

At minimum document:

* endpoint
* HTTP method
* authentication requirement
* request schema
* response schema
* error codes
* pagination
* authorization requirements

OpenAPI/Swagger may be introduced if useful.

The API contract should remain understandable to the frontend team.

---

# 76. FRONTEND CONTRACT

Frontend developers must never need to understand Sequelize internals.

Frontend sees:

```text
HTTP API
```

not:

```text
database schema
```

Backend may change internal implementation without breaking the API contract.

---

# 77. ADMIN API DESIGN

Admin endpoints should support practical operations.

Example:

```text
GET    /admin/orders
GET    /admin/orders/:id
PATCH  /admin/orders/:id/status

GET    /admin/products
POST   /admin/products
GET    /admin/products/:id
PATCH  /admin/products/:id
DELETE /admin/products/:id

GET    /admin/inventory
POST   /admin/inventory/adjustments

GET    /admin/customers
GET    /admin/customers/:id

GET    /admin/returns
PATCH  /admin/returns/:id

GET    /admin/refunds
POST   /admin/refunds

GET    /admin/reviews
PATCH  /admin/reviews/:id/moderation

GET    /admin/coupons
POST   /admin/coupons
PATCH  /admin/coupons/:id

GET    /admin/analytics
GET    /admin/audit
```

Exact endpoints may evolve with the frontend requirements.

---

# 78. ADMIN UI DATA REQUIREMENTS

The backend must expose enough information for the admin dashboard to operate without database access.

For an order detail, return useful information such as:

```text
order
customer
items
pricing
payment
shipping
shipment
status history
return information
refund information
timestamps
```

Do not make the frontend perform ten unrelated requests merely to display one order when a dedicated admin detail endpoint can efficiently provide the required view.

Avoid over-fetching huge unnecessary datasets.

---

# 79. ANALYTICS

Separate operational data from analytics requirements.

Initial metrics can be derived from PostgreSQL.

Examples:

```text
revenue
orders
average order value
top products
top categories
repeat customers
conversion-related events where available
```

Do not build a massive analytics warehouse before the business needs it.

---

# 80. EVENT-ORIENTED DESIGN

Where useful, define domain events conceptually:

```text
OrderCreated
PaymentSucceeded
PaymentFailed
OrderShipped
OrderDelivered
ReturnRequested
RefundCompleted
InventoryAdjusted
```

These events can later drive:

* notifications
* analytics
* integrations
* background jobs

Do not build a complex event bus unless actual requirements justify it.

Keep domain boundaries clean so event-driven behavior can be introduced later.

---

# 81. DEPLOYMENT

Production environment:

```text
Internet
   ↓
Caddy
   ↓
Express / Node
   ↓
PostgreSQL
```

PM2 manages the Node process.

Do not expose Express directly to the public internet when Caddy is acting as the reverse proxy.

Use HTTPS.

---

# 82. DATABASE DEPLOYMENT

Prefer managed PostgreSQL such as GCP Cloud SQL for production rather than placing PostgreSQL casually on the same application VM.

Application server:

```text
GCP VM
├── Caddy
├── Node
└── PM2
```

Database:

```text
Cloud SQL PostgreSQL
```

Use secure connectivity and appropriate network restrictions.

---

# 83. CI/CD

GitHub Actions should run at minimum:

```text
git push
    ↓
install
    ↓
lint
    ↓
typecheck
    ↓
unit tests
    ↓
integration tests where configured
    ↓
build
    ↓
deploy
    ↓
health check
```

Do not deploy code that fails the required checks.

---

# 84. DEPLOYMENT SAFETY

Deployment must not blindly restart production.

Recommended:

```text
build
↓
test
↓
deploy
↓
migration
↓
restart/reload
↓
health check
```

Database migrations must be considered carefully for backward compatibility.

Avoid schema changes that break the currently running version during rolling/overlap deployment.

---

# 85. BACKUPS

Production PostgreSQL must have:

* automated backups
* point-in-time recovery where appropriate
* tested restore procedures

A backup that has never been restored is not a proven backup strategy.

---

# 86. RATE LIMITING

Apply stronger rate limits to sensitive endpoints:

```text
login
password reset
OTP if implemented
checkout
payment creation
coupon validation
admin APIs
webhooks where appropriate
```

Do not apply one arbitrary rate limit to every endpoint.

---

# 87. PERFORMANCE

Optimize based on measurement.

Priorities:

1. correct database indexes
2. efficient queries
3. pagination
4. avoiding N+1 queries
5. appropriate connection pooling
6. response payload size
7. caching where justified
8. background jobs where justified

Do not introduce Redis, Kafka, Elasticsearch or microservices merely because they sound scalable.

---

# 88. MONOLITH FIRST

Ithihasa should initially be a **modular monolith**.

Do not create:

```text
product-service
order-service
payment-service
inventory-service
user-service
```

as separate deployments for v1.

Instead:

```text
One Express application
        │
        ├── Auth module
        ├── Product module
        ├── Inventory module
        ├── Order module
        ├── Payment module
        └── ...
```

Clear module boundaries provide most of the organizational benefits without distributed-system complexity.

Split services only when actual scale/team/operational requirements justify it.

---

# 89. NO BUSINESS LOGIC IN FRONTEND

The frontend may calculate temporary display values.

The backend remains authoritative for:

```text
price
discount
tax
shipping
inventory
payment
order status
permissions
refunds
```

Never trust client calculations for business-critical values.

---

# 90. API IDEMPOTENCY AND RETRIES

Design APIs assuming networks fail.

The mobile client may:

```text
send request
↓
lose connection
↓
retry
```

The backend must safely handle retries for critical mutations.

Especially:

```text
checkout
payment
order creation
webhooks
refunds
```

---

# 91. MOBILE NETWORK REALITY

The Capacitor application may operate on:

* slow 4G
* unstable Wi-Fi
* temporary disconnection
* background/foreground transitions
* duplicate requests
* interrupted payment flows

The backend must be resilient to these conditions.

Never assume:

```text
one request = one execution
```

for critical operations.

---

# 92. DATA CONSISTENCY

For ecommerce, correctness is more important than theoretical speed.

Especially protect:

```text
inventory
orders
payments
refunds
customer ownership
permissions
```

A slightly slower correct transaction is preferable to a fast system that oversells inventory or duplicates payments.

---

# 93. RESPONSE DESIGN

Do not return massive database objects by default.

Use DTOs/view models where useful.

Example:

```text
ProductListDTO
ProductDetailDTO
OrderListDTO
OrderDetailDTO
AdminOrderDTO
CustomerDTO
```

Avoid accidentally exposing internal database columns.

---

# 94. SEQUELIZE RULES

Use Sequelize for persistence.

Models should define:

* columns
* relationships
* constraints
* indexes
* persistence-specific behavior

Do not turn Sequelize models into giant business-logic classes.

Prefer:

```text
Model
 ↓
Repository
 ↓
Service
```

for meaningful business operations.

---

# 95. SERVICE RULES

Services represent business operations.

Good:

```text
OrderService.createOrder()
OrderService.cancelOrder()
InventoryService.reserve()
InventoryService.release()
PaymentService.verifyWebhook()
RefundService.createRefund()
CouponService.validate()
```

Bad:

```text
Utils.doEverything()
CommonService.processEverything()
```

Keep services domain-specific.

---

# 96. CONTROLLER RULES

Controllers should:

1. receive request
2. validate/parse input
3. call service
4. return response

Do not put:

```text
20 database queries
+
pricing calculations
+
inventory calculations
+
payment logic
```

inside a controller.

---

# 97. LOGGING RULES

Production logs should be:

* structured
* searchable
* useful
* safe

Include:

```text
timestamp
level
request_id
route
status
duration
user_id where appropriate
```

Never log:

```text
password
access token
refresh token
card number
payment secret
```

---

# 98. FINAL IMPLEMENTATION RULE

Before implementing any module:

1. Inspect the existing repository.
2. Inspect existing models.
3. Inspect existing migrations.
4. Inspect existing API conventions.
5. Reuse existing infrastructure.
6. Identify dependencies.
7. Define database changes.
8. Create migration.
9. Create/update models.
10. Create repository.
11. Create service.
12. Create validation.
13. Create controller.
14. Create routes.
15. Add authorization.
16. Add tests.
17. Update API documentation.
18. Run typecheck/lint/tests.
19. Verify database behavior.
20. Only then consider the module complete.

Never rewrite working modules unnecessarily.

---

# 99. DEFINITION OF DONE

A backend feature is not complete merely because:

```text
POST request → 200 OK
```

It is complete when:

* business rules are enforced server-side
* database constraints are correct
* migrations exist
* authorization is correct
* validation exists
* errors are safe
* transactions are used where required
* concurrency is handled
* idempotency exists where required
* tests exist
* logging is appropriate
* audit logging exists for sensitive operations
* API response is stable
* frontend can consume it cleanly
* production configuration is safe

---

# 100. GOLDEN RULE

Ithihasa is an ecommerce business, not a CRUD application.

Prioritize correctness in this order:

```text
Security
   ↓
Data integrity
   ↓
Payment correctness
   ↓
Inventory correctness
   ↓
Authorization
   ↓
Reliability
   ↓
Performance
   ↓
Developer convenience
```

Never sacrifice the first six merely to make implementation easier.




// answers for few questions
phonepe payment gateway
 authentication google free 50000 users 
 shipping not decided yet 
 no tax and its indian app 
returns support