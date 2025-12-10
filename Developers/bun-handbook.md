# Bun Handbook for Sorcerer Platform

A complete guide to using Bun as your JavaScript runtime and package manager for the AI Sorcerer services platform.

---

## Why Bun?

- **Speed**: 10-30x faster package installs than npm
- **All-in-one**: Runtime, bundler, package manager, and test runner
- **Drop-in replacement**: Compatible with npm/yarn projects
- **Native TypeScript**: No transpilation step needed for development

---

## Installation

### Install Bun

**macOS / Linux / WSL:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (native):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Verify installation:**
```bash
bun --version
```

---

## Project Setup

### Fresh Clone

```bash
# Navigate to project
cd sorcerer-platform

# Install dependencies (replaces npm install)
bun install
```

This creates a `bun.lockb` binary lockfile (much faster than `package-lock.json`).

### Migrating from npm

If you already have `node_modules` from npm:

```bash
# Remove existing node_modules and lockfile
rm -rf node_modules package-lock.json

# Install with Bun
bun install
```

---

## Daily Commands

| Task | npm | Bun |
|------|-----|-----|
| Install dependencies | `npm install` | `bun install` |
| Add package | `npm install pkg` | `bun add pkg` |
| Add dev dependency | `npm install -D pkg` | `bun add -d pkg` |
| Remove package | `npm uninstall pkg` | `bun remove pkg` |
| Run script | `npm run dev` | `bun run dev` or `bun dev` |
| Run TypeScript directly | N/A | `bun file.ts` |

---

## Development Server

```bash
# Start Vite dev server
bun run dev

# Or simply
bun dev
```

Default: http://localhost:5173

### With specific port

```bash
bun run dev -- --port 3000
```

---

## Building for Production

```bash
# TypeScript check + Vite build
bun run build
```

Output goes to `dist/` folder.

### Build only (skip type check)

```bash
bunx vite build
```

### Preview production build

```bash
bun run preview
```

---

## Type Checking

```bash
# Full type check
bunx tsc --noEmit

# Watch mode
bunx tsc --noEmit --watch
```

---

## Testing

Bun has a built-in test runner. Create test files with `.test.ts` extension.

### Example Test

Create `src/lib/utils.test.ts`:

```typescript
import { expect, test, describe } from "bun:test";
import { cn, generateGoogleCalendarUrl } from "./utils";

describe("cn utility", () => {
  test("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  test("merges tailwind conflicts correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("generateGoogleCalendarUrl", () => {
  test("generates valid URL", () => {
    const url = generateGoogleCalendarUrl({
      title: "Test Meeting",
      description: "A test",
      startDate: new Date("2025-01-15T14:00:00Z"),
      endDate: new Date("2025-01-15T15:00:00Z"),
    });

    expect(url).toContain("calendar.google.com");
    expect(url).toContain("Test%20Meeting");
    expect(url).toContain("action=TEMPLATE");
  });

  test("includes location when provided", () => {
    const url = generateGoogleCalendarUrl({
      title: "Meeting",
      description: "Desc",
      startDate: new Date(),
      endDate: new Date(),
      location: "https://meet.google.com/abc",
    });

    expect(url).toContain("location=");
  });
});
```

### Run Tests

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Specific file
bun test utils.test.ts

# With coverage
bun test --coverage
```

### Test Configuration

Create `bunfig.toml` in project root:

```toml
[test]
# Test file patterns
preload = ["./src/test-setup.ts"]
coverage = true
coverageDir = "coverage"
```

---

## Linting

```bash
# Run ESLint
bunx eslint src/

# Fix auto-fixable issues
bunx eslint src/ --fix
```

---

## Adding Dependencies

### Runtime dependencies

```bash
bun add lucide-react
bun add react-router-dom
```

### Dev dependencies

```bash
bun add -d @types/node
bun add -d vitest  # if you prefer Vitest over Bun's test runner
```

### Exact version

```bash
bun add react@18.2.0
```

---

## Running Scripts

The `package.json` scripts work unchanged:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  }
}
```

Run any script:

```bash
bun run dev
bun run build
bun run lint
bun test
```

---

## Environment Variables

Create `.env.local` for local development:

```bash
VITE_API_URL=http://localhost:8080
```

Bun automatically loads `.env` files. Access in code:

```typescript
// In Vite (client-side) - must be prefixed with VITE_
const apiUrl = import.meta.env.VITE_API_URL;

// In Bun scripts (server-side)
const secret = Bun.env.MY_SECRET;
// or
const secret = process.env.MY_SECRET;
```

---

## PHP API Testing Locally

Run a local PHP server for testing the contact form:

```bash
# Terminal 1: React dev server
bun dev

# Terminal 2: PHP API server
cd api && php -S localhost:8080
```

Update `ConsultationForm.tsx` temporarily for local testing:

```typescript
// Development
const response = await fetch("http://localhost:8080/contact.php", {

// Production
const response = await fetch("/api/contact.php", {
```

---

## Deployment Build

Complete build and preparation:

```bash
# Clean previous build
rm -rf dist

# Type check + build
bun run build

# Verify output
ls -la dist/
```

### Deploy to Server

```bash
# Upload dist folder
rsync -avz --delete dist/ user@server:/var/www/bookings.oragenai.com/dist/

# Upload PHP handler
rsync -avz api/contact.php user@server:/var/www/bookings.oragenai.com/api/
```

---

## Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### TypeScript errors in editor but build works

```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Vite HMR not working

```bash
# Check if port is in use
lsof -i :5173

# Use different port
bun dev --port 3000
```

### Bun vs Node incompatibility

Some packages may have Node-specific code. Usually works fine, but if issues arise:

```bash
# Run with Node compatibility
bun --bun run dev
```

---

## Performance Comparison

Typical times on this project:

| Operation | npm | Bun |
|-----------|-----|-----|
| Fresh install | ~15s | ~2s |
| Build | ~8s | ~6s |
| Dev server start | ~2s | ~0.5s |
| Test suite | ~3s | ~0.3s |

---

## Quick Reference

```bash
# Install
bun install

# Dev server
bun dev

# Build
bun run build

# Test
bun test

# Add package
bun add <package>

# Remove package
bun remove <package>

# Run any script
bun run <script>

# Run TypeScript file directly
bun run script.ts

# Update all dependencies
bun update
```

---

## Recommended Workflow

```bash
# 1. Start development
bun dev

# 2. Make changes, auto-reloads

# 3. Run tests before commit
bun test

# 4. Type check
bunx tsc --noEmit

# 5. Build for production
bun run build

# 6. Preview locally
bun run preview

# 7. Deploy
rsync -avz dist/ user@server:/var/www/bookings.oragenai.com/dist/
```

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun Discord](https://bun.sh/discord)
- [Vite with Bun](https://bun.sh/guides/ecosystem/vite)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
