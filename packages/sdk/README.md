# @repo/sdk

KairoPay SDK - A TypeScript SDK for interacting with KairoPay services.

## Installation

This package is part of the KairoPay monorepo and is used internally by the apps.

```bash
pnpm add @repo/sdk
```

## Usage

```typescript
import { KairoPaySDK } from '@repo/sdk';

const sdk = new KairoPaySDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.kairopay.xyz' // optional
});

const status = await sdk.getStatus();
```

## Development

```bash
# Build the SDK
pnpm build

# Watch mode
pnpm dev

# Type checking
pnpm check-types

# Lint
pnpm lint
```

