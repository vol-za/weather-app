# AGENTS.md

Guide for AI agents working in this codebase.

## Project Overview

**WeatherFX** - A premium full-stack Next.js 14+ web application featuring real-time weather data and currency exchange rates with subscription-based premium features.

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Auth**: Supabase Auth (Google OAuth + email/password)
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui
- **External APIs**: WeatherAPI.com, NBRB Exchange Rates

## Essential Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Prisma client (required after schema changes)
npm run db:push      # Push schema changes to database (development)
npm run db:migrate   # Run Prisma migrations
```

## Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints (profile)
│   │   ├── weather/       # Weather API (route.ts, forecast/)
│   │   ├── currency/      # Currency exchange rates
│   │   ├── stripe/        # Stripe checkout & webhooks
│   │   └── admin/         # Admin-only endpoints
│   ├── dashboard/         # Protected dashboard page
│   ├── admin/             # Admin panel
│   ├── pricing/           # Subscription plans & success page
│   └── auth/              # Auth pages (signin, callback, blocked, error)
├── components/
│   ├── ui/                # shadcn/ui components (do not modify)
│   ├── providers/         # React context providers
│   ├── weather/           # Weather-specific components
│   └── currency/          # Currency-specific components
├── lib/
│   ├── auth.ts            # Server-side auth (getAuth)
│   ├── auth-guards.ts     # Route protection utilities
│   ├── prisma.ts          # Prisma client singleton
│   ├── weather.ts         # WeatherAPI functions & types
│   ├── currency.ts        # NBRB API functions & types
│   ├── stripe.ts          # Stripe client & helpers
│   ├── utils.ts           # cn() utility for Tailwind
│   └── supabase/          # Supabase client creation
│       ├── server.ts      # Server component client
│       └── browser.ts     # Client component client
└── middleware.ts          # Auth middleware for protected routes
```

## Key Patterns & Conventions

### Path Aliases
- Use `@/` for imports from `src/`
- Example: `import { Button } from "@/components/ui/button"`

### Server vs Client Components
- **Server Components** (default): Pages, layouts, API routes
- **Client Components**: Add `"use client"` directive at top
- Client components needed for: useState, useEffect, event handlers, browser APIs
- Pattern: Server component pages pass data to client component wrappers (e.g., `page.tsx` → `*-client.tsx`)

### API Routes
- Use `NextRequest` and `NextResponse` from `next/server`
- Access search params via `request.nextUrl.searchParams`
- Always wrap in try/catch with proper error responses
- Example structure:
```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    // ... logic
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Message" }, { status: 500 })
  }
}
```

### Authentication Pattern
1. **Server-side auth**: Use `getAuth()` from `@/lib/auth`
2. **Client-side auth**: Use `useAuth()` hook from `AuthProvider`
3. **Route protection**: Use guards from `@/lib/auth-guards`:
   - `requireAuth()` - Redirects to signin if not authenticated
   - `requireAdmin()` - Redirects non-admins to dashboard
   - `requirePremium()` - Redirects to pricing if not premium

### Prisma Usage
- Import: `import { prisma } from "@/lib/prisma"`
- Singleton pattern prevents multiple connections in development
- Always run `npm run db:generate` after modifying `prisma/schema.prisma`

### Styling
- Use Tailwind CSS classes
- Use `cn()` utility for conditional class merging: `cn("base-class", condition && "conditional-class")`
- shadcn/ui components use CSS variables for theming (defined in globals.css)
- Dark mode via class strategy (managed by next-themes)

### Toast Notifications
```typescript
import { useToast } from "@/components/ui/use-toast"

const { toast } = useToast()
toast({
  title: "Success",
  description: "Action completed",
  variant: "destructive", // for errors
})
```

### Data Fetching
- Server components: Fetch directly with `fetch()` and use `next: { revalidate: seconds }` for caching
- Client components: Fetch from `/api/*` endpoints

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL           # PostgreSQL connection string
DIRECT_URL             # Direct connection for Prisma (Supabase/Pooler)

# Supabase (Auth)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Weather API
WEATHERAPI_KEY         # WeatherAPI.com API key

# Stripe
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID

# Admin
ADMIN_EMAIL            # Email address that gets ADMIN role

# App
NEXT_PUBLIC_APP_URL    # Public URL of the application
```

## Database Schema

Key models in `prisma/schema.prisma`:

- **User**: Core user data with subscription status, role, Stripe IDs
- **Account**: OAuth account links (Supabase-managed)
- **Session**: User sessions (Supabase-managed)
- **SavedCity**: User's saved/favorite cities

User roles: `USER`, `ADMIN`
Subscription status: `FREE`, `PREMIUM`

## Protected Routes

Defined in `src/middleware.ts`:
- `/dashboard` - Requires authentication
- `/admin/*` - Requires authentication (admin check in page)
- `/pricing/success` - Requires authentication

Blocked users are redirected to `/auth/blocked`

## External APIs

### WeatherAPI.com
- Used for weather data and forecasts
- Base URL: `https://api.weatherapi.com/v1/`
- Endpoints used: `/current.json`, `/forecast.json`
- 5-minute revalidation cache

### NBRB Exchange Rates
- National Bank of Belarus official rates
- Free, no API key required
- URL: `https://www.nbrb.by/api/exrates/rates?periodicity=0`
- 1-hour revalidation cache
- Premium users see all currencies; free users see major currencies only

## Stripe Integration

1. **Checkout**: POST to `/api/stripe/checkout` with `{ priceId }`
2. **Webhook**: Stripe posts to `/api/stripe/webhook`
   - Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Customer ID stored in `User.stripeCustomerId`
4. Subscription ID stored in `User.stripeSubscriptionId`

## Gotchas & Important Notes

1. **Supabase Auth**: Uses `@supabase/ssr` for SSR support. Always use the provided `createClient()` functions, not the standard Supabase client.

2. **Middleware Auth**: The middleware comment warns: "Avoid writing any logic between createServerClient and supabase.auth.getUser()" - this can cause random logout issues.

3. **Weather API Key**: The code uses `WEATHERAPI_KEY` but the `.env.example` shows `OPENWEATHERMAP_API_KEY`. The actual implementation uses WeatherAPI.com.

4. **No Tests**: No test framework is configured in this project.

5. **DB Migrations**: For production, use `npm run db:migrate`. For development, `npm run db:push` is faster.

6. **Server Actions**: Enabled with 2MB body size limit (see `next.config.mjs`).

7. **Image Domains**: Configured for `openweathermap.org` and `lh3.googleusercontent.com` in next.config.mjs, but weather icons come from WeatherAPI.com (CDN handles protocol).

8. **Admin Role**: First user with email matching `ADMIN_EMAIL` env var gets ADMIN role automatically.

## Common Tasks

### Adding a new API endpoint
1. Create `src/app/api/[endpoint]/route.ts`
2. Export async function for HTTP method (GET, POST, etc.)
3. Add auth check if needed: `const session = await getAuth()`
4. Return `NextResponse.json()` with appropriate status

### Adding a new page
1. Create directory in `src/app/[route]/`
2. Create `page.tsx` (Server Component)
3. For interactive pages, create `*-client.tsx` for client logic
4. Add to protected routes in `middleware.ts` if authentication required

### Adding a new UI component
1. If using shadcn/ui pattern: Add to `src/components/ui/`
2. If domain-specific: Add to appropriate subfolder (`weather/`, `currency/`)
3. Use `cn()` for class composition
4. Export from component file

### Modifying database schema
1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma client
3. Run `npm run db:push` (dev) or `npm run db:migrate` (production)
4. Update related TypeScript types if needed
