# RideReady brand guidelines

Source of truth for how RideReady looks and sounds. Code mirror: `apps/mobile/src/theme/index.ts`.
Change a color or font here first, then in the theme. All contrast ratios below are WCAG 2.1, computed.

## 1. Brand core

- **Name:** RideReady (one word, capital R twice). Never "Ride Ready", "Rideready" or "RR".
- **Tagline:** One garage. Every kilometer. Smarter ownership.
- **Promise:** a trustworthy history of every vehicle, turned into useful decisions.
- **Personality:** calm, precise, honest, quietly confident. A good mechanic who shows you the receipts,
  not a sports-car ad.

## 2. Voice and copy

| Do | Don't |
|---|---|
| "Needs two full fill-ups" | "0.0 L/100 km" (a fabricated number) |
| "Estimated from 3 services" | "Your bike needs a service" (when it's a guess) |
| "Couldn't save. Check your connection and try again." | "Error 500" / "Oops!" |
| Sentence case for titles and buttons: "Add to garage" | Title Case Everywhere, ALL CAPS |
| Kilometers and liters first; respect the user's units | Mixing units on one screen |

- Every number says how it was obtained when it isn't measured: **measured**, **calculated** or
  **estimated** (`MetricQuality` in `packages/core`). Missing data shows "—" plus what is needed.
- Buttons are verbs: "Log fuel", "Start trip", "Add vehicle".
- No emoji in UI copy or as icons.

## 3. Color

Violet-gray primary for identity and trust; teal secondary for "healthy / efficient"; amber tertiary
for reminders that need attention. Neutrals are tinted violet so the palette reads as one family.

### Light

| Role | Hex | Use | Contrast |
|---|---|---|---|
| primary | `#5B4F86` | Primary buttons, active tab, hero card, links | 7.2:1 on white |
| onPrimary | `#FFFFFF` | Text/icons on primary | — |
| primaryContainer | `#E9E5F3` | Selected cards, badges, icon chips | — |
| onPrimaryContainer | `#2E2650` | Text on primaryContainer | 11.2:1 |
| secondary | `#0F766E` | Positive/efficient states, quick actions | 5.5:1 on white |
| secondaryContainer | `#CCFBF1` | Quick-action icon tiles | — |
| onSecondaryContainer | `#134E4A` | Text/icons on secondaryContainer | 8.4:1 |
| tertiary | `#B45309` | Reminders, "due soon" | 5.0:1 on white |
| tertiaryContainer | `#FEF3C7` | Reminder icon tiles | — |
| onTertiaryContainer | `#78350F` | Text on tertiaryContainer | 8.2:1 |
| background | `#F8F7FB` | Screen background | — |
| surface | `#FFFFFF` | Cards, sheets | — |
| surfaceVariant | `#F0EEF5` | Subtle fills, neutral icon tiles | — |
| onSurface | `#1C1A24` | Body text | 16.1:1 on background |
| onSurfaceVariant | `#5A5668` | Secondary text, captions | 7.1:1 on surface |
| outline | `#8E889F` | Input borders, outlined buttons | 3.4:1 (UI ≥ 3:1) |
| outlineVariant | `#E6E3EE` | Card borders, dividers (decorative) | — |
| error | Paper MD3 default | Errors only, always with text | — |

### Dark

| Role | Hex | Contrast |
|---|---|---|
| primary | `#C7BEE6` | 10.7:1 on background |
| onPrimary | `#2A2347` | 8.4:1 on primary |
| primaryContainer / on | `#433A68` / `#E9E5F3` | 8.3:1 |
| secondary | `#5EEAD4` | 11.9:1 on surface |
| secondaryContainer / on | `#115E59` / `#CCFBF1` | 6.7:1 |
| tertiary | `#FBBF24` | 10.6:1 on surface |
| tertiaryContainer / on | `#78350F` / `#FEF3C7` | — |
| background | `#121019` | — |
| surface | `#1A1724` | — |
| surfaceVariant | `#262233` | — |
| onSurface | `#EEEDF3` | 16.2:1 on background |
| onSurfaceVariant | `#A9A4B8` | 7.3:1 on surface |
| outline / outlineVariant | `#6E6884` / `#2A2638` | 3.3:1 (UI) |

### Rules

- Screens use theme roles only (`useTheme().colors.*`); no hex literals outside `theme.ts`.
- Color never carries meaning alone: pair it with an icon or text (e.g. amber reminder + calendar icon
  + "Due in 300 km").
- Dark mode uses the tonal palette above, never inverted light colors. Test both.
- One primary-filled element per screen region (the hero card or the main CTA), not both competing.

### Brand surface

Gradient `#6B5E9C → #2E2650` (dark mode `#3F3569 → #16121F`), top-left to bottom-right, with the gauge
motif (concentric rings, white 6–8 %) bleeding off the top-right. Used for: sign-in hero, onboarding
header, dashboard header, splash (`#2E2650`) and app icon. Text on it: `#FFFFFF` (5.7:1 at the light
end), muted `#F0EEF7` (4.9:1), accent teal `#5EEAD4` for large text and graphics only (3.8:1).
Component: `components/brand/brand-gradient.tsx`; tokens `useAppTheme().brand`.

## 4. Typography

**Plus Jakarta Sans** (Google Fonts, OFL), loaded via `@expo-google-fonts/plus-jakarta-sans`. One file
per weight; Material 3 type roles map to weights:

| Roles | Weight | Typical use |
|---|---|---|
| display*, headline* | 700 Bold | Screen titles, vehicle name, big stat values |
| title* | 600 SemiBold | Card and section titles |
| label* | 500 Medium | Buttons, chips, tab labels, captions above values |
| body* | 400 Regular | Body copy, helper text |

- Body text ≥ 14 pt, never below 12 pt. Respect the system text size (no `allowFontScaling={false}`).
- Numbers that update or align (stats, costs, odometer) use tabular figures (`fontVariant: ['tabular-nums']`).

## 5. Iconography

- **Material Community Icons** only (`@expo/vector-icons`), through Paper's `Icon` / `icon=` props.
- Outline at rest, filled when active/selected (tab bar: `home-variant-outline` → `home-variant`).
- Sizes: 14 (inline badge), 18–22 (tiles, list leading), 24 (default), 36–56 (brand mark, heroes).
- Icons in tinted tiles: 44×44 (lists, choices) or 56×56 (quick actions), radius 12–18.
- **Logo mark:** a 240° gauge arc (white) with a check as its needle (teal `#5EEAD4`): "every kilometer"
  + "ready". Lives on brand surfaces only (gradient, app icon, splash). Source of truth:
  `docs/brand/render-brand-assets.mjs` renders the in-app mark, app icon, Android adaptive layers and
  splash; re-run it instead of editing PNGs. Minimum size 24 pt; keep clear space of ¼ its width.
- **Wordmark:** "Ride" Medium + "Ready" Bold, tracking −0.5; on brand surfaces "Ready" is teal,
  elsewhere primary. Component: `components/brand/wordmark.tsx`.
- Third-party marks (Google) follow the owner's guidelines; the monochrome `google` glyph is interim
  until the official "Sign in with Google" asset is added.

## 6. Shape, space, elevation

- **Spacing:** 4-pt grid. Screen padding 16 (dashboard) / 24 (forms, onboarding). Gaps 8 / 12 / 16 / 24.
- **Tokens:** `RADIUS` and `SPACE` in `src/theme/index.ts` carry these values; screens use them.
- **Radius:** 12 inputs and small tiles · 16 cards and choice cards · 24 hero and empty-state cards ·
  999 pills/badges.
- **Elevation:** flat by default. Cards = surface + 1 px `outlineVariant` border + Paper elevation 1.
  The hero card is flat primary. No heavy shadows or gradients.
- **Touch targets:** ≥ 48 dp; primary buttons 52 dp tall; 8 dp minimum between targets.

## 7. Components (React Native Paper, MD3)

| Pattern | Spec |
|---|---|
| Primary CTA | `Button mode="contained"`, pill, 52 dp, sentence case, verb first |
| Secondary | `Button mode="outlined"` with `outline` border, or text button |
| Inputs | Soft filled: label above the field, `surfaceVariant` fill, no border at rest, 2 dp `primary` ring on focus, radius 12 (`FormTextInput`, `DateField`). Error ring + message below on blur/submit |
| Form groups | `FormSection`: small title above a rounded card (radius 16, `outlineVariant` border) holding related fields |
| Choice | `ImageChoiceGrid` (radio semantics): two-column picture tiles (3D render + label + hint + check) for vehicle type, body style and powertrain |
| Vehicle art | `VehicleArt` (hero) / `VehicleThumb` (lists, chips): the vehicle's 3D render in its body style and paint (`vehicleImageOf`). Hero floats over a soft shadow, still under reduced motion. Paint picker: `ColorSwatches` (8 real-car colours, `theme/vehicle-paint.ts`). Renders: `docs/brand/vehicles` |
| Stat | `StatTile`: icon chip, label, value or "—" + what's needed |
| Empty state | Icon, one-line title, one-line explanation, one action |
| Feedback | `Snackbar` 3 s for transient notices; `HelperText` with live region for errors |
| Navigation | Floating pill tab bar (radius 28, elevation 3): Home, Garage, raised primary "+" (quick add), Insights, Assistant. Active tab: `secondaryContainer` circle (40 dp) behind the filled icon + semibold label. Hidden while the keyboard is open. Trips is opt-in. Home has no app bar (custom greeting header) |

## 8. Motion

150–300 ms, ease-out in / faster ease-in out, ripple on every tappable surface. Motion explains a change
(step transitions, sheet in/out); nothing decorative. Respect reduced-motion.

- **Content entrance:** cards and sections fade + rise 12 dp in 320 ms, staggered 60 ms top to bottom
  (`Appear` / `enterAt` in `components/ui/appear.tsx`; `Card`, `FormSection`, `ListGroup`, `InfoCard` do it
  themselves, pass `index` to stagger).
- **Vehicles:** `VehicleArt` drives in from the left on a spring (small overshoot, rocks level), then floats.
  A different vehicle or body style drives in again (key it by vehicle id where it can switch).
- **Charts:** bars grow from the baseline, 45 ms apart. **Tabs:** `animation: 'shift'`.
- All of it is skipped under the system reduced-motion setting (Reanimated `useReducedMotion` / layout
  animations' default).

## 9. Accessibility checklist

- Text ≥ 4.5:1, UI boundaries ≥ 3:1 in both themes (tables above).
- Every icon-only control has an `accessibilityLabel`; choices expose radio role and checked state.
- Errors are announced (`accessibilityLiveRegion="polite"`) and sit under their field.
- Content clears safe areas; forms sit in `KeyboardAvoidingView` + `ScrollView`.
