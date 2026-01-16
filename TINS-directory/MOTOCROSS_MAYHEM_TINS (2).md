# Motocross Mayhem: React 3D Stunt Racing Game

## TINS Development Plan v1.0

---

## Description

Motocross Mayhem is a browser-based 3D motocross stunt racing game inspired by the classic Motocross Madness 2 (2000). Built with React and Three.js using a component-based architecture with strict separation of concerns, the game delivers an arcade-style experience featuring open-world exploration, physics-based stunts, and the iconic "slingshot" boundary mechanic.

Players accumulate points by performing aerial stunts while freely roaming across themed environments. The game emphasizes fun over simulation realism, with exaggerated physics that launch riders high into the air, creating opportunities for spectacular trick combinations.

**Key Inspirations:**
- Open sandbox free-roam with multiple paths and shortcuts
- Points-based stunt system with 16 unique tricks
- Variable terrain friction (sand, ice, mud, grass)
- Boost system that recharges over time
- Iconic "invisible slingshot" boundary enforcement
- Three themed environments: Desert (Egypt), Outback (Australia), Glacier (Iceland)

---

## Functionality

### Core Features

#### 1. Game Modes

**Stunt Mode (Primary)**
- Free-roam across open terrain with no time limit
- Accumulate points by performing successful stunts
- No restrictions on where players can go
- High score tracking and combo multipliers

**Time Attack Mode**
- Complete stunt challenges within time limits
- Bonus time for successful tricks
- Progressive difficulty levels

**Exploration Mode**
- Collect items scattered across the map
- Discover hidden areas and shortcuts
- No scoring pressure - pure sandbox fun

#### 2. Movement & Controls

```
KEYBOARD CONTROLS:
├── W / ↑ Arrow     : Accelerate/Throttle
├── S / ↓ Arrow     : Brake/Reverse
├── A / ← Arrow     : Steer Left
├── D / → Arrow     : Steer Right
├── Shift           : Boost (when charged)
├── Space           : Jump (pre-load bunny hop)
│
├── IN-AIR CONTROLS:
│   ├── W/S         : Lean Forward/Backward (pitch)
│   ├── A/D         : Barrel Roll Left/Right
│   ├── Q           : Stunt Modifier 1 + Direction
│   └── E           : Stunt Modifier 2 + Direction
│
├── CAMERA:
│   ├── Mouse Move  : Look Around
│   ├── Scroll      : Zoom In/Out
│   ├── C           : Cycle Camera Views
│   └── R           : Reset Camera
│
└── SYSTEM:
    ├── Escape      : Pause Menu
    └── M           : Toggle Map
```

#### 3. Stunt System

**Stunt Execution Requirements:**
- Minimum air height: 2 meters
- Minimum air time: 0.5 seconds
- Must release stunt button before landing
- Crash occurs if landing during stunt animation

**16 Stunts (Two Banks of 8):**

| Bank 1 (Q + Direction) | Bank 2 (E + Direction) |
|------------------------|------------------------|
| Heel Clicker (Q+W)     | Heart Attack (E+W)     |
| Superman (Q+S)         | Lazy Boy (E+S)         |
| Nac-Nac (Q+A)          | Bar Hop (E+A)          |
| Air Walk (Q+D)         | Cliff Hanger (E+D)     |
| Big Kahuna (Q+W+A)     | Saran Wrap (E+W+A)     |
| Split X (Q+W+D)        | Double Can-Can (E+W+D) |
| Barney (Q+S+A)         | Tail Grab (E+S+A)      |
| Cordova (Q+S+D)        | Seat Grab (E+S+D)      |

**Scoring System:**
```javascript
BASE_STUNT_POINTS = {
  // Simple stunts (single direction)
  'heel_clicker': 100,
  'superman': 150,
  'nac_nac': 100,
  'air_walk': 120,
  'heart_attack': 130,
  'lazy_boy': 110,
  'bar_hop': 90,
  'cliff_hanger': 140,
  
  // Complex stunts (diagonal direction)
  'big_kahuna': 200,
  'split_x': 220,
  'barney': 180,
  'cordova': 250,
  'saran_wrap': 190,
  'double_can_can': 210,
  'tail_grab': 170,
  'seat_grab': 160
}

// Multipliers
AIR_TIME_BONUS = points * (airTime / 2)      // +50% per second
HEIGHT_BONUS = points * (maxHeight / 10)     // +10% per meter
COMBO_MULTIPLIER = 1.5^(comboCount - 1)      // 1.5x, 2.25x, 3.375x...
PERFECT_LANDING_BONUS = 1.25                 // Clean landing multiplier
```

#### 4. Physics System

**Bike Physics:**
```javascript
BIKE_PHYSICS = {
  mass: 180,                    // kg (bike + rider)
  maxSpeed: 120,                // km/h
  acceleration: 15,             // m/s²
  brakeForce: 25,               // m/s²
  turnRate: 2.5,                // radians/s
  
  // Air physics
  airControl: 0.3,              // Reduced control in air
  rotationDamping: 0.95,        // Air rotation slowdown
  
  // Jump physics
  bunnyHopForce: 8,             // m/s upward velocity
  rampMultiplier: 1.5,          // Extra height from ramps
}
```

**Terrain Surface Types:**
```javascript
TERRAIN_FRICTION = {
  dirt: { friction: 0.7, drag: 0.1 },
  sand: { friction: 0.5, drag: 0.25 },
  grass: { friction: 0.6, drag: 0.15 },
  ice: { friction: 0.15, drag: 0.05 },
  mud: { friction: 0.4, drag: 0.35 },
  rock: { friction: 0.8, drag: 0.05 },
  water: { friction: 0.3, drag: 0.5, slowdown: 0.4 }
}
```

**Gravity & Landing:**
```javascript
GRAVITY = -20                    // m/s² (exaggerated for fun)
SAFE_LANDING_ANGLE = 45          // degrees from vertical
CRASH_THRESHOLD_VELOCITY = 30    // m/s vertical impact
CRASH_THRESHOLD_ANGLE = 60       // degrees off-vertical
```

#### 5. Boundary Slingshot Mechanic

The iconic "invisible slingshot" activates when players attempt to leave the map:

```javascript
BOUNDARY_SLINGSHOT = {
  triggerDistance: 10,           // meters from edge
  warningDistance: 50,           // meters (show warning)
  launchForce: 150,              // m/s initial velocity
  launchAngle: 75,               // degrees upward
  soundEffect: 'cannon_boom',
  ragdollDuration: 3000,         // ms of uncontrolled flight
  respawnDelay: 1500             // ms after landing
}
```

**Behavior:**
1. Warning appears when approaching boundary (red zone on minimap)
2. If player crosses boundary, cannon sound plays
3. Player and bike launched backward into map at extreme velocity
4. Funny scream sound during flight
5. Ragdoll physics until impact
6. Score penalty: -500 points
7. Respawn at nearest safe location

#### 6. Boost System

```javascript
BOOST_SYSTEM = {
  maxCharge: 100,
  rechargeRate: 10,              // per second (passive)
  trickRecharge: 25,             // per successful stunt
  consumptionRate: 33,           // per second while active
  speedMultiplier: 1.5,          // 50% speed increase
  cooldownAfterEmpty: 2          // seconds before recharge
}
```

#### 7. Environments

**Desert Oasis (Egypt Theme)**
```javascript
DESERT_ENVIRONMENT = {
  name: 'Desert Oasis',
  size: [2000, 2000],            // meters
  primaryTerrain: 'sand',
  features: [
    'pyramids',
    'ancient_ruins', 
    'oasis_pools',
    'sand_dunes',
    'palm_groves',
    'buried_temples'
  ],
  skybox: 'desert_sunset',
  ambientColor: '#FFE4B5',
  hazards: ['quicksand_patches'],
  ramps: 45,                     // natural jump locations
  collectibles: 100
}
```

**Outback Canyon (Australia Theme)**
```javascript
OUTBACK_ENVIRONMENT = {
  name: 'Outback Canyon',
  size: [2000, 2000],
  primaryTerrain: 'dirt',
  features: [
    'rock_formations',
    'eucalyptus_forest',
    'dry_riverbeds',
    'aboriginal_art_caves',
    'windmills',
    'abandoned_mines'
  ],
  skybox: 'outback_noon',
  ambientColor: '#CD853F',
  hazards: ['loose_rocks'],
  ramps: 52,
  collectibles: 100
}
```

**Glacier Valley (Iceland Theme)**
```javascript
GLACIER_ENVIRONMENT = {
  name: 'Glacier Valley',
  size: [2000, 2000],
  primaryTerrain: 'ice',
  features: [
    'frozen_lakes',
    'ice_caves',
    'geysers',
    'volcanic_vents',
    'aurora_sky',
    'hot_springs'
  ],
  skybox: 'northern_lights',
  ambientColor: '#B0E0E6',
  hazards: ['thin_ice', 'steam_vents'],
  ramps: 38,
  collectibles: 100
}
```

---

## Technical Implementation

### Architecture Overview

```
src/
├── index.jsx                    # Application entry point
├── App.jsx                      # Root component, routing
│
├── core/                        # Game engine core
│   ├── GameEngine.jsx           # Main game loop controller
│   ├── PhysicsWorld.jsx         # Rapier physics wrapper
│   ├── InputManager.js          # Keyboard/mouse handling
│   ├── AudioManager.js          # Sound effects & music
│   └── StateManager.js          # Global game state (Zustand)
│
├── entities/                    # Game objects
│   ├── Bike/
│   │   ├── Bike.jsx             # Main bike component
│   │   ├── BikePhysics.js       # Physics body & forces
│   │   ├── BikeControls.js      # Input to physics translation
│   │   ├── BikeModel.jsx        # 3D mesh & animations
│   │   └── BikeEffects.jsx      # Particles, trails, sounds
│   │
│   ├── Rider/
│   │   ├── Rider.jsx            # Rider character component
│   │   ├── RiderAnimations.js   # Stunt animation states
│   │   └── RiderRagdoll.js      # Crash physics
│   │
│   └── Collectible/
│       ├── Collectible.jsx      # Base collectible
│       ├── Coin.jsx             # Score bonus item
│       └── PowerUp.jsx          # Boost/time items
│
├── environment/                 # World & terrain
│   ├── Terrain/
│   │   ├── Terrain.jsx          # Main terrain component
│   │   ├── TerrainGenerator.js  # Heightmap processing
│   │   ├── TerrainMaterial.jsx  # Multi-texture terrain shader
│   │   └── TerrainCollider.js   # Physics mesh from heightmap
│   │
│   ├── Skybox/
│   │   └── Skybox.jsx           # Environment sky
│   │
│   ├── Props/
│   │   ├── PropManager.jsx      # Instanced prop rendering
│   │   ├── Ramp.jsx             # Jump ramp physics
│   │   └── Obstacle.jsx         # Collision objects
│   │
│   └── Boundary/
│       ├── Boundary.jsx         # Invisible walls
│       └── Slingshot.js         # Launch mechanic
│
├── systems/                     # Game systems
│   ├── StuntSystem/
│   │   ├── StuntSystem.js       # Stunt detection & scoring
│   │   ├── StuntValidator.js    # Landing validation
│   │   └── ComboTracker.js      # Combo multiplier logic
│   │
│   ├── ScoreSystem/
│   │   ├── ScoreSystem.js       # Points calculation
│   │   └── HighScoreManager.js  # Local storage persistence
│   │
│   ├── BoostSystem/
│   │   └── BoostSystem.js       # Boost charge & consumption
│   │
│   └── CameraSystem/
│       ├── CameraController.jsx # Dynamic camera
│       └── CameraModes.js       # Chase, orbit, first-person
│
├── ui/                          # User interface
│   ├── HUD/
│   │   ├── HUD.jsx              # Main HUD container
│   │   ├── Speedometer.jsx      # Speed display
│   │   ├── BoostMeter.jsx       # Boost gauge
│   │   ├── ScoreDisplay.jsx     # Points & combo
│   │   ├── StuntNotification.jsx # Trick name popup
│   │   ├── Minimap.jsx          # Top-down map
│   │   └── AirMeter.jsx         # Height/air time display
│   │
│   ├── Menus/
│   │   ├── MainMenu.jsx         # Title screen
│   │   ├── PauseMenu.jsx        # In-game pause
│   │   ├── EnvironmentSelect.jsx # Map selection
│   │   ├── BikeSelect.jsx       # Vehicle customization
│   │   └── SettingsMenu.jsx     # Options & controls
│   │
│   └── Overlays/
│       ├── LoadingScreen.jsx    # Asset loading
│       ├── GameOverScreen.jsx   # Results display
│       └── TutorialOverlay.jsx  # Control hints
│
├── hooks/                       # Custom React hooks
│   ├── useGameLoop.js           # RAF game loop
│   ├── usePhysics.js            # Physics body hook
│   ├── useInput.js              # Input state hook
│   ├── useAudio.js              # Sound effect hook
│   └── useStuntDetection.js     # Stunt state hook
│
├── utils/                       # Utilities
│   ├── math.js                  # Vector/quaternion helpers
│   ├── constants.js             # Game constants
│   ├── terrainUtils.js          # Heightmap processing
│   └── debugUtils.js            # Development tools
│
├── assets/                      # Static assets
│   ├── models/                  # GLTF/GLB 3D models
│   ├── textures/                # Images & heightmaps
│   ├── audio/                   # Sound files
│   └── fonts/                   # Custom fonts
│
└── styles/                      # CSS modules
    ├── global.css               # Base styles
    ├── HUD.module.css           # HUD styling
    └── Menus.module.css         # Menu styling
```

### Data Structures

#### Game State (Zustand Store)

```javascript
// StateManager.js
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Game Status
  gameStatus: 'menu', // 'menu' | 'loading' | 'playing' | 'paused' | 'gameover'
  currentMode: 'stunt', // 'stunt' | 'time_attack' | 'exploration'
  currentEnvironment: 'desert',
  
  // Player State
  player: {
    position: [0, 5, 0],
    rotation: [0, 0, 0, 1],
    velocity: [0, 0, 0],
    isGrounded: true,
    isAirborne: false,
    isCrashed: false,
    currentStunt: null,
    stuntProgress: 0,
  },
  
  // Scoring
  score: {
    current: 0,
    highScore: 0,
    combo: {
      count: 0,
      multiplier: 1,
      timer: 0,
    },
    lastTrick: null,
    trickHistory: [],
  },
  
  // Boost
  boost: {
    current: 100,
    max: 100,
    isActive: false,
    cooldown: 0,
  },
  
  // Session Stats
  stats: {
    totalAirTime: 0,
    maxHeight: 0,
    totalDistance: 0,
    tricksLanded: 0,
    crashCount: 0,
    collectiblesGathered: 0,
  },
  
  // Actions
  setGameStatus: (status) => set({ gameStatus: status }),
  updatePlayer: (updates) => set((state) => ({
    player: { ...state.player, ...updates }
  })),
  addScore: (points) => set((state) => ({
    score: {
      ...state.score,
      current: state.score.current + points
    }
  })),
  // ... more actions
}));
```

#### Bike Configuration

```javascript
// BikeConfig.js
export const BIKE_CONFIGS = {
  starter: {
    id: 'starter',
    name: 'Trail Blazer 125',
    stats: {
      speed: 60,
      acceleration: 70,
      handling: 80,
      trick: 75,
      weight: 65,
    },
    model: 'bike_125.glb',
    unlocked: true,
  },
  
  balanced: {
    id: 'balanced',
    name: 'Desert Storm 250',
    stats: {
      speed: 75,
      acceleration: 75,
      handling: 75,
      trick: 70,
      weight: 70,
    },
    model: 'bike_250.glb',
    unlocked: true,
  },
  
  speed: {
    id: 'speed',
    name: 'Velocity 450',
    stats: {
      speed: 95,
      acceleration: 85,
      handling: 55,
      trick: 50,
      weight: 80,
    },
    model: 'bike_450.glb',
    unlockRequirement: { score: 50000 },
  },
  
  trick: {
    id: 'trick',
    name: 'Air Walker Pro',
    stats: {
      speed: 65,
      acceleration: 70,
      handling: 90,
      trick: 95,
      weight: 55,
    },
    model: 'bike_trick.glb',
    unlockRequirement: { tricksLanded: 100 },
  },
};
```

#### Stunt Definition

```javascript
// StuntDefinitions.js
export const STUNTS = {
  heel_clicker: {
    id: 'heel_clicker',
    name: 'Heel Clicker',
    bank: 1,
    input: { modifier: 'Q', direction: 'W' },
    points: 100,
    duration: 800,
    animation: 'heel_clicker',
    description: 'Click heels above handlebars',
    difficulty: 'easy',
  },
  
  superman: {
    id: 'superman',
    name: 'Superman',
    bank: 1,
    input: { modifier: 'Q', direction: 'S' },
    points: 150,
    duration: 1000,
    animation: 'superman',
    description: 'Extend body fully behind bike',
    difficulty: 'medium',
  },
  
  cordova: {
    id: 'cordova',
    name: 'Cordova',
    bank: 1,
    input: { modifier: 'Q', direction: ['S', 'D'] },
    points: 250,
    duration: 1200,
    animation: 'cordova',
    description: 'Full body extension with twist',
    difficulty: 'hard',
  },
  
  // ... remaining 13 stunts
};
```

---

## Component Implementation Details

### 1. Core Game Engine

```jsx
// core/GameEngine.jsx
import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGameStore } from './StateManager';

export function GameEngine({ children }) {
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 3000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Physics
        gravity={[0, -20, 0]}
        timeStep="vary"
        paused={gameStatus !== 'playing'}
      >
        {children}
      </Physics>
    </Canvas>
  );
}

// Game loop hook
export function useGameLoop(callback) {
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  useFrame((state, delta) => {
    if (gameStatus === 'playing') {
      callback(delta, state.clock.elapsedTime);
    }
  });
}
```

### 2. Bike Entity

```jsx
// entities/Bike/Bike.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRapier } from '@react-three/rapier';
import { BikeModel } from './BikeModel';
import { BikeEffects } from './BikeEffects';
import { useBikePhysics } from './BikePhysics';
import { useBikeControls } from './BikeControls';
import { useGameStore } from '../../core/StateManager';

export function Bike({ config }) {
  const rigidBodyRef = useRef();
  const { world } = useRapier();
  
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const isGrounded = useGameStore((state) => state.player.isGrounded);
  
  // Custom hooks for physics and controls
  const physics = useBikePhysics(rigidBodyRef, config);
  const controls = useBikeControls(physics);
  
  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;
    
    const body = rigidBodyRef.current;
    const position = body.translation();
    const rotation = body.rotation();
    const velocity = body.linvel();
    
    // Apply control forces
    controls.update(delta);
    
    // Ground detection
    const groundRay = world.castRay(
      { origin: position, dir: { x: 0, y: -1, z: 0 } },
      2,
      true
    );
    
    const grounded = groundRay !== null && groundRay.toi < 1.5;
    
    // Update global state
    updatePlayer({
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
      velocity: [velocity.x, velocity.y, velocity.z],
      isGrounded: grounded,
      isAirborne: !grounded,
    });
  });
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders="hull"
      mass={config.mass}
      linearDamping={0.5}
      angularDamping={0.8}
      position={[0, 5, 0]}
    >
      <BikeModel config={config} isGrounded={isGrounded} />
      <BikeEffects rigidBody={rigidBodyRef} />
    </RigidBody>
  );
}
```

### 3. Stunt System

```javascript
// systems/StuntSystem/StuntSystem.js
import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../core/StateManager';
import { STUNTS } from './StuntDefinitions';
import { useInput } from '../../hooks/useInput';

export function useStuntSystem() {
  const player = useGameStore((state) => state.player);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const addScore = useGameStore((state) => state.addScore);
  const input = useInput();
  
  // Detect stunt input
  const detectStuntInput = useCallback(() => {
    if (!player.isAirborne) return null;
    
    const modifier = input.isPressed('KeyQ') ? 'Q' : 
                     input.isPressed('KeyE') ? 'E' : null;
    if (!modifier) return null;
    
    const directions = [];
    if (input.isPressed('KeyW')) directions.push('W');
    if (input.isPressed('KeyS')) directions.push('S');
    if (input.isPressed('KeyA')) directions.push('A');
    if (input.isPressed('KeyD')) directions.push('D');
    
    if (directions.length === 0) return null;
    
    // Find matching stunt
    return Object.values(STUNTS).find((stunt) => {
      if (stunt.input.modifier !== modifier) return false;
      const stuntDir = Array.isArray(stunt.input.direction) 
        ? stunt.input.direction 
        : [stunt.input.direction];
      return stuntDir.every((d) => directions.includes(d));
    });
  }, [player.isAirborne, input]);
  
  // Update stunt state
  useEffect(() => {
    if (!player.isAirborne) {
      // Landing logic
      if (player.currentStunt) {
        if (player.stuntProgress >= 1) {
          // Successful landing
          const stunt = STUNTS[player.currentStunt];
          const points = calculateStuntScore(stunt, player);
          addScore(points);
        } else {
          // Crash - stunt incomplete
          triggerCrash();
        }
        updatePlayer({ currentStunt: null, stuntProgress: 0 });
      }
      return;
    }
    
    const detectedStunt = detectStuntInput();
    if (detectedStunt && !player.currentStunt) {
      updatePlayer({
        currentStunt: detectedStunt.id,
        stuntProgress: 0,
      });
    }
  }, [player.isAirborne, detectStuntInput]);
  
  // Progress stunt animation
  useEffect(() => {
    if (!player.currentStunt || !player.isAirborne) return;
    
    const stunt = STUNTS[player.currentStunt];
    const interval = setInterval(() => {
      updatePlayer((prev) => ({
        stuntProgress: Math.min(1, prev.stuntProgress + (16 / stunt.duration))
      }));
    }, 16);
    
    return () => clearInterval(interval);
  }, [player.currentStunt, player.isAirborne]);
}

function calculateStuntScore(stunt, player) {
  let points = stunt.points;
  
  // Air time bonus
  const airTimeBonus = points * (player.airTime / 2);
  points += airTimeBonus;
  
  // Height bonus
  const heightBonus = points * (player.maxAirHeight / 10);
  points += heightBonus;
  
  // Combo multiplier
  const comboMultiplier = Math.pow(1.5, player.comboCount - 1);
  points *= comboMultiplier;
  
  // Perfect landing bonus
  if (isCleanLanding(player)) {
    points *= 1.25;
  }
  
  return Math.floor(points);
}
```

### 4. Terrain System

```jsx
// environment/Terrain/Terrain.jsx
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { RigidBody, HeightfieldCollider } from '@react-three/rapier';
import * as THREE from 'three';

export function Terrain({ heightmapUrl, size, resolution }) {
  const heightData = useHeightmapData(heightmapUrl, resolution);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      size[0],
      size[1],
      resolution - 1,
      resolution - 1
    );
    
    // Apply heightmap to vertices
    const positions = geo.attributes.position.array;
    for (let i = 0; i < heightData.length; i++) {
      positions[i * 3 + 2] = heightData[i] * 100; // Scale height
    }
    
    geo.computeVertexNormals();
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [heightData, size, resolution]);
  
  // Convert to Rapier heightfield format
  const heightfieldData = useMemo(() => {
    const rows = resolution;
    const cols = resolution;
    const heights = new Float32Array(rows * cols);
    
    for (let i = 0; i < heightData.length; i++) {
      heights[i] = heightData[i] * 100;
    }
    
    return { heights, rows, cols };
  }, [heightData, resolution]);
  
  return (
    <RigidBody type="fixed" colliders={false}>
      <HeightfieldCollider
        args={[
          heightfieldData.rows - 1,
          heightfieldData.cols - 1,
          heightfieldData.heights,
          { x: size[0], y: 1, z: size[1] }
        ]}
      />
      <mesh geometry={geometry}>
        <TerrainMaterial />
      </mesh>
    </RigidBody>
  );
}

// Custom terrain shader for multi-texture blending
function TerrainMaterial() {
  return (
    <meshStandardMaterial
      vertexColors
      roughness={0.8}
      metalness={0.1}
    />
  );
}

// Hook to load and process heightmap
function useHeightmapData(url, resolution) {
  const texture = useLoader(THREE.TextureLoader, url);
  
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0, resolution, resolution);
    const imageData = ctx.getImageData(0, 0, resolution, resolution);
    
    const heights = new Float32Array(resolution * resolution);
    for (let i = 0; i < heights.length; i++) {
      heights[i] = imageData.data[i * 4] / 255; // Red channel
    }
    return heights;
  }, [texture, resolution]);
}
```

### 5. Boundary Slingshot

```jsx
// environment/Boundary/Slingshot.js
import { useEffect } from 'react';
import { useGameStore } from '../../core/StateManager';
import { useAudio } from '../../hooks/useAudio';
import * as THREE from 'three';

export function useBoundarySlingshot(rigidBodyRef, mapBounds) {
  const player = useGameStore((state) => state.player);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const addScore = useGameStore((state) => state.addScore);
  const { playSound } = useAudio();
  
  useEffect(() => {
    const [minX, maxX, minZ, maxZ] = mapBounds;
    const [x, y, z] = player.position;
    
    // Check if out of bounds
    const outOfBounds = x < minX || x > maxX || z < minZ || z > maxZ;
    
    if (outOfBounds && !player.isSlingshot) {
      // Calculate launch direction (back toward center)
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      
      const dirX = centerX - x;
      const dirZ = centerZ - z;
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
      
      const normalizedDir = new THREE.Vector3(
        dirX / length,
        Math.sin(THREE.MathUtils.degToRad(75)), // 75 degree launch
        dirZ / length
      ).normalize();
      
      // Apply slingshot force
      const launchVelocity = normalizedDir.multiplyScalar(150);
      
      rigidBodyRef.current.setLinvel({
        x: launchVelocity.x,
        y: launchVelocity.y,
        z: launchVelocity.z
      });
      
      // Effects
      playSound('cannon_boom');
      setTimeout(() => playSound('scream_funny'), 200);
      
      // Enable ragdoll
      updatePlayer({
        isSlingshot: true,
        isCrashed: true,
      });
      
      // Score penalty
      addScore(-500);
      
      // Reset after landing
      setTimeout(() => {
        updatePlayer({
          isSlingshot: false,
          isCrashed: false,
        });
      }, 3000);
    }
  }, [player.position, mapBounds]);
}
```

### 6. HUD Components

```jsx
// ui/HUD/HUD.jsx
import React from 'react';
import { Speedometer } from './Speedometer';
import { BoostMeter } from './BoostMeter';
import { ScoreDisplay } from './ScoreDisplay';
import { StuntNotification } from './StuntNotification';
import { Minimap } from './Minimap';
import { AirMeter } from './AirMeter';
import styles from '../../styles/HUD.module.css';

export function HUD() {
  return (
    <div className={styles.hudContainer}>
      {/* Top Left - Score & Combo */}
      <div className={styles.topLeft}>
        <ScoreDisplay />
      </div>
      
      {/* Top Right - Minimap */}
      <div className={styles.topRight}>
        <Minimap />
      </div>
      
      {/* Bottom Left - Speedometer */}
      <div className={styles.bottomLeft}>
        <Speedometer />
      </div>
      
      {/* Bottom Center - Boost & Air */}
      <div className={styles.bottomCenter}>
        <BoostMeter />
        <AirMeter />
      </div>
      
      {/* Center - Stunt Notifications */}
      <div className={styles.center}>
        <StuntNotification />
      </div>
    </div>
  );
}
```

```jsx
// ui/HUD/ScoreDisplay.jsx
import React from 'react';
import { useGameStore } from '../../core/StateManager';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/HUD.module.css';

export function ScoreDisplay() {
  const score = useGameStore((state) => state.score);
  
  return (
    <div className={styles.scoreContainer}>
      <div className={styles.currentScore}>
        <span className={styles.label}>SCORE</span>
        <motion.span
          className={styles.value}
          key={score.current}
          initial={{ scale: 1.2, color: '#FFD700' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ duration: 0.3 }}
        >
          {score.current.toLocaleString()}
        </motion.span>
      </div>
      
      <AnimatePresence>
        {score.combo.count > 1 && (
          <motion.div
            className={styles.comboDisplay}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <span className={styles.comboCount}>
              {score.combo.count}x COMBO
            </span>
            <span className={styles.multiplier}>
              ×{score.combo.multiplier.toFixed(2)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {score.lastTrick && (
        <motion.div
          className={styles.lastTrick}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          +{score.lastTrick.points} {score.lastTrick.name}
        </motion.div>
      )}
    </div>
  );
}
```

```jsx
// ui/HUD/StuntNotification.jsx
import React from 'react';
import { useGameStore } from '../../core/StateManager';
import { STUNTS } from '../../systems/StuntSystem/StuntDefinitions';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/HUD.module.css';

export function StuntNotification() {
  const currentStunt = useGameStore((state) => state.player.currentStunt);
  const stuntProgress = useGameStore((state) => state.player.stuntProgress);
  
  const stunt = currentStunt ? STUNTS[currentStunt] : null;
  
  return (
    <AnimatePresence>
      {stunt && (
        <motion.div
          className={styles.stuntNotification}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className={styles.stuntName}>{stunt.name}</span>
          
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${stuntProgress * 100}%` }}
              style={{
                backgroundColor: stuntProgress >= 1 ? '#00FF00' : '#FFD700'
              }}
            />
          </div>
          
          <span className={styles.stuntPoints}>
            +{stunt.points} pts
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Styling Guide

### Visual Theme

**Aesthetic Direction:** Retro-futuristic extreme sports with neon accents against natural terrain

**Color Palette:**
```css
:root {
  /* Primary */
  --color-primary: #FF4500;        /* Orange Red - Energy */
  --color-secondary: #00FFFF;      /* Cyan - Speed */
  --color-accent: #FFD700;         /* Gold - Score/Success */
  
  /* UI */
  --color-bg-dark: #0A0A0F;
  --color-bg-panel: rgba(10, 10, 15, 0.85);
  --color-border: rgba(255, 255, 255, 0.1);
  
  /* Status */
  --color-success: #00FF00;
  --color-warning: #FFD700;
  --color-danger: #FF0000;
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  
  /* Terrain Themes */
  --desert-ambient: #FFE4B5;
  --outback-ambient: #CD853F;
  --glacier-ambient: #B0E0E6;
}
```

**Typography:**
```css
/* Display - Stunt names, scores */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

/* UI - Menus, labels */
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');

/* Monospace - Stats, numbers */
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

:root {
  --font-display: 'Bebas Neue', sans-serif;
  --font-ui: 'Rajdhani', sans-serif;
  --font-mono: 'Share Tech Mono', monospace;
}
```

**HUD Styling:**
```css
/* HUD.module.css */
.hudContainer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  padding: 20px;
  font-family: var(--font-ui);
}

.scoreContainer {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px 24px;
  backdrop-filter: blur(10px);
}

.currentScore .value {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 700;
  text-shadow: 
    0 0 10px var(--color-accent),
    0 0 20px var(--color-accent);
}

.stuntNotification {
  background: linear-gradient(
    135deg,
    rgba(255, 69, 0, 0.9),
    rgba(255, 215, 0, 0.9)
  );
  border-radius: 12px;
  padding: 20px 40px;
  text-align: center;
  box-shadow: 
    0 0 30px rgba(255, 69, 0, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.stuntName {
  font-family: var(--font-display);
  font-size: 64px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

---

## Testing Scenarios

### Unit Tests

**Stunt Detection:**
```javascript
describe('StuntSystem', () => {
  test('detects heel clicker with Q+W input while airborne', () => {
    const input = { Q: true, W: true };
    const playerState = { isAirborne: true, airTime: 1.0 };
    
    const result = detectStunt(input, playerState);
    expect(result.id).toBe('heel_clicker');
  });
  
  test('returns null when grounded', () => {
    const input = { Q: true, W: true };
    const playerState = { isAirborne: false };
    
    const result = detectStunt(input, playerState);
    expect(result).toBeNull();
  });
  
  test('calculates combo multiplier correctly', () => {
    expect(calculateComboMultiplier(1)).toBe(1);
    expect(calculateComboMultiplier(2)).toBe(1.5);
    expect(calculateComboMultiplier(3)).toBeCloseTo(2.25);
    expect(calculateComboMultiplier(4)).toBeCloseTo(3.375);
  });
});
```

**Physics Validation:**
```javascript
describe('BikePhysics', () => {
  test('applies terrain friction correctly', () => {
    const velocity = { x: 10, y: 0, z: 0 };
    const terrain = 'sand';
    
    const result = applyTerrainFriction(velocity, terrain);
    expect(result.x).toBeLessThan(10);
    expect(result.x).toBeGreaterThan(5); // Sand friction 0.5
  });
  
  test('triggers slingshot at boundary', () => {
    const position = { x: 1001, y: 10, z: 500 };
    const bounds = [-1000, 1000, -1000, 1000];
    
    const result = checkBoundary(position, bounds);
    expect(result.outOfBounds).toBe(true);
    expect(result.launchDirection.x).toBeLessThan(0);
  });
});
```

### Integration Tests

**Full Stunt Flow:**
1. Player approaches ramp at speed > 50 km/h
2. Ramp launches player with minimum 3m height
3. Player inputs Q+W (Heel Clicker)
4. Animation plays to completion
5. Player lands within safe angle
6. Score added: base + air bonus + height bonus
7. Combo counter increments
8. Notification displays trick name

**Boundary Slingshot Flow:**
1. Player approaches map edge
2. Warning indicator appears at 50m
3. Player crosses boundary
4. Cannon sound plays
5. Player launched backward at 150 m/s
6. Scream sound plays
7. Ragdoll physics for 3 seconds
8. Score penalty: -500
9. Player respawns at safe location

---

## Performance Goals

**Frame Rate:**
- Target: 60 FPS on mid-range hardware
- Minimum: 30 FPS on low-end devices
- Physics timestep: Variable (synced to render)

**Memory:**
- Initial load: < 100MB
- Peak usage: < 500MB
- Texture budget: 256MB

**Load Times:**
- Initial: < 5 seconds
- Environment switch: < 3 seconds

**Optimizations:**
- Level of detail (LOD) for terrain and props
- Instanced rendering for repetitive objects
- Texture atlasing for terrain materials
- Physics culling for distant objects
- Object pooling for particles and collectibles

---

## Accessibility Requirements

**Controls:**
- Full keyboard support
- Gamepad support (Xbox/PlayStation layout)
- Rebindable keys
- One-handed play mode option

**Visual:**
- Colorblind-friendly UI options
- High contrast mode
- Scalable UI elements
- Screen shake toggle

**Audio:**
- Separate volume sliders (music/SFX/voice)
- Visual cues for audio events
- Subtitles for tutorial voice

---

## Extended Features (Future)

1. **Multiplayer Mode** - Real-time racing with WebRTC
2. **Track Editor** - Custom heightmap import (Photoshop workflow)
3. **Career Mode** - Pro circuit with unlockables
4. **Ghost Racing** - Race against saved runs
5. **Daily Challenges** - Rotating stunt objectives
6. **Leaderboards** - Global high score tracking
7. **Bike Customization** - Visual upgrades and decals
8. **Weather System** - Dynamic rain, snow, sandstorms
9. **Day/Night Cycle** - Time-based lighting
10. **Replay System** - Save and share best tricks

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "@react-three/rapier": "^1.2.0",
    "three": "^0.158.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Quick Start Implementation Order

### Phase 1: Core Loop (Week 1)
1. Project setup with Vite + React
2. Basic Three.js scene with R3F
3. Rapier physics integration
4. Simple bike with WASD controls
5. Ground plane with collision

### Phase 2: Movement (Week 2)
1. Full bike physics (acceleration, steering, jumping)
2. Air control and rotation
3. Camera follow system
4. Ground detection and landing

### Phase 3: Stunts (Week 3)
1. Input detection for stunt combinations
2. Stunt state machine
3. Basic scoring system
4. Landing validation

### Phase 4: Environment (Week 4)
1. Heightmap terrain generation
2. Desert environment theme
3. Boundary system with slingshot
4. Basic props and ramps

### Phase 5: Polish (Week 5)
1. Full HUD implementation
2. Sound effects and music
3. Particle effects
4. Menu system

### Phase 6: Content (Week 6)
1. Additional environments
2. All 16 stunts animated
3. Multiple bike options
4. Tutorial system

---

*TINS Specification v1.0 - Motocross Mayhem*
*Ready for implementation by any capable LLM*
