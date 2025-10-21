# KairoPay

A monorepo for KairoPay applications and packages.

## Project Structure

```
kairopay/
├── apps/
│   ├── kairopay/        # Main website (kairopay.xyz)
│   └── dashboard/       # Dashboard (dashboard.kairopay.xyz)
├── packages/
│   ├── sdk/            # KairoPay SDK
│   ├── ui/             # Shared UI components
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
```

## Apps

### KairoPay (kairopay.xyz)

Main website for KairoPay

- Port: 3000
- Path: `apps/kairopay`

### Dashboard (dashboard.kairopay.xyz)

Dashboard application for KairoPay

- Port: 3001
- Path: `apps/dashboard`

## Packages

### SDK (`@repo/sdk`)

TypeScript SDK for interacting with KairoPay services

### UI (`@repo/ui`)

Shared UI components used across applications

## Development

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all apps and packages
pnpm build

# Lint all apps and packages
pnpm lint

# Type check all apps and packages
pnpm check-types

# Format code
pnpm format
```

## Running Individual Apps

```bash
# Run kairopay site
cd apps/kairopay && pnpm dev

# Run dashboard
cd apps/dashboard && pnpm dev
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: Tailwind v4, shadcn
- **Package Manager**: pnpm
- **Build System**: Turborepo

## Deployment

- **KairoPay**: Deploy to kairopay.xyz
- **Dashboard**: Deploy to dashboard.kairopay.xyz
