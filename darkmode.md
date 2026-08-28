---
name: Ithihasa Nocturne
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cac6bc'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#949088'
  outline-variant: '#49473f'
  surface-tint: '#cac6be'
  primary: '#ffffff'
  on-primary: '#32302a'
  primary-container: '#e7e2d9'
  on-primary-container: '#67645d'
  inverse-primary: '#615e57'
  secondary: '#ebc166'
  on-secondary: '#402d00'
  secondary-container: '#765700'
  on-secondary-container: '#facf73'
  tertiary: '#ffffff'
  on-tertiary: '#33302c'
  tertiary-container: '#e9e1dc'
  on-tertiary-container: '#68635f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e7e2d9'
  primary-fixed-dim: '#cac6be'
  on-primary-fixed: '#1d1c16'
  on-primary-fixed-variant: '#494740'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#ebc166'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#e9e1dc'
  tertiary-fixed-dim: '#ccc5c0'
  on-tertiary-fixed: '#1e1b18'
  on-tertiary-fixed-variant: '#4a4642'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  ink-deep: '#0A0A0A'
  ink-raised: '#141210'
  ink-elevated: '#1A1714'
  ink-line: '#262220'
  parchment: '#F4EFE6'
  gold-accent: '#C9A24B'
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

This design system is a premium dark mode evolution of the heritage aesthetic, pivoting from the warmth of daylight parchment to the depth of "Ink." The brand personality is one of **Quiet Luxury**—sophisticated, moody, and intentionally restrained. It targets an ultra-high-end demographic that values exclusivity and the tactile quality of a digital "nighttime" experience.

The design style is a blend of **Minimalism** and **High-Contrast Editorial**. It utilizes expansive dark space to create an atmosphere of intimacy and focus. The aesthetic mimics a high-end fashion PWA at night, where the interface recedes into the background, allowing high-fidelity photography and refined typography to command attention. Every interaction should feel deliberate and smooth, evoking the silent grace of a luxury atelier after hours.

## Colors

The palette is built on a foundation of "Ink"—a series of warm, deep blacks that provide depth without the sterile feel of pure hex black.

- **Ink Deep (#0A0A0A):** The base atmospheric color for the canvas.
- **Parchment (#F4EFE6):** Used for all primary content and typography. This low-contrast off-white reduces eye strain in dark environments while maintaining a sense of historical luxury.
- **Gold (#C9A24B):** Retained as a signature brand accent. It is used sparingly for micro-interactions, active states, and premium signifiers.
- **Tonal Tiers:** Surface depth is achieved through `Ink-raised` and `Ink-elevated` rather than shadows. 
- **Ink-line (#262220):** A subtle, low-contrast shade for structural dividers and borders, ensuring the UI remains architectural but never aggressive.

## Typography

The typographic tension remains the core of the visual identity. 

**EB Garamond** serves as the display face, providing a classic, literary authority. It should be used for storytelling, product names, and section headers. **Manrope** provides the functional counterpoint, ensuring that utility-driven elements (prices, labels, and navigation) are legible and modern. 

In this dark variant, line-heights are intentionally generous (1.6x) to allow the "Ink" background to flow through the text, preventing the "vibration" often associated with high-contrast light text on dark backgrounds. `label-caps` should always use wide letter-spacing to emphasize the premium, spaced-out editorial look.

## Layout & Spacing

The system follows a strict **4px rhythmic grid**. 

Layouts are **fixed-grid** for desktop (max-width 1440px) to maintain editorial control over image aspect ratios and text alignment. Mobile layouts use a fluid 4-column structure with generous 20px side margins. 

The philosophy of "The Void" is critical: use the `xxl` (64px) token between major thematic blocks. The negative space in this design system is not "empty"—it is part of the luxury experience, acting as a buffer that forces the user to slow down and appreciate the content.

## Elevation & Depth

This design system rejects physical shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Tiering:** The background is `Ink-deep`. Cards, containers, and secondary sections rise to `Ink-raised` or `Ink-elevated`. These subtle shifts in lightness create a hierarchy of focus without breaking the flat, sophisticated aesthetic.
- **Glassmorphism:** Navigation bars and top headers use a 20px backdrop blur with a 70% opacity `Ink-raised` fill. This creates a "smoked glass" effect that feels expensive and modern.
- **Dividers:** Boundaries are defined by 1px solid lines in `Ink-line`. They should be used sparingly to separate distinct content groups without creating visual cages.

## Shapes

The shape language is strictly **Sharp (0px)**. 

All UI elements—from primary call-to-action buttons to product thumbnails—feature 90-degree corners. This uncompromising geometry reflects the precision of architectural tailoring and creates a sense of structural permanence. The sharpness reinforces the "heritage" aspect of the brand, contrasting against the fluidity of the typography.

## Components

### Buttons
- **Primary:** `Parchment` background with `Ink-deep` text. Sharp corners. Label set in `label-caps`.
- **Secondary:** Transparent background with a 1px `Parchment` border.
- **Tertiary/Ghost:** `Gold` text with no border, used for subtle "Read More" or "Explore" actions.

### Input Fields
- **Underline Style:** A single 1px line in `Ink-line` that transitions to `Gold` upon focus. 
- **Typography:** Placeholder text in `Parchment` at 40% opacity. Labels float in `label-caps` when the field is active.

### Cards
- **Product Cards:** No borders or shadows. Use `Ink-raised` as a background if the card contains text, otherwise, images should bleed to the edge. On hover, the image should slightly desaturate to emphasize the `Parchment` typography.

### Navigation
- **Top Header:** Smoked-glass effect using backdrop blur. The logo is centered and rendered in `Parchment`.
- **Mobile Navigation:** Fixed at the bottom, 64px height. Icons use a 1px stroke. The active state is a `Gold` 2px dot centered below the icon.

### Selection Controls
- **Checkboxes/Radios:** Square (0px radius) with a 1px `Parchment` border. When selected, they fill with `Gold` and a small `Ink-deep` checkmark or dot.