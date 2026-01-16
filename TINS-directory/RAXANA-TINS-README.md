# RAXANA

A 3D wireframe reimagining of the NES classic Faxanadu, built entirely in React with Three.js. Players ascend through a dying World Tree rendered in SVGA-style vertex-shaded wireframes, battling corrupted creatures and upgrading equipment in an atmospheric action-RPG experience.

## Description

RAXANA translates Faxanadu's side-scrolling action-RPG into a third-person 3D experience while preserving its core design philosophy: equipment-based progression over stat grinding, deterministic economy, and atmospheric environmental storytelling. The visual style combines low-poly wireframe geometry with SVGA-era vertex color gradients—no textures, just colored vertices creating a distinctive retro-futuristic aesthetic.

The game follows an elven hero returning to their homeland to discover the World Tree Yggdra-Sil is dying. A meteorite has corrupted the peaceful dwarves into monsters, and the life-giving fountains have been poisoned. Players must ascend through the tree's roots, trunk, mist-shrouded impact zone, and branches to reach the Evil Fortress and defeat the source of corruption.

The architecture uses modular React JSX components with strict file length limits (under 200 lines per component) to enable incremental assembly and maintenance. Three.js handles all 3D rendering with a custom wireframe material system supporting vertex colors and optional glow effects.

---

## Architecture Overview

```
RAXANA/
├── src/
│   ├── index.jsx                    # App entry point
│   ├── App.jsx                      # Main game container, state orchestration
│   │
│   ├── core/                        # Core game systems
│   │   ├── GameLoop.jsx             # RAF loop, delta time, pause handling
│   │   ├── GameState.jsx            # Global state context provider
│   │   ├── InputManager.jsx         # Keyboard/gamepad input abstraction
│   │   ├── AudioManager.jsx         # Sound effects and music system
│   │   └── SaveSystem.jsx           # Password/mantra encode/decode
│   │
│   ├── rendering/                   # Three.js rendering pipeline
│   │   ├── SceneManager.jsx         # Three.js scene, camera, renderer setup
│   │   ├── WireframeMaterial.jsx    # Custom vertex-colored wireframe shader
│   │   ├── CameraController.jsx     # Third-person camera with collision
│   │   ├── LightingSystem.jsx       # Ambient + directional, zone-based
│   │   └── PostProcessing.jsx       # CRT scanlines, bloom, chromatic aberration
│   │
│   ├── entities/                    # Game entities
│   │   ├── Player.jsx               # Player entity, state machine
│   │   ├── PlayerModel.jsx          # Player wireframe geometry + equipment visuals
│   │   ├── PlayerController.jsx     # Movement, jumping, attacking
│   │   ├── PlayerCombat.jsx         # Attack hitboxes, damage dealing
│   │   ├── PlayerInventory.jsx      # Equipment slots, items, keys
│   │   │
│   │   ├── enemies/
│   │   │   ├── EnemyBase.jsx        # Base enemy class/component
│   │   │   ├── EnemyAI.jsx          # AI behavior patterns
│   │   │   ├── EnemyTypes.jsx       # Enemy definitions and stats
│   │   │   ├── PatrolEnemy.jsx      # Walking patrol behavior
│   │   │   ├── LeaperEnemy.jsx      # Jump-over attack pattern
│   │   │   ├── ProjectileEnemy.jsx  # Ranged attack behavior
│   │   │   ├── FlyingEnemy.jsx      # Aerial movement patterns
│   │   │   └── BossEnemy.jsx        # Boss encounter logic
│   │   │
│   │   └── npcs/
│   │       ├── NPCBase.jsx          # Base NPC component
│   │       ├── ShopKeeper.jsx       # Shop interaction logic
│   │       ├── Guru.jsx             # Save/mantra NPC
│   │       ├── King.jsx             # Quest giver, gold provider
│   │       └── Townsperson.jsx      # Hint/lore NPCs
│   │
│   ├── world/                       # World and level systems
│   │   ├── WorldManager.jsx         # Zone loading, transitions
│   │   ├── Zone.jsx                 # Individual zone container
│   │   ├── Room.jsx                 # Room/screen unit within zone
│   │   ├── Door.jsx                 # Door entity with key requirements
│   │   ├── Ladder.jsx               # Climbable ladder entity
│   │   ├── Platform.jsx             # Solid platform geometry
│   │   ├── Hazard.jsx               # Damage zones (spikes, pits)
│   │   ├── Fountain.jsx             # Restorable fountain puzzle element
│   │   ├── Pickup.jsx               # Gold, items, quest objects
│   │   │
│   │   └── zones/                   # Zone definitions
│   │       ├── Eolis.jsx            # Starting town at tree roots
│   │       ├── TrunkLower.jsx       # Lower trunk dungeons
│   │       ├── Apolune.jsx          # Second town
│   │       ├── TrunkUpper.jsx       # Upper trunk areas
│   │       ├── Forepaw.jsx          # Branch town, three fountains
│   │       ├── MistZone.jsx         # Meteorite impact, low visibility
│   │       ├── Mascon.jsx           # Mist zone town
│   │       ├── Victim.jsx           # Upper branches town
│   │       ├── Conflate.jsx         # Pre-fortress town
│   │       ├── Dartmoor.jsx         # Corrupted dwarf fortress
│   │       └── EvilFortress.jsx     # Final dungeon
│   │
│   ├── ui/                          # User interface components
│   │   ├── HUD.jsx                  # Health, magic, gold, equipped items
│   │   ├── HealthBar.jsx            # Segmented health display
│   │   ├── MagicBar.jsx             # Magic points display
│   │   ├── InventoryScreen.jsx      # Full inventory management
│   │   ├── ShopScreen.jsx           # Buy/sell interface
│   │   ├── DialogBox.jsx            # NPC conversation display
│   │   ├── PauseMenu.jsx            # Pause state, options
│   │   ├── TitleScreen.jsx          # Main menu, new/continue
│   │   ├── PasswordScreen.jsx       # Mantra entry interface
│   │   ├── GameOverScreen.jsx       # Death screen with options
│   │   └── VictoryScreen.jsx        # Ending sequence
│   │
│   ├── systems/                     # Game logic systems
│   │   ├── CombatSystem.jsx         # Damage calculation, knockback
│   │   ├── ProgressionSystem.jsx    # Rank/experience tracking
│   │   ├── EconomySystem.jsx        # Gold, shop prices, selling
│   │   ├── MagicSystem.jsx          # Spell casting, MP consumption
│   │   ├── CollisionSystem.jsx      # Physics, platform detection
│   │   └── QuestSystem.jsx          # Quest items, progression flags
│   │
│   ├── data/                        # Static game data
│   │   ├── weapons.js               # Weapon definitions
│   │   ├── armor.js                 # Armor definitions
│   │   ├── shields.js               # Shield definitions
│   │   ├── magic.js                 # Spell definitions
│   │   ├── items.js                 # Consumable items
│   │   ├── enemies.js               # Enemy stat blocks
│   │   ├── shops.js                 # Shop inventories by location
│   │   ├── ranks.js                 # Rank thresholds and bonuses
│   │   ├── dialogues.js             # NPC dialogue trees
│   │   └── zones.js                 # Zone layout definitions
│   │
│   ├── models/                      # Wireframe geometry generators
│   │   ├── GeometryUtils.jsx        # Shared geometry helpers
│   │   ├── PlayerGeometry.jsx       # Player body parts
│   │   ├── EnemyGeometries.jsx      # Enemy model generators
│   │   ├── EnvironmentGeometry.jsx  # Platforms, walls, doors
│   │   ├── PropGeometry.jsx         # Decorative objects
│   │   └── EffectGeometry.jsx       # Particles, projectiles
│   │
│   └── utils/                       # Utility functions
│       ├── math.js                  # Vector math, interpolation
│       ├── collision.js             # AABB, raycast helpers
│       ├── password.js              # Mantra encoding/decoding
│       └── constants.js             # Game constants
```

---

## Visual Style Specification

### Wireframe Aesthetic

All geometry renders as wireframe with vertex colors—no texture maps. The aesthetic evokes SVGA-era graphics (320x200 to 640x480) with modern 3D depth.

#### Vertex Color Gradients

Each model uses vertex colors to create shading without textures:

```javascript
// Vertex color assignment pattern
// Top vertices: lighter shade
// Bottom vertices: darker shade
// Creates automatic "lighting" through geometry

const applyVertexGradient = (geometry, topColor, bottomColor) => {
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  // Find Y bounds
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  
  // Interpolate colors based on Y position
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const t = (y - minY) / (maxY - minY);
    colors[i * 3] = bottomColor.r + (topColor.r - bottomColor.r) * t;
    colors[i * 3 + 1] = bottomColor.g + (topColor.g - bottomColor.g) * t;
    colors[i * 3 + 2] = bottomColor.b + (topColor.b - bottomColor.b) * t;
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
};
```

#### Color Palette by Zone

| Zone | Primary Wire | Secondary Wire | Background | Atmosphere |
|------|-------------|----------------|------------|------------|
| Eolis | `#4a9c5d` | `#2d5a3a` | `#1a2f1f` | Clear, hopeful |
| Trunk Lower | `#8b6914` | `#5c4610` | `#1f1a0f` | Earthy, enclosed |
| Apolune | `#6b8cae` | `#3d5166` | `#1a2233` | Cool, safe |
| Trunk Upper | `#9c7a4a` | `#6b5432` | `#2a1f14` | Darker wood |
| Forepaw | `#7cb87c` | `#4a7a4a` | `#1f2f1f` | Living branches |
| Mist Zone | `#9a9a9a` | `#6a6a6a` | `#2a2a2a` | Low visibility, fog |
| Mascon | `#8a7a9a` | `#5a4a6a` | `#1f1a2a` | Mystical purple |
| Victim | `#ae8c6b` | `#7a6248` | `#2a2219` | Dying branches |
| Conflate | `#9c6b6b` | `#6b4a4a` | `#2a1a1a` | Warning red |
| Dartmoor | `#6b4a8c` | `#4a326b` | `#1a142a` | Corrupted purple |
| Evil Fortress | `#4a1a1a` | `#8c1a1a` | `#0f0a0a` | Malevolent red |

#### Wireframe Material Properties

```javascript
// Custom wireframe material supporting vertex colors
const wireframeMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vColor;
    void main() {
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    uniform float glowIntensity;
    void main() {
      vec3 finalColor = vColor * (1.0 + glowIntensity * 0.5);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
  uniforms: {
    glowIntensity: { value: 0.0 }
  },
  vertexColors: true,
  wireframe: true,
  wireframeLinewidth: 1.5 // Note: may not work on all platforms
});
```

#### Post-Processing Effects

1. **Scanlines**: Horizontal lines at 2px intervals, 10% opacity
2. **Bloom**: Subtle glow on bright wireframes, threshold 0.7, intensity 0.3
3. **Chromatic Aberration**: Slight RGB offset (1-2px) at screen edges
4. **Vignette**: Darkened corners, 30% intensity

### Model Specifications

#### Player Model

Low-poly humanoid built from primitive shapes:

```
Head: Octahedron (8 faces)
Torso: Box with beveled edges (12 vertices)
Arms: Elongated boxes, 2 segments each (upper/lower)
Legs: Elongated boxes, 2 segments each (thigh/calf)
Hands: Small cubes
Feet: Flat boxes

Total vertex count: ~80-100
Joint system: Simple rotation pivots at shoulders, elbows, hips, knees
```

Equipment changes model appearance:
- **Weapons**: Attached to right hand pivot, different geometries per tier
- **Shields**: Attached to left arm, size increases with tier
- **Armor**: Modifies torso geometry, adds shoulder/chest plates
- **Helmets**: Replaces/augments head geometry

#### Enemy Models

Each enemy type has distinct silhouette:

| Enemy | Base Shape | Vertex Count | Distinctive Feature |
|-------|-----------|--------------|---------------------|
| Zombie | Humanoid | 60 | Hunched posture, arms forward |
| Gargoyle | Winged humanoid | 90 | Large triangular wings |
| Skull Head | Floating sphere | 30 | Oversized cranium, no body |
| Mage | Robed humanoid | 70 | Conical hat, flowing robe |
| Death Angel | Skeletal winged | 100 | Scythe weapon, tattered wings |
| Dwarf King | Armored humanoid | 120 | Crown, cape, large weapon |
| Evil One | Multi-part | 200 | Segmented body, multiple heads |

#### Environment Models

Modular pieces for room construction:

```
Platform Segment: 2x1x0.3 units, 8 vertices
Wall Segment: 1x3x0.2 units, 8 vertices
Ladder: 0.5x3x0.1 units, rungs as horizontal bars
Door Frame: 1x2x0.1 arch shape, 16 vertices
Tree Trunk Section: Curved cylinder segment, 24 vertices
Branch Platform: Organic curved surface, 32 vertices
Building Block: 2x2x2 cube with window cutouts
```

---

## Core Game Systems

### Player State Machine

```
States:
├── IDLE
│   └── Transitions: move input → WALKING, jump → JUMPING, attack → ATTACKING
├── WALKING  
│   └── Transitions: stop input → IDLE, jump → JUMPING, attack → ATTACKING, ladder → CLIMBING
├── JUMPING
│   └── Transitions: land → IDLE/WALKING, attack → AIR_ATTACKING
├── FALLING
│   └── Transitions: land → IDLE, attack → AIR_ATTACKING
├── ATTACKING
│   └── Transitions: animation complete → previous state
├── AIR_ATTACKING
│   └── Transitions: land → IDLE, animation complete → FALLING
├── CLIMBING
│   └── Transitions: top/bottom → IDLE, jump off → JUMPING
├── HURT
│   └── Transitions: knockback complete → IDLE
├── DEAD
│   └── Transitions: none (triggers game over flow)
└── USING_ITEM
    └── Transitions: item use complete → previous state
```

### Movement Physics

```javascript
// Movement constants
const PHYSICS = {
  GRAVITY: -25,                    // Units per second squared
  WALK_SPEED: 5,                   // Units per second
  WALK_ACCELERATION: 15,           // Momentum-based, like original
  WALK_DECELERATION: 20,           // Friction when stopping
  JUMP_VELOCITY: 12,               // Initial upward velocity
  JUMP_HOLD_BONUS: 0.3,            // Extra height while holding jump
  MAX_FALL_SPEED: -20,             // Terminal velocity
  CLIMB_SPEED: 3,                  // Ladder movement speed
  KNOCKBACK_HORIZONTAL: 4,         // Horizontal knockback on hit
  KNOCKBACK_VERTICAL: 6,           // Vertical knockback on hit
  ATTACK_MOVE_PENALTY: 0.3,        // Speed multiplier while attacking
};

// Jump arc timing (matching Faxanadu feel)
// Quick ascent: 0.3 seconds to apex
// Floating apex: 0.15 seconds of reduced gravity
// Sudden descent: 0.25 seconds to ground
```

### Combat System

#### Damage Calculation

```javascript
const calculateDamage = (attacker, defender, attackType) => {
  let baseDamage;
  
  if (attackType === 'MELEE') {
    baseDamage = attacker.weapon.damage;
  } else if (attackType === 'MAGIC') {
    baseDamage = attacker.currentSpell.damage;
  }
  
  // Physical damage reduced by armor
  let damageReduction = 0;
  if (attackType === 'MELEE' && defender.armor) {
    damageReduction = defender.armor.reduction; // 0 to 0.5 (50%)
  }
  
  // Magical damage reduced by shield (for player defending)
  if (attackType === 'MAGIC' && defender.shield) {
    damageReduction = defender.shield.magicReduction; // 0.5 to 0.99
  }
  
  const finalDamage = Math.floor(baseDamage * (1 - damageReduction));
  return Math.max(1, finalDamage); // Minimum 1 damage
};
```

#### Hitbox System

```javascript
// Weapon hitboxes are attached to player model
// Active only during attack animation frames

const WEAPON_HITBOXES = {
  DAGGER: { width: 0.8, height: 0.3, depth: 0.3, offset: { x: 0.6, y: 0, z: 0 } },
  SHORT_SWORD: { width: 1.2, height: 0.3, depth: 0.3, offset: { x: 0.8, y: 0, z: 0 } },
  LONG_SWORD: { width: 1.6, height: 0.4, depth: 0.4, offset: { x: 1.0, y: 0, z: 0 } },
  GIANT_BLADE: { width: 2.0, height: 0.5, depth: 0.5, offset: { x: 1.2, y: 0, z: 0 } },
  DRAGON_SLAYER: { width: 2.4, height: 0.6, depth: 0.6, offset: { x: 1.4, y: 0, z: 0 } },
};

// Attack animation: 0.4 seconds total
// Frames 0.1-0.3: hitbox active
// Horizontal thrust only (faithful to original)
```

#### Shiner Strike (Advanced Technique)

Using magic or items during melee attack triggers simultaneous weapon swing:

```javascript
const handleItemUse = (player) => {
  if (player.state === 'ATTACKING' && player.attackFrame > 0.05 && player.attackFrame < 0.25) {
    // Shiner Strike: item use during attack window
    // Both item effect AND weapon damage apply
    player.shinerStrikeActive = true;
  }
  // Process item normally
  useItem(player, player.selectedItem);
};
```

### Progression System

#### Rank Definitions

```javascript
const RANKS = [
  { name: 'Novice',     expRequired: 0,      startingGold: 0,     wingBootsTimer: 40 },
  { name: 'Aspirant',   expRequired: 1000,   startingGold: 400,   wingBootsTimer: 40 },
  { name: 'Battler',    expRequired: 2400,   startingGold: 800,   wingBootsTimer: 40 },
  { name: 'Fighter',    expRequired: 4800,   startingGold: 1600,  wingBootsTimer: 40 },
  { name: 'Adept',      expRequired: 6000,   startingGold: 2000,  wingBootsTimer: 30 },
  { name: 'Chevalier',  expRequired: 7200,   startingGold: 2400,  wingBootsTimer: 30 },
  { name: 'Veteran',    expRequired: 8500,   startingGold: 3000,  wingBootsTimer: 30 },
  { name: 'Warrior',    expRequired: 10000,  startingGold: 3500,  wingBootsTimer: 30 },
  { name: 'Swordsman',  expRequired: 14000,  startingGold: 4300,  wingBootsTimer: 20 },
  { name: 'Hero',       expRequired: 18000,  startingGold: 5200,  wingBootsTimer: 20 },
  { name: 'Soldier',    expRequired: 22000,  startingGold: 6200,  wingBootsTimer: 20 },
  { name: 'Myrmidon',   expRequired: 26000,  startingGold: 7500,  wingBootsTimer: 20 },
  { name: 'Champion',   expRequired: 31000,  startingGold: 9000,  wingBootsTimer: 10 },
  { name: 'Superhero',  expRequired: 36000,  startingGold: 11000, wingBootsTimer: 10 },
  { name: 'Paladin',    expRequired: 40000,  startingGold: 13000, wingBootsTimer: 10 },
  { name: 'Lord',       expRequired: 45000,  startingGold: 15000, wingBootsTimer: 10 },
];

// CRITICAL: Ranks do NOT increase HP or attack power
// HP is fixed at 80 throughout the game
// MP is fixed at 80 throughout the game
// All power progression comes from equipment
```

#### Experience Awards

```javascript
// Deterministic - same enemy always gives same XP
const ENEMY_EXPERIENCE = {
  zombie: 18,
  gargoyle: 35,
  skullHead: 59,
  mage: 72,
  deathAngel: 95,
  humanGargoyle: 100,
  quadapus: 150,
  // Bosses
  dwarfKing: 500,
  evilOne: 0, // Final boss, game ends
};
```

### Economy System

#### Gold Awards (Deterministic)

```javascript
const ENEMY_GOLD = {
  zombie: 12,
  gargoyle: 28,
  skullHead: 59,
  mage: 65,
  deathAngel: 88,
  humanGargoyle: 100,
  quadapus: 480, // High value, rare enemy
};
```

#### Shop System

```javascript
// Shop inventory varies by location
// Same item has different prices at different shops

const SHOP_PRICES = {
  // Weapon prices by shop location
  handDagger: { eolis: 400, apolune: 450 },
  longSword: { apolune: 1600, forepaw: 1800, conflate: 2000 },
  giantBlade: { conflate: 8500, dartmoor: 13000 },
  
  // Keys
  jackKey: { eolis: 100, apolune: 200, forepaw: 300 },
  queenKey: { forepaw: 500, mascon: 800, conflate: 1200 },
  kingKey: { conflate: 1200, dartmoor: 1500 },
  
  // Consumables
  redPotion: { all: 400 },    // Restore 40 HP
  elixir: { all: 1200 },       // Auto-revive on death, restore 80 HP
  wingBoots: { forepaw: 2800, mascon: 4000, conflate: 5500 },
};

// Selling: 50% of purchase price
// Cannot sell quest items or equipped gear
```

#### King's Gold Safety Net

```javascript
// King in Eolis gives 1500g to players with 0 gold
// Can be repeated indefinitely - anti-softlock mechanism

const talkToKing = (player) => {
  if (player.gold === 0) {
    player.gold = 1500;
    return { dialogue: "You seem to be in need. Take this gold and prepare yourself." };
  }
  return { dialogue: "Brave warrior, the World Tree needs you. Ascend and save us all." };
};
```

### Magic System

#### Spell Definitions

```javascript
const SPELLS = [
  { name: 'Deluge',   mpCost: 2,  damage: 6,  projectileSpeed: 8,  color: '#4a9cff' },
  { name: 'Thunder',  mpCost: 4,  damage: 10, projectileSpeed: 10, color: '#ffff4a' },
  { name: 'Fire',     mpCost: 6,  damage: 16, projectileSpeed: 8,  color: '#ff6a4a' },
  { name: 'Death',    mpCost: 10, damage: 24, projectileSpeed: 12, color: '#9a4aff' },
  { name: 'Tilte',    mpCost: 16, damage: 38, projectileSpeed: 14, color: '#ff4a9c' },
];

// All spells fire horizontally in facing direction
// Spell projectiles are wireframe shapes:
// Deluge: Water drop tetrahedron
// Thunder: Zigzag line
// Fire: Flickering pyramid
// Death: Skull shape
// Tilte: Spinning star
```

#### Magic Restoration

```javascript
// Red Potion: +40 MP (can overheal temporarily)
// Inns/Hospitals: Full MP restore (costs gold)
// No passive MP regeneration - resource is strictly limited
```

### Collision System

```javascript
// AABB collision for all entities
// Ground detection via downward raycast
// Wall detection via horizontal raycasts at multiple heights

const COLLISION_LAYERS = {
  PLAYER: 1,
  ENEMY: 2,
  PLAYER_ATTACK: 4,
  ENEMY_ATTACK: 8,
  ENVIRONMENT: 16,
  PICKUP: 32,
  TRIGGER: 64,
};

const collisionMatrix = {
  [COLLISION_LAYERS.PLAYER]: COLLISION_LAYERS.ENVIRONMENT | COLLISION_LAYERS.ENEMY | COLLISION_LAYERS.PICKUP | COLLISION_LAYERS.TRIGGER,
  [COLLISION_LAYERS.ENEMY]: COLLISION_LAYERS.ENVIRONMENT | COLLISION_LAYERS.PLAYER_ATTACK,
  [COLLISION_LAYERS.PLAYER_ATTACK]: COLLISION_LAYERS.ENEMY,
  [COLLISION_LAYERS.ENEMY_ATTACK]: COLLISION_LAYERS.PLAYER,
};
```

### Save/Password System (Mantra)

```javascript
// Encodes: rank, gold (rank-based), equipment, key items, current zone
// Does NOT encode: exact gold amount, consumable items, enemy states

const encodeMantra = (gameState) => {
  const data = {
    zone: gameState.currentZone,        // 4 bits (0-15)
    rank: gameState.rank,                // 4 bits (0-15)
    weapon: gameState.equipment.weapon,  // 4 bits
    armor: gameState.equipment.armor,    // 4 bits
    shield: gameState.equipment.shield,  // 4 bits
    magic: gameState.equipment.magic,    // 4 bits
    keyItems: gameState.questFlags,      // 16 bits (bitfield)
    checksum: 0,                         // 8 bits
  };
  
  // Generate 32-character mantra using consonants only (no vowels)
  const charset = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
  // ... encoding logic
  return mantraString;
};

const decodeMantra = (mantraString) => {
  // Validate checksum
  // Extract game state
  // Set gold to rank-determined amount (enables "shopping spree" strategy)
  // Return decoded state or null if invalid
};
```

---

## Data Structures

### Player State

```typescript
interface PlayerState {
  // Vitals (fixed throughout game)
  maxHp: 80;
  maxMp: 80;
  currentHp: number;          // 0-80
  currentMp: number;          // 0-80
  
  // Progression
  experience: number;
  rank: number;               // 0-15, derived from experience
  gold: number;
  
  // Equipment (null if none equipped)
  weapon: Weapon | null;
  armor: Armor | null;
  shield: Shield | null;
  helmet: Helmet | null;
  magic: Spell | null;        // Currently selected spell
  
  // Inventory
  items: InventoryItem[];     // Max 8 slots
  keys: { jack: number, queen: number, king: number, ace: number, joker: number };
  
  // Quest Items (bitfield)
  questFlags: number;
  rings: { elf: boolean, ruby: boolean, dwarf: boolean, demon: boolean };
  
  // Physics
  position: Vector3;
  velocity: Vector3;
  facing: 1 | -1;             // 1 = right, -1 = left
  
  // State
  state: PlayerStateEnum;
  stateTimer: number;
  invulnerableTimer: number;  // I-frames after hit
  
  // Active effects
  wingBootsTimer: number;     // Remaining flight time
  hourGlassActive: boolean;   // Enemies frozen
}
```

### Enemy State

```typescript
interface EnemyState {
  type: EnemyType;
  maxHp: number;
  currentHp: number;
  damage: number;             // Contact damage
  experienceValue: number;
  goldValue: number;
  
  position: Vector3;
  velocity: Vector3;
  facing: 1 | -1;
  
  aiState: EnemyAIState;
  aiTimer: number;
  patrolBounds: { min: Vector3, max: Vector3 };
  
  // For projectile enemies
  attackCooldown: number;
  projectileType: string | null;
}

type EnemyType = 
  | 'zombie' | 'gargoyle' | 'skullHead' | 'mage' 
  | 'deathAngel' | 'humanGargoyle' | 'quadapus'
  | 'dwarfKing' | 'evilOne';

type EnemyAIState = 
  | 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' 
  | 'RETREAT' | 'LEAP' | 'FLY_PATTERN';
```

### Room Definition

```typescript
interface RoomDefinition {
  id: string;
  zone: ZoneType;
  
  // Room bounds in world units
  bounds: { width: number, height: number, depth: number };
  
  // Geometry
  platforms: PlatformDef[];
  walls: WallDef[];
  ladders: LadderDef[];
  doors: DoorDef[];
  hazards: HazardDef[];
  decorations: DecorationDef[];
  
  // Entities
  enemies: EnemySpawnDef[];
  npcs: NPCDef[];
  pickups: PickupDef[];
  
  // Connections
  exits: {
    left?: { targetRoom: string, spawnPoint: Vector3 };
    right?: { targetRoom: string, spawnPoint: Vector3 };
    up?: { targetRoom: string, spawnPoint: Vector3 };
    down?: { targetRoom: string, spawnPoint: Vector3 };
  };
  
  // Camera
  cameraMode: 'follow' | 'fixed' | 'pan';
  cameraConstraints?: { min: Vector3, max: Vector3 };
  
  // Lighting
  ambientColor: string;
  ambientIntensity: number;
  fogColor: string;
  fogDensity: number;
}
```

### Item Definitions

```typescript
interface Weapon {
  id: string;
  name: string;
  damage: number;
  reach: number;              // Hitbox width
  attackSpeed: number;        // Animation duration multiplier
  geometry: 'dagger' | 'shortSword' | 'longSword' | 'giantBlade' | 'dragonSlayer';
  wireColor: { top: string, bottom: string };
}

interface Armor {
  id: string;
  name: string;
  damageReduction: number;    // 0 to 0.5
  geometry: 'leather' | 'studded' | 'fullPlate' | 'battleSuit';
  wireColor: { top: string, bottom: string };
}

interface Shield {
  id: string;
  name: string;
  magicReduction: number;     // 0.5 to 0.99
  size: 'small' | 'medium' | 'large' | 'magic' | 'battle';
  wireColor: { top: string, bottom: string };
}

interface ConsumableItem {
  id: string;
  name: string;
  effect: 'healHp' | 'healMp' | 'revive' | 'flight' | 'freeze' | 'mattock';
  value: number;              // Amount healed, duration, etc.
  consumedOnUse: boolean;
}
```

---

## User Interface

### HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HP [████████████████░░░░] 64/80    ⚔️ Giant Blade           │
│ MP [██████████░░░░░░░░░░] 40/80    🛡️ Magic Shield          │
│                                     📿 Fire                  │
│                                     🔑 J:2 Q:1 K:0          │
│                                                              │
│                                                              │
│                                                              │
│                                                    💰 12,450  │
└─────────────────────────────────────────────────────────────┘

- Health bar: Segmented, each segment = 10 HP
- Magic bar: Continuous gradient fill
- Equipment icons: Wireframe representations
- Key counts: Jack/Queen/King visible
- Gold: Bottom right, always visible
```

### Inventory Screen

```
┌─────────────────────────────────────────────────────────────┐
│                      INVENTORY                               │
│─────────────────────────────────────────────────────────────│
│                                                              │
│  WEAPON     [Giant Blade    ] ▶ ATK: 18                     │
│  ARMOR      [Full Plate     ] ▶ DEF: 40%                    │
│  SHIELD     [Magic Shield   ] ▶ MAG DEF: 90%                │
│  HELMET     [Battle Helmet  ] ▶ MAG DEF: 99%                │
│  MAGIC      [Fire           ] ▶ DMG: 16  MP: 6              │
│                                                              │
│─────────────────────────────────────────────────────────────│
│  ITEMS                                                       │
│  [Red Potion  ] [Elixir      ] [Wing Boots  ] [Mattock    ] │
│  [            ] [            ] [            ] [            ] │
│                                                              │
│─────────────────────────────────────────────────────────────│
│  KEYS  Jack: 2   Queen: 1   King: 0   Ace: ✓   Joker: ✗    │
│  RINGS Elf: ✓   Ruby: ✓   Dwarf: ✗   Demon: ✗              │
│─────────────────────────────────────────────────────────────│
│  RANK: Warrior (10,000 XP)          GOLD: 12,450            │
└─────────────────────────────────────────────────────────────┘

Navigation: Arrow keys to select, Enter to use/equip, Escape to close
Wireframe item previews rotate slowly on selection
```

### Shop Screen

```
┌─────────────────────────────────────────────────────────────┐
│                    APOLUNE ARMS SHOP                         │
│─────────────────────────────────────────────────────────────│
│                                                              │
│  FOR SALE                          YOUR GOLD: 12,450        │
│                                                              │
│  ▶ Long Sword ............ 1,600g   [ATK: 10]               │
│    Studded Armor ......... 3,200g   [DEF: 20%]              │
│    Medium Shield ......... 2,400g   [MAG: 60%]              │
│    Red Potion .............. 400g   [+40 HP]                │
│    Jack Key ................ 200g                           │
│    Queen Key ............... 500g                           │
│                                                              │
│─────────────────────────────────────────────────────────────│
│  [BUY]                    [SELL]                    [EXIT]  │
│                                                              │
│  "A fine blade! It will serve you well in the trunk."       │
└─────────────────────────────────────────────────────────────┘

Buy: Enter to purchase
Sell: Tab to switch to sell mode, items sell at 50% price
Insufficient gold: Item name displayed in red, purchase blocked
```

### Dialog Box

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────┐                                                     │
│ │ 👤  │  ELDER                                              │
│ │     │  "The fountain in the eastern grove has been        │
│ └─────┘  poisoned. Find the Elixir of Life in the tower    │
│          beyond the trunk passage. Only then can the        │
│          water flow pure again."                            │
│                                                              │
│                                          [▶ Continue]       │
└─────────────────────────────────────────────────────────────┘

- NPC portrait: Simplified wireframe face
- Text reveals character by character (30 chars/second)
- Press Enter to reveal all text immediately
- Press Enter again to advance/close
```

---

## Enemy AI Patterns

### Patrol (Zombie, basic enemies)

```javascript
const patrolBehavior = (enemy, deltaTime) => {
  // Walk back and forth between patrol bounds
  if (enemy.position.x <= enemy.patrolBounds.min.x) {
    enemy.facing = 1;
  } else if (enemy.position.x >= enemy.patrolBounds.max.x) {
    enemy.facing = -1;
  }
  
  enemy.velocity.x = enemy.facing * enemy.moveSpeed;
  
  // No reaction to player - pure patrol
};
```

### Leap-Over (Gargoyle)

```javascript
const leapOverBehavior = (enemy, player, deltaTime) => {
  const distanceToPlayer = player.position.x - enemy.position.x;
  
  if (enemy.aiState === 'IDLE') {
    // Wait until player approaches
    if (Math.abs(distanceToPlayer) < 4) {
      enemy.aiState = 'LEAP';
      enemy.velocity.x = Math.sign(distanceToPlayer) * 6;
      enemy.velocity.y = 10;
    }
  } else if (enemy.aiState === 'LEAP') {
    // Apply gravity, land behind player
    if (enemy.isGrounded) {
      enemy.aiState = 'COOLDOWN';
      enemy.aiTimer = 1.5;
    }
  } else if (enemy.aiState === 'COOLDOWN') {
    enemy.aiTimer -= deltaTime;
    if (enemy.aiTimer <= 0) {
      enemy.aiState = 'IDLE';
    }
  }
};
```

### Projectile (Mage)

```javascript
const projectileBehavior = (enemy, player, deltaTime) => {
  const distanceToPlayer = Math.abs(player.position.x - enemy.position.x);
  
  if (enemy.aiState === 'APPROACH') {
    // Move toward player until in range
    if (distanceToPlayer > 5) {
      enemy.velocity.x = Math.sign(player.position.x - enemy.position.x) * enemy.moveSpeed;
    } else {
      enemy.velocity.x = 0;
      enemy.aiState = 'ATTACK';
      enemy.aiTimer = 0.5; // Wind-up
    }
  } else if (enemy.aiState === 'ATTACK') {
    enemy.aiTimer -= deltaTime;
    if (enemy.aiTimer <= 0) {
      // Fire projectile
      spawnEnemyProjectile(enemy, player);
      enemy.aiState = 'COOLDOWN';
      enemy.aiTimer = 2.0;
    }
  } else if (enemy.aiState === 'COOLDOWN') {
    enemy.aiTimer -= deltaTime;
    if (enemy.aiTimer <= 0) {
      enemy.aiState = 'APPROACH';
    }
  }
};
```

### Flying Pattern (Death Angel)

```javascript
const flyingPatternBehavior = (enemy, player, deltaTime) => {
  // Sine wave movement
  enemy.aiTimer += deltaTime;
  
  const baseY = enemy.spawnPosition.y;
  const amplitude = 2;
  const frequency = 1.5;
  
  enemy.position.y = baseY + Math.sin(enemy.aiTimer * frequency * Math.PI * 2) * amplitude;
  
  // Horizontal movement toward player
  const directionToPlayer = Math.sign(player.position.x - enemy.position.x);
  enemy.velocity.x = directionToPlayer * enemy.moveSpeed * 0.5;
  enemy.facing = directionToPlayer;
};
```

### Boss: Dwarf King Grieve

```javascript
const dwarfKingBehavior = (boss, player, deltaTime) => {
  switch (boss.aiState) {
    case 'FLY_HIGH':
      // Rise to ceiling
      boss.velocity.y = 5;
      if (boss.position.y >= boss.ceilingY) {
        boss.aiState = 'SWOOP';
        boss.swoopTarget = { ...player.position };
      }
      break;
      
    case 'SWOOP':
      // Dive toward player's last position
      const direction = normalize(subtract(boss.swoopTarget, boss.position));
      boss.velocity.x = direction.x * 12;
      boss.velocity.y = direction.y * 12;
      
      if (boss.position.y <= boss.floorY + 1) {
        boss.aiState = 'FIREBALL';
        boss.aiTimer = 0;
        boss.fireballCount = 0;
      }
      break;
      
    case 'FIREBALL':
      boss.aiTimer += deltaTime;
      if (boss.aiTimer >= 0.15 && boss.fireballCount < 5) {
        // Fire rapid fireball
        spawnBossFireball(boss, player);
        boss.fireballCount++;
        boss.aiTimer = 0;
      }
      if (boss.fireballCount >= 5) {
        boss.aiState = 'COOLDOWN';
        boss.aiTimer = 2.0;
      }
      break;
      
    case 'COOLDOWN':
      boss.aiTimer -= deltaTime;
      if (boss.aiTimer <= 0) {
        boss.aiState = 'FLY_HIGH';
      }
      break;
  }
};
```

### Boss: Evil One (Final Boss)

```javascript
const evilOneBehavior = (boss, player, deltaTime) => {
  // Multi-segment boss
  // Head is only vulnerable hitbox
  // Body segments follow head with delay
  
  // Head requires exactly 13 hits with Dragon Slayer
  // Lower weapons deal 0 damage
  
  const HEAD_HP = 13;
  
  // Movement: figure-8 pattern across arena
  boss.patternTimer += deltaTime;
  const t = boss.patternTimer * 0.5;
  
  boss.segments[0].position.x = Math.sin(t) * 6;
  boss.segments[0].position.y = Math.sin(t * 2) * 3 + 5;
  
  // Trail segments follow with delay
  for (let i = 1; i < boss.segments.length; i++) {
    boss.segments[i].position = lerp(
      boss.segments[i].position,
      boss.segments[i - 1].position,
      deltaTime * 5
    );
  }
  
  // Periodic projectile attacks from head
  boss.attackTimer -= deltaTime;
  if (boss.attackTimer <= 0) {
    spawnEvilOneProjectile(boss, player);
    boss.attackTimer = 1.5;
  }
};
```

---

## Audio Specifications

### Sound Effects

| Event | Description | Duration |
|-------|-------------|----------|
| `sword_swing` | Quick metallic whoosh | 0.2s |
| `sword_hit` | Impact thud + enemy cry | 0.3s |
| `player_hurt` | Pain grunt + impact | 0.4s |
| `player_death` | Extended death cry | 1.0s |
| `jump` | Quick effort grunt | 0.15s |
| `land` | Soft thud | 0.1s |
| `magic_cast` | Mystical whoosh | 0.3s |
| `magic_hit` | Elemental impact | 0.25s |
| `pickup_gold` | Coin chime | 0.2s |
| `pickup_item` | Positive jingle | 0.4s |
| `door_open` | Heavy creak | 0.5s |
| `door_locked` | Metallic clunk | 0.2s |
| `menu_select` | UI blip | 0.1s |
| `menu_confirm` | Positive chime | 0.2s |
| `menu_cancel` | Negative tone | 0.15s |
| `shop_buy` | Register ding | 0.3s |
| `shop_sell` | Coin drop | 0.25s |
| `npc_talk` | Text blip (looped) | 0.05s |
| `level_up` | Triumphant fanfare | 1.5s |
| `boss_intro` | Ominous rumble | 2.0s |
| `boss_death` | Explosion + victory | 3.0s |

### Music Tracks

| Zone | Mood | Tempo | Key Instruments |
|------|------|-------|-----------------|
| Title Screen | Mysterious, inviting | 90 BPM | Synth pads, arpeggios |
| Eolis | Hopeful, pastoral | 100 BPM | Flute lead, gentle bass |
| Trunk Dungeons | Tense, exploratory | 85 BPM | Minor key, staccato bass |
| Towns (general) | Safe, restful | 75 BPM | Warm pads, simple melody |
| Mist Zone | Eerie, disorienting | 70 BPM | Atonal, sparse |
| Boss Battle | Urgent, intense | 140 BPM | Driving percussion, brass |
| Evil Fortress | Dread, finality | 80 BPM | Low drones, dissonance |
| Victory | Triumphant | 120 BPM | Full orchestral swell |
| Game Over | Somber | 60 BPM | Solo piano, minor key |

---

## Camera System

### Third-Person Follow

```javascript
const CAMERA_CONFIG = {
  followDistance: 8,           // Units behind player
  followHeight: 4,             // Units above player
  lookAheadDistance: 2,        // Offset in facing direction
  smoothingSpeed: 5,           // Lerp factor
  
  // Collision avoidance
  minDistance: 3,
  maxDistance: 12,
  collisionLayers: COLLISION_LAYERS.ENVIRONMENT,
  
  // Room constraints
  constrainToRoom: true,
  roomPadding: 1,
};

const updateCamera = (camera, player, room, deltaTime) => {
  // Target position: behind and above player
  const targetPosition = new Vector3(
    player.position.x - player.facing * CAMERA_CONFIG.followDistance,
    player.position.y + CAMERA_CONFIG.followHeight,
    player.position.z + CAMERA_CONFIG.followDistance
  );
  
  // Add look-ahead in movement direction
  targetPosition.x += player.facing * CAMERA_CONFIG.lookAheadDistance;
  
  // Collision: raycast from player to target, pull camera forward if blocked
  const ray = new Raycaster(player.position, normalize(subtract(targetPosition, player.position)));
  const hits = ray.intersectObjects(room.colliders);
  if (hits.length > 0 && hits[0].distance < distance(targetPosition, player.position)) {
    targetPosition.copy(hits[0].point).add(ray.direction.multiplyScalar(-CAMERA_CONFIG.minDistance));
  }
  
  // Constrain to room bounds
  if (CAMERA_CONFIG.constrainToRoom) {
    targetPosition.x = clamp(targetPosition.x, room.bounds.min.x + CAMERA_CONFIG.roomPadding, room.bounds.max.x - CAMERA_CONFIG.roomPadding);
    targetPosition.y = clamp(targetPosition.y, room.bounds.min.y + CAMERA_CONFIG.roomPadding, room.bounds.max.y - CAMERA_CONFIG.roomPadding);
  }
  
  // Smooth follow
  camera.position.lerp(targetPosition, CAMERA_CONFIG.smoothingSpeed * deltaTime);
  
  // Look at player (slightly above center mass)
  camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
};
```

---

## Input Mapping

### Keyboard Controls

| Action | Primary | Secondary |
|--------|---------|-----------|
| Move Left | A | Arrow Left |
| Move Right | D | Arrow Right |
| Jump | Space | W / Arrow Up |
| Attack | J | Z |
| Use Magic | K | X |
| Use Item | L | C |
| Open Inventory | I | Tab |
| Pause | Escape | P |
| Interact/Confirm | Enter | E |
| Cancel | Escape | Backspace |
| Climb Up | W | Arrow Up |
| Climb Down | S | Arrow Down |

### Gamepad Controls (Standard Mapping)

| Action | Button |
|--------|--------|
| Move | Left Stick / D-Pad |
| Jump | A (South) |
| Attack | X (West) |
| Use Magic | Y (North) |
| Use Item | B (East) |
| Open Inventory | Select |
| Pause | Start |
| Interact | A (South) |
| Cancel | B (East) |

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame Rate | 60 FPS | Consistent on mid-range hardware |
| Draw Calls | < 100 per frame | Batch similar wireframe materials |
| Triangles | < 10,000 per room | Low-poly aesthetic helps here |
| Texture Memory | 0 MB | No textures, vertex colors only |
| Load Time | < 2 seconds | Per zone transition |
| Input Latency | < 16ms | One frame at 60 FPS |
| Memory Usage | < 200 MB | Total JavaScript heap |

### Optimization Strategies

1. **Geometry Instancing**: Reuse platform/wall geometries with different transforms
2. **Frustum Culling**: Don't render objects outside camera view
3. **LOD (optional)**: Reduce vertex count for distant objects
4. **Object Pooling**: Reuse enemy/projectile objects instead of creating new
5. **Batched Rendering**: Group objects by material to minimize state changes

---

## Accessibility Features

### Visual

- **High Contrast Mode**: Increase wireframe brightness, darken backgrounds
- **Color Blind Modes**: Alternative palettes for protanopia, deuteranopia, tritanopia
- **Screen Reader Support**: Announce room names, NPC dialogue, menu navigation
- **Reduced Motion**: Disable camera shake, slow particle effects
- **Large Text**: Scalable UI text (100%, 125%, 150%, 200%)

### Input

- **Rebindable Controls**: All keys and gamepad buttons remappable
- **One-Handed Mode**: All actions mappable to single hand
- **Hold vs Toggle**: Options for jump, attack, sprint
- **Auto-Aim Assist**: Attacks prioritize nearest enemy in facing direction

### Difficulty Modifiers

- **Invincibility Mode**: Player cannot take damage (for exploration/story)
- **Infinite Resources**: Unlimited gold, keys, items
- **Slow Motion**: 50% game speed option
- **Enhanced Starting Gear**: Begin with mid-tier equipment

---

## Testing Scenarios

### Core Mechanics

1. **Movement**: Walk left/right with momentum, stop gradually, jump with correct arc
2. **Combat**: Attack hits enemies in range, damage calculated correctly, knockback applied
3. **Collision**: Player cannot pass through walls, stands on platforms, climbs ladders
4. **Damage**: Player HP decreases on enemy contact, invulnerability frames work
5. **Death**: Player death triggers game over screen, can continue from password

### Progression

1. **Experience**: Killing enemies awards correct XP, rank increases at thresholds
2. **Gold**: Enemies drop correct gold amounts, gold persists until death/reload
3. **Equipment**: Purchased items appear in inventory, equipping changes stats and visuals
4. **Keys**: Doors require correct key type, key consumed on use
5. **Quest Items**: Rings enable correct zone access, cannot be sold

### Economy

1. **Shops**: Items purchasable with sufficient gold, rejected without
2. **Selling**: Items sell at 50% value, quest items cannot be sold
3. **King's Gold**: Receiving 1500g when at 0 gold works repeatedly
4. **Password Reset**: Loading password sets gold to rank amount, items retained

### Save System

1. **Encode**: Mantra correctly encodes all state data
2. **Decode**: Valid mantra restores correct game state
3. **Validation**: Invalid mantras rejected with error message
4. **Edge Cases**: Max rank, all items, all quest flags encode/decode correctly

### Boss Encounters

1. **Dwarf King**: Follows attack pattern, takes damage, drops rewards
2. **Evil One**: Only damaged by Dragon Slayer to head, 13 hits to defeat
3. **Victory**: Defeating Evil One triggers ending sequence

---

## Implementation Phases

### Phase 1: Core Foundation
- [ ] Project setup, React + Three.js scaffolding
- [ ] SceneManager, basic rendering pipeline
- [ ] WireframeMaterial with vertex colors
- [ ] Player model and basic movement
- [ ] Single test room with platforms

### Phase 2: Player Systems
- [ ] Full player state machine
- [ ] Combat (attack, hitboxes, damage)
- [ ] Inventory system
- [ ] Equipment visual changes
- [ ] HUD implementation

### Phase 3: Enemies & AI
- [ ] EnemyBase component
- [ ] Patrol, Leap, Projectile, Flying behaviors
- [ ] Enemy spawning and room management
- [ ] Damage dealing and death

### Phase 4: World Building
- [ ] Room/Zone data structure
- [ ] Zone transitions
- [ ] Doors and key system
- [ ] Ladders and vertical traversal
- [ ] First complete zone (Eolis + Trunk Lower)

### Phase 5: RPG Systems
- [ ] Shops and economy
- [ ] Rank/experience progression
- [ ] Magic system
- [ ] NPC dialogue

### Phase 6: Content
- [ ] All zone layouts
- [ ] All enemy types
- [ ] All equipment tiers
- [ ] Boss encounters

### Phase 7: Polish
- [ ] Save/password system
- [ ] Audio implementation
- [ ] Post-processing effects
- [ ] Accessibility features
- [ ] Performance optimization

### Phase 8: Completion
- [ ] Full playthrough testing
- [ ] Balance adjustments
- [ ] Bug fixes
- [ ] Final build

---

## Extended Features (Post-MVP)

### New Game+
- Retain equipment on restart
- Enemies deal 2x damage
- New enemy placements

### Speedrun Mode
- Built-in timer
- Segment splits
- Ghost replay

### Boss Rush
- Fight all bosses sequentially
- Timed challenge
- Leaderboards

### Level Editor
- Custom room creation
- Share via export codes
- Community levels

---

## Technical Notes

### Three.js Version
Target Three.js r150+ for modern features and performance.

### React Integration
Use `@react-three/fiber` for declarative Three.js in React, with `@react-three/drei` for helpers.

### State Management
Use React Context for global game state, with useReducer for complex state transitions.

### File Size Limits
All component files must be under 200 lines. Split larger components into sub-components.

### Naming Conventions
- Components: PascalCase (`PlayerController.jsx`)
- Hooks: camelCase with `use` prefix (`useGameLoop.js`)
- Data files: camelCase (`weapons.js`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_HEALTH`)

---

*RAXANA: A wireframe journey through a dying world, where equipment matters more than experience, and the only way out is up.*
