# GAMOIWERE - Expo React Native E-Commerce App

## Overview
GAMOIWERE is a React Native e-commerce mobile app built with Expo, targeting web, iOS, and Android platforms. The app features product browsing, shopping cart, user authentication, order management, user profiles, and Face ID/biometric authentication.

## Tech Stack
- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: expo-router with file-based routing
- **Backend**: Supabase (authentication, database)
- **UI**: React Native components, expo-linear-gradient, lucide-react-native icons
- **Authentication**: expo-local-authentication (Face ID/Touch ID), expo-apple-authentication
- **Secure Storage**: expo-secure-store for biometric credentials
- **State**: React hooks

## Design Theme
- Dark navy/purple gradient backgrounds (#0f0f1a → #16213e)
- Purple accents (#8b5cf6, #a78bfa)
- Glass-morphism effects with semi-transparent cards
- Purple glow orbs for ambient lighting

## Project Structure
```
app/                    # expo-router screens
  (tabs)/               # Bottom tab navigation screens
    index.tsx           # Home/products screen
    cart.tsx            # Shopping cart
    categories.tsx      # Product categories
    favorites.tsx       # Saved favorites
    orders.tsx          # Order history
    profile.tsx         # User profile
  auth/                 # Authentication screens
  product/              # Product detail screens
  order/                # Order detail screens
  profile/              # Profile editing screens
components/             # Reusable UI components
services/               # API and Supabase services
  api.ts                # Product/category API calls
  auth.ts               # Authentication service
  biometric.ts          # Face ID/biometric authentication
  cart.ts               # Cart management
  orders.ts             # Order management
  supabase.ts           # Supabase client setup
types/                  # TypeScript type definitions
assets/images/          # App images and icons
supabase/migrations/    # Database migration files
```

## Development
- **Dev Server**: `npm run dev` - runs Expo web on port 5000
- **Build Web**: `npm run build:web` - exports static web build to `dist/`
- **TypeCheck**: `npm run typecheck`

## Environment Variables
Required for Supabase connection:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment
Static web deployment with `dist/` as the public directory.

## Biometric Authentication
- After successful login, users are prompted to enable Face ID/Touch ID
- Biometric quick login available on subsequent app launches
- Auth token stored securely in expo-secure-store
- Token validated on each biometric login
- Logout clears all biometric credentials
