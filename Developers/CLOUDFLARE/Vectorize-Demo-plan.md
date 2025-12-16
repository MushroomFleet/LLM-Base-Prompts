# Vectorize White Label Integration Plan

## Executive Summary

This document outlines a complete integration plan for demonstrating Cloudflare's Vectorize service through a white-labeled demonstration website. The demo will showcase vector database capabilities including semantic search, similarity matching, and AI-powered recommendations using a modern React + Vite + TypeScript stack.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Environment Setup](#phase-1-environment-setup)
5. [Phase 2: Cloudflare Workers Setup](#phase-2-cloudflare-workers-setup)
6. [Phase 3: Frontend Development](#phase-3-frontend-development)
7. [Phase 4: Integration & Deployment](#phase-4-integration--deployment)
8. [Phase 5: Testing & Optimization](#phase-5-testing--optimization)
9. [Appendix: Code Examples](#appendix-code-examples)

---

## Project Overview

### Objectives

- Create a production-ready demonstration of Vectorize capabilities
- Showcase semantic search, similarity matching, and vector operations
- Provide a white-label solution that can be customized for different brands
- Demonstrate real-world use cases (product recommendations, content discovery, etc.)

### Technology Stack

- **Frontend**: React 18, Vite 5, TypeScript 5
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare Vectorize
- **AI/ML**: Cloudflare Workers AI (for embeddings)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Deployment**: Cloudflare Pages

### Key Features

1. Semantic search interface
2. Similar item recommendations
3. Real-time vector similarity visualization
4. Upload and vectorize custom content
5. Performance metrics dashboard
6. White-label theming system

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Search UI    │  │ Results View │  │ Dashboard │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────▼────────────────────────────┐
│            Cloudflare Workers (API)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Search API   │  │ Insert API   │  │ Query API │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└────────────────────────┬────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼──────────┐
│  Vectorize DB   │ │ Workers AI │ │   KV Store   │
│  (Vector Store) │ │(Embeddings)│ │  (Metadata)  │
└─────────────────┘ └────────────┘ └──────────────┘
```

### Data Flow

1. User enters search query in React frontend
2. Frontend sends query to Cloudflare Worker
3. Worker generates embedding using Workers AI
4. Worker queries Vectorize for similar vectors
5. Results returned with metadata
6. Frontend displays results with similarity scores

---

## Prerequisites

### Required Accounts & Tools

- Cloudflare account with Workers and Vectorize access
- Node.js 18+ and npm/yarn
- Git
- Code editor (VS Code recommended)
- Wrangler CLI

### Knowledge Requirements

- TypeScript/JavaScript
- React fundamentals
- REST API concepts
- Basic understanding of vector databases and embeddings

---

## Phase 1: Environment Setup

### Step 1.1: Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Step 1.2: Create Project Structure

```bash
# Create project directory
mkdir vectorize-demo
cd vectorize-demo

# Initialize git
git init
```

### Step 1.3: Create Vectorize Index

```bash
# Create a new Vectorize index
wrangler vectorize create product-embeddings \
  --dimensions=768 \
  --metric=cosine

# Note: Use 768 dimensions for @cf/baai/bge-base-en-v1.5 model
# Other options: euclidean, dot-product metrics
```

### Step 1.4: Project Directory Structure

```
vectorize-demo/
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── worker/                   # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts
│   │   ├── handlers/
│   │   └── utils/
│   ├── wrangler.toml
│   └── package.json
└── README.md
```

---

## Phase 2: Cloudflare Workers Setup

### Step 2.1: Initialize Worker Project

```bash
mkdir worker
cd worker

# Initialize with TypeScript template
npm create cloudflare@latest -- --type=worker --ts
```

### Step 2.2: Configure wrangler.toml

```toml
name = "vectorize-demo-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"
node_compat = true

# Vectorize binding
[[vectorize]]
binding = "VECTORIZE"
index_name = "product-embeddings"

# Workers AI binding
[ai]
binding = "AI"

# KV namespace for metadata (optional)
[[kv_namespaces]]
binding = "METADATA"
id = "your-kv-namespace-id"

# CORS configuration
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Step 2.3: Worker Core Implementation

**File: `worker/src/index.ts`**

```typescript
export interface Env {
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  METADATA: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Enable CORS
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route handling
      if (path === '/api/search' && request.method === 'POST') {
        return await handleSearch(request, env);
      }
      
      if (path === '/api/insert' && request.method === 'POST') {
        return await handleInsert(request, env);
      }
      
      if (path === '/api/similar' && request.method === 'POST') {
        return await handleSimilar(request, env);
      }

      if (path === '/api/health' && request.method === 'GET') {
        return jsonResponse({ status: 'healthy', timestamp: Date.now() });
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  },
};

// Helper function for CORS
function handleCORS(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Step 2.4: Search Handler Implementation

**File: `worker/src/handlers/search.ts`**

```typescript
import { Env } from '../index';

export async function handleSearch(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { query: string; limit?: number; filter?: any };
  
  if (!body.query) {
    return jsonResponse({ error: 'Query is required' }, 400);
  }

  // Generate embedding for search query
  const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: body.query,
  });

  const queryVector = embeddings.data[0];
  
  // Search Vectorize
  const results = await env.VECTORIZE.query(queryVector, {
    topK: body.limit || 10,
    returnMetadata: true,
    ...(body.filter && { filter: body.filter }),
  });

  // Enhance results with additional metadata from KV if needed
  const enhancedResults = await Promise.all(
    results.matches.map(async (match) => {
      const metadata = await env.METADATA.get(`item:${match.id}`, 'json');
      return {
        id: match.id,
        score: match.score,
        metadata: match.metadata,
        additionalData: metadata,
      };
    })
  );

  return jsonResponse({
    results: enhancedResults,
    count: results.count,
    query: body.query,
  });
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Step 2.5: Insert Handler Implementation

**File: `worker/src/handlers/insert.ts`**

```typescript
import { Env } from '../index';

export async function handleInsert(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as {
    items: Array<{
      id: string;
      text: string;
      metadata?: Record<string, any>;
    }>;
  };

  if (!body.items || body.items.length === 0) {
    return jsonResponse({ error: 'Items array is required' }, 400);
  }

  const vectors = [];

  // Generate embeddings for each item
  for (const item of body.items) {
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: item.text,
    });

    vectors.push({
      id: item.id,
      values: embeddings.data[0],
      metadata: {
        text: item.text,
        ...item.metadata,
        timestamp: Date.now(),
      },
    });

    // Optionally store full data in KV
    if (item.metadata) {
      await env.METADATA.put(
        `item:${item.id}`,
        JSON.stringify(item.metadata)
      );
    }
  }

  // Insert vectors into Vectorize
  await env.VECTORIZE.insert(vectors);

  return jsonResponse({
    success: true,
    inserted: vectors.length,
    ids: vectors.map(v => v.id),
  });
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Step 2.6: Similar Items Handler

**File: `worker/src/handlers/similar.ts`**

```typescript
import { Env } from '../index';

export async function handleSimilar(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { 
    id: string; 
    limit?: number;
    excludeSelf?: boolean;
  };

  if (!body.id) {
    return jsonResponse({ error: 'Item ID is required' }, 400);
  }

  // Get the vector for the given ID
  const itemData = await env.METADATA.get(`item:${body.id}`, 'json');
  
  if (!itemData || !itemData.text) {
    return jsonResponse({ error: 'Item not found' }, 404);
  }

  // Generate embedding for the item
  const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: itemData.text,
  });

  const queryVector = embeddings.data[0];
  
  // Query for similar items
  const results = await env.VECTORIZE.query(queryVector, {
    topK: (body.limit || 5) + (body.excludeSelf ? 1 : 0),
    returnMetadata: true,
  });

  // Filter out the original item if requested
  let matches = results.matches;
  if (body.excludeSelf) {
    matches = matches.filter(match => match.id !== body.id);
  }
  matches = matches.slice(0, body.limit || 5);

  return jsonResponse({
    sourceId: body.id,
    similar: matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    })),
  });
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Step 2.7: Deploy Worker

```bash
cd worker

# Install dependencies
npm install

# Deploy to Cloudflare
wrangler deploy

# Test the deployment
curl https://your-worker.workers.dev/api/health
```

---

## Phase 3: Frontend Development

### Step 3.1: Initialize React + Vite Project

```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3.2: Configure Tailwind CSS

**File: `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

**File: `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-md p-6;
  }
}
```

### Step 3.3: TypeScript Types

**File: `frontend/src/types/index.ts`**

```typescript
export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    title?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  additionalData?: any;
}

export interface SearchResponse {
  results: SearchResult[];
  count: number;
  query: string;
}

export interface InsertItem {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface InsertResponse {
  success: boolean;
  inserted: number;
  ids: string[];
}

export interface SimilarResponse {
  sourceId: string;
  similar: Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>;
}

export interface VectorizeConfig {
  apiUrl: string;
  brandName?: string;
  primaryColor?: string;
  logo?: string;
}
```

### Step 3.4: API Service

**File: `frontend/src/services/api.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';
import { SearchResponse, InsertItem, InsertResponse, SimilarResponse } from '../types';

class VectorizeAPI {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async search(query: string, limit: number = 10, filter?: any): Promise<SearchResponse> {
    const response = await this.client.post('/api/search', {
      query,
      limit,
      filter,
    });
    return response.data;
  }

  async insert(items: InsertItem[]): Promise<InsertResponse> {
    const response = await this.client.post('/api/insert', {
      items,
    });
    return response.data;
  }

  async getSimilar(id: string, limit: number = 5, excludeSelf: boolean = true): Promise<SimilarResponse> {
    const response = await this.client.post('/api/similar', {
      id,
      limit,
      excludeSelf,
    });
    return response.data;
  }

  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    const response = await this.client.get('/api/health');
    return response.data;
  }
}

export default VectorizeAPI;
```

### Step 3.5: Search Component

**File: `frontend/src/components/SearchBar.tsx`**

```typescript
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading,
  placeholder = "Search for products, content, or anything..."
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
```

### Step 3.6: Results Display Component

**File: `frontend/src/components/SearchResults.tsx`**

```typescript
import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onItemClick?: (id: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query, onItemClick }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">No results found for "{query}"</p>
        <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Found {results.length} results for "{query}"
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <div
            key={result.id}
            className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer"
            onClick={() => onItemClick?.(result.id)}
          >
            {result.metadata.imageUrl && (
              <img
                src={result.metadata.imageUrl}
                alt={result.metadata.title || 'Result image'}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {result.metadata.title || `Item ${result.id}`}
                </h3>
                <span className="text-sm font-medium text-primary-600">
                  {(result.score * 100).toFixed(1)}%
                </span>
              </div>
              
              {result.metadata.category && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {result.metadata.category}
                </span>
              )}
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {result.metadata.description || result.metadata.text}
              </p>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Similarity: {(result.score * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
```

### Step 3.7: Main App Component

**File: `frontend/src/App.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import VectorizeAPI from './services/api';
import { SearchResult } from './types';

const api = new VectorizeAPI(import.meta.env.VITE_API_URL || 'https://your-worker.workers.dev');

function App() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      await api.healthCheck();
      setIsHealthy(true);
    } catch (err) {
      setIsHealthy(false);
      console.error('API health check failed:', err);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await api.search(searchQuery);
      setResults(response.results);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (id: string) => {
    console.log('Item clicked:', id);
    // Implement similar items view or detail view
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vectorize Demo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Powered by Cloudflare Vector Database
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isHealthy ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Search Section */}
          <section className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Semantic Search Powered by AI
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the power of vector similarity search. Find relevant content
              based on meaning, not just keywords.
            </p>
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </section>

          {/* Error Display */}
          {error && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {query && !isLoading && (
            <section>
              <SearchResults
                results={results}
                query={query}
                onItemClick={handleItemClick}
              />
            </section>
          )}

          {/* Features Section */}
          {!query && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Semantic Search</h3>
                <p className="text-gray-600">
                  Search by meaning, not just keywords. Our AI understands context and intent.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Powered by Cloudflare's global network for instant results anywhere.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Highly Accurate</h3>
                <p className="text-gray-600">
                  Advanced AI models ensure precise similarity matching and relevance.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Vectorize Demo. Built with Cloudflare Workers, Vectorize, and React.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

### Step 3.8: Environment Configuration

**File: `frontend/.env.example`**

```env
VITE_API_URL=https://your-worker.workers.dev
VITE_BRAND_NAME=Vectorize Demo
VITE_PRIMARY_COLOR=#0284c7
```

**File: `frontend/.env.development`**

```env
VITE_API_URL=http://localhost:8787
VITE_BRAND_NAME=Vectorize Demo (Dev)
```

---

## Phase 4: Integration & Deployment

### Step 4.1: Seed Sample Data

Create a script to populate the vector database with sample data.

**File: `worker/scripts/seed.ts`**

```typescript
const WORKER_URL = 'https://your-worker.workers.dev';

const sampleProducts = [
  {
    id: 'prod-001',
    text: 'Wireless Bluetooth Headphones with Active Noise Cancellation, premium sound quality and 30-hour battery life',
    metadata: {
      title: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: 199.99,
      description: 'Experience immersive audio with active noise cancellation',
      imageUrl: 'https://via.placeholder.com/400x300?text=Headphones',
    },
  },
  {
    id: 'prod-002',
    text: 'Ergonomic Office Chair with Lumbar Support, breathable mesh back and adjustable armrests',
    metadata: {
      title: 'Ergonomic Office Chair',
      category: 'Furniture',
      price: 299.99,
      description: 'Comfortable seating for long work hours',
      imageUrl: 'https://via.placeholder.com/400x300?text=Office+Chair',
    },
  },
  {
    id: 'prod-003',
    text: 'Smart Watch with Fitness Tracking, heart rate monitor, GPS and sleep analysis',
    metadata: {
      title: 'Fitness Smart Watch',
      category: 'Electronics',
      price: 249.99,
      description: 'Track your health and fitness goals',
      imageUrl: 'https://via.placeholder.com/400x300?text=Smart+Watch',
    },
  },
  {
    id: 'prod-004',
    text: 'Stainless Steel Water Bottle, insulated to keep drinks cold for 24 hours and hot for 12 hours',
    metadata: {
      title: 'Insulated Water Bottle',
      category: 'Accessories',
      price: 34.99,
      description: 'Stay hydrated with temperature control',
      imageUrl: 'https://via.placeholder.com/400x300?text=Water+Bottle',
    },
  },
  {
    id: 'prod-005',
    text: 'Mechanical Gaming Keyboard with RGB backlighting, customizable keys and tactile switches',
    metadata: {
      title: 'RGB Gaming Keyboard',
      category: 'Electronics',
      price: 149.99,
      description: 'Enhance your gaming experience',
      imageUrl: 'https://via.placeholder.com/400x300?text=Keyboard',
    },
  },
];

async function seedData() {
  console.log('Seeding sample data...');
  
  const response = await fetch(`${WORKER_URL}/api/insert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: sampleProducts }),
  });

  const result = await response.json();
  console.log('Seed result:', result);
}

seedData().catch(console.error);
```

Run the seed script:

```bash
cd worker
npx tsx scripts/seed.ts
```

### Step 4.2: Deploy Worker to Production

```bash
cd worker
wrangler deploy --env production
```

### Step 4.3: Build and Deploy Frontend

**Configure for Cloudflare Pages:**

```bash
cd frontend

# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=vectorize-demo
```

**Or configure automatic deployment:**

1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: Add `VITE_API_URL`

### Step 4.4: Configure Custom Domain (Optional)

```bash
# Add custom domain to Pages
wrangler pages domain add vectorize-demo yourdomain.com

# Add custom domain to Worker
wrangler deploy --route yourdomain.com/api/*
```

---

## Phase 5: Testing & Optimization

### Step 5.1: Unit Testing

**File: `worker/src/__tests__/handlers.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { handleSearch } from '../handlers/search';

describe('Search Handler', () => {
  it('should return results for valid query', async () => {
    const mockEnv = {
      AI: {
        run: vi.fn().mockResolvedValue({
          data: [[0.1, 0.2, 0.3, /* ... */]],
        }),
      },
      VECTORIZE: {
        query: vi.fn().mockResolvedValue({
          matches: [
            {
              id: 'test-1',
              score: 0.95,
              metadata: { text: 'Test item' },
            },
          ],
          count: 1,
        }),
      },
      METADATA: {
        get: vi.fn().mockResolvedValue(null),
      },
    };

    const request = new Request('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test query' }),
    });

    const response = await handleSearch(request, mockEnv as any);
    const data = await response.json();

    expect(data.results).toHaveLength(1);
    expect(data.query).toBe('test query');
  });
});
```

### Step 5.2: Integration Testing

```typescript
// Test end-to-end flow
async function testE2E() {
  const api = new VectorizeAPI('https://your-worker.workers.dev');
  
  // Test health
  const health = await api.healthCheck();
  console.assert(health.status === 'healthy', 'Health check failed');
  
  // Test search
  const results = await api.search('wireless headphones');
  console.assert(results.results.length > 0, 'Search returned no results');
  
  // Test similar
  const similar = await api.getSimilar('prod-001');
  console.assert(similar.similar.length > 0, 'Similar items not found');
  
  console.log('All E2E tests passed ✅');
}
```

### Step 5.3: Performance Optimization

**Worker Optimization:**

```typescript
// Cache embeddings for common queries
const EMBEDDING_CACHE = new Map<string, number[]>();

async function getEmbedding(text: string, env: Env): Promise<number[]> {
  const cacheKey = text.toLowerCase().trim();
  
  if (EMBEDDING_CACHE.has(cacheKey)) {
    return EMBEDDING_CACHE.get(cacheKey)!;
  }
  
  const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text });
  const vector = embeddings.data[0];
  
  // Cache with size limit
  if (EMBEDDING_CACHE.size < 1000) {
    EMBEDDING_CACHE.set(cacheKey, vector);
  }
  
  return vector;
}
```

**Frontend Optimization:**

```typescript
// Debounce search input
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useCallback(
  debounce((query: string) => {
    handleSearch(query);
  }, 300),
  []
);
```

### Step 5.4: Monitoring Setup

**Add logging to Worker:**

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    
    try {
      const response = await handleRequest(request, env);
      
      // Log metrics
      const duration = Date.now() - startTime;
      console.log({
        timestamp: new Date().toISOString(),
        path: new URL(request.url).pathname,
        method: request.method,
        duration,
        status: response.status,
      });
      
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  },
};
```

---

## Appendix: Code Examples

### Advanced Query with Filters

```typescript
// Search with metadata filters
const response = await api.search('laptop', 10, {
  category: 'Electronics',
  price: { $lte: 1000 },
});
```

### Batch Insert Optimization

```typescript
// Insert items in batches
async function batchInsert(items: InsertItem[], batchSize: number = 100) {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    await api.insert(batch);
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
  }
}
```

### Custom Scoring

```typescript
// Combine vector similarity with custom business logic
function rerank(results: SearchResult[], boostCategories: string[]): SearchResult[] {
  return results.map(result => {
    let adjustedScore = result.score;
    
    if (boostCategories.includes(result.metadata.category)) {
      adjustedScore *= 1.2; // 20% boost
    }
    
    return { ...result, score: Math.min(adjustedScore, 1.0) };
  }).sort((a, b) => b.score - a.score);
}
```

### White Label Configuration

```typescript
// Dynamic theming based on configuration
interface WhiteLabelConfig {
  brandName: string;
  primaryColor: string;
  logo: string;
  favicon: string;
}

function applyWhiteLabel(config: WhiteLabelConfig) {
  document.title = config.brandName;
  document.documentElement.style.setProperty('--primary-color', config.primaryColor);
  
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) favicon.href = config.favicon;
}
```

---

## Deployment Checklist

- [ ] Vectorize index created and configured
- [ ] Worker deployed to production
- [ ] KV namespace created and bound
- [ ] Sample data seeded
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] CORS headers properly configured
- [ ] Error logging enabled
- [ ] Performance monitoring set up
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## Troubleshooting

### Common Issues

**Issue: CORS errors in frontend**
```typescript
// Ensure Worker has proper CORS headers
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

**Issue: Embedding dimension mismatch**
```bash
# Verify model output dimensions match index
wrangler vectorize get product-embeddings
# Should show dimensions: 768 for bge-base-en-v1.5
```

**Issue: Slow search responses**
- Check vector index size
- Optimize topK parameter (lower = faster)
- Implement caching for common queries
- Consider using smaller embedding model

**Issue: Rate limiting**
- Implement exponential backoff
- Batch operations when possible
- Cache results on frontend

---

## Next Steps & Enhancements

1. **Add User Authentication**: Integrate Cloudflare Access or custom auth
2. **Implement Analytics**: Track search queries and popular items
3. **Add Recommendations**: Build "Recommended for You" feature
4. **Multi-language Support**: Use multilingual embedding models
5. **A/B Testing**: Test different similarity thresholds
6. **Admin Dashboard**: Build interface for data management
7. **Export/Import**: Allow bulk data operations
8. **Webhook Integration**: Real-time data synchronization
9. **Mobile App**: Build React Native companion app
10. **Advanced Filters**: Add faceted search capabilities

---

## Support & Resources

- **Cloudflare Vectorize Docs**: https://developers.cloudflare.com/vectorize/
- **Workers AI Docs**: https://developers.cloudflare.com/workers-ai/
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## License & Usage

This white label solution can be customized and deployed for your specific use case. Ensure compliance with Cloudflare's terms of service and respect rate limits.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Production Ready
