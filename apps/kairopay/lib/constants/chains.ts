// Common chains for reference/display purposes only
// The system accepts ANY chain - this is not an exhaustive list
export const COMMON_CHAINS = {
  ETHEREUM: "ethereum",
  POLYGON: "polygon",
  BASE: "base",
  OPTIMISM: "optimism",
  ARBITRUM: "arbitrum",
  SOLANA: "solana",
} as const;

// Chain can be any string - not limited to predefined list
export type Chain = string;

export const COMMON_CHAIN_IDS: Record<string, number | string> = {
  ethereum: 1,
  polygon: 137,
  base: 8453,
  optimism: 10,
  arbitrum: 42161,
  solana: "solana-mainnet",
};
