# Cloud to Local Development Migration Guide

This guide outlines the steps required to migrate a React + Vite + TypeScript project from cloud-based development (using CDN imports) to local development with proper bundling.

## Common Issues in Cloud-Based Projects

When projects are created on cloud platforms (like StackBlitz, CodeSandbox, etc.), they often use workarounds that don't work in local development:

1. **CDN Import Maps** - Using esm.sh or other CDN services via `<script type="importmap">`
2. **Tailwind CSS via CDN** - Using `<script src="https://cdn.tailwindcss.com"></script>`
3. **Missing Configuration Files** - No `tailwind.config.js`, `postcss.config.js`
4. **Missing CSS Files** - References to non-existent stylesheets
5. **Incorrect Import Paths** - Imports that work with CDN but not with bundlers

## Migration Steps

### 1. Remove CDN Dependencies from index.html

**Remove:**
```html
<!-- Remove entire importmap section -->
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@...",
    // ... etc
  }
}
</script>

<!-- Remove Tailwind CDN -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Keep only:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your App</title>
    <!-- Custom fonts -->
    <!-- Custom styles -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

### 2. Install Tailwind CSS Locally

Add Tailwind CSS and its dependencies:

```bash
bun add -D tailwindcss postcss autoprefixer
```

Or with npm:
```bash
npm install -D tailwindcss postcss autoprefixer
```

### 3. Create Tailwind Configuration

**Create `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}", // If files are in root
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Create `postcss.config.js`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 4. Create CSS File with Tailwind Directives

**Create `index.css` (or `src/index.css`):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom styles here */
```

### 5. Update index.html to Reference CSS

Add to `<head>`:
```html
<link rel="stylesheet" href="/index.css">
```

Or if using src directory:
```html
<link rel="stylesheet" href="/src/index.css">
```

### 6. Update package.json Dependencies

Ensure all required dependencies are listed:

```json
{
  "dependencies": {
    "react": "^19.x.x",
    "react-dom": "^19.x.x",
    // ... other runtime dependencies
  },
  "devDependencies": {
    "@types/react": "^19.x.x",
    "@types/react-dom": "^19.x.x",
    "@types/node": "^22.x.x",
    "@vitejs/plugin-react": "^5.x.x",
    "typescript": "~5.x.x",
    "vite": "^6.x.x",
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x"
  }
}
```

### 7. Verify TypeScript Configuration

**Ensure `tsconfig.json` includes:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["node"],
    "skipLibCheck": true
  }
}
```

### 8. Verify Vite Configuration

**Check `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  server: {
    port: 3000,
  }
});
```

### 9. Install Dependencies and Test

```bash
# Install all dependencies
bun install

# Start development server
bun run dev
```

### 10. Address Common Runtime Errors

**If you see module resolution errors:**
- Ensure all imports use correct paths (no CDN URLs)
- Check that file extensions match (`.tsx`, `.ts`, `.jsx`, `.js`)
- Verify all dependencies are installed

**If Tailwind styles don't apply:**
- Check that `tailwind.config.js` content paths are correct
- Verify `index.css` is imported/linked properly
- Ensure PostCSS config exists

**If TypeScript errors appear:**
- Install missing `@types/*` packages
- Update `tsconfig.json` settings
- Check for version compatibility

## Quick Checklist

- [ ] Remove CDN import maps from `index.html`
- [ ] Remove Tailwind CDN script from `index.html`
- [ ] Install Tailwind CSS, PostCSS, Autoprefixer
- [ ] Create `tailwind.config.js`
- [ ] Create `postcss.config.js`
- [ ] Create `index.css` with Tailwind directives
- [ ] Link `index.css` in `index.html`
- [ ] Install missing type definitions
- [ ] Run `bun install` (or `npm install`)
- [ ] Run `bun run dev` (or `npm run dev`)
- [ ] Fix any runtime errors
- [ ] Verify app runs cleanly

## Node Version Requirements

For compatibility with modern tools:
- **Node.js**: 18.x or higher recommended
- **Bun**: Latest stable version
- **TypeScript**: 5.x series

## Additional Notes

- Always commit your changes before migration in case rollback is needed
- Test thoroughly after migration to ensure all features work
- Consider adding `.env.local` to `.gitignore` if using environment variables
- Update documentation to reflect local development setup

## Troubleshooting

### "Cannot find module" errors
- Run `bun install` again
- Check `node_modules` exists
- Verify import paths are correct

### Styles not applying
- Clear browser cache
- Check browser console for CSS errors
- Verify Tailwind config content paths

### Build errors
- Check for syntax errors in config files
- Ensure all plugins are installed
- Verify file paths and extensions

---

*Last Updated: January 2026*
