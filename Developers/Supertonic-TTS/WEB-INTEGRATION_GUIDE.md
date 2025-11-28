# Supertonic TTS - Web Integration Guide

**Version**: 1.0.0  
**Last Updated**: 2025-11-28  
**Target Audience**: Developers integrating Supertonic TTS into existing web applications

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Understanding](#architecture-understanding)
4. [Step-by-Step Integration](#step-by-step-integration)
5. [Asset Management](#asset-management)
6. [API Reference](#api-reference)
7. [Configuration Options](#configuration-options)
8. [Example Implementations](#example-implementations)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)
11. [Advanced Topics](#advanced-topics)

---

## Overview

Supertonic TTS is a client-side text-to-speech system that runs entirely in the browser using ONNX Runtime Web. It leverages WebGPU (with WebAssembly fallback) for high-performance inference without requiring a server backend.

### Key Features

- **Pure client-side**: No server required for inference
- **WebGPU/WASM**: Hardware acceleration with automatic fallback
- **Pre-extracted voices**: Four voice styles (2 male, 2 female) ready to use
- **Real-time synthesis**: Generate speech directly in the browser
- **Low latency**: Minimal overhead after initial model loading
- **Privacy-focused**: All processing happens locally

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGPU** (optional): Chrome/Edge 113+ for accelerated inference
- **Memory**: ~300MB for models + runtime overhead
- **Storage**: ~260MB for ONNX models + voice styles

---

## Prerequisites

### 1. Development Tools

```bash
# Node.js 18+ required
node --version  # Should be v18.0.0 or higher

# Package manager (choose one)
npm --version
# OR
pnpm --version
# OR
yarn --version
```

### 2. Git LFS (for downloading models)

```bash
# Windows
winget install GitHub.GitLFS
git lfs install

# macOS
brew install git-lfs
git lfs install

# Linux
sudo apt-get install git-lfs
git lfs install
```

### 3. Modern Build Tool

The standalone demo uses Vite, but you can integrate with:
- Vite
- Webpack
- Rollup
- Parcel
- esbuild
- Or any modern bundler supporting ES modules

---

## Architecture Understanding

### System Components

```
┌─────────────────────────────────────────────────────┐
│                  Your Web App                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │         TTS Integration Layer             │    │
│  │  (Your code calling Supertonic API)       │    │
│  └───────────────┬───────────────────────────┘    │
│                  │                                  │
│  ┌───────────────▼───────────────────────────┐    │
│  │         helper.js (Core Library)          │    │
│  │  - UnicodeProcessor                       │    │
│  │  - TextToSpeech                           │    │
│  │  - Style                                  │    │
│  │  - Utility functions                      │    │
│  └───────────────┬───────────────────────────┘    │
│                  │                                  │
│  ┌───────────────▼───────────────────────────┐    │
│  │     ONNX Runtime Web (onnxruntime-web)    │    │
│  │  - Model execution                        │    │
│  │  - WebGPU/WASM backend                    │    │
│  └───────────────┬───────────────────────────┘    │
│                  │                                  │
│  ┌───────────────▼───────────────────────────┐    │
│  │         Browser APIs                      │    │
│  │  - WebGPU / WebAssembly                   │    │
│  │  - Web Audio API                          │    │
│  │  - Fetch API                              │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
    ┌────────┐                  ┌──────────┐
    │ ONNX   │                  │  Voice   │
    │ Models │                  │  Styles  │
    └────────┘                  └──────────┘
```

### File Structure

```
your-web-app/
├── src/
│   └── tts/
│       ├── helper.js              # Core TTS library (copy from web/)
│       └── tts-integration.js     # Your integration wrapper
├── public/
│   └── assets/
│       ├── onnx/                  # ONNX model files
│       │   ├── duration_predictor.onnx
│       │   ├── text_encoder.onnx
│       │   ├── vector_estimator.onnx
│       │   ├── vocoder.onnx
│       │   ├── tts.json
│       │   └── unicode_indexer.json
│       └── voice_styles/          # Pre-extracted voice embeddings
│           ├── M1.json
│           ├── M2.json
│           ├── F1.json
│           └── F2.json
└── package.json
```

---

## Step-by-Step Integration

### Step 1: Install Dependencies

Add the required npm package to your project:

```bash
npm install onnxruntime-web@^1.17.0
# OR
pnpm add onnxruntime-web@^1.17.0
# OR
yarn add onnxruntime-web@^1.17.0
```

**Optional** (if you need FFT for audio processing):
```bash
npm install fft.js@^4.0.3
```

### Step 2: Download Model Assets

Clone the Supertonic model repository:

```bash
# From your project root
git clone https://huggingface.co/Supertone/supertonic public/assets
```

This downloads:
- ONNX models (~260MB)
- Voice style files (~2MB)
- Configuration files

**Alternative**: Host assets on CDN and modify paths accordingly.

### Step 3: Copy Core Library

Copy `helper.js` from the web demo to your project:

```bash
# From the supertonic repository
cp web/helper.js your-project/src/tts/helper.js
```

### Step 4: Create Integration Wrapper

Create `tts-integration.js` in your project:

```javascript
// src/tts/tts-integration.js
import {
    loadTextToSpeech,
    loadVoiceStyle,
    writeWavFile
} from './helper.js';

class SupertonicTTS {
    constructor() {
        this.textToSpeech = null;
        this.cfgs = null;
        this.currentStyle = null;
        this.isInitialized = false;
        this.executionProvider = 'wasm';
    }

    /**
     * Initialize the TTS engine
     * @param {Object} options - Configuration options
     * @param {string} options.assetsPath - Path to assets directory
     * @param {boolean} options.preferWebGPU - Use WebGPU if available
     * @param {Function} options.onProgress - Progress callback
     * @returns {Promise<Object>} Initialization result
     */
    async initialize(options = {}) {
        const {
            assetsPath = '/assets',
            preferWebGPU = true,
            onProgress = null
        } = options;

        if (this.isInitialized) {
            return { success: true, provider: this.executionProvider };
        }

        try {
            const onnxPath = `${assetsPath}/onnx`;
            
            // Try WebGPU first if preferred
            if (preferWebGPU) {
                try {
                    const result = await loadTextToSpeech(
                        onnxPath,
                        {
                            executionProviders: ['webgpu'],
                            graphOptimizationLevel: 'all'
                        },
                        onProgress
                    );
                    
                    this.textToSpeech = result.textToSpeech;
                    this.cfgs = result.cfgs;
                    this.executionProvider = 'webgpu';
                } catch (webgpuError) {
                    console.log('WebGPU not available, falling back to WebAssembly');
                    // Fall through to WASM
                }
            }

            // Use WASM if WebGPU failed or not preferred
            if (!this.textToSpeech) {
                const result = await loadTextToSpeech(
                    onnxPath,
                    {
                        executionProviders: ['wasm'],
                        graphOptimizationLevel: 'all'
                    },
                    onProgress
                );
                
                this.textToSpeech = result.textToSpeech;
                this.cfgs = result.cfgs;
                this.executionProvider = 'wasm';
            }

            this.isInitialized = true;
            
            return {
                success: true,
                provider: this.executionProvider,
                sampleRate: this.textToSpeech.sampleRate
            };
        } catch (error) {
            console.error('Failed to initialize TTS:', error);
            throw new Error(`TTS initialization failed: ${error.message}`);
        }
    }

    /**
     * Load a voice style
     * @param {string} stylePath - Path to voice style JSON
     * @returns {Promise<void>}
     */
    async loadVoiceStyle(stylePath) {
        if (!this.isInitialized) {
            throw new Error('TTS not initialized. Call initialize() first.');
        }

        try {
            this.currentStyle = await loadVoiceStyle([stylePath], false);
        } catch (error) {
            throw new Error(`Failed to load voice style: ${error.message}`);
        }
    }

    /**
     * Generate speech from text
     * @param {string} text - Text to synthesize
     * @param {Object} options - Synthesis options
     * @returns {Promise<Object>} Audio data and metadata
     */
    async synthesize(text, options = {}) {
        if (!this.isInitialized) {
            throw new Error('TTS not initialized. Call initialize() first.');
        }

        if (!this.currentStyle) {
            throw new Error('No voice style loaded. Call loadVoiceStyle() first.');
        }

        const {
            totalSteps = 5,
            speed = 1.05,
            silenceDuration = 0.3,
            onProgress = null
        } = options;

        try {
            const { wav, duration } = await this.textToSpeech.call(
                text,
                this.currentStyle,
                totalSteps,
                speed,
                silenceDuration,
                onProgress
            );

            // Trim audio to actual length
            const wavLen = Math.floor(this.textToSpeech.sampleRate * duration[0]);
            const wavOut = wav.slice(0, wavLen);

            return {
                audioData: wavOut,
                duration: duration[0],
                sampleRate: this.textToSpeech.sampleRate
            };
        } catch (error) {
            throw new Error(`Speech synthesis failed: ${error.message}`);
        }
    }

    /**
     * Synthesize and get WAV file
     * @param {string} text - Text to synthesize
     * @param {Object} options - Synthesis options
     * @returns {Promise<Blob>} WAV file as Blob
     */
    async synthesizeToWav(text, options = {}) {
        const { audioData, sampleRate } = await this.synthesize(text, options);
        const wavBuffer = writeWavFile(audioData, sampleRate);
        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    /**
     * Synthesize and get audio URL
     * @param {string} text - Text to synthesize
     * @param {Object} options - Synthesis options
     * @returns {Promise<string>} Object URL for audio
     */
    async synthesizeToURL(text, options = {}) {
        const blob = await this.synthesizeToWav(text, options);
        return URL.createObjectURL(blob);
    }

    /**
     * Check if TTS is ready
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized && this.currentStyle !== null;
    }

    /**
     * Get execution provider info
     * @returns {Object}
     */
    getInfo() {
        return {
            initialized: this.isInitialized,
            provider: this.executionProvider,
            sampleRate: this.textToSpeech?.sampleRate,
            hasStyle: this.currentStyle !== null
        };
    }
}

// Export singleton instance
export const tts = new SupertonicTTS();

// Export class for multiple instances
export default SupertonicTTS;
```

### Step 5: Use in Your Application

```javascript
// In your app component/page
import { tts } from './tts/tts-integration.js';

async function setupTTS() {
    try {
        // Initialize TTS engine
        console.log('Initializing TTS...');
        const initResult = await tts.initialize({
            assetsPath: '/assets',
            preferWebGPU: true,
            onProgress: (modelName, current, total) => {
                console.log(`Loading model ${current}/${total}: ${modelName}`);
            }
        });

        console.log(`TTS initialized with ${initResult.provider}`);

        // Load default voice style
        await tts.loadVoiceStyle('/assets/voice_styles/M1.json');
        console.log('Voice loaded');

        // Ready to synthesize!
        return true;
    } catch (error) {
        console.error('TTS setup failed:', error);
        return false;
    }
}

async function generateSpeech(text) {
    if (!tts.isReady()) {
        throw new Error('TTS not ready');
    }

    try {
        // Get audio URL
        const audioURL = await tts.synthesizeToURL(text, {
            totalSteps: 5,
            speed: 1.05,
            onProgress: (step, total) => {
                console.log(`Denoising: ${step}/${total}`);
            }
        });

        // Play audio
        const audio = new Audio(audioURL);
        await audio.play();

        return audioURL;
    } catch (error) {
        console.error('Speech generation failed:', error);
        throw error;
    }
}

// Usage
(async () => {
    await setupTTS();
    await generateSpeech('Hello, this is a test of the text to speech system.');
})();
```

---

## Asset Management

### Option 1: Self-Hosted Assets (Recommended)

**Advantages**:
- Full control over assets
- No external dependencies
- Predictable performance
- Works offline

**Setup**:
```bash
# Download assets
git clone https://huggingface.co/Supertone/supertonic public/assets

# Verify structure
ls public/assets/onnx/
# Should see: duration_predictor.onnx, text_encoder.onnx, etc.

ls public/assets/voice_styles/
# Should see: M1.json, M2.json, F1.json, F2.json
```

### Option 2: CDN-Hosted Assets

**Advantages**:
- Faster deployment
- Reduced build size
- Shared cache across sites

**Setup**:
```javascript
// Host assets on CDN (e.g., AWS S3, Cloudflare R2)
const CDN_BASE = 'https://your-cdn.com/supertonic-assets';

await tts.initialize({
    assetsPath: CDN_BASE,
    preferWebGPU: true
});

await tts.loadVoiceStyle(`${CDN_BASE}/voice_styles/M1.json`);
```

**Important**: Ensure CORS is properly configured:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### Option 3: Lazy Loading

Load assets on-demand to reduce initial load:

```javascript
class LazyTTS extends SupertonicTTS {
    async synthesizeWithAutoInit(text, voiceStyle = 'M1') {
        if (!this.isInitialized) {
            await this.initialize();
            await this.loadVoiceStyle(`/assets/voice_styles/${voiceStyle}.json`);
        }
        return this.synthesize(text);
    }
}
```

---

## API Reference

### Class: SupertonicTTS

Main class for TTS functionality.

#### Methods

##### `initialize(options)`

Initialize the TTS engine.

**Parameters**:
- `options.assetsPath` (string): Path to assets directory (default: '/assets')
- `options.preferWebGPU` (boolean): Try WebGPU first (default: true)
- `options.onProgress` (function): Progress callback (modelName, current, total)

**Returns**: `Promise<Object>`
```javascript
{
    success: true,
    provider: 'webgpu' | 'wasm',
    sampleRate: 44100
}
```

##### `loadVoiceStyle(stylePath)`

Load a voice style.

**Parameters**:
- `stylePath` (string): Path to voice style JSON file

**Returns**: `Promise<void>`

##### `synthesize(text, options)`

Generate speech from text.

**Parameters**:
- `text` (string): Input text
- `options.totalSteps` (number): Denoising steps (default: 5)
- `options.speed` (number): Speech speed multiplier (default: 1.05)
- `options.silenceDuration` (number): Silence between chunks in seconds (default: 0.3)
- `options.onProgress` (function): Progress callback (step, total)

**Returns**: `Promise<Object>`
```javascript
{
    audioData: Float32Array,  // Raw audio samples
    duration: 3.5,             // Duration in seconds
    sampleRate: 44100          // Sample rate in Hz
}
```

##### `synthesizeToWav(text, options)`

Generate speech and return WAV blob.

**Parameters**: Same as `synthesize()`

**Returns**: `Promise<Blob>` - WAV file blob

##### `synthesizeToURL(text, options)`

Generate speech and return object URL.

**Parameters**: Same as `synthesize()`

**Returns**: `Promise<string>` - Object URL

##### `isReady()`

Check if TTS is ready for synthesis.

**Returns**: `boolean`

##### `getInfo()`

Get TTS state information.

**Returns**: `Object`
```javascript
{
    initialized: true,
    provider: 'webgpu',
    sampleRate: 44100,
    hasStyle: true
}
```

---

## Configuration Options

### Synthesis Parameters

```javascript
const options = {
    // Quality vs Speed tradeoff
    totalSteps: 5,        // 1-50, higher = better quality but slower
                          // Recommended: 2-5 for real-time, 5-10 for quality
    
    // Speech speed
    speed: 1.05,          // 0.5-2.0, higher = faster speech
                          // Recommended: 0.9-1.5
    
    // Pause between text chunks
    silenceDuration: 0.3, // 0.0-2.0 seconds
                          // Recommended: 0.2-0.5
    
    // Progress callback
    onProgress: (step, total) => {
        const percent = Math.round((step / total) * 100);
        console.log(`Progress: ${percent}%`);
    }
};
```

### Voice Styles

Available pre-extracted voice styles:

| Style | Description | Path |
|-------|-------------|------|
| M1 | Male voice 1 (default) | `/assets/voice_styles/M1.json` |
| M2 | Male voice 2 (alternative) | `/assets/voice_styles/M2.json` |
| F1 | Female voice 1 | `/assets/voice_styles/F1.json` |
| F2 | Female voice 2 | `/assets/voice_styles/F2.json` |

### Execution Providers

```javascript
// WebGPU (fastest, requires Chrome/Edge 113+)
await tts.initialize({ preferWebGPU: true });

// WebAssembly (universal fallback)
await tts.initialize({ preferWebGPU: false });
```

---

## Example Implementations

### Example 1: Simple Text-to-Speech Button

```javascript
import { tts } from './tts/tts-integration.js';

// Initialize once on page load
let isInitialized = false;

async function initTTS() {
    if (isInitialized) return;
    
    await tts.initialize({
        assetsPath: '/assets',
        onProgress: (name, curr, total) => {
            console.log(`Loading: ${name} (${curr}/${total})`);
        }
    });
    
    await tts.loadVoiceStyle('/assets/voice_styles/M1.json');
    isInitialized = true;
}

// Button click handler
document.getElementById('speakBtn').addEventListener('click', async () => {
    const text = document.getElementById('textInput').value;
    
    if (!isInitialized) {
        await initTTS();
    }
    
    const audioURL = await tts.synthesizeToURL(text);
    const audio = new Audio(audioURL);
    audio.play();
});
```

### Example 2: React Component

```jsx
import React, { useState, useEffect } from 'react';
import { tts } from './tts/tts-integration';

function TextToSpeech() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [voice, setVoice] = useState('M1');

    useEffect(() => {
        async function init() {
            try {
                await tts.initialize({ assetsPath: '/assets' });
                await tts.loadVoiceStyle(`/assets/voice_styles/${voice}.json`);
                setLoading(false);
            } catch (err) {
                console.error('Init failed:', err);
            }
        }
        init();
    }, []);

    const handleSpeak = async () => {
        if (!text.trim()) return;
        
        setGenerating(true);
        try {
            const audioURL = await tts.synthesizeToURL(text, {
                totalSteps: 5,
                speed: 1.05
            });
            
            const audio = new Audio(audioURL);
            await audio.play();
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleVoiceChange = async (newVoice) => {
        setVoice(newVoice);
        await tts.loadVoiceStyle(`/assets/voice_styles/${newVoice}.json`);
    };

    if (loading) return <div>Loading TTS engine...</div>;

    return (
        <div>
            <select value={voice} onChange={(e) => handleVoiceChange(e.target.value)}>
                <option value="M1">Male 1</option>
                <option value="M2">Male 2</option>
                <option value="F1">Female 1</option>
                <option value="F2">Female 2</option>
            </select>
            
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to speak..."
            />
            
            <button onClick={handleSpeak} disabled={generating}>
                {generating ? 'Generating...' : 'Speak'}
            </button>
        </div>
    );
}

export default TextToSpeech;
```

### Example 3: Vue Component

```vue
<template>
  <div class="tts-component">
    <div v-if="loading">Loading TTS engine...</div>
    
    <div v-else>
      <select v-model="voice" @change="changeVoice">
        <option value="M1">Male 1</option>
        <option value="M2">Male 2</option>
        <option value="F1">Female 1</option>
        <option value="F2">Female 2</option>
      </select>
      
      <textarea v-model="text" placeholder="Enter text to speak..."></textarea>
      
      <button @click="speak" :disabled="generating">
        {{ generating ? 'Generating...' : 'Speak' }}
      </button>
    </div>
  </div>
</template>

<script>
import { tts } from './tts/tts-integration';

export default {
  data() {
    return {
      text: '',
      voice: 'M1',
      loading: true,
      generating: false
    };
  },
  
  async mounted() {
    try {
      await tts.initialize({ assetsPath: '/assets' });
      await tts.loadVoiceStyle(`/assets/voice_styles/${this.voice}.json`);
      this.loading = false;
    } catch (err) {
      console.error('Init failed:', err);
    }
  },
  
  methods: {
    async speak() {
      if (!this.text.trim()) return;
      
      this.generating = true;
      try {
        const audioURL = await tts.synthesizeToURL(this.text);
        const audio = new Audio(audioURL);
        await audio.play();
      } catch (err) {
        console.error('Generation failed:', err);
      } finally {
        this.generating = false;
      }
    },
    
    async changeVoice() {
      await tts.loadVoiceStyle(`/assets/voice_styles/${this.voice}.json`);
    }
  }
};
</script>
```

### Example 4: Progressive Enhancement

```javascript
// Detect TTS support and progressively enhance
class TTSEnhancer {
    constructor() {
        this.supported = this.checkSupport();
    }

    checkSupport() {
        // Check for required APIs
        return (
            typeof WebAssembly !== 'undefined' &&
            typeof fetch !== 'undefined' &&
            typeof Audio !== 'undefined'
        );
    }

    async enhance(element) {
        if (!this.supported) {
            console.log('TTS not supported on this browser');
            return;
        }

        // Add speak button to text elements
        const speakBtn = document.createElement('button');
        speakBtn.textContent = '🔊 Speak';
        speakBtn.classList.add('tts-speak-btn');
        
        speakBtn.addEventListener('click', async () => {
            const text = element.textContent;
            await this.speak(text);
        });
        
        element.appendChild(speakBtn);
    }

    async speak(text) {
        if (!this.tts) {
            this.tts = await import('./tts/tts-integration.js').then(m => m.tts);
            await this.tts.initialize({ assetsPath: '/assets' });
            await this.tts.loadVoiceStyle('/assets/voice_styles/M1.json');
        }

        const audioURL = await this.tts.synthesizeToURL(text);
        const audio = new Audio(audioURL);
        audio.play();
    }
}

// Usage: Enhance all articles on page
const enhancer = new TTSEnhancer();
document.querySelectorAll('article').forEach(article => {
    enhancer.enhance(article);
});
```

---

## Troubleshooting

### Issue: Models fail to load

**Symptoms**:
```
Error: Failed to fetch model
```

**Solutions**:
1. Verify assets directory structure:
   ```bash
   ls public/assets/onnx/
   # Should list 4 .onnx files + 2 .json files
   ```

2. Check browser console for 404 errors
3. Verify CORS headers if using CDN
4. Ensure Git LFS was initialized before cloning

### Issue: WebGPU not available

**Symptoms**:
```
WebGPU not available, falling back to WebAssembly
```

**Solutions**:
1. Update to Chrome/Edge 113+
2. Enable WebGPU in browser flags: `chrome://flags/#enable-unsafe-webgpu`
3. This is expected on Firefox/Safari - fallback to WASM is automatic

### Issue: Out of memory

**Symptoms**:
```
RangeError: Array buffer allocation failed
```

**Solutions**:
1. Reduce text length
2. Decrease `totalSteps` parameter
3. Close other browser tabs
4. Use 64-bit browser build

### Issue: Slow generation

**Symptoms**:
- Takes >30 seconds to generate short text

**Solutions**:
1. Ensure WebGPU is enabled and working
2. Check CPU/GPU usage - ensure no background processes
3. Reduce `totalSteps` to 2-3 for faster (lower quality) results
4. Use shorter text inputs

### Issue: Audio quality poor

**Symptoms**:
- Robotic or distorted speech

**Solutions**:
1. Increase `totalSteps` to 7-10
2. Try different voice styles
3. Adjust `speed` parameter (1.0-1.1 recommended)
4. Ensure input text is properly formatted

### Issue: Silent audio generation

**Symptoms**:
- Audio file generated but contains silence

**Solutions**:
1. Check voice style loaded correctly
2. Verify text is not empty
3. Check browser console for errors
4. Try different voice style

---

## Performance Optimization

### 1. Model Loading Optimization

```javascript
// Preload models on first user interaction
document.addEventListener('click', preloadModels, { once: true });

async function preloadModels() {
    // Non-blocking initialization
    setTimeout(async () => {
        await tts.initialize({ assetsPath: '/assets' });
        await tts.loadVoiceStyle('/assets/voice_styles/M1.json');
    }, 100);
}
```

### 2. Caching Strategies

```javascript
// Cache audio generation results
class CachedTTS {
    constructor() {
        this.cache = new Map();
    }

    async synthesize(text, options) {
        const cacheKey = `${text}-${JSON.stringify(options)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = await tts.synthesize(text, options);
        this.cache.set(cacheKey, result);
        
        // Limit cache size
        if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return result;
    }
}
```

### 3. Batch Processing

```javascript
// Process multiple texts efficiently
async function batchGenerate(texts, voiceStyle = 'M1') {
    await tts.initialize({ assetsPath: '/assets' });
    await tts.loadVoiceStyle(`/assets/voice_styles/${voiceStyle}.json`);
    
    const results = [];
    for (const text of texts) {
        const result = await tts.synthesize(text, { totalSteps: 3 });
        results.push(result);
    }
    
    return results;
}
```

### 4. Web Worker Integration

```javascript
// In worker.js
import { tts } from './tts/tts-integration.js';

self.addEventListener('message', async (e) => {
    const { type, data } = e.data;
    
    if (type === 'init') {
        await tts.initialize(data);
        self.postMessage({ type: 'initialized' });
    }
    
    if (type === 'synthesize') {
        const result = await tts.synthesize(data.text, data.options);
        self.postMessage({ type: 'audio', data: result });
    }
});

// In main thread
const worker = new Worker('worker.js', { type: 'module' });
worker.postMessage({ type: 'init', data: { assetsPath: '/assets' } });
```

---

## Advanced Topics

### 1. Text Preprocessing

The system includes comprehensive text preprocessing in `UnicodeProcessor`:

```javascript
// Automatic text normalization
const text = "Hello—world! 😊 @john";
// Becomes: "Hello-world! john."
```

**Features**:
- Emoji removal
- Unicode normalization (NFKD)
- Symbol replacement (dashes, quotes, brackets)
- Punctuation cleanup
- Automatic period addition

### 2. Long Text Handling

The `chunkText` function automatically splits long texts:

```javascript
// Texts are automatically chunked at 300 characters
// Chunks respect sentence boundaries
// Avoids breaking on abbreviations (Mr., Dr., etc.)
```

**Customizing chunking**:
```javascript
// Edit helper.js chunkText function
function chunkText(text, maxLen = 300) {
    // Modify maxLen or chunking logic
}
```

### 3. Custom Voice Styles

To use custom voice styles:

1. Extract style from reference audio (requires Python implementation)
2. Save as JSON with format:
```json
{
    "style_ttl": {
        "dims": [1, 50, 256],
        "data": [[...]]
    },
    "style_dp": {
        "dims": [1, 8, 16],
        "data": [[...]]
    }
}
```

3. Load in application:
```javascript
await tts.loadVoiceStyle('/path/to/custom-style.json');
```

### 4. Memory Management

```javascript
// Clean up audio URLs to prevent memory leaks
const audioURL = await tts.synthesizeToURL(text);
const audio = new Audio(audioURL);

audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioURL);
});
```

### 5. Error Recovery

```javascript
class RobustTTS {
    constructor() {
        this.maxRetries = 3;
    }

    async synthesizeWithRetry(text, options = {}, retries = 0) {
        try {
            return await tts.synthesize(text, options);
        } catch (error) {
            if (retries < this.maxRetries) {
                console.log(`Retry ${retries + 1}/${this.maxRetries}`);
                await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
                return this.synthesizeWithRetry(text, options, retries + 1);
            }
            throw error;
        }
    }
}
```

### 6. Quality vs Performance Tradeoffs

| Setting | Quality | Speed | Use Case |
|---------|---------|-------|----------|
| `totalSteps: 2` | ⭐⭐ | ⚡⚡⚡ | Real-time preview |
| `totalSteps: 5` | ⭐⭐⭐⭐ | ⚡⚡ | Production default |
| `totalSteps: 10` | ⭐⭐⭐⭐⭐ | ⚡ | High-quality output |

### 7. Browser Compatibility Testing

```javascript
async function detectCapabilities() {
    const capabilities = {
        webAssembly: typeof WebAssembly !== 'undefined',
        webGPU: 'gpu' in navigator,
        audio: typeof Audio !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        modules: 'noModule' in HTMLScriptElement.prototype
    };
    
    const isSupported = Object.values(capabilities).every(v => v);
    
    return { capabilities, isSupported };
}
```

### 8. Monitoring and Analytics

```javascript
class MonitoredTTS extends SupertonicTTS {
    async synthesize(text, options) {
        const startTime = performance.now();
        
        try {
            const result = await super.synthesize(text, options);
            const duration = performance.now() - startTime;
            
            // Log metrics
            console.log('TTS Metrics:', {
                textLength: text.length,
                audioLength: result.duration,
                generationTime: duration / 1000,
                rtf: duration / 1000 / result.duration
            });
            
            return result;
        } catch (error) {
            // Log errors
            console.error('TTS Error:', {
                textLength: text.length,
                error: error.message
            });
            throw error;
        }
    }
}
```

### 9. Streaming Audio (Future Enhancement)

```javascript
// Conceptual implementation for streaming
// Note: Current implementation does not support streaming
// This would require model architecture changes

class StreamingTTS {
    async *synthesizeStream(text, options) {
        const chunks = chunkText(text, 100);
        
        for (const chunk of chunks) {
            const result = await tts.synthesize(chunk, options);
            yield result;
        }
    }
}

// Usage
for await (const audioChunk of streamingTTS.synthesizeStream(longText)) {
    playAudio(audioChunk);
}
```

### 10. Security Considerations

**Input Validation**:
```javascript
function sanitizeInput(text) {
    // Limit text length to prevent DoS
    const MAX_LENGTH = 10000;
    if (text.length > MAX_LENGTH) {
        throw new Error(`Text too long (max ${MAX_LENGTH} characters)`);
    }
    
    // Remove or escape potentially dangerous content
    return text.trim();
}
```

**Content Security Policy**:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'wasm-unsafe-eval'; 
               worker-src 'self' blob:;">
```

---

## Bundler-Specific Configuration

### Vite

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  build: {
    target: 'esnext'
  }
}
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.wasm']
  }
}
```

### Next.js

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false
    };
    return config;
  }
}
```

---

## Production Checklist

Before deploying to production:

- [ ] Models downloaded and accessible
- [ ] Git LFS files properly pulled
- [ ] Assets served with correct MIME types
- [ ] CORS configured if using CDN
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Memory cleanup (URL.revokeObjectURL)
- [ ] Browser compatibility tested
- [ ] Performance profiled
- [ ] CSP headers configured
- [ ] Analytics/monitoring in place
- [ ] Fallback for unsupported browsers

---

## Support and Resources

### Official Resources
- **Repository**: https://github.com/supertone-inc/supertonic
- **Models**: https://huggingface.co/Supertone/supertonic
- **Papers**: See main README.md for citations

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions

### License
- Code: MIT License
- Models: OpenRAIL-M License

---

## Appendix: Complete Helper.js API

### Classes

**UnicodeProcessor**
- `constructor(indexer)`: Initialize with unicode indexer
- `call(textList)`: Process text and return tokenized IDs
- `preprocessText(text)`: Normalize and clean text

**Style**
- `constructor(ttlTensor, dpTensor)`: Voice style container
- `ttl`: Text-to-latent style tensor
- `dp`: Duration prediction style tensor

**TextToSpeech**
- `constructor(cfgs, textProcessor, dpOrt, textEncOrt, vectorEstOrt, vocoderOrt)`
- `call(text, style, totalStep, speed, silenceDuration, progressCallback)`: Single text synthesis
- `batch(textList, style, totalStep, speed, progressCallback)`: Batch synthesis
- `sampleRate`: Audio sample rate (44100 Hz)

### Functions

**loadVoiceStyle(voiceStylePaths, verbose)**
- Load voice style from JSON files
- Returns: `Promise<Style>`

**loadCfgs(onnxDir)**
- Load model configuration
- Returns: `Promise<Object>`

**loadTextProcessor(onnxDir)**
- Load unicode processor
- Returns: `Promise<UnicodeProcessor>`

**loadTextToSpeech(onnxDir, sessionOptions, progressCallback)**
- Load complete TTS system
- Returns: `Promise<{textToSpeech, cfgs}>`

**writeWavFile(audioData, sampleRate)**
- Convert audio to WAV format
- Returns: `ArrayBuffer`

---

## Version History

**v1.0.0** (2025-11-28)
- Initial integration guide
- Complete API documentation
- Framework examples (React, Vue)
- Performance optimization guide
- Advanced topics coverage

---

**End of Integration Guide**

For questions or contributions, please visit the [official repository](https://github.com/supertone-inc/supertonic).
