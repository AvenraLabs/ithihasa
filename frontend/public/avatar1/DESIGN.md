---
name: Ithihasa Heritage
colors:
  surface: '#fff8f1'
  surface-dim: '#e2d9ca'
  surface-bright: '#fff8f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e3'
  surface-container: '#f6eddd'
  surface-container-high: '#f0e7d8'
  surface-container-highest: '#ebe1d2'
  on-surface: '#1f1b12'
  on-surface-variant: '#444748'
  inverse-surface: '#343026'
  inverse-on-surface: '#f9f0e0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#615e57'
  on-secondary: '#ffffff'
  secondary-container: '#e7e2d9'
  on-secondary-container: '#67645d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261a00'
  on-tertiary-container: '#a27f2b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e7e2d9'
  secondary-fixed-dim: '#cac6be'
  on-secondary-fixed: '#1d1c16'
  on-secondary-fixed-variant: '#494740'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#ebc166'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#fff8f1'
  on-background: '#1f1b12'
  surface-variant: '#ebe1d2'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.02em
  title-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  margin-mobile: 20px
  margin-desktop: 80px
  gutter: 16px
---

## Brand & Style

The design system is rooted in the concept of "Quiet Luxury"—a philosophy that prioritizes material quality and structural grace over loud ornamentation. It targets a discerning audience seeking heritage fashion through a lens of modern editorial excellence.

The aesthetic combines **Minimalism** with **High-Contrast Editorial** influences. The UI is designed to feel like a high-end physical lookbook, utilizing expansive whitespace to allow product photography to serve as the primary visual driver. Interactions are fluid and intentional, evoking the tactile sensation of browsing a premium atelier.

## Colors

This design system utilizes a restrained, tonal palette to maintain a sense of timelessness.

- **Ink (#0A0A0A):** The primary color for typography, iconography, and high-emphasis structural elements. It provides a deep, authoritative contrast against the background.
- **Parchment (#F4EFE6):** The core background color. Unlike pure white, this off-white shade adds warmth and suggests organic, high-quality materials like cotton or vellum.
- **Gold (#C9A24B):** Reserved strictly for key actions, brand signatures, and premium indicators. It should never exceed 5% of any screen's visual area.
- **Parchment Dim (#B8B0A2):** Used for secondary text, subtle borders, and disabled states. It provides soft differentiation without breaking the monochromatic harmony.

## Typography

The typographic hierarchy relies on the tension between a classical serif and a contemporary sans-serif.

- **Display & Headlines:** Set in **EB Garamond** (as a proxy for refined heritage serifs). Large headings should use tight letter-spacing to feel cohesive, while smaller sub-heads use increased tracking for an editorial "spaced out" look.
- **Functional UI & Body:** Set in **Manrope**. This provides a clean, neutral balance to the expressive serif. 
- **Text Ratios:** Use generous line-heights (1.5x - 1.6x) for body copy to enhance readability and reinforce the feeling of "air" in the design.

## Layout & Spacing

This design system operates on a rigorous **4px grid**. 

- **Philosophy:** Whitespace is treated as a design element itself, not just "empty" space. Layouts should feel expansive.
- **Mobile:** A 4-column fluid grid with 20px side margins. 
- **Desktop:** A 12-column fixed grid (max-width 1440px) with 80px margins. 
- **Vertical Rhythm:** Use the `xxl` (64px) spacing token between major sections to maintain the editorial cadence. Elements within a group (e.g., product title and price) should use `xs` or `sm` tokens to maintain proximity.

## Elevation & Depth

To maintain the "Quiet Luxury" aesthetic, shadows are almost entirely avoided.

- **Tonal Layers:** Depth is achieved through color-blocking. The primary surface is `Parchment`, while `Ink` surfaces are used for high-contrast callouts.
- **Low-Contrast Outlines:** Use 1px borders in `Parchment Dim` to define UI boundaries without creating visual noise.
- **Glassmorphism:** Reserved exclusively for the mobile navigation bar and top headers. Use a heavy backdrop blur (20px) with a 90% opacity `Parchment` tint to ensure content remains legible while scrolling.
- **Z-Index:** Bottom sheets and modals do not use heavy shadows; instead, they use a soft `Ink` backdrop dimming (40% opacity) to focus user attention.

## Shapes

The shape language is **Sharp (0px)**. 

All buttons, input fields, product cards, and images must feature crisp, 90-degree corners. This evokes the precision of high-end tailoring and the structured nature of architectural design. The only exception is the "Signature Swash" motif, which provides a single, flowing organic counterpoint to the otherwise rigid geometry.

## Components

### Buttons
- **Primary:** Solid `Ink` background, `Parchment` text, sharp corners. High tracking for `label-caps`.
- **Secondary:** Transparent background, 1px `Ink` border.
- **Ghost:** Transparent background, `Ink` text, underlined on hover.

### Product Cards
- **Structure:** Zero border, no shadow. The image fills the container width. 
- **Interaction:** On hover (desktop) or tap-hold (mobile), the primary image fades to a secondary "detail" or "lifestyle" shot. 
- **Typography:** Product names in `EB Garamond`, prices in `Manrope` for clarity.

### Bottom Navigation (Mobile)
- Fixed height of 64px. Semi-transparent `Parchment` with backdrop blur.
- Icons are minimal, 1px stroke weight in `Ink`. 
- Active state indicated by a subtle `Gold` dot below the icon.

### Bottom Sheets
- Triggered for filters and product options.
- Features a signature `Parchment` background and a simple 1px horizontal line at the top as a "drag handle."
- Full-width `Primary` button at the base of the sheet for confirmation.

### Input Fields
- Underline style only. A 1px `Parchment Dim` line that turns `Ink` on focus.
- Labels use `label-caps` typography and float above the line when active.