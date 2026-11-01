# Mobile (apps/mobile)

Expo-specific guidance is in `apps/mobile/AGENTS.md` (imported from CLAUDE.md). In this repo run its
commands through pnpm from `apps/mobile`: `pnpm expo install <pkg>` for RN/Expo packages (plain
`pnpm add` only for pure-JS libs), `pnpm exec tsc --noEmit`, `npx expo-doctor`.

## Code organization — one concern per file

```
src/
  app/                       routes only: compose feature components, no logic, no fetch, no constants
  api/                       every network call. client.ts (fetch + cookie, ApiError),
                             <resource>.api.ts (typed functions), auth.api.ts (Better Auth wrapped
                             to throw), query-keys.ts
  hooks/                     cross-feature hooks: TanStack queries/mutations (use-vehicles.ts,
                             use-auth-actions.ts, use-complete-onboarding.ts), use-app-ready.ts
  stores/                    Zustand stores for app-wide client state (*.store.ts): garage (selected
                             vehicle), toast, trip-recorder (GPS recording survives tab switches)
  schemas/                   zod form schemas shared by more than one feature (vehicle.schema.ts)
  features/<feature>/
    components/              that feature's UI pieces, one component per file
    hooks/                   that feature's logic (use-onboarding-flow.ts, use-quick-actions.ts)
    <feature>.schemas.ts     zod form schemas + inferred types
  components/ui/             shared presentational components (form-text-input, info-card, …)
  components/brand/          logo-mark, wordmark, brand-gradient
  constants/                 static display data (vehicles.ts: labels/icons per core union value)
  utils/                     pure functions (greeting.ts)
  lib/                       singletons: auth-client.ts, query-client.ts
  theme/                     MD3 + brand tokens, fonts, useAppTheme()
```

- A route file over ~80 lines, or one holding constants, helpers or fetch calls, gets split: UI
  pieces → `features/<f>/components`, logic → `features/<f>/hooks`, data → `api/` + `hooks/`.
- Components never call `fetch` or `authClient.signIn…` directly; they use a hook that wraps `api/`.
- Constants live next to their feature, or in `constants/` when shared. Pure helpers go in `utils/`.
- Feature code may import shared folders; shared folders never import from `features/`.

## State — pick by kind, not by habit

| State | Tool | Example |
|---|---|---|
| Server data (anything from the API) | TanStack Query `useQuery`/`useMutation` in `hooks/` | vehicles, sign-in, onboarding save |
| Form fields, validation, submit | react-hook-form + `zodResolver` | sign-in/up, onboarding |
| App-wide client state | Zustand store in `stores/` | selected vehicle, toast message |
| Session / current user | `authClient.useSession()` | name, `onboardedAt` |
| Local, purely visual toggles | `useState` | menu open, show password, step index |

- `useState` is the last resort, only for a single component's visual toggle. Never use it for
  fetched data, loading/error flags (Query has them), form fields (RHF has them), or anything two
  components share (Zustand).
- No new React Context for state; Context is only for providers libraries need (Query, Paper).
- Query keys come from `api/query-keys.ts`; mutations invalidate the keys they change.
- Vehicle records (odometer, fuel, charging, maintenance, expenses) go through `recordsApis` in
  `api/records.api.ts` and `useVehicleRecords` / `useCreateRecord` (`hooks/use-vehicle-records.ts`).
  Request bodies mirror `apps/api/src/modules/<feature>/<feature>.schema.ts`; response types live in
  `@ride-ready/core`. Decimals arrive as strings: convert with `utils/numbers.ts`, never in components.
- Dashboard numbers come from `@ride-ready/core` functions via `features/dashboard/utils/metrics.ts`;
  a missing input shows "—" plus what's needed, never 0.
- Links go through `constants/routes.ts` (the only place with `as Href` casts). Log screens create with
  `/log/<screen>`, create for a given vehicle with `?vehicleId=`, edit with `?vehicleId=&id=`; all of it
  is handled by `features/logging/hooks/use-log-record.ts` (pass `clearable` keys so emptied optional
  fields are sent as `null` on PATCH).
- Receipt reading is on-device, no server AI: `lib/ocr.ts` (`expo-text-extractor`: Apple Vision / ML Kit,
  loaded lazily so Expo Go doesn't crash) → core `readReceiptText` → `features/documents/utils/
  draft-from-extraction.ts` → `stores/log-draft.store.ts` → the log form prefills and shows "check every
  value". Photos only (no PDFs). Nothing read is saved without the user confirming the form.
  `canReadText()` is false in Expo Go: scanning stops before the camera with a message. Test it in the dev
  build (`expo-dev-client`): `npx expo run:android --no-bundler` with `JAVA_HOME` = Android Studio's `jbr`
  and `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`; the generated `android/` stays gitignored.
- Uploads go straight to storage with a URL signed for the exact size and type: declare the size of the
  bytes being sent (`blob.size`), never the picker's `fileSize`. Phones need `S3_PUBLIC_ENDPOINT` = the
  PC's LAN address in `apps/api/.env`.
- Logging is scan-first: Home has one row, "Scan receipt" + from-photos (`useQuickScan`: photo → receipt
  document → read → prefilled form). Typing it in is the tab bar "+" → `quick-add` sheet (same log forms, plus
  "Scan a receipt instead"). Don't add a second "Add" button on Home. The odometer lives in `VehicleHero`
  (tap → `/log/odometer`); the hero shows no badge pills, just name, "year · powertrain" and the odometer row.
  Forms show essentials only; optional fields go in `components/ui/more-details.tsx`. Defaults come from
  `hooks/use-last-used.ts` (currency, station, workshop, last odometer). Fuel needs any two of liters /
  price / total (`completeFuelAmounts` in core fills the third).
- Modal screens get `<CloseButton />` as `headerLeft`; scroll views with inputs use
  `keyboardDismissMode="on-drag"`; destructive actions go through `ConfirmDialog`.
- Sign-out and account deletion clear the query cache (`authApi`) so one user's data never shows for the next.
- Preferences live on the account (`User.preferences`): read with `usePreferences()`, write with
  `useUpdatePreferences()` (`hooks/use-preferences.ts`); never in device storage.
- Currency comes from the profile only: `useCurrency()` (profile, else the phone's region). Forms never
  ask for it; new records use it, edited records keep their own. Receipt drafts don't override it.
- Profile tab = `ProfileHeader` + `ProfileSettings` (`components/ui/list-group.tsx` rows); each row opens
  one modal edit screen in `src/app/account/*` (`AccountScreen` frame, forms take `onDone`).
- Motion: brand guide §8. New screens wrap their blocks in `Appear index={n}` (or use `Card`/`FormSection`/
  `ListGroup` with `index`); cars always go through `VehicleArt`. Never animate width/height, only transform/opacity.
- Insights is laid out like Home: `BrandHeader` band (vehicle + `PeriodPills`), first card overlapping it
  (`marginTop: -BRAND_OVERLAP`). Insights cards match Home: `components/ui/card.tsx`, `stat-columns.tsx`, `bar-chart.tsx`. Numbers come
  from `/stats` (`details` = core `statsDetails`, `previous` = `previousStats`); "vs previous" notes via
  `features/insights/utils/change.ts`, never computed in components.
- Profile (`src/app/profile.tsx`, `features/profile`) and family (`src/app/family/`, `features/family`,
  `src/app/invite/[id].tsx`) use Better Auth client calls wrapped in `api/auth.api.ts` / `api/family.api.ts`.
  Invites are QR codes / `rideready://invite/<id>` links (`inviteLink`); a `shared` vehicle hides edit/delete.

## Brand and UI

- Visual rules live in `docs/brand-guidelines.md`; change colors there first, then `src/theme/index.ts`.
- Brand surfaces (sign-in hero, onboarding header, dashboard header) use `BrandGradient` +
  `LogoMark`/`Wordmark` and `useAppTheme().brand.*` tokens (onBrand, onBrandMuted, accent).
- UI library is **React Native Paper (MD3)**; reuse `components/ui/*` before writing new pieces.
- Colors via `useAppTheme().colors|brand`. No hex literals outside `src/theme/`.
- Font is Plus Jakarta Sans via Paper type roles; use `Text variant=...`, `FONT_ASSETS` for non-Paper text.
- Icons: MaterialCommunityIcons names through Paper (`@expo/vector-icons` stays a direct dependency).
  Brand artwork is rendered by `docs/brand/render-brand-assets.mjs`; never hand-edit the PNGs.
  Vehicle/powertrain 3D renders (`assets/images/vehicles/*.webp`) come from `docs/brand/vehicles/`; images per
  core value live in `constants/vehicles.ts` (`vehicleImageOf(v)` = body style + paint, table in generated
  `constants/vehicle-images.ts`). Show a vehicle with `<VehicleArt>` (big) or `<VehicleThumb>` (inline), never a
  generic car icon. Pick type/body style/powertrain with `ImageChoiceGrid`, paint with `ColorSwatches`; send
  `bodyStyle: bodyStyleOf(values)` so it always matches the type.
- Keep screens quiet: no badge pills for facts (use one muted "year · powertrain" line), one place per fact,
  edit in the header (pencil), destructive actions at the bottom of the edit screen.
- Mobile only: no `.web.tsx`, no `react-native-web`; `app.json` `platforms` is ios + android.
- Safe areas, forms in `KeyboardAvoidingView` + `ScrollView`, touch targets ≥ 48 dp,
  `accessibilityLabel` on icon-only controls.

## Forms

- Schema in `features/<f>/<f>.schemas.ts`; form via `useForm({ resolver: zodResolver(schema),
  mode: 'onTouched' })`; inputs via `components/ui/form-text-input.tsx` (errors under the field after
  blur/submit). Strip UI-only fields (e.g. `confirmPassword`) before sending. The API re-validates.
- Call `handleSubmit(fn)()` inside an arrow when passing to RN `onPress` (RN events aren't DOM events).
- React Compiler is on: never write `state!.id` for nullable state/props inside a callback. The compiler
  reads `state.id` during render as a memo dependency and crashes while it's null (family dialogs did).
  Guard instead: `() => { if (!state) return; act(state.id); }`.

## Navigation

- Root `src/app/_layout.tsx`: providers + `Stack.Protected` guard. Signed out → `sign-in`; signed in
  without `user.onboardedAt` → `onboarding`; otherwise `(tabs)`.
- After a server change to the user call `refreshSession()` (`lib/auth-client.ts`).
- Three bottom tabs: Home, Garage, Insights (`TABS` in `src/app/(tabs)/_layout.tsx`; the Assistant tab was removed
  2026-10-30 with the server AI, until on-device generative AI is available in Expo), drawn by the
  floating pill bar `components/navigation/tab-bar.tsx` with a raised center "+" (opens `quick-add`). Trips is
  opt-in (off by default, `usePreferences().tripsEnabled`, toggled in the account menu or Profile); when on it shows
  as a Home quick action and on the vehicle page, and opens `src/app/trips.tsx`. Decision 2026-10-30:
  deviates from plan §4 because most owners never record GPS trips.

## Auth and config

- Single auth client `lib/auth-client.ts` (Better Auth + expo plugin, SecureStore,
  `inferAdditionalFields` mirroring the API). Its `scheme` must equal `app.json` `scheme` (`rideready`).
- API base URL is `EXPO_PUBLIC_API_URL` (`apps/mobile/.env`). Public — never put secrets in `EXPO_PUBLIC_*`.
