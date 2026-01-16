# Wireframe Pirates! — A Sid Meier's Pirates! Clone

## Description

**Wireframe Pirates!** is a browser-based open-world pirate adventure game heavily inspired by Sid Meier's Pirates! (1987/2004). Built with React, Three.js (via React Three Fiber, Drei, and custom shaders), the game presents the entire 17th-century Caribbean experience through stylized **wireframe SVGA graphics** with retro shader effects—eliminating the need for PNG/texture assets entirely.

Players assume the role of a privateer captain, navigating the Caribbean seas, engaging in ship-to-ship combat, boarding enemy vessels, trading commodities at ports, raiding towns, and building reputation with four colonial powers. The distinctive wireframe aesthetic creates a unique retro-futuristic feel reminiscent of early vector graphics games while maintaining the deep gameplay systems of the original Pirates!

The game features realistic wind-based sailing mechanics where ship movement is affected by wind speed, direction, and the vessel's point of sailing. Combat includes both naval broadsides and sword-fighting duels. Economic gameplay centers on trading goods between ports with dynamic pricing based on port wealth and colonial ownership.

---

## Functionality

### Core Game Loop

The player experiences an open-world sandbox with the following activities available at any time:
1. **Sailing** — Navigate the Caribbean map, affected by wind conditions
2. **Naval Combat** — Engage enemy ships with cannons and boarding actions
3. **Port Visits** — Trade, recruit crew, repair ships, gain promotions
4. **Town Raids** — Attack and potentially capture enemy settlements
5. **Quests** — Hunt pirates, find buried treasure, rescue family members

### Game States

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME STATES                              │
├─────────────────────────────────────────────────────────────────┤
│  MAIN_MENU ──► CHARACTER_CREATION ──► SAILING_MAP              │
│                                            │                    │
│       ┌────────────────────────────────────┼───────────────┐   │
│       │                                    │               │   │
│       ▼                                    ▼               ▼   │
│  NAVAL_COMBAT ◄──────────────────►  PORT_VISIT    TOWN_RAID   │
│       │                                    │               │   │
│       ▼                                    │               │   │
│  BOARDING_DUEL ◄───────────────────────────┘               │   │
│       │                                                    │   │
│       └────────────────► DIVIDE_PLUNDER ◄──────────────────┘   │
│                                │                               │
│                                ▼                               │
│                          RETIREMENT                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sailing Map System

### Map Geography

The Caribbean map spans approximately **3000x2000 game units**, representing:
- **Northern boundary**: Bermuda / Florida Keys
- **Southern boundary**: Northern coast of South America (Spanish Main)
- **Western boundary**: Yucatan Peninsula / Gulf of Mexico
- **Eastern boundary**: Lesser Antilles / Barbados

#### Map Elements (All Wireframe Rendered)

| Element | Wireframe Style | Color (SVGA Palette) |
|---------|-----------------|----------------------|
| Ocean | Grid plane with wave displacement shader | Dark blue (#000080) |
| Land masses | Extruded polygons with edge detection | Green (#008000) |
| Ports (Major) | Cube clusters with flag pole | Nation color |
| Settlements | Smaller cube clusters | Gray (#808080) |
| Pirate Havens | Skull icon wireframe | Red (#800000) |
| Shoals/Reefs | Flat triangular meshes | Yellow (#808000) |
| Player ship | Detailed ship wireframe | White (#FFFFFF) |
| NPC ships | Ship wireframes | Nation/faction color |
| Clouds | Translucent sphere clusters | White (#C0C0C0) |

### Port Locations (Subset — Major Ports)

```javascript
const MAJOR_PORTS = [
  { name: "Havana", nation: "SPAIN", position: { x: -850, z: 450 }, wealth: "WEALTHY", population: "LARGE" },
  { name: "Santiago", nation: "SPAIN", position: { x: -650, z: 300 }, wealth: "MODERATE", population: "MEDIUM" },
  { name: "Port Royale", nation: "ENGLAND", position: { x: -500, z: 280 }, wealth: "WEALTHY", population: "LARGE" },
  { name: "Nassau", nation: "ENGLAND", position: { x: -550, z: 520 }, wealth: "POOR", population: "SMALL" },
  { name: "Tortuga", nation: "FRANCE", position: { x: -480, z: 380 }, wealth: "POOR", population: "SMALL" },
  { name: "Martinique", nation: "FRANCE", position: { x: -150, z: 200 }, wealth: "MODERATE", population: "MEDIUM" },
  { name: "Curacao", nation: "DUTCH", position: { x: -200, z: -100 }, wealth: "WEALTHY", population: "MEDIUM" },
  { name: "St. Eustatius", nation: "DUTCH", position: { x: -180, z: 300 }, wealth: "MODERATE", population: "SMALL" },
  { name: "Cartagena", nation: "SPAIN", position: { x: -400, z: -200 }, wealth: "WEALTHY", population: "LARGE" },
  { name: "Vera Cruz", nation: "SPAIN", position: { x: -1100, z: 300 }, wealth: "WEALTHY", population: "LARGE" },
];
```

### Settlements & Coves

Smaller locations scattered along coastlines:
- **Settlements**: Small trading posts, limited services (merchant, tavern)
- **Jesuit Missions**: Always friendly, food trading only
- **Indian Villages**: Always friendly, food and canoe trading
- **Pirate Havens**: Neutral zones, recruit pirates, fence stolen goods
- **Hidden Coves**: Unmarked until discovered, used for treasure burial

---

## Wind and Sailing Mechanics

### Wind System

Wind is the primary force affecting ship movement. The wind system simulates Caribbean trade winds.

#### Wind Properties

```typescript
interface WindState {
  direction: number;      // Angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  speed: number;          // 0-20 knots
  gustiness: number;      // 0-1, variance factor
}
```

#### Wind Behavior

- **Prevailing Direction**: East to West (trade winds), with 70% probability wind originates from 45°-135° (E-SE-S quadrant)
- **Wind Shifts**: Every 30-120 seconds, wind direction changes by ±5° to ±30°
- **Speed Variation**: Base speed 8-12 knots, can range 2-18 knots
- **Storms**: June-November, 10% chance per in-game day, wind 15-20 knots with rapid direction changes

### Points of Sailing

The angle between ship heading and wind direction determines speed multiplier:

```
                        WIND DIRECTION
                             ↓
                      ┌──────┴──────┐
                      │  INTO THE   │
                      │    EYE      │  Speed: 0% (stall)
                      │   (±22.5°)  │
                ┌─────┴─────┬───────┴─────┐
                │CLOSE-HAULED│CLOSE-HAULED│  Speed: 30-50%
                │  (±45°)   │   (±45°)   │
           ┌────┴────┬──────┴──────┬──────┴────┐
           │  BEAM   │             │   BEAM    │  Speed: 60-80%
           │ REACH   │             │  REACH    │
           │ (±90°)  │             │  (±90°)   │
      ┌────┴────┬────┴─────────────┴────┬──────┴────┐
      │ BROAD   │                       │  BROAD    │  Speed: 85-95%
      │ REACH   │                       │  REACH    │
      │(±135°)  │                       │ (±135°)   │
      └────┬────┴───────────────────────┴────┬──────┘
           │          BEFORE THE WIND         │  Speed: 100%
           │              (180°)              │
           └──────────────────────────────────┘
                        SHIP HEADING
```

#### Speed Calculation

```typescript
function calculateShipSpeed(ship: Ship, wind: WindState): number {
  const relativeAngle = Math.abs(normalizeAngle(ship.heading - wind.direction));
  const pointOfSailing = getPointOfSailing(relativeAngle);
  const baseSpeed = ship.type.baseSpeed;
  const sailingMultiplier = SAILING_MULTIPLIERS[ship.type.rigging][pointOfSailing];
  const windSpeedFactor = wind.speed / 10; // Normalized to 0-2 range
  const damageModifier = 1 - (ship.sailDamage / 100) * 0.8;
  
  return baseSpeed * sailingMultiplier * windSpeedFactor * damageModifier;
}

const SAILING_MULTIPLIERS = {
  SQUARE_RIGGED: {
    INTO_EYE: 0.0,
    CLOSE_HAULED: 0.3,
    BEAM_REACH: 0.7,
    BROAD_REACH: 0.95,
    BEFORE_WIND: 1.0
  },
  FORE_AFT_RIGGED: {
    INTO_EYE: 0.2,  // Can sail closer to wind
    CLOSE_HAULED: 0.6,
    BEAM_REACH: 0.9,
    BROAD_REACH: 0.8,
    BEFORE_WIND: 0.7  // Less efficient downwind
  },
  HYBRID: {
    INTO_EYE: 0.1,
    CLOSE_HAULED: 0.5,
    BEAM_REACH: 0.85,
    BROAD_REACH: 0.9,
    BEFORE_WIND: 0.85
  }
};
```

### Ship Turning

Ships turn at rates determined by their type. Larger ships turn slower:

```typescript
const TURN_RATES = {
  SLOOP: 3.0,        // degrees per frame
  BRIGANTINE: 2.5,
  BRIG: 2.0,
  FRIGATE: 1.5,
  GALLEON: 1.0,
  SHIP_OF_LINE: 0.7
};
```

### Wind Indicator UI

Display in corner of sailing map:
- Compass rose wireframe (16 points)
- Arrow indicating wind direction
- Text showing wind speed in knots
- Current point of sailing label

---

## Ship Types

### Ship Data Model

```typescript
interface ShipType {
  id: string;
  name: string;
  class: 'SLOOP' | 'BRIGANTINE' | 'BRIG' | 'FRIGATE' | 'GALLEON' | 'SHIP_OF_LINE';
  rigging: 'SQUARE_RIGGED' | 'FORE_AFT_RIGGED' | 'HYBRID';
  baseSpeed: number;           // Base speed units
  turnRate: number;            // Degrees per update
  maxCrew: number;
  minCrew: number;
  maxCannons: number;
  cargoCapacity: number;       // Tons
  hullStrength: number;        // Hit points
  wireframeModel: string;      // Reference to 3D wireframe geometry
}

interface Ship {
  type: ShipType;
  name: string;
  crew: number;
  cannons: number;
  cargo: Cargo[];
  hullDamage: number;          // 0-100%
  sailDamage: number;          // 0-100%
  upgrades: ShipUpgrade[];
  position: Vector3;
  heading: number;
  speed: number;
}
```

### Available Ships

| Ship | Class | Rigging | Speed | Crew | Cannons | Cargo | Hull |
|------|-------|---------|-------|------|---------|-------|------|
| Pinnace | SLOOP | FORE_AFT | 12 | 30 | 8 | 20 | 40 |
| Sloop | SLOOP | FORE_AFT | 11 | 50 | 12 | 40 | 60 |
| War Canoe | SLOOP | FORE_AFT | 14 | 20 | 0 | 5 | 20 |
| Barque | BRIGANTINE | HYBRID | 9 | 80 | 16 | 80 | 80 |
| Brigantine | BRIGANTINE | HYBRID | 10 | 100 | 20 | 60 | 90 |
| Brig | BRIG | SQUARE | 8 | 120 | 24 | 80 | 100 |
| Brig of War | BRIG | SQUARE | 9 | 150 | 32 | 50 | 120 |
| Merchantman | FRIGATE | SQUARE | 6 | 100 | 16 | 200 | 100 |
| Frigate | FRIGATE | SQUARE | 7 | 180 | 40 | 80 | 150 |
| Large Frigate | FRIGATE | SQUARE | 7 | 220 | 48 | 100 | 180 |
| Trade Galleon | GALLEON | SQUARE | 4 | 150 | 24 | 300 | 180 |
| War Galleon | GALLEON | SQUARE | 5 | 250 | 56 | 120 | 220 |
| Flag Galleon | GALLEON | SQUARE | 5 | 300 | 64 | 150 | 250 |
| Ship of the Line | SHIP_OF_LINE | SQUARE | 4 | 350 | 80 | 100 | 300 |

### Ship Upgrades

```typescript
type ShipUpgrade = 
  | 'COPPER_PLATING'     // +15% speed
  | 'COTTON_SAILS'       // +10% speed
  | 'CHAIN_SHOT'         // Sail damage +50%
  | 'GRAPE_SHOT'         // Crew damage +50%
  | 'BRONZE_CANNONS'     // Range +25%, reload -20%
  | 'FINE_TELESCOPE'     // Sight range +50%
  | 'TRIPLE_HAMMOCKS'    // Crew capacity +30%
  | 'REINFORCED_HULL';   // Hull strength +25%
```

---

## Naval Combat System

### Entering Combat

Combat initiates when player clicks "Attack" on an NPC ship within engagement range (50 units on sailing map). Combat takes place in a separate **Combat Arena** scene.

### Combat Arena

- **Size**: 500x500 unit flat ocean plane
- **Starting positions**: Ships spawn 200 units apart
- **Wind**: Carries over from sailing map, may shift during long battles
- **Time limit**: 10 minutes real-time (sunset ends battle)

### Combat Controls

| Key | Action |
|-----|--------|
| W/S | Adjust sail (Full/Half/Reefed/No sail) |
| A/D | Turn port/starboard |
| 1 | Select Round Shot (hull damage) |
| 2 | Select Chain Shot (sail damage) |
| 3 | Select Grape Shot (crew damage) |
| SPACE | Fire broadside (when target in arc) |
| B | Attempt boarding (when adjacent) |

### Ammunition Types

```typescript
interface AmmoType {
  id: string;
  name: string;
  hullDamage: number;
  sailDamage: number;
  crewDamage: number;
  range: number;
  accuracy: number;
}

const AMMO_TYPES: AmmoType[] = [
  { id: 'ROUND', name: 'Round Shot', hullDamage: 10, sailDamage: 3, crewDamage: 2, range: 100, accuracy: 0.8 },
  { id: 'CHAIN', name: 'Chain Shot', hullDamage: 2, sailDamage: 15, crewDamage: 3, range: 60, accuracy: 0.6 },
  { id: 'GRAPE', name: 'Grape Shot', hullDamage: 1, sailDamage: 1, crewDamage: 12, range: 40, accuracy: 0.9 },
];
```

### Firing Mechanics

- **Broadside Arc**: 60° cone perpendicular to ship (port or starboard)
- **Reload Time**: 5 seconds base, modified by crew ratio
- **Accuracy**: Decreases with distance, increases with crew skill
- **Damage Roll**: `baseDamage * (1 + random(-0.3, 0.3)) * accuracyHit`

### Combat HUD (Wireframe Style)

```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER SHIP                      ENEMY SHIP                │
│  ══════════                       ══════════                │
│  Hull: ████████░░ 80%             Hull: ██████░░░░ 60%     │
│  Sails: ███████░░░ 70%            Sails: ████░░░░░░ 40%    │
│  Crew: 145/180                    Crew: 89/150              │
│  Cannons: 40                      Cannons: 32               │
├─────────────────────────────────────────────────────────────┤
│  [1] ROUND SHOT  [2] CHAIN SHOT  [3] GRAPE SHOT            │
│       ███████         ███░░░░         █████░░              │
│       LOADED          RELOAD          LOADED               │
├─────────────────────────────────────────────────────────────┤
│  WIND: ESE 12kt    SAIL: FULL    SPEED: 8.5kt              │
└─────────────────────────────────────────────────────────────┘
```

### Victory Conditions

| Condition | Result |
|-----------|--------|
| Enemy hull at 0% | Ship sinks — lose all cargo, some crew may be rescued |
| Enemy crew at 0 | Ship captured intact |
| Player boards successfully | Fencing duel decides capture |
| Enemy flees (5 min without damage) | Combat ends, enemy escapes |
| Time expires | Both ships disengage |

---

## Boarding & Fencing Duel

### Initiating Boarding

Boarding requires:
1. Ships within 20 units distance
2. Relative speed < 3 knots
3. Player presses "B" key
4. Success check: `crewRatio > 0.3` (30% of enemy crew)

### Fencing Duel Minigame

When boarding succeeds, player engages enemy captain in sword combat.

#### Duel Arena

- 2D side-view overlay
- Two wireframe figures face each other
- Deck background with rigging

#### Combat System

```typescript
interface DuelistState {
  health: number;           // 0-100
  stamina: number;          // 0-100, regenerates
  stance: 'HIGH' | 'MIDDLE' | 'LOW';
  action: 'IDLE' | 'ATTACKING' | 'BLOCKING' | 'STUNNED';
  position: number;         // -5 to +5 (deck positions)
}

type DuelAction = 
  | 'THRUST_HIGH'
  | 'THRUST_MIDDLE' 
  | 'THRUST_LOW'
  | 'SLASH_HIGH'
  | 'SLASH_LOW'
  | 'BLOCK'
  | 'DODGE_BACK'
  | 'ADVANCE';
```

#### Duel Controls

| Key | Action |
|-----|--------|
| W | Thrust High |
| A | Slash High / Dodge Back |
| S | Thrust Middle / Block |
| D | Slash Low / Advance |
| Shift+W | Thrust Low |

#### Duel Resolution

```typescript
function resolveDuelAction(attacker: DuelAction, defender: DuelAction): DuelResult {
  if (defender === 'BLOCK') {
    const blockSuccessTable = {
      'THRUST_HIGH': ['HIGH'],
      'THRUST_MIDDLE': ['MIDDLE'],
      'THRUST_LOW': ['LOW'],
      'SLASH_HIGH': ['HIGH', 'MIDDLE'],
      'SLASH_LOW': ['MIDDLE', 'LOW']
    };
    // Block succeeds if defender stance matches attack target
  }
  // Damage: 5-15 per hit, 20 for unblocked thrust
}
```

#### Crew Advantage

Player's crew vs enemy crew ratio provides bonus:
- 2:1 ratio: +10% damage, +10 starting health
- 3:1 ratio: +20% damage, +20 starting health
- 5:1 ratio: Auto-win option offered

---

## Port Visit System

### Port Entry

When player ship enters port hex, Port Visit menu appears.

### Port Menu Options

```
╔══════════════════════════════════════════════════════════════╗
║                     HAVANA (Spanish)                         ║
║                    Population: Large                         ║
║                    Wealth: Wealthy                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║     [G] Governor's Mansion                                   ║
║     [T] Tavern                                               ║
║     [M] Merchant                                             ║
║     [S] Shipwright                                           ║
║     [D] Divide the Plunder                                   ║
║     [L] Leave Port                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Governor Interaction

```typescript
interface GovernorInteraction {
  audience: boolean;              // Based on reputation
  promotion: Rank | null;         // If eligible
  letterOfMarque: boolean;        // Privateer commission
  warStatus: NationRelations;     // Current wars
  daughter: GovernorDaughter | null;
  missions: Mission[];
}

type Rank = 
  | 'NONE'
  | 'LETTER_OF_MARQUE'  // Can attack enemies
  | 'CAPTAIN'           // Minor respect
  | 'MAJOR'             // Ships repair free
  | 'COLONEL'           // Access to daughters
  | 'ADMIRAL'           // Land grants
  | 'MARQUIS'           // Duke equivalent
  | 'DUKE';             // Highest honor
```

### Tavern System

Tavern provides:
1. **Crew Recruitment** — Hire sailors (cost: 3 gold/man)
2. **Rumors** — Barmaid/Bartender gossip (ship movements, pirate locations)
3. **Mysterious Traveler** — Sells treasure maps, items, information
4. **Annoying Captain** — Random duel encounter (defeat = +10 recruitable crew)
5. **Wanted Criminals** — Bounty targets hiding here

### Merchant Trading

#### Trade Goods

```typescript
interface Cargo {
  type: CargoType;
  quantity: number;
}

type CargoType = 
  | 'FOOD'          // Essential for crew
  | 'SUGAR'         // Common trade good
  | 'TOBACCO'       // Moderate value
  | 'SPICES'        // High value
  | 'LUXURIES'      // Highest value
  | 'CANNONS';      // Military supply

interface PortEconomy {
  prices: Map<CargoType, number>;
  stock: Map<CargoType, number>;
  gold: number;
}
```

#### Price Calculation

```typescript
function calculatePrice(good: CargoType, port: Port, action: 'BUY' | 'SELL'): number {
  const basePrice = BASE_PRICES[good];
  const wealthModifier = WEALTH_MODIFIERS[port.wealth];
  const nationModifier = port.nation === 'SPAIN' ? 1.2 : 1.0; // Spanish prices higher
  const supplyDemand = action === 'BUY' 
    ? 1 + (1 - port.stock.get(good) / 100) * 0.5
    : 0.6 + port.stock.get(good) / 200;
  
  return Math.round(basePrice * wealthModifier * nationModifier * supplyDemand);
}

const BASE_PRICES = {
  FOOD: 2,
  SUGAR: 5,
  TOBACCO: 8,
  SPICES: 15,
  LUXURIES: 25,
  CANNONS: 50
};
```

### Shipwright Services

```typescript
interface ShipwrightServices {
  repair(ship: Ship): Cost;              // Hull and sail repair
  upgrade(ship: Ship, upgrade: ShipUpgrade): Cost;
  sell(ship: Ship): Revenue;
  buy(shipType: ShipType): Cost | null;  // If in stock
  refit(ship: Ship, cannons: number): Cost;
}
```

---

## Crew & Morale System

### Crew Management

```typescript
interface CrewState {
  count: number;
  morale: number;           // 0-100
  monthsAtSea: number;
  goldPerHead: number;      // Calculated share
}
```

### Morale Factors

| Factor | Effect |
|--------|--------|
| Gold per crew | +20 morale if > 100 gold each |
| Food supply | -10 morale per week without food |
| Time at sea | -5 morale per month after 6 months |
| Victories | +10 morale per ship captured |
| Losses | -15 morale per defeat |
| Pay delay | -5 morale per month after promised payout |

### Morale Effects

| Morale Level | Effect |
|--------------|--------|
| 80-100 (High) | +10% combat effectiveness |
| 50-79 (Normal) | No modifier |
| 25-49 (Low) | -10% combat, may desert at port |
| 0-24 (Mutinous) | Risk of mutiny event |

### Divide the Plunder

Ends current voyage, distributes gold:
```typescript
function dividePlunder(player: PlayerState): DivisionResult {
  const totalGold = player.gold;
  const shares = player.crew.count + (player.rank.captainShares);
  const perShare = totalGold / shares;
  const captainShare = perShare * player.rank.captainShares;
  const crewShare = perShare * player.crew.count;
  
  // Crew happiness based on share
  // > 100 gold/head = "Eagerly"
  // 50-99 = "Gladly"
  // 25-49 = "Willingly"
  // < 25 = "Reluctantly"
  
  return {
    captainReceives: captainShare,
    crewDisbands: true,
    newReputation: calculateReputation(captainShare, player.achievements)
  };
}
```

---

## Nation & Reputation System

### Colonial Powers

```typescript
type Nation = 'SPAIN' | 'ENGLAND' | 'FRANCE' | 'DUTCH';

interface NationState {
  id: Nation;
  color: string;
  ports: Port[];
  atWarWith: Nation[];
  playerReputation: number;  // -100 to +100
  playerRank: Rank;
}

const NATION_COLORS = {
  SPAIN: '#FFD700',      // Gold
  ENGLAND: '#FF0000',    // Red
  FRANCE: '#0000FF',     // Blue
  DUTCH: '#FFA500'       // Orange
};
```

### Reputation Changes

| Action | Reputation Change |
|--------|-------------------|
| Capture enemy ship | +5 with commissioning nation, -10 with victim |
| Capture neutral ship | -20 with that nation |
| Capture allied ship | -50 with that nation, lose rank |
| Raid enemy town | +10 with enemies, -30 with victim |
| Capture town for nation | +50 with benefiting nation |
| Defeat named pirate | +5 with all nations |
| Escort governor/VIP | +15 with that nation |

---

## Time & Aging System

### Game Time

- Real-time ratio: 1 second = 1 hour game time
- Sailing map: 1 second = 4 hours (accelerated)
- Port visits: Consume 7 days automatically
- Combat: Real-time, consumes 1-6 hours

### Player Aging

```typescript
interface PlayerAge {
  startAge: number;        // Always 18
  currentAge: number;      // Increases with game time
  health: number;          // Decreases with age/wounds
}
```

#### Age Effects

| Age | Effect |
|-----|--------|
| 18-30 | Full capability |
| 31-40 | -10% fencing speed |
| 41-50 | -20% fencing speed, -10% sailing efficiency |
| 51-60 | -30% fencing speed, -20% sailing efficiency |
| 60+ | Must retire |

---

## Technical Implementation

### React Three Fiber Structure

```jsx
<Canvas>
  <WireframeSVGAShaders />
  
  {gameState === 'SAILING_MAP' && (
    <SailingMap>
      <OceanPlane />
      <Landmasses />
      <Ports />
      <NPCShips />
      <PlayerShip />
      <WindIndicator />
      <CloudParticles />
    </SailingMap>
  )}
  
  {gameState === 'NAVAL_COMBAT' && (
    <CombatArena>
      <CombatOcean />
      <PlayerCombatShip />
      <EnemyCombatShip />
      <Cannonballs />
      <DamageEffects />
    </CombatArena>
  )}
  
  {gameState === 'BOARDING_DUEL' && (
    <DuelOverlay />
  )}
  
  <CRTShaderPass />
</Canvas>
```

### Wireframe SVGA Shader System

All rendering uses custom shaders emulating SVGA era graphics:

```glsl
// Vertex Shader - Edge Detection Wireframe
varying vec3 vBarycentric;

void main() {
  vBarycentric = barycentric; // Passed from geometry
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader - Wireframe with SVGA Palette
uniform vec3 uLineColor;
uniform vec3 uFillColor;
uniform float uLineWidth;

varying vec3 vBarycentric;

float edgeFactor() {
  vec3 d = fwidth(vBarycentric);
  vec3 a3 = smoothstep(vec3(0.0), d * uLineWidth, vBarycentric);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  // SVGA color quantization (256 color palette simulation)
  vec3 quantizedLine = floor(uLineColor * 8.0) / 8.0;
  vec3 quantizedFill = floor(uFillColor * 8.0) / 8.0;
  
  float edge = edgeFactor();
  gl_FragColor = vec4(mix(quantizedLine, quantizedFill * 0.2, edge), 1.0);
}
```

### CRT Post-Processing Shader

```glsl
// Scanlines + Chromatic Aberration + Slight Curvature
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  
  // Barrel distortion
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  vec2 distorted = uv + centered * dist * dist * 0.05;
  
  // Scanlines
  float scanline = sin(distorted.y * resolution.y * 2.0) * 0.04;
  
  // Chromatic aberration
  float r = texture2D(tDiffuse, distorted + vec2(0.001, 0.0)).r;
  float g = texture2D(tDiffuse, distorted).g;
  float b = texture2D(tDiffuse, distorted - vec2(0.001, 0.0)).b;
  
  vec3 color = vec3(r, g, b) - scanline;
  
  // Vignette
  float vignette = 1.0 - dist * 0.5;
  
  gl_FragColor = vec4(color * vignette, 1.0);
}
```

### Ship Wireframe Geometry

Ships are constructed from line segments, no textures:

```typescript
function createShipWireframe(shipClass: string): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Hull - elongated hexagonal cross-section
  // Masts - vertical lines with yard arms
  // Sails - quad outlines (when deployed)
  // Rigging - connecting lines
  
  // Example: Sloop (simple)
  const hullPoints = [
    // Bow
    [0, 0, 3],
    // Port side
    [-1, 0, 2], [-1.2, 0, 0], [-1, 0, -2],
    // Stern
    [0, 0, -2.5],
    // Starboard side
    [1, 0, -2], [1.2, 0, 0], [1, 0, 2],
    // Deck level
    [0, 0.5, 2.5], [-0.8, 0.5, 0], [0, 0.5, -2], [0.8, 0.5, 0],
    // Mast
    [0, 0.5, 0.5], [0, 3, 0.5],
    // Boom
    [-1.5, 1, 0.5], [1.5, 1, 0.5]
  ];
  
  return new THREE.BufferGeometry().setFromPoints(
    hullPoints.map(p => new THREE.Vector3(...p))
  );
}
```

### State Management

Using Zustand for game state:

```typescript
interface GameStore {
  // Game State
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  // Player
  player: PlayerState;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  
  // Fleet
  ships: Ship[];
  addShip: (ship: Ship) => void;
  removeShip: (shipId: string) => void;
  
  // World
  wind: WindState;
  updateWind: () => void;
  ports: Port[];
  updatePort: (portId: string, updates: Partial<Port>) => void;
  npcShips: NPCShip[];
  
  // Combat
  combatState: CombatState | null;
  initiateCombat: (enemy: Ship) => void;
  resolveCombat: (result: CombatResult) => void;
  
  // Time
  gameTime: GameTime;
  advanceTime: (hours: number) => void;
}
```

---

## Data Models Summary

### Complete Type Definitions

```typescript
// === CORE GAME STATE ===
type GameState = 
  | 'MAIN_MENU'
  | 'CHARACTER_CREATION'
  | 'SAILING_MAP'
  | 'NAVAL_COMBAT'
  | 'BOARDING_DUEL'
  | 'PORT_VISIT'
  | 'TOWN_RAID'
  | 'DIVIDE_PLUNDER'
  | 'RETIREMENT';

interface PlayerState {
  id: string;
  name: string;
  nationality: Nation;
  startingYear: number;
  age: number;
  health: number;
  gold: number;
  specialSkill: SpecialSkill;
  ranks: Map<Nation, Rank>;
  reputation: Map<Nation, number>;
  achievements: Achievement[];
  familyMembers: FamilyMember[];
  spouse: GovernorDaughter | null;
  crew: CrewState;
  fleet: Ship[];
  flagship: Ship;
}

type SpecialSkill = 
  | 'FENCING'        // +1 fencing level
  | 'GUNNERY'        // +25% cannon accuracy
  | 'NAVIGATION'     // +20% sailing speed
  | 'MEDICINE'       // Slower aging
  | 'WIT_CHARM';     // Better governor relations

interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
}

// === WORLD STATE ===
interface Port {
  id: string;
  name: string;
  nation: Nation;
  position: Vector3;
  population: 'SMALL' | 'MEDIUM' | 'LARGE';
  wealth: 'POOR' | 'MODERATE' | 'WEALTHY';
  fortification: number;        // 0-100, affects garrison
  garrison: number;             // Soldiers
  economy: PortEconomy;
  governor: Governor | null;
  hasShipwright: boolean;
  lastVisited: GameTime | null;
  hostility: number;            // Towards player, 0-100
}

interface NPCShip {
  id: string;
  ship: Ship;
  faction: Nation | 'PIRATE' | 'TRADER';
  behavior: 'PATROL' | 'TRADE_ROUTE' | 'HUNTING' | 'FLEEING';
  destination: Vector3;
  namedPirate: NamedPirate | null;
  escort: NPCShip | null;
  escorting: NPCShip | null;
}

// === COMBAT STATE ===
interface CombatState {
  playerShip: Ship;
  enemyShips: Ship[];
  playerPosition: Vector3;
  enemyPositions: Map<string, Vector3>;
  wind: WindState;
  timeRemaining: number;
  cannonballsInFlight: Cannonball[];
}

interface Cannonball {
  id: string;
  origin: 'PLAYER' | string;  // or enemy ship ID
  position: Vector3;
  velocity: Vector3;
  ammoType: AmmoType;
}
```

---

## UI Components (Wireframe Style)

### Design Language

All UI elements rendered as wireframe boxes with SVGA palette:

```typescript
interface UIStyle {
  borderColor: string;        // Usually #00FF00 (green) or #FFFFFF
  backgroundColor: string;    // #000000 or transparent
  textColor: string;          // #00FF00 or #FFFFFF
  highlightColor: string;     // #FFFF00 (yellow) for selected
  fontFamily: 'VT323' | 'Press Start 2P' | 'monospace';
}
```

### HUD Components

1. **Compass Rose** — Wireframe octagon with directional letters
2. **Wind Indicator** — Arrow with knot readout
3. **Ship Status** — Hull/Sail/Crew bars
4. **Minimap** — Top-down wireframe of nearby area
5. **Gold Counter** — Coin stack icon + number
6. **Date Display** — Month/Year
7. **Speed Indicator** — Knots + current sail state

### Menu Rendering

Menus use ASCII-art style boxes:

```
╔════════════════════════════════════╗
║          MAIN MENU                 ║
╠════════════════════════════════════╣
║                                    ║
║    ► NEW GAME                      ║
║      CONTINUE                      ║
║      OPTIONS                       ║
║      CREDITS                       ║
║                                    ║
╚════════════════════════════════════╝
```

---

## Audio Specifications

Since this is a wireframe visual game, audio should complement with:

### Sound Effects (Web Audio API)

- **Cannon Fire**: Low frequency burst (80-200Hz), 0.3s decay
- **Sail Unfurl**: White noise sweep (high to low), 0.5s
- **Sword Clash**: Sharp metallic ping (2000-4000Hz), 0.1s
- **Gold Coins**: Jingle (multiple high pings)
- **Wind**: Continuous filtered noise, volume based on wind speed
- **Waves**: Low rumble (40-100Hz), rhythmic modulation

### Music

Optional chiptune-style sea shanties using Tone.js or similar:
- Main theme: D minor, 3/4 time, accordion lead
- Combat: A minor, 4/4 time, aggressive drums
- Port: C major, 4/4 time, guitar

---

## Performance Optimization

### Target Performance

- 60 FPS on mid-range hardware
- < 100ms initial load
- < 50MB memory footprint

### Optimization Strategies

1. **Geometry Instancing** — All ships of same type share geometry
2. **LOD for Map** — Distant elements rendered as points
3. **Object Pooling** — Cannonballs, particles reused
4. **Frustum Culling** — Automatic via Three.js
5. **Shader Simplicity** — No heavy fragment operations
6. **State Updates** — Batched per frame

---

## Testing Scenarios

### Sailing Tests
1. Sail directly into wind → Ship should stall
2. Sail before the wind → Maximum speed achieved
3. Large ship vs small ship turning → Large turns slower
4. Damaged sails → Reduced speed proportional to damage

### Combat Tests
1. Fire at max range → Some shots miss
2. Chain shot at sails → Sail damage > hull damage
3. Board with 2:1 crew advantage → Duel starts with health bonus
4. Sink enemy ship → Cargo lost, partial crew rescue

### Economy Tests
1. Buy low at wealthy port → Prices lower than poor port
2. Sell goods at port lacking supply → Premium price
3. Visit port after raiding → Reduced goods/gold available

### Reputation Tests
1. Attack allied ship → Lose rank, major reputation hit
2. Capture 10 enemy ships → Promotion offered
3. Attack all nations → Become full pirate (no safe ports)

---

## Accessibility Requirements

1. **Colorblind Mode** — Alternative palette with high contrast
2. **Keyboard Only** — Full gameplay without mouse
3. **Screen Reader** — UI elements have ARIA labels
4. **Adjustable Speed** — Combat can be slowed
5. **Large Text Option** — UI scales up
6. **Audio Cues** — All critical events have distinct sounds

---

## Extended Features (Optional Future)

1. **Treasure Map Hunting** — Overland minigame
2. **Governor's Daughter Dancing** — Rhythm minigame
3. **Multiplayer Naval Combat** — WebRTC peer battles
4. **Modding Support** — JSON ship/port definitions
5. **Campaign Mode** — Story-driven missions
6. **Steam Deck Support** — Controller mappings

---

## File Structure

```
/wireframe-pirates
├── /src
│   ├── /components
│   │   ├── /canvas
│   │   │   ├── SailingMap.jsx
│   │   │   ├── CombatArena.jsx
│   │   │   ├── Ship.jsx
│   │   │   ├── Ocean.jsx
│   │   │   ├── Port.jsx
│   │   │   └── WindIndicator.jsx
│   │   ├── /ui
│   │   │   ├── HUD.jsx
│   │   │   ├── MainMenu.jsx
│   │   │   ├── PortMenu.jsx
│   │   │   ├── CombatHUD.jsx
│   │   │   └── DuelOverlay.jsx
│   │   └── /shaders
│   │       ├── WireframeShader.jsx
│   │       ├── OceanShader.jsx
│   │       └── CRTPostProcess.jsx
│   ├── /stores
│   │   ├── gameStore.ts
│   │   ├── combatStore.ts
│   │   └── worldStore.ts
│   ├── /data
│   │   ├── ships.json
│   │   ├── ports.json
│   │   └── pirates.json
│   ├── /utils
│   │   ├── sailing.ts
│   │   ├── combat.ts
│   │   └── economy.ts
│   ├── /hooks
│   │   ├── useWind.ts
│   │   ├── useSailing.ts
│   │   └── useCombat.ts
│   ├── App.jsx
│   └── main.jsx
├── /public
│   └── fonts/
├── package.json
├── vite.config.js
└── README.md
```

---

## Summary

**Wireframe Pirates!** faithfully recreates the open-world pirate adventure of Sid Meier's Pirates! using modern web technologies while presenting everything through a distinctive wireframe aesthetic with SVGA-era shader effects. The game emphasizes:

- **Authentic sailing physics** with wind-based movement
- **Tactical naval combat** with ammunition choices
- **Skill-based sword dueling** for boarding actions
- **Deep economic systems** with dynamic port trading
- **Political gameplay** through nation reputation
- **Retro visual style** achieved entirely through shaders

This specification provides complete details for generating a fully functional implementation using React Three Fiber, requiring no external image assets.
