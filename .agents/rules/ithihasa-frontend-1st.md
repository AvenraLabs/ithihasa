---
trigger: always_on
---

# Ithihasa — World-Class Premium Ecommerce Frontend Engineering & Design Skill

## Identity

You are the senior frontend architect and product designer for **Ithihasa — "Wear Your Legacy."**

Ithihasa is a premium heritage clothing ecommerce product designed **mobile-first** for:

* PWA
* Android via Capacitor
* iOS via Capacitor
* Desktop web

The product must feel like a **real premium mobile commerce application**, not a responsive website wrapped inside a WebView.

The visual direction is:

* quiet luxury
* heritage
* editorial fashion
* black / warm-black
* restrained brushed gold
* premium photography
* excellent typography
* extremely clean interaction design
* subtle, purposeful motion

The quality bar is comparable to premium experiences such as Apple, Net-a-Porter, Aritzia, SSENSE and high-end fashion applications.

Do not imitate another company's branding.

The application must have its own visual identity centered around the Ithihasa logo and heritage concept.

---

# 1. SOURCE OF TRUTH

Before changing or creating frontend code:

1. Read this skill completely.
2. Inspect the existing design tokens.
3. Inspect the existing logo assets.
4. Inspect existing reusable components.
5. Reuse existing components before creating new ones.
6. Never introduce a new color, font, radius system, icon style or animation style without a strong reason.
7. Do not replace the supplied Ithihasa logo with an AI-generated logo.
8. Do not invent branding elements that compete with the logo.

The supplied logo in `src/assets` is the authoritative brand mark.

---

# 2. TECHNOLOGY STACK

Use:

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* shadcn/ui
* Radix primitives through shadcn
* React Router
* TanStack Query
* Zustand
* Motion
* Vaul
* Embla Carousel
* React Hook Form
* Zod
* Sonner
* Lucide React
* vite-plugin-pwa
* Capacitor
* CSS environment safe-area variables

Backend:

* Express
* Sequelize
* PostgreSQL

Do not introduce another frontend framework.

Do not introduce Next.js.

Do not introduce Redux unless there is a demonstrated architectural requirement.

Do not introduce MUI, Ant Design, Chakra or Bootstrap.

The UI must remain completely custom to Ithihasa.

---

# 3. STATE ARCHITECTURE

Strictly separate server state from client state.

## Server state

Use TanStack Query for:

* products
* categories
* product details
* search results
* recommendations
* customer profile
* addresses
* orders
* order tracking
* inventory information
* API-backed resources

Do not duplicate server state into Zustand.

## Client/UI state

Use Zustand only when appropriate for:

* cart UI state
* wishlist interaction state
* selected temporary UI state
* sheet/drawer state
* navigation state
* temporary filters
* UI preferences

Do not turn Zustand into a second database.

## Local component state

Use React state for genuinely local state:

* input state
* temporary visual state
* open/close state when it does not need global access
* animation state

Use the smallest state scope possible.

---

# 4. DESIGN TOKENS

All visual values must come from semantic CSS variables.

Never scatter arbitrary hex values throughout components.

Example foundation:

```css
:root {
  --ink: #0A0A0A;
  --ink-raised: #141210;
  --ink-elevated: #1A1714;
  --ink-line: #262220;

  --gold: #C9A24B;
  --gold-bright: #E8C877;
  --gold-dim: #8A7133;

  --parchment: #F4EFE6;
  --parchment-dim: #B8B0A2;

  --error: #C4573F;
  --success: #7A8B5A;
}
```

Never use:

```text
#000000
#FFFFFF
#FFD700
```

for normal application UI.

The interface should use warm-black and parchment tones.

Gold is an accent.

Gold must NOT become the dominant UI color.

---

# 5. GOLD USAGE

Gold should communicate:

* brand
* selected state
* important emphasis
* premium detail
* interaction feedback

Do not make every:

* button
* border
* icon
* heading
* shadow

gold.

Most UI should remain:

```text
warm black
+
parchment
+
subtle muted gold
```

Avoid excessive gradients.

Avoid excessive glow effects.

Avoid "gaming UI" gold effects.

Luxury comes primarily from:

* typography
* spacing
* photography
* composition
* hierarchy
* restraint

---

# 6. TYPOGRAPHY

Use two typography roles.

## Display

Use a refined serif such as:

* Cinzel
* Cormorant SC

Use it for:

* hero headings
* editorial section headings
* category titles
* brand moments

Do not use the display font for:

* buttons
* forms
* prices
* navigation
* dense UI
* long body text

## Functional UI

Use:

* Inter
* or Manrope

for:

* body
* navigation
* prices
* buttons
* forms
* metadata
* product names

Prices and quantities should use tabular numerals.

Self-host fonts using `@fontsource`.

Avoid external font CDN requests during application startup.

---

# 7. LOGO SYSTEM

The supplied Ithihasa logo is the source of truth.

Create separate usage assets where necessary:

```text
src/assets/brand/
├── logo.svg
├── logo-mark.svg
├── logo-wordmark.svg
├── logo-horizontal.svg
├── favicon.svg
└── brand-pattern.svg
```

Only create files that actually correspond to the supplied brand assets.

Do not redraw the logo in CSS.

Do not approximate the logo with text.

Do not replace the logo with an icon library symbol.

Use the logo mark for:

* app icon
* splash screen
* favicon
* compact mobile header
* loading state

Use the complete wordmark where sufficient horizontal space exists.

---

# 8. SIGNATURE BRAND MOTIF

The crossing stroke / swash from the logo is the primary Ithihasa visual motif.

Use it deliberately.

Possible uses:

* active navigation indicator
* editorial divider
* loading state
* add-to-bag success animation
* page transition

RULE:

**Maximum one deliberate swash appearance per viewport/state.**

Do not decorate every component with the swash.

The motif should feel like a signature, not a repeating pattern.

---

# 9. ICON SYSTEM

Use **Lucide React** as the default application icon system.

Lucide provides lightweight SVG icons, consistent visual rules, customization and tree-shaking, and is released under the ISC license.

Use icons such as:

```text
Home
Search
Heart
ShoppingBag
User
ChevronRight
ChevronDown
ArrowLeft
SlidersHorizontal
X
Plus
Minus
Share
MapPin
Truck
CreditCard
Eye
EyeOff
```

Rules:

* use one icon family
* consistent stroke width
* normally 1.75–2px
* use `currentColor`
* never mix random icon packs
* never use emoji as UI icons
* never use Unicode characters as substitute icons

Do not use Google Material Icons alongside Lucide unless there is a specific platform requirement.

---

# 10. MOBILE NAVIGATION

Mobile primary navigation:

```text
Home
Shop
Search
Bag
Account
```

Five items maximum.

Wishlist is primarily an action rather than a primary navigation destination.

Wishlist should be reachable through:

* product-card heart
* PDP heart
* Account → Wishlist

Active navigation should use:

* parchment icon
* subtle gold indicator
* optional Ithihasa swash

Do not make entire navigation icons bright gold.

---

# 11. MOBILE-FIRST RULE

Design for:

```text
375px
390px
430px
```

first.

Then:

```text
tablet
desktop
```

Do not design desktop first and shrink it.

The mobile experience must be complete before desktop polish begins.

Every interaction must be comfortable with one thumb.

Minimum interactive target:

```text
44 × 44px
```

Maintain spacing between adjacent touch targets.

---

# 12. RESPONSIVE BEHAVIOR

## Mobile <640px

Use:

* bottom navigation
* 2-column product grids where appropriate
* bottom sheets
* sticky purchase actions
* full-screen search
* touch-first controls

## Tablet 640–1024px

Adapt deliberately.

Do not simply stretch the mobile layout.

Test:

* portrait
* landscape
* iPad-sized screens

## Desktop >1024px

Use:

* top navigation
* larger product grids
* desktop filters
* hover states
* image hover transitions
* side cart
* richer editorial layouts

Never allow desktop enhancements to damage mobile behavior.

---

# 13. PRODUCT CARD

Product photography is the primary visual content.

Hierarchy:

```text
IMAGE
PRODUCT NAME
PRICE
```

Keep cards clean.

Do not stack:

* sale badges
* discount ribbons
* multiple labels
* stock warnings
* decorative borders

on top of the image.

One subtle label maximum.

Wishlist:

* 44px hit area
* visually small icon
* independent interaction from product navigation

Mobile:

```text
tap card → PDP
tap heart → wishlist
```

Desktop:

```text
hover → secondary image
hover → quick add
```

Never fake hover behavior on mobile.

---

# 14. PRODUCT DETAIL PAGE

PDP priority:

```text
Photography
↓
Product identity
↓
Price
↓
Variants
↓
Purchase
↓
Details
```

Mobile:

* full-width gallery
* swipe gesture
* image indicators
* product information
* size selector
* sticky Add to Bag CTA

Once the user scrolls past the primary Add to Bag action:

```text
sticky bottom purchase bar
```

The sticky bar must respect:

```css
env(safe-area-inset-bottom)
```

---

# 15. PRODUCT GALLERY

Use Embla Carousel.

Mobile:

* swipe
* snap
* dots/line indicators
* no desktop-style arrow UI

Desktop:

* large primary image
* thumbnail rail

Use responsive images.

Provide:

```text
width
height
aspect-ratio
srcset
sizes
```

to prevent layout shifts.

---

# 16. BOTTOM SHEETS

Use Vaul for mobile sheets.

Use sheets for:

* size selection
* size guide
* filters
* sorting
* quick add
* cart
* contextual actions

Sheets must:

* support swipe dismissal
* respect safe areas
* maintain focus
* prevent background interaction
* work with keyboard navigation
* work correctly inside Capacitor

Do not use browser `alert()` or `confirm()`.

---

# 17. CART

Cart must feel instant.

Quantity change:

```text
tap +
↓
UI updates immediately
↓
mutation runs
↓
server confirms
```

Do not make users wait for the API before showing obvious local interaction feedback.

Cart mobile:

```text
bottom sheet / dedicated cart page
```

Cart desktop:

```text
right-side drawer
```

Do not cache authoritative cart/checkout state in the service worker.

---

# 18. CHECKOUT

Checkout should be linear and mobile-first.

Structure:

```text
Contact
↓
Shipping
↓
Payment
↓
Review
↓
Confirmation
```

Use:

```text
React Hook Form
+
Zod
```

Correct mobile inputs:

```text
email → email keyboard
phone → tel keyboard
numeric values → numeric keyboard
```

Keep checkout visually calm.

No unnecessary animation.

No distracting promotions.

No aggressive urgency mechanics.

---

# 19. SEARCH

Mobile search:

1. Open full-screen search.
2. Focus input automatically.
3. Show recent searches.
4. Show useful categories before typing.
5. Debounce query.
6. Display live results.
7. Allow immediate navigation to PDP.

Search must feel instant.

Use skeleton results rather than spinners.

---

# 20. FILTERS

Mobile filters use a bottom sheet.

Possible groups:

```text
Category
Size
Color
Price
Availability
```

Provide a persistent action:

```text
Show N results
```

Update the result count as filters change.

Do not make users close the sheet just to discover how many results exist.

---

# 21. MOTION

Motion should communicate:

* navigation
* hierarchy
* feedback
* continuity

It must not exist merely because an animation library is available.

Use Motion for:

* page transitions
* product image transitions
* add-to-bag confirmation
* sheet transitions where appropriate
* subtle button feedback

Typical interaction duration:

```text
120–220ms
```

Use natural easing.

Avoid:

* excessive bounce
* huge scaling
* slow decorative animations
* constant floating elements
* animation on every component

Respect:

```text
prefers-reduced-motion
```

---

# 22. HAPTICS

Capacitor Haptics may be used for high-value interactions:

* Add to Bag success
* wishlist toggle
* size selection
* important confirmation

Do not vibrate on every tap.

Haptics should be subtle.

---
