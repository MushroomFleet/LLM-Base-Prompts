# Gmail API with OAuth 2.0 Integration Guide
## Complete Setup for React + Vite + TypeScript + Apache2 on Ubuntu

---

## Introduction

This comprehensive guide walks you through integrating the Gmail API with OAuth 2.0 authentication to enable secure email sending from your web application. This implementation uses a backend server architecture to protect credentials and ensure secure email delivery.

### Technology Stack

**Frontend Stack:**
- **React 18+** - Modern UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript for better code quality
- **Axios** - HTTP client for API communication

**Backend Stack:**
- **Node.js** - JavaScript runtime environment
- **Express** - Minimal web application framework
- **TypeScript** - Type-safe backend development
- **googleapis** - Official Google APIs Node.js client
- **helmet** - Security middleware for Express
- **express-rate-limit** - Rate limiting middleware

**Infrastructure:**
- **Apache2** - Web server and reverse proxy
- **Ubuntu 22.04 LTS** - Server operating system
- **Let's Encrypt** - Free SSL/TLS certificates
- **systemd** - Service management

**Google Services:**
- **Gmail API** - For sending emails programmatically
- **Google Cloud Console** - For project and credential management
- **Google OAuth 2.0** - Secure authentication and authorization

### Architecture Overview

This guide implements a three-tier architecture:

1. **Frontend (React + Vite)**: Handles user interface, form validation, and initiates email requests
2. **Backend (Node.js + Express)**: Manages OAuth flows, authenticates with Gmail API, and sends emails securely
3. **Web Server (Apache2)**: Serves static frontend files and proxies API requests to the backend

**Why Backend Email Sending?**  
Client-side email sending would expose your OAuth credentials and API keys to the browser, creating severe security vulnerabilities. This architecture keeps all sensitive credentials server-side while providing a seamless user experience.

---

## Phase 1: Google Cloud Console Setup

### Step 1.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project details:
   - **Project name**: `example-mail-service`
   - **Organization**: Select your Google Workspace organization (if applicable)
4. Click **"Create"**
5. Wait for project creation and select the new project

### Step 1.2: Enable Gmail API

1. In the Google Cloud Console, navigate to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"** in the results
4. Click **"Enable"**
5. Wait for the API to be enabled (usually takes a few seconds)

### Step 1.3: Configure OAuth Consent Screen

1. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"Internal"** (for Google Workspace users only) or **"External"** (if you need external users)
   - For internal: Only users in your Google Workspace organization can use the app
   - For external: You'll need to go through verification for production use
3. Click **"Create"**

4. **Fill in App Information:**
   - **App name**: `Example Mail Service`
   - **User support email**: support@example.com
   - **App logo**: (Optional) Upload your logo
   - **Application home page**: https://example.com
   - **Application privacy policy**: https://example.com/privacy
   - **Application terms of service**: https://example.com/terms
   - **Authorized domains**: Add `example.com`
   - **Developer contact email**: dev@example.com

5. Click **"Save and Continue"**

6. **Add Scopes:**
   - Click **"Add or Remove Scopes"**
   - Search and select: `https://www.googleapis.com/auth/gmail.send`
   - This scope allows sending emails on behalf of the user
   - Click **"Update"**
   - Click **"Save and Continue"**

7. **Test Users** (if External):
   - Add test user emails if you selected External
   - Click **"Save and Continue"**

8. Review summary and click **"Back to Dashboard"**

### Step 1.4: Create OAuth 2.0 Credentials

1. Navigate to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen (you already did this)
4. Select **"Web application"** as the application type
5. Configure the OAuth client:
   - **Name**: `Example Web Client`
   - **Authorized JavaScript origins**: 
     - `https://example.com`
     - `http://localhost:5173` (for local development)
   - **Authorized redirect URIs**:
     - `https://example.com/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback` (for local backend dev)

6. Click **"Create"**
7. **IMPORTANT**: Copy and save:
   - **Client ID**: `your-client-id.apps.googleusercontent.com`
   - **Client Secret**: `your-client-secret`
   - Store these securely - you'll need them for your backend

8. Download the JSON file (optional but recommended for backup)

### Step 1.5: Create Service Account (Alternative Approach)

**Note**: If you want to send emails from a specific account without user interaction, create a service account with domain-wide delegation:

1. Navigate to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"+ Create Service Account"**
3. Enter details:
   - **Service account name**: `gmail-sender`
   - **Description**: `Service account for sending emails via Gmail API`
4. Click **"Create and Continue"**
5. Skip role assignment (click "Continue")
6. Click **"Done"**
7. Click on the created service account
8. Go to **"Keys"** tab → **"Add Key"** → **"Create new key"**
9. Select **JSON** format and click **"Create"**
10. Save the downloaded JSON file securely

**Enable Domain-Wide Delegation:**
1. Click on the service account
2. Check **"Enable Google Workspace Domain-wide Delegation"**
3. Note the **Client ID** shown
4. Go to [Google Workspace Admin Console](https://admin.google.com/)
5. Navigate to **Security** → **API Controls** → **Domain-wide Delegation**
6. Click **"Add new"**
7. Enter the Client ID and add scope: `https://www.googleapis.com/auth/gmail.send`
8. Click **"Authorize"**

---

## Phase 2: Backend Setup (Node.js + Express)

### Step 2.1: Create Backend Project Structure

```bash
cd /var/www/example.com
mkdir backend
cd backend
npm init -y
```

### Step 2.2: Install Dependencies

```bash
npm install express cors dotenv googleapis nodemailer helmet express-rate-limit
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
```

### Step 2.3: Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 2.4: Create Project Structure

```bash
mkdir -p src/{routes,controllers,middleware,utils,config}
touch src/server.ts
touch src/routes/mail.routes.ts
touch src/controllers/mail.controller.ts
touch src/config/gmail.config.ts
touch src/utils/gmail.utils.ts
touch .env
touch .env.example
```

### Step 2.5: Configure Environment Variables

Create `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://example.com/api/auth/google/callback

# Service Account (if using)
GOOGLE_SERVICE_ACCOUNT_EMAIL=gmail-sender@example-mail-service.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_PATH=/path/to/service-account-key.json

# Email Configuration
SENDER_EMAIL=noreply@example.com
SENDER_NAME=Example Company

# Security
ALLOWED_ORIGINS=https://example.com,http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

Create `.env.example`:

```env
PORT=3000
NODE_ENV=development
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
SENDER_EMAIL=
SENDER_NAME=
ALLOWED_ORIGINS=
JWT_SECRET=
```

### Step 2.6: Create Gmail Configuration

**File: `src/config/gmail.config.ts`**

```typescript
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

// OAuth2 Client Configuration
export const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for sending emails
export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Service Account Configuration (if using)
export const getServiceAccountAuth = () => {
  const keyPath = process.env.GOOGLE_PRIVATE_KEY_PATH;
  
  if (!keyPath) {
    throw new Error('Service account key path not configured');
  }

  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  return new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    SCOPES,
    process.env.SENDER_EMAIL // Impersonate this user
  );
};

export const gmail = google.gmail('v1');
```

### Step 2.7: Create Gmail Utilities

**File: `src/utils/gmail.utils.ts`**

```typescript
import { gmail, oauth2Client, getServiceAccountAuth } from '../config/gmail.config';
import { GaxiosResponse } from 'gaxios';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Create email message in RFC 2822 format
 */
const createMessage = (options: EmailOptions): string => {
  const { to, subject, text, html, from } = options;
  
  const fromEmail = from || `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`;
  
  const messageParts = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html || text || ''
  ];

  const message = messageParts.join('\n');
  
  // Encode message in base64url format
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
};

/**
 * Send email using OAuth2 (user authentication)
 */
export const sendEmailWithOAuth = async (options: EmailOptions): Promise<any> => {
  try {
    const raw = createMessage(options);

    const response = await gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      requestBody: {
        raw: raw,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending email with OAuth:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send email using Service Account (automated sending)
 */
export const sendEmailWithServiceAccount = async (options: EmailOptions): Promise<any> => {
  try {
    const auth = getServiceAccountAuth();
    const raw = createMessage(options);

    const response = await gmail.users.messages.send({
      auth: auth,
      userId: 'me',
      requestBody: {
        raw: raw,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending email with service account:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate OAuth URL for user authentication
 */
export const generateAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error: any) {
    console.error('Error getting tokens:', error.message);
    throw new Error(`Failed to get tokens: ${error.message}`);
  }
};
```

### Step 2.8: Create Mail Controller

**File: `src/controllers/mail.controller.ts`**

```typescript
import { Request, Response } from 'express';
import {
  sendEmailWithOAuth,
  sendEmailWithServiceAccount,
  isValidEmail,
  generateAuthUrl,
  getTokensFromCode,
} from '../utils/gmail.utils';

/**
 * Send email endpoint
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, text, html } = req.body;

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and text or html',
      });
    }

    // Validate email format
    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format',
      });
    }

    // Attempt to send with service account (if configured)
    let result;
    try {
      result = await sendEmailWithServiceAccount({
        to,
        subject,
        text,
        html,
      });
    } catch (serviceAccountError) {
      // Fall back to OAuth if service account fails
      console.log('Service account send failed, trying OAuth...');
      result = await sendEmailWithOAuth({
        to,
        subject,
        text,
        html,
      });
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.id,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message,
    });
  }
};

/**
 * Initialize OAuth flow
 */
export const initOAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = generateAuthUrl();
    res.json({
      success: true,
      authUrl,
    });
  } catch (error: any) {
    console.error('Init OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL',
      details: error.message,
    });
  }
};

/**
 * OAuth callback handler
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided',
      });
    }

    const tokens = await getTokensFromCode(code);

    // In production, store tokens securely (database, encrypted storage, etc.)
    // For now, just confirm success
    res.json({
      success: true,
      message: 'OAuth authentication successful',
      // Don't send tokens to client in production
      // tokens: tokens,
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'OAuth authentication failed',
      details: error.message,
    });
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Mail service is running',
    timestamp: new Date().toISOString(),
  });
};
```

### Step 2.9: Create Routes

**File: `src/routes/mail.routes.ts`**

```typescript
import express from 'express';
import {
  sendEmail,
  initOAuth,
  oauthCallback,
  healthCheck,
} from '../controllers/mail.controller';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Email sending
router.post('/send', sendEmail);

// OAuth flow
router.get('/auth/init', initOAuth);
router.get('/auth/google/callback', oauthCallback);

export default router;
```

### Step 2.10: Create Main Server File

**File: `src/server.ts`**

```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mailRoutes from './routes/mail.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/mail', limiter);

// Routes
app.use('/api/mail', mailRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Mail Service API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/mail/health',
      send: 'POST /api/mail/send',
      authInit: 'GET /api/mail/auth/init',
      authCallback: 'GET /api/mail/auth/google/callback',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Mail service ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
```

### Step 2.11: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "watch": "tsc -w"
  }
}
```

---

## Phase 3: Frontend Setup (React + Vite + TypeScript)

### Step 3.1: Create Frontend Project

```bash
cd /var/www/example.com
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios
```

### Step 3.2: Create API Service

**File: `src/services/api.ts`**

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://example.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface SendEmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export const mailService = {
  sendEmail: async (data: SendEmailRequest): Promise<ApiResponse> => {
    const response = await api.post('/mail/send', data);
    return response.data;
  },

  healthCheck: async (): Promise<ApiResponse> => {
    const response = await api.get('/mail/health');
    return response.data;
  },

  initOAuth: async (): Promise<ApiResponse<{ authUrl: string }>> => {
    const response = await api.get('/mail/auth/init');
    return response.data;
  },
};

export default api;
```

### Step 3.3: Create Email Form Component

**File: `src/components/EmailForm.tsx`**

```typescript
import React, { useState } from 'react';
import { mailService, SendEmailRequest } from '../services/api';

interface FormData {
  to: string;
  subject: string;
  message: string;
}

const EmailForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    to: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const emailData: SendEmailRequest = {
        to: formData.to,
        subject: formData.subject,
        html: `<p>${formData.message.replace(/\n/g, '<br>')}</p>`,
      };

      const response = await mailService.sendEmail(emailData);

      if (response.success) {
        setStatus({
          type: 'success',
          message: 'Email sent successfully!',
        });
        setFormData({ to: '', subject: '', message: '' });
      } else {
        setStatus({
          type: 'error',
          message: response.error || 'Failed to send email',
        });
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.error || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-form-container">
      <h2>Send Email</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            placeholder="recipient@example.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Email subject"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message here..."
            rows={6}
            disabled={loading}
          />
        </div>

        {status.type && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;
```

### Step 3.4: Update App Component

**File: `src/App.tsx`**

```typescript
import React from 'react';
import EmailForm from './components/EmailForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Email Service</h1>
      </header>
      <main>
        <EmailForm />
      </main>
    </div>
  );
}

export default App;
```

### Step 3.5: Add Styling

**File: `src/App.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #1976d2;
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 2rem;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.email-form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.email-form-container h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

button {
  width: 100%;
  padding: 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #1565c0;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  header {
    padding: 1.5rem;
  }

  header h1 {
    font-size: 1.5rem;
  }

  .email-form-container {
    padding: 1.5rem;
  }

  main {
    padding: 1rem;
  }
}
```

### Step 3.6: Configure Environment Variables

Create `.env` file in frontend root:

```env
VITE_API_URL=https://example.com/api
```

Create `.env.development` for local development:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 3.7: Update Vite Configuration

**File: `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Phase 4: Apache2 Configuration

### Step 4.1: Install Apache2 and Required Modules

```bash
sudo apt update
sudo apt install apache2
sudo a2enmod proxy proxy_http ssl rewrite headers
sudo systemctl restart apache2
```

### Step 4.2: Create Apache Virtual Host Configuration

**File: `/etc/apache2/sites-available/example.com.conf`**

```apache
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    
    # Redirect to HTTPS
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com
    
    # SSL Configuration (Let's Encrypt)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem
    
    # Document Root for React Frontend
    DocumentRoot /var/www/example.com/frontend/dist
    
    # Frontend Directory Configuration
    <Directory /var/www/example.com/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router Support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # API Proxy Configuration
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/example-error.log
    CustomLog ${APACHE_LOG_DIR}/example-access.log combined
</VirtualHost>
```

### Step 4.3: Enable Site and SSL

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d example.com -d www.example.com

# Enable the site
sudo a2ensite example.com.conf
sudo systemctl reload apache2
```

### Step 4.4: Setup SSL Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will automatically set up a cron job or systemd timer
# Verify it's set up:
sudo systemctl status certbot.timer
```

---

## Phase 5: Deployment and Testing

### Step 5.1: Create Systemd Service for Backend

**File: `/etc/systemd/system/example-backend.service`**

```ini
[Unit]
Description=Example Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/example.com/backend
ExecStart=/usr/bin/node /var/www/example.com/backend/dist/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable example-backend
sudo systemctl start example-backend
sudo systemctl status example-backend
```

### Step 5.2: Build and Deploy Frontend

```bash
cd /var/www/example.com/frontend
npm run build
```

The built files will be in `dist/` directory, which Apache will serve.

### Step 5.3: Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/example.com
sudo chmod -R 755 /var/www/example.com
sudo chmod 600 /var/www/example.com/backend/.env
sudo chmod 600 /var/www/example.com/backend/service-account-key.json
```

### Step 5.4: Testing Checklist

**Backend Tests:**

1. Health check:
   ```bash
   curl https://example.com/api/health
   ```

2. Send test email (using service account):
   ```bash
   curl -X POST https://example.com/api/mail/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "text": "This is a test email"
     }'
   ```

3. Initialize OAuth flow:
   ```bash
   curl https://example.com/api/mail/auth/init
   ```

**Frontend Tests:**

1. Open browser: `https://example.com`
2. Fill out email form
3. Click send
4. Verify email received
5. Check browser console for errors
6. Test on mobile devices

**Logs:**

```bash
# Backend logs
sudo journalctl -u example-backend -f

# Apache logs
sudo tail -f /var/log/apache2/example-error.log
sudo tail -f /var/log/apache2/example-access.log
```

---

## Phase 6: Security Hardening

### Step 6.1: Firewall Configuration

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 6.2: Secure .env Files

```bash
sudo chmod 600 /var/www/example.com/backend/.env
sudo chown www-data:www-data /var/www/example.com/backend/.env
```

### Step 6.3: Setup Log Rotation

Create: `/etc/logrotate.d/example`

```
/var/log/apache2/example-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload apache2 > /dev/null 2>&1 || true
    endscript
}
```

### Step 6.4: Enable Fail2Ban for API

Create: `/etc/fail2ban/jail.local`

```ini
[apache-mail-api]
enabled = true
port = http,https
filter = apache-mail-api
logpath = /var/log/apache2/example-access.log
maxretry = 10
bantime = 3600
```

### Step 6.5: Add HTTPS Security Headers

Add to Apache VirtualHost (already included in Step 4.2):

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

---

## Phase 7: Monitoring and Maintenance

### Step 7.1: Setup Monitoring

Install PM2 for better process management (optional):

```bash
npm install -g pm2
pm2 start /var/www/example.com/backend/dist/server.js --name example-api
pm2 startup
pm2 save
```

### Step 7.2: Regular Backups

Create backup script: `/usr/local/bin/backup-example.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/example"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup code
tar -czf $BACKUP_DIR/code-$DATE.tar.gz /var/www/example.com

# Backup .env
cp /var/www/example.com/backend/.env $BACKUP_DIR/.env-$DATE

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete
```

Add to crontab:

```bash
0 2 * * * /usr/local/bin/backup-example.sh
```

### Step 7.3: Update Dependencies Regularly

```bash
cd /var/www/example.com/backend
npm audit
npm update
npm audit fix
```

---

## Troubleshooting Guide

### Issue: "Access denied" or 403 errors

**Solution:**
```bash
sudo chown -R www-data:www-data /var/www/example.com
sudo chmod -R 755 /var/www/example.com
```

### Issue: Backend not starting

**Check logs:**
```bash
sudo journalctl -u example-backend -n 50
```

**Common causes:**
- Missing .env file
- Invalid service account credentials
- Port 3000 already in use
- Missing dependencies

### Issue: CORS errors

**Check:**
- ALLOWED_ORIGINS in .env includes your frontend URL
- Apache proxy configuration is correct
- Credentials flag set in CORS config

### Issue: Gmail API quota exceeded

**Solutions:**
- Check [Google Cloud Console quotas](https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas)
- Request quota increase if needed
- Implement email queuing system
- Add exponential backoff retry logic

### Issue: Service account cannot send emails

**Check:**
- Domain-wide delegation is enabled in Google Workspace
- Service account has correct scopes
- Impersonation email is correct
- Service account key file is valid

---

## Best Practices

1. **Never commit secrets to Git**
   - Use .env files
   - Add .env to .gitignore
   - Use environment-specific configs

2. **Implement rate limiting**
   - Already configured in backend
   - Monitor abuse patterns
   - Adjust limits as needed

3. **Use HTTPS everywhere**
   - Already configured with Let's Encrypt
   - Auto-renewal setup with certbot

4. **Validate all inputs**
   - Email validation in place
   - Add additional validation as needed
   - Sanitize HTML content

5. **Monitor email sending**
   - Track sent emails
   - Monitor bounce rates
   - Watch for spam complaints

6. **Regular security updates**
   - Update npm packages monthly
   - Update Ubuntu packages weekly
   - Monitor security advisories

---

## Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Apache Configuration Guide](https://httpd.apache.org/docs/2.4/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## Summary

This integration provides:

✅ Secure OAuth 2.0 authentication with Gmail API  
✅ Service account support for automated emails  
✅ Modern React + TypeScript frontend  
✅ Express + TypeScript backend  
✅ Apache2 reverse proxy configuration  
✅ Rate limiting and security hardening  
✅ Production-ready deployment setup  
✅ Comprehensive error handling  
✅ Monitoring and maintenance guidelines  

Your emails will be sent from your verified domain (example.com) with full authentication and compliance with modern email security standards.
