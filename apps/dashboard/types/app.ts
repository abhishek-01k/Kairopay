export interface App {
  id: string;
  name: string;
  description: string;
  logo?: string;
  createdAt: string;
  environment: "Dev" | "Prod";
  status: "active" | "inactive";
  api_key?: string; // Only returned on creation
}

export interface Chain {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  usdValue: string;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  chain: string;
  status: "success" | "pending" | "failed";
  timestamp: string;
  usdValue: string;
}

export interface AppDetails extends App {
  balances: Chain[];
  transactions: Transaction[];
  totalBalance: string;
}

