# PuppetJSX - Modular Sprite Flipbook Manager

## Description

PuppetJSX is a React-based skeletal animation system for 2D game character creation and animation. It eliminates the exponential complexity of traditional sprite sheet systems by using a modular, bone-based approach where characters are composed of separate body part images attached to an animated skeleton.

**Core Problem Solved:** In traditional 2D animation, a character with 7 animation cycles (WALK, ATTACK, JUMP, IDLE, IDLE2, HIT, DEATH) at 4 frames each requires 28 unique sprite images. Adding equipment variations (different armor, helmets, weapons) multiplies this exponentially—3 armor types × 3 helmets × 3 weapons = 27 complete sprite sheets with 756 total frames. This creates unsustainable asset management overhead.

**PuppetJSX Solution:** Characters are built from 10-20 reusable body part images (head, torso, arms, legs, hands, feet, equipment) attached to an animated skeleton with only 4 keyframes per animation cycle. Equipment changes require swapping only the affected parts, reducing asset count by 70-90% while maintaining full visual customization.

**Key Features:**
- Hierarchical skeleton system with parent-child bone relationships and transform inheritance
- 4-frame keyframe animation editor with interpolation support
- Drag-and-drop character assembly from parts library
- Real-time preview with playback controls
- JSON export for seamless game engine integration
- Support for both hand-crafted and procedurally generated characters

## Functionality

### 1. Application Modes

The application operates in two primary modes accessible via a top toolbar toggle:

**Character Builder Mode:**
- User assembles characters by selecting a skeleton template and assigning body part images to bones
- Parts library displays categorized images (head, torso, arms, legs, weapons, accessories) with thumbnail previews
- Drag-and-drop or dropdown selection assigns parts to skeleton bones
- Real-time preview shows assembled character with current skeleton pose
- Character definitions can be saved/loaded as JSON files
- Supports manual assembly and procedural generation via randomized part selection

**Animation Editor Mode:**
- User creates animations by defining bone transforms across 4 keyframes
- Timeline interface shows frames 1-4 with duration settings for each frame
- Clicking a bone displays transform gizmos (position, rotation, scale handles)
- Numerical input fields allow precise transform values
- Animation preview loops with adjustable playback speed
- Copy/paste/mirror operations for frame data
- Animations saved as JSON with bone transform data per frame

### 2. Skeleton System

**Skeleton Structure:**
- Hierarchical tree of bones with parent-child relationships
- Root bone at origin (0,0) with all other bones as descendants
- Each bone has: unique ID, parent reference, local transform (position, rotation, scale), z-index for layering, child bone array

**Default Humanoid Skeleton:**
```
root (0, 0)
└── torso (0, -20) [z:5]
    ├── head (0, -30) [z:10]
    ├── arm_left (-15, -10) [z:3]
    │   └── hand_left (0, 20) [z:3]
    ├── arm_right (15, -10) [z:7]
    │   └── hand_right (0, 20) [z:7]
    ├── leg_left (-8, 15) [z:4]
    │   └── foot_left (0, 20) [z:4]
    └── leg_right (8, 15) [z:6]
        └── foot_right (0, 20) [z:6]
```

**Transform Inheritance:**
- Child bones inherit parent transforms through matrix multiplication
- Local position rotates with parent rotation, then scales with parent scale, then adds to parent world position
- Local rotation adds to parent rotation
- Local scale multiplies with parent scale
- Z-index determines render order (lower values render first, behind higher values)

### 3. Parts Library

**Organization:**
- Parts categorized by type: head, torso, arm, leg, hand, foot, weapon, accessory
- Each part has: unique ID, display name, category, image URL, attach point (bone ID), pixel offset from bone position, z-index modifier relative to bone z-index
- Parts displayed as grid of thumbnails with category filter tabs
- Search functionality filters by part name
- New parts added via "Add Part" button with image upload

**Part Assignment:**
- User selects bone in canvas or bone list
- Dropdown or drag-drop assigns part to selected bone
- Multiple parts can reference same image (e.g., both arms use "leather_arm.png")
- Parts can be removed/swapped without affecting other parts
- Offset adjustment handles appear when part selected for fine-tuning placement

### 4. Character Builder Interface

**Layout (3-Panel):**

**Left Panel - Parts Library (25% width):**
- Category tabs: All, Head, Torso, Arms, Legs, Hands, Feet, Weapons, Accessories
- Search bar at top
- Scrollable grid of part thumbnails (100×100px) with part names
- "Add Part" button at bottom opens upload dialog

**Center Panel - Canvas Viewport (50% width):**
- Dark gray background (RGB: 45, 45, 45)
- White 32×32 pixel grid with 4-pixel major gridlines (toggleable)
- Character rendered at canvas center with zoom/pan controls
- Bone gizmos overlay when in edit mode:
  - Small circles (8px radius) at bone pivot points
  - Yellow for selected bone, white for unselected, green for children of selected
  - Dashed lines connecting parent-child bones
- Transform handles appear on selected bone:
  - Position: 4-directional arrows (blue)
  - Rotation: circular arc with angle indicator (green)
  - Scale: corner handles (red)
- Mouse wheel zooms (10% increments, range 0.1× to 5×)
- Middle mouse button or Space+drag pans canvas
- Zoom level and grid on/off buttons in bottom-right corner

**Right Panel - Properties (25% width):**
- Character name text input at top
- Skeleton selector dropdown (Humanoid, Quadruped, etc.)
- Bone list showing hierarchy as expandable tree
- Selected bone properties:
  - Part assignment dropdown showing all compatible parts
  - "Remove Part" button if part assigned
  - Offset X/Y number inputs
  - Layer override number input (overrides z-index calculation)
- "Save Character" and "Load Character" buttons at bottom
- "Generate Random" button creates procedural character by randomly selecting parts from each category

### 5. Animation Editor Interface

**Layout (3-Panel):**

**Left Panel - Animation List (25% width):**
- List of saved animations for current skeleton
- "+ New Animation" button creates blank 4-frame animation
- Clicking animation loads it into editor
- Delete button per animation with confirmation dialog
- Animation properties:
  - Name text input
  - Total duration in milliseconds (sum of frame durations)
  - Loop checkbox (default: true)

**Center Panel - Canvas Viewport (50% width):**
- Same as Character Builder but shows animation-specific features:
- Frame scrubber below canvas (4 frame thumbnails)
- Onion skin toggle shows ghosted overlays of adjacent frames at 30% opacity
- Playback controls: Play/Pause button, speed slider (0.1× to 2×), frame step buttons (←/→)
- Current frame highlighted in scrubber with blue border
- Frame duration shown below each frame thumbnail

**Right Panel - Transform Editor (25% width):**
- Current frame number (1-4) and duration input
- Selected bone transform properties with 3-column layout:
  - **Position:** X input, Y input, Reset button
  - **Rotation:** Degrees input (-180 to 180), slider, Reset button
  - **Scale:** X input, Y input, Uniform checkbox, Reset button
- "Copy Frame" button copies all bone transforms of current frame to clipboard
- "Paste Frame" button applies copied transforms to current frame
- "Mirror Frame" button flips left/right bone rotations/positions
- "Reset All Bones" button returns all bones in current frame to default pose
- "Reset Bone" button returns only selected bone to default

### 6. Rendering System

**Render Pipeline (executes every frame):**

1. **Calculate Frame Transforms:**
   - Get current animation frame based on playback time
   - For interpolation: calculate t value (0.0 to 1.0) between current and next frame based on sub-frame time
   - For each bone in skeleton, calculate interpolated local transform by linearly interpolating position, rotation, and scale between keyframes
   - If no interpolation (frame scrubbing or non-playing), use exact keyframe transforms

2. **Calculate World Transforms:**
   - Traverse bone hierarchy depth-first starting from root
   - For each bone:
     - If bone has no parent, world transform = local transform
     - If bone has parent, calculate world transform:
       - Rotate local position by parent world rotation using 2D rotation matrix
       - Scale rotated position by parent world scale (multiply x by scale.x, y by scale.y)
       - Add scaled position to parent world position
       - Add local rotation to parent world rotation (normalize to -180 to 180)
       - Multiply local scale by parent world scale
   - Store world transform for each bone in lookup map

3. **Build Render List:**
   - For each bone with assigned part:
     - Calculate final render position: bone world position + part offset
     - Calculate final z-index: bone z-index + part z-index modifier
     - Add to render list: {image, position, rotation, scale, zIndex}
   - Sort render list by z-index ascending (lower z renders first)

4. **Draw to Canvas:**
   - Clear canvas
   - Draw grid if enabled
   - For each item in sorted render list:
     - Save canvas state
     - Translate to render position
     - Rotate by world rotation
     - Scale by world scale
     - Draw image centered at (0,0)
     - Restore canvas state
   - If in edit mode, draw bone gizmos on top:
     - Draw lines between parent-child bones
     - Draw circles at bone positions
     - Draw transform handles on selected bone

**Z-Index Calculation Example:**
- Torso bone z-index: 5
- Leather armor part z-index modifier: 0
- Final render z-index: 5 + 0 = 5

- Arm_right bone z-index: 7
- Sword part z-index modifier: +2
- Final render z-index: 7 + 2 = 9 (sword renders in front of torso)

### 7. Animation Playback

**Playback State:**
- `isPlaying`: boolean, true when animation running
- `currentTime`: number, milliseconds elapsed in current loop
- `playbackSpeed`: number, multiplier for animation speed (0.1 to 2.0)
- `currentFrame`: integer (0-3), index of active keyframe
- `frameProgress`: number (0.0-1.0), interpolation progress within frame

**Update Loop (requestAnimationFrame):**
1. If not playing, skip update
2. Calculate deltaTime since last frame
3. Increment currentTime by deltaTime × playbackSpeed
4. Calculate animation total duration (sum of all frame durations)
5. If currentTime ≥ total duration:
   - If looping: currentTime = currentTime % total duration
   - If not looping: currentTime = total duration, isPlaying = false
6. Calculate current frame:
   - Accumulate frame durations until sum ≥ currentTime
   - Current frame = index where accumulation exceeds currentTime
   - Frame progress = (currentTime - accumulated duration up to frame start) / current frame duration
7. Trigger render with calculated frame and progress

**Interpolation Formula:**
```
Linear Interpolation (lerp):
value = start + (end - start) × t

Position: 
x = frame1.position.x + (frame2.position.x - frame1.position.x) × frameProgress
y = frame1.position.y + (frame2.position.y - frame1.position.y) × frameProgress

Rotation:
angle = frame1.rotation + shortestAngleDelta(frame1.rotation, frame2.rotation) × frameProgress

Scale:
x = frame1.scale.x + (frame2.scale.x - frame1.scale.x) × frameProgress
y = frame1.scale.y + (frame2.scale.y - frame1.scale.y) × frameProgress
```

**Frame Scrubbing:**
- User clicks frame in timeline
- currentTime set to start of clicked frame
- isPlaying set to false
- Render executes with exact keyframe transforms (no interpolation)

### 8. Export System

**Export Character (JSON):**
```json
{
  "version": "1.0",
  "type": "character",
  "data": {
    "id": "char_warrior_001",
    "name": "Iron Warrior",
    "skeletonId": "humanoid_skeleton",
    "parts": {
      "torso": "part_iron_armor",
      "head": "part_iron_helmet",
      "arm_left": "part_iron_arm",
      "arm_right": "part_iron_arm",
      "hand_left": "part_iron_glove",
      "hand_right": "part_iron_sword",
      "leg_left": "part_iron_leg",
      "leg_right": "part_iron_leg",
      "foot_left": "part_iron_boot",
      "foot_right": "part_iron_boot"
    }
  }
}
```

**Export Animation (JSON):**
```json
{
  "version": "1.0",
  "type": "animation",
  "data": {
    "id": "anim_walk_001",
    "name": "Walk Cycle",
    "skeletonId": "humanoid_skeleton",
    "loop": true,
    "frames": [
      {
        "index": 0,
        "duration": 100,
        "bones": {
          "torso": {"position": {"x": 0, "y": -20}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_left": {"position": {"x": -15, "y": -10}, "rotation": -20, "scale": {"x": 1, "y": 1}},
          "arm_right": {"position": {"x": 15, "y": -10}, "rotation": 20, "scale": {"x": 1, "y": 1}},
          "leg_left": {"position": {"x": -8, "y": 15}, "rotation": -30, "scale": {"x": 1, "y": 1}},
          "leg_right": {"position": {"x": 8, "y": 15}, "rotation": 30, "scale": {"x": 1, "y": 1}}
        }
      },
      {
        "index": 1,
        "duration": 100,
        "bones": {
          "torso": {"position": {"x": 0, "y": -22}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_left": {"position": {"x": -15, "y": -10}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_right": {"position": {"x": 15, "y": -10}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "leg_left": {"position": {"x": -8, "y": 15}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "leg_right": {"position": {"x": 8, "y": 15}, "rotation": 0, "scale": {"x": 1, "y": 1}}
        }
      },
      {
        "index": 2,
        "duration": 100,
        "bones": {
          "torso": {"position": {"x": 0, "y": -20}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_left": {"position": {"x": -15, "y": -10}, "rotation": 20, "scale": {"x": 1, "y": 1}},
          "arm_right": {"position": {"x": 15, "y": -10}, "rotation": -20, "scale": {"x": 1, "y": 1}},
          "leg_left": {"position": {"x": -8, "y": 15}, "rotation": 30, "scale": {"x": 1, "y": 1}},
          "leg_right": {"position": {"x": 8, "y": 15}, "rotation": -30, "scale": {"x": 1, "y": 1}}
        }
      },
      {
        "index": 3,
        "duration": 100,
        "bones": {
          "torso": {"position": {"x": 0, "y": -22}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_left": {"position": {"x": -15, "y": -10}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "arm_right": {"position": {"x": 15, "y": -10}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "leg_left": {"position": {"x": -8, "y": 15}, "rotation": 0, "scale": {"x": 1, "y": 1}},
          "leg_right": {"position": {"x": 8, "y": 15}, "rotation": 0, "scale": {"x": 1, "y": 1}}
        }
      }
    ]
  }
}
```

**Export Package (All Data):**
```json
{
  "version": "1.0",
  "type": "package",
  "skeleton": {
    "id": "humanoid_skeleton",
    "name": "Humanoid",
    "bones": { /* full skeleton definition */ }
  },
  "animations": {
    "anim_walk_001": { /* animation data */ },
    "anim_idle_001": { /* animation data */ },
    "anim_attack_001": { /* animation data */ }
  },
  "characters": {
    "char_warrior_001": { /* character data */ }
  },
  "parts": [
    {
      "id": "part_iron_armor",
      "name": "Iron Armor",
      "category": "torso",
      "imageUrl": "/assets/parts/armor/iron_torso.png",
      "attachPoint": "torso",
      "offset": {"x": 0, "y": 0},
      "zIndexModifier": 0
    }
    /* ... all parts used by characters in package */
  ]
}
```

**Export Dialog:**
- Radio buttons: "Export Character", "Export Animation", "Export Package"
- If Character: dropdown selects character to export
- If Animation: dropdown selects animation to export
- If Package: checkboxes for which characters/animations to include
- "Copy to Clipboard" button copies JSON to clipboard
- "Download File" button downloads JSON with appropriate filename
- Filename format: `{type}_{name}_{timestamp}.json`

### 9. Import System

**Import Character:**
- "Load Character" button opens file picker (accepts .json)
- Parse JSON and validate structure:
  - Check version compatibility
  - Verify type is "character"
  - Validate skeleton ID exists in application
  - Validate all part IDs exist in parts library
- If validation passes:
  - Load character into editor
  - Apply parts to skeleton
  - Switch to Character Builder mode
- If validation fails:
  - Show error dialog with specific issues
  - List missing parts/skeletons
  - Option to create placeholder parts for missing items

**Import Animation:**
- "Load Animation" button opens file picker (accepts .json)
- Parse and validate:
  - Check version compatibility
  - Verify type is "animation"
  - Validate skeleton ID matches current skeleton
  - Check all bone IDs exist in skeleton
- If validation passes:
  - Add animation to animation list
  - Switch to Animation Editor mode
  - Load animation as active

**Import Package:**
- "Import Package" button in main toolbar opens file picker
- Parse package JSON
- Import skeleton definition if new (don't override existing)
- Import all parts, adding to library (skip duplicates by ID)
- Import all animations for package skeleton
- Import all characters
- Show import summary dialog: "Imported 15 parts, 3 animations, 2 characters"

### 10. Procedural Character Generation

**Random Generation:**
- "Generate Random" button in Character Builder
- Algorithm:
  1. Select random skeleton (if multiple available)
  2. For each bone in skeleton:
     - Filter parts by category matching bone name/purpose
     - If parts available, select random part (70% chance)
     - If no part selected, bone remains without part (invisible)
     - If multiple parts match (e.g., both arms), use same part for symmetry
  3. Apply generated parts to character
  4. Auto-name character: "Generated_{skeletonName}_{randomID}"

**Deterministic Generation:**
- Seed-based generation for reproducible characters
- User enters numeric seed in "Seed" input field
- Same seed always produces same character for given parts library
- Use seeded random number generator (multiply-with-carry algorithm)

**Variation Generation:**
- "Create Variation" button duplicates current character
- Randomly swaps 1-3 parts while keeping others
- Useful for creating NPCs, enemies, or character families

## Technical Implementation

### Technology Stack

**Required:**
- React 18+ with Hooks (useState, useEffect, useRef, useCallback)
- HTML5 Canvas API for rendering
- JavaScript ES6+ for all logic

**No External Dependencies Required:**
- All rendering, transforms, and animation done with native Canvas API
- No animation libraries (GSAP, etc.)
- No state management libraries (Redux, etc.) - use React Context API
- No UI frameworks (Material-UI, etc.) - custom styled components

### Project Structure

```
/src
├── App.jsx                          # Main application wrapper
├── contexts/
│   └── ProjectContext.jsx           # Global state (skeletons, animations, characters, parts)
├── components/
│   ├── Toolbar.jsx                  # Top toolbar with mode toggle, save/load, export
│   ├── CharacterBuilder/
│   │   ├── CharacterBuilder.jsx     # Character Builder mode container
│   │   ├── PartsLibrary.jsx         # Left panel parts grid
│   │   └── CharacterProperties.jsx  # Right panel properties
│   ├── AnimationEditor/
│   │   ├── AnimationEditor.jsx      # Animation Editor mode container
│   │   ├── AnimationList.jsx        # Left panel animation list
│   │   ├── AnimationTimeline.jsx    # Frame scrubber below canvas
│   │   └── TransformEditor.jsx      # Right panel transform controls
│   ├── Canvas/
│   │   ├── CanvasViewport.jsx       # Center panel canvas wrapper
│   │   ├── CharacterRenderer.jsx    # Rendering logic component
│   │   └── BoneGizmo.jsx            # Bone visualization overlay
│   └── Dialogs/
│       ├── ExportDialog.jsx         # Export options modal
│       ├── ImportDialog.jsx         # Import file modal
│       └── ErrorDialog.jsx          # Validation error display
├── engine/
│   ├── skeleton.js                  # Skeleton transform calculations
│   ├── animation.js                 # Animation playback logic
│   ├── renderer.js                  # Canvas rendering pipeline
│   └── math.js                      # Vector/matrix math utilities
├── data/
│   ├── defaultSkeleton.js           # Humanoid skeleton template
│   ├── defaultParts.js              # Sample parts library
│   └── defaultAnimations.js         # Sample idle/walk animations
└── utils/
    ├── imageLoader.js               # Image caching and loading
    ├── validation.js                # JSON import validation
    └── export.js                    # JSON export formatters
```

### Data Models (TypeScript Interfaces for Reference)

```typescript
interface Vector2 {
  x: number;
  y: number;
}

interface Transform {
  position: Vector2;
  rotation: number;      // degrees, -180 to 180
  scale: Vector2;
}

interface Bone {
  id: string;
  parent: string | null;
  children: string[];
  localTransform: Transform;
  zIndex: number;
}

interface Skeleton {
  id: string;
  name: string;
  bones: Record<string, Bone>;
}

interface AnimationFrame {
  index: number;         // 0-3
  duration: number;      // milliseconds
  bones: Record<string, Transform>;  // bone ID -> transform
}

interface Animation {
  id: string;
  name: string;
  skeletonId: string;
  loop: boolean;
  frames: AnimationFrame[];  // always length 4
}

interface Part {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  attachPoint: string;   // bone ID
  offset: Vector2;
  zIndexModifier: number;
}

interface Character {
  id: string;
  name: string;
  skeletonId: string;
  parts: Record<string, string>;  // bone ID -> part ID
}

interface RenderItem {
  image: HTMLImageElement;
  position: Vector2;
  rotation: number;
  scale: Vector2;
  zIndex: number;
}
```

### Core Algorithm: Transform Calculation

**calculateWorldTransform Function:**
```javascript
function calculateWorldTransform(bone, skeleton, parentWorldTransform = null) {
  const local = bone.localTransform;
  
  if (!parentWorldTransform) {
    // Root bone, world transform = local transform
    return {
      position: { ...local.position },
      rotation: local.rotation,
      scale: { ...local.scale }
    };
  }
  
  // Step 1: Rotate local position by parent rotation
  const rad = parentWorldTransform.rotation * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rotatedX = local.position.x * cos - local.position.y * sin;
  const rotatedY = local.position.x * sin + local.position.y * cos;
  
  // Step 2: Scale rotated position by parent scale
  const scaledX = rotatedX * parentWorldTransform.scale.x;
  const scaledY = rotatedY * parentWorldTransform.scale.y;
  
  // Step 3: Add to parent world position
  const worldPosition = {
    x: parentWorldTransform.position.x + scaledX,
    y: parentWorldTransform.position.y + scaledY
  };
  
  // Step 4: Combine rotations
  let worldRotation = parentWorldTransform.rotation + local.rotation;
  // Normalize to -180 to 180
  while (worldRotation > 180) worldRotation -= 360;
  while (worldRotation < -180) worldRotation += 360;
  
  // Step 5: Multiply scales
  const worldScale = {
    x: parentWorldTransform.scale.x * local.scale.x,
    y: parentWorldTransform.scale.y * local.scale.y
  };
  
  return {
    position: worldPosition,
    rotation: worldRotation,
    scale: worldScale
  };
}
```

**calculateAllWorldTransforms Function:**
```javascript
function calculateAllWorldTransforms(skeleton, frameTransforms) {
  const worldTransforms = {};
  
  // Depth-first traversal starting from root
  function traverse(boneId, parentWorldTransform) {
    const bone = skeleton.bones[boneId];
    
    // Override local transform with frame animation data if exists
    const localTransform = frameTransforms?.[boneId] 
      ? frameTransforms[boneId] 
      : bone.localTransform;
    
    // Calculate this bone's world transform
    const tempBone = { ...bone, localTransform };
    const worldTransform = calculateWorldTransform(
      tempBone, 
      skeleton, 
      parentWorldTransform
    );
    
    worldTransforms[boneId] = worldTransform;
    
    // Recursively process children
    for (const childId of bone.children) {
      traverse(childId, worldTransform);
    }
  }
  
  // Find root bone (bone with no parent)
  const rootBone = Object.values(skeleton.bones).find(b => b.parent === null);
  traverse(rootBone.id, null);
  
  return worldTransforms;
}
```

### Core Algorithm: Animation Interpolation

**interpolateFrames Function:**
```javascript
function interpolateFrames(frame1, frame2, t, skeleton) {
  // t is 0.0 to 1.0, progress from frame1 to frame2
  const interpolatedTransforms = {};
  
  for (const boneId in skeleton.bones) {
    const transform1 = frame1.bones[boneId] || skeleton.bones[boneId].localTransform;
    const transform2 = frame2.bones[boneId] || skeleton.bones[boneId].localTransform;
    
    interpolatedTransforms[boneId] = {
      position: {
        x: lerp(transform1.position.x, transform2.position.x, t),
        y: lerp(transform1.position.y, transform2.position.y, t)
      },
      rotation: lerpAngle(transform1.rotation, transform2.rotation, t),
      scale: {
        x: lerp(transform1.scale.x, transform2.scale.x, t),
        y: lerp(transform1.scale.y, transform2.scale.y, t)
      }
    };
  }
  
  return interpolatedTransforms;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  // Find shortest rotation path
  let delta = b - a;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return a + delta * t;
}
```

**getCurrentFrameData Function:**
```javascript
function getCurrentFrameData(animation, currentTime) {
  let accumulatedTime = 0;
  
  for (let i = 0; i < animation.frames.length; i++) {
    const frame = animation.frames[i];
    const frameEndTime = accumulatedTime + frame.duration;
    
    if (currentTime < frameEndTime) {
      // Current time is within this frame
      const nextFrame = animation.frames[(i + 1) % animation.frames.length];
      const frameProgress = (currentTime - accumulatedTime) / frame.duration;
      
      return {
        currentFrameIndex: i,
        nextFrameIndex: (i + 1) % animation.frames.length,
        progress: frameProgress,
        currentFrame: frame,
        nextFrame: nextFrame
      };
    }
    
    accumulatedTime = frameEndTime;
  }
  
  // Should not reach here if currentTime is valid
  return {
    currentFrameIndex: 0,
    nextFrameIndex: 1,
    progress: 0,
    currentFrame: animation.frames[0],
    nextFrame: animation.frames[1]
  };
}
```

### Core Algorithm: Canvas Rendering

**renderCharacter Function:**
```javascript
function renderCharacter(ctx, character, skeleton, worldTransforms, partsLibrary, showBones, selectedBoneId, canvasCenter, zoom) {
  // Build render list with z-sorting
  const renderList = [];
  
  for (const [boneId, partId] of Object.entries(character.parts)) {
    const part = partsLibrary.find(p => p.id === partId);
    if (!part || !part.image) continue;
    
    const bone = skeleton.bones[boneId];
    const worldTransform = worldTransforms[boneId];
    
    renderList.push({
      image: part.image,
      position: {
        x: worldTransform.position.x + part.offset.x,
        y: worldTransform.position.y + part.offset.y
      },
      rotation: worldTransform.rotation,
      scale: worldTransform.scale,
      zIndex: bone.zIndex + part.zIndexModifier
    });
  }
  
  // Sort by zIndex ascending
  renderList.sort((a, b) => a.zIndex - b.zIndex);
  
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw all parts
  for (const item of renderList) {
    ctx.save();
    
    // Transform to world position
    const screenX = canvasCenter.x + item.position.x * zoom;
    const screenY = canvasCenter.y + item.position.y * zoom;
    
    ctx.translate(screenX, screenY);
    ctx.rotate(item.rotation * Math.PI / 180);
    ctx.scale(item.scale.x * zoom, item.scale.y * zoom);
    
    // Draw image centered
    const w = item.image.width;
    const h = item.image.height;
    ctx.drawImage(item.image, -w / 2, -h / 2, w, h);
    
    ctx.restore();
  }
  
  // Draw bone gizmos if in edit mode
  if (showBones) {
    renderBoneGizmos(ctx, skeleton, worldTransforms, selectedBoneId, canvasCenter, zoom);
  }
}
```

**renderBoneGizmos Function:**
```javascript
function renderBoneGizmos(ctx, skeleton, worldTransforms, selectedBoneId, canvasCenter, zoom) {
  // Draw bone connections (parent-child lines)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  
  for (const bone of Object.values(skeleton.bones)) {
    if (bone.parent === null) continue;
    
    const parentTransform = worldTransforms[bone.parent];
    const boneTransform = worldTransforms[bone.id];
    
    const x1 = canvasCenter.x + parentTransform.position.x * zoom;
    const y1 = canvasCenter.y + parentTransform.position.y * zoom;
    const x2 = canvasCenter.x + boneTransform.position.x * zoom;
    const y2 = canvasCenter.y + boneTransform.position.y * zoom;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  // Draw bone circles
  for (const [boneId, worldTransform] of Object.entries(worldTransforms)) {
    const x = canvasCenter.x + worldTransform.position.x * zoom;
    const y = canvasCenter.y + worldTransform.position.y * zoom;
    
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    
    // Color based on selection
    if (boneId === selectedBoneId) {
      ctx.fillStyle = 'yellow';
      ctx.strokeStyle = 'orange';
    } else {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'gray';
    }
    
    ctx.fill();
    ctx.stroke();
  }
  
  // Draw transform handles for selected bone
  if (selectedBoneId && worldTransforms[selectedBoneId]) {
    renderTransformHandles(ctx, worldTransforms[selectedBoneId], canvasCenter, zoom);
  }
}
```

### User Interaction Handling

**Canvas Mouse Events:**

**Mouse Down:**
- Convert screen coordinates to world coordinates: `worldX = (screenX - canvasCenter.x) / zoom`
- Check if clicked on bone gizmo (within 8px radius of any bone position)
- If bone clicked: set as selected bone
- If transform handle clicked: start drag operation with handle type (position/rotation/scale)
- If empty space clicked with Space key held: start pan operation
- If empty space clicked without Space: deselect bone

**Mouse Move:**
- If panning: update canvas pan offset by mouse delta
- If dragging position handle: 
  - Update bone local position relative to parent
  - Recalculate world transforms
  - Re-render
- If dragging rotation handle:
  - Calculate angle from bone position to mouse position
  - Update bone local rotation
  - Recalculate and re-render
- If dragging scale handle:
  - Calculate distance from bone position to mouse position
  - Map to scale value (1.0 at 50px, 2.0 at 100px, etc.)
  - Update bone local scale
  - Recalculate and re-render

**Mouse Up:**
- End any active drag operation
- If animation frame modified, mark frame as dirty for save

**Mouse Wheel:**
- Adjust zoom level by 10% per wheel tick
- Clamp zoom between 0.1× and 5×
- Keep mouse world position constant (zoom toward cursor)

**Keyboard Events:**
- `Space`: Toggle play/pause animation
- `Left Arrow`: Previous frame
- `Right Arrow`: Next frame
- `Delete`: Remove part from selected bone
- `Ctrl+S`: Save project
- `Ctrl+Z`: Undo last change
- `Ctrl+C`: Copy current frame
- `Ctrl+V`: Paste frame to current frame
- `R`: Reset selected bone to default transform

### State Management

**ProjectContext Structure:**
```javascript
const ProjectContext = React.createContext({
  // Data
  skeletons: [],           // Available skeleton templates
  currentSkeleton: null,   // Active skeleton being edited
  partsLibrary: [],        // All available parts
  characters: [],          // Saved characters
  currentCharacter: null,  // Active character being edited
  animations: [],          // Saved animations
  currentAnimation: null,  // Active animation being edited
  
  // Editor State
  mode: 'builder',         // 'builder' or 'animator'
  selectedBoneId: null,
  currentFrame: 0,         // 0-3
  isPlaying: false,
  playbackSpeed: 1.0,
  currentTime: 0,
  
  // Canvas State
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  showGrid: true,
  showBones: true,
  
  // Actions
  setMode: (mode) => {},
  selectBone: (boneId) => {},
  assignPartToBone: (boneId, partId) => {},
  updateBoneTransform: (boneId, transform) => {},
  createNewAnimation: (name) => {},
  saveAnimation: (animation) => {},
  saveCharacter: (character) => {},
  loadCharacter: (characterId) => {},
  exportJSON: (type, data) => {},
  importJSON: (json) => {},
  playAnimation: () => {},
  pauseAnimation: () => {},
  setCurrentFrame: (frameIndex) => {},
  // ... more actions
});
```

**Context Provider Wrapper:**
```javascript
function ProjectProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  const actions = useMemo(() => ({
    selectBone: (boneId) => setState(s => ({ ...s, selectedBoneId: boneId })),
    assignPartToBone: (boneId, partId) => {
      setState(s => ({
        ...s,
        currentCharacter: {
          ...s.currentCharacter,
          parts: {
            ...s.currentCharacter.parts,
            [boneId]: partId
          }
        }
      }));
    },
    // ... implement all actions
  }), []);
  
  return (
    <ProjectContext.Provider value={{ ...state, ...actions }}>
      {children}
    </ProjectContext.Provider>
  );
}
```

### Image Loading and Caching

**ImageLoader Utility:**
```javascript
class ImageLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  async load(url) {
    // Return cached image if exists
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // Return existing promise if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }
    
    // Create new load promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
    
    this.loading.set(url, loadPromise);
    return loadPromise;
  }
  
  preloadParts(parts) {
    // Load all part images in parallel
    return Promise.all(
      parts.map(part => this.load(part.imageUrl))
    );
  }
}

const imageLoader = new ImageLoader();
export default imageLoader;
```

**Usage in Part Assignment:**
```javascript
async function assignPartToBone(boneId, partId) {
  const part = partsLibrary.find(p => p.id === partId);
  
  // Load image if not already loaded
  if (!part.image) {
    try {
      part.image = await imageLoader.load(part.imageUrl);
    } catch (error) {
      console.error(`Failed to load part image: ${part.name}`, error);
      // Show error to user
      return;
    }
  }
  
  // Assign part to character
  setCurrentCharacter(char => ({
    ...char,
    parts: { ...char.parts, [boneId]: partId }
  }));
}
```

### Validation and Error Handling

**Import Validation:**
```javascript
function validateCharacterJSON(json) {
  const errors = [];
  
  // Check structure
  if (!json.version) errors.push("Missing version field");
  if (!json.type || json.type !== "character") errors.push("Invalid or missing type");
  if (!json.data) errors.push("Missing data field");
  
  const data = json.data;
  
  // Check required fields
  if (!data.id) errors.push("Character missing id");
  if (!data.name) errors.push("Character missing name");
  if (!data.skeletonId) errors.push("Character missing skeletonId");
  if (!data.parts) errors.push("Character missing parts");
  
  // Check skeleton exists
  const skeleton = skeletons.find(s => s.id === data.skeletonId);
  if (!skeleton) {
    errors.push(`Skeleton not found: ${data.skeletonId}`);
  } else {
    // Check all part assignments reference valid bones
    for (const boneId of Object.keys(data.parts)) {
      if (!skeleton.bones[boneId]) {
        errors.push(`Invalid bone reference: ${boneId}`);
      }
    }
  }
  
  // Check all parts exist
  const missingParts = [];
  for (const partId of Object.values(data.parts)) {
    if (!partsLibrary.find(p => p.id === partId)) {
      missingParts.push(partId);
    }
  }
  
  if (missingParts.length > 0) {
    errors.push(`Missing parts: ${missingParts.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: missingParts.length > 0 ? ['Some parts are missing from library'] : []
  };
}
```

**Error Display:**
- Validation errors shown in modal dialog
- Each error listed with clear description
- Option to proceed with warnings (missing parts shown as red circles)
- Option to cancel import

## Style Guide

### Color Palette

**Background Colors:**
- Canvas background: `#2D2D2D` (dark gray)
- Panel backgrounds: `#1E1E1E` (darker gray)
- Toolbar background: `#252525`
- Dialog backgrounds: `#2A2A2A`

**UI Element Colors:**
- Primary buttons: `#4A90E2` (blue)
- Primary buttons hover: `#357ABD`
- Danger buttons: `#E24A4A` (red)
- Success buttons: `#4AE24A` (green)
- Text primary: `#FFFFFF` (white)
- Text secondary: `#AAAAAA` (light gray)
- Borders: `#3A3A3A`

**Gizmo Colors:**
- Selected bone: `#FFFF00` (yellow fill), `#FFA500` (orange outline)
- Unselected bone: `#FFFFFF` (white fill), `#888888` (gray outline)
- Child bone: `#00FF00` (green fill)
- Position handle: `#4A90E2` (blue)
- Rotation handle: `#4AE24A` (green)
- Scale handle: `#E24A4A` (red)

**Grid Colors:**
- Minor gridlines: `rgba(255, 255, 255, 0.1)`
- Major gridlines: `rgba(255, 255, 255, 0.2)`

### Typography

- **Font Family:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headers (H1):** 24px, bold, #FFFFFF
- **Headers (H2):** 18px, semi-bold, #FFFFFF
- **Headers (H3):** 16px, semi-bold, #FFFFFF
- **Body Text:** 14px, normal, #FFFFFF
- **Labels:** 12px, normal, #AAAAAA
- **Buttons:** 14px, semi-bold, #FFFFFF

### Component Styles

**Buttons:**
- Height: 36px
- Padding: 8px 16px
- Border radius: 4px
- Border: none
- Cursor: pointer
- Transition: background-color 0.2s

**Input Fields:**
- Height: 32px
- Padding: 6px 10px
- Background: `#333333`
- Border: 1px solid `#3A3A3A`
- Border radius: 3px
- Color: #FFFFFF
- Focus border: `#4A90E2`

**Dropdowns:**
- Same as input fields
- Arrow icon on right side
- Options list background: `#2A2A2A`
- Hover option background: `#3A3A3A`

**Panels:**
- Border right: 1px solid `#3A3A3A` (between panels)
- Padding: 16px
- Min width: 200px
- Overflow-y: auto
- Scrollbar width: 8px
- Scrollbar thumb: `#3A3A3A`

**Dialogs:**
- Width: 500px (export), 400px (errors)
- Padding: 24px
- Border radius: 8px
- Box shadow: `0 4px 20px rgba(0, 0, 0, 0.5)`
- Backdrop: `rgba(0, 0, 0, 0.7)`

## Testing Scenarios

### 1. Basic Character Assembly
1. Open application
2. Parts library shows default parts
3. Click torso part thumbnail
4. Torso appears on skeleton in canvas
5. Click arm part
6. Arm appears on left and right arm bones
7. Click head, leg, foot parts
8. Complete character visible
9. Parts render in correct layer order (back limbs behind torso, front limbs in front)

### 2. Part Swap
1. Assemble complete character with leather armor
2. Select torso bone
3. Change part dropdown to iron armor
4. Torso part instantly updates to iron armor
5. Other parts remain unchanged
6. Z-index maintained correctly

### 3. Transform Editing
1. Load character in Animation Editor
2. Select frame 1
3. Click arm_right bone
4. Drag position handle upward
5. Arm moves smoothly with mouse
6. Release mouse
7. Arm stays in new position
8. Drag rotation handle
9. Arm rotates around its pivot
10. Numerical inputs update to reflect changes

### 4. Animation Playback
1. Load walk cycle animation
2. Click play button
3. Animation loops smoothly at 4 FPS (100ms per frame)
4. Limbs interpolate between keyframes
5. Click pause
6. Animation stops mid-frame
7. Adjust speed slider to 2×
8. Click play
9. Animation runs at double speed

### 5. Frame Scrubbing
1. In Animation Editor with animation loaded
2. Click frame 1 in timeline
3. Character instantly shows frame 1 pose (no interpolation)
4. Click frame 3
5. Character jumps to frame 3 pose
6. Modify bone in frame 3
7. Click frame 1 again
8. Frame 1 unaffected by change to frame 3

### 6. Copy/Paste Frame
1. Set up interesting pose in frame 1
2. Click "Copy Frame"
3. Select frame 3
4. Click "Paste Frame"
5. Frame 3 now identical to frame 1
6. Modify frame 3
7. Frame 1 still shows original pose

### 7. Mirror Frame
1. Set up asymmetric pose (left arm up, right arm down)
2. Click "Mirror Frame"
3. Left and right limbs swap rotations/positions
4. Left arm now down, right arm now up
5. Torso and head remain centered

### 8. Export/Import Character
1. Create character with mix of parts
2. Click "Save Character"
3. Enter name "Test Warrior"
4. Click "Export Character"
5. JSON copied to clipboard
6. Create new empty character
7. Click "Load Character"
8. Paste JSON
9. Character reconstructed identically

### 9. Export/Import Animation
1. Create walk cycle with custom timing (100, 150, 100, 150 ms)
2. Export animation
3. Create new animation
4. Import exported JSON
5. Animation plays with exact same timing and transforms

### 10. Missing Parts Import
1. Export character
2. Delete one part from library (e.g., helmet)
3. Import character JSON
4. Error dialog appears: "Missing parts: part_helmet"
5. Option to proceed with placeholders
6. Click proceed
7. Character loads with red circle placeholder for missing part
8. Other parts render correctly

### 11. Procedural Generation
1. Click "Generate Random"
2. Character appears with random part selection
3. Name auto-generated: "Generated_Humanoid_A7F2"
4. Click generate again
5. Different character appears
6. Enter seed "12345"
7. Click generate
8. Note character appearance
9. Delete character and click generate with same seed
10. Identical character generated

### 12. Canvas Zoom/Pan
1. Middle mouse button drag
2. Canvas pans smoothly
3. Character position follows pan
4. Scroll mouse wheel up
5. Canvas zooms in (character and grid scale up)
6. Scroll down
7. Zoom out
8. Hold Space and drag mouse
9. Canvas pans (alternative pan method)

### 13. Grid Snapping
1. In Animation Editor
2. Drag bone without Shift key
3. Bone moves freely
4. Hold Shift
5. Drag bone
6. Bone snaps to grid intersections (32px increments)

### 14. Undo/Redo
1. Make transform change to bone
2. Make second transform change
3. Press Ctrl+Z
4. Second change undone
5. Press Ctrl+Z again
6. First change undone
7. Press Ctrl+Y
8. First change redone

### 15. Multi-Part Animation
1. Create attack animation
2. Frame 1: Sword (hand_right) rotated back (-90°)
3. Frame 2: Sword mid-swing (0°)
4. Frame 3: Sword forward (+90°)
5. Frame 4: Return to start
6. Play animation
7. Sword smoothly interpolates through swing arc

## Accessibility Requirements

**Keyboard Navigation:**
- All UI elements accessible via Tab key
- Tab order: left panel → canvas → right panel → toolbar
- Enter key activates buttons
- Arrow keys navigate lists
- Escape closes dialogs

**Screen Reader Support:**
- All buttons have aria-labels
- Parts have alt text with name and category
- Bone selections announced
- Transform value changes announced
- Error messages read aloud

**Visual Accessibility:**
- Minimum 4.5:1 contrast ratio for all text
- Focus indicators visible on all interactive elements (2px blue outline)
- Color not sole means of conveying information (use patterns + color)
- Option to increase UI font size in settings (14px, 16px, 18px)

**Motor Accessibility:**
- All drag operations have numerical input alternatives
- Click targets minimum 32×32 pixels
- Double-click not required for any actions
- Zoom controls accessible via keyboard (+/- keys)

## Performance Goals

**Rendering Performance:**
- 60 FPS animation playback with 1 character on screen
- 30+ FPS with 5 characters on screen
- <16ms frame time for render loop
- <50ms to calculate world transforms for 10-bone skeleton
- <100ms to load and apply character definition

**Memory Usage:**
- <50MB for application code
- <200MB for parts library with 100 parts (each ~200KB image)
- <1MB for all character/animation definitions
- Image cache evicts least-recently-used after 50 images

**Responsiveness:**
- <100ms response to user input (click, drag, keyboard)
- <200ms to switch modes (Builder ↔ Animator)
- <500ms to export large package (50 parts, 10 animations, 5 characters)

**Load Times:**
- <2 seconds initial application load
- <500ms to load character definition
- <1 second to preload all parts for character
- <300ms to import JSON file

## Extended Features (Optional Enhancements)

### Inverse Kinematics (IK)
- Two-bone IK solver for arm/leg chains
- User clicks target position, solver calculates bone angles
- Useful for "hand grabs object" or "foot on ground" scenarios
- Toggle IK on/off per bone chain

### Physics Simulation
- Cloth/cape physics using Verlet integration
- Ragdoll mode for death animations
- Gravity, wind, collision detection
- Bake physics simulation to keyframes

### Particle Effects
- Attach particle emitters to bones
- Effect types: dust, sparks, magic trails, blood
- Define emitter properties: rate, lifetime, color, size
- Preview effects in animation

### Advanced Animation Features
- More than 4 frames (extend to 8, 12, 16 for complex animations)
- Bezier curve easing between frames
- Animation layers (blend multiple animations)
- Animation events (trigger game actions at specific frames)

### Collaboration Features
- Export project as shareable link
- Multi-user editing with real-time sync
- Version history with restore points
- Comments/annotations on frames

### Asset Pipeline Integration
- Sprite atlas generation from parts
- Texture compression options
- Export to Unity, Godot, GameMaker formats
- Batch export multiple characters at once

---

## Runtime Integration Example

For game engines consuming exported JSON:

```javascript
// Example game engine integration
class PuppetCharacter {
  constructor(characterJSON, skeletonJSON, animationJSON) {
    this.character = characterJSON.data;
    this.skeleton = skeletonJSON.data;
    this.animation = animationJSON.data;
    this.currentTime = 0;
    this.parts = {};
    
    // Preload images
    this.loadParts();
  }
  
  async loadParts() {
    for (const [boneId, partId] of Object.entries(this.character.parts)) {
      const part = this.character.parts[boneId];
      this.parts[boneId] = await loadImage(part.imageUrl);
    }
  }
  
  update(deltaTime) {
    this.currentTime += deltaTime;
    
    // Loop animation
    const totalDuration = this.animation.frames.reduce((sum, f) => sum + f.duration, 0);
    if (this.currentTime >= totalDuration) {
      this.currentTime %= totalDuration;
    }
  }
  
  render(ctx) {
    // Calculate current frame data
    const frameData = getCurrentFrameData(this.animation, this.currentTime);
    
    // Interpolate transforms
    const interpolated = interpolateFrames(
      frameData.currentFrame,
      frameData.nextFrame,
      frameData.progress,
      this.skeleton
    );
    
    // Calculate world transforms
    const worldTransforms = calculateAllWorldTransforms(this.skeleton, interpolated);
    
    // Render character
    renderCharacter(ctx, this.character, this.skeleton, worldTransforms, this.parts);
  }
}

// Usage
const warrior = new PuppetCharacter(
  characterJSON,
  skeletonJSON,
  walkAnimationJSON
);

function gameLoop(deltaTime) {
  warrior.update(deltaTime);
  warrior.render(ctx);
}
```

---

## Implementation Checklist

**Phase 1 - Core Rendering:**
- [ ] Set up React project structure
- [ ] Implement skeleton data model
- [ ] Implement transform calculation functions
- [ ] Create Canvas component with basic rendering
- [ ] Test rendering with hardcoded character

**Phase 2 - Character Builder:**
- [ ] Create parts library UI
- [ ] Implement part assignment
- [ ] Add drag-and-drop support
- [ ] Create properties panel
- [ ] Add save/load character

**Phase 3 - Animation System:**
- [ ] Implement animation data model
- [ ] Create timeline UI
- [ ] Add bone transform editor
- [ ] Implement playback system
- [ ] Add interpolation

**Phase 4 - Editor Features:**
- [ ] Add zoom/pan controls
- [ ] Implement bone gizmos
- [ ] Add transform handles
- [ ] Create grid rendering
- [ ] Add keyboard shortcuts

**Phase 5 - Import/Export:**
- [ ] Implement JSON export
- [ ] Add import with validation
- [ ] Create export dialog
- [ ] Test round-trip (export then import)

**Phase 6 - Polish:**
- [ ] Add undo/redo
- [ ] Implement procedural generation
- [ ] Create sample assets
- [ ] Write documentation
- [ ] Performance optimization

---

This README provides complete specifications for implementing PuppetJSX. Any AI system or developer should be able to create a fully functional implementation following these guidelines exactly.
