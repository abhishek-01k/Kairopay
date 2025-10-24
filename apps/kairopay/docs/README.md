# KairoPay Documentation

KairoPay is a non-custodial crypto payment gateway that lets merchants accept payments in any crypto asset on any chain.

## 📚 Documentation

- **[API Reference](./api.md)** - Complete API documentation with examples
- **[Dashboard APIs](./dashboard-apis.md)** - Merchant dashboard endpoints
- **[Checkout Flow](./checkout-flow.md)** - Frontend integration guide
- **[Payment Flow](./payment-flow.md)** - Payment verification details
- **[TypeScript Types](../types/README.md)** - Type definitions for frontend
- **[Database Models](./database-models.md)** - Database schema reference

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup MongoDB

**Local MongoDB:**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community
```

**Or use [MongoDB Atlas](https://mongodb.com/cloud/atlas)** (free tier available)

### 3. Configure Environment

Copy the example environment file and fill in your values:

```bash
cd apps/kairopay
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/kairopay
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_SECRET_KEY=dev_secret_key_change_in_production

# Optional (for full features)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
ALCHEMY_API_KEY=your_alchemy_api_key
```

### 4. Start Development Server

```bash
cd apps/kairopay
pnpm dev
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Register merchant
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123"}'

# Create app
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123", "name": "My Shop"}'
```

See **[API Reference](./api.md)** for complete documentation.

## 🏗️ Architecture

```
Customer → Checkout UI → Payment → Tx Verification → Webhook → Merchant
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB + Mongoose
- **Auth:** Privy (coming soon)
- **Blockchain:** Alchemy SDK (coming soon)
- **Language:** TypeScript

## 📦 Project Structure

```
apps/kairopay/
├── app/api/          # API routes
│   ├── merchant/     # Merchant endpoints
│   └── orders/       # Order endpoints
├── lib/
│   ├── db/           # Database models
│   ├── utils/        # Utilities
│   ├── middleware/   # Auth middleware
│   └── services/     # Webhook service
├── types/            # TypeScript types
└── docs/             # Documentation
```

## 🧪 Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run linter
pnpm check-types  # Type checking
```

## 🚨 Troubleshooting

**MongoDB connection failed:**

```bash
# Check if MongoDB is running
brew services list

# Restart MongoDB
brew services restart mongodb-community
```

**Port already in use:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Turbo cache issues:**

```bash
pnpm clean
rm -rf .turbo node_modules/.cache
```

## 📖 Next Steps

1. Read the **[API Reference](./api.md)**
2. Integrate KairoPay into your app
3. Test with webhook.site
4. Deploy to production

## 🔐 Security Notes

- API keys are hashed with bcrypt
- Webhooks are signed with HMAC SHA-256
- All wallets are non-custodial
- Merchants control their own keys

---

**Version:** 0.1.0  
**Status:** Merchant, Orders & Dashboard APIs Complete ✅
