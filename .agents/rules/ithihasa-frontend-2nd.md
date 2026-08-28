---
trigger: always_on
---

23. CAPACITOR

The native shell must feel intentional.

Support:

iOS
Android
safe areas
status bar
splash screen
hardware back button
deep links
haptics

Android back behavior:

close sheet
↓
go back in navigation
↓
exit application

Do not immediately exit the application.

24. SAFE AREAS

Every fixed bottom element must account for:

padding-bottom: env(safe-area-inset-bottom);

Top content must account for:

padding-top: env(safe-area-inset-top);

Especially:

bottom navigation
sticky Add to Bag
cart footer
checkout footer
sheets
25. PWA

Use:

vite-plugin-pwa

The service worker must distinguish between:

cacheable content

and:

authoritative transactional state

Cache:

application shell
static assets
fonts
previously viewed product assets
suitable catalog GET requests

Do not cache:

payment operations
checkout mutations
order creation
authentication mutations
authoritative cart mutations

Never allow stale data to appear authoritative.

26. INSTALL EXPERIENCE

Do not rely on generic browser installation UI as the brand experience.

Android:

capture beforeinstallprompt
provide a custom install CTA

iOS:

use a custom instructional prompt
explain Share → Add to Home Screen

Only show the prompt after meaningful engagement.

Do not interrupt the first page load.

27. IMAGE STRATEGY

Product imagery is one of the highest-priority performance concerns.

Use:

AVIF/WebP
srcset
sizes
width
height
aspect-ratio
lazy loading

First viewport hero:

loading="eager"
fetchpriority="high"

Below-fold imagery:

loading="lazy"

Never ship huge original camera files directly to mobile users.

Use an image optimization/CDN layer when production infrastructure is ready.

28. PERFORMANCE TARGET

Target:

Lighthouse mobile Performance ≥90
LCP <2.5s
CLS <0.1
TBT <200ms

Use route-level code splitting.

Checkout code must not unnecessarily load on the homepage.

Do not import entire libraries when a tree-shakeable/importable module is available.

Measure performance rather than guessing.

29. ACCESSIBILITY

Every interactive element must have:

keyboard accessibility
visible focus state
accessible name
correct semantic HTML
adequate contrast
appropriate ARIA only where necessary

Never remove focus outlines without replacing them.

Target WCAG AA contrast.

Premium design does not justify poor accessibility.

30. ERROR AND EMPTY STATES

Do not use generic:

Oops!
Something went wrong :(

Instead explain:

What happened
+
What the user can do

Example:

Nothing saved yet.
Tap the heart on anything you love.

Error states must provide recovery whenever possible.

31. OPTIMISTIC UX

For safe interactions, update the UI immediately.

Examples:

wishlist
quantity
selected size
cart UI
filter selection

Pattern:

USER ACTION
↓
IMMEDIATE FEEDBACK
↓
BACKGROUND REQUEST
↓
SUCCESS → keep state
FAILURE → rollback + explain

Never make the application feel slow merely because the API is slow.

32. DESIGN SYSTEM ARCHITECTURE

Use:

Primitive tokens
↓
Semantic tokens
↓
Component tokens
↓
Components
↓
Features
↓
Screens

Components should not randomly invent their own:

colors
spacing
radii
shadows
typography
animation

Create reusable primitives first.

Examples:

Button
IconButton
Input
Sheet
Drawer
Badge
Price
Skeleton
Divider
ProductCard
SectionHeading

Then build features from those primitives.

33. PROJECT ARCHITECTURE

Prefer feature-oriented organization:

src/
├── app/
│   ├── router/
│   ├── providers/
│   └── App.tsx
│
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   ├── home/
│   ├── catalog/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── wishlist/
│   ├── search/
│   ├── orders/
│   └── account/
│
├── api/
│   ├── client.ts
│   ├── products.ts
│   ├── categories.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── account.ts
│
├── stores/
├── hooks/
├── lib/
├── styles/
└── assets/
    └── brand/

Avoid gigantic files.

Avoid gigantic components.

Avoid putting business logic inside JSX.

34. API ARCHITECTURE

Frontend API calls must go through a centralized API layer.

Do not scatter:

fetch(...)
axios(...)

through arbitrary components.

Use:

component
↓
feature hook
↓
TanStack Query
↓
API function
↓
API client
↓
Express

Centralize:

base URL
headers
authentication
error handling
response normalization
request cancellation where appropriate
35. AUTHENTICATION

Never store sensitive credentials directly in arbitrary Zustand state.

Authentication implementation must follow the backend's actual security model.

Do not invent authentication behavior.

Do not expose secrets in the Vite frontend.

Only variables intended for public frontend exposure may use Vite's public environment mechanism.

36. SECURITY

Never place:

database credentials
private API keys
payment secrets
service-account credentials

inside the frontend.

Assume all frontend code is publicly inspectable.

Authorization must always be enforced by Express/backend services.

The frontend only controls presentation.

37. GOOGLE / AI DESIGN TOOLS

Use AI tools for design exploration, not as an excuse to generate uncontrolled production code.

Google Stitch is appropriate for:

exploring homepage compositions
exploring PDP layouts
exploring checkout layouts
testing typography hierarchy
generating alternate mobile layouts
comparing navigation concepts
creating early visual prototypes

Stitch can accept natural-language/image input and iterate designs, and Google describes export paths toward Figma and frontend code.

When using Stitch:

Provide the Ithihasa logo.
Provide the design tokens.
Specify mobile-first.
Specify luxury heritage fashion.
Generate several concepts.
Select the strongest composition.
Refine manually.
Rebuild the final implementation using the Ithihasa component system.

Do NOT copy generated Stitch code blindly into production.

The existing architecture and tokens remain authoritative.

38. GOOGLE FLOW

Google Flow is primarily a creative image/video tool, not the application's UI design system. It currently supports image/video generation and editing and offers a free tier with daily credits, although availability and features can vary.

Use Flow for:

fashion campaign concepts
hero video concepts
launch videos
social media reels
editorial motion backgrounds
cinematic brand storytelling
campaign visual exploration
product-adjacent creative assets

Do NOT use generated video as the primary UI background merely because it looks impressive.

Premium UI should remain fast.

Prefer:

static image
+
subtle motion

over:

huge autoplay video

unless the performance budget supports it.

39. ICON RULE

Use Lucide as the application icon system.

Do not use AI-generated icons.

Do not download random SVG icons from websites without checking their license.

Do not mix:

Lucide
Material
Font Awesome
random SVG packs

for ordinary application controls.

Brand-specific decorative symbols should come from Ithihasa's own assets.

40. MICROCOPY

The interface voice is:

quiet
confident
short
human
heritage-driven

Avoid:

OMG!
WOW!
HURRY!!!
BEST DEAL!!!
ONLY 2 LEFT!!!

unless a genuine business requirement specifically requires urgency.

Prefer:

Added to your bag.

rather than:

YAY! PRODUCT ADDED!!!
41. PREMIUM UX RULE

When deciding between:

more features

and:

less visual noise

prefer less visual noise.

The user should immediately understand:

Where am I?
What am I looking at?
What can I do?
What happens next?

Premium does not mean complicated.

42. DO NOT OVERDESIGN

Never add an effect merely because it is technically possible.

Avoid:

excessive glassmorphism
excessive blur
giant gradients
neon gold
animated backgrounds
floating particles
unnecessary 3D
excessive shadows
excessive rounded cards
decorative SVG noise everywhere
excessive parallax

The photography and typography should carry the luxury feeling.

43. SCREEN DESIGN PROCESS

Before building a screen:

Step 1

Identify its primary job:

Browse
Decide
Transact
Step 2

Identify the primary user action.

Step 3

Design mobile at 375px.

Step 4

Define loading state.

Step 5

Define empty state.

Step 6

Define error state.

Step 7

Define offline/slow-network behavior.

Step 8

Define interaction feedback.

Step 9

Adapt to tablet.

Step 10

Adapt to desktop.

Step 11

Test keyboard/focus behavior.

Step 12

Test safe areas.

Step 13

Test reduced motion.

Step 14

Measure performance.

44. FINAL SCREEN REVIEW

Before declaring a screen complete, verify:

Brand
correct Ithihasa logo
correct colors
correct typography
restrained gold
signature motif used appropriately
UX
primary action obvious
one-thumb operation
44px touch targets
no unnecessary interaction steps
immediate feedback
Mobile
375px
390px
430px
safe-area support
keyboard support
Tablet
portrait
landscape
Desktop
1440px
hover states
appropriate navigation
Accessibility
keyboard
focus
contrast
semantic HTML
screen-reader labels
Performance
no layout shift
images optimized
lazy loading
code splitting
no unnecessary JavaScript
Native
iOS safe area
Android back
splash
status bar
haptics
deep linking
45. GOLDEN RULE

Never make Ithihasa look like:

a Shopify template
a SaaS dashboard
a Material Design app
a generic Tailwind template
an AI-generated website
a gaming website

Every screen should look intentionally designed for:

ITHIHASA — WEAR YOUR LEGACY.

46. PAGE OVER MODAL ARCHITECTURE RULE

Always prefer dedicated, full-featured pages and distinct URL routes over pop-up modals/dialogs for substantial flows, detailed inspection, and chat experiences.

Rules:
* Deep workflows (e.g. Order Details, Direct Chat / Live Concierge Console, Customer Dossier, Ticket Resolution, Piece Management, Campaign Creation) must be dedicated first-class pages with their own bookmarkable, shareable URL routes (e.g. `/orders/:id`, `/support/chat`, `/support/tickets/:id`).
* Modals should only be used for lightweight micro-actions, quick confirmation prompts, or contextual dropdowns.
* Any major interactive surface (such as Support Direct Chat) must live on a dedicated page with full viewport real estate, responsive mobile layout, clean breadcrumbs/back navigation, and browser history support.