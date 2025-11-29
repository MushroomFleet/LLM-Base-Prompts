# Supertonic TTS .NET Implementation - Lessons Learned

**Document Version**: 1.0
**Date**: 2025-11-29
**Status**: Critical corrections to integration guide

---

## Overview

This document contains critical corrections and lessons learned during the actual implementation of the Supertonic TTS .NET integration. The original integration guide (`DotNet-SuperTonic-TTS-Integration.md`) had several inaccuracies that caused implementation failures. This document provides the **correct** implementations that actually work.

---

## Critical Issue #1: Configuration Loading

### ❌ INCORRECT (from original guide)

The original guide suggested direct JSON deserialization:

```csharp
public static TTSConfig LoadConfig(string configPath)
{
    var json = File.ReadAllText(configPath);
    return JsonSerializer.Deserialize<TTSConfig>(json)
        ?? throw new Exception("Failed to load config");
}
```

###  WHY IT FAILS

The `tts.json` file structure does NOT match the C# class property names. The JSON uses lowercase names like `"ae"`, `"sample_rate"`, etc., but direct deserialization expects exact property name matches.

**Result**: All configuration values are `0`, causing `DivideByZeroException` in the TTS pipeline.

### ✅ CORRECT Implementation

```csharp
public static TTSConfig LoadConfig(string configPath)
{
    var json = File.ReadAllText(configPath);
    using var doc = JsonDocument.Parse(json);
    var root = doc.RootElement;

    return new TTSConfig
    {
        AE = new TTSConfig.AEConfig
        {
            SampleRate = root.GetProperty("ae").GetProperty("sample_rate").GetInt32(),
            BaseChunkSize = root.GetProperty("ae").GetProperty("base_chunk_size").GetInt32()
        },
        TTL = new TTSConfig.TTLConfig
        {
            ChunkCompressFactor = root.GetProperty("ttl").GetProperty("chunk_compress_factor").GetInt32(),
            LatentDim = root.GetProperty("ttl").GetProperty("latent_dim").GetInt32()
        }
    };
}
```

**File**: `Core/TTSHelper.cs`
**Lines**: 40-59

---

## Critical Issue #2: Voice Style JSON Parsing

### ❌ INCORRECT (from original guide)

The guide didn't specify the correct JSON structure for voice styles.

### WHY IT FAILS

Voice style JSON files use:
- `"style_ttl"` NOT `"ttl"`
- `"style_dp"` NOT `"dp"`
- `"dims"` NOT `"shape"`
- **Nested multi-dimensional arrays** that need flattening

**Example of actual file structure**:
```json
{
  "style_ttl": {
    "data": [[[nested arrays]]],
    "dims": [1, 50, 256],
    "type": "float32"
  },
  "style_dp": {
    "data": [[[nested arrays]]],
    "dims": [1, 8, 16],
    "type": "float32"
  }
}
```

### ✅ CORRECT Implementation

```csharp
public static Style LoadVoiceStyle(List<string> stylePaths)
{
    if (stylePaths.Count == 0)
        throw new ArgumentException("At least one style path is required");

    var styleJson = File.ReadAllText(stylePaths[0]);
    var styleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(styleJson)
        ?? throw new Exception("Failed to load style");

    // Parse TTL (style_ttl, not ttl!)
    var ttlElement = styleDict["style_ttl"];
    var ttlData = FlattenJsonArray(ttlElement.GetProperty("data"));
    var ttlDims = ttlElement.GetProperty("dims").EnumerateArray()  // dims, not shape!
        .Select(e => e.GetInt64()).ToArray();

    // Parse DP (style_dp, not dp!)
    var dpElement = styleDict["style_dp"];
    var dpData = FlattenJsonArray(dpElement.GetProperty("data"));
    var dpDims = dpElement.GetProperty("dims").EnumerateArray()  // dims, not shape!
        .Select(e => e.GetInt64()).ToArray();

    return new Style(ttlData, ttlDims, dpData, dpDims);
}

private static float[] FlattenJsonArray(JsonElement element)
{
    var result = new List<float>();
    FlattenRecursive(element, result);
    return result.ToArray();
}

private static void FlattenRecursive(JsonElement element, List<float> result)
{
    if (element.ValueKind == JsonValueKind.Array)
    {
        foreach (var item in element.EnumerateArray())
        {
            FlattenRecursive(item, result);
        }
    }
    else if (element.ValueKind == JsonValueKind.Number)
    {
        result.Add(element.GetSingle());
    }
}
```

**File**: `Core/TTSHelper.cs`
**Lines**: 61-96

---

## Critical Issue #3: TTS Pipeline Architecture

### ❌ INCORRECT (assumed from simple docs)

Simple sequential pipeline: Text Encoder → Duration Predictor → Vector Estimator → Vocoder

### WHY IT FAILS

1. **Wrong execution order**
2. **Wrong input/output tensor names**
3. **Missing iterative denoising loop**
4. **Missing latent noise generation**

### ✅ CORRECT Pipeline Architecture

The **official reference implementation** (from `example_repo/csharp/Helper.cs`) shows the correct flow:

```
1. Duration Predictor  (inputs: text_ids, style_dp, text_mask)
                      ↓ outputs: duration

2. Text Encoder       (inputs: text_ids, style_ttl, text_mask)
                      ↓ outputs: text_emb (NOT text_embedding!)

3. Sample Noisy Latent (generate Gaussian noise with Box-Muller)
                      ↓

4. Vector Estimator   (ITERATIVE LOOP for totalSteps)
   ├─ inputs: noisy_latent, text_emb, style_ttl, text_mask,
   │          latent_mask, total_step, current_step
   └─ outputs: denoised_latent (NOT style_vector!)

5. Vocoder           (inputs: latent)
                     ↓ outputs: wav_tts (NOT wav!)
```

###  Key Differences

| Component | Original Guide | **Correct Implementation** |
|-----------|---------------|---------------------------|
| Execution Order | Text Encoder first | **Duration Predictor first** |
| Text Encoder Output | `text_embedding` | **`text_emb`** |
| Duration Predictor Input | `text_embedding`, `style` | **`text_ids`, `style_dp`** |
| Vector Estimator Execution | Once | **Iterative loop (5 steps)** |
| Vector Estimator Output | `style_vector` | **`denoised_latent`** |
| Vocoder Input | `style_vector`, `phoneme_mask` | **`latent` only** |
| Vocoder Output | `wav` | **`wav_tts`** |

---

## Critical Issue #4: ONNX Model Input/Output Names

### ❌ INCORRECT Tensor Names

The integration guide didn't document the actual tensor names used by the models.

### ✅ CORRECT Tensor Names

**Duration Predictor**:
```csharp
// INPUTS
NamedOnnxValue.CreateFromTensor("text_ids", textIdsTensor),
NamedOnnxValue.CreateFromTensor("style_dp", styleDpTensor),  // NOT "style"!
NamedOnnxValue.CreateFromTensor("text_mask", textMaskTensor)

// OUTPUTS
var duration = dpResults.First(o => o.Name == "duration").AsTensor<float>();
```

**Text Encoder**:
```csharp
// INPUTS
NamedOnnxValue.CreateFromTensor("text_ids", textIdsTensor),
NamedOnnxValue.CreateFromTensor("style_ttl", styleTtlTensor),  // NOT "style"!
NamedOnnxValue.CreateFromTensor("text_mask", textMaskTensor)

// OUTPUTS
var textEmb = textEncOutputs.First(o => o.Name == "text_emb").AsTensor<float>();
// NOT "text_embedding"!
```

**Vector Estimator**:
```csharp
// INPUTS
NamedOnnxValue.CreateFromTensor("noisy_latent", ArrayToTensor(xt, latentShape)),
NamedOnnxValue.CreateFromTensor("text_emb", textEmbTensor),
NamedOnnxValue.CreateFromTensor("style_ttl", styleTtlTensor),  // NOT "style"!
NamedOnnxValue.CreateFromTensor("text_mask", textMaskTensor),
NamedOnnxValue.CreateFromTensor("latent_mask", ArrayToTensor(latentMask, latentMaskShape)),
NamedOnnxValue.CreateFromTensor("total_step", new DenseTensor<float>(totalStepArray, new int[] { bsz })),
NamedOnnxValue.CreateFromTensor("current_step", new DenseTensor<float>(currentStepArray, new int[] { bsz }))

// OUTPUTS
var denoisedLatent = vectorEstOutputs.First(o => o.Name == "denoised_latent").AsTensor<float>();
// NOT "style_vector"!
```

**Vocoder**:
```csharp
// INPUTS
NamedOnnxValue.CreateFromTensor("latent", ArrayToTensor(xt, latentShape))
// NOT "style_vector" and "phoneme_mask"!

// OUTPUTS
var wav = vocoderOutputs.First(o => o.Name == "wav_tts").AsTensor<float>();
// NOT "wav"!
```

---

## Critical Issue #5: Latent Noise Generation

### ❌ MISSING from original guide

The guide didn't include the latent noise sampling implementation.

### ✅ REQUIRED Implementation

```csharp
private (float[][][] noisyLatent, float[][][] latentMask) SampleNoisyLatent(float[] duration)
{
    int bsz = duration.Length;
    float wavLenMax = duration.Max() * SampleRate;
    var wavLengths = duration.Select(d => (long)(d * SampleRate)).ToArray();
    int chunkSize = BaseChunkSize * ChunkCompressFactor;
    int latentLen = (int)((wavLenMax + chunkSize - 1) / chunkSize);
    int latentDim = LatentDim * ChunkCompressFactor;

    // Generate random noise using Box-Muller transform
    var random = new Random();
    var noisyLatent = new float[bsz][][];
    for (int b = 0; b < bsz; b++)
    {
        noisyLatent[b] = new float[latentDim][];
        for (int d = 0; d < latentDim; d++)
        {
            noisyLatent[b][d] = new float[latentLen];
            for (int t = 0; t < latentLen; t++)
            {
                // Box-Muller transform for normal distribution
                double u1 = 1.0 - random.NextDouble();
                double u2 = 1.0 - random.NextDouble();
                noisyLatent[b][d][t] = (float)(Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2));
            }
        }
    }

    var latentMask = GetLatentMask(wavLengths);

    // Apply mask
    for (int b = 0; b < bsz; b++)
    {
        for (int d = 0; d < latentDim; d++)
        {
            for (int t = 0; t < latentLen; t++)
            {
                noisyLatent[b][d][t] *= latentMask[b][0][t];
            }
        }
    }

    return (noisyLatent, latentMask);
}
```

**File**: `Core/TextToSpeech.cs`
**Lines**: 39-82

---

## Debugging Recommendations

### Essential Logging

Add these diagnostic logs to catch issues early:

```csharp
// After loading config
Console.WriteLine($"Config loaded: SampleRate={SampleRate}, " +
    $"BaseChunkSize={BaseChunkSize}, ChunkCompressFactor={ChunkCompressFactor}");

// After voice style loading
Console.WriteLine($"Style loaded: TTL shape=[{string.Join(",", style.TtlShape)}], " +
    $"DP shape=[{string.Join(",", style.DpShape)}]");

// List ONNX outputs
using var dpResults = _durationPredictor.Run(dpInputs);
Console.WriteLine($"Duration Predictor outputs: {string.Join(", ", dpResults.Select(r => r.Name))}");
```

### Common Error Patterns

| Error | Root Cause | Fix |
|-------|-----------|-----|
| `DivideByZeroException` | Config values are 0 | Use manual JSON parsing (Issue #1) |
| `KeyNotFoundException: 'ttl'` | Wrong JSON keys | Use `"style_ttl"`, `"style_dp"` (Issue #2) |
| `Sequence contains no matching element` | Wrong output tensor name | Check ONNX output names (Issue #4) |
| `Missing Input: style_ttl` | Wrong input tensor name | Use correct input names (Issue #4) |

---

## Reference Implementation

The **ONLY** authoritative reference is the official C# example:

**Location**: `example_repo/csharp/Helper.cs` in the Supertonic repository

**DO NOT** rely on:
- Python examples (different API)
- Unofficial documentation
- The original integration guide (has errors)

**Always cross-reference** your implementation against `Helper.cs` for:
- Tensor names
- Execution order
- Model input/output shapes
- Helper function implementations

---

## Testing Checklist

Before considering your implementation complete:

- [ ] Configuration loads with non-zero values
  - SampleRate = 44100
  - BaseChunkSize = 512
  - ChunkCompressFactor = 6
  - LatentDim = 24

- [ ] Voice styles load correctly
  - TTL data: 12800 floats, dims: [1, 50, 256]
  - DP data: 128 floats, dims: [1, 8, 16]

- [ ] ONNX models run without errors
  - Duration Predictor outputs "duration"
  - Text Encoder outputs "text_emb"
  - Vector Estimator outputs "denoised_latent"
  - Vocoder outputs "wav_tts"

- [ ] Audio generation completes
  - WAV file is created
  - File size > 0
  - Audio is playable
  - Speech is intelligible

---

## Corrected Integration Steps

### Step 1: Use the Reference Implementation

**Download the official example**:
```bash
git clone https://github.com/supertone-inc/supertonic.git
cd supertonic/csharp
```

**Copy these files** to your project:
- `Helper.cs` → Contains ALL core implementations
- `ExampleONNX.cs` → Shows correct usage patterns

### Step 2: Adapt Namespaces

```csharp
// Change this:
namespace Supertonic

// To your namespace:
namespace YourApp.Core
```

### Step 3: Implement Service Layer

Follow the `SupertonicTTSService` pattern from the working example (SupertonicTTSTrayApp).

### Step 4: Test Incrementally

```csharp
// Test 1: Config loading
var config = TTSHelper.LoadConfig("path/to/tts.json");
Console.WriteLine($"SampleRate: {config.AE.SampleRate}");  // Should be 44100

// Test 2: Voice style loading
var style = TTSHelper.LoadVoiceStyle(new List<string> { "path/to/M1.json" });
Console.WriteLine($"TTL size: {style.Ttl.Length}");  // Should be 12800

// Test 3: TTS engine loading
var tts = TTSHelper.LoadTextToSpeech("path/to/onnx");
Console.WriteLine($"SampleRate: {tts.SampleRate}");  // Should be 44100

// Test 4: Speech generation
var (wav, duration) = tts.Call("Hello, world!", style);
Console.WriteLine($"Generated {wav.Length} samples");  // Should be > 0
```

---

## Conclusion

The original integration guide had **critical errors** in:
1. Configuration loading
2. Voice style parsing
3. Pipeline architecture
4. Tensor naming

**Use the official `example_repo/csharp/Helper.cs` as your source of truth**, not the integration guide.

This implementation is now **verified working** in production (v0.5.0 of SupertonicTTSTrayApp).

---

**Last Updated**: 2025-11-29
**Tested With**: Supertonic TTS v1.5.0, .NET 8.0
**Status**: ✅ Production Verified
