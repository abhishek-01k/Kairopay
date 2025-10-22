import { App, AppDetails, Chain, Transaction } from "@/types/app";

// Mock data - replace with actual API calls later
const mockApps: App[] = [
  {
    id: "1",
    name: "FlowPredicts",
    description: "Prediction market platform",
    logo: "FP",
    createdAt: new Date().toISOString(),
    environment: "Dev",
    status: "active",
  },
];

const mockBalances: Chain[] = [
  {
    id: "1",
    name: "Ethereum",
    symbol: "ETH",
    balance: "2.45",
    usdValue: "4,890.00",
  },
  {
    id: "2",
    name: "Base",
    symbol: "ETH",
    balance: "5.67",
    usdValue: "11,340.00",
  },
  {
    id: "3",
    name: "Polygon",
    symbol: "MATIC",
    balance: "1,234.56",
    usdValue: "987.65",
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    hash: "0x1234...5678",
    from: "0xabcd...efgh",
    to: "0x9876...5432",
    amount: "0.5",
    chain: "Ethereum",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    usdValue: "1,000.00",
  },
  {
    id: "2",
    hash: "0x2345...6789",
    from: "0xbcde...fghi",
    to: "0x8765...4321",
    amount: "1.2",
    chain: "Base",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    usdValue: "2,400.00",
  },
  {
    id: "3",
    hash: "0x3456...7890",
    from: "0xcdef...ghij",
    to: "0x7654...3210",
    amount: "0.8",
    chain: "Ethereum",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    usdValue: "1,600.00",
  },
];

export const getApps = async (): Promise<App[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Get from localStorage for persistence
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("merchant_apps");
    if (stored) {
      return JSON.parse(stored);
    }
  }
  
  return mockApps;
};

export const getAppById = async (id: string): Promise<AppDetails | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const apps = await getApps();
  const app = apps.find((a) => a.id === id);
  
  if (!app) return null;
  
  return {
    ...app,
    balances: mockBalances,
    transactions: mockTransactions,
    totalBalance: "17,217.65",
  };
};

export const createApp = async (
  data: Omit<App, "id" | "createdAt" | "status">
): Promise<App> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const newApp: App = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: "active",
  };
  
  // Save to localStorage
  if (typeof window !== "undefined") {
    const apps = await getApps();
    const updatedApps = [...apps, newApp];
    localStorage.setItem("merchant_apps", JSON.stringify(updatedApps));
  }
  
  return newApp;
};

export const deleteApp = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  if (typeof window !== "undefined") {
    const apps = await getApps();
    const updatedApps = apps.filter((a) => a.id !== id);
    localStorage.setItem("merchant_apps", JSON.stringify(updatedApps));
  }
};

