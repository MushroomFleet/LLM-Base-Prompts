# Cloudflare Hyperdrive Integration Plan
## PostgreSQL Database Acceleration Demo

This white label integration plan demonstrates the deployment of a production-ready website using Cloudflare Hyperdrive to accelerate PostgreSQL database connections. The demo showcases performance improvements, connection pooling, and query caching capabilities.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Database Setup](#database-setup)
5. [Cloudflare Configuration](#cloudflare-configuration)
6. [Application Development](#application-development)
7. [Deployment](#deployment)
8. [Testing & Validation](#testing--validation)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Cloudflare Hyperdrive?

Cloudflare Hyperdrive is a database acceleration service that speeds up queries to your existing databases by:
- **Connection Pooling**: Reusing database connections to reduce overhead
- **Query Caching**: Caching frequently-accessed data at the edge
- **Global Distribution**: Routing queries through Cloudflare's global network

### Demo Application Features

Our demonstration application will showcase:
- Real-time performance metrics comparison (with/without Hyperdrive)
- CRUD operations on a PostgreSQL database
- Connection pooling visualization
- Query caching examples
- Response time analytics

---

## Architecture

```
┌─────────────────┐
│   End Users     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloudflare     │
│  Workers        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hyperdrive     │
│  (Pooling +     │
│   Caching)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  Database       │
└─────────────────┘
```

**Technology Stack:**
- Frontend: React 18 + Vite + TypeScript
- Backend: Cloudflare Workers
- Database: PostgreSQL (any hosted provider)
- Acceleration: Cloudflare Hyperdrive
- Deployment: Cloudflare Pages + Workers

---

## Prerequisites

### Required Tools

```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # 9.0.0 or higher

# Wrangler CLI (Cloudflare Workers CLI)
npm install -g wrangler

# PostgreSQL client (for database setup)
psql --version  # 14.0 or higher
```

### Required Accounts

1. **Cloudflare Account** (Workers Paid plan for Hyperdrive)
   - Sign up at https://dash.cloudflare.com
   - Enable Workers Paid plan ($5/month)

2. **PostgreSQL Database** (any provider)
   - Neon (https://neon.tech) - Recommended, serverless
   - Supabase (https://supabase.com)
   - AWS RDS
   - Digital Ocean Managed Databases
   - Self-hosted PostgreSQL

### Environment Configuration

Create a `.env` file for local development:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

---

## Database Setup

### Step 1: Create PostgreSQL Database

If using Neon (recommended for this demo):

```bash
# Sign up at neon.tech and create a new project
# Copy the connection string from the dashboard
```

### Step 2: Initialize Database Schema

Create a file `schema.sql`:

```sql
-- Create products table for demo
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);

-- Create performance_metrics table to track query performance
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    query_type VARCHAR(100) NOT NULL,
    execution_time_ms DECIMAL(10, 2) NOT NULL,
    used_hyperdrive BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Laptop Pro 15"', 'High-performance laptop with 16GB RAM', 1299.99, 'Electronics', 25),
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 'Electronics', 150),
('Office Chair', 'Adjustable ergonomic office chair', 249.99, 'Furniture', 40),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 45.99, 'Furniture', 75),
('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 129.99, 'Electronics', 60),
('Monitor 27"', '4K UHD monitor with HDR support', 399.99, 'Electronics', 30),
('Standing Desk', 'Electric height-adjustable standing desk', 599.99, 'Furniture', 15),
('Webcam HD', '1080p webcam with built-in microphone', 79.99, 'Electronics', 90),
('Notebook Set', 'Set of 3 premium notebooks', 24.99, 'Stationery', 200),
('Pen Collection', 'Luxury pen collection with case', 89.99, 'Stationery', 45);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Apply the schema:

```bash
psql $DATABASE_URL -f schema.sql
```

### Step 3: Verify Database

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
# Should return 10
```

---

## Cloudflare Configuration

### Step 1: Authenticate Wrangler

```bash
wrangler login
```

### Step 2: Create Hyperdrive Configuration

```bash
# Create Hyperdrive configuration
wrangler hyperdrive create my-postgres \
  --connection-string="postgresql://username:password@hostname:5432/database_name"

# Output will include:
# Created Hyperdrive configuration "my-postgres"
# Hyperdrive ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Important**: Save the Hyperdrive ID for use in `wrangler.toml`.

### Step 3: Verify Hyperdrive Setup

```bash
wrangler hyperdrive list
```

You should see your newly created Hyperdrive configuration.

---

## Application Development

### Project Structure

```
hyperdrive-demo/
├── frontend/              # React Vite TypeScript app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   └── MetricsDisplay.tsx
│   │   ├── hooks/
│   │   │   └── useProducts.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── workers/               # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts
│   │   ├── handlers/
│   │   │   ├── products.ts
│   │   │   └── metrics.ts
│   │   └── db/
│   │       └── queries.ts
│   ├── wrangler.toml
│   └── package.json
└── README.md
```

### Step 1: Create Workers Backend

#### Initialize Workers Project

```bash
mkdir hyperdrive-demo && cd hyperdrive-demo
mkdir workers && cd workers
npm init -y
npm install --save-dev wrangler typescript @cloudflare/workers-types
npm install postgres
```

#### Create `wrangler.toml`

```toml
name = "hyperdrive-demo-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id-here"  # Replace with your Hyperdrive ID

# Direct database binding for comparison
[vars]
DIRECT_DATABASE_URL = "postgresql://username:password@hostname:5432/database_name"

# CORS configuration
[env.production]
vars = { ENVIRONMENT = "production" }
```

#### Create `src/index.ts`

```typescript
import postgres from 'postgres';

export interface Env {
  HYPERDRIVE: Hyperdrive;
  DIRECT_DATABASE_URL: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

interface PerformanceMetric {
  query_type: string;
  execution_time_ms: number;
  used_hyperdrive: boolean;
  timestamp: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
function handleOptions(request: Request): Response {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Add CORS headers to response
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Execute query with timing
async function executeQuery<T>(
  sql: ReturnType<typeof postgres>,
  query: string,
  params: any[] = []
): Promise<{ data: T[]; executionTime: number }> {
  const startTime = performance.now();
  const data = await sql.unsafe(query, params) as T[];
  const executionTime = performance.now() - startTime;
  return { data, executionTime };
}

// Save performance metric
async function saveMetric(
  sql: ReturnType<typeof postgres>,
  queryType: string,
  executionTime: number,
  usedHyperdrive: boolean
): Promise<void> {
  await sql`
    INSERT INTO performance_metrics (query_type, execution_time_ms, used_hyperdrive)
    VALUES (${queryType}, ${executionTime}, ${usedHyperdrive})
  `;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Initialize database connections
      const hyperdriveSQL = postgres(env.HYPERDRIVE.connectionString);
      const directSQL = postgres(env.DIRECT_DATABASE_URL);

      // Route: GET /products
      if (path === '/products' && request.method === 'GET') {
        const useHyperdrive = url.searchParams.get('hyperdrive') !== 'false';
        const sql = useHyperdrive ? hyperdriveSQL : directSQL;

        const { data, executionTime } = await executeQuery<Product>(
          sql,
          'SELECT * FROM products ORDER BY created_at DESC'
        );

        await saveMetric(hyperdriveSQL, 'SELECT_ALL_PRODUCTS', executionTime, useHyperdrive);

        return addCorsHeaders(
          new Response(JSON.stringify({ 
            products: data, 
            executionTime: Math.round(executionTime * 100) / 100,
            usedHyperdrive: useHyperdrive 
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: GET /products/:id
      if (path.match(/^\/products\/\d+$/) && request.method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const useHyperdrive = url.searchParams.get('hyperdrive') !== 'false';
        const sql = useHyperdrive ? hyperdriveSQL : directSQL;

        const { data, executionTime } = await executeQuery<Product>(
          sql,
          'SELECT * FROM products WHERE id = $1',
          [id]
        );

        await saveMetric(hyperdriveSQL, 'SELECT_PRODUCT_BY_ID', executionTime, useHyperdrive);

        if (data.length === 0) {
          return addCorsHeaders(
            new Response(JSON.stringify({ error: 'Product not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        return addCorsHeaders(
          new Response(JSON.stringify({ 
            product: data[0], 
            executionTime: Math.round(executionTime * 100) / 100,
            usedHyperdrive: useHyperdrive 
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: POST /products
      if (path === '/products' && request.method === 'POST') {
        const body = await request.json() as Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        
        const { data, executionTime } = await executeQuery<Product>(
          hyperdriveSQL,
          `INSERT INTO products (name, description, price, category, stock_quantity)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [body.name, body.description, body.price, body.category, body.stock_quantity]
        );

        await saveMetric(hyperdriveSQL, 'INSERT_PRODUCT', executionTime, true);

        return addCorsHeaders(
          new Response(JSON.stringify({ 
            product: data[0], 
            executionTime: Math.round(executionTime * 100) / 100 
          }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: PUT /products/:id
      if (path.match(/^\/products\/\d+$/) && request.method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        const body = await request.json() as Partial<Product>;

        const { data, executionTime } = await executeQuery<Product>(
          hyperdriveSQL,
          `UPDATE products 
           SET name = COALESCE($1, name),
               description = COALESCE($2, description),
               price = COALESCE($3, price),
               category = COALESCE($4, category),
               stock_quantity = COALESCE($5, stock_quantity)
           WHERE id = $6
           RETURNING *`,
          [body.name, body.description, body.price, body.category, body.stock_quantity, id]
        );

        await saveMetric(hyperdriveSQL, 'UPDATE_PRODUCT', executionTime, true);

        if (data.length === 0) {
          return addCorsHeaders(
            new Response(JSON.stringify({ error: 'Product not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        return addCorsHeaders(
          new Response(JSON.stringify({ 
            product: data[0], 
            executionTime: Math.round(executionTime * 100) / 100 
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: DELETE /products/:id
      if (path.match(/^\/products\/\d+$/) && request.method === 'DELETE') {
        const id = parseInt(path.split('/')[2]);

        const { data, executionTime } = await executeQuery<Product>(
          hyperdriveSQL,
          'DELETE FROM products WHERE id = $1 RETURNING *',
          [id]
        );

        await saveMetric(hyperdriveSQL, 'DELETE_PRODUCT', executionTime, true);

        if (data.length === 0) {
          return addCorsHeaders(
            new Response(JSON.stringify({ error: 'Product not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        return addCorsHeaders(
          new Response(JSON.stringify({ 
            message: 'Product deleted successfully',
            executionTime: Math.round(executionTime * 100) / 100 
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: GET /metrics
      if (path === '/metrics' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '50');

        const { data } = await executeQuery<PerformanceMetric>(
          hyperdriveSQL,
          'SELECT * FROM performance_metrics ORDER BY timestamp DESC LIMIT $1',
          [limit]
        );

        return addCorsHeaders(
          new Response(JSON.stringify({ metrics: data }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route: GET /metrics/comparison
      if (path === '/metrics/comparison' && request.method === 'GET') {
        const { data } = await executeQuery<any>(
          hyperdriveSQL,
          `SELECT 
            query_type,
            AVG(CASE WHEN used_hyperdrive = true THEN execution_time_ms END) as avg_hyperdrive_ms,
            AVG(CASE WHEN used_hyperdrive = false THEN execution_time_ms END) as avg_direct_ms,
            COUNT(*) as total_queries
           FROM performance_metrics
           WHERE timestamp > NOW() - INTERVAL '1 hour'
           GROUP BY query_type`
        );

        return addCorsHeaders(
          new Response(JSON.stringify({ comparison: data }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      // Route not found
      return addCorsHeaders(
        new Response(JSON.stringify({ error: 'Route not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    } catch (error) {
      console.error('Error:', error);
      return addCorsHeaders(
        new Response(JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
  },
};
```

#### Create `package.json` for Workers

```json
{
  "name": "hyperdrive-demo-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20231218.0",
    "typescript": "^5.3.3",
    "wrangler": "^3.22.1"
  },
  "dependencies": {
    "postgres": "^3.4.3"
  }
}
```

#### Create `tsconfig.json` for Workers

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

### Step 2: Test Workers Locally

```bash
cd workers
npm install
npm run dev

# Test in another terminal
curl http://localhost:8787/products
```

### Step 3: Create React Frontend

#### Initialize Vite Project

```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install recharts lucide-react
```

#### Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

#### Create Type Definitions: `src/types/index.ts`

```typescript
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  products?: Product[];
  product?: Product;
  executionTime: number;
  usedHyperdrive: boolean;
}

export interface PerformanceMetric {
  id: number;
  query_type: string;
  execution_time_ms: number;
  used_hyperdrive: boolean;
  timestamp: string;
}

export interface MetricComparison {
  query_type: string;
  avg_hyperdrive_ms: number;
  avg_direct_ms: number;
  total_queries: number;
}
```

#### Create Custom Hook: `src/hooks/useProducts.ts`

```typescript
import { useState, useEffect } from 'react';
import { Product, ProductResponse } from '../types';

const API_BASE = import.meta.env.PROD 
  ? 'https://your-worker.your-subdomain.workers.dev' 
  : '/api';

export function useProducts(useHyperdrive: boolean = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE}/products?hyperdrive=${useHyperdrive}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data: ProductResponse = await response.json();
      setProducts(data.products || []);
      setExecutionTime(data.executionTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [useHyperdrive]);

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    await fetchProducts();
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    await fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    await fetchProducts();
  };

  return {
    products,
    loading,
    error,
    executionTime,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
```

#### Create Main Component: `src/App.tsx`

```typescript
import { useState } from 'react';
import { Activity, Database, Zap } from 'lucide-react';
import ProductList from './components/ProductList';
import PerformanceChart from './components/PerformanceChart';
import MetricsDisplay from './components/MetricsDisplay';
import './App.css';

function App() {
  const [useHyperdrive, setUseHyperdrive] = useState(true);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Zap size={32} />
            <h1>Hyperdrive Demo</h1>
          </div>
          <p className="subtitle">PostgreSQL Database Acceleration with Cloudflare</p>
        </div>
      </header>

      <main className="main">
        <div className="control-panel">
          <div className="toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useHyperdrive}
                onChange={(e) => setUseHyperdrive(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {useHyperdrive ? (
                  <>
                    <Zap size={16} /> Hyperdrive Enabled
                  </>
                ) : (
                  <>
                    <Database size={16} /> Direct Connection
                  </>
                )}
              </span>
            </label>
          </div>

          <div className="info-card">
            <Activity size={20} />
            <div>
              <h3>Connection Mode</h3>
              <p>
                {useHyperdrive
                  ? 'Queries are routed through Hyperdrive with connection pooling and caching'
                  : 'Queries connect directly to PostgreSQL without acceleration'}
              </p>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <MetricsDisplay useHyperdrive={useHyperdrive} />
        </div>

        <div className="charts-section">
          <PerformanceChart />
        </div>

        <div className="products-section">
          <ProductList useHyperdrive={useHyperdrive} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Powered by{' '}
          <a href="https://developers.cloudflare.com/hyperdrive/" target="_blank" rel="noopener noreferrer">
            Cloudflare Hyperdrive
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
```

#### Create ProductList Component: `src/components/ProductList.tsx`

```typescript
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Edit, Trash2, Plus, Clock } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  useHyperdrive: boolean;
}

export default function ProductList({ useHyperdrive }: ProductListProps) {
  const { products, loading, error, executionTime, updateProduct, deleteProduct } = useProducts(useHyperdrive);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleSave = async (id: number) => {
    await updateProduct(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="section-header">
        <h2>Products Catalog</h2>
        <div className="execution-time">
          <Clock size={16} />
          <span>Query executed in {executionTime}ms</span>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {editingId === product.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="form-input"
                />
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="form-textarea"
                />
                <input
                  type="number"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="form-input"
                />
                <div className="form-actions">
                  <button onClick={() => handleSave(product.id)} className="btn btn-primary">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span className="category-badge">{product.category}</span>
                </div>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="price">${product.price.toFixed(2)}</span>
                  <span className="stock">Stock: {product.stock_quantity}</span>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="btn-icon">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="btn-icon btn-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Create PerformanceChart Component: `src/components/PerformanceChart.tsx`

```typescript
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricComparison } from '../types';

const API_BASE = import.meta.env.PROD 
  ? 'https://your-worker.your-subdomain.workers.dev' 
  : '/api';

export default function PerformanceChart() {
  const [data, setData] = useState<MetricComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/metrics/comparison`);
        const result = await response.json();
        setData(result.comparison || []);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  const chartData = data.map(item => ({
    name: item.query_type.replace(/_/g, ' '),
    Hyperdrive: parseFloat(item.avg_hyperdrive_ms?.toFixed(2) || '0'),
    Direct: parseFloat(item.avg_direct_ms?.toFixed(2) || '0'),
  }));

  return (
    <div className="chart-container">
      <h2>Performance Comparison</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Hyperdrive" stroke="#f97316" strokeWidth={2} />
          <Line type="monotone" dataKey="Direct" stroke="#64748b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Create MetricsDisplay Component: `src/components/MetricsDisplay.tsx`

```typescript
import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';

const API_BASE = import.meta.env.PROD 
  ? 'https://your-worker.your-subdomain.workers.dev' 
  : '/api';

interface MetricsDisplayProps {
  useHyperdrive: boolean;
}

export default function MetricsDisplay({ useHyperdrive }: MetricsDisplayProps) {
  const [avgTime, setAvgTime] = useState<number>(0);
  const [improvement, setImprovement] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/metrics/comparison`);
        const result = await response.json();
        
        if (result.comparison && result.comparison.length > 0) {
          const avg = result.comparison.reduce((sum: number, item: any) => {
            const time = useHyperdrive ? item.avg_hyperdrive_ms : item.avg_direct_ms;
            return sum + (time || 0);
          }, 0) / result.comparison.length;
          
          setAvgTime(avg);

          // Calculate improvement
          const hyperdriveAvg = result.comparison.reduce((sum: number, item: any) => 
            sum + (item.avg_hyperdrive_ms || 0), 0) / result.comparison.length;
          const directAvg = result.comparison.reduce((sum: number, item: any) => 
            sum + (item.avg_direct_ms || 0), 0) / result.comparison.length;
          
          if (directAvg > 0) {
            setImprovement(((directAvg - hyperdriveAvg) / directAvg) * 100);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [useHyperdrive]);

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon">
          <Clock size={24} />
        </div>
        <div className="metric-content">
          <p className="metric-label">Average Query Time</p>
          <p className="metric-value">{avgTime.toFixed(2)}ms</p>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">
          <TrendingUp size={24} />
        </div>
        <div className="metric-content">
          <p className="metric-label">Performance Improvement</p>
          <p className="metric-value">{improvement.toFixed(1)}%</p>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">
          <Zap size={24} />
        </div>
        <div className="metric-content">
          <p className="metric-label">Acceleration Status</p>
          <p className="metric-value">{useHyperdrive ? 'Active' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
}
```

#### Create Styles: `src/App.css`

```css
:root {
  --primary: #f97316;
  --secondary: #64748b;
  --background: #0f172a;
  --surface: #1e293b;
  --surface-light: #334155;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --success: #10b981;
  --danger: #ef4444;
  --border: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', sans-serif;
  background: var(--background);
  color: var(--text);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--primary);
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.control-panel {
  background: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.toggle-section {
  flex: 0 0 auto;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  position: absolute;
  opacity: 0;
}

.toggle-slider {
  position: relative;
  width: 60px;
  height: 30px;
  background: var(--surface-light);
  border-radius: 15px;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  top: 4px;
  left: 4px;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background: var(--primary);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(30px);
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.info-card {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-light);
  border-radius: 8px;
}

.info-card h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.info-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.metrics-section {
  margin-bottom: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.metric-icon {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
}

.charts-section {
  margin-bottom: 2rem;
}

.chart-container {
  background: var(--surface);
  border-radius: 12px;
  padding: 2rem;
}

.chart-container h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.products-section {
  margin-bottom: 2rem;
}

.product-list {
  background: var(--surface);
  border-radius: 12px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
}

.execution-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: var(--surface-light);
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.product-header h3 {
  font-size: 1.1rem;
  flex: 1;
}

.category-badge {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary);
}

.stock {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--surface-light);
  border-color: var(--primary);
}

.btn-icon.btn-danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input,
.form-textarea {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.75rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface-light);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--surface-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  background: var(--danger);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.footer a {
  color: var(--primary);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .logo h1 {
    font-size: 1.5rem;
  }

  .main {
    padding: 1rem;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Deployment

### Step 1: Deploy Workers API

```bash
cd workers

# Update wrangler.toml with your Hyperdrive ID
# Then deploy
npm run deploy

# Output will show your worker URL:
# Published hyperdrive-demo-api (X.XX sec)
#   https://hyperdrive-demo-api.your-subdomain.workers.dev
```

### Step 2: Build and Deploy Frontend

```bash
cd ../frontend

# Update API_BASE in production
# Edit src/hooks/useProducts.ts and src/components/*.tsx
# Replace: 'https://your-worker.your-subdomain.workers.dev'
# With your actual worker URL from Step 1

# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=hyperdrive-demo
```

### Step 3: Configure Custom Domain (Optional)

```bash
# Add custom domain in Cloudflare Dashboard
# Pages > hyperdrive-demo > Custom Domains
# Add: demo.yourdomain.com
```

---

## Testing & Validation

### Performance Testing Script

Create `test-performance.sh`:

```bash
#!/bin/bash

echo "Testing Hyperdrive Performance"
echo "================================"

WORKER_URL="https://your-worker.your-subdomain.workers.dev"

echo -e "\n1. Testing with Hyperdrive enabled..."
for i in {1..10}; do
  curl -s -w "Time: %{time_total}s\n" -o /dev/null "$WORKER_URL/products?hyperdrive=true"
done

echo -e "\n2. Testing with direct connection..."
for i in {1..10}; do
  curl -s -w "Time: %{time_total}s\n" -o /dev/null "$WORKER_URL/products?hyperdrive=false"
done

echo -e "\n3. Fetching comparison metrics..."
curl -s "$WORKER_URL/metrics/comparison" | jq '.'
```

Run tests:

```bash
chmod +x test-performance.sh
./test-performance.sh
```

### Expected Results

With Hyperdrive enabled:
- First query: ~50-150ms (cold start)
- Subsequent queries: ~10-30ms (pooled connections + cache)

Without Hyperdrive:
- Each query: ~100-300ms (new connection overhead)

**Improvement**: Typically 60-80% faster with Hyperdrive

---

## Monitoring

### Cloudflare Dashboard

Monitor your deployment:

1. **Workers Analytics**
   - Navigate to: Workers & Pages > hyperdrive-demo-api > Metrics
   - Track: Requests, Errors, CPU Time

2. **Hyperdrive Analytics**
   - Navigate to: Data > Hyperdrive > my-postgres
   - Track: Query Count, Cache Hit Rate, Connection Pool Usage

3. **Pages Analytics**
   - Navigate to: Workers & Pages > hyperdrive-demo > Analytics
   - Track: Visits, Bandwidth, Build Times

### Custom Logging

Add to Workers `src/index.ts`:

```typescript
// Log performance metrics
console.log(`Query: ${path}, Time: ${executionTime}ms, Hyperdrive: ${useHyperdrive}`);
```

View logs:

```bash
wrangler tail hyperdrive-demo-api
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused Error

**Problem**: `Error: connection refused`

**Solution**:
```bash
# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"

# Check Hyperdrive configuration
wrangler hyperdrive get my-postgres

# Recreate if needed
wrangler hyperdrive delete my-postgres
wrangler hyperdrive create my-postgres --connection-string="..."
```

#### 2. CORS Errors

**Problem**: `Access-Control-Allow-Origin` errors in browser

**Solution**: Verify CORS headers in `workers/src/index.ts`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

#### 3. Slow Query Performance

**Problem**: Queries slower than expected

**Solution**:
```sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'Electronics';
```

#### 4. Workers Deployment Fails

**Problem**: `wrangler deploy` errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify wrangler.toml configuration
wrangler whoami
wrangler deploy --dry-run
```

### Debug Checklist

- [ ] Database connection string is correct
- [ ] Hyperdrive ID matches in `wrangler.toml`
- [ ] Worker is deployed successfully
- [ ] CORS headers are configured
- [ ] Environment variables are set
- [ ] Database schema is applied
- [ ] Network allows database connections

---

## Performance Optimization Tips

### 1. Query Optimization

```sql
-- Use specific columns instead of SELECT *
SELECT id, name, price FROM products WHERE category = 'Electronics';

-- Limit results for pagination
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 0;

-- Use prepared statements (handled by postgres library)
```

### 2. Connection Pooling Configuration

In Hyperdrive dashboard, configure:
- **Max Pool Size**: 20-50 connections
- **Idle Timeout**: 60 seconds
- **Connection Timeout**: 10 seconds

### 3. Caching Strategy

```typescript
// Cache frequently-accessed data
const CACHE_TTL = 60; // seconds

// Add cache headers
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${CACHE_TTL}`,
  },
});
```

### 4. Database Indexing

```sql
-- Create composite indexes for complex queries
CREATE INDEX idx_products_category_price ON products(category, price);

-- Create partial indexes for filtered queries
CREATE INDEX idx_active_products ON products(id) WHERE stock_quantity > 0;
```

---

## Security Considerations

### 1. Environment Variables

Never commit sensitive data:

```bash
# Add to .gitignore
.env
.dev.vars
wrangler.toml  # If contains sensitive data
```

Use Wrangler secrets:

```bash
wrangler secret put DATABASE_PASSWORD
```

### 2. SQL Injection Prevention

Always use parameterized queries:

```typescript
// ✅ Good - Parameterized
await sql`SELECT * FROM products WHERE id = ${id}`;

// ❌ Bad - String concatenation
await sql.unsafe(`SELECT * FROM products WHERE id = ${id}`);
```

### 3. Rate Limiting

Add rate limiting to Workers:

```typescript
// Track requests per IP
const requestsPerIP = new Map<string, number>();

// Limit to 100 requests per minute
const RATE_LIMIT = 100;
const RATE_WINDOW = 60000; // 1 minute
```

---

## Next Steps

### Enhancements

1. **Add Authentication**
   - Implement JWT authentication
   - Protect admin routes
   - Add user roles and permissions

2. **Real-time Updates**
   - Use Cloudflare Durable Objects
   - Implement WebSocket connections
   - Add live query subscriptions

3. **Advanced Caching**
   - Implement cache invalidation
   - Add cache warming strategies
   - Use Cache API for static content

4. **Monitoring & Alerts**
   - Set up error tracking (Sentry)
   - Configure performance alerts
   - Add custom dashboards

5. **Load Testing**
   - Use k6 or Artillery for load testing
   - Measure performance under load
   - Optimize based on results

### Resources

- [Cloudflare Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [React + Vite Documentation](https://vitejs.dev/guide/)

---

## Conclusion

This integration plan provides a complete, production-ready demonstration of Cloudflare Hyperdrive's database acceleration capabilities. The demo application showcases:

✅ Connection pooling and reuse  
✅ Query caching at the edge  
✅ Real-time performance metrics  
✅ Side-by-side comparison with direct connections  
✅ Full CRUD operations  
✅ Modern React TypeScript frontend  
✅ Serverless Workers backend  

Expected performance improvements: **60-80% faster queries** with Hyperdrive enabled.

For questions or support, refer to Cloudflare's documentation or community forums.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**License**: Use freely for white label integration
