# Mech Arena Manager: Architect's Protocol

A spiritual successor to Armored Core: Formula Front — a mech customization and AI programming game where players design unmanned mechs for automated simulation battles.

## Description

Mech Arena Manager: Architect's Protocol is a React-based indie game where players assume the role of an "Architect" — designing, customizing, and programming AI-controlled mechs (u-Mechs) that battle autonomously. Players never directly control their mechs during combat; instead, victory depends on engineering excellence: optimal part selection, energy management, and AI behavior programming.

The game features a **free local client** for building and testing mechs, with an optional **server component** for asynchronous ranked tournaments. Battle results arrive via in-game mail, creating an engaging competitive loop without requiring simultaneous online play.

**Core Fantasy:** You are the engineer behind the machine, not the pilot inside it.

---

## Functionality

### 1. Core Game Loop

```
[Hangar] → [Build Mech] → [Program AI] → [Test Battle] → [Enter Tournament] → [Receive Results] → [Iterate]
```

#### 1.1 Hangar (Main Hub)
- Central navigation screen displaying player's mech roster
- Quick-access to Builder, AI Lab, Tournament Registry, Mail, and Profile
- Shows current rank, tournament notifications, and mech status
- Maximum 10 mech slots per player (expandable via progression)

#### 1.2 Mech Builder
The assembly interface where players construct mechs from parts across 12 categories:

| Category | Slot Count | Description |
|----------|------------|-------------|
| Head | 1 | Sensors, lock speed, AI capacity |
| Core | 1 | Central chassis, defines mech type (Standard/Boost/Drone) |
| Arms | 2 | Accuracy, manipulation, weapon stability |
| Legs | 1 | Mobility type (Biped/Reverse/Quad/Tank/Hover) |
| Generator | 1 | Energy output and capacity |
| Radiator | 1 | Heat dissipation rate |
| Booster | 1 | Thrust power, energy consumption |
| Right Weapon | 1 | Primary weapon slot |
| Left Weapon | 1 | Secondary weapon slot |
| Back Unit L | 1 | Support/heavy weapons |
| Back Unit R | 1 | Support/heavy weapons |
| Internal | 3 | Optional modules (shields, ECM, repair) |

**Build Constraints:**
- Total weight must not exceed leg capacity
- Energy drain must not exceed generator output × 1.2
- Heat generation must not exceed radiator capacity × 1.5
- AI complexity must not exceed head processing capacity

**Part Statistics (per part type):**
```
Common Stats: weight, cost, energy_drain
Head: sensor_range, lock_speed, ai_capacity, ecm_resistance
Core: armor, stability, special_type (none|boost|drone)
Arms: accuracy_bonus, recoil_control, melee_damage
Legs: weight_capacity, move_speed, turn_speed, jump_height, mobility_type
Generator: output, capacity, recharge_rate
Radiator: cooling_rate, emergency_coolant_amount
Booster: thrust, consumption, heat_per_boost
Weapons: damage, range, fire_rate, ammo, projectile_speed, stagger_value
Internal: varies by module type
```

#### 1.3 AI Lab (Behavior Programming)
Two-tier AI configuration system:

**Tier 1: Base Personality Sliders (always accessible)**
- Aggression (0-100): Distance preference, attack frequency
- Caution (0-100): Cover usage, retreat threshold
- Mobility (0-100): Movement frequency, boost usage
- Focus (0-100): Target switching vs. committed attacks
- Energy Conservation (0-100): Resource management priority

**Tier 2: Behavior Tree Editor (unlocked via progression)**
Visual node-based programming with condition and action nodes:

**Condition Nodes:**
- Enemy distance (near/mid/far)
- Own health percentage
- Own energy percentage
- Enemy count
- Cover available
- Ammo remaining
- Time elapsed
- Enemy weapon type

**Action Nodes:**
- Move toward/away from target
- Strafe left/right
- Take cover
- Attack with [weapon]
- Boost dash
- Activate special ability
- Switch target
- Emergency coolant

**Preset Chips (12 unlockable):**
Pre-built behavior modules players can slot instead of custom trees:
- Aggressive Assault, Defensive Turtle, Sniper Protocol
- Hit-and-Run, Brawler, Support Fire
- Evasion Priority, Focus Fire, Area Denial
- Balanced Combat, Energy Saver, Glass Cannon

#### 1.4 Battle Simulation
Deterministic combat resolution with visual playback:

**Battle Parameters:**
- Arena size: Small (50m²), Medium (100m²), Large (200m²)
- Arena type: Open, Urban, Industrial, Canyon
- Time limit: 180 seconds default
- Win conditions: Destroy opponent or highest HP% at timeout

**Simulation Tick Rate:** 60 ticks/second (16.67ms per tick)

**Combat Calculations per Tick:**
```
1. AI Decision Phase
   - Evaluate behavior tree from root
   - Execute first matching action
   
2. Movement Phase
   - Apply movement vectors
   - Check collision with terrain/opponent
   - Apply boost if active (drain energy, add heat)
   
3. Combat Phase
   - Process weapon fire commands
   - Calculate hit probability: base_accuracy × distance_modifier × movement_modifier
   - Apply damage if hit: base_damage × armor_modifier × critical_modifier
   - Apply stagger if threshold exceeded
   
4. Resource Phase
   - Regenerate energy (generator.output / 60)
   - Dissipate heat (radiator.cooling_rate / 60)
   - Check overheat (heat > radiator.capacity × 1.5 → forced cooldown)
   - Check energy shortage (energy < 0 → disable boosters/energy weapons)
   
5. Status Phase
   - Update status effects (stagger recovery, cooldowns)
   - Check destruction (hp <= 0)
```

**Battle Log Format:**
```json
{
  "battle_id": "uuid",
  "seed": 123456,
  "mechs": [mech_a_snapshot, mech_b_snapshot],
  "arena": { "type": "urban", "size": "medium" },
  "ticks": [
    {
      "tick": 0,
      "mech_a": { "position": [x,y], "rotation": r, "hp": 1000, "energy": 500, "heat": 0, "action": "move_forward" },
      "mech_b": { "position": [x,y], "rotation": r, "hp": 1000, "energy": 500, "heat": 0, "action": "strafe_right" },
      "events": []
    },
    // ... subsequent ticks with events like "weapon_fired", "hit", "damage", "destroyed"
  ],
  "result": { "winner": "mech_a", "reason": "destruction", "duration_ticks": 4523 }
}
```

#### 1.5 Tournament System
Asynchronous competitive play:

**Tournament Types:**
- Quick Match: Immediate 1v1 against random opponent snapshot
- Daily League: 5 matches/day, results at midnight
- Weekly Championship: Swiss-system bracket, 7 rounds
- Seasonal Ranked: Continuous ladder with Glicko-2 rating

**Tournament Flow:**
1. Player submits mech snapshot to tournament queue
2. Server matches players by rating (±200 RD overlap)
3. Server runs deterministic battle simulation
4. Results delivered via in-game mail with replay link
5. Ratings updated after rating period (24 hours)

**Glicko-2 Implementation:**
```
Initial Rating: 1500
Initial RD: 350
Initial Volatility: 0.06
Rating Period: 24 hours
Minimum games per period: 1
RD increase per inactive period: +25 (cap at 350)
```

#### 1.6 Mail System
In-game notification center:

**Mail Types:**
- Battle Results: Win/loss, opponent name, rating change, replay link
- Tournament Updates: Round results, bracket position, final standings
- System Announcements: Patch notes, events, maintenance
- Achievement Unlocks: New parts, chips, cosmetics earned

**Mail Data Structure:**
```json
{
  "id": "uuid",
  "type": "battle_result",
  "timestamp": "ISO8601",
  "read": false,
  "title": "Victory vs. SteelHunter",
  "body": "Your mech 'Nightshade' defeated 'Iron Wolf' in 2:34",
  "data": {
    "battle_id": "uuid",
    "rating_change": +15,
    "replay_available": true
  }
}
```

#### 1.7 Profile & Progression
Player statistics and unlocks:

**Progression Unlocks:**
| Level | Unlock |
|-------|--------|
| 1 | Base parts (40), 3 preset chips |
| 5 | Intermediate parts (30), behavior tree editor |
| 10 | Advanced parts (25), 3 more chips |
| 15 | Expert parts (20), custom chip saving |
| 20 | Elite parts (15), 3 more chips |
| 25 | Legendary parts (10), all chips |

**XP Sources:**
- Complete battle: 50 XP
- Win battle: +100 XP bonus
- Daily first win: +200 XP bonus
- Tournament participation: 100 XP per round
- Achievement completion: varies

---

## Technical Implementation

### Architecture Overview

```
src/
├── components/           # React UI components
│   ├── common/          # Shared UI elements
│   ├── hangar/          # Main hub screens
│   ├── builder/         # Mech assembly interface
│   ├── ailab/           # AI programming interface
│   ├── battle/          # Battle viewer/replay
│   ├── tournament/      # Competition interfaces
│   ├── mail/            # Notification system
│   └── profile/         # Player stats/settings
├── engine/              # Game logic (non-React)
│   ├── simulation/      # Battle resolution
│   ├── ai/              # Behavior tree runtime
│   ├── parts/           # Part definitions & validation
│   └── rating/          # Glicko-2 implementation
├── state/               # State management
│   ├── stores/          # Zustand stores
│   └── hooks/           # Custom React hooks
├── services/            # External communication
│   ├── api/             # Server API client
│   ├── storage/         # Local persistence
│   └── sync/            # Online/offline sync
├── assets/              # Static resources
│   ├── svg/             # SVG placeholder assets
│   └── data/            # JSON part definitions
└── utils/               # Helper functions
```

### Component Design Principles

**File Length Limits:**
- Component files: max 200 lines
- Hook files: max 150 lines
- Utility files: max 100 lines
- Split larger components into sub-components

**Component Patterns:**
```jsx
// Container/Presenter pattern example
// MechBuilder.jsx - Container (handles state)
// MechBuilderView.jsx - Presenter (handles rendering)
// MechBuilderSlots.jsx - Sub-component (specific UI section)
// useMechBuilder.js - Hook (reusable logic)
```

**Naming Conventions:**
- Components: PascalCase (`MechBuilder.jsx`)
- Hooks: camelCase with 'use' prefix (`useMechStats.js`)
- Utilities: camelCase (`calculateWeight.js`)
- Constants: SCREAMING_SNAKE_CASE (`PART_CATEGORIES.js`)

### State Management

**Zustand Stores:**

```javascript
// stores/mechStore.js
{
  mechs: Map<id, MechConfig>,
  activeMechId: string | null,
  actions: {
    createMech(name),
    deleteMech(id),
    setActiveMech(id),
    updatePart(mechId, slot, partId),
    updateAI(mechId, aiConfig)
  }
}

// stores/battleStore.js
{
  currentBattle: BattleLog | null,
  playbackState: 'stopped' | 'playing' | 'paused',
  playbackTick: number,
  playbackSpeed: 0.5 | 1 | 2 | 4,
  actions: {
    loadBattle(battleLog),
    play(), pause(), stop(),
    seekTo(tick),
    setSpeed(speed)
  }
}

// stores/playerStore.js
{
  profile: PlayerProfile,
  mail: Mail[],
  unreadCount: number,
  actions: {
    updateProfile(data),
    markMailRead(id),
    deleteMailBatch(ids)
  }
}
```

### Data Models

**MechConfig:**
```typescript
interface MechConfig {
  id: string;
  name: string;
  created: string;
  modified: string;
  parts: {
    head: string | null;        // part_id
    core: string | null;
    leftArm: string | null;
    rightArm: string | null;
    legs: string | null;
    generator: string | null;
    radiator: string | null;
    booster: string | null;
    rightWeapon: string | null;
    leftWeapon: string | null;
    backLeft: string | null;
    backRight: string | null;
    internal: (string | null)[];  // 3 slots
  };
  ai: AIConfig;
  cosmetics: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    emblem: string | null;
  };
}

interface AIConfig {
  mode: 'sliders' | 'tree' | 'chip';
  sliders: {
    aggression: number;      // 0-100
    caution: number;
    mobility: number;
    focus: number;
    energyConservation: number;
  };
  behaviorTree: BehaviorNode | null;
  chipId: string | null;
}

interface BehaviorNode {
  id: string;
  type: 'condition' | 'action' | 'sequence' | 'selector' | 'decorator';
  data: Record<string, any>;
  children: BehaviorNode[];
}
```

**Part Definition:**
```typescript
interface PartDefinition {
  id: string;
  name: string;
  category: PartCategory;
  tier: 'basic' | 'intermediate' | 'advanced' | 'expert' | 'elite' | 'legendary';
  manufacturer: string;
  description: string;
  stats: PartStats;
  unlockLevel: number;
  svgAsset: string;           // path to SVG
}

type PartCategory = 
  | 'head' | 'core' | 'arms' | 'legs' 
  | 'generator' | 'radiator' | 'booster'
  | 'weapon_rifle' | 'weapon_missile' | 'weapon_melee' | 'weapon_cannon'
  | 'internal';
```

### SVG Asset System

**Asset Structure:**
```
assets/svg/
├── parts/
│   ├── heads/
│   │   ├── head_basic_01.svg
│   │   └── head_sensor_02.svg
│   ├── cores/
│   ├── arms/
│   ├── legs/
│   ├── weapons/
│   └── internals/
├── mechs/
│   └── assembled/           # Pre-composed full mechs for previews
├── ui/
│   ├── icons/
│   ├── backgrounds/
│   └── frames/
└── arena/
    ├── terrain/
    └── effects/
```

**SVG Composition for Mech Preview:**
```jsx
// components/builder/MechPreview.jsx
const MechPreview = ({ mechConfig }) => {
  return (
    <svg viewBox="0 0 400 600" className="mech-preview">
      {/* Layered part rendering */}
      <MechLayer part="legs" partId={mechConfig.parts.legs} z={1} />
      <MechLayer part="core" partId={mechConfig.parts.core} z={2} />
      <MechLayer part="leftArm" partId={mechConfig.parts.leftArm} z={3} />
      <MechLayer part="rightArm" partId={mechConfig.parts.rightArm} z={4} />
      <MechLayer part="head" partId={mechConfig.parts.head} z={5} />
      <MechLayer part="backLeft" partId={mechConfig.parts.backLeft} z={6} />
      <MechLayer part="backRight" partId={mechConfig.parts.backRight} z={7} />
      {/* Color overlay via CSS custom properties */}
      <style>{`
        .mech-preview {
          --primary: ${mechConfig.cosmetics.primaryColor};
          --secondary: ${mechConfig.cosmetics.secondaryColor};
          --accent: ${mechConfig.cosmetics.accentColor};
        }
      `}</style>
    </svg>
  );
};
```

### Battle Simulation Engine

**Deterministic Requirements:**
- Fixed-point arithmetic for positions (1/1000 unit precision)
- Seeded PRNG (Mulberry32) for all random events
- Sorted entity processing order (by ID)
- Frame-independent physics (fixed timestep)

**Engine Interface:**
```javascript
// engine/simulation/BattleEngine.js
class BattleEngine {
  constructor(mechA, mechB, arena, seed) {
    this.state = initializeBattleState(mechA, mechB, arena);
    this.rng = createSeededRNG(seed);
    this.log = { ticks: [], events: [] };
  }
  
  tick() {
    // Returns true if battle continues, false if ended
    this.processAI();
    this.processMovement();
    this.processCombat();
    this.processResources();
    this.processStatus();
    this.log.ticks.push(this.captureState());
    return !this.checkEndCondition();
  }
  
  runToCompletion() {
    while (this.tick() && this.state.tick < MAX_TICKS) {}
    return this.generateBattleLog();
  }
}
```

### Local Storage Schema

```javascript
// IndexedDB structure
{
  stores: {
    mechs: {
      keyPath: 'id',
      indexes: ['name', 'modified']
    },
    battles: {
      keyPath: 'battle_id',
      indexes: ['timestamp', 'mech_ids']
    },
    mail: {
      keyPath: 'id', 
      indexes: ['timestamp', 'read', 'type']
    },
    settings: {
      keyPath: 'key'
    }
  }
}
```

### Server API (Optional Tournament Feature)

**Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/profile
PATCH  /api/profile

GET    /api/mechs
POST   /api/mechs/:id/snapshot     # Submit mech for tournament
DELETE /api/mechs/:id/snapshot

GET    /api/tournaments
GET    /api/tournaments/quick-match
POST   /api/tournaments/:id/enter
GET    /api/tournaments/:id/results

GET    /api/mail
PATCH  /api/mail/:id/read
DELETE /api/mail/:id

GET    /api/leaderboard
GET    /api/leaderboard/:season
```

---

## User Interface Specifications

### Screen Flow Diagram

```
                    ┌─────────────┐
                    │   Splash    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
              ┌─────│   Hangar    │─────┐
              │     └──────┬──────┘     │
              │            │            │
    ┌─────────▼───┐  ┌─────▼─────┐  ┌───▼─────────┐
    │   Builder   │  │  AI Lab   │  │  Tournaments │
    └─────────────┘  └───────────┘  └─────────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │   Battle    │
                    │   Viewer    │
                    └─────────────┘
```

### Hangar Screen
- **Layout:** 3-column grid on desktop, scrollable list on mobile
- **Mech Cards:** Show mech name, preview thumbnail, last modified date, quick stats (weight, firepower, mobility rating)
- **Actions:** New Mech (+), Edit, Duplicate, Delete, Quick Test
- **Navigation:** Sidebar with Profile, Mail (with badge), Tournament, Settings

### Builder Screen
- **Layout:** 3-panel (Part List | Mech Preview | Stats Panel)
- **Part List:** Filterable by category, searchable, shows owned vs locked
- **Mech Preview:** Live-updating SVG composite with rotation controls
- **Stats Panel:** Real-time validation (weight, energy, heat budget bars)
- **Part Comparison:** Hover shows stat diff vs current equipped

### AI Lab Screen
- **Tab System:** Sliders | Behavior Tree | Preset Chips
- **Sliders Tab:** 5 labeled sliders with visual personality indicator
- **Tree Tab:** Node canvas with drag-drop, connection lines, zoom/pan
- **Chips Tab:** Grid of unlocked chips with descriptions

### Battle Viewer Screen
- **Arena View:** Top-down or isometric SVG battlefield
- **Mech Indicators:** Health bars, energy bars, status icons
- **Timeline:** Scrubber showing battle duration, key event markers
- **Controls:** Play, Pause, Speed (0.5x, 1x, 2x, 4x), Skip to end
- **Side Panel:** Live AI decision log, damage numbers, event feed

### Tournament Screen
- **Tabs:** Quick Match | Daily League | Championships | Ranked
- **Queue Status:** "Searching..." animation, estimated wait
- **Results:** Bracket visualization, personal stats, rating history graph

### Mail Screen
- **Layout:** Master-detail on desktop, list-only on mobile
- **Inbox:** Unread bold, type icons, timestamp, preview text
- **Detail View:** Full message, action buttons (View Replay, Delete)
- **Bulk Actions:** Select all, mark read, delete selected

---

## Accessibility Requirements

- Keyboard navigation for all interactive elements
- ARIA labels for SVG graphics
- Color-blind friendly palette (no red/green only indicators)
- Minimum 4.5:1 contrast ratio for text
- Screen reader announcements for battle events
- Reducable motion option for animations
- Scalable UI (supports 100%-200% browser zoom)

---

## Performance Goals

- Initial load: < 3 seconds on 3G connection
- Battle simulation: 60 FPS playback, 10,000 ticks/second calculation
- Part list render: < 100ms for 140 parts
- State persistence: < 50ms for save operations
- Memory usage: < 200MB active session

---

## Testing Scenarios

### Builder Tests
- [ ] Equip valid part → shows in preview, updates stats
- [ ] Equip overweight build → shows warning, prevents save
- [ ] Equip energy-over-budget → shows warning, calculates shortage
- [ ] Remove required part → shows incomplete indicator
- [ ] Compare two parts → shows stat differences correctly

### AI Tests
- [ ] Slider change → affects simulated behavior immediately
- [ ] Behavior tree node connection → validates parent-child types
- [ ] Invalid tree (no root action) → shows validation error
- [ ] Chip selection → disables tree editor, shows chip description

### Battle Tests
- [ ] Same seed + mechs → identical battle outcome
- [ ] Timeline scrub → state matches tick exactly
- [ ] Speed change mid-battle → smooth transition
- [ ] Battle end → shows result overlay, offers replay

### Tournament Tests
- [ ] Submit mech with invalid build → rejected with message
- [ ] Queue for match → receives result within reasonable time
- [ ] Rating update → reflects in profile after period ends
- [ ] Offline mode → tournament features disabled with message

---

## Extended Features (Future Phases)

### Phase 2: Team Battles
- 2v2 and 3v3 formats
- Team AI coordination settings
- Combined weight limits

### Phase 3: Custom Arenas
- Arena editor tool
- Terrain placement
- Hazard configuration
- Community sharing

### Phase 4: Spectator Mode
- Live tournament viewing
- Commentator mode
- Stream integration

### Phase 5: Modding Support
- Custom part definitions (JSON)
- Custom behavior nodes
- Steam Workshop integration (if applicable)
