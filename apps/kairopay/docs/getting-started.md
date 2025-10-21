# Getting Started with KairoPay

This guide will help you set up KairoPay locally and make your first API call.

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm**
- **MongoDB** (local or Atlas)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kairopay/kairopay.git
cd kairopay
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Whitelist your IP address

### 4. Configure Environment Variables

Create `.env.local` in `apps/kairopay/`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/kairopay

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_SECRET_KEY=dev_secret_key_change_in_production

# Privy (optional for now)
# PRIVY_APP_ID=your_privy_app_id
# PRIVY_APP_SECRET=your_privy_app_secret

# Alchemy (optional for now)
# ALCHEMY_API_KEY=your_alchemy_key
```

### 5. Start Development Server

```bash
cd apps/kairopay
pnpm dev
```

The API will be available at `http://localhost:3000/api`

## ✅ Verify Installation

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-10-21T..."
  }
}
```

## 🎯 Your First API Call

### 1. Register a Merchant

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123xyz456",
    "privy_did": "did:privy:test_merchant_001",
    "created_at": "2025-10-21T..."
  }
}
```

### 2. Create an App

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001",
    "name": "My First Shop"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "app_id": "app_xyz789",
    "api_key": "sk_test_...",
    "name": "My First Shop",
    "created_at": "2025-10-21T..."
  }
}
```

⚠️ **Save the API key** - it's only shown once!

### 3. Get Merchant Profile

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001
```

## 🧪 Development Workflow

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

### Build for Production

```bash
pnpm build
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** "MONGODB_URI is not defined"

- Ensure `.env.local` exists in `apps/kairopay/`
- Restart the dev server

**Error:** "Connection refused"

- Check if MongoDB is running: `brew services list`
- Verify connection string in `.env.local`

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Turbo Cache Issues

```bash
# Clear Turbo cache
pnpm clean
rm -rf .turbo node_modules/.cache
```

## 📚 Next Steps

- [Merchant API Reference](./merchant-api.md)
- [Database Models](./database-models.md)
- [Webhooks Guide](./webhooks.md)

## 🆘 Need Help?

- Check [GitHub Issues](https://github.com/kairopay/kairopay/issues)
- Join our [Discord](https://discord.gg/kairopay)
- Email: support@kairopay.com
