# Firebase Google Database Integration Plan (Enhanced Edition)
## White Label React Vite TypeScript Demonstration - Sonnet 4.5 Update

### Executive Summary

This enhanced integration plan provides a cutting-edge implementation guide for Google Firebase Realtime Database and Firestore into a React 19 + Vite + TypeScript application. Building upon the solid foundation of the original plan, this version incorporates modern best practices, improved type safety, enhanced security patterns, and optimized performance strategies for production-ready applications.

### What's New in This Enhanced Version

- **React 19 Support**: Leveraging the latest React features including enhanced hooks and concurrent rendering
- **Stricter TypeScript**: Discriminated unions, branded types, and improved type inference
- **Enhanced Security**: Content Security Policy, rate limiting patterns, and advanced security rules
- **Modern State Management**: TanStack Query integration alongside Zustand for optimal data fetching
- **Improved Testing**: Comprehensive testing strategies with Vitest and Testing Library
- **Accessibility First**: WCAG 2.1 AA compliance patterns
- **Performance Optimizations**: Advanced code splitting, lazy loading, and bundle size optimization
- **Better Developer Experience**: Improved error boundaries, logging, and debugging tools

---

## Technology Stack (Updated)

**Core Technologies:**
- **Frontend**: React 19.0+ (with concurrent features)
- **Build Tool**: Vite 6.0+
- **Language**: TypeScript 5.6+ (with stricter mode)
- **Database**: Firebase SDK 11.0+
  - Realtime Database
  - Firestore
  
**State & Data Management:**
- **Server State**: TanStack Query (React Query) v5
- **Client State**: Zustand v5
- **Form Management**: React Hook Form v7 + Zod validation

**Styling & UI:**
- **CSS Framework**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React

**Development Tools:**
- **Testing**: Vitest + Testing Library + MSW (Mock Service Worker)
- **Linting**: ESLint 9 (flat config) + TypeScript ESLint
- **Formatting**: Prettier + prettier-plugin-tailwindcss
- **Type Checking**: TypeScript strict mode + total-typescript patterns

**Package Manager:** 
- pnpm (recommended for faster installs and better dependency resolution)

---

## Phase 1: Enhanced Project Setup and Configuration

### 1.1 Initialize Project with Modern Tooling

```bash
# Create new Vite project with React 19 and TypeScript
pnpm create vite@latest firebase-demo-enhanced -- --template react-ts
cd firebase-demo-enhanced

# Install Firebase SDK (latest v11)
pnpm add firebase

# Install core dependencies
pnpm add react@^19.0.0 react-dom@^19.0.0

# State management and data fetching
pnpm add zustand @tanstack/react-query @tanstack/react-query-devtools

# Form handling and validation
pnpm add react-hook-form @hookform/resolvers zod

# Routing
pnpm add react-router-dom

# UI and styling
pnpm add tailwindcss postcss autoprefixer
pnpm add -D @tailwindcss/forms @tailwindcss/typography
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# Development dependencies
pnpm add -D @types/node
pnpm add -D vitest @vitest/ui jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D msw
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D prettier prettier-plugin-tailwindcss

# Initialize Tailwind
pnpm dlx tailwindcss init -p
```

### 1.2 Enhanced Project Structure

```
firebase-demo-enhanced/
├── src/
│   ├── __tests__/              # Test files
│   │   ├── integration/
│   │   ├── unit/
│   │   └── mocks/
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProviderButtons.tsx
│   │   ├── database/           # Database components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   └── DatabaseSelector.tsx
│   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── providers/          # Context providers
│   │       ├── QueryProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── config/
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── constants.ts        # App constants
│   │   └── env.ts              # Environment validation
│   ├── features/               # Feature-based organization
│   │   ├── tasks/
│   │   │   ├── hooks/
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   └── schemas/
│   │   └── auth/
│   │       ├── hooks/
│   │       └── schemas/
│   ├── hooks/                  # Shared custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDatabase.ts
│   │   ├── useToast.ts
│   │   └── useMediaQuery.ts
│   ├── lib/                    # Library utilities
│   │   ├── utils.ts            # Helper functions
│   │   ├── cn.ts               # Classname utilities
│   │   └── firebase-utils.ts   # Firebase helpers
│   ├── services/               # Service layer
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   ├── firestore.service.ts
│   │   │   └── rtdb.service.ts
│   │   └── analytics.service.ts
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── preferences.store.ts
│   ├── types/                  # TypeScript types
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── database.types.ts
│   │   └── branded.types.ts    # Branded types
│   ├── pages/                  # Page components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Auth.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   └── favicon.ico
├── .env.example
├── .env.local
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── firebase.json
└── package.json
```

### 1.3 Enhanced TypeScript Configuration

**tsconfig.json** (with stricter settings):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting - Strictest settings */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/config/*": ["./src/config/*"],
      "@/services/*": ["./src/services/*"],
      "@/store/*": ["./src/store/*"],
      "@/features/*": ["./src/features/*"]
    },

    /* Additional Options */
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.4 Environment Configuration with Validation

**src/config/env.ts** (Type-safe environment variables):

```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  VITE_FIREBASE_DATABASE_URL: z.string().url('Must be a valid URL'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Messaging sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

// Validate environment variables at startup
function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Export typed environment object
export type Env = z.infer<typeof envSchema>;
```

**.env.example**:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Environment
VITE_APP_ENV=development
```

### 1.5 Enhanced Firebase Configuration

**src/config/firebase.ts**:

```typescript
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator, Database } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator, Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getPerformance, Performance } from 'firebase/performance';
import { env } from './env';

// Firebase configuration from validated environment variables
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Singleton pattern for Firebase instances
class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _auth: Auth | null = null;
  private _database: Database | null = null;
  private _firestore: Firestore | null = null;
  private _analytics: Analytics | null = null;
  private _performance: Performance | null = null;
  private emulatorsConnected = false;

  private constructor() {
    this.app = initializeApp(firebaseConfig);
    this.connectEmulators();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private connectEmulators(): void {
    // Only connect emulators once and in development
    if (this.emulatorsConnected || env.VITE_APP_ENV !== 'development') {
      return;
    }

    try {
      // Connect Auth emulator
      const auth = this.getAuthInstance();
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

      // Connect Database emulator
      const database = this.getDatabaseInstance();
      connectDatabaseEmulator(database, 'localhost', 9000);

      // Connect Firestore emulator
      const firestore = this.getFirestoreInstance();
      connectFirestoreEmulator(firestore, 'localhost', 8080);

      this.emulatorsConnected = true;
      console.info('✅ Firebase emulators connected successfully');
    } catch (error) {
      console.warn('⚠️ Failed to connect to Firebase emulators:', error);
      // Don't throw - app should work without emulators
    }
  }

  private getAuthInstance(): Auth {
    if (!this._auth) {
      this._auth = getAuth(this.app);
    }
    return this._auth;
  }

  private getDatabaseInstance(): Database {
    if (!this._database) {
      this._database = getDatabase(this.app);
    }
    return this._database;
  }

  private getFirestoreInstance(): Firestore {
    if (!this._firestore) {
      this._firestore = getFirestore(this.app);
      
      // Enable offline persistence for better UX
      if (env.VITE_APP_ENV === 'production') {
        enableMultiTabIndexedDbPersistence(this._firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support persistence.');
          }
        });
      }
    }
    return this._firestore;
  }

  private async getAnalyticsInstance(): Promise<Analytics | null> {
    if (this._analytics) {
      return this._analytics;
    }

    // Only initialize analytics if supported and in production
    if (env.VITE_APP_ENV === 'production' && await isSupported()) {
      this._analytics = getAnalytics(this.app);
      return this._analytics;
    }

    return null;
  }

  private getPerformanceInstance(): Performance | null {
    if (this._performance) {
      return this._performance;
    }

    // Only initialize performance monitoring in production
    if (env.VITE_APP_ENV === 'production') {
      this._performance = getPerformance(this.app);
      return this._performance;
    }

    return null;
  }

  // Public accessors
  public get auth(): Auth {
    return this.getAuthInstance();
  }

  public get database(): Database {
    return this.getDatabaseInstance();
  }

  public get firestore(): Firestore {
    return this.getFirestoreInstance();
  }

  public async analytics(): Promise<Analytics | null> {
    return this.getAnalyticsInstance();
  }

  public get performance(): Performance | null {
    return this.getPerformanceInstance();
  }

  public get firebaseApp(): FirebaseApp {
    return this.app;
  }
}

// Export singleton instance
const firebaseService = FirebaseService.getInstance();

export const auth = firebaseService.auth;
export const database = firebaseService.database;
export const firestore = firebaseService.firestore;
export const getAppAnalytics = () => firebaseService.analytics();
export const performance = firebaseService.performance;
export const app = firebaseService.firebaseApp;

export default firebaseService;
```

### 1.6 Enhanced TypeScript Types with Branded Types

**src/types/branded.types.ts**:

```typescript
// Branded types for better type safety
declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { [brand]: TBrand };

export type UserId = Brand<string, 'UserId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type Email = Brand<string, 'Email'>;
export type Timestamp = Brand<number, 'Timestamp'>;

// Type guards
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

export function isTaskId(value: unknown): value is TaskId {
  return typeof value === 'string' && value.length > 0;
}

export function isEmail(value: unknown): value is Email {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && value > 0 && Number.isInteger(value);
}
```

**src/types/index.ts**:

```typescript
import { UserId, TaskId, Email, Timestamp } from './branded.types';

// User types with branded IDs
export interface User {
  uid: UserId;
  email: Email;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  metadata: UserMetadata;
}

export interface UserMetadata {
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  planType: 'free' | 'pro' | 'enterprise';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  defaultDatabase: 'firestore' | 'rtdb';
}

// Task types with enhanced fields
export interface Task {
  id: TaskId;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  userId: UserId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate: Timestamp | null;
  tags: readonly string[];
  attachments: readonly TaskAttachment[];
  assignees: readonly UserId[];
  subtasks: readonly Subtask[];
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'archived';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Timestamp;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

// Form types
export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  acceptTerms: boolean;
}

// API Response types with discriminated unions
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// State types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface DatabaseState {
  tasks: ReadonlyArray<Task>;
  selectedTask: Task | null;
  isLoading: boolean;
  error: DatabaseError | null;
  databaseType: 'firestore' | 'rtdb';
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modalOpen: boolean;
  toasts: ReadonlyArray<Toast>;
}

// Error types with discriminated unions
export type AuthError = 
  | { type: 'invalid-credentials'; message: string }
  | { type: 'network-error'; message: string }
  | { type: 'account-disabled'; message: string }
  | { type: 'too-many-requests'; message: string; retryAfter: number }
  | { type: 'unknown'; message: string; originalError: Error };

export type DatabaseError =
  | { type: 'permission-denied'; message: string }
  | { type: 'not-found'; message: string; resourceId: string }
  | { type: 'network-error'; message: string }
  | { type: 'quota-exceeded'; message: string }
  | { type: 'unknown'; message: string; originalError: Error };

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// Query & Filter types
export interface TaskQueryOptions {
  userId: UserId;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  tags?: string[];
  completed?: boolean;
  search?: string;
  sortBy?: TaskSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  startAfter?: TaskId;
}

export type TaskSortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority';

// Pagination types
export interface PaginatedResponse<T> {
  items: readonly T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

// Real-time subscription types
export type UnsubscribeFunction = () => void;

export interface RealtimeSubscription<T> {
  unsubscribe: UnsubscribeFunction;
  data: T | null;
  error: DatabaseError | null;
}
```

---

## Phase 2: Enhanced Authentication Implementation

### 2.1 Zod Validation Schemas

**src/features/auth/schemas/auth.schemas.ts**:

```typescript
import { z } from 'zod';

// Reusable validators
const emailValidator = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long');

const passwordValidator = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const displayNameValidator = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(50, 'Display name is too long')
  .regex(/^[a-zA-Z0-9\s-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores');

// Login schema
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Password is required'), // Less strict for login
  rememberMe: z.boolean().default(false),
});

// Signup schema with password confirmation
export const signupSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: displayNameValidator,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Password reset schema
export const resetPasswordSchema = z.object({
  email: emailValidator,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidator,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
```

### 2.2 Enhanced Authentication Service

**src/services/api/auth.service.ts**:

```typescript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
  AuthError as FirebaseAuthError,
  updateEmail,
  deleteUser,
  multiFactor,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthError, UserId, Email } from '@/types';
import { isEmail, isUserId } from '@/types/branded.types';

// Rate limiting helper
class RateLimiter {
  private attempts = new Map<string, number[]>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    this.attempts.set(key, [...recentAttempts, now]);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRetryAfter(key: string): number | null {
    const attempts = this.attempts.get(key);
    if (!attempts || attempts.length < this.maxAttempts) {
      return null;
    }
    
    const oldestAttempt = Math.min(...attempts);
    const retryAfter = this.windowMs - (Date.now() - oldestAttempt);
    return retryAfter > 0 ? retryAfter : null;
  }
}

class AuthService {
  private googleProvider: GoogleAuthProvider;
  private rateLimiter: RateLimiter;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
    if (!this.rateLimiter.canAttempt(`signup:${email}`)) {
      const retryAfter = this.rateLimiter.getRetryAfter(`signup:${email}`) || 0;
      return {
        success: false,
        error: {
          type: 'too-many-requests',
          message: 'Too many signup attempts. Please try again later.',
          retryAfter,
        },
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile if display name provided
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Send email verification
      await sendEmailVerification(firebaseUser);

      this.rateLimiter.reset(`signup:${email}`);
      return { success: true, user: this.mapFirebaseUser(firebaseUser) };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
    if (!this.rateLimiter.canAttempt(`login:${email}`)) {
      const retryAfter = this.rateLimiter.getRetryAfter(`login:${email}`) || 0;
      return {
        success: false,
        error: {
          type: 'too-many-requests',
          message: 'Too many login attempts. Please try again later.',
          retryAfter,
        },
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.rateLimiter.reset(`login:${email}`);
      return { success: true, user: this.mapFirebaseUser(userCredential.user) };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign in with Google (popup)
   */
  async signInWithGoogle(): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      return { success: true, user: this.mapFirebaseUser(result.user) };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign in with Google (redirect) - better for mobile
   */
  async signInWithGoogleRedirect(): Promise<void> {
    await signInWithRedirect(auth, this.googleProvider);
  }

  /**
   * Get redirect result after redirect sign-in
   */
  async getRedirectResult(): Promise<{ success: true; user: User } | { success: false; error: AuthError } | null> {
    try {
      const result = await getRedirectResult(auth);
      if (!result) {
        return null;
      }
      return { success: true, user: this.mapFirebaseUser(result.user) };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: AuthError }> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'No user is currently signed in',
          originalError: new Error('No current user'),
        },
      };
    }

    try {
      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Update user email
   */
  async updateEmail(
    newEmail: string,
    currentPassword: string
  ): Promise<{ success: boolean; error?: AuthError }> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'No user is currently signed in',
          originalError: new Error('No current user'),
        },
      };
    }

    try {
      // Re-authenticate user before updating email
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);
      
      // Send verification email to new address
      await sendEmailVerification(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean; error?: AuthError }> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'No user is currently signed in',
          originalError: new Error('No current user'),
        },
      };
    }

    try {
      // Re-authenticate before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user
      await deleteUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<{ success: boolean; error?: AuthError }> {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'No user is currently signed in',
          originalError: new Error('No current user'),
        },
      };
    }

    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Map Firebase user to app User type
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const uid = firebaseUser.uid as UserId;
    const email = (firebaseUser.email || '') as Email;

    return {
      uid,
      email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: Date.now() as any, // Would normally come from Firestore user doc
      lastLoginAt: Date.now() as any,
      metadata: {
        preferences: {
          theme: 'system',
          emailNotifications: true,
          defaultDatabase: 'firestore',
        },
        onboardingCompleted: false,
        planType: 'free',
      },
    };
  }

  /**
   * Handle Firebase auth errors and map to app AuthError type
   */
  private handleAuthError(error: unknown): AuthError {
    if (this.isFirebaseAuthError(error)) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          return {
            type: 'invalid-credentials',
            message: 'Invalid email or password. Please try again.',
          };

        case 'auth/user-disabled':
          return {
            type: 'account-disabled',
            message: 'This account has been disabled. Please contact support.',
          };

        case 'auth/too-many-requests':
          return {
            type: 'too-many-requests',
            message: 'Too many failed attempts. Please try again later.',
            retryAfter: 15 * 60 * 1000, // 15 minutes
          };

        case 'auth/network-request-failed':
          return {
            type: 'network-error',
            message: 'Network error. Please check your connection and try again.',
          };

        case 'auth/email-already-in-use':
          return {
            type: 'invalid-credentials',
            message: 'An account with this email already exists.',
          };

        case 'auth/weak-password':
          return {
            type: 'invalid-credentials',
            message: 'Password is too weak. Please use a stronger password.',
          };

        case 'auth/requires-recent-login':
          return {
            type: 'invalid-credentials',
            message: 'This operation requires recent authentication. Please sign in again.',
          };

        case 'auth/popup-closed-by-user':
          return {
            type: 'unknown',
            message: 'Sign-in popup was closed before completing.',
            originalError: error,
          };

        default:
          return {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred.',
            originalError: error,
          };
      }
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  private isFirebaseAuthError(error: unknown): error is FirebaseAuthError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as any).code === 'string' &&
      (error as any).code.startsWith('auth/')
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
```

### 2.3 Auth Store with Zustand

**src/store/auth.store.ts**:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AuthState, User, AuthError } from '@/types';
import { authService } from '@/services/api/auth.service';
import type { LoginFormData, SignupFormData } from '@/features/auth/schemas/auth.schemas';

interface AuthStore extends AuthState {
  // Actions
  signUp: (data: SignupFormData) => Promise<void>;
  signIn: (data: LoginFormData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  initialize: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,

        // Actions
        signUp: async (data) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const result = await authService.signUp(
            data.email,
            data.password,
            data.displayName
          );

          if (result.success) {
            set((state) => {
              state.user = result.user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = result.error;
              state.isLoading = false;
            });
          }
        },

        signIn: async (data) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const result = await authService.signIn(data.email, data.password);

          if (result.success) {
            set((state) => {
              state.user = result.user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = result.error;
              state.isLoading = false;
            });
          }
        },

        signInWithGoogle: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          const result = await authService.signInWithGoogle();

          if (result.success) {
            set((state) => {
              state.user = result.user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = result.error;
              state.isLoading = false;
            });
          }
        },

        signOut: async () => {
          set((state) => {
            state.isLoading = true;
          });

          await authService.signOut();

          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
          });
        },

        resetPassword: async (email) => {
          const result = await authService.resetPassword(email);
          
          if (!result.success && result.error) {
            set((state) => {
              state.error = result.error!;
            });
          }
          
          return result.success;
        },

        updatePassword: async (currentPassword, newPassword) => {
          const result = await authService.updatePassword(currentPassword, newPassword);
          
          if (!result.success && result.error) {
            set((state) => {
              state.error = result.error!;
            });
          }
          
          return result.success;
        },

        initialize: () => {
          const unsubscribe = authService.onAuthStateChanged((user) => {
            set((state) => {
              state.user = user;
              state.isAuthenticated = user !== null;
              state.isLoading = false;
            });
          });

          // Return cleanup function
          return unsubscribe;
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        setUser: (user) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = user !== null;
          });
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectAuthError = (state: AuthStore) => state.error;
```

---

## Phase 3: Database Services with TanStack Query

### 3.1 Firestore Service with Enhanced Type Safety

**src/services/api/firestore.service.ts**:

```typescript
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp as FirestoreTimestamp,
  Query,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import {
  Task,
  TaskQueryOptions,
  PaginatedResponse,
  DatabaseError,
  TaskId,
  UserId,
  Timestamp,
} from '@/types';

class FirestoreService {
  private readonly TASKS_COLLECTION = 'tasks';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskId> {
    try {
      const tasksRef = collection(firestore, this.TASKS_COLLECTION);
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id as TaskId;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: TaskId): Promise<Task> {
    try {
      const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        throw {
          type: 'not-found',
          message: 'Task not found',
          resourceId: taskId,
        } as DatabaseError;
      }

      return this.mapDocumentToTask(taskSnap);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get multiple tasks with filtering and pagination
   */
  async getTasks(options: TaskQueryOptions): Promise<PaginatedResponse<Task>> {
    try {
      const tasksRef = collection(firestore, this.TASKS_COLLECTION);
      const constraints = this.buildQueryConstraints(options);
      const q = query(tasksRef, ...constraints);

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => this.mapDocumentToTask(doc));

      // Check if there are more results
      const hasMore = querySnapshot.docs.length === (options.limit || 20);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        items: tasks,
        totalCount: tasks.length,
        hasMore,
        nextCursor: hasMore && lastDoc ? lastDoc.id : null,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId: TaskId, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: TaskId): Promise<void> {
    try {
      const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch delete multiple tasks
   */
  async batchDeleteTasks(taskIds: TaskId[]): Promise<void> {
    try {
      const batch = writeBatch(firestore);

      taskIds.forEach(taskId => {
        const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);
        batch.delete(taskRef);
      });

      await batch.commit();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(taskId: TaskId): Promise<void> {
    try {
      await runTransaction(firestore, async (transaction) => {
        const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);
        const taskDoc = await transaction.get(taskRef);

        if (!taskDoc.exists()) {
          throw {
            type: 'not-found',
            message: 'Task not found',
            resourceId: taskId,
          } as DatabaseError;
        }

        const currentCompleted = taskDoc.data().completed;
        transaction.update(taskRef, {
          completed: !currentCompleted,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to task updates in real-time
   */
  subscribeToTask(
    taskId: TaskId,
    onUpdate: (task: Task) => void,
    onError: (error: DatabaseError) => void
  ): () => void {
    const taskRef = doc(firestore, this.TASKS_COLLECTION, taskId);

    const unsubscribe = onSnapshot(
      taskRef,
      (doc) => {
        if (doc.exists()) {
          const task = this.mapDocumentToTask(doc as QueryDocumentSnapshot<DocumentData>);
          onUpdate(task);
        } else {
          onError({
            type: 'not-found',
            message: 'Task not found',
            resourceId: taskId,
          });
        }
      },
      (error) => {
        onError(this.handleError(error));
      }
    );

    return unsubscribe;
  }

  /**
   * Subscribe to tasks list with real-time updates
   */
  subscribeToTasks(
    options: TaskQueryOptions,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: DatabaseError) => void
  ): () => void {
    const tasksRef = collection(firestore, this.TASKS_COLLECTION);
    const constraints = this.buildQueryConstraints(options);
    const q = query(tasksRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tasks = querySnapshot.docs.map(doc => this.mapDocumentToTask(doc));
        onUpdate(tasks);
      },
      (error) => {
        onError(this.handleError(error));
      }
    );

    return unsubscribe;
  }

  /**
   * Build query constraints from options
   */
  private buildQueryConstraints(options: TaskQueryOptions): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Filter by user
    constraints.push(where('userId', '==', options.userId));

    // Filter by status
    if (options.status) {
      if (Array.isArray(options.status)) {
        constraints.push(where('status', 'in', options.status));
      } else {
        constraints.push(where('status', '==', options.status));
      }
    }

    // Filter by priority
    if (options.priority) {
      if (Array.isArray(options.priority)) {
        constraints.push(where('priority', 'in', options.priority));
      } else {
        constraints.push(where('priority', '==', options.priority));
      }
    }

    // Filter by completed status
    if (options.completed !== undefined) {
      constraints.push(where('completed', '==', options.completed));
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', options.tags));
    }

    // Sorting
    const sortField = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    constraints.push(orderBy(sortField, sortOrder));

    // Pagination
    if (options.startAfter) {
      const lastDocRef = doc(firestore, this.TASKS_COLLECTION, options.startAfter);
      constraints.push(startAfter(lastDocRef));
    }

    // Limit
    constraints.push(limit(options.limit || 20));

    return constraints;
  }

  /**
   * Map Firestore document to Task type
   */
  private mapDocumentToTask(doc: QueryDocumentSnapshot<DocumentData>): Task {
    const data = doc.data();
    
    return {
      id: doc.id as TaskId,
      title: data.title,
      description: data.description,
      completed: data.completed,
      priority: data.priority,
      status: data.status,
      userId: data.userId,
      createdAt: this.timestampToNumber(data.createdAt),
      updatedAt: this.timestampToNumber(data.updatedAt),
      dueDate: data.dueDate ? this.timestampToNumber(data.dueDate) : null,
      tags: data.tags || [],
      attachments: data.attachments || [],
      assignees: data.assignees || [],
      subtasks: data.subtasks || [],
    };
  }

  /**
   * Convert Firestore Timestamp to number
   */
  private timestampToNumber(timestamp: any): Timestamp {
    if (timestamp instanceof FirestoreTimestamp) {
      return timestamp.toMillis() as Timestamp;
    }
    if (typeof timestamp === 'number') {
      return timestamp as Timestamp;
    }
    return Date.now() as Timestamp;
  }

  /**
   * Handle and map Firestore errors
   */
  private handleError(error: any): DatabaseError {
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          return {
            type: 'permission-denied',
            message: 'You do not have permission to perform this operation.',
          };

        case 'not-found':
          return error; // Already formatted

        case 'resource-exhausted':
          return {
            type: 'quota-exceeded',
            message: 'Database quota exceeded. Please try again later.',
          };

        case 'unavailable':
          return {
            type: 'network-error',
            message: 'Database is temporarily unavailable. Please try again.',
          };

        default:
          return {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred.',
            originalError: error,
          };
      }
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred.',
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
```

### 3.2 TanStack Query Hooks

**src/features/tasks/queries/useTaskQueries.ts**:

```typescript
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { firestoreService } from '@/services/api/firestore.service';
import { Task, TaskQueryOptions, PaginatedResponse, TaskId } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/useToast';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (options: TaskQueryOptions) => [...taskKeys.lists(), options] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: TaskId) => [...taskKeys.details(), id] as const,
};

/**
 * Fetch tasks with filtering and pagination
 */
export function useTasks(options: Omit<TaskQueryOptions, 'userId'>) {
  const user = useAuthStore((state) => state.user);
  
  return useQuery({
    queryKey: taskKeys.list({ ...options, userId: user!.uid }),
    queryFn: () => firestoreService.getTasks({ ...options, userId: user!.uid }),
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Fetch a single task by ID
 */
export function useTask(taskId: TaskId) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => firestoreService.getTask(taskId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      firestoreService.createTask({ ...data, userId: user!.uid }),
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast({
        title: 'Success',
        description: 'Task created successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        type: 'error',
      });
    },
  });
}

/**
 * Update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: TaskId; updates: Partial<Task> }) =>
      firestoreService.updateTask(taskId, updates),
    onSuccess: (_data, variables) => {
      // Invalidate both the task detail and lists
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        type: 'error',
      });
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: TaskId) => firestoreService.deleteTask(taskId),
    onSuccess: (_data, taskId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        type: 'error',
      });
    },
  });
}

/**
 * Toggle task completion status
 */
export function useToggleTaskComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: TaskId) => firestoreService.toggleTaskComplete(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle task',
        type: 'error',
      });
    },
  });
}

/**
 * Batch delete tasks
 */
export function useBatchDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskIds: TaskId[]) => firestoreService.batchDeleteTasks(taskIds),
    onSuccess: (_data, taskIds) => {
      // Remove all deleted tasks from cache
      taskIds.forEach(taskId => {
        queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast({
        title: 'Success',
        description: `${taskIds.length} tasks deleted successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tasks',
        type: 'error',
      });
    },
  });
}
```

---

## Phase 4: Component Implementation with React Hook Form

### 4.1 Enhanced Login Form Component

**src/components/auth/LoginForm.tsx**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/features/auth/schemas/auth.schemas';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginForm() {
  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await signIn(data);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.type === 'too-many-requests'
              ? `${error.message} Try again in ${Math.ceil(error.retryAfter / 60000)} minutes.`
              : error.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isSubmitting}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/reset-password"
              className="text-sm text-primary hover:underline"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isSubmitting}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...register('rememberMe')} />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal cursor-pointer"
          >
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
```

### 4.2 Task Form Component with Enhanced Validation

**src/features/tasks/components/TaskForm.tsx**:

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTask, useUpdateTask } from '@/features/tasks/queries/useTaskQueries';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Validation schema
const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'archived']),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
          tags: [...task.tags],
        }
      : {
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: null,
          tags: [],
        },
  });

  const tags = watch('tags');

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : null,
        completed: false,
        attachments: [],
        assignees: [],
        subtasks: [],
      };

      if (task) {
        await updateTask.mutateAsync({
          taskId: task.id,
          updates: taskData,
        });
      } else {
        await createTask.mutateAsync(taskData as any);
      }

      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const addTag = (tagInput: HTMLInputElement) => {
    const tag = tagInput.value.trim();
    if (tag && !tags.includes(tag)) {
      setValue('tags', [...tags, tag]);
      tagInput.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter(tag => tag !== tagToRemove)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter task title"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter task description"
          rows={4}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">
            Priority <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(new Date(field.value), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags-input">Tags</Label>
        <div className="space-y-2">
          <Input
            id="tags-input"
            placeholder="Type a tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget);
              }
            }}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {task ? 'Updating...' : 'Creating...'}
            </>
          ) : task ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </Button>
      </div>
    </form>
  );
}
```

---

## Phase 5: Security Rules (Enhanced)

### 5.1 Firestore Security Rules

**firestore.rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions for reusability
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidString(value, minLen, maxLen) {
      return value is string &&
             value.size() >= minLen &&
             value.size() <= maxLen;
    }
    
    function isValidTask(data) {
      return data.keys().hasAll(['title', 'description', 'completed', 'priority', 'status', 'userId', 'createdAt', 'updatedAt']) &&
             isValidString(data.title, 1, 100) &&
             data.description is string &&
             data.description.size() <= 1000 &&
             data.completed is bool &&
             data.priority in ['low', 'medium', 'high', 'urgent'] &&
             data.status in ['todo', 'in-progress', 'review', 'done', 'archived'] &&
             data.userId is string &&
             data.createdAt is timestamp &&
             data.updatedAt is timestamp &&
             (!('tags' in data) || (data.tags is list && data.tags.size() <= 10));
    }
    
    function isValidTaskUpdate(data) {
      return (!('title' in data) || isValidString(data.title, 1, 100)) &&
             (!('description' in data) || (data.description is string && data.description.size() <= 1000)) &&
             (!('completed' in data) || data.completed is bool) &&
             (!('priority' in data) || data.priority in ['low', 'medium', 'high', 'urgent']) &&
             (!('status' in data) || data.status in ['todo', 'in-progress', 'review', 'done', 'archived']) &&
             (!('tags' in data) || (data.tags is list && data.tags.size() <= 10)) &&
             data.updatedAt is timestamp;
    }
    
    // Rate limiting helper (basic implementation)
    function rateLimitCheck() {
      // In production, implement with Firebase Functions and Firestore counter documents
      return true;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Allow user to read their own tasks
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;
      
      // Allow user to create their own tasks (max 1000 per user)
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidTask(request.resource.data) &&
                       rateLimitCheck();
      
      // Allow user to update their own tasks
      allow update: if isAuthenticated() &&
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.userId == resource.data.userId &&
                       isValidTaskUpdate(request.resource.data) &&
                       rateLimitCheck();
      
      // Allow user to delete their own tasks
      allow delete: if isAuthenticated() &&
                       resource.data.userId == request.auth.uid;
    }
    
    // Users collection for user metadata
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // User preferences (subcollection)
    match /users/{userId}/preferences/{document=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

---

## Phase 6: Realtime Database Service (Alternative to Firestore)

### 6.1 Realtime Database Service Implementation

**src/services/api/rtdb.service.ts**:

```typescript
import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
  startAt,
  endAt,
  DatabaseReference,
} from 'firebase/database';
import { database } from '@/config/firebase';
import { Task, TaskQueryOptions, UserId, TaskId, Timestamp, DatabaseError } from '@/types';

class RealtimeDBService {
  private readonly TASKS_PATH = 'tasks';
  private readonly USERS_PATH = 'users';

  /**
   * Create a new task in Realtime Database
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskId> {
    try {
      const tasksRef = ref(database, `${this.TASKS_PATH}/${taskData.userId}`);
      const newTaskRef = push(tasksRef);
      
      const task = {
        ...taskData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await set(newTaskRef, task);
      return newTaskRef.key as TaskId;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(userId: UserId, taskId: TaskId): Promise<Task> {
    try {
      const taskRef = ref(database, `${this.TASKS_PATH}/${userId}/${taskId}`);
      const snapshot = await get(taskRef);

      if (!snapshot.exists()) {
        throw {
          type: 'not-found',
          message: 'Task not found',
          resourceId: taskId,
        } as DatabaseError;
      }

      return {
        id: taskId,
        ...snapshot.val(),
      } as Task;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all tasks for a user
   */
  async getTasks(options: TaskQueryOptions): Promise<Task[]> {
    try {
      const tasksRef = ref(database, `${this.TASKS_PATH}/${options.userId}`);
      let tasksQuery = query(tasksRef);

      // Apply sorting
      const sortField = options.sortBy || 'createdAt';
      tasksQuery = query(tasksQuery, orderByChild(sortField));

      // Apply limit
      if (options.limit) {
        tasksQuery = query(tasksQuery, limitToFirst(options.limit));
      }

      const snapshot = await get(tasksQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      const tasks: Task[] = [];
      snapshot.forEach((childSnapshot) => {
        const task = {
          id: childSnapshot.key as TaskId,
          ...childSnapshot.val(),
        } as Task;

        // Apply client-side filtering (RTDB has limited query capabilities)
        if (this.matchesFilters(task, options)) {
          tasks.push(task);
        }
      });

      // Apply sorting order
      if (options.sortOrder === 'desc') {
        tasks.reverse();
      }

      return tasks;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a task
   */
  async updateTask(userId: UserId, taskId: TaskId, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = ref(database, `${this.TASKS_PATH}/${userId}/${taskId}`);
      
      // First check if task exists
      const snapshot = await get(taskRef);
      if (!snapshot.exists()) {
        throw {
          type: 'not-found',
          message: 'Task not found',
          resourceId: taskId,
        } as DatabaseError;
      }

      await update(taskRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(userId: UserId, taskId: TaskId): Promise<void> {
    try {
      const taskRef = ref(database, `${this.TASKS_PATH}/${userId}/${taskId}`);
      await remove(taskRef);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch delete tasks
   */
  async batchDeleteTasks(userId: UserId, taskIds: TaskId[]): Promise<void> {
    try {
      const updates: Record<string, null> = {};
      
      taskIds.forEach(taskId => {
        updates[`${this.TASKS_PATH}/${userId}/${taskId}`] = null;
      });

      const dbRef = ref(database);
      await update(dbRef, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle task completion
   */
  async toggleTaskComplete(userId: UserId, taskId: TaskId): Promise<void> {
    try {
      const taskRef = ref(database, `${this.TASKS_PATH}/${userId}/${taskId}`);
      const snapshot = await get(taskRef);

      if (!snapshot.exists()) {
        throw {
          type: 'not-found',
          message: 'Task not found',
          resourceId: taskId,
        } as DatabaseError;
      }

      const task = snapshot.val();
      await update(taskRef, {
        completed: !task.completed,
        updatedAt: Date.now(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to a single task in real-time
   */
  subscribeToTask(
    userId: UserId,
    taskId: TaskId,
    onUpdate: (task: Task) => void,
    onError: (error: DatabaseError) => void
  ): () => void {
    const taskRef = ref(database, `${this.TASKS_PATH}/${userId}/${taskId}`);

    const unsubscribe = onValue(
      taskRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const task = {
            id: taskId,
            ...snapshot.val(),
          } as Task;
          onUpdate(task);
        } else {
          onError({
            type: 'not-found',
            message: 'Task not found',
            resourceId: taskId,
          });
        }
      },
      (error) => {
        onError(this.handleError(error));
      }
    );

    return () => off(taskRef);
  }

  /**
   * Subscribe to tasks list in real-time
   */
  subscribeToTasks(
    options: TaskQueryOptions,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: DatabaseError) => void
  ): () => void {
    const tasksRef = ref(database, `${this.TASKS_PATH}/${options.userId}`);
    let tasksQuery = query(tasksRef);

    // Apply sorting
    const sortField = options.sortBy || 'createdAt';
    tasksQuery = query(tasksQuery, orderByChild(sortField));

    const unsubscribe = onValue(
      tasksQuery,
      (snapshot) => {
        const tasks: Task[] = [];

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const task = {
              id: childSnapshot.key as TaskId,
              ...childSnapshot.val(),
            } as Task;

            if (this.matchesFilters(task, options)) {
              tasks.push(task);
            }
          });

          // Apply sorting order
          if (options.sortOrder === 'desc') {
            tasks.reverse();
          }
        }

        onUpdate(tasks);
      },
      (error) => {
        onError(this.handleError(error));
      }
    );

    return () => off(tasksQuery);
  }

  /**
   * Client-side filtering helper
   */
  private matchesFilters(task: Task, options: TaskQueryOptions): boolean {
    // Filter by status
    if (options.status) {
      if (Array.isArray(options.status)) {
        if (!options.status.includes(task.status)) return false;
      } else {
        if (task.status !== options.status) return false;
      }
    }

    // Filter by priority
    if (options.priority) {
      if (Array.isArray(options.priority)) {
        if (!options.priority.includes(task.priority)) return false;
      } else {
        if (task.priority !== options.priority) return false;
      }
    }

    // Filter by completed status
    if (options.completed !== undefined) {
      if (task.completed !== options.completed) return false;
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      const hasMatchingTag = options.tags.some(tag => task.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Search in title and description
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  }

  /**
   * Handle errors
   */
  private handleError(error: any): DatabaseError {
    if (error.code) {
      switch (error.code) {
        case 'PERMISSION_DENIED':
          return {
            type: 'permission-denied',
            message: 'You do not have permission to perform this operation.',
          };

        case 'NETWORK_ERROR':
          return {
            type: 'network-error',
            message: 'Network error. Please check your connection.',
          };

        default:
          return {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred.',
            originalError: error,
          };
      }
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred.',
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export const rtdbService = new RealtimeDBService();
```

### 6.2 Realtime Database Security Rules

**database.rules.json**:

```json
{
  "rules": {
    "tasks": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "$taskId": {
          ".validate": "newData.hasChildren(['title', 'description', 'completed', 'priority', 'status', 'userId', 'createdAt', 'updatedAt'])",
          "title": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
          },
          "description": {
            ".validate": "newData.isString() && newData.val().length <= 1000"
          },
          "completed": {
            ".validate": "newData.isBoolean()"
          },
          "priority": {
            ".validate": "newData.isString() && (newData.val() === 'low' || newData.val() === 'medium' || newData.val() === 'high' || newData.val() === 'urgent')"
          },
          "status": {
            ".validate": "newData.isString() && (newData.val() === 'todo' || newData.val() === 'in-progress' || newData.val() === 'review' || newData.val() === 'done' || newData.val() === 'archived')"
          },
          "userId": {
            ".validate": "newData.val() === auth.uid"
          },
          "createdAt": {
            ".validate": "newData.isNumber()"
          },
          "updatedAt": {
            ".validate": "newData.isNumber()"
          },
          "dueDate": {
            ".validate": "newData.isNumber() || newData.val() === null"
          },
          "tags": {
            ".validate": "newData.isString() || (!newData.exists())"
          }
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

---

## Phase 7: Advanced UI Components

### 7.1 Task List Component with Virtualization

**src/features/tasks/components/TaskList.tsx**:

```typescript
import { useState, useMemo } from 'react';
import { useTasks, useDeleteTask, useToggleTaskComplete } from '@/features/tasks/queries/useTaskQueries';
import { TaskQueryOptions, Task, TaskId } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar,
  Tag,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListProps {
  filters?: Omit<TaskQueryOptions, 'userId'>;
  onEditTask?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ filters, onEditTask, onTaskClick }: TaskListProps) {
  const { data, isLoading, isError, error } = useTasks(filters || {});
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();
  const [selectedTasks, setSelectedTasks] = useState<Set<TaskId>>(new Set());

  const tasks = data?.items || [];

  const handleToggleComplete = async (taskId: TaskId, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleComplete.mutateAsync(taskId);
  };

  const handleDeleteTask = async (taskId: TaskId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask?.(task);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'archived':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Failed to load tasks</p>
            <p className="text-sm text-red-700">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first task
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={cn(
            'transition-all hover:shadow-md cursor-pointer',
            task.completed && 'opacity-60'
          )}
          onClick={() => onTaskClick?.(task)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => handleToggleComplete(task.id, {} as any)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                className="mt-1"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </h3>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label="Task actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEditTask(task, e as any)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteTask(task.id, e as any)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                    {task.priority}
                  </Badge>

                  <Badge className={getStatusColor(task.status)} variant="outline">
                    {task.status.replace('-', ' ')}
                  </Badge>

                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{task.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 7.2 Dashboard Component with Analytics

**src/pages/Dashboard.tsx**:

```typescript
import { useState } from 'react';
import { useTasks } from '@/features/tasks/queries/useTaskQueries';
import { TaskList } from '@/features/tasks/components/TaskList';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // Fetch tasks with filters
  const filters = {
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  };

  const { data: allTasks } = useTasks({});
  const { data: filteredTasks } = useTasks(filters);

  // Calculate statistics
  const tasks = allTasks?.items || [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const overdueCount = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < Date.now()
  ).length;
  const completionRate = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.displayName || user?.email}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your tasks today
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList
            filters={filters}
            onEditTask={handleEditTask}
          />
        </TabsContent>

        <TabsContent value="active">
          <TaskList
            filters={{ ...filters, completed: false }}
            onEditTask={handleEditTask}
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList
            filters={{ ...filters, completed: true }}
            onEditTask={handleEditTask}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask || undefined}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Phase 8: Testing Implementation

### 8.1 Vitest Configuration

**vitest.config.ts**:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/types',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 8.2 Test Setup

**src/__tests__/setup.ts**:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that are declared as a part of tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock Firebase
vi.mock('@/config/firebase', () => ({
  auth: {},
  database: {},
  firestore: {},
  app: {},
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
```

### 8.3 MSW Handlers

**src/__tests__/mocks/handlers.ts**:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Firebase Auth endpoints
  http.post('https://identitytoolkit.googleapis.com/v1/accounts:signUp', () => {
    return HttpResponse.json({
      idToken: 'mock-id-token',
      email: 'test@example.com',
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: 'mock-user-id',
    });
  }),

  http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword', () => {
    return HttpResponse.json({
      idToken: 'mock-id-token',
      email: 'test@example.com',
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: 'mock-user-id',
      registered: true,
    });
  }),
];
```

**src/__tests__/mocks/server.ts**:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 8.4 Component Tests

**src/__tests__/unit/LoginForm.test.tsx**:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test wrapper
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    render(<LoginForm />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Wrapper });

    const submitButton = screen.getByRole('button', { name: /sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/signing in/i);
    });
  });
});
```

### 8.5 Integration Tests

**src/__tests__/integration/TaskFlow.test.tsx**:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Dashboard } from '@/pages/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Task Flow Integration', () => {
  it('creates, edits, and deletes a task', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, { wrapper: Wrapper });

    // Click new task button
    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    await user.click(newTaskButton);

    // Fill in task form
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test Task');

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'This is a test task');

    // Submit form
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);

    // Verify task appears in list
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
});
```

---

## Phase 9: Performance Optimization

### 9.1 Code Splitting and Lazy Loading

**src/App.tsx**:

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AuthPage = lazy(() => import('@/pages/Auth').then(m => ({ default: m.AuthPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, initialize } = useAuthStore();

  // Initialize auth listener
  React.useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe?.();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/auth"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <AuthPage />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 9.2 Bundle Size Optimization

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'utils': ['zustand', '@tanstack/react-query', 'zod', 'react-hook-form'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app'],
  },
});
```

### 9.3 React Query Optimization

**src/lib/queryClient.ts**:

```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/hooks/useToast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## Phase 10: Deployment and Production

### 10.1 Firebase Hosting Configuration

**firebase.json**:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "database": {
      "port": 9000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 10.2 CI/CD with GitHub Actions

**.github/workflows/deploy.yml**:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test:ci

      - name: Build
        run: pnpm build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
          VITE_APP_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          channelId: live
```

### 10.3 Environment Variables Management

**package.json** (scripts):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:ci": "vitest run --coverage",
    "emulators": "firebase emulators:start",
    "deploy": "pnpm build && firebase deploy",
    "deploy:hosting": "firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules,database",
    "analyze": "vite build --mode analyze"
  }
}
```

### 10.4 Security Headers and CSP

**public/_headers**:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-src https://accounts.google.com;
```

---

## Phase 11: Monitoring and Analytics

### 11.1 Firebase Analytics Implementation

**src/services/analytics.service.ts**:

```typescript
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { getAppAnalytics } from '@/config/firebase';
import { UserId } from '@/types';

class AnalyticsService {
  private analytics: Awaited<ReturnType<typeof getAppAnalytics>> | null = null;

  async initialize() {
    this.analytics = await getAppAnalytics();
  }

  // User events
  logLogin(method: string) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'login', { method });
  }

  logSignUp(method: string) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'sign_up', { method });
  }

  setUser(userId: UserId) {
    if (!this.analytics) return;
    setUserId(this.analytics, userId);
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.analytics) return;
    setUserProperties(this.analytics, properties);
  }

  // Task events
  logTaskCreated(taskData: { priority: string; hasDeadline: boolean }) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'task_created', taskData);
  }

  logTaskCompleted(taskId: string, timeToComplete?: number) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'task_completed', { taskId, timeToComplete });
  }

  logTaskDeleted(taskId: string) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'task_deleted', { taskId });
  }

  // Database events
  logDatabaseSwitch(databaseType: 'firestore' | 'rtdb') {
    if (!this.analytics) return;
    logEvent(this.analytics, 'database_switch', { database_type: databaseType });
  }

  // Error events
  logError(error: { code: string; message: string; context?: string }) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'error', error);
  }

  // Page views
  logPageView(pageName: string) {
    if (!this.analytics) return;
    logEvent(this.analytics, 'page_view', { page_title: pageName });
  }

  // Custom events
  logCustomEvent(eventName: string, params?: Record<string, any>) {
    if (!this.analytics) return;
    logEvent(this.analytics, eventName as any, params);
  }
}

export const analyticsService = new AnalyticsService();
```

### 11.2 Performance Monitoring

**src/lib/performance.ts**:

```typescript
import { performance } from '@/config/firebase';
import { trace } from 'firebase/performance';

export function measurePerformance(name: string) {
  if (!performance) return () => {};

  const perfTrace = trace(performance, name);
  perfTrace.start();

  return () => {
    perfTrace.stop();
  };
}

// Usage example:
// const stopTrace = measurePerformance('load_tasks');
// await loadTasks();
// stopTrace();

export function measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
  const stopTrace = measurePerformance(name);
  
  return asyncFn().finally(() => {
    stopTrace();
  });
}
```

---

## Phase 12: Documentation

### 12.1 README.md

**README.md**:

```markdown
# Firebase Google Database Demo (Enhanced)

A production-ready task management application built with React 19, TypeScript, Firebase, and modern best practices.

## 🚀 Features

- **Dual Database Support**: Both Firestore and Realtime Database implementations
- **Type-Safe**: Strict TypeScript with branded types and discriminated unions
- **Modern Stack**: React 19, Vite, TanStack Query, Zustand
- **Authentication**: Firebase Auth with email/password and Google Sign-In
- **Real-time Updates**: Live data synchronization
- **Offline Support**: IndexedDB persistence for offline-first experience
- **Comprehensive Testing**: Unit, integration, and E2E tests with Vitest
- **Accessible**: WCAG 2.1 AA compliant
- **Performance Optimized**: Code splitting, lazy loading, optimized bundle size

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 8+
- Firebase project with Firestore and Realtime Database enabled
- Firebase CLI installed globally

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd firebase-demo-enhanced
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials.

4. Start the development server:
```bash
pnpm dev
```

## 🧪 Testing

Run tests:
```bash
pnpm test
```

Run tests with UI:
```bash
pnpm test:ui
```

Run tests with coverage:
```bash
pnpm test:ci
```

## 🏗️ Building for Production

```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## 🚀 Deployment

Deploy to Firebase Hosting:
```bash
pnpm deploy
```

Deploy only hosting:
```bash
pnpm deploy:hosting
```

Deploy only security rules:
```bash
pnpm deploy:rules
```

## 📁 Project Structure

```
src/
├── __tests__/          # Test files
├── components/         # Reusable components
├── config/            # Configuration files
├── features/          # Feature-based modules
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
├── services/          # API services
├── store/             # State management
└── types/             # TypeScript types
```

## 🔐 Security

- Environment variables validated at startup
- Firebase security rules enforced
- Rate limiting on authentication
- XSS and CSRF protection
- Content Security Policy headers

## 📚 Tech Stack

- **Frontend**: React 19, TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod
- **Database**: Firebase Firestore, Realtime Database
- **Testing**: Vitest, Testing Library, MSW
- **CI/CD**: GitHub Actions

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.
```

### 12.2 API Documentation

**docs/API.md**:

```markdown
# API Documentation

## Authentication Service

### `authService.signUp(email, password, displayName?)`
Create a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 8 chars)
- `displayName` (string, optional): User's display name

**Returns:** `Promise<{ success: true; user: User } | { success: false; error: AuthError }>`

### `authService.signIn(email, password)`
Sign in existing user.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:** `Promise<{ success: true; user: User } | { success: false; error: AuthError }>`

### `authService.signInWithGoogle()`
Sign in with Google OAuth.

**Returns:** `Promise<{ success: true; user: User } | { success: false; error: AuthError }>`

### `authService.signOut()`
Sign out current user.

**Returns:** `Promise<void>`

---

## Firestore Service

### `firestoreService.createTask(taskData)`
Create a new task in Firestore.

**Parameters:**
- `taskData` (Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task data

**Returns:** `Promise<TaskId>`

### `firestoreService.getTask(taskId)`
Get a single task by ID.

**Parameters:**
- `taskId` (TaskId): Task identifier

**Returns:** `Promise<Task>`

### `firestoreService.getTasks(options)`
Get tasks with filtering and pagination.

**Parameters:**
- `options` (TaskQueryOptions): Query options

**Returns:** `Promise<PaginatedResponse<Task>>`

### `firestoreService.updateTask(taskId, updates)`
Update a task.

**Parameters:**
- `taskId` (TaskId): Task identifier
- `updates` (Partial<Task>): Fields to update

**Returns:** `Promise<void>`

### `firestoreService.deleteTask(taskId)`
Delete a task.

**Parameters:**
- `taskId` (TaskId): Task identifier

**Returns:** `Promise<void>`

---

## TanStack Query Hooks

### `useTasks(options)`
Fetch tasks with automatic caching and refetching.

**Parameters:**
- `options` (Omit<TaskQueryOptions, 'userId'>): Query options

**Returns:** `UseQueryResult<PaginatedResponse<Task>>`

### `useCreateTask()`
Create a new task with automatic cache invalidation.

**Returns:** `UseMutationResult<TaskId, Error, TaskData>`

### `useUpdateTask()`
Update a task with optimistic updates.

**Returns:** `UseMutationResult<void, Error, { taskId: TaskId; updates: Partial<Task> }>`

### `useDeleteTask()`
Delete a task with cache cleanup.

**Returns:** `UseMutationResult<void, Error, TaskId>`
```

---

## Conclusion

This comprehensive Firebase Google Database Integration Plan (Enhanced Edition) provides a complete, production-ready framework for building modern web applications with Firebase. The plan incorporates the latest technologies, best practices, and patterns that have emerged in the React ecosystem.

### Complete Feature Set

✅ **Authentication System**
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- Email verification
- Account management
- Rate limiting and security

✅ **Database Operations**
- Dual database support (Firestore + RTDB)
- CRUD operations with type safety
- Real-time subscriptions
- Offline persistence
- Advanced querying and filtering
- Batch operations

✅ **State Management**
- Server state with TanStack Query
- Client state with Zustand
- Optimistic updates
- Cache management
- Persistent storage

✅ **Form Handling**
- React Hook Form integration
- Zod validation schemas
- Type-safe form data
- Error handling
- Accessible forms

✅ **UI/UX**
- Modern, responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Loading states
- Error boundaries
- Toast notifications
- Skeleton loaders

✅ **Testing**
- Unit tests with Vitest
- Integration tests
- Component tests
- MSW for API mocking
- Code coverage reports

✅ **Performance**
- Code splitting
- Lazy loading
- Bundle optimization
- Image optimization
- Query optimization
- Caching strategies

✅ **Security**
- Comprehensive security rules
- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Content Security Policy

✅ **DevOps**
- CI/CD with GitHub Actions
- Firebase Hosting deployment
- Environment management
- Automated testing
- Build optimization

✅ **Monitoring**
- Firebase Analytics
- Performance monitoring
- Error tracking
- Custom events
- User analytics

### Key Improvements Over Original

1. **React 19 Support**: Latest React features and concurrent rendering
2. **Stricter TypeScript**: Branded types, discriminated unions, comprehensive type safety
3. **TanStack Query**: Modern data fetching with automatic caching and synchronization
4. **Enhanced Security**: Rate limiting, comprehensive validation, security headers
5. **Better Testing**: Vitest, MSW, comprehensive test coverage
6. **Improved DX**: Better error messages, environment validation, dev tools
7. **Performance**: Optimized bundle size, code splitting, lazy loading
8. **Accessibility**: WCAG 2.1 AA compliance throughout
9. **Production Ready**: CI/CD, monitoring, analytics, proper error handling

### Next Steps for Implementation

1. **Week 1-2**: Project setup, configuration, and core infrastructure
2. **Week 3-4**: Authentication implementation and testing
3. **Week 5-6**: Database services (Firestore and RTDB)
4. **Week 7-8**: UI components and forms
5. **Week 9-10**: Testing and quality assurance
6. **Week 11-12**: Performance optimization and deployment

### Maintenance and Updates

- Regular dependency updates
- Security patches
- Performance monitoring
- User feedback integration
- Feature additions based on requirements

This enhanced plan serves as a complete blueprint for building enterprise-grade Firebase applications with React, providing developers with battle-tested patterns, comprehensive examples, and production-ready code that can be deployed with confidence.

---

**Document Version**: 2.0 (Enhanced with Claude Sonnet 4.5)  
**Last Updated**: December 2024  
**Compatibility**: React 19, TypeScript 5.6, Firebase SDK 11, Vite 6
