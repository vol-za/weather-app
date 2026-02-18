# Weather & Currency Dashboard

A premium full-stack Next.js 14+ web application featuring real-time weather data and currency exchange rates with subscription-based premium features.

## Features

### 🌤️ Real-time Weather
- Search by city name or use geolocation
- Current conditions: temperature, feels-like, humidity, wind speed, pressure
- 5-7 day weather forecast
- Weather icons and condition descriptions
- Premium: Extended forecast (7 days vs 5 for free users)

### 💱 Currency Exchange Rates
- Official daily rates from National Bank of Belarus (NBRB)
- Major currencies: USD, EUR, RUB, PLN, and more against BYN
- Currency converter between any supported currencies
- Premium: More currencies and conversion history

### 🔐 Authentication
- Google OAuth via NextAuth.js
- Protected dashboard routes
- Session management with JWT tokens

### 💳 Premium Subscription
- Free tier: Basic weather + currency features
- Premium tier: Extended forecast, more saved cities, ad-free experience
- Stripe Checkout for secure payments
- Monthly and annual subscription options
- Webhook-based subscription status updates

### 👨‍💼 Admin Panel
- User management dashboard
- View/search all registered users
- Manually update subscription status
- Block/unblock users
- Usage statistics

### 🎨 UI/UX
- Modern, clean design with Tailwind CSS
- shadcn/ui components for consistent styling
- Dark/light/system theme toggle
- Fully responsive (mobile + desktop)
- Toast notifications for user feedback
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Auth**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui
- **APIs**: OpenWeatherMap, NBRB Exchange Rates

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud Console account (for OAuth)
- Stripe account
- OpenWeatherMap API key

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd weather-app
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/weather_dashboard?schema=public"
```

#### NextAuth Configuration
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate a secret:
```bash
openssl rand -base64 32
```

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/)
2. Get your free API key
3. Add to environment:

```env
OPENWEATHERMAP_API_KEY="your-openweathermap-api-key"
```

#### Stripe Configuration
1. Create account at [Stripe](https://stripe.com/)
2. Get API keys from Dashboard > Developers > API Keys
3. Create products and prices:

```bash
# Using Stripe CLI
stripe login
stripe products create --name="Premium Monthly" 
stripe prices create --product=<product-id> --unit-amount=999 --currency=usd --recurring[interval]=month
stripe prices create --product=<product-id> --unit-amount=9999 --currency=usd --recurring[interval]=year
```

4. Set up webhook:
   - Go to Dashboard > Developers > Webhooks
   - Add endpoint: `http://localhost:3000/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy signing secret

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."
```

#### Admin Configuration
```env
ADMIN_EMAIL="your-email@example.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

Initialize the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
weather-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   │   ├── weather/              # Weather API routes
│   │   │   ├── currency/             # Currency API routes
│   │   │   ├── stripe/               # Stripe routes
│   │   │   └── admin/                # Admin API routes
│   │   ├── dashboard/                # Protected dashboard
│   │   ├── pricing/                  # Subscription plans
│   │   ├── admin/                    # Admin panel
│   │   ├── auth/                     # Auth pages
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── providers/                # Context providers
│   │   ├── header.tsx                # App header
│   │   ├── theme-toggle.tsx          # Theme switcher
│   │   ├── user-menu.tsx             # User dropdown
│   │   ├── weather/                  # Weather components
│   │   └── currency/                 # Currency components
│   └── lib/
│       ├── auth.ts                   # NextAuth config
│       ├── auth-guards.ts            # Auth utilities
│       ├── prisma.ts                 # Database client
│       ├── weather.ts                # Weather API functions
│       ├── currency.ts               # Currency API functions
│       ├── stripe.ts                 # Stripe functions
│       └── utils.ts                  # Utility functions
├── .env.example                      # Environment template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes (dev)
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Update these for production:
- `NEXTAUTH_URL` - Your production URL
- `DATABASE_URL` - Production database connection
- `STRIPE_SECRET_KEY` - Live Stripe key (sk_live_...)
- `STRIPE_PUBLISHABLE_KEY` - Live Stripe key (pk_live_...)
- `NEXT_PUBLIC_APP_URL` - Production URL

### Post-Deployment

1. Update Google OAuth redirect URI to production URL
2. Add Stripe webhook endpoint for production
3. Update Stripe price IDs if using live mode

## API Reference

### Weather Endpoints

```
GET /api/weather?city={cityName}
GET /api/weather/forecast?city={cityName}
```

### Currency Endpoints

```
GET /api/currency
GET /api/currency/convert?from={from}&to={to}&amount={amount}
```

### Stripe Endpoints

```
POST /api/stripe/checkout     # Create checkout session
POST /api/stripe/webhook      # Stripe webhook handler
```

### Admin Endpoints

```
GET  /api/admin/users         # List users (paginated)
GET  /api/admin/stats         # Dashboard statistics
PATCH /api/admin/users/[id]   # Update user
DELETE /api/admin/users/[id]  # Delete user
```

## Subscription Tiers

| Feature | Free | Premium |
|---------|------|---------|
| Current Weather | ✅ | ✅ |
| 5-Day Forecast | ✅ | ✅ |
| 7-Day Forecast | ❌ | ✅ |
| Currency Rates | ✅ | ✅ |
| Currency Converter | ✅ | ✅ |
| Saved Cities | 3 | Unlimited |
| Ad-Free | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

## License

MIT
