# Cloudflare R2 Object Storage Integration Guide

## Overview

This guide provides step-by-step instructions for integrating Cloudflare R2 Object Storage into a React + Vite + TypeScript application for image management. R2 is Cloudflare's S3-compatible object storage service with zero egress fees.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare R2 Setup](#cloudflare-r2-setup)
3. [Backend Setup (Node.js/Express)](#backend-setup)
4. [Frontend Setup (React + Vite + TypeScript)](#frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Implementation](#implementation)
7. [Security Considerations](#security-considerations)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Active Cloudflare account
- Node.js (v18 or higher)
- Existing React + Vite + TypeScript application
- Basic understanding of REST APIs
- Backend server (Node.js/Express recommended for this guide)

---

## Cloudflare R2 Setup

### Step 1: Create an R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage** from the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `my-app-images`)
5. Select your preferred location
6. Click **Create bucket**

### Step 2: Generate API Tokens

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure token permissions:
   - **Token name**: `r2-image-upload-token`
   - **Permissions**: Object Read & Write
   - **Bucket scope**: Select your created bucket
4. Click **Create API token**
5. **Important**: Save the following credentials immediately:
   - Access Key ID
   - Secret Access Key
   - Jurisdiction-specific endpoint (e.g., `https://[account-id].r2.cloudflarestorage.com`)

### Step 3: Configure Public Access (Optional)

If you need public read access to images:

1. Go to your bucket settings
2. Navigate to **Settings** > **Public access**
3. Enable **R2.dev subdomain** or configure a custom domain
4. Note your public bucket URL (e.g., `https://pub-[hash].r2.dev`)

---

## Backend Setup

### Step 1: Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer express cors dotenv
npm install --save-dev @types/multer @types/express @types/cors
```

### Step 2: Create Environment Variables

Create a `.env` file in your backend directory:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=my-app-images
R2_PUBLIC_URL=https://pub-[hash].r2.dev

# Server Configuration
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 3: Configure R2 Client

Create `src/config/r2.config.ts`:

```typescript
import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing required R2 environment variables');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
```

### Step 4: Create Upload Service

Create `src/services/r2.service.ts`:

```typescript
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2.config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}

export class R2Service {
  /**
   * Upload a file to R2
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'images'
  ): Promise<UploadResult> {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // Prepare upload command
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadDate: new Date().toISOString(),
      },
    });

    // Upload to R2
    await r2Client.send(command);

    // Generate signed URL for private access
    const signedUrl = await this.getSignedUrl(key);

    // Generate public URL (if public access is enabled)
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return {
      key,
      url: signedUrl,
      publicUrl,
    };
  }

  /**
   * Generate a signed URL for temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'images'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  }
}

export const r2Service = new R2Service();
```

### Step 5: Create Upload Controller

Create `src/controllers/upload.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { r2Service } from '../services/r2.service';

export class UploadController {
  /**
   * Handle single file upload
   */
  async uploadSingle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const result = await r2Service.uploadFile(req.file, req.body.folder || 'images');

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file',
      });
    }
  }

  /**
   * Handle multiple file uploads
   */
  async uploadMultiple(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        res.status(400).json({ error: 'No files provided' });
        return;
      }

      const results = await r2Service.uploadMultipleFiles(
        req.files,
        req.body.folder || 'images'
      );

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload files',
      });
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({ error: 'File key is required' });
        return;
      }

      await r2Service.deleteFile(key);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete file',
      });
    }
  }

  /**
   * Get a signed URL for a file
   */
  async getSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

      if (!key) {
        res.status(400).json({ error: 'File key is required' });
        return;
      }

      const signedUrl = await r2Service.getSignedUrl(key, expiresIn);

      res.status(200).json({
        success: true,
        data: { url: signedUrl },
      });
    } catch (error) {
      console.error('Signed URL error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate signed URL',
      });
    }
  }
}

export const uploadController = new UploadController();
```

### Step 6: Create Upload Routes

Create `src/routes/upload.routes.ts`:

```typescript
import express from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Routes
router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);
router.delete('/:key', uploadController.deleteFile);
router.get('/signed-url/:key', uploadController.getSignedUrl);

export default router;
```

### Step 7: Setup Express Server

Create `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
npm install axios react-dropzone
npm install --save-dev @types/react-dropzone
```

### Step 2: Create Environment Variables

Create `.env` in your React project root:

```env
VITE_API_URL=http://localhost:3001
```

### Step 3: Create API Client

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Step 4: Create Upload Service

Create `src/services/upload.service.ts`:

```typescript
import { apiClient } from './api';

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}

export interface UploadResponse {
  success: boolean;
  data: UploadResult | UploadResult[];
  error?: string;
}

export class UploadService {
  /**
   * Upload a single file
   */
  async uploadSingle(file: File, folder?: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<UploadResponse>('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed');
    }

    return response.data.data as UploadResult;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], folder?: string): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<UploadResponse>('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed');
    }

    return response.data.data as UploadResult[];
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    const response = await apiClient.delete(`/api/upload/${encodeURIComponent(key)}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Delete failed');
    }
  }

  /**
   * Get a signed URL
   */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    const response = await apiClient.get(`/api/upload/signed-url/${encodeURIComponent(key)}`, {
      params: { expiresIn },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get signed URL');
    }

    return response.data.data.url;
  }
}

export const uploadService = new UploadService();
```

### Step 5: Create Upload Hook

Create `src/hooks/useUpload.ts`:

```typescript
import { useState } from 'react';
import { uploadService, UploadResult } from '../services/upload.service';

interface UseUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadSingle: (file: File, folder?: string) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[], folder?: string) => Promise<UploadResult[] | null>;
  deleteFile: (key: string) => Promise<boolean>;
  reset: () => void;
}

export const useUpload = (): UseUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadSingle = async (file: File, folder?: string): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress (in production, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadService.uploadSingle(file, folder);

      clearInterval(progressInterval);
      setProgress(100);
      setUploading(false);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      return null;
    }
  };

  const uploadMultiple = async (files: File[], folder?: string): Promise<UploadResult[] | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const results = await uploadService.uploadMultiple(files, folder);

      clearInterval(progressInterval);
      setProgress(100);
      setUploading(false);

      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      return null;
    }
  };

  const deleteFile = async (key: string): Promise<boolean> => {
    setError(null);

    try {
      await uploadService.deleteFile(key);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploading,
    progress,
    error,
    uploadSingle,
    uploadMultiple,
    deleteFile,
    reset,
  };
};
```

### Step 6: Create Image Upload Component

Create `src/components/ImageUploader.tsx`:

```typescript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../hooks/useUpload';
import { UploadResult } from '../services/upload.service';

interface ImageUploaderProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  maxFiles?: number;
  folder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  maxFiles = 10,
  folder = 'images',
}) => {
  const { uploading, progress, error, uploadMultiple, reset } = useUpload();
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    reset();

    if (acceptedFiles.length === 0) return;

    const results = await uploadMultiple(acceptedFiles, folder);

    if (results) {
      setUploadedImages((prev) => [...prev, ...results]);
      onUploadComplete?.(results);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles,
    disabled: uploading,
  });

  return (
    <div className="image-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <p>Uploading... {progress}%</p>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '10px',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#4CAF50',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            {isDragActive ? (
              <p>Drop the images here...</p>
            ) : (
              <p>Drag & drop images here, or click to select files</p>
            )}
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              (Max {maxFiles} files, JPEG, PNG, GIF, or WebP)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          Error: {error}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Uploaded Images:</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={image.publicUrl || image.url}
                  alt={`Uploaded ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '8px', fontSize: '12px' }}>
                  <p style={{ margin: 0, wordBreak: 'break-all' }}>{image.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Step 7: Use the Component

Create `src/App.tsx`:

```typescript
import React from 'react';
import { ImageUploader } from './components/ImageUploader';
import { UploadResult } from './services/upload.service';

function App() {
  const handleUploadComplete = (results: UploadResult[]) => {
    console.log('Upload complete:', results);
    // Handle the uploaded images (e.g., save to database, update state, etc.)
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Image Upload with Cloudflare R2</h1>
      <ImageUploader
        onUploadComplete={handleUploadComplete}
        maxFiles={5}
        folder="user-uploads"
      />
    </div>
  );
}

export default App;
```

---

## Environment Configuration

### Backend `.env`

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=my-app-images
R2_PUBLIC_URL=https://pub-xyz.r2.dev

# Server
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3001
```

---

## Security Considerations

### 1. File Validation

Always validate files on the backend:

```typescript
// Enhanced file validation
const validateFile = (file: Express.Multer.File): boolean => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  return true;
};
```

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many upload requests, please try again later',
});

router.post('/single', uploadLimiter, upload.single('file'), uploadController.uploadSingle);
```

### 3. Authentication

Add authentication middleware:

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // Verify token (implement your auth logic)
    // const user = await verifyToken(token);
    // req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply to routes
router.post('/single', authenticate, upload.single('file'), uploadController.uploadSingle);
```

### 4. CORS Configuration

Configure CORS properly for production:

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5. Secure File Names

Sanitize file names to prevent directory traversal:

```typescript
import path from 'path';

const sanitizeFileName = (fileName: string): string => {
  // Remove any path components
  const baseName = path.basename(fileName);
  
  // Remove special characters except dots and hyphens
  return baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
};
```

---

## Best Practices

### 1. Image Optimization

Add image optimization before upload:

```bash
npm install sharp
```

```typescript
import sharp from 'sharp';

export const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
};

// Use in upload service
const optimizedBuffer = await optimizeImage(file.buffer);
```

### 2. Generate Thumbnails

```typescript
export const generateThumbnail = async (buffer: Buffer): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(300, 300, {
      fit: 'cover',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
};

// Upload both original and thumbnail
const [original, thumbnail] = await Promise.all([
  r2Service.uploadFile(file, 'images'),
  r2Service.uploadFile({ ...file, buffer: thumbnailBuffer }, 'thumbnails'),
]);
```

### 3. Error Handling

Implement comprehensive error handling:

```typescript
export class R2Error extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'R2Error';
  }
}

// Use in service
try {
  await r2Client.send(command);
} catch (error) {
  if (error.name === 'NoSuchBucket') {
    throw new R2Error('Bucket not found', 'BUCKET_NOT_FOUND', 404);
  }
  throw new R2Error('Upload failed', 'UPLOAD_ERROR', 500);
}
```

### 4. Logging

Add logging for debugging:

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log uploads
logger.info('File uploaded', {
  key: result.key,
  size: file.size,
  mimetype: file.mimetype,
});
```

### 5. Caching

Implement caching for signed URLs:

```typescript
import NodeCache from 'node-cache';

const urlCache = new NodeCache({ stdTTL: 3000 }); // 50 minutes

export const getCachedSignedUrl = async (key: string): Promise<string> => {
  const cached = urlCache.get<string>(key);
  
  if (cached) {
    return cached;
  }

  const url = await r2Service.getSignedUrl(key);
  urlCache.set(key, url);
  
  return url;
};
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: "Access to fetch has been blocked by CORS policy"

**Solution**: Ensure backend CORS configuration matches frontend origin:

```typescript
// Backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

#### 2. Invalid Credentials

**Problem**: "SignatureDoesNotMatch" or "InvalidAccessKeyId"

**Solution**: Verify R2 credentials in `.env`:
- Check Access Key ID and Secret Access Key
- Ensure no extra spaces or line breaks
- Regenerate tokens if necessary

#### 3. File Size Errors

**Problem**: "Request Entity Too Large"

**Solution**: Increase upload limits:

```typescript
// Backend
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
```

#### 4. Public Access Issues

**Problem**: Images not accessible via public URL

**Solution**: 
1. Enable R2.dev subdomain in bucket settings
2. Or configure custom domain with proper DNS records
3. Verify bucket has public access enabled

#### 5. Slow Upload Speeds

**Problem**: Uploads taking too long

**Solution**:
- Implement client-side image compression
- Use thumbnail generation
- Enable multipart uploads for large files
- Consider using pre-signed URLs for direct uploads

### Debug Mode

Enable debug logging:

```typescript
// Backend
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      files: req.files,
    });
    next();
  });
}
```

---

## Advanced Features

### 1. Direct Browser Upload with Pre-signed URLs

```typescript
// Backend: Generate pre-signed POST URL
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export const generatePresignedPost = async (
  fileName: string,
  fileType: string
): Promise<{ url: string; fields: Record<string, string> }> => {
  const key = `uploads/${uuidv4()}-${fileName}`;

  const { url, fields } = await createPresignedPost(r2Client, {
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 10485760], // Max 10MB
      ['starts-with', '$Content-Type', 'image/'],
    ],
    Fields: {
      'Content-Type': fileType,
    },
    Expires: 600, // 10 minutes
  });

  return { url, fields };
};

// Frontend: Direct upload
const uploadDirectly = async (file: File) => {
  const { url, fields } = await getPresignedPost(file.name, file.type);

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);

  await fetch(url, {
    method: 'POST',
    body: formData,
  });
};
```

### 2. Image Transformation with Cloudflare Images

Integrate Cloudflare Images for on-the-fly transformations:

```typescript
// Generate transformed image URL
const getTransformedImageUrl = (key: string, width: number, height: number): string => {
  return `${R2_PUBLIC_URL}/cdn-cgi/image/width=${width},height=${height},fit=cover/${key}`;
};
```

### 3. Batch Operations

```typescript
export const batchDeleteFiles = async (keys: string[]): Promise<void> => {
  const deletePromises = keys.map((key) => r2Service.deleteFile(key));
  await Promise.all(deletePromises);
};
```

---

## Production Checklist

- [ ] Environment variables configured correctly
- [ ] HTTPS enabled for production
- [ ] Rate limiting implemented
- [ ] Authentication middleware added
- [ ] File validation on backend
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] File size limits set
- [ ] Image optimization enabled
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Documentation updated

---

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [React Dropzone](https://react-dropzone.js.org/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

---

## License

This integration guide is provided as-is for educational and implementation purposes.

---

## Support

For issues specific to this integration guide, please review the Troubleshooting section. For Cloudflare R2 specific issues, consult the official Cloudflare documentation.
