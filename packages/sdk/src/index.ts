/**
 * KairoPay SDK
 * A simple TypeScript SDK boilerplate
 */

export function hello(name: string = "World"): string {
  return `Hello, ${name}!`;
}

export function add(a: number, b: number): number {
  return a + b;
}

export class KairoPaySDK {
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
  }

  getConfig(): SDKConfig {
    return this.config;
  }

  greet(name?: string): string {
    return hello(name);
  }
}

export interface SDKConfig {
  apiKey?: string;
  debug?: boolean;
}

export default KairoPaySDK;
