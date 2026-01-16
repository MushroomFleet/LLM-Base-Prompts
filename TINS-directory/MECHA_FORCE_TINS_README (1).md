# Mecha Force: Neural Tactics

A browser-based tactical combat game inspired by Dragon Force II's 100-unit battle system, replacing fantasy soldiers with customizable mecha squadrons controlled by trainable neural networks. Players manage armies, upgrade mechs, configure formations, and train AI policies that learn optimal tactics through simulated battles.

## Description

Mecha Force: Neural Tactics delivers real-time squadron combat where two forces of up to 100 mechas clash on a 2D battlefield. The game combines pre-battle army management with emergent AI behavior—neural networks learn formation switching and targeting decisions through reinforcement learning, with trained policies exportable for tournament play.

The core gameplay loop consists of: (1) managing your mecha roster in the Army Manager, (2) upgrading individual mechs with components and stat boosts, (3) selecting formation patterns ("Strategics") that provide tactical bonuses, and (4) training neural networks that autonomously command your forces during battle. All progression persists via IndexedDB.

## Core Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN MENU                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ New Game │ │ Continue │ │ Settings │ │   Exit   │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘           │
│       │            │            │                               │
│       ▼            ▼            ▼                               │
│  [Init DB]    [Load DB]   [Config Panel]                       │
└───────┬────────────┬────────────────────────────────────────────┘
        │            │
        ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMMAND CENTER                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Army Manager  │ │Mecha Upgrades │ │  Strategics   │         │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘         │
│          │                 │                 │                  │
│  ┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐         │
│  │Neural Training│ │ Battle Arena  │ │  Tournament   │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Army Manager

### Purpose
The Army Manager is the primary roster screen where players view, organize, and deploy their mecha collection. It displays all owned mechas with their stats, types, and combat readiness.

### User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ARMY MANAGER                                    [Credits: 50000]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌────────────────────────────────────┐ │
│ │   MECHA ROSTER      │  │         MECHA DETAILS              │ │
│ │ ┌─────────────────┐ │  │  ┌──────────────────────────────┐  │ │
│ │ │ [Icon] Striker  │ │  │  │  STRIKER MK-II               │  │ │
│ │ │ Type: Assault   │ │  │  │  Type: Assault               │  │ │
│ │ │ Level: 12       │ │  │  │  Level: 12 (2400/3000 XP)    │  │ │
│ │ │ HP: ████████░░  │ │  │  │                              │  │ │
│ │ └─────────────────┘ │  │  │  ┌────────┬────────┬───────┐ │  │ │
│ │ ┌─────────────────┐ │  │  │  │ ATK:87 │ DEF:45 │ SPD:72│ │  │ │
│ │ │ [Icon] Sentinel │ │  │  │  │ RNG:30 │ ACC:68 │ EVA:55│ │  │ │
│ │ │ Type: Tank      │ │  │  │  └────────┴────────┴───────┘ │  │ │
│ │ │ Level: 8        │ │  │  │                              │  │ │
│ │ │ HP: ██████████  │ │  │  │  Strong vs: Tank, Support    │  │ │
│ │ └─────────────────┘ │  │  │  Weak vs: Artillery, Sniper  │  │ │
│ │ ┌─────────────────┐ │  │  │                              │  │ │
│ │ │ [Icon] Longbow  │ │  │  │  [Upgrade] [Deploy] [Scrap]  │  │ │
│ │ │ Type: Artillery │ │  │  └──────────────────────────────┘  │ │
│ │ │ Level: 5        │ │  │                                    │ │
│ │ └─────────────────┘ │  └────────────────────────────────────┘ │
│ │                     │                                         │
│ │ [Filter▼] [Sort▼]   │  ┌────────────────────────────────────┐ │
│ │                     │  │      ACTIVE DEPLOYMENT (12/100)    │ │
│ │ Page 1/4 [<] [>]    │  │  [Striker][Sentinel][Longbow]...   │ │
│ └─────────────────────┘  └────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Back to Command Center]              [Proceed to Battle Setup] │
└─────────────────────────────────────────────────────────────────┘
```

### Mecha Types (Rock-Paper-Scissors System)

The game features 8 mecha types with explicit counter relationships:

| Type | Role | Strong Against | Weak Against |
|------|------|----------------|--------------|
| **Assault** | Balanced frontline | Tank, Support | Artillery, Sniper |
| **Tank** | High HP/DEF, slow | Artillery, Interceptor | Assault, EW |
| **Artillery** | Long range, fragile | Assault, Sniper | Tank, Interceptor |
| **Sniper** | Extreme range, single-target | Assault, Support | Artillery, Interceptor |
| **Interceptor** | Fast, flying | Artillery, Sniper, Support | Tank, EW |
| **Support** | Buffs/heals allies | Tank, EW | Assault, Sniper, Interceptor |
| **EW (Electronic Warfare)** | Debuffs enemies | Tank, Interceptor | Assault, Support |
| **Heavy** | Apex predator, expensive | All except Assault | Assault only |

**Damage Multipliers:**
- Strong against: 1.5x damage dealt, 0.75x damage received
- Weak against: 0.75x damage dealt, 1.5x damage received
- Neutral: 1.0x both ways

### Mecha Data Model

```typescript
interface Mecha {
  id: string;                    // UUID
  name: string;                  // User-customizable name
  type: MechaType;               // 'assault' | 'tank' | 'artillery' | 'sniper' | 'interceptor' | 'support' | 'ew' | 'heavy'
  level: number;                 // 1-50
  experience: number;            // Current XP toward next level
  
  // Base stats (scale with level)
  stats: {
    hp: number;                  // Health points (100-1000)
    attack: number;              // Damage output (10-150)
    defense: number;             // Damage reduction (10-100)
    speed: number;               // Movement and attack rate (10-100)
    range: number;               // Attack distance in pixels (50-400)
    accuracy: number;            // Hit chance percentage (50-100)
    evasion: number;             // Dodge chance percentage (0-50)
  };
  
  // Equipment slots
  equipment: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    module: EquipmentItem | null;
  };
  
  // State
  isDeployed: boolean;           // Currently in active deployment
  currentHp: number;             // HP after last battle (persists)
  repairCost: number;            // Credits to restore full HP
  
  // Metadata
  battlesWon: number;
  battlesLost: number;
  totalDamageDealt: number;
  totalKills: number;
  dateAcquired: number;          // Unix timestamp
}

type MechaType = 'assault' | 'tank' | 'artillery' | 'sniper' | 'interceptor' | 'support' | 'ew' | 'heavy';
```

### Interactions

**Selecting a Mecha:**
- Click any mecha card in the roster list
- Selected mecha highlights with border glow
- Details panel updates to show selected mecha's full stats
- Keyboard: Arrow keys navigate, Enter selects

**Deploying a Mecha:**
- Click "Deploy" button in details panel (or double-click roster card)
- Mecha moves to Active Deployment bar at bottom
- Maximum 100 mechas can be deployed
- Deployed mechas show checkmark overlay in roster

**Removing from Deployment:**
- Click mecha in Active Deployment bar
- Click "Remove" in popup, or drag back to roster
- Mecha returns to roster without checkmark

**Filtering Roster:**
- Filter dropdown: All, By Type (8 options), Deployed Only, Available Only, Damaged
- Multiple filters can stack (e.g., "Assault" + "Damaged")

**Sorting Roster:**
- Sort dropdown: Level (High/Low), HP (High/Low), Attack, Speed, Name (A-Z/Z-A), Date Acquired
- Default: Level (High to Low)

**Scrapping a Mecha:**
- Click "Scrap" in details panel
- Confirmation modal: "Scrap [Mecha Name] for [X] credits?"
- Returns credits equal to: (base_cost × level × 0.3)
- Removed from database permanently

---

## Section 2: Mecha Upgrades

### Purpose
The Upgrade screen allows players to enhance individual mechas through leveling, stat allocation, and equipment management.

### User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ MECHA UPGRADES                                  [Credits: 50000]│
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐   │
│ │              STRIKER MK-II (Level 12)                     │   │
│ │   ┌─────────┐                                             │   │
│ │   │ [Mecha  │    XP: ████████████░░░░ 2400/3000          │   │
│ │   │  Visual │    Type: Assault                            │   │
│ │   │  200px  │    Battles: 47W / 12L (79.7%)              │   │
│ │   └─────────┘                                             │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────┐  ┌────────────────────────────────┐ │
│ │      STAT ALLOCATION    │  │        EQUIPMENT               │ │
│ │                         │  │                                │ │
│ │  Points Available: 3    │  │  Weapon: [Plasma Cannon Mk3]  │ │
│ │                         │  │    +15 ATK, +5 ACC            │ │
│ │  HP:  87 [+][-]  +10/pt │  │    [Change] [Remove]          │ │
│ │  ATK: 87 [+][-]  +3/pt  │  │                                │ │
│ │  DEF: 45 [+][-]  +2/pt  │  │  Armor:  [Reactive Plating]   │ │
│ │  SPD: 72 [+][-]  +2/pt  │  │    +20 DEF, -5 SPD            │ │
│ │  RNG: 30 [+][-]  +10/pt │  │    [Change] [Remove]          │ │
│ │  ACC: 68 [+][-]  +1/pt  │  │                                │ │
│ │  EVA: 55 [+][-]  +1/pt  │  │  Module:  [Empty]             │ │
│ │                         │  │    [Equip]                     │ │
│ │  [Apply] [Reset]        │  │                                │ │
│ └─────────────────────────┘  └────────────────────────────────┘ │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │                    TRAINING OPTIONS                        │   │
│ │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │   │
│ │  │ Quick Train  │ │ Intensive    │ │ Specialization│       │   │
│ │  │ 500 credits  │ │ 2000 credits │ │ 5000 credits  │       │   │
│ │  │ +100 XP      │ │ +500 XP      │ │ +1 stat point │       │   │
│ │  └──────────────┘ └──────────────┘ └──────────────────────┘   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Back to Army Manager]                         [Save Changes]   │
└─────────────────────────────────────────────────────────────────┘
```

### Leveling System

**XP Requirements per Level:**
```
Level 1→2:   100 XP
Level 2→3:   200 XP
Level 3→4:   350 XP
Level 4→5:   550 XP
...
Formula: XP_required = floor(50 * level^1.5)
Max Level: 50
```

**XP Sources:**
- Victory: 100 XP per mecha that survived
- Defeat: 25 XP per mecha that participated
- Kills: +10 XP per enemy mecha destroyed
- Training: Purchased with credits

**Level-Up Rewards:**
- +1 Stat Allocation Point per level
- +5% base stat growth (all stats)
- Equipment tier unlocks at levels 10, 20, 30, 40

### Stat Allocation

Players receive 1 point per level to allocate freely. Points can be redistributed at any time before applying.

**Stat Point Values:**
| Stat | Points per +1 | Effect |
|------|---------------|--------|
| HP | +10 | More survivability |
| ATK | +3 | Higher damage |
| DEF | +2 | Damage reduction |
| SPD | +2 | Faster movement/attacks |
| RNG | +10 pixels | Attack from further |
| ACC | +1% | Better hit chance |
| EVA | +1% | Better dodge chance |

### Equipment System

**Equipment Data Model:**
```typescript
interface EquipmentItem {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'module';
  tier: 1 | 2 | 3 | 4;              // Unlocked at levels 1/10/20/30
  requiredLevel: number;
  statModifiers: Partial<MechaStats>;
  specialEffect?: SpecialEffect;
  cost: number;
}

interface SpecialEffect {
  type: 'lifesteal' | 'aoe_damage' | 'shield' | 'stealth' | 'radar' | 'repair';
  value: number;
  description: string;
}
```

**Example Equipment:**
```json
{
  "id": "wpn_plasma_cannon_3",
  "name": "Plasma Cannon Mk3",
  "slot": "weapon",
  "tier": 2,
  "requiredLevel": 10,
  "statModifiers": { "attack": 15, "accuracy": 5 },
  "specialEffect": {
    "type": "aoe_damage",
    "value": 0.3,
    "description": "30% damage splashes to adjacent enemies"
  },
  "cost": 3000
}
```

### Equipment Inventory Modal

When clicking "Change" on any slot:

```
┌─────────────────────────────────────────────────────────────────┐
│ SELECT WEAPON                                    [X Close]      │
├─────────────────────────────────────────────────────────────────┤
│ Owned Equipment:                                                │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ ★★☆☆ Plasma Cannon Mk3     +15 ATK, +5 ACC    [Equip]   │    │
│ │ ★★★☆ Rail Gun             +25 ATK, -10 SPD   [Equip]   │    │
│ │ ★☆☆☆ Standard Blaster     +5 ATK             [Equip]   │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Shop:                                          [View Shop →]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 3: Strategics (Formation Patterns)

### Purpose
Strategics defines the spatial arrangement of mechas during battle. Different formations provide stat bonuses and unlock based on army composition.

### User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ STRATEGICS - Formation Patterns                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Current Army Composition: 40 Assault, 30 Tank, 20 Artillery,   │
│                            10 Support                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AVAILABLE FORMATIONS                        │    │
│  │                                                          │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │    │
│  │  │  STANDARD  │  │   WEDGE    │  │   WALL     │         │    │
│  │  │   ○○○○○    │  │     ○      │  │  ○○○○○○○   │         │    │
│  │  │   ○○○○○    │  │    ○○○    │  │  ○○○○○○○   │         │    │
│  │  │   ○○○○○    │  │   ○○○○○  │  │  ○○○○○○○   │         │    │
│  │  │            │  │  ○○○○○○○ │  │            │         │    │
│  │  │ No Bonus   │  │ +15% ATK   │  │ +20% DEF   │         │    │
│  │  │ [Unlocked] │  │ [Unlocked] │  │ [Unlocked] │         │    │
│  │  └────────────┘  └────────────┘  └────────────┘         │    │
│  │                                                          │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │    │
│  │  │   PINCER   │  │  SCATTER   │  │   TURTLE   │         │    │
│  │  │  ○○   ○○  │  │ ○  ○  ○   │  │    ○○○     │         │    │
│  │  │ ○○     ○○ │  │  ○  ○  ○  │  │  ○○○○○○   │         │    │
│  │  │○○       ○○│  │ ○  ○  ○   │  │ ○○[CMD]○○  │         │    │
│  │  │            │  │            │  │  ○○○○○○   │         │    │
│  │  │ +10% SPD   │  │ +25% EVA   │  │ +30% DEF   │         │    │
│  │  │ Req: Int.  │  │ [Unlocked] │  │ Req: Tank  │         │    │
│  │  └────────────┘  └────────────┘  └────────────┘         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Selected: WEDGE                                                │
│  Bonus: +15% Attack to all deployed mechas                      │
│                                                                 │
│  [Preview in Simulator]                    [Confirm Selection]  │
└─────────────────────────────────────────────────────────────────┘
```

### Formation Definitions

| Formation | Visual Pattern | Stat Bonus | Unlock Requirement |
|-----------|----------------|------------|-------------------|
| **Standard** | Even grid | None | Always available |
| **Wedge** | Arrow pointing forward | +15% ATK | Always available |
| **Wall** | Horizontal lines | +20% DEF | Always available |
| **Pincer** | Two flanking groups | +10% SPD, flanking bonus | Min 10 Interceptor |
| **Scatter** | Spread across field | +25% EVA | Min 20 mixed types |
| **Turtle** | Commander protected center | +30% DEF, -10% SPD | Min 30 Tank |
| **Spear** | Narrow column | +25% ATK, -15% DEF | Min 30 Assault |
| **Skirmish** | Diagonal lines | +15% SPD, +10% ACC | Min 20 Sniper/Artillery |

### Formation Data Model

```typescript
interface Formation {
  id: string;
  name: string;
  pattern: FormationPattern;        // Pixel positions for each unit slot
  bonuses: {
    attack?: number;                // Percentage modifier
    defense?: number;
    speed?: number;
    accuracy?: number;
    evasion?: number;
  };
  penalties?: {
    attack?: number;
    defense?: number;
    speed?: number;
  };
  unlockRequirement: UnlockRequirement | null;
  description: string;
}

interface FormationPattern {
  positions: Array<{
    x: number;                      // 0-100 percentage of battlefield width
    y: number;                      // 0-100 percentage of battlefield height
    slot: number;                   // Which mecha fills this position (1-100)
  }>;
  commanderPosition: { x: number; y: number };
}

interface UnlockRequirement {
  type: 'min_type_count' | 'min_total' | 'composition_ratio';
  mechaType?: MechaType;
  count?: number;
  ratio?: number;
}
```

### Formation Selection Logic

1. System checks current deployment against all formation unlock requirements
2. Unlocked formations display normally; locked formations show grayed with requirement text
3. Player selects one formation for the upcoming battle
4. Formation selection can be changed between battles
5. During battle, formation is LOCKED (no mid-battle switching by player)

### Real-Time Formation Switching (Neural Net Controlled)

The trained neural network can trigger formation transitions during battle. Available commands sent to units:

| Command | Effect |
|---------|--------|
| ADVANCE | All units move toward enemy |
| RETREAT | All units pull back toward commander |
| HOLD | Units stop moving, engage in range |
| DISPERSE | Units spread to avoid AOE |
| CONVERGE | Units cluster for concentrated fire |
| FLANK_LEFT | Left half advances, right holds |
| FLANK_RIGHT | Right half advances, left holds |
| MELEE | Irreversible: all units charge, no retreat |

---

## Section 4: Neural Net Training

### Purpose
Train neural networks to autonomously control mecha squadrons during battle. Networks learn formation commands and targeting priorities through simulated combat.

### User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ NEURAL NET TRAINING                                             │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌──────────────────────────────────┐ │
│ │   SAVED NETWORKS      │  │       TRAINING ARENA             │ │
│ │                       │  │  ┌────────────────────────────┐  │ │
│ │ ● AlphaSquad v3.2     │  │  │                            │  │ │
│ │   Win Rate: 78.4%     │  │  │    [Live Battle Preview]   │  │ │
│ │   Battles: 1,240      │  │  │                            │  │ │
│ │   [Load] [Export]     │  │  │   Blue: 67  vs  Red: 54    │  │ │
│ │                       │  │  │                            │  │ │
│ │ ○ Defensive_Net v1    │  │  │   Epoch: 847/1000          │  │ │
│ │   Win Rate: 61.2%     │  │  │   Current Loss: 0.0234     │  │ │
│ │   Battles: 520        │  │  │                            │  │ │
│ │   [Load] [Export]     │  │  └────────────────────────────┘  │ │
│ │                       │  │                                  │ │
│ │ ○ Aggressive_v2       │  │  Training Progress:              │ │
│ │   Win Rate: 72.1%     │  │  ████████████░░░░░░░░ 62%       │ │
│ │   Battles: 890        │  │                                  │ │
│ │                       │  │  [Pause] [Stop] [Speed: 4x▼]    │ │
│ │ [New Network]         │  │                                  │ │
│ └───────────────────────┘  └──────────────────────────────────┘ │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │                   TRAINING CONFIGURATION                   │   │
│ │                                                            │   │
│ │  Training Mode:  ○ Self-Play  ● vs Opponents  ○ Curriculum │   │
│ │                                                            │   │
│ │  Opponent Pool:  [✓] Random AI  [✓] Previous Versions      │   │
│ │                  [ ] Imported Networks                     │   │
│ │                                                            │   │
│ │  Army Config:    [Use Current Deployment ▼]                │   │
│ │                                                            │   │
│ │  Epochs: [1000]    Learning Rate: [0.001]                  │   │
│ │                                                            │   │
│ │  [Start Training]                  [Advanced Settings →]   │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Back to Command Center]                    [Import Network]    │
└─────────────────────────────────────────────────────────────────┘
```

### Neural Network Architecture

**Library:** TensorFlow.js for browser-native training and inference

**Network Type:** Policy Gradient Network (REINFORCE algorithm)

**Input State Vector (68 dimensions):**
```typescript
interface BattleState {
  // Friendly forces (34 values)
  friendlyCount: number;           // 0-100 normalized to 0-1
  friendlyHpRatio: number;         // Average HP percentage
  friendlyTypeDistribution: number[]; // 8 values (one per mecha type)
  friendlyFormation: number[];     // 8 one-hot encoded current formation
  friendlyCommanderHp: number;     // 0-1
  friendlyAveragePosition: { x: number; y: number }; // Normalized 0-1
  friendlySpread: number;          // Standard deviation of positions
  friendlyDamageDealtThisTick: number;
  friendlyUnitsLostThisTick: number;
  // More friendly stats...
  
  // Enemy forces (34 values - mirrors friendly)
  enemyCount: number;
  enemyHpRatio: number;
  enemyTypeDistribution: number[];
  enemyFormation: number[];
  enemyCommanderHp: number;
  enemyAveragePosition: { x: number; y: number };
  enemySpread: number;
  enemyDamageDealtThisTick: number;
  enemyUnitsLostThisTick: number;
  // More enemy stats...
}
```

**Output Actions (16 dimensions):**
```typescript
interface ActionProbabilities {
  // Formation commands (8 values, softmax)
  commands: {
    advance: number;
    retreat: number;
    hold: number;
    disperse: number;
    converge: number;
    flankLeft: number;
    flankRight: number;
    melee: number;
  };
  
  // Targeting priority (8 values, softmax over enemy types)
  targetPriority: {
    assault: number;
    tank: number;
    artillery: number;
    sniper: number;
    interceptor: number;
    support: number;
    ew: number;
    heavy: number;
  };
}
```

**Network Layers:**
```
Input Layer: 68 neurons
Hidden Layer 1: 128 neurons, ReLU activation
Hidden Layer 2: 64 neurons, ReLU activation
Output Layer (commands): 8 neurons, Softmax
Output Layer (targeting): 8 neurons, Softmax
```

### Training Process

**Self-Play Training:**
1. Initialize two copies of current network
2. Run simulated battle at 10x speed
3. Every 500ms game-time, both networks output actions
4. Actions executed, battle state updated
5. At battle end, winner receives +1 reward, loser -1
6. Policy gradient update applied based on action log probabilities

**Reward Shaping:**
```typescript
function calculateReward(battle: BattleResult, actions: ActionLog[]): number {
  let reward = 0;
  
  // Primary objective
  if (battle.winner === 'player') reward += 1.0;
  else reward -= 1.0;
  
  // Secondary rewards
  reward += (battle.enemyUnitsKilled / 100) * 0.3;
  reward -= (battle.friendlyUnitsLost / 100) * 0.2;
  reward += (battle.commanderHpRemaining) * 0.2;
  
  // Efficiency bonus
  if (battle.winner === 'player' && battle.timeRemaining > 30) {
    reward += 0.1; // Quick victory bonus
  }
  
  return reward;
}
```

### Network Export/Import

**Export Format:**
```typescript
interface ExportedNetwork {
  version: string;                 // "1.0"
  name: string;
  metadata: {
    trainedEpochs: number;
    winRate: number;
    totalBattles: number;
    armyComposition: MechaType[];
    exportDate: number;
  };
  weights: string;                 // Base64-encoded TensorFlow.js weights
  architecture: string;            // JSON topology
}
```

**File Extension:** `.mfnet` (Mecha Force Network)

**Export Process:**
1. Click "Export" on saved network
2. System serializes weights via `model.save('downloads://filename')`
3. Browser downloads `[network_name].mfnet` file

**Import Process:**
1. Click "Import Network"
2. File picker opens for `.mfnet` files
3. System validates version compatibility
4. Network added to opponent pool or saved networks

---

## Section 5: Battle Arena

### Purpose
Real-time 100 vs 100 mecha combat with 90-second time limit. Neural networks control both sides, with player able to spectate or intervene.

### Battlefield Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BATTLE ARENA                                          Time: 01:23      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PLAYER: 78 units                              ENEMY: 65 units          │
│  CMD HP: ████████░░                            CMD HP: ██████░░░░       │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │    [P]                                                      [E]     │ │
│ │     ○○○                                                    ○○○      │ │
│ │    ○○○○○           ←── Battlefield (800x400 px) ──→       ○○○○     │ │
│ │   ○○○○○○○                                                 ○○○○○    │ │
│ │    ○○○○○               ●●● ←─ Combat Zone ─→ ●●●         ○○○○○     │ │
│ │     ○○○                     (mechas clash)                ○○○○      │ │
│ │                                                                     │ │
│ │  [P] = Player Commander (stationary rear left)                      │ │
│ │  [E] = Enemy Commander (stationary rear right)                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Neural Net: AlphaSquad v3.2            Enemy: Random AI Lv.12         │
│  Last Command: ADVANCE                  Last Command: HOLD             │
│                                                                         │
│  [Pause]  [Override: Manual Control]  [Speed: 1x ▼]  [Surrender]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Battle Flow

**Initialization:**
1. Load player deployment (up to 100 mechas)
2. Generate or load enemy army
3. Apply formation patterns to position units
4. Both commanders placed at rear positions
5. 3-second countdown begins

**Combat Loop (60 FPS):**
```typescript
function battleTick(deltaTime: number): void {
  // 1. Neural network decision (every 500ms game-time)
  if (gameTime % 500 === 0) {
    const state = extractBattleState();
    const playerAction = playerNetwork.predict(state);
    const enemyAction = enemyNetwork.predict(state);
    executeCommand(playerAction.command, 'player');
    executeCommand(enemyAction.command, 'enemy');
    setTargetPriority(playerAction.targetPriority, 'player');
    setTargetPriority(enemyAction.targetPriority, 'enemy');
  }
  
  // 2. Unit movement
  for (const mecha of allMechas) {
    mecha.move(deltaTime);
  }
  
  // 3. Combat resolution
  for (const mecha of allMechas) {
    if (mecha.canAttack()) {
      const target = selectTarget(mecha);
      if (target) {
        const damage = calculateDamage(mecha, target);
        target.takeDamage(damage);
        if (target.hp <= 0) {
          destroyMecha(target);
        }
      }
    }
  }
  
  // 4. Check victory conditions
  checkVictoryConditions();
  
  // 5. Update UI
  renderBattlefield();
}
```

### Damage Calculation

```typescript
function calculateDamage(attacker: Mecha, defender: Mecha): number {
  // Base damage
  let damage = attacker.stats.attack;
  
  // Type effectiveness
  const effectiveness = getTypeEffectiveness(attacker.type, defender.type);
  damage *= effectiveness; // 0.75, 1.0, or 1.5
  
  // Formation bonus
  damage *= (1 + attacker.formationBonus.attack);
  
  // Accuracy check
  const hitChance = attacker.stats.accuracy - defender.stats.evasion;
  if (Math.random() * 100 > hitChance) {
    return 0; // Miss
  }
  
  // Defense reduction
  damage -= defender.stats.defense * 0.5;
  damage = Math.max(damage, 1); // Minimum 1 damage
  
  // Critical hit (5% chance, 2x damage)
  if (Math.random() < 0.05) {
    damage *= 2;
  }
  
  return Math.floor(damage);
}
```

### Victory Conditions

| Condition | Result |
|-----------|--------|
| Enemy commander HP reaches 0 | **VICTORY** |
| All enemy mechas destroyed | **VICTORY** (or commander duel option) |
| Player commander HP reaches 0 | **DEFEAT** |
| All player mechas destroyed | **DEFEAT** |
| Time expires (90 seconds) | Compare remaining forces; higher total HP% wins |

### Commander Duel

When both armies are eliminated:
1. Modal appears: "All units destroyed! Commander Duel?"
2. Options: [Accept Duel] [Retreat]
3. If duel accepted: automated 1v1 based on commander stats
4. Duel outcome: `winner = commander with higher (ATK + DEF + SPD) * remaining HP%`

---

## Section 6: Data Persistence (IndexedDB)

### Database Schema

```typescript
// Database: 'MechaForceDB'
// Version: 1

interface DBSchema {
  stores: {
    // Player profile and resources
    player: {
      key: 'singleton';
      value: PlayerData;
    };
    
    // Mecha collection
    mechas: {
      key: string;          // mecha.id
      value: Mecha;
      indexes: ['type', 'level', 'isDeployed'];
    };
    
    // Equipment inventory
    equipment: {
      key: string;          // item.id
      value: EquipmentItem;
      indexes: ['slot', 'tier'];
    };
    
    // Saved neural networks
    networks: {
      key: string;          // network.id
      value: SavedNetwork;
      indexes: ['winRate', 'trainedEpochs'];
    };
    
    // Battle history
    battles: {
      key: string;          // battle.id
      value: BattleRecord;
      indexes: ['timestamp', 'result'];
    };
    
    // Settings
    settings: {
      key: string;          // setting name
      value: any;
    };
  };
}

interface PlayerData {
  id: string;
  credits: number;
  totalBattles: number;
  totalWins: number;
  totalLosses: number;
  currentDeployment: string[];    // Array of mecha IDs
  activeFormation: string;        // Formation ID
  activeNetwork: string | null;   // Network ID
  tutorialCompleted: boolean;
  createdAt: number;
  lastPlayedAt: number;
}

interface SavedNetwork {
  id: string;
  name: string;
  weights: ArrayBuffer;           // Serialized TensorFlow.js weights
  topology: string;               // JSON model architecture
  metadata: {
    trainedEpochs: number;
    winRate: number;
    totalBattles: number;
    createdAt: number;
    lastTrainedAt: number;
  };
}

interface BattleRecord {
  id: string;
  timestamp: number;
  result: 'victory' | 'defeat' | 'draw';
  playerUnitsStart: number;
  playerUnitsEnd: number;
  enemyUnitsStart: number;
  enemyUnitsEnd: number;
  duration: number;               // Seconds
  networkUsed: string | null;
  enemyType: string;
  rewardsEarned: {
    credits: number;
    xp: number;
  };
}
```

### Data Operations

**New Game Initialization:**
```typescript
async function initializeNewGame(): Promise<void> {
  const db = await openDB('MechaForceDB', 1);
  
  // Create starter mechas (10 units)
  const starterMechas = generateStarterArmy();
  for (const mecha of starterMechas) {
    await db.put('mechas', mecha);
  }
  
  // Initialize player data
  const playerData: PlayerData = {
    id: generateUUID(),
    credits: 10000,
    totalBattles: 0,
    totalWins: 0,
    totalLosses: 0,
    currentDeployment: starterMechas.map(m => m.id),
    activeFormation: 'standard',
    activeNetwork: null,
    tutorialCompleted: false,
    createdAt: Date.now(),
    lastPlayedAt: Date.now()
  };
  await db.put('player', playerData, 'singleton');
  
  // Initialize default settings
  await db.put('settings', { volume: 0.7 }, 'audio');
  await db.put('settings', { speed: 1 }, 'battle');
}
```

**Continue Game Load:**
```typescript
async function loadGame(): Promise<GameState> {
  const db = await openDB('MechaForceDB', 1);
  
  const player = await db.get('player', 'singleton');
  if (!player) throw new Error('No saved game found');
  
  const mechas = await db.getAll('mechas');
  const equipment = await db.getAll('equipment');
  const networks = await db.getAll('networks');
  const settings = await db.getAll('settings');
  
  return {
    player,
    mechas,
    equipment,
    networks,
    settings: Object.fromEntries(settings.map(s => [s.key, s.value]))
  };
}
```

---

## Section 7: Settings

### Settings Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AUDIO                                                          │
│  ├─ Master Volume    ████████░░░░░░░░ 50%                      │
│  ├─ Music Volume     ██████████████░░ 80%                      │
│  └─ SFX Volume       ████████████░░░░ 70%                      │
│                                                                 │
│  DISPLAY                                                        │
│  ├─ Battle Speed     [1x ▼]  (1x, 2x, 4x, 8x)                  │
│  ├─ Show Damage Numbers  [✓]                                   │
│  ├─ Show HP Bars         [✓]                                   │
│  └─ Particle Effects     [✓]                                   │
│                                                                 │
│  NEURAL NET                                                     │
│  ├─ Training Speed   [4x ▼]  (1x, 2x, 4x, 8x, Max)             │
│  ├─ Auto-Save Networks  [✓] Every [100] epochs                 │
│  └─ Live Preview During Training  [✓]                          │
│                                                                 │
│  DATA                                                           │
│  ├─ Export Save Data    [Export to JSON]                       │
│  ├─ Import Save Data    [Import from JSON]                     │
│  └─ Reset All Data      [Reset] (requires confirmation)        │
│                                                                 │
│  [Save Settings]                              [Back to Menu]    │
└─────────────────────────────────────────────────────────────────┘
```

### Settings Data Model

```typescript
interface GameSettings {
  audio: {
    masterVolume: number;        // 0-1
    musicVolume: number;         // 0-1
    sfxVolume: number;           // 0-1
  };
  display: {
    battleSpeed: 1 | 2 | 4 | 8;
    showDamageNumbers: boolean;
    showHpBars: boolean;
    particleEffects: boolean;
  };
  neuralNet: {
    trainingSpeed: 1 | 2 | 4 | 8 | 'max';
    autoSaveNetworks: boolean;
    autoSaveInterval: number;    // Epochs between auto-saves
    livePreview: boolean;
  };
}
```

---

## Technical Implementation

### Technology Stack

- **Framework:** React 18+ with TypeScript
- **State Management:** React Context + useReducer for global state
- **Styling:** Tailwind CSS
- **Neural Network:** TensorFlow.js
- **Database:** IndexedDB via idb library
- **Build Tool:** Vite

### Component Architecture

```
src/
├── components/
│   ├── MainMenu/
│   │   └── MainMenu.tsx
│   ├── CommandCenter/
│   │   └── CommandCenter.tsx
│   ├── ArmyManager/
│   │   ├── ArmyManager.tsx
│   │   ├── MechaCard.tsx
│   │   ├── MechaDetails.tsx
│   │   └── DeploymentBar.tsx
│   ├── MechaUpgrades/
│   │   ├── MechaUpgrades.tsx
│   │   ├── StatAllocation.tsx
│   │   └── EquipmentPanel.tsx
│   ├── Strategics/
│   │   ├── Strategics.tsx
│   │   └── FormationPreview.tsx
│   ├── NeuralTraining/
│   │   ├── NeuralTraining.tsx
│   │   ├── NetworkList.tsx
│   │   ├── TrainingArena.tsx
│   │   └── TrainingConfig.tsx
│   ├── BattleArena/
│   │   ├── BattleArena.tsx
│   │   ├── Battlefield.tsx
│   │   ├── MechaSprite.tsx
│   │   └── BattleHUD.tsx
│   └── Settings/
│       └── Settings.tsx
├── hooks/
│   ├── useDatabase.ts
│   ├── useBattle.ts
│   └── useNeuralNetwork.ts
├── services/
│   ├── database.ts
│   ├── battleEngine.ts
│   └── neuralNetwork.ts
├── types/
│   └── index.ts
├── utils/
│   ├── damageCalculation.ts
│   ├── typeEffectiveness.ts
│   └── formations.ts
├── App.tsx
└── main.tsx
```

### Performance Requirements

- Battle loop must maintain 60 FPS with 200 units on screen
- Neural network inference must complete within 16ms
- IndexedDB operations should be non-blocking
- Training at 8x speed should not freeze UI

### Accessibility Requirements

- All interactive elements keyboard accessible
- Focus indicators visible on all focusable elements
- Color contrast ratio minimum 4.5:1
- Screen reader announcements for battle events
- Pause functionality in all timed scenarios

---

## Testing Scenarios

### Army Manager Tests
- [ ] Can view all owned mechas in scrollable list
- [ ] Clicking mecha shows detailed stats panel
- [ ] Can deploy mechas up to 100 unit limit
- [ ] Cannot deploy more than 100 mechas (button disabled)
- [ ] Can remove mechas from deployment
- [ ] Filter by type shows only matching mechas
- [ ] Sort by level correctly orders list
- [ ] Scrapping mecha removes it and awards credits

### Upgrade Tests
- [ ] XP bar reflects correct progress to next level
- [ ] Level up grants stat allocation point
- [ ] Stat allocation changes preview in real-time
- [ ] Cannot allocate more points than available
- [ ] Equipment can be equipped to correct slots
- [ ] Equipment stat bonuses apply correctly
- [ ] Training options deduct credits and grant XP

### Strategics Tests
- [ ] Available formations display based on army composition
- [ ] Locked formations show unlock requirements
- [ ] Selecting formation updates preview
- [ ] Formation bonuses apply in battle

### Neural Network Tests
- [ ] New network can be created with default architecture
- [ ] Training progresses and updates loss graph
- [ ] Trained network can be saved
- [ ] Saved network can be loaded for battle
- [ ] Network can be exported to .mfnet file
- [ ] Imported .mfnet file adds to network list
- [ ] Win rate updates after battles

### Battle Tests
- [ ] Battle starts with correct unit counts
- [ ] Mechas move according to commands
- [ ] Damage calculation matches type effectiveness
- [ ] Units destroyed when HP reaches 0
- [ ] Commander duel triggers when armies depleted
- [ ] Victory/defeat correctly determined
- [ ] Battle rewards (credits, XP) applied post-battle

### Persistence Tests
- [ ] New game creates fresh database
- [ ] Continue game loads all data correctly
- [ ] Settings persist between sessions
- [ ] Battle history records correctly

---

## Style Guide

### Color Palette

```css
:root {
  --bg-primary: #0a0a0f;         /* Deep space black */
  --bg-secondary: #1a1a2e;       /* Dark blue-gray */
  --bg-tertiary: #252540;        /* Lighter panel */
  
  --accent-primary: #00d4ff;     /* Cyan highlight */
  --accent-secondary: #7b2cbf;   /* Purple accent */
  --accent-warning: #ff6b35;     /* Orange warning */
  --accent-success: #00ff88;     /* Green success */
  --accent-danger: #ff3366;      /* Red danger */
  
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --text-muted: #606070;
  
  --border-color: #3a3a5c;
}
```

### Typography

- **Headings:** 'Orbitron', sans-serif (futuristic, mechanical)
- **Body:** 'Rajdhani', sans-serif (clean, technical)
- **Monospace:** 'JetBrains Mono', monospace (stats, numbers)

### Mecha Type Colors

```css
--type-assault: #ff4444;     /* Red */
--type-tank: #4488ff;        /* Blue */
--type-artillery: #ffaa00;   /* Orange */
--type-sniper: #aa44ff;      /* Purple */
--type-interceptor: #44ffaa; /* Teal */
--type-support: #88ff44;     /* Lime */
--type-ew: #ff44aa;          /* Pink */
--type-heavy: #ffffff;       /* White */
```

### Animation Guidelines

- UI transitions: 200ms ease-out
- Battle unit movement: Linear interpolation
- Damage numbers: Float up with fade (500ms)
- Victory/defeat: Screen flash + modal slide (400ms)

---

## Extended Features (Future Considerations)

- **Multiplayer Tournaments:** Online battles with network-vs-network competition
- **Campaign Mode:** Story-driven progression with boss battles
- **Mecha Customization:** Visual appearance modifications
- **Faction System:** Different starting bonuses and exclusive mecha types
- **Replay System:** Save and share battle recordings
- **Leaderboards:** Global rankings for win rates and network performance
