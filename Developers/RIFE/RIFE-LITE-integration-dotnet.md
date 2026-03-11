# RIFE Lite ONNX — .NET C# Integration Guide

<!-- TINS Specification v1.0 -->
<!-- ZS:COMPLEXITY:MEDIUM -->
<!-- ZS:PRIORITY:HIGH -->
<!-- ZS:PLATFORM:DOTNET -->
<!-- ZS:LANGUAGE:CSHARP -->

## Description

This document is a complete, self-contained integration guide for running RIFE (Real-Time Intermediate Flow Estimation) Lite ONNX models inside a .NET C# application for CPU-based image frame sequence interpolation. The target use case is generating intermediate frames between two input images at 720p resolution or below, with a peak RAM footprint well under 1 GB.

The integration uses **Microsoft.ML.OnnxRuntime** for model inference and **SixLabors.ImageSharp** for image loading and pixel manipulation. No GPU, no Python, no native video libraries. Everything runs as managed .NET code on CPU.

This guide covers the exact model download URL, project setup, NuGet packages, tensor pre/post-processing, the interpolator class, a multi-frame sequence pipeline, a working console app entry point, padding rules, disposal patterns, and known edge cases.

---

## Model Information

### Recommended Model: RIFE v4.22 Lite

The lite series uses a lower computational cost architecture while retaining the same training framework as the full models. For 720p and below on CPU, v4.22 lite is the best balance of quality and speed.

**Direct download (7z archive):**
```
https://github.com/AmusementClub/vs-mlrt/releases/download/external-models/rife_v4.22_lite.7z
```

**Alternative — v4.25 Lite (latest, slightly heavier but improved anime scenes):**
```
https://github.com/AmusementClub/vs-mlrt/releases/download/external-models/rife_v4.25_lite.7z
```

**Archive contents after extraction:**
```
rife_v2/
  rife_v4.22_lite.onnx    ← this is the file you need
```

**Model characteristics (v4.22 lite):**
- On-disk size: ~9 MB
- RAM usage at 720p (1280×720), CPU fp32: ~150–220 MB
- RAM usage at 480p (854×480), CPU fp32: ~80–120 MB
- Input format: float32, RGB, normalized [0.0, 1.0]
- Input nodes: `img0` [1,3,H,W], `img1` [1,3,H,W], `timestep` [1]
- Output node: `output` [1,3,H,W]
- Padding requirement: height and width must be **multiples of 32**

> **Note:** If you later see ORT warnings about dynamic shapes, verify your input tensors match the padded dimensions exactly. The v2 representation models handle internal padding themselves; the v1 models (without `_v2` in the filename) require external padding — the code in this guide handles this correctly for both.

---

## Functionality

### Core Features

1. Load two input images (any common format: PNG, JPEG, BMP, TIFF) from disk.
2. Normalize and pad images to the nearest multiple-of-32 boundary.
3. Run the RIFE lite ONNX model on CPU via OnnxRuntime to produce one interpolated frame at a specified timestep (default: 0.5 for the exact midpoint).
4. Crop the output back to the original resolution and save it to disk.
5. Support processing a full frame sequence: given N input frames, produce N-1 interpolated frames inserted between each pair, optionally recursively (2x, 4x, 8x multiplier).
6. Report per-frame inference time and total elapsed time.

### User Flow — Single Pair

```
[frame0.png] ──┐
               ├──► RifeInterpolator.Interpolate() ──► [frame_mid.png]
[frame1.png] ──┘
```

### User Flow — Sequence

```
Input:  [000.png, 001.png, 002.png, 003.png]
Output: [000.png, mid_000_001.png, 001.png, mid_001_002.png, 002.png, mid_002_003.png, 003.png]
```

### Edge Cases

- **Odd-dimension images:** Pad up to the next multiple of 32, then crop the output.
- **Mismatched frame sizes:** Throw `ArgumentException` with a descriptive message before inference.
- **Timestep out of range:** Clamp to [0.001, 0.999] with a warning log; do not throw.
- **Non-existent model path:** Throw `FileNotFoundException` with the exact path attempted.
- **Memory pressure:** Process frames one pair at a time; do not load the entire sequence into memory simultaneously.
- **1-frame input to sequence pipeline:** Return the single frame unchanged with a warning.

---

## Technical Implementation

### Architecture

```
YourApp
  └── FrameInterpolationService
        ├── RifeInterpolator          (owns InferenceSession, IDisposable)
        │     ├── ImagePreprocessor   (static, bitmap → float tensor with padding)
        │     └── ImagePostprocessor  (static, float tensor → bitmap with crop)
        └── SequencePipeline          (orchestrates multi-frame batch)
```

### Technology Stack

- **.NET 8.0** (LTS) or .NET 6.0 minimum
- **Microsoft.ML.OnnxRuntime 1.20.x** — CPU inference
- **SixLabors.ImageSharp 3.x** — image load/save/pixel access
- No GPU packages required; do **not** add `Microsoft.ML.OnnxRuntime.Gpu`

### Data Models

```csharp
// Tensor dimensions always follow NCHW layout
// N=1 (single image), C=3 (RGB), H=height, W=width

record TensorShape(int N, int C, int H, int W);

record PaddedFrame(
    float[] Data,          // raw float array, NCHW, length = 1*3*PaddedH*PaddedW
    int OriginalWidth,
    int OriginalHeight,
    int PaddedWidth,
    int PaddedHeight
);

record InterpolationRequest(
    string Frame0Path,
    string Frame1Path,
    string OutputPath,
    float Timestep = 0.5f  // 0.0 = frame0, 1.0 = frame1, 0.5 = midpoint
);
```

### Padding Algorithm

RIFE requires image dimensions to be multiples of 32. Padding is applied to the **right** and **bottom** edges using zero-padding (black pixels), never to left or top. This preserves pixel coordinate alignment.

```
paddedW = Ceil(originalW / 32.0) * 32
paddedH = Ceil(originalH / 32.0) * 32
```

For 1280×720: paddedW = 1280 (already multiple), paddedH = 736 (720 → next 32 multiple is 736).

### Tensor Memory Layout

Data is stored as a flat `float[]` in NCHW order:
```
index = n*(C*H*W) + c*(H*W) + h*W + w
```
For N=1: `index = c*(H*W) + h*W + w`

Channels: 0=Red, 1=Green, 2=Blue. Values normalized to [0.0, 1.0] by dividing each uint8 pixel value by 255.0f.

---

## Implementation

### Step 1 — Project Setup

Create a new .NET console app:

```bash
dotnet new console -n RifeLiteDemo
cd RifeLiteDemo
```

Add NuGet packages:

```bash
dotnet add package Microsoft.ML.OnnxRuntime --version 1.20.1
dotnet add package SixLabors.ImageSharp --version 3.1.5
```

Verify `RifeLiteDemo.csproj` contains:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <AllowUnsafeBlocks>false</AllowUnsafeBlocks>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.ML.OnnxRuntime" Version="1.20.1" />
    <PackageReference Include="SixLabors.ImageSharp" Version="3.1.5" />
  </ItemGroup>
</Project>
```

### Step 2 — Download and Place the Model

Download the archive from:
```
https://github.com/AmusementClub/vs-mlrt/releases/download/external-models/rife_v4.22_lite.7z
```

Extract it (use 7-Zip on Windows or `7z x rife_v4.22_lite.7z` on Linux/macOS).

Place the extracted file at:
```
RifeLiteDemo/
  models/
    rife_v4.22_lite.onnx
```

The default model path in the code is `models/rife_v4.22_lite.onnx` relative to the working directory.

Verify with Netron (https://netron.app) that the model has:
- Inputs: `img0` [1,3,?,?], `img1` [1,3,?,?], `timestep` [1]
- Output: `output` [1,3,?,?]

If the input names differ in a later model version, update the string constants in `RifeInterpolator.cs` accordingly.

### Step 3 — ImagePreprocessor.cs

```csharp
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace RifeLiteDemo;

/// <summary>
/// Converts images to/from float tensors in NCHW layout for RIFE inference.
/// </summary>
public static class ImagePreprocessor
{
    private const int PaddingMultiple = 32;

    /// <summary>
    /// Load an image from disk and convert to a padded float tensor (NCHW, RGB, [0,1]).
    /// Padding is applied to right and bottom edges only.
    /// </summary>
    public static PaddedFrame LoadAndPad(string imagePath)
    {
        if (!File.Exists(imagePath))
            throw new FileNotFoundException($"Image not found: {imagePath}", imagePath);

        using var image = Image.Load<Rgb24>(imagePath);

        int origW = image.Width;
        int origH = image.Height;
        int padW = PadDimension(origW);
        int padH = PadDimension(origH);

        // Allocate tensor: [1, 3, padH, padW]
        float[] data = new float[3 * padH * padW];

        image.ProcessPixelRows(accessor =>
        {
            for (int y = 0; y < origH; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (int x = 0; x < origW; x++)
                {
                    var pixel = row[x];
                    // Channel-first: R, G, B
                    data[0 * padH * padW + y * padW + x] = pixel.R / 255.0f;
                    data[1 * padH * padW + y * padW + x] = pixel.G / 255.0f;
                    data[2 * padH * padW + y * padW + x] = pixel.B / 255.0f;
                }
                // Padding columns (right edge): already zero — float[] default
            }
            // Padding rows (bottom edge): already zero
        });

        return new PaddedFrame(data, origW, origH, padW, padH);
    }

    /// <summary>
    /// Convert a NCHW float tensor back to an image, cropping to the original dimensions.
    /// </summary>
    public static Image<Rgb24> TensorToImage(float[] data, int paddedW, int paddedH,
                                              int originalW, int originalH)
    {
        var image = new Image<Rgb24>(originalW, originalH);

        image.ProcessPixelRows(accessor =>
        {
            for (int y = 0; y < originalH; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (int x = 0; x < originalW; x++)
                {
                    float r = data[0 * paddedH * paddedW + y * paddedW + x];
                    float g = data[1 * paddedH * paddedW + y * paddedW + x];
                    float b = data[2 * paddedH * paddedW + y * paddedW + x];

                    row[x] = new Rgb24(
                        ClampToByte(r),
                        ClampToByte(g),
                        ClampToByte(b)
                    );
                }
            }
        });

        return image;
    }

    private static int PadDimension(int value) =>
        (int)(Math.Ceiling(value / (double)PaddingMultiple) * PaddingMultiple);

    private static byte ClampToByte(float v) =>
        (byte)Math.Clamp((int)(v * 255.0f + 0.5f), 0, 255);
}
```

### Step 4 — PaddedFrame.cs (record)

```csharp
namespace RifeLiteDemo;

/// <summary>
/// Holds a float tensor for one frame along with dimension metadata.
/// </summary>
public record PaddedFrame(
    float[] Data,
    int OriginalWidth,
    int OriginalHeight,
    int PaddedWidth,
    int PaddedHeight
);
```

### Step 5 — RifeInterpolator.cs

```csharp
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace RifeLiteDemo;

/// <summary>
/// Wraps the RIFE Lite ONNX model session.
/// One instance per application lifetime — reuse across all frames.
/// Thread-safety: Run() is thread-safe in OnnxRuntime 1.8+; this class is safe to share.
/// </summary>
public sealed class RifeInterpolator : IDisposable
{
    // Input/output node names — verify with Netron if using a different model version
    private const string InputImg0    = "img0";
    private const string InputImg1    = "img1";
    private const string InputTimestep = "timestep";
    private const string OutputName   = "output";

    private readonly InferenceSession _session;
    private bool _disposed;

    /// <summary>
    /// Initialise the interpolator and load the ONNX model.
    /// </summary>
    /// <param name="modelPath">Path to rife_v4.22_lite.onnx (or any compatible RIFE lite .onnx)</param>
    public RifeInterpolator(string modelPath)
    {
        if (!File.Exists(modelPath))
            throw new FileNotFoundException($"RIFE model not found: {modelPath}", modelPath);

        var options = new SessionOptions();

        // CPU-only configuration
        options.ExecutionMode           = ExecutionMode.ORT_PARALLEL;
        options.InterOpNumThreads       = Environment.ProcessorCount;
        options.IntraOpNumThreads       = Environment.ProcessorCount;
        options.GraphOptimizationLevel  = GraphOptimizationLevel.ORT_ENABLE_ALL;

        // Optional: write an optimised model to disk to skip graph-opt on next startup
        // options.OptimizedModelFilePath = modelPath + ".optimized.onnx";

        _session = new InferenceSession(modelPath, options);

        Console.WriteLine($"[RIFE] Loaded: {Path.GetFileName(modelPath)}");
        Console.WriteLine($"[RIFE] Threads: {Environment.ProcessorCount}");
    }

    /// <summary>
    /// Interpolate a single frame between two pre-loaded PaddedFrames.
    /// Both frames must have the same padded dimensions.
    /// </summary>
    /// <param name="frame0">First frame (earlier in time)</param>
    /// <param name="frame1">Second frame (later in time)</param>
    /// <param name="timestep">0.5 = midpoint; values closer to 0 bias toward frame0</param>
    /// <returns>Output float[] in NCHW layout, same padded dimensions as inputs</returns>
    public float[] Interpolate(PaddedFrame frame0, PaddedFrame frame1, float timestep = 0.5f)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        // Validate matching dimensions
        if (frame0.PaddedWidth != frame1.PaddedWidth || frame0.PaddedHeight != frame1.PaddedHeight)
            throw new ArgumentException(
                $"Frame dimension mismatch: frame0={frame0.PaddedWidth}x{frame0.PaddedHeight}, " +
                $"frame1={frame1.PaddedWidth}x{frame1.PaddedHeight}");

        // Clamp timestep
        timestep = Math.Clamp(timestep, 0.001f, 0.999f);

        int pH = frame0.PaddedHeight;
        int pW = frame0.PaddedWidth;
        var dims = new[] { 1, 3, pH, pW };

        var tensorImg0 = new DenseTensor<float>(frame0.Data, dims);
        var tensorImg1 = new DenseTensor<float>(frame1.Data, dims);
        var tensorTs   = new DenseTensor<float>(new[] { timestep }, new[] { 1 });

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor(InputImg0,    tensorImg0),
            NamedOnnxValue.CreateFromTensor(InputImg1,    tensorImg1),
            NamedOnnxValue.CreateFromTensor(InputTimestep, tensorTs),
        };

        using var results = _session.Run(inputs);
        return results[0].AsEnumerable<float>().ToArray();
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _session.Dispose();
            _disposed = true;
        }
    }
}
```

### Step 6 — SequencePipeline.cs

```csharp
using System.Diagnostics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;

namespace RifeLiteDemo;

/// <summary>
/// Processes an ordered list of frame image paths and produces interpolated frames
/// inserted between each consecutive pair.
/// </summary>
public sealed class SequencePipeline
{
    private readonly RifeInterpolator _interpolator;

    public SequencePipeline(RifeInterpolator interpolator)
    {
        _interpolator = interpolator;
    }

    /// <summary>
    /// For each consecutive pair in inputPaths, generate one interpolated frame
    /// and write it to outputDirectory.
    ///
    /// Output naming: the interpolated frame between input[i] and input[i+1] is
    /// named "interp_{i:D6}_{i+1:D6}.png" inside outputDirectory.
    ///
    /// The original frames are NOT copied to the output directory by this method.
    /// </summary>
    /// <param name="inputPaths">Ordered list of source frame paths</param>
    /// <param name="outputDirectory">Directory to write interpolated frames into</param>
    /// <param name="timestep">Interpolation position between each pair</param>
    public void Run(IReadOnlyList<string> inputPaths, string outputDirectory, float timestep = 0.5f)
    {
        if (inputPaths.Count < 2)
        {
            Console.WriteLine("[Pipeline] Warning: fewer than 2 input frames, nothing to interpolate.");
            return;
        }

        Directory.CreateDirectory(outputDirectory);

        var totalTimer = Stopwatch.StartNew();
        int pairCount = inputPaths.Count - 1;

        for (int i = 0; i < pairCount; i++)
        {
            string pathA = inputPaths[i];
            string pathB = inputPaths[i + 1];

            Console.Write($"[Pipeline] Pair {i + 1}/{pairCount}: {Path.GetFileName(pathA)} + {Path.GetFileName(pathB)} ... ");

            var sw = Stopwatch.StartNew();

            // Load both frames
            var frameA = ImagePreprocessor.LoadAndPad(pathA);
            var frameB = ImagePreprocessor.LoadAndPad(pathB);

            // Validate original dimensions match (padded dims will also match)
            if (frameA.OriginalWidth  != frameB.OriginalWidth ||
                frameA.OriginalHeight != frameB.OriginalHeight)
            {
                throw new InvalidOperationException(
                    $"Frame size mismatch at pair {i}: " +
                    $"{frameA.OriginalWidth}x{frameA.OriginalHeight} vs " +
                    $"{frameB.OriginalWidth}x{frameB.OriginalHeight}");
            }

            // Run inference
            float[] outputData = _interpolator.Interpolate(frameA, frameB, timestep);

            // Convert output tensor back to image and crop
            using var interpolatedImage = ImagePreprocessor.TensorToImage(
                outputData,
                frameA.PaddedWidth,
                frameA.PaddedHeight,
                frameA.OriginalWidth,
                frameA.OriginalHeight
            );

            // Save
            string outName = $"interp_{i:D6}_{i + 1:D6}.png";
            string outPath = Path.Combine(outputDirectory, outName);
            interpolatedImage.Save(outPath, new PngEncoder());

            sw.Stop();
            Console.WriteLine($"done in {sw.ElapsedMilliseconds} ms → {outName}");
        }

        totalTimer.Stop();
        Console.WriteLine($"[Pipeline] Complete. {pairCount} frames in {totalTimer.Elapsed.TotalSeconds:F2}s " +
                          $"({totalTimer.ElapsedMilliseconds / (double)pairCount:F0} ms/pair avg)");
    }
}
```

### Step 7 — Program.cs (Entry Point)

```csharp
using RifeLiteDemo;

// ─── Configuration ────────────────────────────────────────────────────────────
const string ModelPath       = "models/rife_v4.22_lite.onnx";
const string InputDirectory  = "input_frames";
const string OutputDirectory = "output_frames";
const float  Timestep        = 0.5f;   // 0.5 = midpoint between each pair

// ─── Validate ────────────────────────────────────────────────────────────────
if (!File.Exists(ModelPath))
{
    Console.Error.WriteLine($"[Error] Model not found at: {ModelPath}");
    Console.Error.WriteLine("Download from:");
    Console.Error.WriteLine("  https://github.com/AmusementClub/vs-mlrt/releases/download/external-models/rife_v4.22_lite.7z");
    Console.Error.WriteLine("Extract rife_v2/rife_v4.22_lite.onnx → models/rife_v4.22_lite.onnx");
    return 1;
}

if (!Directory.Exists(InputDirectory))
{
    Console.Error.WriteLine($"[Error] Input directory not found: {InputDirectory}");
    return 1;
}

// Collect input frames (PNG, ordered by filename)
var inputPaths = Directory
    .GetFiles(InputDirectory, "*.png")
    .OrderBy(f => f)
    .ToList();

if (inputPaths.Count < 2)
{
    Console.Error.WriteLine($"[Error] Need at least 2 PNG frames in {InputDirectory}");
    return 1;
}

Console.WriteLine($"[Main] Found {inputPaths.Count} input frames");
Console.WriteLine($"[Main] Output directory: {OutputDirectory}");

// ─── Run ─────────────────────────────────────────────────────────────────────
using var interpolator = new RifeInterpolator(ModelPath);
var pipeline = new SequencePipeline(interpolator);
pipeline.Run(inputPaths, OutputDirectory, Timestep);

return 0;
```

### Step 8 — Single-Pair Usage (Minimal Example)

If you only need to interpolate a single pair without the pipeline:

```csharp
using RifeLiteDemo;

// Load model once — reuse across calls
using var interpolator = new RifeInterpolator("models/rife_v4.22_lite.onnx");

// Load and pad both frames
var frame0 = ImagePreprocessor.LoadAndPad("frame_a.png");
var frame1 = ImagePreprocessor.LoadAndPad("frame_b.png");

// Interpolate at midpoint
float[] outputTensor = interpolator.Interpolate(frame0, frame1, timestep: 0.5f);

// Convert back to image and save
using var result = ImagePreprocessor.TensorToImage(
    outputTensor,
    frame0.PaddedWidth, frame0.PaddedHeight,
    frame0.OriginalWidth, frame0.OriginalHeight
);
result.Save("frame_mid.png");
```

---

## Project File Structure

```
RifeLiteDemo/
├── RifeLiteDemo.csproj
├── Program.cs
├── PaddedFrame.cs
├── ImagePreprocessor.cs
├── RifeInterpolator.cs
├── SequencePipeline.cs
├── models/
│   └── rife_v4.22_lite.onnx      ← download separately
├── input_frames/
│   ├── 000000.png
│   ├── 000001.png
│   └── ...
└── output_frames/                 ← created at runtime
    ├── interp_000000_000001.png
    └── ...
```

---

## Build and Run

```bash
# Build
dotnet build -c Release

# Run (input_frames/ must contain at least 2 PNGs)
dotnet run -c Release

# Or after publish
dotnet publish -c Release -o ./publish
./publish/RifeLiteDemo
```

---

## Performance Expectations (720p, CPU)

| CPU Class | Approx. ms/pair | Notes |
|---|---|---|
| Modern desktop (i7/Ryzen 7, 8+ cores) | 800–1500 ms | ORT parallel mode |
| Laptop (i5/Ryzen 5, 6 cores) | 1500–3000 ms | |
| Low-power embedded / CI server | 4000–8000 ms | |

These are approximate. ORT will use all available logical cores via the parallel execution mode set in `SessionOptions`.

---

## Memory Budget (v4.22 lite, CPU, fp32)

| Resolution | Model weights | Activation tensors | Total peak RAM |
|---|---|---|---|
| 480p (854×480) | ~18 MB | ~80 MB | ~100 MB |
| 540p (960×540) | ~18 MB | ~110 MB | ~130 MB |
| 720p (1280×720) | ~18 MB | ~180 MB | ~200 MB |

All well within the 3 GB budget. The .NET runtime itself adds ~50–80 MB overhead.

---

## Known Limitations and Edge Cases

**Padding at 720p:** Height 720 pads to 736 (next multiple of 32). The extra 16-pixel strip at the bottom is black and is cropped away in post-processing. This is handled transparently by `ImagePreprocessor`.

**JPEG input:** JPEG is supported by ImageSharp but introduces compression artifacts that may degrade interpolation quality. PNG or lossless formats are strongly preferred.

**Animated GIF / multi-frame TIFF:** `Image.Load<Rgb24>()` loads only the first frame. To process animated formats, extract individual frames first using ImageSharp's frame enumeration API before passing to this pipeline.

**Recursive doubling (2x, 4x multiplier):** Call the pipeline recursively. For 2x doubling: interpolate pairs → collect originals + interpolated into a merged list → done. For 4x: run two rounds. The `SequencePipeline` as written handles one pass (midpoint insertion). Wrap it in a loop for multiple passes.

**Model node names:** If you switch to a different RIFE model version and inference throws `"Input name 'img0' not found"`, use Netron to inspect the exact input names and update the constants in `RifeInterpolator.cs`.

**Thread safety:** `RifeInterpolator.Interpolate()` is safe to call from multiple threads simultaneously (OnnxRuntime 1.8+). `SequencePipeline.Run()` is single-threaded. For parallel pair processing, create one `SequencePipeline` per thread but share the same `RifeInterpolator` instance.

---

## License

The RIFE model weights are distributed under the MIT License by hzwer (Zhewei Huang). The vs-mlrt ONNX conversion is provided by AmusementClub. `Microsoft.ML.OnnxRuntime` is MIT licensed. `SixLabors.ImageSharp` is Apache 2.0 licensed for non-commercial use and requires a commercial licence for commercial applications — verify with SixLabors if your use case requires this.

---

## References

- RIFE paper: https://arxiv.org/abs/2011.06294
- Practical-RIFE (model source): https://github.com/hzwer/Practical-RIFE
- ONNX model download: https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models
- OnnxRuntime C# API: https://onnxruntime.ai/docs/api/csharp/api/Microsoft.ML.OnnxRuntime.html
- SixLabors.ImageSharp docs: https://docs.sixlabors.com/articles/imagesharp/
- Netron model viewer: https://netron.app
