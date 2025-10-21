# KairoPay - Crypto Payment Gateway

A non-custodial, developer-friendly crypto payment gateway that lets merchants accept payments in any crypto asset on any chain.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# Start development server
pnpm dev
```

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify the setup.

## 📚 Documentation

Comprehensive API documentation is available in the [`docs/`](./docs/) folder:

- **[Getting Started](./docs/getting-started.md)** - Installation and setup guide
- **[API Documentation](./docs/README.md)** - Complete API reference
- **[Merchant API](./docs/merchant-api.md)** - Merchant registration and management
- **[Database Models](./docs/database-models.md)** - Data structure reference
- **[Webhooks](./docs/webhooks.md)** - Event notifications guide

## 🏗️ Architecture

```
apps/kairopay/
├── app/
│   ├── api/              # API routes
│   │   ├── merchant/     # Merchant endpoints
│   │   ├── orders/       # Order endpoints (coming soon)
│   │   └── health/       # Health check
│   └── ...
├── lib/
│   ├── db/               # Database layer
│   │   ├── mongodb.ts    # Connection
│   │   └── models/       # Mongoose models
│   ├── utils/            # Utilities
│   │   ├── id-generator.ts
│   │   ├── crypto.ts
│   │   └── response.ts
│   └── constants/        # Constants and enums
├── types/                # TypeScript types
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB + Mongoose
- **Auth:** Privy (coming soon)
- **Blockchain:** Alchemy SDK (coming soon)
- **Language:** TypeScript
- **Package Manager:** pnpm

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm check-types  # TypeScript type checking
```

## 📡 API Endpoints

### Health Check

```bash
GET /api/health
```

### Merchant Management

```bash
POST /api/merchant/register              # Register merchant
POST /api/merchant/register/app          # Create app
GET  /api/merchant/{privy_did}           # Get merchant profile
GET  /api/merchant/{privy_did}/balances  # Get balances
```

See [Merchant API docs](./docs/merchant-api.md) for detailed usage.

## 🧪 Testing

```bash
# Register a test merchant
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123"}'

# Create a test app
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123", "name": "Test Shop"}'
```

## 🌍 Environment Variables

Required environment variables (create `.env.local`):

```env
MONGODB_URI=mongodb://localhost:27017/kairopay
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_SECRET_KEY=your_secret_key_here
```

Optional (for full functionality):

```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
ALCHEMY_API_KEY=your_alchemy_api_key
```

## 📦 Database Setup

### Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community
```

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env.local`

## 🤝 Contributing

This is a private project. For questions or issues, contact the team.

## 📄 License

Proprietary - All rights reserved

---

**For detailed documentation, visit the [`docs/`](./docs/) folder.**
