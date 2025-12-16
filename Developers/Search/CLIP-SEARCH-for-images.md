# CLIP Search for Images - White Label Integration Plan

## Executive Summary

This document provides a comprehensive integration plan for deploying a demonstration website that implements CLIP (Contrastive Language-Image Pre-training) search functionality. The solution enables natural language search across image collections using semantic understanding rather than traditional metadata-based search.

**Technology Stack:**
- Frontend: React + Vite + TypeScript
- CLIP Model: OpenAI CLIP (via API or local inference)
- Vector Storage: In-memory / IndexedDB (demo) → PostgreSQL + pgvector (production)
- Deployment: Vercel / Netlify (frontend) + serverless functions

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Project Setup](#phase-1-project-setup)
4. [Phase 2: CLIP Integration](#phase-2-clip-integration)
5. [Phase 3: Frontend Development](#phase-3-frontend-development)
6. [Phase 4: Vector Search Implementation](#phase-4-vector-search-implementation)
7. [Phase 5: Image Upload & Processing](#phase-5-image-upload--processing)
8. [Phase 6: Deployment](#phase-6-deployment)
9. [Phase 7: White Label Customization](#phase-7-white-label-customization)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Performance Optimization](#performance-optimization)
12. [Appendix: Code Examples](#appendix-code-examples)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React + Vite + TypeScript Frontend             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │ Search Input │  │ Image Gallery│  │ Upload UI   │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Serverless)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ /api/search  │  │ /api/embed   │  │ /api/upload      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIP Model Service                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Text Encoder          Image Encoder                   │ │
│  │  (Transformer)         (Vision Transformer/ResNet)     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vector Database                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Image Embeddings (512D vectors)                       │ │
│  │  Cosine Similarity Search                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Image Ingestion**: Images → CLIP Image Encoder → 512D Vector → Store with metadata
2. **Search Query**: Text Query → CLIP Text Encoder → 512D Vector → Cosine Similarity → Ranked Results
3. **Results Display**: Top K matches → Fetch images → Render in gallery

---

## Prerequisites

### Development Environment

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 1.22.0
- Git
- Code editor (VS Code recommended)

### Accounts & API Keys

- **Option A**: OpenAI API key (for CLIP API access)
- **Option B**: Hugging Face account (for Inference API)
- **Option C**: Self-hosted CLIP service (requires Python environment)

### Knowledge Requirements

- React & TypeScript fundamentals
- REST API integration
- Basic understanding of vector embeddings
- Familiarity with serverless deployment

---

## Phase 1: Project Setup

### Step 1.1: Initialize Vite + React + TypeScript Project

```bash
# Create new Vite project
npm create vite@latest clip-search-demo -- --template react-ts

# Navigate to project
cd clip-search-demo

# Install dependencies
npm install

# Install additional required packages
npm install @tanstack/react-query axios zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 1.2: Project Structure

```
clip-search-demo/
├── public/
│   └── sample-images/          # Demo images (to be added)
├── src/
│   ├── api/
│   │   ├── clip.ts             # CLIP API client
│   │   └── search.ts           # Search API functions
│   ├── components/
│   │   ├── SearchBar.tsx       # Search input component
│   │   ├── ImageGallery.tsx    # Results display
│   │   ├── ImageUpload.tsx     # Upload interface
│   │   └── ImageCard.tsx       # Individual image card
│   ├── hooks/
│   │   ├── useSearch.ts        # Search hook
│   │   └── useImageUpload.ts   # Upload hook
│   ├── services/
│   │   ├── clipService.ts      # CLIP integration
│   │   ├── vectorStore.ts      # Vector storage/search
│   │   └── imageProcessor.ts   # Image processing utilities
│   ├── store/
│   │   └── imageStore.ts       # Global state management
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   ├── similarity.ts       # Cosine similarity calculation
│   │   └── imageUtils.ts       # Image handling utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/                        # Serverless functions (Vercel)
│   ├── embed.ts               # Generate embeddings
│   └── search.ts              # Perform vector search
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Step 1.3: Configure Tailwind CSS

```javascript
// tailwind.config.js
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
        }
      }
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### Step 1.4: Environment Configuration

```bash
# .env.example
VITE_CLIP_API_ENDPOINT=https://api.openai.com/v1/embeddings
VITE_CLIP_API_KEY=your_api_key_here
VITE_MODEL_NAME=openai/clip-vit-base-patch32
VITE_MAX_UPLOAD_SIZE=5242880
```

---

## Phase 2: CLIP Integration

### Step 2.1: Define TypeScript Types

```typescript
// src/types/index.ts

export interface ImageEmbedding {
  id: string;
  imageUrl: string;
  embedding: number[];
  metadata: {
    filename: string;
    uploadDate: Date;
    size: number;
    dimensions?: {
      width: number;
      height: number;
    };
    tags?: string[];
  };
}

export interface SearchResult {
  image: ImageEmbedding;
  similarity: number;
}

export interface CLIPResponse {
  embedding: number[];
}

export interface SearchQuery {
  query: string;
  topK?: number;
  threshold?: number;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}
```

### Step 2.2: CLIP Service Implementation

```typescript
// src/services/clipService.ts

import axios from 'axios';
import { CLIPResponse } from '../types';

class CLIPService {
  private apiEndpoint: string;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_CLIP_API_ENDPOINT;
    this.apiKey = import.meta.env.VITE_CLIP_API_KEY;
    this.modelName = import.meta.env.VITE_MODEL_NAME || 'openai/clip-vit-base-patch32';
  }

  /**
   * Generate embedding for text query
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post<CLIPResponse>(
        `${this.apiEndpoint}/text`,
        {
          text,
          model: this.modelName,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating text embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }

  /**
   * Generate embedding for image
   */
  async getImageEmbedding(imageData: string | Blob): Promise<number[]> {
    try {
      const formData = new FormData();
      
      if (typeof imageData === 'string') {
        // Base64 or URL
        formData.append('image', imageData);
      } else {
        // Blob/File
        formData.append('image', imageData);
      }
      
      formData.append('model', this.modelName);

      const response = await axios.post<CLIPResponse>(
        `${this.apiEndpoint}/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating image embedding:', error);
      throw new Error('Failed to generate image embedding');
    }
  }

  /**
   * Batch process multiple images
   */
  async batchGetImageEmbeddings(images: Blob[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const image of images) {
      const embedding = await this.getImageEmbedding(image);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}

export const clipService = new CLIPService();
```

### Step 2.3: Alternative CLIP Integration (Hugging Face)

```typescript
// src/services/clipService.huggingface.ts

import { HfInference } from '@huggingface/inference';
import { CLIPResponse } from '../types';

class HuggingFaceCLIPService {
  private hf: HfInference;
  private modelName: string;

  constructor() {
    this.hf = new HfInference(import.meta.env.VITE_HF_API_KEY);
    this.modelName = 'openai/clip-vit-base-patch32';
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.hf.featureExtraction({
        model: this.modelName,
        inputs: text,
      });
      
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error('Error with HF text embedding:', error);
      throw error;
    }
  }

  async getImageEmbedding(imageBlob: Blob): Promise<number[]> {
    try {
      const result = await this.hf.featureExtraction({
        model: this.modelName,
        inputs: imageBlob,
      });
      
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error('Error with HF image embedding:', error);
      throw error;
    }
  }
}

export const clipService = new HuggingFaceCLIPService();
```

---

## Phase 3: Frontend Development

### Step 3.1: Search Bar Component

```typescript
// src/components/SearchBar.tsx

import React, { useState, FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "Search images with natural language... (e.g., 'sunset over mountains')"
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl 
                   focus:border-primary-500 focus:outline-none focus:ring-2 
                   focus:ring-primary-200 transition-all disabled:bg-gray-100 
                   disabled:cursor-not-allowed shadow-sm"
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 px-6 py-2 bg-primary-600 text-white rounded-lg
                   hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                   transition-colors font-medium"
        >
          Search
        </button>
      </div>
      
      {/* Example queries */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-gray-500">Try:</span>
        {['a dog playing in park', 'city skyline at night', 'person coding'].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              onSearch(example);
            }}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full
                     text-gray-700 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
};
```

### Step 3.2: Image Card Component

```typescript
// src/components/ImageCard.tsx

import React, { useState } from 'react';
import { ImageEmbedding } from '../types';
import { Download, ExternalLink, Info } from 'lucide-react';

interface ImageCardProps {
  image: ImageEmbedding;
  similarity?: number;
  onClick?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  similarity,
  onClick 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const similarityPercentage = similarity 
    ? (similarity * 100).toFixed(1) 
    : null;

  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-md 
               hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 
                          rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={image.imageUrl}
          alt={image.metadata.filename}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300
                    group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Similarity Badge */}
        {similarityPercentage && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white 
                        text-xs font-semibold rounded backdrop-blur-sm">
            {similarityPercentage}% match
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 
                      to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 
                      group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="Show info"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <a
            href={image.imageUrl}
            download={image.metadata.filename}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          
          <a
            href={image.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      {/* Info Panel */}
      {showInfo && (
        <div className="p-3 text-sm border-t">
          <p className="font-medium truncate">{image.metadata.filename}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(image.metadata.uploadDate).toLocaleDateString()}
          </p>
          {image.metadata.dimensions && (
            <p className="text-gray-500 text-xs">
              {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
```

### Step 3.3: Image Gallery Component

```typescript
// src/components/ImageGallery.tsx

import React from 'react';
import { ImageCard } from './ImageCard';
import { SearchResult } from '../types';
import { ImageOff } from 'lucide-react';

interface ImageGalleryProps {
  results: SearchResult[];
  isLoading?: boolean;
  onImageClick?: (result: SearchResult) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  results,
  isLoading = false,
  onImageClick
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ImageOff className="w-16 h-16 mb-4" />
        <p className="text-xl font-medium">No images found</p>
        <p className="text-sm mt-2">Try a different search query</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {results.map((result) => (
        <ImageCard
          key={result.image.id}
          image={result.image}
          similarity={result.similarity}
          onClick={() => onImageClick?.(result)}
        />
      ))}
    </div>
  );
};
```

### Step 3.4: Image Upload Component

```typescript
// src/components/ImageUpload.tsx

import React, { useCallback, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadProgress } from '../types';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/*'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const processFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    const newUploads: UploadProgress[] = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        newUploads.push({
          filename: file.name,
          progress: 0,
          status: 'error',
          error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
        });
      } else {
        validFiles.push(file);
        newUploads.push({
          filename: file.name,
          progress: 0,
          status: 'pending'
        });
      }
    });

    setUploads(prev => [...prev, ...newUploads]);

    if (validFiles.length > 0) {
      try {
        await onUpload(validFiles);
        
        setUploads(prev => prev.map(upload => 
          newUploads.some(nu => nu.filename === upload.filename)
            ? { ...upload, status: 'complete', progress: 100 }
            : upload
        ));
      } catch (error) {
        setUploads(prev => prev.map(upload => 
          newUploads.some(nu => nu.filename === upload.filename)
            ? { ...upload, status: 'error', error: 'Upload failed' }
            : upload
        ));
      }
    }
  };

  const removeUpload = (filename: string) => {
    setUploads(prev => prev.filter(u => u.filename !== filename));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all
                  ${isDragging 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'}`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
        
        <p className="text-lg font-medium mb-2">
          {isDragging ? 'Drop images here' : 'Drag & drop images'}
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          or click to browse (max {(maxSize / 1024 / 1024).toFixed(0)}MB per file)
        </p>
        
        <label className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg 
                        hover:bg-primary-700 cursor-pointer transition-colors">
          <span>Choose Files</span>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.filename}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
            >
              {upload.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {upload.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              {upload.status === 'processing' && (
                <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 
                              rounded-full animate-spin flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.filename}</p>
                {upload.error && (
                  <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                )}
              </div>
              
              <button
                onClick={() => removeUpload(upload.filename)}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Phase 4: Vector Search Implementation

### Step 4.1: Cosine Similarity Utility

```typescript
// src/utils/similarity.ts

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return norm === 0 ? vec : vec.map(val => val / norm);
}

/**
 * Calculate similarities for all vectors in a batch
 */
export function batchCosineSimilarity(
  queryVec: number[],
  vectors: number[][]
): number[] {
  return vectors.map(vec => cosineSimilarity(queryVec, vec));
}
```

### Step 4.2: Vector Store Service

```typescript
// src/services/vectorStore.ts

import { ImageEmbedding, SearchResult } from '../types';
import { cosineSimilarity } from '../utils/similarity';

class VectorStore {
  private embeddings: Map<string, ImageEmbedding>;

  constructor() {
    this.embeddings = new Map();
    this.loadFromLocalStorage();
  }

  /**
   * Add an image embedding to the store
   */
  add(embedding: ImageEmbedding): void {
    this.embeddings.set(embedding.id, embedding);
    this.saveToLocalStorage();
  }

  /**
   * Add multiple embeddings
   */
  addBatch(embeddings: ImageEmbedding[]): void {
    embeddings.forEach(emb => this.embeddings.set(emb.id, emb));
    this.saveToLocalStorage();
  }

  /**
   * Search for similar images
   */
  search(
    queryEmbedding: number[],
    topK: number = 10,
    threshold: number = 0.0
  ): SearchResult[] {
    const results: SearchResult[] = [];

    this.embeddings.forEach((imageEmb) => {
      const similarity = cosineSimilarity(queryEmbedding, imageEmb.embedding);
      
      if (similarity >= threshold) {
        results.push({
          image: imageEmb,
          similarity
        });
      }
    });

    // Sort by similarity (descending) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Get embedding by ID
   */
  get(id: string): ImageEmbedding | undefined {
    return this.embeddings.get(id);
  }

  /**
   * Get all embeddings
   */
  getAll(): ImageEmbedding[] {
    return Array.from(this.embeddings.values());
  }

  /**
   * Remove an embedding
   */
  remove(id: string): boolean {
    const deleted = this.embeddings.delete(id);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  /**
   * Clear all embeddings
   */
  clear(): void {
    this.embeddings.clear();
    this.saveToLocalStorage();
  }

  /**
   * Get store statistics
   */
  getStats(): { count: number; dimensions: number | null } {
    const count = this.embeddings.size;
    const firstEmb = this.embeddings.values().next().value;
    const dimensions = firstEmb ? firstEmb.embedding.length : null;
    
    return { count, dimensions };
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.embeddings.entries());
      localStorage.setItem('clip_embeddings', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('clip_embeddings');
      if (data) {
        const entries: [string, ImageEmbedding][] = JSON.parse(data);
        this.embeddings = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      this.embeddings = new Map();
    }
  }
}

export const vectorStore = new VectorStore();
```

### Step 4.3: Image Processing Service

```typescript
// src/services/imageProcessor.ts

import { ImageEmbedding } from '../types';
import { clipService } from './clipService';
import { vectorStore } from './vectorStore';
import { v4 as uuidv4 } from 'uuid';

class ImageProcessor {
  /**
   * Process and store a single image
   */
  async processImage(file: File): Promise<ImageEmbedding> {
    // Generate embedding
    const embedding = await clipService.getImageEmbedding(file);
    
    // Create image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);
    
    // Create embedding object
    const imageEmbedding: ImageEmbedding = {
      id: uuidv4(),
      imageUrl,
      embedding,
      metadata: {
        filename: file.name,
        uploadDate: new Date(),
        size: file.size,
        dimensions,
      },
    };
    
    // Store in vector store
    vectorStore.add(imageEmbedding);
    
    return imageEmbedding;
  }

  /**
   * Process multiple images
   */
  async processImages(files: File[]): Promise<ImageEmbedding[]> {
    const results: ImageEmbedding[] = [];
    
    for (const file of files) {
      try {
        const embedding = await this.processImage(file);
        results.push(embedding);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Resize image if needed (for faster processing)
   */
  async resizeImage(file: File, maxWidth: number = 512): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
}

export const imageProcessor = new ImageProcessor();
```

---

## Phase 5: Image Upload & Processing

### Step 5.1: Custom Hooks

```typescript
// src/hooks/useSearch.ts

import { useState } from 'react';
import { SearchResult } from '../types';
import { clipService } from '../services/clipService';
import { vectorStore } from '../services/vectorStore';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, topK: number = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate query embedding
      const queryEmbedding = await clipService.getTextEmbedding(query);
      
      // Search vector store
      const searchResults = vectorStore.search(queryEmbedding, topK, 0.1);
      
      setResults(searchResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
}
```

```typescript
// src/hooks/useImageUpload.ts

import { useState } from 'react';
import { imageProcessor } from '../services/imageProcessor';
import { ImageEmbedding } from '../types';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]): Promise<ImageEmbedding[]> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const results: ImageEmbedding[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const embedding = await imageProcessor.processImage(files[i]);
        results.push(embedding);
        setProgress(((i + 1) / files.length) * 100);
      }
      
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  return {
    uploadImages,
    isUploading,
    progress,
    error,
  };
}
```

### Step 5.2: Main App Component

```typescript
// src/App.tsx

import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ImageGallery } from './components/ImageGallery';
import { ImageUpload } from './components/ImageUpload';
import { useSearch } from './hooks/useSearch';
import { useImageUpload } from './hooks/useImageUpload';
import { Upload, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const { results, isLoading, search } = useSearch();
  const { uploadImages, isUploading } = useImageUpload();

  const handleUpload = async (files: File[]) => {
    await uploadImages(files);
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            CLIP Image Search
          </h1>
          <p className="text-gray-600 mt-1">
            Search images using natural language
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
                        border-b-2 ${
                          activeTab === 'search'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
                        border-b-2 ${
                          activeTab === 'upload'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'search' ? (
          <div className="space-y-8">
            <SearchBar onSearch={search} isLoading={isLoading} />
            <ImageGallery results={results} isLoading={isLoading} />
          </div>
        ) : (
          <ImageUpload onUpload={handleUpload} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Powered by CLIP - Contrastive Language-Image Pre-training</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

---

## Phase 6: Deployment

### Step 6.1: Vercel Serverless Functions

```typescript
// api/embed.ts (Vercel Serverless Function)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, image } = req.body;

  try {
    let embedding: number[];

    if (text) {
      // Generate text embedding
      const response = await axios.post(
        process.env.CLIP_API_ENDPOINT + '/text',
        {
          text,
          model: process.env.CLIP_MODEL_NAME,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLIP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      embedding = response.data.embedding;
    } else if (image) {
      // Generate image embedding
      const response = await axios.post(
        process.env.CLIP_API_ENDPOINT + '/image',
        { image },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLIP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      embedding = response.data.embedding;
    } else {
      return res.status(400).json({ error: 'Text or image required' });
    }

    return res.status(200).json({ embedding });
  } catch (error) {
    console.error('Embedding error:', error);
    return res.status(500).json({ error: 'Failed to generate embedding' });
  }
}
```

### Step 6.2: Build Configuration

```javascript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 6.3: Deployment Scripts

```json
// package.json (scripts section)

{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod"
  }
}
```

```yaml
# vercel.json

{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "VITE_CLIP_API_ENDPOINT": "@clip-api-endpoint",
    "VITE_CLIP_API_KEY": "@clip-api-key"
  }
}
```

---

## Phase 7: White Label Customization

### Step 7.1: Theme Configuration

```typescript
// src/config/theme.ts

export interface ThemeConfig {
  brandName: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    maxWidth: string;
    headerHeight: string;
  };
}

export const defaultTheme: ThemeConfig = {
  brandName: 'CLIP Search',
  colors: {
    primary: '#0ea5e9',
    secondary: '#6366f1',
    accent: '#f59e0b',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  layout: {
    maxWidth: '1280px',
    headerHeight: '64px',
  },
};

// Load theme from environment or config file
export function loadTheme(): ThemeConfig {
  return {
    ...defaultTheme,
    brandName: import.meta.env.VITE_BRAND_NAME || defaultTheme.brandName,
    // Additional customizations from env vars
  };
}
```

### Step 7.2: Customization Guide

Create a `CUSTOMIZATION.md` file for clients:

```markdown
# White Label Customization Guide

## Branding

1. Update `.env.local`:
   ```
   VITE_BRAND_NAME=Your Company Name
   VITE_BRAND_LOGO=/logo.svg
   VITE_PRIMARY_COLOR=#your-color
   ```

2. Replace logo files in `/public`:
   - `logo.svg` - Main logo
   - `favicon.ico` - Browser favicon
   - `og-image.png` - Social media preview

3. Update `index.html` metadata:
   - Title
   - Description
   - Open Graph tags

## Styling

Customize colors in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      // Your custom colors
    }
  }
}
```

## Features

Enable/disable features in `.env.local`:
```
VITE_ENABLE_UPLOAD=true
VITE_ENABLE_DOWNLOAD=false
VITE_MAX_RESULTS=20
```
```

---

## Testing & Quality Assurance

### Step 8.1: Unit Tests

```typescript
// src/utils/similarity.test.ts

import { describe, it, expect } from 'vitest';
import { cosineSimilarity, normalizeVector } from './similarity';

describe('Similarity Utils', () => {
  it('should calculate cosine similarity correctly', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBe(0);
  });

  it('should return 1 for identical vectors', () => {
    const vec = [1, 2, 3];
    const similarity = cosineSimilarity(vec, vec);
    expect(similarity).toBeCloseTo(1, 5);
  });

  it('should normalize vectors correctly', () => {
    const vec = [3, 4];
    const normalized = normalizeVector(vec);
    expect(normalized[0]).toBeCloseTo(0.6, 5);
    expect(normalized[1]).toBeCloseTo(0.8, 5);
  });
});
```

### Step 8.2: Integration Tests

```typescript
// src/services/vectorStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { VectorStore } from './vectorStore';
import { ImageEmbedding } from '../types';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore();
    store.clear();
  });

  it('should add and retrieve embeddings', () => {
    const embedding: ImageEmbedding = {
      id: 'test-1',
      imageUrl: 'test.jpg',
      embedding: [1, 2, 3],
      metadata: {
        filename: 'test.jpg',
        uploadDate: new Date(),
        size: 1000,
      },
    };

    store.add(embedding);
    const retrieved = store.get('test-1');
    
    expect(retrieved).toEqual(embedding);
  });

  it('should search and return sorted results', () => {
    // Add test embeddings
    const embeddings: ImageEmbedding[] = [
      {
        id: '1',
        imageUrl: 'a.jpg',
        embedding: [1, 0, 0],
        metadata: { filename: 'a.jpg', uploadDate: new Date(), size: 1000 },
      },
      {
        id: '2',
        imageUrl: 'b.jpg',
        embedding: [0.9, 0.1, 0],
        metadata: { filename: 'b.jpg', uploadDate: new Date(), size: 1000 },
      },
    ];

    store.addBatch(embeddings);
    
    const results = store.search([1, 0, 0], 2);
    
    expect(results).toHaveLength(2);
    expect(results[0].image.id).toBe('1');
  });
});
```

---

## Performance Optimization

### Step 9.1: Code Splitting

```typescript
// src/App.tsx (lazy loading)

import { lazy, Suspense } from 'react';

const ImageGallery = lazy(() => import('./components/ImageGallery'));
const ImageUpload = lazy(() => import('./components/ImageUpload'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activeTab === 'search' ? <ImageGallery /> : <ImageUpload />}
    </Suspense>
  );
}
```

### Step 9.2: Image Optimization

```typescript
// src/utils/imageUtils.ts

export async function optimizeImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error('Blob creation failed'));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
}
```

### Step 9.3: Caching Strategy

```typescript
// src/services/cacheService.ts

class CacheService {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number;

  constructor(ttlMinutes: number = 30) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
```

---

## Appendix: Code Examples

### Production-Ready Vector Store with PostgreSQL

```typescript
// src/services/postgresVectorStore.ts

import { Pool } from 'pg';
import { ImageEmbedding, SearchResult } from '../types';

class PostgresVectorStore {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.initialize();
  }

  private async initialize() {
    await this.pool.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      
      CREATE TABLE IF NOT EXISTS image_embeddings (
        id UUID PRIMARY KEY,
        image_url TEXT NOT NULL,
        embedding vector(512) NOT NULL,
        metadata JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS embedding_idx 
      ON image_embeddings 
      USING ivfflat (embedding vector_cosine_ops);
    `);
  }

  async add(embedding: ImageEmbedding): Promise<void> {
    await this.pool.query(
      `INSERT INTO image_embeddings (id, image_url, embedding, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        embedding.id,
        embedding.imageUrl,
        JSON.stringify(embedding.embedding),
        JSON.stringify(embedding.metadata),
      ]
    );
  }

  async search(
    queryEmbedding: number[],
    topK: number = 10
  ): Promise<SearchResult[]> {
    const result = await this.pool.query(
      `SELECT 
         id, 
         image_url, 
         embedding, 
         metadata,
         1 - (embedding <=> $1) as similarity
       FROM image_embeddings
       ORDER BY embedding <=> $1
       LIMIT $2`,
      [JSON.stringify(queryEmbedding), topK]
    );

    return result.rows.map(row => ({
      image: {
        id: row.id,
        imageUrl: row.image_url,
        embedding: JSON.parse(row.embedding),
        metadata: row.metadata,
      },
      similarity: row.similarity,
    }));
  }
}

export const postgresVectorStore = new PostgresVectorStore();
```

---

## Summary

This white label integration plan provides:

1. **Complete architecture** for CLIP-based image search
2. **Step-by-step implementation** guide with TypeScript/React
3. **Modular components** that can be customized
4. **Multiple deployment options** (Vercel, Netlify, self-hosted)
5. **Production-ready code** with error handling and optimization
6. **Extensible design** for adding features

### Next Steps

1. Set up development environment
2. Configure CLIP API access
3. Implement core components
4. Add image collection (when ready)
5. Test thoroughly
6. Deploy to staging
7. Customize branding
8. Deploy to production

### Support Resources

- CLIP Paper: https://arxiv.org/abs/2103.00020
- OpenAI CLIP: https://github.com/openai/CLIP
- Hugging Face Transformers: https://huggingface.co/docs/transformers
- Vector Databases: Pinecone, Weaviate, Qdrant, pgvector

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Ready for Implementation
