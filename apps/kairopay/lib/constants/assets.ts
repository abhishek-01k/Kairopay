// Common assets for reference/display purposes only
// The system accepts ANY asset - this is not an exhaustive list
export const COMMON_ASSETS = {
  // Stablecoins
  USDC: "USDC",
  USDT: "USDT",
  PYUSD: "PYUSD",
  DAI: "DAI",

  // Native tokens
  ETH: "ETH",
  MATIC: "MATIC",
  SOL: "SOL",

  // Other
  WETH: "WETH",
} as const;

// Asset can be any string - not limited to predefined list
export type Asset = string;
