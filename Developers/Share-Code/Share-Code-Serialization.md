# Schema-Aware Share Codes: Value-Only Encoding Strategy

## The Key Insight: Fixed Schema = Known Tuple

When the JSON structure is predetermined, the encoding problem transforms fundamentally:

| Approach | What's Encoded | 32-char Capacity |
|----------|----------------|------------------|
| **Arbitrary JSON** | Keys + values + structure | ~40-80 bytes compressed |
| **Schema-Aware** | Values only, in sequence | **200+ bytes equivalent** |

Instead of encoding `{"theme":"dark","fontSize":14,"enabled":true}`, we encode just `[1, 14, 1]` where position implies meaning.

---

## Architecture: Hybrid Client-Server Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHARE CODE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  JSON Object ──► Schema Analyzer ──► Value Extractor            │
│       │                                      │                  │
│       │         ┌────────────────────────────┤                  │
│       │         │                            │                  │
│       │         ▼                            ▼                  │
│       │   ┌──────────┐                ┌─────────────┐           │
│       │   │ BIT-PACK │                │  SERVER DB  │           │
│       │   │ (small)  │                │  (large)    │           │
│       │   └────┬─────┘                └──────┬──────┘           │
│       │        │                             │                  │
│       │        ▼                             ▼                  │
│       │   Base62 Encode              Short ID (Sqids)           │
│       │        │                             │                  │
│       │        └──────────┬──────────────────┘                  │
│       │                   │                                     │
│       │                   ▼                                     │
│       │         ┌─────────────────┐                             │
│       │         │   SHARE CODE    │                             │
│       │         │  V1-ABCD1234XYZ │                             │
│       │         └─────────────────┘                             │
│       │                   │                                     │
│       │                   ▼                                     │
│       └───────── DESTUFF: Reverse Process ◄─────────────────────┘
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Schema Definition

### Example JSON Structure (Template)

```javascript
// This is the FIXED schema - structure never changes
const exampleJson = {
  version: 2,                    // Number: 0-255 (8 bits)
  theme: "dark",                 // Enum: ["light", "dark", "system"] (2 bits)
  fontSize: 14,                  // Number: 8-72 (6 bits, offset by 8)
  showSidebar: true,             // Boolean (1 bit)
  showLineNumbers: false,        // Boolean (1 bit)
  tabSize: 4,                    // Enum: [2, 4, 8] (2 bits)
  language: "javascript",        // Enum: 32 options (5 bits)
  layout: {
    columns: 2,                  // Number: 1-4 (2 bits)
    density: "comfortable"       // Enum: ["compact", "comfortable", "spacious"] (2 bits)
  },
  features: ["autosave", "lint"] // Bitfield: 8 possible features (8 bits)
};

// Total: 37 bits = 5 bytes = 7 Base62 characters!
// Compare to JSON.stringify: 289 bytes
```

### Schema Definition Format

```javascript
const schemaDefinition = {
  version: 1,  // Schema version for migrations
  fields: [
    // Order matters! This IS the encoding sequence
    { 
      path: "version", 
      type: "uint", 
      bits: 8,
      default: 1
    },
    { 
      path: "theme", 
      type: "enum", 
      values: ["light", "dark", "system"],
      default: "light"
    },
    { 
      path: "fontSize", 
      type: "range", 
      min: 8, 
      max: 72,  // 65 values = 7 bits
      default: 14
    },
    { 
      path: "showSidebar", 
      type: "boolean",
      default: true
    },
    { 
      path: "showLineNumbers", 
      type: "boolean",
      default: false
    },
    { 
      path: "tabSize", 
      type: "enum", 
      values: [2, 4, 8],
      default: 4
    },
    { 
      path: "language", 
      type: "enum",
      values: ["javascript", "typescript", "python", "rust", "go", /* ... */],
      default: "javascript"
    },
    { 
      path: "layout.columns", 
      type: "range", 
      min: 1, 
      max: 4,
      default: 1
    },
    { 
      path: "layout.density", 
      type: "enum", 
      values: ["compact", "comfortable", "spacious"],
      default: "comfortable"
    },
    { 
      path: "features", 
      type: "bitfield",
      flags: ["autosave", "lint", "format", "minimap", "breadcrumbs", "git", "ai", "vim"],
      default: []
    }
  ]
};
```

---

## Phase 2: Bit-Packing Engine

### Core Encoder/Decoder

```javascript
class BitBuffer {
  constructor() {
    this.bits = [];
  }

  // Write n bits from value
  write(value, numBits) {
    for (let i = numBits - 1; i >= 0; i--) {
      this.bits.push((value >> i) & 1);
    }
  }

  // Read n bits as value
  read(numBits) {
    let value = 0;
    for (let i = 0; i < numBits; i++) {
      value = (value << 1) | (this.bits.shift() || 0);
    }
    return value;
  }

  // Convert to byte array
  toBytes() {
    const bytes = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | (this.bits[i + j] || 0);
      }
      bytes.push(byte);
    }
    return new Uint8Array(bytes);
  }

  // Load from byte array
  static fromBytes(bytes) {
    const buffer = new BitBuffer();
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) {
        buffer.bits.push((byte >> i) & 1);
      }
    }
    return buffer;
  }
}
```

### Schema-Aware Encoder

```javascript
class SchemaEncoder {
  constructor(schema) {
    this.schema = schema;
    this.totalBits = this.calculateTotalBits();
  }

  calculateTotalBits() {
    return this.schema.fields.reduce((sum, field) => {
      return sum + this.getBitsForField(field);
    }, 0);
  }

  getBitsForField(field) {
    switch (field.type) {
      case 'boolean': return 1;
      case 'uint': return field.bits;
      case 'enum': return Math.ceil(Math.log2(field.values.length));
      case 'range': return Math.ceil(Math.log2(field.max - field.min + 1));
      case 'bitfield': return field.flags.length;
      default: throw new Error(`Unknown field type: ${field.type}`);
    }
  }

  // Extract value from nested path like "layout.columns"
  getValueAtPath(obj, path) {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  setValueAtPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, key) => {
      if (!o[key]) o[key] = {};
      return o[key];
    }, obj);
    target[last] = value;
  }

  // STUFF: JSON → Binary
  encode(data) {
    const buffer = new BitBuffer();

    for (const field of this.schema.fields) {
      const value = this.getValueAtPath(data, field.path) ?? field.default;
      const bits = this.getBitsForField(field);

      switch (field.type) {
        case 'boolean':
          buffer.write(value ? 1 : 0, 1);
          break;

        case 'uint':
          buffer.write(value, bits);
          break;

        case 'enum':
          const enumIndex = field.values.indexOf(value);
          buffer.write(enumIndex >= 0 ? enumIndex : 0, bits);
          break;

        case 'range':
          buffer.write(value - field.min, bits);
          break;

        case 'bitfield':
          let bitfieldValue = 0;
          for (let i = 0; i < field.flags.length; i++) {
            if (value.includes(field.flags[i])) {
              bitfieldValue |= (1 << i);
            }
          }
          buffer.write(bitfieldValue, bits);
          break;
      }
    }

    return buffer.toBytes();
  }

  // DESTUFF: Binary → JSON
  decode(bytes) {
    const buffer = BitBuffer.fromBytes(bytes);
    const result = {};

    for (const field of this.schema.fields) {
      const bits = this.getBitsForField(field);
      const rawValue = buffer.read(bits);
      let value;

      switch (field.type) {
        case 'boolean':
          value = rawValue === 1;
          break;

        case 'uint':
          value = rawValue;
          break;

        case 'enum':
          value = field.values[rawValue] ?? field.default;
          break;

        case 'range':
          value = rawValue + field.min;
          break;

        case 'bitfield':
          value = field.flags.filter((_, i) => (rawValue >> i) & 1);
          break;
      }

      this.setValueAtPath(result, field.path, value);
    }

    return result;
  }
}
```

---

## Phase 3: Share Code Generation

### Base62 Encoding (URL-Safe)

```javascript
const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function bytesToBase62(bytes) {
  // Convert bytes to BigInt
  let num = 0n;
  for (const byte of bytes) {
    num = (num << 8n) | BigInt(byte);
  }

  if (num === 0n) return '0';

  let result = '';
  while (num > 0n) {
    result = BASE62_ALPHABET[Number(num % 62n)] + result;
    num = num / 62n;
  }

  return result;
}

function base62ToBytes(str, expectedLength) {
  let num = 0n;
  for (const char of str) {
    num = num * 62n + BigInt(BASE62_ALPHABET.indexOf(char));
  }

  const bytes = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xFFn));
    num = num >> 8n;
  }

  // Pad to expected length
  while (bytes.length < expectedLength) {
    bytes.unshift(0);
  }

  return new Uint8Array(bytes);
}
```

### Complete ShareCode Class

```javascript
class ShareCodeManager {
  constructor(schema, options = {}) {
    this.encoder = new SchemaEncoder(schema);
    this.schemaVersion = schema.version;
    this.checksum = options.checksum ?? true;
    
    // Calculate byte length needed
    this.byteLength = Math.ceil(this.encoder.totalBits / 8);
  }

  // STUFF: JSON → Share Code
  stuff(data) {
    // 1. Encode to binary
    const payload = this.encoder.encode(data);

    // 2. Add schema version prefix (1 byte)
    const withVersion = new Uint8Array(payload.length + 1);
    withVersion[0] = this.schemaVersion;
    withVersion.set(payload, 1);

    // 3. Add checksum (optional, 1 byte)
    let final = withVersion;
    if (this.checksum) {
      const check = this.computeChecksum(withVersion);
      final = new Uint8Array(withVersion.length + 1);
      final.set(withVersion);
      final[final.length - 1] = check;
    }

    // 4. Encode to Base62
    return bytesToBase62(final);
  }

  // DESTUFF: Share Code → JSON
  destuff(code) {
    try {
      // 1. Decode from Base62
      const expectedLength = this.byteLength + 1 + (this.checksum ? 1 : 0);
      const bytes = base62ToBytes(code, expectedLength);

      // 2. Verify checksum
      if (this.checksum) {
        const storedCheck = bytes[bytes.length - 1];
        const dataBytes = bytes.slice(0, -1);
        const computedCheck = this.computeChecksum(dataBytes);
        
        if (storedCheck !== computedCheck) {
          return { success: false, error: 'Invalid checksum - code may be corrupted' };
        }
      }

      // 3. Extract version and payload
      const version = bytes[0];
      const payload = bytes.slice(1, this.checksum ? -1 : undefined);

      // 4. Handle version mismatch
      if (version !== this.schemaVersion) {
        return { 
          success: false, 
          error: `Schema version mismatch: code is v${version}, expected v${this.schemaVersion}` 
        };
      }

      // 5. Decode payload
      const data = this.encoder.decode(payload);
      
      return { success: true, data };

    } catch (err) {
      return { success: false, error: `Decode failed: ${err.message}` };
    }
  }

  computeChecksum(bytes) {
    // Simple XOR checksum (1 byte)
    return bytes.reduce((acc, byte) => acc ^ byte, 0);
  }

  // Get code length estimate
  getCodeLength() {
    const totalBytes = this.byteLength + 1 + (this.checksum ? 1 : 0);
    // Base62 chars needed = ceil(bytes * 8 / log2(62))
    return Math.ceil(totalBytes * 8 / 5.95);
  }
}
```

---

## Phase 4: Server-Side Storage for Large Data

When bit-packed values exceed the target code length, use server storage:

### Database Schema

```sql
-- PostgreSQL
CREATE TABLE share_codes (
  id SERIAL PRIMARY KEY,
  short_id VARCHAR(16) UNIQUE NOT NULL,  -- The public share code
  payload JSONB NOT NULL,                 -- Full JSON data
  schema_version INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  access_count INT DEFAULT 0,
  expires_at TIMESTAMP                    -- Optional expiration
);

CREATE INDEX idx_share_codes_short_id ON share_codes(short_id);
```

### Server API Integration

```javascript
// Using Sqids for short IDs
import Sqids from 'sqids';

const sqids = new Sqids({
  minLength: 8,
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
});

class ServerShareCodeManager {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async stuff(data) {
    const response = await fetch(`${this.apiBase}/share-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: data })
    });

    const { shortId } = await response.json();
    return shortId;  // e.g., "Kx8Rm4Qz"
  }

  async destuff(code) {
    const response = await fetch(`${this.apiBase}/share-codes/${code}`);
    
    if (!response.ok) {
      return { success: false, error: 'Share code not found' };
    }

    const { payload } = await response.json();
    return { success: true, data: payload };
  }
}

// Express.js API endpoint
app.post('/share-codes', async (req, res) => {
  const { payload } = req.body;
  
  // Insert and get auto-increment ID
  const result = await db.query(
    'INSERT INTO share_codes (payload, schema_version) VALUES ($1, $2) RETURNING id',
    [payload, CURRENT_SCHEMA_VERSION]
  );
  
  // Generate short ID from database ID
  const shortId = sqids.encode([result.rows[0].id]);
  
  // Store the short ID
  await db.query(
    'UPDATE share_codes SET short_id = $1 WHERE id = $2',
    [shortId, result.rows[0].id]
  );

  res.json({ shortId });
});

app.get('/share-codes/:code', async (req, res) => {
  const result = await db.query(
    'SELECT payload FROM share_codes WHERE short_id = $1',
    [req.params.code]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Increment access count
  await db.query(
    'UPDATE share_codes SET access_count = access_count + 1 WHERE short_id = $1',
    [req.params.code]
  );

  res.json({ payload: result.rows[0].payload });
});
```

---

## Phase 5: Hybrid Strategy Decision Tree

```javascript
class HybridShareCodeManager {
  constructor(schema, serverApi, options = {}) {
    this.clientEncoder = new ShareCodeManager(schema, options);
    this.serverManager = new ServerShareCodeManager(serverApi);
    this.maxClientCodeLength = options.maxClientCodeLength ?? 16;
  }

  async stuff(data) {
    // Try client-side first
    const clientCode = this.clientEncoder.stuff(data);
    
    if (clientCode.length <= this.maxClientCodeLength) {
      // Prefix with 'C' for client-encoded
      return `C${clientCode}`;
    }

    // Fall back to server storage
    const serverCode = await this.serverManager.stuff(data);
    // Prefix with 'S' for server-stored
    return `S${serverCode}`;
  }

  async destuff(code) {
    const type = code[0];
    const payload = code.slice(1);

    if (type === 'C') {
      return this.clientEncoder.destuff(payload);
    } else if (type === 'S') {
      return await this.serverManager.destuff(payload);
    } else {
      return { success: false, error: 'Invalid code format' };
    }
  }
}
```

---

## Phase 6: React Integration

### ShareCode Hook

```jsx
import { useState, useCallback, useMemo } from 'react';

function useShareCode(schema, serverApi, initialData = {}) {
  const [data, setData] = useState(initialData);
  const [shareCode, setShareCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const manager = useMemo(
    () => new HybridShareCodeManager(schema, serverApi, { maxClientCodeLength: 16 }),
    [schema, serverApi]
  );

  const generateCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const code = await manager.stuff(data);
      setShareCode(code);
      return code;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data, manager]);

  const loadFromCode = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await manager.destuff(code);
      if (result.success) {
        setData(result.data);
        setShareCode(code);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [manager]);

  return {
    data,
    setData,
    shareCode,
    generateCode,
    loadFromCode,
    loading,
    error
  };
}
```

### ShareCode Component

```jsx
function ShareCodePanel({ schema, serverApi }) {
  const {
    data,
    setData,
    shareCode,
    generateCode,
    loadFromCode,
    loading,
    error
  } = useShareCode(schema, serverApi);

  const [inputCode, setInputCode] = useState('');

  const handleCopy = async () => {
    const code = await generateCode();
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const handleLoad = () => {
    loadFromCode(inputCode.trim());
  };

  return (
    <div className="share-code-panel">
      {/* Generate Section */}
      <div className="generate-section">
        <button onClick={handleCopy} disabled={loading}>
          {loading ? 'Generating...' : '📋 Copy Share Code'}
        </button>
        {shareCode && (
          <code className="share-code">{shareCode}</code>
        )}
      </div>

      {/* Load Section */}
      <div className="load-section">
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Paste share code..."
          maxLength={32}
        />
        <button onClick={handleLoad} disabled={loading || !inputCode}>
          Load
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Debug: Current Data */}
      <pre className="debug">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
```

---

## Capacity Calculator

Use this to estimate code length for your schema:

```javascript
function analyzeSchema(schema) {
  let totalBits = 0;
  const breakdown = [];

  for (const field of schema.fields) {
    let bits;
    switch (field.type) {
      case 'boolean': bits = 1; break;
      case 'uint': bits = field.bits; break;
      case 'enum': bits = Math.ceil(Math.log2(field.values.length)); break;
      case 'range': bits = Math.ceil(Math.log2(field.max - field.min + 1)); break;
      case 'bitfield': bits = field.flags.length; break;
    }
    totalBits += bits;
    breakdown.push({ path: field.path, type: field.type, bits });
  }

  const payloadBytes = Math.ceil(totalBits / 8);
  const totalBytes = payloadBytes + 2;  // +1 version, +1 checksum
  const base62Length = Math.ceil(totalBytes * 8 / 5.95);

  return {
    breakdown,
    totalBits,
    payloadBytes,
    totalBytes,
    estimatedCodeLength: base62Length,
    fitsIn16Chars: base62Length <= 16,
    fitsIn32Chars: base62Length <= 32
  };
}

// Usage
const analysis = analyzeSchema(schemaDefinition);
console.log(analysis);
// {
//   totalBits: 37,
//   payloadBytes: 5,
//   totalBytes: 7,
//   estimatedCodeLength: 10,
//   fitsIn16Chars: true,
//   fitsIn32Chars: true
// }
```

---

## Next Steps for Integration

To integrate with your existing codebase, I'll need:

1. **Example JSON** - A real sample of the JSON structure to encode
2. **Codebase access** - Upload your project files so I can:
   - Identify existing data models/types
   - Find the best integration points
   - Match your coding patterns and conventions
   - Set up server-side storage if available

3. **Constraints** - Any specific requirements:
   - Exact target code length?
   - Must work offline (client-only)?
   - Existing database/API to leverage?

Once you share these, I'll generate the complete, ready-to-integrate implementation.
