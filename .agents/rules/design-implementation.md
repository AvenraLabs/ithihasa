---
trigger: always_on
---

# Ithihasa — Stitch → Antigravity Design Implementation Rules

## 1. Stitch is the visual reference

Approved Ithihasa screens are designed in the official Stitch project:

https://stitch.withgoogle.com/projects/16011225984681117678?pli=1

Stitch is the visual design source for screen composition.

The Ithihasa frontend skill remains the engineering and design-system source of truth.

When the Stitch design and existing implementation differ:

* preserve the approved Stitch visual composition
* preserve the Ithihasa design tokens
* preserve accessibility
* preserve responsive behavior
* preserve the project's frontend architecture
* do not copy Stitch-generated frontend code blindly

The goal is to reproduce the approved design using the project's own production architecture.

---

# 2. Screen-by-screen implementation

Never attempt to implement the entire Stitch project in one generation.

Implement one screen or one tightly related screen group at a time.

Recommended order:

1. App shell
2. Splash / loading
3. Home
4. Shop / PLP
5. Search
6. Product detail / PDP
7. Wishlist
8. Cart
9. Checkout
10. Order confirmation
11. Account
12. Orders
13. Address management
14. Supporting states

Do not move to the next major screen until the current screen has passed visual review.

---

# 3. Reference image workflow

When implementing a Stitch screen:

1. Open the approved Stitch design.
2. Export or capture the exact screen.
3. Provide the reference image to Antigravity.
4. Identify the intended viewport size.
5. Inspect the existing Ithihasa codebase.
6. Reuse existing components and tokens.
7. Implement the screen.
8. Run the application.
9. Capture the implemented screen at the same viewport.
10. Compare implementation against Stitch.
11. Correct visual differences.
12. Repeat until the implementation is visually faithful.
13. Only then continue to the next screen.

The reference image is authoritative for:

* layout
* hierarchy
* composition
* spacing relationships
* visual density
* imagery placement
* navigation placement
* typography hierarchy
* major interaction affordances

The codebase remains authoritative for:

* architecture
* state management
* API integration
* accessibility
* performance
* responsive behavior
* security
* reusable components

---

# 4. Do not redesign approved screens

When an approved Stitch screenshot is supplied, do not:

* redesign the layout
* substitute a generic ecommerce layout
* add cards that do not exist
* add unnecessary gradients
* add unnecessary animations
* change navigation structure
* introduce Material Design patterns
* replace the approved typography hierarchy
* replace the logo
* add decorative elements simply because they look impressive

Implement the design.

If a design appears technically problematic, identify the issue and propose the smallest implementation change that preserves the visual intent.

---

# 5. Do not blindly copy Stitch code

Stitch may generate frontend code.

Do not paste generated Stitch code directly into production merely because it visually resembles the design.

Instead:

```text
Stitch design
↓
visual reference
↓
Ithihasa component system
↓
production React implementation
```

Use existing:

* Button
* Sheet
* Drawer
* ProductCard
* ProductGallery
* Navigation
* Typography
* Skeleton
* Form
* Price
* Image
* layout components

where applicable.

---

# 6. Reuse before creating

Before creating a component:

1. Search the existing repository.
2. Determine whether an equivalent component already exists.
3. Reuse it if possible.
4. Extend it if necessary.
5. Create a new component only when the behavior is genuinely different.

Do not create:

```text
Button2
PremiumButton
LuxuryButton
GoldButton
NewButton
```

when one properly designed Button component can handle the variants.

---

# 7. Visual fidelity

Compare the implementation against the Stitch reference for:

### Layout

* section order
* widths
* heights
* spacing
* alignment
* image ratios
* navigation placement

### Typography

* font family
* weight
* size
* line height
* letter spacing
* capitalization

### Color

* background
* text
* gold
* borders
* overlays

### Components

* buttons
* cards
* navigation
* inputs
* sheets
* badges
* icons

### Motion

Only reproduce motion implied by the design.

Do not add random animations.

---

# 8. Responsive implementation

A Stitch screen may represent one viewport.

Do not hardcode the screenshot's dimensions.

Translate the visual design into responsive behavior.

Test:

```text
375px
390px
430px
768px
1024px
1440px
```

Preserve the visual hierarchy while adapting the layout.

Do not simply scale the entire design.

---

# 9. Screenshot validation

After implementing each screen, create screenshots at:

```text
375 × appropriate height
390 × appropriate height
430 × appropriate height
768px width
1440px width
```

Compare against the Stitch reference.

Check:

```text
Header
Navigation
Typography
Images
Spacing
Buttons
Cards
Bottom actions
Safe areas
```

Fix the largest visual mismatch first.

Do not spend time polishing tiny icon offsets while the overall composition is incorrect.

---

# 10. Mobile-first priority

The primary reference for Ithihasa is mobile.

The implementation must feel correct at:

```text
375px
390px
430px
```

before desktop refinement.

Never sacrifice mobile UX merely to reproduce a desktop composition.

---

# 11. Real assets

When the Stitch design uses:

* Ithihasa logo
* product images
* icons
* brand assets

use the actual project assets whenever available.

Do not replace the real Ithihasa logo with text.

Do not generate placeholder product photography when real product assets exist.

Do not use screenshots of the Stitch UI as production UI.

The screenshot is a reference, not an asset.

---

# 12. Placeholder handling

If the Stitch design contains an image that does not yet exist:

1. preserve the exact image dimensions/aspect ratio
2. preserve the composition
3. use an explicit temporary placeholder
4. do not invent a completely different visual direction

The placeholder must be easy to replace later.

---

# 13. Design drift prevention

After a screen is approved, extract reusable patterns from it.

For example:

```text
Home hero
↓
Hero component

Product grid
↓
ProductGrid component

Product card
↓
ProductCard component

Section heading
↓
SectionHeading component
```

Do not copy/paste the same visual structure into every page.

The first approved screens should progressively establish the Ithihasa design system.

---

# 14. Never compromise engineering for screenshot similarity

A screenshot is not permission to:

* hardcode content
* hardcode dimensions unnecessarily
* duplicate components
* bypass TypeScript
* bypass TanStack Query
* put server state in Zustand
* create inaccessible controls
* disable responsive behavior
* use enormous images
* introduce security problems

Visual fidelity and production engineering must both be satisfied.

---

# 15. Implementation prompt format

When beginning a screen, use this structure:

"Implement the attached Stitch screen as the next Ithihasa production screen.

Reference:
[attached Stitch screenshot]

Viewport:
[viewport size]

Requirements:

* Treat the screenshot as the approved visual reference.
* Follow the Ithihasa frontend skill.
* Inspect the existing code before creating components.
* Reuse existing components and tokens.
* Do not redesign the screen.
* Do not copy Stitch-generated code blindly.
* Use real Ithihasa assets from src/assets where available.
* Implement responsive behavior.
* Preserve accessibility.
* Preserve performance requirements.
* Do not introduce unnecessary dependencies.
* Run the application after implementation.
* Compare the implementation against the reference.
* Fix visual mismatches before considering the screen complete."

---

# 16. Definition of done

A screen is not complete merely because it compiles.

It is complete when:

* it matches the approved Stitch composition
* it uses Ithihasa design tokens
* it uses the real logo/assets
* it works at mobile widths
* it works at tablet widths
* it works at desktop widths
* interactions work
* loading state exists where required
* empty state exists where required
* error state exists where required
* accessibility is acceptable
* safe areas work
* performance is acceptable
* no unnecessary dependencies were introduced
* no duplicated components were created
* the final implementation has been visually compared against the Stitch reference

Only then proceed to the next screen.
