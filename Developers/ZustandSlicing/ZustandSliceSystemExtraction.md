# Zustand Slice + System Extraction Methodology

> A white-label guide for refactoring monolithic Zustand stores in React TypeScript applications

---

## Table of Contents

1. [Overview](#overview)
2. [When to Apply](#when-to-apply)
3. [Assessment Framework](#assessment-framework)
4. [Architecture Patterns](#architecture-patterns)
5. [Implementation Guide](#implementation-guide)
6. [Code Templates](#code-templates)
7. [Migration Strategy](#migration-strategy)
8. [Quality Checklist](#quality-checklist)

---

## Overview

### Purpose

This methodology provides a systematic approach to decomposing large Zustand stores into maintainable, testable, and scalable modules. It combines two complementary patterns:

- **Slice Pattern**: Domain-driven state organization using Zustand's native slice composition
- **System Extraction**: Isolating complex logic (especially update loops) into pure functions

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | Each slice owns one domain; each system performs one transformation |
| **Composition over Inheritance** | Small, composable units combined at the store level |
| **Pure Functions for Logic** | Systems are pure functions that transform state, enabling easy testing |
| **Minimal Cross-Slice Coupling** | Slices read from combined state but write only to their own domain |
| **Progressive Enhancement** | Refactor incrementally without breaking existing functionality |

---

## When to Apply

### Trigger Thresholds

| Metric | Warning | Critical | Action Required |
|--------|---------|----------|-----------------|
| **File Length** | > 400 lines | > 700 lines | Immediate refactor |
| **Action Count** | > 15 actions | > 25 actions | Slice extraction |
| **Tick/Update Function** | > 80 lines | > 150 lines | System extraction |
| **Domain Count** | > 3 distinct domains | > 5 domains | Mandatory slicing |
| **Cyclomatic Complexity** | > 15 per function | > 25 per function | Logic extraction |

### Symptom Checklist

Apply this methodology if **3+ symptoms** are present:

- [ ] Developers avoid modifying the store due to complexity
- [ ] Bug fixes in one area cause regressions in another
- [ ] Unit testing requires mocking the entire store
- [ ] Code reviews take excessive time for store changes
- [ ] New team members struggle to understand store structure
- [ ] `tick()`, `update()`, or similar functions exceed 100 lines
- [ ] Multiple unrelated state properties in single file
- [ ] Frequent merge conflicts in store file

---

## Assessment Framework

### Step 1: Domain Identification

Analyze the store and categorize all state properties and actions into domains.

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN ANALYSIS MATRIX                    │
├─────────────────┬───────────────────┬───────────────────────┤
│ Domain Name     │ State Properties  │ Actions               │
├─────────────────┼───────────────────┼───────────────────────┤
│ [Domain A]      │ prop1, prop2      │ action1, action2      │
│ [Domain B]      │ prop3, prop4      │ action3, action4      │
│ [Shared/Core]   │ prop5             │ action5               │
└─────────────────┴───────────────────┴───────────────────────┘
```

**Common Domain Patterns:**

| Application Type | Typical Domains |
|------------------|-----------------|
| E-commerce | Cart, Products, User, Checkout, Orders |
| Dashboard | Auth, Data, Filters, UI, Notifications |
| Game | Player, World, Combat, Inventory, UI |
| Social | User, Feed, Messages, Notifications |
| Editor | Document, Selection, History, Tools, UI |

### Step 2: Dependency Mapping

For each action, identify:

1. **Reads**: What state does it read?
2. **Writes**: What state does it modify?
3. **Side Effects**: External calls, timers, etc.

```typescript
// Example: Action Dependency Analysis
// Action: purchaseItem
// ├── Reads: credits, inventory, marketOrders
// ├── Writes: credits, inventory, marketOrders, messages
// └── Side Effects: None
//
// Conclusion: Belongs to "Market" slice, needs read access to "Player" slice
```

### Step 3: Complexity Hotspot Detection

Identify functions requiring System Extraction:

```
COMPLEXITY INDICATORS:
├── Loop-based updates (game ticks, animations)
├── Multi-step transformations
├── Conditional branching > 5 paths
├── Nested state mutations
└── Time-delta dependent calculations
```

### Step 4: Slice Boundary Definition

Define clear boundaries using this template:

```
SLICE: [Name]Slice
├── STATE
│   ├── [property]: [type] - [description]
│   └── ...
├── ACTIONS
│   ├── [action]([params]): [description]
│   └── ...
├── READS FROM
│   └── [OtherSlice].[property] (read-only)
└── SYSTEMS (if applicable)
    └── [systemName]: [description]
```

---

## Architecture Patterns

### Target Directory Structure

```
src/
└── store/
    ├── index.ts                 # Store creation, slice combination, exports
    ├── types.ts                 # Slice interfaces, combined state type
    │
    ├── slices/
    │   ├── [domain]Slice.ts     # One file per domain
    │   └── ...
    │
    ├── systems/                 # Optional: for complex update logic
    │   ├── index.ts             # System orchestration
    │   └── [name]System.ts      # Pure transformation functions
    │
    └── utils/                   # Shared helpers
        └── [name].ts
```

### Slice Pattern

Each slice is a `StateCreator` that contributes state and actions to the combined store:

```
┌────────────────────────────────────────────────────────────┐
│                     COMBINED STORE                          │
├────────────┬────────────┬────────────┬────────────────────┤
│  SliceA    │  SliceB    │  SliceC    │  SliceD            │
│  ├─state   │  ├─state   │  ├─state   │  ├─state           │
│  └─actions │  └─actions │  └─actions │  └─actions         │
└────────────┴────────────┴────────────┴────────────────────┘
         │           │           │              │
         └───────────┴───────────┴──────────────┘
                           │
                    get() provides
                    full state access
```

### System Pattern

Systems are pure functions that transform state:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Input State │ ──▶ │   System    │ ──▶ │Output State │
└─────────────┘     │ (Pure Fn)   │     └─────────────┘
                    └─────────────┘
                          │
                    No side effects
                    Deterministic
                    Easily testable
```

### Combined Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         tick() / update()                     │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ System 1 │ → │ System 2 │ → │ System 3 │ → │ System N │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│       │              │              │              │         │
│       └──────────────┴──────────────┴──────────────┘         │
│                              │                                │
│                      Accumulated Result                       │
│                              │                                │
│                        set(result)                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Guide

### Phase 1: Utility Extraction

Extract pure helper functions first (lowest risk):

```typescript
// BEFORE: Inline in store
const useStore = create((set, get) => ({
  // ... 
  someAction: () => {
    const dist = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + 
      Math.pow(p2.y - p1.y, 2)
    );
    // ...
  }
}));

// AFTER: Extracted utility
// utils/geometry.ts
export const distance = (p1: Point, p2: Point): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// Store imports and uses
import { distance } from './utils/geometry';
```

### Phase 2: Type Definition

Define slice interfaces before implementation:

```typescript
// types.ts
import { StateCreator } from 'zustand';

// Individual slice interfaces
export interface AuthSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export interface DataSlice {
  items: Item[];
  isLoading: boolean;
  
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
}

// Combined state type
export type AppState = AuthSlice & DataSlice; // & OtherSlices...

// Slice creator helper type
export type SliceCreator<T> = StateCreator<AppState, [], [], T>;
```

### Phase 3: Slice Implementation

Implement each slice following this template:

```typescript
// slices/authSlice.ts
import { SliceCreator, AuthSlice } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,

  // Actions
  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Can access other slices via get()
    // get().resetData(); // if needed
  },
});
```

### Phase 4: System Implementation

For complex update logic, extract into systems:

```typescript
// systems/animationSystem.ts
import { Entity } from '../../types';

interface AnimationResult {
  entities: Entity[];
  completedAnimations: string[];
}

/**
 * Pure function - no side effects
 * Processes animation frames for all entities
 */
export const animationSystem = (
  entities: Entity[],
  delta: number
): AnimationResult => {
  const completedAnimations: string[] = [];
  
  const updatedEntities = entities.map(entity => {
    if (!entity.animation) return entity;
    
    const newFrame = entity.animation.currentFrame + delta * entity.animation.speed;
    
    if (newFrame >= entity.animation.totalFrames) {
      completedAnimations.push(entity.id);
      return { ...entity, animation: null };
    }
    
    return {
      ...entity,
      animation: { ...entity.animation, currentFrame: newFrame }
    };
  });
  
  return { entities: updatedEntities, completedAnimations };
};
```

### Phase 5: System Orchestration

Create a coordinator for running systems in sequence:

```typescript
// systems/index.ts
import { AppState } from '../types';
import { animationSystem } from './animationSystem';
import { physicsSystem } from './physicsSystem';
import { collisionSystem } from './collisionSystem';

export interface SystemsResult {
  entities: Entity[];
  // ... other accumulated results
}

export const runSystems = (
  state: AppState,
  delta: number
): SystemsResult => {
  let entities = [...state.entities];
  
  // Run systems in dependency order
  const animResult = animationSystem(entities, delta);
  entities = animResult.entities;
  
  const physicsResult = physicsSystem(entities, delta);
  entities = physicsResult.entities;
  
  const collisionResult = collisionSystem(entities);
  entities = collisionResult.entities;
  
  return { entities };
};
```

### Phase 6: Store Composition

Combine all slices into the final store:

```typescript
// index.ts
import { create } from 'zustand';
import { AppState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createDataSlice } from './slices/dataSlice';
import { createUISlice } from './slices/uiSlice';

export const useAppStore = create<AppState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createDataSlice(...args),
  ...createUISlice(...args),
}));

// Selective exports for external use
export type { AppState } from './types';
export { useAppStore };
```

---

## Code Templates

### Slice Template

```typescript
// slices/[domain]Slice.ts
import { SliceCreator, [Domain]Slice } from '../types';

export const create[Domain]Slice: SliceCreator<[Domain]Slice> = (set, get) => ({
  // ============================================
  // State
  // ============================================
  property1: initialValue1,
  property2: initialValue2,

  // ============================================
  // Actions
  // ============================================
  
  /**
   * [Description of action]
   */
  action1: (param: Type) => {
    set((state) => ({
      property1: /* new value */,
    }));
  },

  /**
   * [Description of action]
   */
  action2: () =>
    set((state) => {
      // Access other slices via state (from combined store)
      const otherValue = state.otherSliceProperty;
      
      // Validation
      if (!condition) {
        return state; // No change
      }
      
      // Compute new state
      return {
        property2: /* new value */,
      };
    }),
});
```

### System Template

```typescript
// systems/[name]System.ts
import { /* Types */ } from '../../types';

interface [Name]SystemInput {
  // Input parameters
}

interface [Name]SystemResult {
  // Output structure
}

/**
 * [Description of what this system does]
 * 
 * @param input - [Description]
 * @param delta - Time delta in seconds (if applicable)
 * @returns [Description of output]
 * 
 * @pure This function has no side effects
 */
export const [name]System = (
  input: [Name]SystemInput,
  delta?: number
): [Name]SystemResult => {
  // Implementation
  
  return {
    // Result
  };
};
```

### Types Template

```typescript
// types.ts
import { StateCreator } from 'zustand';

// ============================================
// Slice Interfaces
// ============================================

export interface [Domain1]Slice {
  // State
  property1: Type1;
  property2: Type2;
  
  // Actions
  action1: (param: Type) => void;
  action2: () => Promise<void>;
}

export interface [Domain2]Slice {
  // State
  property3: Type3;
  
  // Actions
  action3: () => void;
}

// ============================================
// Combined State
// ============================================

export type AppState = [Domain1]Slice & [Domain2]Slice; // & ...

// ============================================
// Helper Types
// ============================================

export type SliceCreator<T> = StateCreator<AppState, [], [], T>;
```

### Store Index Template

```typescript
// index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware'; // Optional
import { AppState } from './types';

// Import all slices
import { create[Domain1]Slice } from './slices/[domain1]Slice';
import { create[Domain2]Slice } from './slices/[domain2]Slice';

/**
 * Application Store
 * 
 * Composed of:
 * - [Domain1]Slice: [description]
 * - [Domain2]Slice: [description]
 */
export const useAppStore = create<AppState>()(
  // Optional: Add middleware
  // devtools(
  // persist(
    (...args) => ({
      ...create[Domain1]Slice(...args),
      ...create[Domain2]Slice(...args),
    })
  // , { name: 'app-storage' })
  // , { name: 'AppStore' })
);

// ============================================
// Exports
// ============================================

export type { AppState } from './types';

// Re-export utilities if needed externally
export { someUtility } from './utils/someUtility';
```

---

## Migration Strategy

### Incremental Migration Path

```
Week 1: Assessment & Planning
├── Complete domain analysis
├── Map dependencies
├── Define slice boundaries
└── Create migration checklist

Week 2: Foundation
├── Create directory structure
├── Define types.ts
├── Extract utilities
└── Verify no regressions

Week 3-N: Slice Extraction (one per iteration)
├── Extract slice N
├── Update store composition
├── Update imports across codebase
├── Test thoroughly
└── Repeat for next slice

Final Week: System Extraction (if applicable)
├── Extract systems from tick/update
├── Create orchestration layer
├── Performance validation
└── Documentation
```

### Safe Migration Checklist

For each slice extraction:

- [ ] Create new slice file with state and actions
- [ ] Add slice interface to types.ts
- [ ] Update combined AppState type
- [ ] Add slice to store composition in index.ts
- [ ] Remove migrated code from original store
- [ ] Search codebase for direct store property access
- [ ] Update all imports
- [ ] Run full test suite
- [ ] Manual smoke test of affected features

### Rollback Strategy

Maintain ability to rollback:

```typescript
// Keep original store temporarily during migration
// store/legacy/store.ts (original)
// store/index.ts (new modular version)

// Feature flag for gradual rollout
const useModularStore = process.env.REACT_APP_MODULAR_STORE === 'true';

export const useAppStore = useModularStore 
  ? newModularStore 
  : legacyStore;
```

---

## Quality Checklist

### Per-File Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| Lines of Code | < 150 | 250 |
| Actions per Slice | 3-7 | 12 |
| Dependencies | < 5 imports | 10 |
| Cyclomatic Complexity | < 10 | 15 |

### Architecture Quality

- [ ] No slice directly modifies another slice's state
- [ ] All systems are pure functions
- [ ] Types are defined before implementation
- [ ] Each file has single responsibility
- [ ] Cross-slice communication uses `get()` for reading
- [ ] Utilities have no store dependencies

### Testing Quality

- [ ] Each system has unit tests with mock data
- [ ] Slice actions have integration tests
- [ ] Store composition is tested
- [ ] Edge cases are covered
- [ ] Performance benchmarks for systems (if applicable)

### Documentation Quality

- [ ] Each slice has JSDoc header describing purpose
- [ ] Complex actions have inline comments
- [ ] Systems document their inputs/outputs
- [ ] README in store directory explains architecture
- [ ] Migration notes for breaking changes

---

## Appendix: Decision Trees

### Should I Extract a Slice?

```
START
  │
  ▼
Does this domain have 3+ related state properties?
  │
  ├─ NO ──▶ Keep in existing slice or create shared/core slice
  │
  ▼ YES
Are there 2+ actions that only modify this domain's state?
  │
  ├─ NO ──▶ Consider merging with related domain
  │
  ▼ YES
Is this domain likely to grow independently?
  │
  ├─ NO ──▶ Consider combining with related domain
  │
  ▼ YES
EXTRACT AS SEPARATE SLICE ✓
```

### Should I Extract a System?

```
START
  │
  ▼
Is this logic inside a tick/update/loop function?
  │
  ├─ NO ──▶ Probably not needed (keep as action)
  │
  ▼ YES
Does it transform state based on inputs only (no side effects)?
  │
  ├─ NO ──▶ Refactor to be pure first, then extract
  │
  ▼ YES
Is the logic > 30 lines or has > 3 conditional branches?
  │
  ├─ NO ──▶ May be acceptable inline
  │
  ▼ YES
EXTRACT AS SYSTEM ✓
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-09 | Initial methodology release |

---

*This methodology is designed to be applied dynamically to any React TypeScript application using Zustand. Adapt thresholds and patterns to your team's specific needs.*
