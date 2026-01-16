# PHANTOM VECTOR: Anti-Gravity Time Trial Racing

## Description

PHANTOM VECTOR is a spiritual successor to WIPEOUT 2097, built as a browser-based 3D racing game using React, Three.js with Drei helpers, and Fabric.js for 2D overlay interfaces. The game captures the essence of 1990s anti-gravity racing with a distinctive wireframe + SVGA-shaded aesthetic, focusing exclusively on time trial gameplay without AI opponents.

Players pilot hovering anti-gravity racecars through futuristic tracks, competing against their own best times and ghost replays. The game features a complete track editor allowing players to create, share, and load custom tracks, with arcade-style leaderboards displaying the top three times after each race.

Key pillars: **Speed sensation through visual design**, **precise physics with forgiving collision**, **creative freedom through track editing**, and **authentic retro-futuristic aesthetic**.

---

## Functionality

### Core Game Loop

#### Race Mode (Time Trial)
1. Player selects a ship from the available roster
2. Player selects a track (default track or custom-loaded track)
3. Player selects speed class: **Vector** (beginner), **Venom** (intermediate), **Rapier** (hard), **Phantom** (expert)
4. 3-2-1 countdown initiates race
5. Player completes 3 laps (Vector/Venom) or 4 laps (Rapier/Phantom)
6. Upon completion, results screen displays:
   - Final time with lap breakdown
   - Comparison to best time (if exists)
   - Top 3 leaderboard for this track/class combination
7. Option to retry, return to menu, or enter track editor

#### Ship Selection
Five racing teams with distinct handling characteristics:

| Ship | Thrust | Top Speed | Turning | Shield | Visual Color |
|------|--------|-----------|---------|--------|--------------|
| **NOVA** | 6 | 3 | 7 | 6 | Cyan/White |
| **AXIOM** | 7 | 5 | 6 | 3 | Red/Black |
| **PULSE** | 5 | 6 | 5 | 5 | Green/Gold |
| **ZENITH** | 4 | 7 | 3 | 7 | Purple/Magenta |
| **VECTOR** | 8 | 8 | 8 | 4 | Orange/Chrome (unlockable) |

Stats are on a 1-10 scale affecting physics parameters:
- **Thrust**: Acceleration force multiplier (0.8 + stat * 0.04)
- **Top Speed**: Maximum velocity cap (200 + stat * 30 km/h equivalent units)
- **Turning**: Angular velocity multiplier (0.7 + stat * 0.05)
- **Shield**: Starting HP and collision resistance (50 + stat * 10 HP)

#### Speed Classes
| Class | Base Speed Multiplier | Lap Count | Unlock Requirement |
|-------|----------------------|-----------|-------------------|
| Vector | 1.0x | 3 | Default |
| Venom | 1.25x | 3 | Complete any Vector race |
| Rapier | 1.5x | 4 | Complete any Venom race |
| Phantom | 2.0x | 4 | Complete any Rapier race |

### Ship Physics and Controls

#### Anti-Gravity Hover System
Ships float above the track surface using a **four-point raycast system**:

```
Ship Bottom View:
    [FL]----[FR]
      |      |
      |  ◉   |  (◉ = center of mass)
      |      |
    [BL]----[BR]

FL = Front-Left raycast point
FR = Front-Right raycast point
BL = Back-Left raycast point
BR = Back-Right raycast point
```

Each raycast:
1. Fires downward from ship corner
2. Detects distance to track surface (max range: 5 units)
3. Calculates spring force: `F = springConstant * (targetHeight - currentHeight) - damping * verticalVelocity`
4. Applies force at that corner, creating natural pitch/roll response

**Physics Constants:**
- Target hover height: 1.5 units
- Spring constant: 500
- Damping coefficient: 50
- Gravity (grounded): 15 units/s²
- Gravity (airborne): 25 units/s²
- Gravity transition lerp: 0.1 per frame

#### Control Scheme

**Keyboard Controls:**
| Key | Action |
|-----|--------|
| W / Up Arrow | Accelerate (thrust) |
| S / Down Arrow | Brake (reverse thrust at 30% power) |
| A / Left Arrow | Steer left |
| D / Right Arrow | Steer right |
| Q | Left airbrake (turn assist + speed reduction) |
| E | Right airbrake (turn assist + speed reduction) |
| Space | Nose up (pitch control) |
| Shift | Nose down (pitch control) |
| R | Reset to last checkpoint |
| Escape | Pause menu |

**Gamepad Controls (if detected):**
| Input | Action |
|-------|--------|
| Left Stick X | Steering |
| Right Trigger | Accelerate |
| Left Trigger | Brake |
| Left Bumper | Left airbrake |
| Right Bumper | Right airbrake |
| Left Stick Y | Pitch control |
| A/Cross | Reset to checkpoint |
| Start | Pause menu |

#### Airbrake Mechanics
Airbrakes are the primary cornering tool:
- **Left Airbrake (Q)**: Applies leftward torque + 15% speed reduction
- **Right Airbrake (E)**: Applies rightward torque + 15% speed reduction
- **Both Airbrakes**: 30% speed reduction, no torque (emergency brake)

Airbrake torque formula: `torque = airbrakeStrength * shipTurning * speedFactor`
Where `speedFactor = clamp(currentSpeed / maxSpeed, 0.3, 1.0)`

#### Pitch Control
- **Nose Up (Space)**: Raises front of ship, useful for:
  - Softening landings after jumps
  - Preventing "bottoming out" on track peaks
  - Slightly increases air resistance (minor speed loss)
- **Nose Down (Shift)**: Lowers front of ship, useful for:
  - Entering tunnels after jumps
  - Increasing downforce for stability
  - Causes "bottoming out" if too aggressive

### Collision System

#### Wall Collisions
When ship contacts track walls:
1. Apply **bounce vector** perpendicular to wall surface
2. Reduce speed by **5%** of current velocity
3. Deduct **5 HP** from shield
4. Play spark particle effect at contact point
5. Play metallic scrape sound effect
6. Apply weak steering force back toward track center

Wall collision physics:
```javascript
bounceDirection = reflect(velocity, wallNormal);
newVelocity = bounceDirection * 0.95; // 5% speed loss
steeringCorrection = cross(wallNormal, up) * 0.1; // Gentle redirect
```

Ships should **never** stop dead against walls—always slide/scrape along.

#### Track Edge Behavior
If ship goes beyond track boundaries (off the edge):
1. Trigger 2-second "RECOVERY" state
2. Ship fades to 50% opacity
3. Respawn at last valid track position
4. 3-second time penalty added
5. Shield reduced by 20 HP

#### Floor Collision (Bottoming Out)
When ship's center point contacts track surface:
1. Apply strong upward bounce force
2. Reduce speed by **15%**
3. Deduct **10 HP** from shield
4. Camera shake effect (0.3 seconds)
5. Metallic impact sound

### Shield/HP System

**Shield Bar**: Displayed in HUD, starts at value determined by ship stats (90-150 HP)

**Damage Sources:**
| Event | HP Loss |
|-------|---------|
| Wall scrape | 5 HP |
| Hard wall impact (>50% speed) | 15 HP |
| Bottoming out | 10 HP |
| Track edge fall | 20 HP |

**Low Shield Warning**: At 25% HP, play voice clip "Shield energy low" and flash shield bar red

**Shield Depletion**: At 0 HP:
1. Ship explodes (particle effect)
2. 5-second respawn timer
3. Respawn at pit lane entrance with 50% shields
4. Time penalty: 5 seconds added

### Pit Lane System

Each track has one designated **pit lane** section:
- Visually distinct: glowing red floor panels, side barriers with "PIT" text
- Entering pit lane triggers **regeneration mode**:
  - Shield regenerates at 30 HP/second while in pit lane
  - Speed capped at 50% of current class maximum
  - Cannot use boost/acceleration beyond cap
- Exiting pit lane returns normal physics
- Strategic decision: time lost vs. shield gained

Pit lane placement: Typically near start/finish line, accessed via alternate route fork

### Timing and Leaderboards

#### Lap Timing
- Timer starts when ship crosses start/finish line after countdown
- Lap times recorded at each start/finish crossing
- **Sector splits**: Track divided into 3 sectors with checkpoint times
- Display delta to best lap: green (ahead), red (behind)

#### Ghost Replay System
After completing a race:
1. If new best time, ghost replay data saved
2. Ghost appears as semi-transparent (30% opacity) wireframe ship
3. Ghost follows exact recorded path with recorded inputs
4. Ghost data structure:
```javascript
ghostFrame = {
  timestamp: float,      // Time since race start (ms)
  position: {x, y, z},   // World position
  rotation: {x, y, z, w},// Quaternion rotation
  speed: float           // For visual reference
}
// Record at 20 FPS, interpolate on playback
```

#### Leaderboard Storage
Store in browser localStorage:
```javascript
leaderboard = {
  trackId: {
    speedClass: [
      { name: "AAA", time: 45230, date: "2024-01-15" }, // time in ms
      { name: "BBB", time: 46100, date: "2024-01-14" },
      { name: "CCC", time: 47500, date: "2024-01-13" }
    ]
  }
}
```
- Prompt for 3-character initials on new top-3 time
- Display top 3 on results screen with animated reveal

---

## Track Editor

### Editor Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [File▼] [Edit▼] [View▼] [Test▼]    Track: Untitled*   │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│  TOOLBOX    │                                               │
│  ─────────  │                                               │
│  [Select]   │            3D VIEWPORT                        │
│  [Move]     │                                               │
│  [Rotate]   │         (Orthographic or Perspective)         │
│  [Scale]    │                                               │
│  ─────────  │                                               │
│  PIECES     │                                               │
│  ─────────  │                                               │
│  [Straight] │                                               │
│  [Curve L]  │                                               │
│  [Curve R]  │                                               │
│  [Hill Up]  │                                               │
│  [Hill Dn]  │                                               │
│  [Jump]     │                                               │
│  [Tunnel]   │                                               │
│  [Pit Lane] │                                               │
│  [Chicane]  │                                               │
│  ─────────  │                                               │
│  PROPS      │                                               │
│  ─────────  │                                               │
│  [Speed Pad]│                                               │
│  [Barrier]  │                                               │
│  [Light]    │                                               │
│             │                                               │
├─────────────┴───────────────────────────────────────────────┤
│ Properties: [Width: 20] [Bank: 0°] [Texture: Grid]    │
└─────────────────────────────────────────────────────────────┘
```

### Track Piece System

Tracks are built from **modular pieces** that snap together:

#### Piece Types

**STRAIGHT**: Flat track section
- Length: 10/20/40 units (selectable)
- Width: 15-30 units (adjustable)
- Can apply banking: -45° to +45°

**CURVE_LEFT / CURVE_RIGHT**: 90° turn segment
- Radius: Small (20u), Medium (40u), Large (60u)
- Width: 15-30 units
- Auto-banking option: applies appropriate tilt

**HILL_UP / HILL_DOWN**: Elevation change
- Rise/fall: 5/10/15 units
- Length: 20/30/40 units
- Smooth spline interpolation at connections

**JUMP**: Ramp section
- Launch angle: 15°/30°/45°
- Landing distance: calculated automatically
- Must connect to valid landing piece

**TUNNEL**: Enclosed section
- Same variants as STRAIGHT/CURVE
- Adds ceiling geometry
- Reduced ambient light inside

**PIT_LANE**: Regeneration zone (exactly one required)
- Fixed length: 40 units
- Branches from main track and rejoins
- Red floor texture, "PIT" signage

**CHICANE**: S-curve combination
- Pre-built left-right or right-left
- Tight (racing line challenge) or wide (speed-focused)

#### Piece Connection Rules
- Each piece has **entry** and **exit** connection points
- Connection points have position + rotation
- Pieces snap when entry point within 2 units of another exit point
- Invalid connections highlighted in red:
  - Pieces overlapping/intersecting
  - Entry connected to entry (must be exit→entry)
  - Gap too large (>5 units)

### Editor Controls

**Mouse:**
| Action | Function |
|--------|----------|
| Left Click | Select piece / Place piece from toolbox |
| Right Click + Drag | Orbit camera |
| Middle Click + Drag | Pan camera |
| Scroll Wheel | Zoom in/out |
| Shift + Left Click | Multi-select pieces |

**Keyboard:**
| Key | Function |
|-----|----------|
| Delete | Remove selected piece(s) |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+S | Save track |
| Ctrl+O | Load track |
| G | Toggle grid snap |
| R | Rotate selected 90° |
| F | Focus camera on selection |
| 1/2/3/4 | Top/Front/Side/Perspective view |
| T | Test play from start |

### Track Validation

Before saving/testing, validate:
1. **Circuit Complete**: Track forms closed loop (exit connects to entry of first piece)
2. **Has Start/Finish**: Exactly one START piece placed
3. **Has Pit Lane**: Exactly one PIT_LANE piece placed
4. **No Overlaps**: No pieces intersecting
5. **Minimum Length**: At least 10 pieces
6. **Driveable**: AI pathfinding can complete circuit (simple raycast test)

Validation errors displayed in modal with piece highlighting.

### Track Data Format

```javascript
trackData = {
  metadata: {
    id: "uuid-string",
    name: "Track Name",
    author: "Player Name",
    created: "ISO-date",
    modified: "ISO-date",
    thumbnail: "base64-png",  // Auto-generated preview
    bestTimes: {}             // Embedded leaderboard
  },
  environment: {
    skybox: "cyber_night",    // Preset name
    groundTexture: "grid_blue",
    ambientColor: "#1a1a2e",
    fogDensity: 0.02,
    fogColor: "#0a0a1e"
  },
  pieces: [
    {
      id: "piece-uuid",
      type: "STRAIGHT",
      position: {x: 0, y: 0, z: 0},
      rotation: {x: 0, y: 0, z: 0},
      params: {
        length: 20,
        width: 20,
        banking: 0,
        texture: "default"
      },
      connections: {
        entry: "piece-uuid-prev",
        exit: "piece-uuid-next"
      }
    }
    // ... more pieces
  ],
  props: [
    {
      type: "SPEED_PAD",
      position: {x: 10, y: 0.1, z: 0},
      rotation: {y: 0}
    }
    // ... more props
  ],
  spawnPoint: {
    position: {x: 0, y: 2, z: 0},
    rotation: {y: 0}
  }
}
```

### Import/Export

**Export**: Download as `.pvt` file (JSON with custom extension)
**Import**: Load `.pvt` file, validate, add to track list
**Share**: Generate shareable code (base64 compressed JSON)

---

## Technical Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Screens   │  │   State     │  │    Services     │ │
│  │  ─────────  │  │  ─────────  │  │  ─────────────  │ │
│  │  MainMenu   │  │  GameStore  │  │  PhysicsEngine  │ │
│  │  RaceView   │  │  EditorStore│  │  AudioManager   │ │
│  │  EditorView │  │  SettingsStr│  │  InputManager   │ │
│  │  Results    │  │             │  │  StorageService │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              Three.js / Drei Layer               │   │
│  │  ─────────────────────────────────────────────   │   │
│  │  Canvas → Scene → Camera → Renderer              │   │
│  │  Ship3D, Track3D, Environment3D, Effects         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              Fabric.js HUD Layer                 │   │
│  │  ─────────────────────────────────────────────   │   │
│  │  Speed, Lap, Timer, Shield, Minimap, Messages    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Structure

```
src/
├── components/
│   ├── game/
│   │   ├── Ship.jsx           # 3D ship with physics
│   │   ├── Track.jsx          # Track geometry renderer
│   │   ├── Environment.jsx    # Skybox, ground, fog
│   │   ├── Ghost.jsx          # Ghost replay renderer
│   │   ├── Effects.jsx        # Particles, sparks, bloom
│   │   └── Camera.jsx         # Chase camera with smoothing
│   ├── hud/
│   │   ├── HUD.jsx            # Fabric.js canvas container
│   │   ├── Speedometer.jsx    # Digital speed display
│   │   ├── LapTimer.jsx       # Lap/sector times
│   │   ├── ShieldBar.jsx      # HP bar with warnings
│   │   ├── Minimap.jsx        # Track overview with position
│   │   └── Messages.jsx       # Countdown, warnings, results
│   ├── editor/
│   │   ├── EditorCanvas.jsx   # 3D editing viewport
│   │   ├── Toolbox.jsx        # Piece selection panel
│   │   ├── Properties.jsx     # Selected piece properties
│   │   ├── PiecePreview.jsx   # Ghost piece for placement
│   │   └── ValidationPanel.jsx# Error/warning display
│   └── screens/
│       ├── MainMenu.jsx       # Title, navigation
│       ├── ShipSelect.jsx     # Ship/class selection
│       ├── TrackSelect.jsx    # Track browser
│       ├── RaceScreen.jsx     # Game container
│       ├── ResultsScreen.jsx  # Times, leaderboard
│       └── EditorScreen.jsx   # Editor container
├── hooks/
│   ├── usePhysics.js          # Physics simulation hook
│   ├── useInput.js            # Keyboard/gamepad input
│   ├── useAudio.js            # Sound effect management
│   └── useGhost.js            # Ghost recording/playback
├── stores/
│   ├── gameStore.js           # Zustand game state
│   ├── editorStore.js         # Editor state
│   └── settingsStore.js       # User preferences
├── services/
│   ├── physics.js             # Physics calculations
│   ├── trackGenerator.js      # Piece → geometry
│   ├── storage.js             # localStorage wrapper
│   └── audio.js               # Howler.js integration
├── data/
│   ├── ships.js               # Ship definitions
│   ├── tracks/                # Default track JSONs
│   └── pieces.js              # Piece type definitions
└── utils/
    ├── math.js                # Vector/quaternion helpers
    ├── spline.js              # Catmull-Rom interpolation
    └── validation.js          # Track validation logic
```

### Physics Implementation

#### Main Loop (60 FPS fixed timestep)

```javascript
const FIXED_TIMESTEP = 1/60;
let accumulator = 0;

function gameLoop(deltaTime) {
  accumulator += deltaTime;
  
  while (accumulator >= FIXED_TIMESTEP) {
    // 1. Read input state
    const input = inputManager.getState();
    
    // 2. Apply forces based on input
    applyThrust(input.accelerate, input.brake);
    applySteering(input.steerX, input.leftAirbrake, input.rightAirbrake);
    applyPitch(input.pitchUp, input.pitchDown);
    
    // 3. Calculate hover forces (4-point raycast)
    calculateHoverForces();
    
    // 4. Apply gravity (lerped based on grounded state)
    applyGravity();
    
    // 5. Integrate velocity → position
    integratePhysics(FIXED_TIMESTEP);
    
    // 6. Detect and resolve collisions
    handleCollisions();
    
    // 7. Update game state (lap detection, shield, etc.)
    updateGameState();
    
    accumulator -= FIXED_TIMESTEP;
  }
  
  // Interpolate visual position for smooth rendering
  const alpha = accumulator / FIXED_TIMESTEP;
  interpolateVisuals(alpha);
}
```

#### Ship Physics State

```javascript
shipState = {
  // Transform
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  rotation: new THREE.Quaternion(),
  angularVelocity: new THREE.Vector3(),
  
  // Derived
  speed: 0,                    // Magnitude of velocity
  isGrounded: false,           // All 4 raycasts hit
  groundNormal: new THREE.Vector3(0, 1, 0),
  
  // Stats
  shield: 100,
  currentLap: 0,
  lapTimes: [],
  sectorTimes: [],
  
  // State flags
  isRecovering: false,
  inPitLane: false,
  hasFinished: false
}
```

#### Raycast Hover Calculation

```javascript
function calculateHoverForces() {
  const raycastPoints = [
    new THREE.Vector3(-1, 0, 1.5),   // Front-left
    new THREE.Vector3(1, 0, 1.5),    // Front-right
    new THREE.Vector3(-1, 0, -1.5),  // Back-left
    new THREE.Vector3(1, 0, -1.5)    // Back-right
  ];
  
  let groundedCount = 0;
  const totalForce = new THREE.Vector3();
  const totalTorque = new THREE.Vector3();
  
  raycastPoints.forEach((localPoint, index) => {
    // Transform to world space
    const worldPoint = localPoint.clone()
      .applyQuaternion(ship.rotation)
      .add(ship.position);
    
    // Raycast downward
    const ray = new THREE.Raycaster(
      worldPoint,
      new THREE.Vector3(0, -1, 0),
      0,
      5  // Max hover height
    );
    
    const hits = ray.intersectObjects(trackColliders);
    
    if (hits.length > 0) {
      groundedCount++;
      const distance = hits[0].distance;
      const surfaceNormal = hits[0].face.normal;
      
      // Spring-damper force
      const displacement = TARGET_HOVER_HEIGHT - distance;
      const springForce = SPRING_CONSTANT * displacement;
      const dampingForce = DAMPING * -ship.velocity.y;
      const hoverForce = Math.max(0, springForce + dampingForce);
      
      // Apply at raycast point (creates torque)
      const forceVector = surfaceNormal.clone().multiplyScalar(hoverForce);
      totalForce.add(forceVector);
      
      // Calculate torque from force application point
      const leverArm = localPoint.clone();
      const torque = leverArm.cross(forceVector);
      totalTorque.add(torque);
    }
  });
  
  ship.isGrounded = groundedCount >= 3;
  ship.velocity.add(totalForce.multiplyScalar(FIXED_TIMESTEP));
  ship.angularVelocity.add(totalTorque.multiplyScalar(FIXED_TIMESTEP * 0.1));
}
```

### Three.js Scene Setup

```javascript
function createScene() {
  // Renderer with wireframe-friendly settings
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Scene with fog for depth
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1e);
  scene.fog = new THREE.FogExp2(0x0a0a1e, 0.015);
  
  // Lighting for SVGA shading effect
  const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 100, 50);
  
  // Hemisphere light for better wireframe visibility
  const hemiLight = new THREE.HemisphereLight(0x6060ff, 0x202040, 0.6);
  
  scene.add(ambientLight, directionalLight, hemiLight);
  
  return { renderer, scene };
}
```

### Ship Mesh with Wireframe + Solid Shading

```javascript
function createShipMesh(shipData) {
  const group = new THREE.Group();
  
  // Base geometry (low-poly angular design)
  const geometry = new THREE.BufferGeometry();
  // Vertices define angular, faceted ship shape
  // ~100-200 triangles for authentic PSX look
  
  // Solid shaded material (SVGA style)
  const solidMaterial = new THREE.MeshStandardMaterial({
    color: shipData.primaryColor,
    metalness: 0.7,
    roughness: 0.3,
    flatShading: true  // Critical for faceted look
  });
  
  // Wireframe overlay
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: shipData.wireframeColor,
    linewidth: 1,
    transparent: true,
    opacity: 0.8
  });
  
  const solidMesh = new THREE.Mesh(geometry, solidMaterial);
  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    wireframeMaterial
  );
  
  group.add(solidMesh);
  group.add(wireframe);
  
  // Engine glow (emissive plane at back)
  const engineGlow = createEngineGlow(shipData.engineColor);
  group.add(engineGlow);
  
  return group;
}
```

### Fabric.js HUD Implementation

```javascript
function initHUD(canvasElement) {
  const canvas = new fabric.Canvas(canvasElement, {
    selection: false,
    renderOnAddRemove: false,
    skipTargetFind: true
  });
  
  // Speed display (digital readout)
  const speedText = new fabric.Text('000', {
    left: 50,
    top: canvas.height - 80,
    fontFamily: 'Eurostile, monospace',
    fontSize: 48,
    fill: '#00ffff',
    shadow: '0 0 10px #00ffff'
  });
  
  const speedLabel = new fabric.Text('KM/H', {
    left: 50,
    top: canvas.height - 35,
    fontFamily: 'Eurostile, monospace',
    fontSize: 16,
    fill: '#00ffff80'
  });
  
  // Shield bar
  const shieldBarBg = new fabric.Rect({
    left: canvas.width - 220,
    top: canvas.height - 50,
    width: 200,
    height: 20,
    fill: '#1a1a2e',
    stroke: '#00ffff40',
    strokeWidth: 1
  });
  
  const shieldBarFill = new fabric.Rect({
    left: canvas.width - 218,
    top: canvas.height - 48,
    width: 196,
    height: 16,
    fill: '#00ff88'
  });
  
  // Lap counter
  const lapText = new fabric.Text('LAP 1/3', {
    left: canvas.width / 2,
    top: 30,
    originX: 'center',
    fontFamily: 'Eurostile, monospace',
    fontSize: 24,
    fill: '#ffffff'
  });
  
  // Timer display
  const timerText = new fabric.Text('0:00.000', {
    left: canvas.width / 2,
    top: 60,
    originX: 'center',
    fontFamily: 'Eurostile, monospace',
    fontSize: 32,
    fill: '#ffff00'
  });
  
  canvas.add(speedText, speedLabel, shieldBarBg, shieldBarFill, lapText, timerText);
  
  return {
    canvas,
    updateSpeed: (speed) => {
      speedText.set('text', String(Math.floor(speed)).padStart(3, '0'));
    },
    updateShield: (percent) => {
      const width = 196 * (percent / 100);
      shieldBarFill.set('width', width);
      shieldBarFill.set('fill', percent < 25 ? '#ff4444' : '#00ff88');
    },
    updateLap: (current, total) => {
      lapText.set('text', `LAP ${current}/${total}`);
    },
    updateTimer: (ms) => {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      const millis = ms % 1000;
      timerText.set('text', `${mins}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`);
    },
    render: () => canvas.renderAll()
  };
}
```

### Camera System

```javascript
function createChaseCamera(ship) {
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  
  // Camera offset relative to ship
  const offset = new THREE.Vector3(0, 3.5, -10.8);
  const lookAtOffset = new THREE.Vector3(0, 1, 25);
  
  const smoothPosition = new THREE.Vector3();
  const smoothLookAt = new THREE.Vector3();
  
  function update(deltaTime) {
    // Target position in world space
    const targetPosition = offset.clone()
      .applyQuaternion(ship.rotation)
      .add(ship.position);
    
    const targetLookAt = lookAtOffset.clone()
      .applyQuaternion(ship.rotation)
      .add(ship.position);
    
    // Smooth follow with speed-dependent lag
    const followSpeed = 0.1 - (ship.speed / 1000) * 0.03;
    smoothPosition.lerp(targetPosition, followSpeed);
    smoothLookAt.lerp(targetLookAt, followSpeed * 1.5);
    
    camera.position.copy(smoothPosition);
    camera.lookAt(smoothLookAt);
    
    // FOV increase with speed (sense of velocity)
    const targetFOV = 75 + (ship.speed / 10);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1);
    camera.updateProjectionMatrix();
  }
  
  return { camera, update };
}
```

### State Management (Zustand)

```javascript
// stores/gameStore.js
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu', // menu | shipSelect | racing | paused | results | editor
  selectedShip: null,
  selectedTrack: null,
  speedClass: 'Vector',
  
  // Race state
  raceTime: 0,
  currentLap: 0,
  lapTimes: [],
  shield: 100,
  position: { x: 0, y: 0, z: 0 },
  
  // Actions
  setGameState: (state) => set({ gameState: state }),
  selectShip: (shipId) => set({ selectedShip: shipId }),
  selectTrack: (trackId) => set({ selectedTrack: trackId }),
  setSpeedClass: (speedClass) => set({ speedClass }),
  
  startRace: () => set({
    gameState: 'racing',
    raceTime: 0,
    currentLap: 0,
    lapTimes: [],
    shield: get().selectedShip?.baseShield || 100
  }),
  
  completeLap: (lapTime) => set((state) => ({
    currentLap: state.currentLap + 1,
    lapTimes: [...state.lapTimes, lapTime]
  })),
  
  damageShield: (amount) => set((state) => ({
    shield: Math.max(0, state.shield - amount)
  })),
  
  finishRace: () => {
    const { lapTimes, selectedTrack, speedClass } = get();
    const totalTime = lapTimes.reduce((a, b) => a + b, 0);
    // Save to leaderboard
    saveToLeaderboard(selectedTrack, speedClass, totalTime);
    set({ gameState: 'results' });
  }
}));
```

---

## Style Guide

### Visual Design Language

#### The Wireframe + SVGA Aesthetic

All 3D objects combine two rendering passes:
1. **Solid shaded mesh**: Flat-shaded polygons with metallic materials
2. **Wireframe overlay**: Slightly transparent edge lines in accent color

This creates the distinctive "technical blueprint meets gaming" look of 90s 3D.

#### Color Palette

**Primary Colors:**
- Background/Void: `#0a0a1e` (near-black blue)
- Primary Cyan: `#00ffff` (HUD, FEISAR-style ships)
- Hot Magenta: `#ff00ff` (warnings, Qirex-style)
- Electric Yellow: `#ffff00` (timers, speed)
- Neon Green: `#00ff88` (health, positive states)
- Warning Red: `#ff4444` (damage, low shield)

**Ship Team Colors:**
- NOVA: `#00ffff` primary, `#ffffff` accent
- AXIOM: `#ff2222` primary, `#000000` accent
- PULSE: `#00ff44` primary, `#ffcc00` accent
- ZENITH: `#aa00ff` primary, `#ff00aa` accent
- VECTOR: `#ff8800` primary, `#cccccc` accent

#### Typography

**Primary Font**: Eurostile Extended (or fallback to `'Courier New', monospace`)
- HUD elements: Bold, tracking +2%
- Menu text: Regular weight
- Timer/speed: Bold, tabular figures

**Sizing:**
- Speed readout: 48px
- Lap timer: 32px
- Labels: 16px
- Menu items: 24px

#### Visual Effects

**Speed Lines**: At high speeds (>80% max), render subtle radial blur lines from screen edges

**Bloom**: Apply subtle bloom (0.3 intensity) to bright elements (ship engines, speed pads, HUD text)

**Scanlines** (optional toggle): 1px dark lines every 3px for CRT effect

**Screen Shake**: On collision/bottoming out, 0.3s shake with decreasing amplitude

### HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│              LAP 2/3                                        │
│           1:23.456                                          │
│                                       ┌─────────┐           │
│                                       │ MINIMAP │           │
│                                       │    ◉    │           │
│                                       └─────────┘           │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│  ╔═══════════╗                      SHIELD ████████░░       │
│  ║    247    ║                                              │
│  ║   KM/H    ║                      BEST LAP: 0:41.234      │
│  ╚═══════════╝                      DELTA: -0.456           │
└─────────────────────────────────────────────────────────────┘
```

### Menu Design

Menus use full-screen dark backgrounds with centered content:
- Animated wireframe ship rotating slowly in background
- Menu items as horizontal bars with hover highlight
- Selection creates "scan line" animation across item
- Transitions use horizontal wipe effect

---

## Testing Scenarios

### Physics Tests

1. **Hover Stability**: Ship placed on flat track should stabilize at target height within 1 second
2. **Banking Response**: Ship on 45° banked track should tilt to match within 0.5 seconds
3. **Wall Collision**: Ship at 50% speed hitting wall at 45° should bounce away, lose 5% speed, take 5 damage
4. **Airbrake Turn**: Full left airbrake at max speed should rotate ship 90° within 2 seconds
5. **Jump Landing**: Ship hitting jump at full speed, nose-up, should land without bottoming out
6. **Pit Lane Regen**: Shield at 50% entering pit lane should reach 100% in ~1.7 seconds

### Race Flow Tests

1. **Lap Detection**: Crossing finish line increments lap counter correctly
2. **Sector Timing**: Passing sector markers records split times
3. **Ghost Recording**: Complete 1 lap, ghost replay matches path within 0.1 unit tolerance
4. **Leaderboard Save**: New best time correctly saves and displays in top 3
5. **Speed Class Unlock**: Completing Vector race unlocks Venom class

### Track Editor Tests

1. **Piece Placement**: Click toolbox piece, click viewport places piece at cursor
2. **Piece Snapping**: Placing piece near existing exit snaps to connection
3. **Validation - Incomplete**: Open circuit shows "Track not closed" error
4. **Validation - No Pit**: Track without pit lane shows "Missing pit lane" error
5. **Save/Load**: Save track, reload page, load track matches original

### Performance Tests

1. **60 FPS Sustained**: Race with full track renders at 60 FPS on mid-range GPU
2. **Physics Consistency**: 100 identical races produce identical times (deterministic)
3. **Memory Stable**: 10-minute session shows no memory growth beyond initial load

---

## Accessibility Requirements

### Visual Accessibility

1. **Color Blind Modes**: 
   - Deuteranopia: Replace green with blue
   - Protanopia: Replace red with yellow
   - High Contrast: White wireframes on black, no gradients

2. **Text Scaling**: HUD text respects browser font size (rem units)

3. **Reduced Motion**: Option to disable:
   - Screen shake
   - Speed lines
   - Background animations

### Input Accessibility

1. **Fully Keyboard Navigable**: All menus accessible via arrow keys + Enter
2. **Remappable Controls**: All game controls can be rebound
3. **Input Timing Tolerance**: Menus accept 300ms hold as single press (tremor accommodation)

### Audio Accessibility

1. **Separate Volume Controls**: Master, Music, SFX, Voice independently adjustable
2. **Visual Audio Cues**: Optional flashing indicators for:
   - Low shield warning
   - Lap completion
   - Collision events

---

## Performance Goals

### Frame Rate Targets

- **Minimum**: 30 FPS on integrated graphics (Intel UHD 620)
- **Target**: 60 FPS on discrete GPU (GTX 1060 equivalent)
- **High**: 120+ FPS on modern GPU with high refresh displays

### Load Times

- **Initial Load**: < 5 seconds (shows loading bar after 1 second)
- **Track Load**: < 2 seconds for default tracks
- **Custom Track Load**: < 3 seconds for max-size custom tracks

### Memory Budget

- **Base Application**: < 150 MB
- **Per Track**: < 50 MB additional
- **Total Cap**: 400 MB including all assets

### Network (Future)

- **Leaderboard Sync**: < 500ms for top 100 times
- **Track Share**: < 2 seconds for average track upload/download

---

## Extended Features (Future Phases)

### Phase 2: Multiplayer Ghost Racing
- Real-time ghost sharing
- Asynchronous competitions
- Weekly challenges with global leaderboards

### Phase 3: AI Opponents
- Rubber-band difficulty AI
- 8-ship races
- Championship mode

### Phase 4: Weapons System
- Offensive weapons (missiles, plasma)
- Defensive items (shields, mines)
- Speed pads and turbo pickups

### Phase 5: VR Support
- WebXR integration
- Cockpit view camera
- Motion controller steering option

---

## Data Models

### Ship Definition

```typescript
interface Ship {
  id: string;
  name: string;
  team: string;
  stats: {
    thrust: number;      // 1-10
    topSpeed: number;    // 1-10
    turning: number;     // 1-10
    shield: number;      // 1-10
  };
  colors: {
    primary: string;     // Hex color
    secondary: string;   // Hex color
    wireframe: string;   // Hex color
    engine: string;      // Hex color
  };
  unlockCondition: string | null;
  geometry: string;      // Path to geometry JSON
}
```

### Track Definition

```typescript
interface Track {
  metadata: TrackMetadata;
  environment: EnvironmentSettings;
  pieces: TrackPiece[];
  props: TrackProp[];
  spawnPoint: Transform;
  checkpoints: Checkpoint[];
  pitLane: PitLaneConfig;
}

interface TrackMetadata {
  id: string;
  name: string;
  author: string;
  created: string;
  modified: string;
  thumbnail: string;
  difficulty: 'Vector' | 'Venom' | 'Rapier' | 'Phantom';
  length: number;        // Approximate in units
  bestTimes: Record<SpeedClass, LeaderboardEntry[]>;
}

interface TrackPiece {
  id: string;
  type: PieceType;
  position: Vector3;
  rotation: Euler;
  params: PieceParams;
  connections: {
    entry: string | null;
    exit: string | null;
  };
}

interface LeaderboardEntry {
  initials: string;      // 3 characters
  time: number;          // Milliseconds
  date: string;          // ISO date
  ghostData?: string;    // Compressed ghost replay
}
```

### Ghost Replay Format

```typescript
interface GhostReplay {
  shipId: string;
  trackId: string;
  speedClass: SpeedClass;
  totalTime: number;
  frames: GhostFrame[];
}

interface GhostFrame {
  t: number;             // Timestamp (ms)
  p: [number, number, number];  // Position (x, y, z)
  r: [number, number, number, number];  // Rotation quaternion
  s: number;             // Speed (for display)
}
// Compressed: ~3-4 KB per minute of racing
```

---

## Error Handling

### Runtime Errors

| Error | Handling |
|-------|----------|
| WebGL not supported | Show fallback message with browser recommendations |
| Gamepad disconnected | Pause game, show reconnect prompt, fall back to keyboard |
| localStorage full | Warn user, offer to delete old saves |
| Track validation fail | Highlight invalid pieces, prevent race start |
| Physics NaN | Reset ship to last checkpoint, log error |

### User Input Errors

| Error | Handling |
|-------|----------|
| Invalid track file | Show "Invalid track format" toast, reject import |
| Empty name field | Highlight field, prevent save |
| Duplicate track name | Append number, warn user |

---

## Audio Specifications

### Sound Effects

| Event | Sound Type | Duration |
|-------|------------|----------|
| Engine idle | Looping hum, pitch varies with throttle | Continuous |
| Engine thrust | Layered whoosh, increases with speed | Continuous |
| Airbrake | Hydraulic hiss + air rush | While held |
| Wall scrape | Metallic grinding + sparks | 0.5s |
| Hard collision | Impact thud + crunch | 0.3s |
| Speed pad | Electronic boost chirp | 0.2s |
| Lap complete | Checkpoint ding | 0.5s |
| Low shield | Warning klaxon | Repeating |
| Shield depleted | Explosion + alarm | 2s |
| Countdown | "3... 2... 1..." beeps | 3s |
| Race finish | Triumphant horn | 1s |

### Music

- Looping electronic/techno tracks (royalty-free or original)
- BPM should match speed class (Vector: 120, Phantom: 160)
- Crossfade between tracks: 2 seconds
- Music ducks 30% during voice announcements

---

*This TINS README provides complete specifications for implementing PHANTOM VECTOR. Any capable LLM should be able to generate a fully functional implementation from this documentation.*
