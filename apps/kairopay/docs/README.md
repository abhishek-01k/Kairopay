# KairoPay API Documentation

Welcome to the KairoPay API documentation. KairoPay is a non-custodial crypto payment gateway that lets merchants accept payments in any crypto asset on any chain.

## 📚 Documentation Index

- [**Getting Started**](./getting-started.md) - Setup, installation, and first steps
- [**API Reference**](./api-reference.md) - Quick reference for all endpoints
- [**cURL Examples**](./curl-examples.md) - Copy-paste ready cURL commands
- [**Merchant API**](./merchant-api.md) - Merchant registration and management
- [**Orders API**](./orders-api.md) - Order creation and payment tracking _(Coming Soon)_
- [**Webhooks**](./webhooks.md) - Event notifications and callbacks
- [**Database Models**](./database-models.md) - Data structure reference

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB URI
   ```

3. **Start development server:**

   ```bash
   pnpm dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 🏗️ Architecture

```
Customer Payment Flow:
  Customer → SDK Checkout → Payment → Tx Verification → Webhook → Merchant

Merchant Dashboard:
  Merchant → Privy Auth → Dashboard → Orders/Balances → Analytics
```

## 📋 API Overview

### Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://pay.kairopay.com/api`

### Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```

## 🔐 Security

- **Authentication:** Privy DID for merchants, API keys for server-to-server
- **API Keys:** Hashed with bcrypt, never stored in plaintext
- **Webhooks:** Signed with HMAC SHA-256
- **Non-custodial:** Merchants control their own wallets

## 🛠️ Tech Stack

- **Runtime:** Next.js 15 (App Router)
- **Database:** MongoDB + Mongoose
- **Auth:** Privy
- **Blockchain:** Alchemy SDK
- **Language:** TypeScript

## 📞 Support

- **GitHub Issues:** [github.com/kairopay/kairopay/issues](https://github.com/kairopay/kairopay/issues)
- **Email:** support@kairopay.com
- **Discord:** [discord.gg/kairopay](https://discord.gg/kairopay)

---

**Version:** 0.1.0  
**Last Updated:** October 21, 2025
