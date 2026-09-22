# Vandor (Vendor App)

Vendor-side mobile app for Ngi-La, built with **Expo** (React Native + TypeScript),
**NativeWind** (Tailwind CSS for React Native), and **React Navigation**.

## What's implemented

- **Splash screen** — brand mark on a sunset gradient, shown while a persisted session is
  checked, before routing to Auth or the main app.
- **Register** — Full names, Gender, Phone Number, Email, Password, Terms & Conditions checkbox.
- **Login** — Phone or Email + Password.
- **Session persistence** — a successful login/register stores a session (via AsyncStorage) that
  stays valid for **12 hours**; after that it expires and the app returns to Login.
- **Main tabs** — Dashboard (Home), My Spaza (vendor profile), Profile (account info + logout).
- **Design system** — colors/tokens lifted directly from the provided CSS variables (warm
  terracotta primary, cream background, deep ink text, soft sand neutrals), wired into
  `tailwind.config.js` + `global.css`, with light/dark variants.
- **Glassmorphism** — a reusable `GlassCard` (blurred, translucent, soft-bordered) used across
  auth forms and content cards.
- **Real NGiLA logo** — wired in from the provided `assets/logo.png`. It's cropped into two
  variants at build time: `assets/icon-mark.png` (icon-only, transparent) for compact headers and
  app icons, and `assets/logo-full.png` (mark + "NGiLA" wordmark + tagline, trimmed) for the splash
  screen. `<Logo variant="mark" | "full" size={n} />` picks between them.

There is **no real backend yet** (`/backend` is empty), so `src/api/auth.ts` simulates
login/register with a network delay and returns a mock session. The shapes match what a real API
should return, so swapping in real `fetch`/axios calls later shouldn't require touching the UI.

## Project structure

```
vandor/
├── App.tsx              # Root: providers + navigation
├── index.ts              # Expo/React Native entry point
├── app.json              # Expo app config
├── global.css             # Tailwind directives + design tokens (CSS vars)
├── tailwind.config.js     # Tailwind/NativeWind theme, colors reference global.css vars
├── babel.config.js / metro.config.js  # NativeWind wiring
├── assets/                # App icon / splash images used by app.json
└── src/
    ├── api/               # auth.ts — mock auth calls (swap for real API later)
    ├── assets/             # In-app images, fonts, etc.
    ├── components/         # Logo, GlassCard, PrimaryButton, TextField, GenderSelect, Checkbox
    ├── hooks/              # useAuth()
    ├── layout/             # ScreenContainer, TabNavigator (Dashboard/My Spaza/Profile)
    ├── lib/                # storage.ts (AsyncStorage session helpers), queryClient.ts (placeholder)
    ├── pages/              # Splash, Auth/Login, Auth/Register, Dashboard, MySpaza, Profile
    ├── router/             # RootNavigator (splash/auth/main switch), AuthNavigator, types
    ├── store/              # AuthContext — session state, login/register/logout
    ├── styles/             # theme.ts — raw color/gradient values for JS (SVG, gradients)
    ├── types/              # Shared TypeScript types (VendorUser, AuthSession, etc.)
    └── utils/              # Helper functions
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- The **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

## Getting started

1. Install dependencies:

   ```bash
   cd frontend/mobile/vandor
   npm install
   ```

2. Start the dev server:

   ```bash
   npm start
   ```

3. Run it:

   - **On your phone:** open Expo Go and scan the QR code.
   - **Android emulator:** `npm run android`
   - **iOS simulator (macOS only):** `npm run ios`
   - **Web:** `npm run web`

## Notes

- No native `android`/`ios` folders exist yet — this is a managed Expo project. Run
  `npx expo prebuild` when you need custom native modules, or use
  [EAS Build](https://docs.expo.dev/build/introduction/) for cloud builds.
- TypeScript strict mode is on.
- Colors: the palette you provided was authored in OKLCH; it's been converted to sRGB hex/RGB
  because React Native's styling layer doesn't understand `oklch()`. Values live in `global.css`
  as `--variable: R G B;` triplets, referenced from `tailwind.config.js` as
  `rgb(var(--x) / <alpha-value>)` so opacity modifiers (e.g. `bg-primary/50`) still work.
- Gender is a simple 3-way segmented control rather than a native picker, to avoid pulling in an
  extra native dependency for the initial scaffold.
