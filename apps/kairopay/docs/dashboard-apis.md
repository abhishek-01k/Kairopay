# Merchant Dashboard APIs

Quick reference for building the merchant dashboard frontend.

---

## 🎯 Overview

The dashboard provides merchants with:

- **Order Management** - View all orders with filtering and pagination
- **Transaction History** - Track all payments across chains
- **Analytics** - Revenue, volume, and breakdown by asset/chain

All endpoints require **API key authentication** and are scoped to a specific app.

---

## 📊 Dashboard Endpoints

### 1. GET `/api/apps/{app_id}/balances`

**Primary dashboard overview with aggregated stats**

```bash
curl http://localhost:3000/api/apps/appABCD1234xyz5678/balances \
  -H "Authorization: Bearer skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX"
```

**Returns:**

- Order counts (total, completed, pending, failed)
- Transaction counts (total, confirmed)
- Revenue metrics (total USD, transaction volume)
- Breakdown by asset (USDC, USDT, ETH, etc.)
- Breakdown by chain (Ethereum, Polygon, Base, etc.)
- Recent 10 transactions
- Merchant wallet addresses

**Use for:** Dashboard homepage, stats cards, charts

---

### 2. GET `/api/apps/{app_id}/orders`

**List all orders with filtering**

```bash
# Get all completed orders
curl "http://localhost:3000/api/apps/appABCD1234xyz5678/orders?status=completed&limit=20&offset=0" \
  -H "Authorization: Bearer skXYZ..."

# Get pending orders
curl "http://localhost:3000/api/apps/appABCD1234xyz5678/orders?status=pending" \
  -H "Authorization: Bearer skXYZ..."
```

**Query Parameters:**

- `status` - Filter by: `created`, `pending`, `completed`, `verified`, `failed`
- `limit` - Page size (default: 50, max: 100)
- `offset` - Pagination offset

**Returns:**

- Array of orders with transaction counts
- Pagination info (total, has_more)

**Use for:** Orders table, order management page

---

### 3. GET `/api/apps/{app_id}/transactions`

**List all transactions with filtering**

```bash
# Get all USDC transactions
curl "http://localhost:3000/api/apps/appABCD1234xyz5678/transactions?asset=USDC&limit=20" \
  -H "Authorization: Bearer skXYZ..."

# Get Ethereum transactions
curl "http://localhost:3000/api/apps/appABCD1234xyz5678/transactions?chain=ethereum" \
  -H "Authorization: Bearer skXYZ..."

# Get confirmed transactions only
curl "http://localhost:3000/api/apps/appABCD1234xyz5678/transactions?status=confirmed" \
  -H "Authorization: Bearer skXYZ..."
```

**Query Parameters:**

- `status` - Filter by: `pending`, `confirmed`, `failed`
- `chain` - Filter by: `ethereum`, `polygon`, `base`, `arbitrum`, etc.
- `asset` - Filter by: `USDC`, `USDT`, `ETH`, `PYUSD`, etc.
- `limit` - Page size (default: 50, max: 100)
- `offset` - Pagination offset

**Returns:**

- Array of transactions with full details
- Stats (total transactions, total volume USD)
- Pagination info

**Use for:** Transaction history table, activity log

---

### 4. GET `/api/apps/{app_id}/orders/{order_id}`

**Get single order details**

```bash
curl http://localhost:3000/api/apps/appABCD1234xyz5678/orders/ord_xyz789 \
  -H "Authorization: Bearer skXYZ..."
```

**Returns:**

- Complete order details
- All associated transactions
- Customer info

**Use for:** Order detail page, transaction drill-down

---

## 🏗️ Frontend Integration Example

### Dashboard Overview Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    const res = await fetch('/api/apps/appABCD1234xyz5678/balances', {
      headers: {
        'Authorization': 'Bearer skXYZ...',
      },
    });
    const { data } = await res.json();
    setStats(data);
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.total_usd}`}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
        />
        <StatCard
          title="Completed Orders"
          value={stats.orders.completed}
        />
        <StatCard
          title="Pending Orders"
          value={stats.orders.pending}
        />
      </div>

      {/* Asset Breakdown Chart */}
      <div className="chart">
        <h2>Revenue by Asset</h2>
        <PieChart data={stats.breakdown.by_asset} />
      </div>

      {/* Chain Breakdown Chart */}
      <div className="chart">
        <h2>Revenue by Chain</h2>
        <BarChart data={stats.breakdown.by_chain} />
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <TransactionList transactions={stats.recent_transactions} />
      </div>
    </div>
  );
}
```

---

### Orders Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter, page]);

  async function fetchOrders() {
    const statusParam = filter !== 'all' ? `&status=${filter}` : '';
    const res = await fetch(
      `/api/apps/appABCD1234xyz5678/orders?limit=20&offset=${page * 20}${statusParam}`,
      {
        headers: {
          'Authorization': 'Bearer skXYZ...',
        },
      }
    );
    const { data } = await res.json();
    setOrders(data.orders);
    setHasMore(data.pagination.has_more);
  }

  return (
    <div className="orders-page">
      <h1>Orders</h1>

      {/* Filter Tabs */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('failed')}>Failed</button>
      </div>

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Transactions</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>${order.amount_usd}</td>
              <td><Badge status={order.status} /></td>
              <td>{order.transaction_count}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={!hasMore}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

### Transactions Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    chain: '',
    asset: '',
    status: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  async function fetchTransactions() {
    const params = new URLSearchParams();
    if (filters.chain) params.append('chain', filters.chain);
    if (filters.asset) params.append('asset', filters.asset);
    if (filters.status) params.append('status', filters.status);
    params.append('limit', '50');

    const res = await fetch(
      `/api/apps/appABCD1234xyz5678/transactions?${params}`,
      {
        headers: {
          'Authorization': 'Bearer skXYZ...',
        },
      }
    );
    const { data } = await res.json();
    setTransactions(data.transactions);
    setStats(data.stats);
  }

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      {/* Stats Summary */}
      <div className="stats">
        <div>Total: {stats?.total_transactions}</div>
        <div>Volume: ${stats?.total_volume_usd}</div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.chain}
          onChange={(e) => setFilters({...filters, chain: e.target.value})}
        >
          <option value="">All Chains</option>
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="base">Base</option>
        </select>

        <select
          value={filters.asset}
          onChange={(e) => setFilters({...filters, asset: e.target.value})}
        >
          <option value="">All Assets</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
          <option value="ETH">ETH</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <table>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Order ID</th>
            <th>Chain</th>
            <th>Asset</th>
            <th>Amount</th>
            <th>USD Value</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.tx_hash}>
              <td>
                <a href={`https://etherscan.io/tx/${tx.tx_hash}`} target="_blank">
                  {tx.tx_hash.slice(0, 10)}...
                </a>
              </td>
              <td>{tx.order_id}</td>
              <td>{tx.chain}</td>
              <td>{tx.asset}</td>
              <td>{tx.amount}</td>
              <td>${tx.usd_value}</td>
              <td><Badge status={tx.status} /></td>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔐 Authentication

All dashboard endpoints require API key authentication:

```typescript
const API_KEY = process.env.NEXT_PUBLIC_KAIROPAY_API_KEY;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Use in all dashboard API calls
fetch("/api/apps/...", { headers });
```

---

## 📈 Recommended Dashboard Layout

```
┌─────────────────────────────────────────┐
│  Dashboard                              │
├─────────────────────────────────────────┤
│  [Revenue] [Orders] [Completed] [Pending]│ <- Stats Cards
├─────────────────────────────────────────┤
│  [Asset Breakdown Chart]                │ <- Pie/Bar Chart
│  [Chain Breakdown Chart]                │
├─────────────────────────────────────────┤
│  Recent Transactions                    │ <- Table
│  [tx1] [tx2] [tx3] ...                  │
└─────────────────────────────────────────┘
```

---

## 🎨 Data Visualization

**Recommended Charts:**

1. **Revenue by Asset** - Pie Chart
   - Use `breakdown.by_asset` from `/balances`
   - Show USDC, USDT, ETH splits

2. **Revenue by Chain** - Bar Chart
   - Use `breakdown.by_chain` from `/balances`
   - Compare Ethereum, Polygon, Base

3. **Orders Over Time** - Line Chart
   - Fetch orders with pagination
   - Group by date on frontend

4. **Transaction Volume** - Area Chart
   - Fetch transactions
   - Aggregate by date/week

---

**Status:** Ready for dashboard development ✅
