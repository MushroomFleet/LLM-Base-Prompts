# Tactical Command: XCOM-Inspired Turn-Based Strategy Game

A comprehensive React-based implementation of an XCOM-inspired turn-based tactical squad strategy game, featuring isometric SVG graphics, base management, soldier customization, and mission-based gameplay.

## Description

Tactical Command is a turn-based squad tactics game inspired by XCOM: Enemy Unknown. Players command a squad of soldiers in isometric tactical combat missions while managing a home base, researching technologies, and equipping soldiers between deployments. The game features a clean component-based architecture with SVG graphics, an integrated level editor, and comprehensive strategic/tactical gameplay loops.

### Key Features

- **Turn-based tactical combat** on isometric tile-based maps
- **Four soldier classes** with branching skill trees
- **Cover-based combat system** with flanking mechanics
- **Base management** with facility construction and adjacency bonuses
- **Research and engineering** systems for progression
- **Equipment loadout** system for soldier customization
- **Mission system** with multiple mission types
- **Integrated isometric level editor** for map creation
- **SVG-based static graphics** (no animations)

---

## Functionality

### 1. Main Menu & Game Flow

**Main Menu Screen:**
- New Game: Starts campaign with difficulty selection (Easy, Normal, Classic, Impossible)
- Load Game: Load from browser localStorage
- Level Editor: Opens the isometric level editor
- Settings: Audio volume, UI preferences

**Game Flow States:**
1. `MAIN_MENU` - Initial game state
2. `BASE_VIEW` - Managing headquarters (default between missions)
3. `MISSION_SELECT` - Choosing from available missions
4. `SQUAD_SELECT` - Selecting and equipping soldiers
5. `TACTICAL_COMBAT` - Active mission gameplay
6. `MISSION_DEBRIEF` - Post-mission results
7. `LEVEL_EDITOR` - Map creation tool

### 2. Base Management (Strategic Layer)

**Base View ("Ant Farm"):**
The base is displayed as a side-view cross-section grid (6 columns × 4 rows = 24 slots). Pre-built facilities occupy the top row and cannot be moved.

**Starting Facilities (Fixed):**
| Facility | Location | Function |
|----------|----------|----------|
| Mission Control | Top-left | Launch missions, scan for activity, view world map |
| Research Lab | Top-center | Conduct research projects |
| Engineering Bay | Top-center-right | Build equipment, manage manufacturing |
| Barracks | Top-right | View/customize soldiers, access loadouts |

**Constructable Facilities:**
| Facility | Cost | Power | Build Time | Effect |
|----------|------|-------|------------|--------|
| Power Generator | §60 | +6 | 5 days | Provides power for other facilities |
| Satellite Uplink | §150 | -5 | 14 days | Supports 2 satellites |
| Laboratory | §130 | -3 | 12 days | +20% research speed per lab |
| Workshop | §130 | -3 | 10 days | +7% resource refund on builds |
| Officer Training School | §130 | -3 | 7 days | Unlocks squad upgrades |
| Foundry | §100 | -3 | 14 days | Unlocks equipment upgrades |
| Alien Containment | §80 | -2 | 7 days | Required for live captures |
| Psi Lab | §200 | -5 | 21 days | Test soldiers for psionic abilities |

**Adjacency Bonuses:**
- Laboratories adjacent to each other: +10% research speed per adjacent lab
- Workshops adjacent to each other: +7% resource refund per adjacent workshop
- Satellite Uplinks in 2×2 blocks: +2 satellite capacity
- Power Generators adjacent: +2 power output

**Base Excavation:**
- Slots below top row require excavation before building
- Row 2: §10, 3 days
- Row 3: §25, 5 days
- Row 4: §50, 7 days

**Resources:**
| Resource | Source | Usage |
|----------|--------|-------|
| Credits (§) | Monthly funding, mission rewards, grey market sales | All purchases and construction |
| Alien Alloys | UFO salvage, alien corpses | Advanced armor, weapons, facilities |
| Elerium | UFO salvage, specific aliens | Energy weapons, advanced tech |
| Weapon Fragments | Killed aliens (non-explosive) | Research, foundry projects |
| Scientists | Mission rewards, satellite coverage | Research speed |
| Engineers | Mission rewards, workshops | Build speed, unlock construction |

### 3. Research System

**Research Interface:**
- View available projects with prerequisites, duration, and required resources
- Assign project to active research slot
- Progress displayed as percentage/days remaining
- Archives show completed research with detailed reports

**Research Categories:**
1. **Weapons:** Beam Weapons → Laser → Plasma progression
2. **Armor:** Body Armor → Carapace → Skeleton → Ghost → Titan
3. **Autopsies:** Per alien type, unlocks items and information
4. **Interrogations:** Per alien type, provides research credit bonuses
5. **UFO Technology:** Flight computers, power sources, navigation
6. **Specials:** Psionics, hyperwave relay, final mission prerequisites

**Example Research Tree:**
```
Xeno-Biology (starter)
├── Arc Thrower (capture device)
├── Alien Containment (facility unlock)
└── Sectoid Autopsy
    ├── Experimental Warfare (Foundry unlock)
    └── Sectoid Interrogation (+20% weapons research)
    
Beam Weapons
├── Laser Rifle
├── Laser Pistol
├── Heavy Laser
├── Sniper Laser
└── Scatter Laser
    └── Plasma Weapons
        ├── Plasma Rifle
        ├── Heavy Plasma
        └── Plasma Sniper
```

### 4. Engineering & Manufacturing

**Engineering Interface:**
- Build queue with concurrent builds (limited by engineers)
- Item categories: Weapons, Armor, Items, Aircraft, Facilities
- Shows cost, build time, prerequisites

**Buildable Items:**

**Weapons:**
| Item | Cost | Build Time | Requirements |
|------|------|------------|--------------|
| Laser Rifle | §25, 10 Fragments | 3 days | Beam Weapons research |
| Laser Sniper | §35, 15 Fragments | 4 days | Beam Weapons research |
| Heavy Laser | §40, 20 Fragments | 5 days | Beam Weapons research |
| Plasma Rifle | §200, 20 Alloys, 10 Elerium | 5 days | Plasma Rifle research |

**Armor:**
| Item | Cost | Build Time | Requirements | Stats |
|------|------|------------|--------------|-------|
| Carapace Armor | §50, 15 Alloys | 3 days | Carapace Armor research | +4 HP |
| Skeleton Suit | §100, 30 Alloys, 10 Elerium | 5 days | Skeleton Suit research | +3 HP, +10 Movement, Grapple |
| Ghost Armor | §250, 50 Alloys, 30 Elerium | 7 days | Ghost Armor research | +6 HP, Stealth, Grapple |
| Titan Armor | §400, 60 Alloys, 40 Elerium | 10 days | Titan Armor research | +10 HP, -4 Movement |

**Equipment Items:**
| Item | Cost | Build Time | Effect |
|------|------|------------|--------|
| Nano-Fiber Vest | §20 | 1 day | +2 HP |
| Chitin Plating | §30, 4 Chryssalid Corpses | 2 days | +4 HP, -50% melee damage |
| S.C.O.P.E. | §25, 5 Fragments | 2 days | +10 Aim |
| Medkit | §25 | 1 day | Heal 4 HP, 1 use per mission |
| Frag Grenade | Free | - | 3 damage AoE, destroys cover |
| Alien Grenade | §50, 10 Alloys | 2 days | 5 damage AoE |
| Mind Shield | §150, 20 Elerium | 5 days | +30 Will |

### 5. Barracks & Soldier Management

**Soldier List View:**
- Shows all soldiers with: Name, Class, Rank, Status, Missions, Kills
- Filter by: Available, Wounded, Training, Class
- Sort by: Name, Rank, Missions, Kills

**Individual Soldier View:**
- Portrait/avatar customization
- Stats display: HP, Aim, Will, Movement
- Class and rank
- Equipped weapon, armor, items
- Psionic abilities (if unlocked)
- Ability selection interface

**Soldier Stats:**
| Stat | Base Value | Description |
|------|------------|-------------|
| HP | 4 (Rookie) | Health points, 0 = critically wounded or dead |
| Aim | 65 | Chance modifier for hit calculations |
| Will | 40 | Resistance to panic and psionic attacks |
| Movement | 12 | Tiles per move action (7 regular, 15 dash) |

**Soldier Ranks:**
Rookie → Squaddie → Corporal → Sergeant → Lieutenant → Captain → Major → Colonel

**Stat Gains Per Rank:**
- HP: +1 at Corporal, Lieutenant, Major
- Aim: +3-5 per rank
- Will: +3-6 per rank

### 6. Soldier Classes & Skill Trees

**Class Assignment:**
Soldiers are assigned a random class upon first promotion to Squaddie.

#### Assault Class
*Role: Close-quarters combat, flanking, capturing aliens*

**Primary Weapon:** Shotgun (high damage at close range, penalty at distance)
**Secondary Weapon:** Pistol

**Skill Tree:**
| Rank | Choice A | Choice B |
|------|----------|----------|
| Squaddie | Run & Gun (Fire after dashing, 2-turn cooldown) | - |
| Corporal | Tactical Sense (+5 Defense per visible enemy, max +20) | Aggression (+10% Crit per visible enemy, max +30%) |
| Sergeant | Lightning Reflexes (First reaction shot misses) | Close & Personal (+30% Crit at adjacent range) |
| Lieutenant | Flush (Force enemy from cover) | Rapid Fire (Two shots, -15 Aim each) |
| Captain | Close Combat Specialist (Free shot at enemies within 4 tiles) | Bring 'Em On (+1 Crit damage per visible enemy) |
| Major | Extra Conditioning (+2 HP, +2 Will) | - |
| Colonel | Resilience (Immune to critical hits) | Killer Instinct (+50% Crit damage after Run & Gun) |

#### Heavy Class
*Role: Suppression, explosives, area damage*

**Primary Weapon:** LMG/Cannon (high damage, aim penalty)
**Secondary Weapon:** Rocket Launcher (2 rockets/mission)

**Skill Tree:**
| Rank | Choice A | Choice B |
|------|----------|----------|
| Squaddie | Fire Rocket (3-tile AoE, 6 damage, 90% accuracy) | - |
| Corporal | Bullet Swarm (Fire doesn't end turn) | Holo-Targeting (+10 Aim to team vs target) |
| Sergeant | Shredder Rocket (+33% damage to shredded target) | Suppression (Pin enemy, -30 Aim, reaction shot) |
| Lieutenant | HEAT Ammo (+100% damage vs robotics) | Rapid Reaction (Second overwatch shot if first hits) |
| Captain | Grenadier (2 grenades per slot) | Danger Zone (+2 tile AoE on suppression/rockets) |
| Major | Will to Survive (-2 damage in cover, not flanked) | - |
| Colonel | Rocketeer (+1 rocket per mission) | Mayhem (+damage to suppression/AoE by weapon tier) |

#### Support Class
*Role: Healing, smoke cover, team buffs*

**Primary Weapon:** Assault Rifle
**Secondary Weapon:** Pistol

**Skill Tree:**
| Rank | Choice A | Choice B |
|------|----------|----------|
| Squaddie | Smoke Grenade (Deploy smoke, +20 Defense in cloud) | - |
| Corporal | Sprinter (+3 Movement tiles) | Covering Fire (Overwatch triggers on enemy shots) |
| Sergeant | Field Medic (Medkit has 3 uses) | Smoke and Mirrors (+1 Smoke Grenade use) |
| Lieutenant | Revive (Medkit revives at 33% HP) | Rifle Suppression (Same as Heavy) |
| Captain | Dense Smoke (+40 Defense, larger AoE) | Combat Drugs (+20 Will, +10 Crit in smoke) |
| Major | Deep Pockets (Second item slot) | - |
| Colonel | Savior (+4 HP per Medkit heal) | Sentinel (Two overwatch shots per turn) |

#### Sniper Class
*Role: Long-range precision damage*

**Primary Weapon:** Sniper Rifle (+25% Crit, +10 Aim at distance, -20 Aim close range)
**Secondary Weapon:** Pistol

**Skill Tree:**
| Rank | Choice A | Choice B |
|------|----------|----------|
| Squaddie | Headshot (+30% Crit, +30% damage, 2-turn cooldown) | - |
| Corporal | Snap Shot (Fire after moving, -20 Aim) | Squadsight (Fire at any enemy visible to squad) |
| Sergeant | Gunslinger (+2 Pistol damage) | Damn Good Ground (+10 Aim, +10 Defense at elevation) |
| Lieutenant | Disabling Shot (Target can't fire, 2-turn cooldown) | Battle Scanner (Throw scanner, reveals area for 2 turns) |
| Captain | Executioner (+10 Aim vs targets <50% HP) | Opportunist (No aim penalty on overwatch, can crit) |
| Major | Low Profile (Partial cover counts as full) | - |
| Colonel | In The Zone (Killing flanked/uncovered enemy doesn't cost action) | Double Tap (Fire twice, 1-turn cooldown) |

### 7. Equipment Loadout System

**Loadout Screen (Pre-Mission):**
Each soldier has slots for:
1. **Primary Weapon** - Class-restricted
2. **Secondary Weapon** - Pistol (all classes) or Rocket Launcher (Heavy)
3. **Armor** - Any researched armor type
4. **Item Slot 1** - Any equipment item
5. **Item Slot 2** - Support class with Deep Pockets only

**Loadout Rules:**
- Equipment pool is shared; items equipped on one soldier unavailable to others
- "Make Items Available" button unequips all non-deployed soldiers
- Weapons have no ammunition limit (infinite reloads)
- Each item type can only be equipped once per soldier (except grenades)
- Class restrictions apply to primary weapons only

**Weapon Stats:**

| Weapon | Damage | Crit Chance | Crit Damage | Range Modifier |
|--------|--------|-------------|-------------|----------------|
| Assault Rifle | 3-5 | 10% | +50% | 0 |
| Shotgun | 4-7 | 20% | +50% | -2 Aim per tile beyond 4 |
| LMG | 4-6 | 10% | +50% | -10 Aim general |
| Sniper Rifle | 5-7 | 25% | +100% | +10 Aim beyond 10 tiles, -20 close |
| Pistol | 1-2 | 0% | +50% | 0 |
| Laser Rifle | 5-7 | 10% | +50% | 0 |
| Plasma Rifle | 7-9 | 10% | +50% | 0 |

### 8. Tactical Combat System

#### 8.1 Turn Structure

**Turn Order:**
1. Player turn begins
2. Player activates soldiers in any order
3. Each soldier has 2 actions
4. Player ends turn
5. Enemy turn begins
6. Enemies activate in sequence
7. Enemy turn ends
8. Return to step 1

**Action Types:**
- **Move (Blue):** Uses 1 action, movement within ~7 tiles
- **Dash (Yellow):** Uses 2 actions, movement within ~15 tiles
- **Shoot:** Uses 1 action, ends turn (except with Bullet Swarm)
- **Overwatch:** Uses 1 action, ends turn; fire at moving enemies
- **Hunker Down:** Uses all actions, +40 Defense, can't be crit
- **Reload:** Uses 1 action
- **Abilities:** Various action costs depending on ability
- **Items:** Grenade, Medkit, etc. - typically 1 action, ends turn

**"Ends Turn" Actions:**
Shooting (without Bullet Swarm), Overwatch, Hunker Down, most item uses. After these, remaining actions are forfeit.

#### 8.2 Movement System

**Grid System:**
- Isometric tile grid, each tile = 1 movement point
- Diagonal movement costs ~1.5 movement points
- Base movement: 12 points = 7 straight tiles (blue move) or 15 tiles (dash)
- Movement range displayed as blue (1 action) and yellow (dash) zones

**Movement Modifiers:**
| Source | Modifier |
|--------|----------|
| Skeleton Suit | +10 Movement |
| Sprinter (Support) | +3 tiles |
| Titan Armor | -4 Movement |

**Elevation:**
- Units can climb ladders between tiles
- Some armor grants grappling hooks for vertical movement
- Higher elevation grants +20 Aim, +20 Defense bonus

#### 8.3 Cover System

**Cover Types:**
| Cover Type | Shield Icon | Defense Bonus | Notes |
|------------|-------------|---------------|-------|
| No Cover | None | 0 | +50% Crit chance for attacker |
| Half Cover | Half Shield | +20 Defense | Cars, low walls, thin objects |
| Full Cover | Full Shield | +40 Defense | Walls, thick pillars, large objects |
| Flanked | Yellow Shield | 0 | Attacker ignores cover, +50% Crit |

**Cover Visualization:**
- Shield icons appear when selecting move destination
- Blue = normal cover from known enemies
- Yellow/Red = flanked position (visible enemies can ignore cover)

**Destructible Cover:**
- Explosives destroy cover objects
- Damaged cover may degrade (Full → Half → Destroyed)
- Some cover types explode (cars) dealing damage

**Flanking Rules:**
- Target is flanked when attacker has line of sight without cover obstruction
- Achieved by positioning to the side/rear of enemy's cover
- Flanked targets receive no cover defense bonus
- Attacker gains +50% critical hit chance vs flanked targets

#### 8.4 Combat Calculations

**Hit Chance Formula:**
```
Base Hit = Soldier Aim
+ Weapon Aim Modifier (range-based)
+ Height Advantage (+20 if elevated)
+ Ability Modifiers (SCOPE +10, Damn Good Ground +10, etc.)
- Target Defense (0/20/40 for no/half/full cover)
- Range Penalty (weapon-specific)
= Final Hit Chance (capped 1-100%)
```

**Critical Hit:**
```
Base Crit = Weapon Crit Chance
+ 50% if target flanked OR uncovered
+ Ability Modifiers (Aggression, Close & Personal, etc.)
= Final Crit Chance

Crit Damage = Weapon Damage × Crit Multiplier (typically +50-100%)
```

**Damage:**
- Weapons deal random damage within their range (e.g., 3-5)
- Critical hits apply multiplier to final damage
- Armor/HP absorbs damage directly

#### 8.5 Enemy Activation ("Pod System")

**Patrol Mechanic:**
- Enemies start in groups ("pods") of 2-4 units
- Pods patrol preset paths while undetected
- When any squad member sees a pod, it "activates"
- Activation grants enemies a free move to cover (no shooting)
- After activation, pod fights normally

**Line of Sight:**
- Units reveal fog of war within their sight radius (~17 tiles)
- Corners block sight appropriately
- Dashing may reveal new pods mid-move

#### 8.6 Overwatch System

**Overwatch Rules:**
- Soldier enters "Overwatch" stance
- Fires once at first enemy moving within sight
- -20 Aim penalty on reaction shots (unless Opportunist)
- Cannot normally critical hit (unless Opportunist)
- Some abilities grant multiple overwatch shots

**Overwatch Triggers:**
- Enemy movement (any tile change)
- Does NOT trigger on enemy shooting (unless Covering Fire)
- Does NOT trigger on stationary ability use

#### 8.7 Status Effects

| Status | Effect | Duration | Caused By |
|--------|--------|----------|-----------|
| Suppressed | -30 Aim, reaction shot if moving | Until suppressor's next turn | Suppression ability |
| Panicked | Soldier acts randomly (shoot, run, hunker) | 1-2 turns | Low Will, teammate death |
| Poisoned | -20 Aim, -4 Movement, 1 damage/turn | 3 turns | Thin Man poison |
| Stunned | Cannot act | 1 turn | Arc Thrower |
| Mind Controlled | Enemy controls unit | Until controller killed | Psionic enemies |

### 9. Mission System

#### 9.1 Mission Types

**Abduction Mission:**
- Three simultaneous alerts in different countries
- Player chooses one; others increase panic
- Objective: Eliminate all enemies
- Rewards: Credits, Scientists, Engineers, or Panic reduction
- Enemy count: 8-16 aliens

**UFO Crash/Landing:**
- Intercept UFO to trigger ground mission
- Objective: Eliminate all enemies
- Rewards: Alien materials, tech salvage
- Contains "Outsider" enemy guarding UFO core
- Enemy count: 6-12 aliens + Outsider

**Terror Mission:**
- Aliens attack civilian population
- Objective: Save civilians, eliminate enemies
- 16-18 civilians on map, must rescue as many as possible
- Rating: Excellent (14+), Good (9-13), Poor (1-8), Terrible (0 = country leaves)
- Special enemies: Chryssalids turn civilians into zombies
- Enemy count: 10-18 aliens

**Council Mission:**
- Special objectives from Council of Nations
- Types: Asset Recovery, VIP Escort, VIP Extraction, Bomb Disposal
- Higher rewards, unique challenges
- Some reduce global panic on success

**Base Assault:**
- Story mission to assault alien base
- Large map with many enemy types
- Reduces global panic by 2 on completion
- Required for game progression

#### 9.2 Mission Flow

**Pre-Mission:**
1. Mission briefing with location, type, difficulty
2. Squad selection (4-6 soldiers depending on upgrades)
3. Loadout confirmation
4. Launch mission

**During Mission:**
1. Squad deploys from transport (Skyranger)
2. Turn-based combat until objective complete
3. May abort mission early (Evac zone)
4. Mission ends when objectives met or squad eliminated

**Post-Mission (Debrief):**
1. Mission rating based on performance
2. Casualties reported (wounded/KIA)
3. Soldiers gain XP from kills/mission completion
4. Rewards granted
5. Salvage collected
6. Panic effects applied

#### 9.3 Mission Difficulty

**Enemy Scaling:**
- Early game: Sectoids, Drones
- Mid game: Floaters, Thin Men, Mutons
- Late game: Heavy Floaters, Cyberdiscs, Sectopods, Ethereals

**Difficulty Modifiers:**
| Setting | Enemy HP | Starting Panic | Soldier HP | AI Behavior |
|---------|----------|----------------|------------|-------------|
| Easy | -2 | All level 1 | +2 | Passive |
| Normal | 0 | All level 1 | 0 | Normal |
| Classic | +1-2 | 50% level 2 | -1 | Aggressive |
| Impossible | +3-5 | All level 2 | -1 | Very Aggressive |

### 10. World Map & Panic System

**World Map (Geoscape):**
- Displays 16 Council nations across 5 continents
- Shows satellite coverage, panic levels, alien activity
- Interface for launching missions and monitoring threats

**Council Nations:**
| Continent | Countries |
|-----------|-----------|
| North America | USA, Canada, Mexico |
| Europe | UK, France, Germany, Russia |
| Asia | China, Japan, India |
| South America | Brazil, Argentina |
| Africa | Egypt, Nigeria, South Africa |

**Panic Levels:**
- Scale: 1-5 (1=calm, 5=critical)
- Displayed as colored bar: Green → Yellow → Orange → Red
- Level 5 + end of month = country leaves XCOM
- Country leaving: permanent loss of funding, can never return
- 8 countries leaving = game over

**Panic Changes:**
| Event | Effect |
|-------|--------|
| Successful abduction mission | -2 panic in helped country |
| Ignored abduction | +2 panic in country, +1 across continent |
| Failed abduction | +2 panic in all involved countries |
| Successful terror mission (Excellent) | -3 country, -2 continent |
| Failed terror mission | Country leaves, +2 continent |
| Satellite launched | -2 panic in country |
| UFO not intercepted | +2 panic in country |
| Alien Base Assault | -2 panic worldwide |

**Satellite Coverage:**
- Prevents abductions in covered countries
- Provides monthly funding bonus
- Grants scientist/engineer bonuses
- Detects UFOs for interception
- Each satellite requires uplink capacity

**Continental Bonuses:**
| Continent | Bonus |
|-----------|-------|
| North America | "Air & Space" - Aircraft/weapons cost -50% |
| Europe | "Expert Knowledge" - Labs/Workshops cost -50% |
| Asia | "Future Combat" - Foundry/OTS projects cost -50% |
| South America | "We Have Ways" - Autopsies/Interrogations instant |
| Africa | "All In" - Monthly funding +30% |

---

## Technical Implementation

### Architecture Overview

```
src/
├── components/
│   ├── core/                 # Shared UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Tooltip.jsx
│   │   └── ResourceDisplay.jsx
│   │
│   ├── menus/               # Menu screens
│   │   ├── MainMenu.jsx
│   │   ├── PauseMenu.jsx
│   │   └── SettingsMenu.jsx
│   │
│   ├── base/                # Base management components
│   │   ├── BaseView.jsx           # Main ant-farm view
│   │   ├── FacilitySlot.jsx       # Individual facility display
│   │   ├── BuildMenu.jsx          # Facility construction
│   │   ├── MissionControl.jsx     # World map interface
│   │   ├── ResearchLab.jsx        # Research interface
│   │   ├── Engineering.jsx        # Manufacturing interface
│   │   ├── Barracks.jsx           # Soldier management
│   │   ├── SoldierDetail.jsx      # Individual soldier view
│   │   ├── LoadoutEditor.jsx      # Equipment assignment
│   │   ├── SkillTree.jsx          # Ability selection
│   │   └── SituationRoom.jsx      # Panic/satellite management
│   │
│   ├── tactical/            # Combat components
│   │   ├── TacticalView.jsx       # Main combat container
│   │   ├── IsometricMap.jsx       # SVG map renderer
│   │   ├── TileGrid.jsx           # Grid overlay system
│   │   ├── UnitSprite.jsx         # Soldier/enemy display
│   │   ├── CoverIndicator.jsx     # Cover shield icons
│   │   ├── MovementPreview.jsx    # Blue/yellow move zones
│   │   ├── ActionBar.jsx          # Soldier action buttons
│   │   ├── AbilityMenu.jsx        # Ability activation
│   │   ├── TargetingUI.jsx        # Aim/shoot interface
│   │   ├── CombatLog.jsx          # Action history display
│   │   ├── TurnIndicator.jsx      # Current turn display
│   │   └── MissionObjectives.jsx  # Objective tracker
│   │
│   ├── levelEditor/         # Editor components
│   │   ├── LevelEditor.jsx        # Main editor container
│   │   ├── EditorToolbar.jsx      # Tool selection
│   │   ├── TilePalette.jsx        # Tile type picker
│   │   ├── ObjectPalette.jsx      # Cover/spawn placement
│   │   ├── PropertiesPanel.jsx    # Selected item properties
│   │   ├── LayerControls.jsx      # Floor level management
│   │   └── ExportDialog.jsx       # Save/load maps
│   │
│   └── hud/                 # HUD overlays
│       ├── GameHUD.jsx
│       ├── ResourceBar.jsx
│       └── NotificationToast.jsx
│
├── systems/                 # Game logic managers
│   ├── GameStateManager.js        # Core state machine
│   ├── CombatManager.js           # Turn/action processing
│   ├── PathfindingSystem.js       # A* movement calculation
│   ├── LineOfSight.js             # Visibility calculation
│   ├── CoverCalculator.js         # Cover/flank detection
│   ├── DamageCalculator.js        # Hit/crit/damage math
│   ├── AIController.js            # Enemy behavior
│   ├── ResearchManager.js         # Research progression
│   ├── EngineeringManager.js      # Build queue handling
│   ├── MissionGenerator.js        # Random mission creation
│   ├── PanicManager.js            # Global panic tracking
│   └── SaveManager.js             # Persistence
│
├── data/                    # Static game data
│   ├── soldiers.js                # Class definitions
│   ├── skills.js                  # Ability definitions
│   ├── weapons.js                 # Weapon stats
│   ├── armor.js                   # Armor stats
│   ├── items.js                   # Equipment stats
│   ├── facilities.js              # Building definitions
│   ├── research.js                # Tech tree
│   ├── enemies.js                 # Alien definitions
│   ├── maps/                      # Map data files
│   └── missions.js                # Mission templates
│
├── hooks/                   # Custom React hooks
│   ├── useGameState.js
│   ├── useCombatTurn.js
│   ├── usePathfinding.js
│   ├── useSelection.js
│   └── useKeyboard.js
│
├── context/                 # React context providers
│   ├── GameContext.jsx
│   ├── CombatContext.jsx
│   └── EditorContext.jsx
│
├── utils/                   # Helper functions
│   ├── gridUtils.js               # Coordinate conversions
│   ├── randomUtils.js             # RNG helpers
│   ├── combatUtils.js             # Combat calculations
│   └── saveUtils.js               # Serialization
│
├── assets/                  # SVG graphics
│   ├── tiles/                     # Map tile graphics
│   ├── units/                     # Character sprites
│   ├── ui/                        # Interface elements
│   └── icons/                     # Item/ability icons
│
├── styles/                  # CSS modules
│   └── *.module.css
│
├── App.jsx                  # Root component
└── index.jsx               # Entry point
```

### Data Structures

#### Game State
```javascript
const GameState = {
  meta: {
    difficulty: 'Normal',       // Easy | Normal | Classic | Impossible
    gameTime: {
      day: 1,
      month: 3,
      year: 2015
    },
    ironmanMode: false
  },
  
  resources: {
    credits: 500,
    alienAlloys: 0,
    elerium: 0,
    weaponFragments: 0,
    scientists: 10,
    engineers: 10
  },
  
  base: {
    power: { used: 0, total: 8 },
    facilities: [
      // { id, type, position: {row, col}, status: 'operational'|'building', buildProgress }
    ],
    excavation: [
      // { position: {row, col}, status: 'excavated'|'excavating'|'locked', progress }
    ]
  },
  
  soldiers: [
    // SoldierData objects
  ],
  
  research: {
    completed: ['xeno-biology'],
    active: { projectId: 'beam-weapons', progress: 45, totalDays: 14 },
    queue: []
  },
  
  engineering: {
    buildQueue: [
      // { itemId, quantity, progress, totalDays }
    ],
    inventory: {
      // itemId: quantity
    }
  },
  
  worldMap: {
    countries: {
      'usa': { funding: 180, panic: 1, hasSatellite: true },
      'uk': { funding: 100, panic: 2, hasSatellite: false },
      // ...
    },
    satellites: {
      available: 1,
      deployed: ['usa']
    }
  },
  
  missions: {
    available: [
      // MissionData objects
    ],
    completed: []
  }
};
```

#### Soldier Data
```javascript
const SoldierData = {
  id: 'soldier_001',
  name: 'John "Titan" Smith',
  nationality: 'USA',
  
  class: 'Heavy',           // null for Rookie
  rank: 'Sergeant',         // Rookie -> Squaddie -> ... -> Colonel
  xp: 145,
  
  stats: {
    hp: 8,
    maxHp: 8,
    aim: 72,
    will: 48,
    movement: 12
  },
  
  abilities: ['fire_rocket', 'bullet_swarm', 'suppression'],
  
  equipment: {
    primaryWeapon: 'heavy_laser',
    secondaryWeapon: 'rocket_launcher',
    armor: 'carapace_armor',
    items: ['frag_grenade']
  },
  
  status: 'available',      // available | wounded | training | deployed | kia
  woundedDays: 0,
  
  stats_history: {
    missions: 12,
    kills: 34,
    daysWounded: 8
  }
};
```

#### Tactical Combat State
```javascript
const CombatState = {
  mapId: 'urban_warehouse_01',
  missionType: 'abduction',
  
  tiles: [
    // 2D array of TileData
  ],
  
  units: [
    {
      id: 'unit_001',
      soldierId: 'soldier_001',     // or enemyType for aliens
      team: 'xcom',                 // xcom | alien
      position: { x: 5, y: 8, z: 0 },
      facing: 'east',
      
      currentHp: 6,
      maxHp: 8,
      actionsRemaining: 2,
      hasActed: false,
      
      status: {
        overwatch: false,
        hunkered: false,
        suppressed: false,
        panicked: false
      },
      
      activeAbilities: ['suppression'],
      cooldowns: { run_and_gun: 0 }
    }
  ],
  
  turnPhase: 'player',        // player | enemy
  turnNumber: 3,
  
  activatedPods: ['pod_001', 'pod_002'],
  visibleEnemies: ['unit_005', 'unit_006'],
  
  objectives: {
    primary: { type: 'eliminate_all', status: 'active' },
    secondary: []
  },
  
  selectedUnit: 'unit_001',
  targetingMode: null,        // null | move | shoot | ability
  
  combatLog: [
    { turn: 2, actor: 'unit_001', action: 'shoot', target: 'unit_005', result: { hit: true, damage: 4, killed: false } }
  ]
};
```

#### Tile Data
```javascript
const TileData = {
  x: 5,
  y: 8,
  z: 0,                      // Floor level
  
  terrain: 'concrete',       // grass | concrete | metal | water | void
  traversable: true,
  movementCost: 1,
  
  cover: {
    north: 'full',           // none | half | full
    south: 'none',
    east: 'half',
    west: 'none'
  },
  
  elevation: 0,              // Height above ground
  
  objects: [
    { type: 'car', destructible: true, hp: 3 }
  ],
  
  spawnPoint: null,          // 'xcom' | 'alien' | 'civilian'
  revealed: false
};
```

#### Map Data (Level Editor Output)
```javascript
const MapData = {
  id: 'custom_map_001',
  name: 'Urban Warehouse',
  author: 'Player',
  
  dimensions: {
    width: 30,
    height: 30,
    floors: 2
  },
  
  tiles: [
    // 3D array [z][y][x] of TileData
  ],
  
  spawnZones: {
    xcom: [{ x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 }, /* ... */],
    alien: [
      { x: 25, y: 25, z: 0, podSize: 3 },
      { x: 15, y: 20, z: 1, podSize: 2 }
    ],
    civilian: [/* terror missions only */]
  },
  
  objectives: {
    evac: { x: 2, y: 2, z: 0 },
    bomb: null,
    vip: null
  },
  
  metadata: {
    missionTypes: ['abduction', 'ufo_crash'],
    difficulty: 'medium',
    environment: 'urban'
  }
};
```

### SVG Rendering System

#### Isometric Projection
```javascript
// Convert grid coordinates to screen position
function gridToScreen(gridX, gridY, gridZ = 0) {
  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 32;
  const Z_OFFSET = 24;
  
  return {
    screenX: (gridX - gridY) * (TILE_WIDTH / 2),
    screenY: (gridX + gridY) * (TILE_HEIGHT / 2) - (gridZ * Z_OFFSET)
  };
}

// Convert screen position to grid coordinates
function screenToGrid(screenX, screenY, gridZ = 0) {
  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 32;
  const Z_OFFSET = 24;
  
  const adjustedY = screenY + (gridZ * Z_OFFSET);
  
  return {
    gridX: Math.floor((screenX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2),
    gridY: Math.floor((adjustedY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2)
  };
}
```

#### Tile SVG Template
```jsx
// Basic isometric tile shape
const IsometricTile = ({ x, y, z, terrain, coverNorth, coverEast, coverSouth, coverWest, highlighted, selected }) => {
  const { screenX, screenY } = gridToScreen(x, y, z);
  
  // Diamond shape points for isometric tile
  const tilePoints = [
    [32, 0],    // Top
    [64, 16],   // Right
    [32, 32],   // Bottom
    [0, 16]     // Left
  ].map(([px, py]) => `${px},${py}`).join(' ');
  
  return (
    <g transform={`translate(${screenX}, ${screenY})`}>
      {/* Base tile */}
      <polygon 
        points={tilePoints}
        fill={TERRAIN_COLORS[terrain]}
        stroke={selected ? '#FFD700' : highlighted ? '#4A90D9' : '#333'}
        strokeWidth={selected || highlighted ? 2 : 1}
      />
      
      {/* Cover indicators (simplified) */}
      {coverNorth !== 'none' && <CoverWall side="north" type={coverNorth} />}
      {coverEast !== 'none' && <CoverWall side="east" type={coverEast} />}
      {coverSouth !== 'none' && <CoverWall side="south" type={coverSouth} />}
      {coverWest !== 'none' && <CoverWall side="west" type={coverWest} />}
    </g>
  );
};
```

#### Unit Sprite
```jsx
const UnitSprite = ({ unit, isSelected, isTargeted }) => {
  const { screenX, screenY } = gridToScreen(unit.position.x, unit.position.y, unit.position.z);
  
  const spriteData = unit.team === 'xcom' 
    ? SOLDIER_SPRITES[unit.class] 
    : ALIEN_SPRITES[unit.enemyType];
  
  return (
    <g transform={`translate(${screenX}, ${screenY - 16})`}>
      {/* Shadow */}
      <ellipse cx={32} cy={40} rx={12} ry={6} fill="rgba(0,0,0,0.3)" />
      
      {/* Unit body (simple SVG representation) */}
      <use href={`#${spriteData.svgId}`} />
      
      {/* Selection ring */}
      {isSelected && (
        <ellipse cx={32} cy={40} rx={16} ry={8} 
          fill="none" stroke="#4A90D9" strokeWidth={2} />
      )}
      
      {/* Target indicator */}
      {isTargeted && (
        <ellipse cx={32} cy={40} rx={14} ry={7}
          fill="none" stroke="#FF4444" strokeWidth={2} strokeDasharray="4,4" />
      )}
      
      {/* HP bar */}
      <HealthBar current={unit.currentHp} max={unit.maxHp} x={16} y={-8} width={32} />
      
      {/* Status icons */}
      {unit.status.overwatch && <StatusIcon type="overwatch" x={48} y={0} />}
      {unit.status.hunkered && <StatusIcon type="hunkered" x={48} y={12} />}
    </g>
  );
};
```

### Pathfinding (A* Implementation)

```javascript
class PathfindingSystem {
  constructor(tiles) {
    this.tiles = tiles;
  }
  
  getMovementRange(unit, maxCost) {
    const start = unit.position;
    const reachable = new Map();
    const frontier = new PriorityQueue();
    
    frontier.enqueue({ pos: start, cost: 0 }, 0);
    reachable.set(this.posKey(start), { cost: 0, path: [start] });
    
    while (!frontier.isEmpty()) {
      const { pos, cost } = frontier.dequeue();
      
      for (const neighbor of this.getNeighbors(pos)) {
        const moveCost = this.getMovementCost(pos, neighbor);
        const newCost = cost + moveCost;
        
        if (newCost > maxCost) continue;
        if (!this.canTraverse(unit, neighbor)) continue;
        
        const key = this.posKey(neighbor);
        if (!reachable.has(key) || reachable.get(key).cost > newCost) {
          const path = [...reachable.get(this.posKey(pos)).path, neighbor];
          reachable.set(key, { cost: newCost, path });
          frontier.enqueue({ pos: neighbor, cost: newCost }, newCost);
        }
      }
    }
    
    return reachable;
  }
  
  findPath(start, end) {
    // A* implementation
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    gScore.set(this.posKey(start), 0);
    fScore.set(this.posKey(start), this.heuristic(start, end));
    openSet.enqueue(start, fScore.get(this.posKey(start)));
    
    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
      
      if (this.posEquals(current, end)) {
        return this.reconstructPath(cameFrom, current);
      }
      
      for (const neighbor of this.getNeighbors(current)) {
        const tentativeG = gScore.get(this.posKey(current)) + 
                           this.getMovementCost(current, neighbor);
        
        if (tentativeG < (gScore.get(this.posKey(neighbor)) ?? Infinity)) {
          cameFrom.set(this.posKey(neighbor), current);
          gScore.set(this.posKey(neighbor), tentativeG);
          fScore.set(this.posKey(neighbor), tentativeG + this.heuristic(neighbor, end));
          
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(this.posKey(neighbor)));
          }
        }
      }
    }
    
    return null; // No path found
  }
  
  heuristic(a, b) {
    // Manhattan distance for isometric grid
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  getMovementCost(from, to) {
    const tile = this.tiles[to.z][to.y][to.x];
    const isDiagonal = from.x !== to.x && from.y !== to.y;
    return tile.movementCost * (isDiagonal ? 1.5 : 1);
  }
}
```

### Combat Calculation System

```javascript
class DamageCalculator {
  calculateHitChance(attacker, target, weapon, ability = null) {
    let hitChance = attacker.stats.aim;
    
    // Weapon modifiers
    hitChance += this.getWeaponRangeModifier(weapon, attacker.position, target.position);
    
    // Cover and flanking
    const coverInfo = this.getCoverInfo(attacker, target);
    if (!coverInfo.isFlanked) {
      hitChance -= COVER_DEFENSE[coverInfo.coverType]; // 0 / 20 / 40
    }
    
    // Height advantage
    if (attacker.position.z > target.position.z) {
      hitChance += 20;
    }
    
    // Ability modifiers
    hitChance += this.getAbilityAimModifiers(attacker, target);
    
    // Status effects
    if (attacker.status.suppressed) hitChance -= 30;
    
    // Clamp to 1-100%
    return Math.min(100, Math.max(1, hitChance));
  }
  
  calculateCritChance(attacker, target, weapon, coverInfo) {
    let critChance = weapon.critChance;
    
    // Flanked or no cover = +50% crit
    if (coverInfo.isFlanked || coverInfo.coverType === 'none') {
      critChance += 50;
    }
    
    // Ability modifiers
    critChance += this.getAbilityCritModifiers(attacker, target);
    
    return Math.min(100, Math.max(0, critChance));
  }
  
  calculateDamage(weapon, isCrit) {
    const baseDamage = this.rollDamage(weapon.damageMin, weapon.damageMax);
    
    if (isCrit) {
      return Math.floor(baseDamage * (1 + weapon.critMultiplier));
    }
    
    return baseDamage;
  }
  
  getCoverInfo(attacker, target) {
    const coverCalc = new CoverCalculator(this.tiles);
    return coverCalc.getCoverBetween(attacker.position, target.position);
  }
  
  getWeaponRangeModifier(weapon, attackerPos, targetPos) {
    const distance = this.getDistance(attackerPos, targetPos);
    
    switch (weapon.type) {
      case 'shotgun':
        return distance <= 4 ? 20 : -(distance - 4) * 3;
      case 'sniper':
        return distance >= 10 ? 10 : -20;
      case 'lmg':
        return -10; // General aim penalty
      default:
        return 0;
    }
  }
}
```

### AI Controller

```javascript
class AIController {
  constructor(combatState, difficulty) {
    this.state = combatState;
    this.difficulty = difficulty;
  }
  
  async executeEnemyTurn() {
    const enemies = this.state.units.filter(u => u.team === 'alien' && u.currentHp > 0);
    
    for (const enemy of enemies) {
      await this.executeUnitAI(enemy);
    }
  }
  
  async executeUnitAI(unit) {
    const visibleTargets = this.getVisibleTargets(unit);
    
    if (visibleTargets.length === 0) {
      // No targets - patrol or advance
      await this.executePatrol(unit);
      return;
    }
    
    // Evaluate possible actions
    const actions = this.evaluateActions(unit, visibleTargets);
    const bestAction = this.selectBestAction(actions);
    
    await this.executeAction(unit, bestAction);
  }
  
  evaluateActions(unit, targets) {
    const actions = [];
    
    // Evaluate shooting from current position
    for (const target of targets) {
      const hitChance = this.calcHitChance(unit, target);
      const expectedDamage = hitChance / 100 * this.getWeaponDamage(unit);
      
      actions.push({
        type: 'shoot',
        target: target.id,
        score: expectedDamage * (target.currentHp <= expectedDamage ? 2 : 1)
      });
    }
    
    // Evaluate moving to better positions
    const coverPositions = this.findCoverPositions(unit, targets);
    for (const pos of coverPositions) {
      const flankBonus = this.canFlankFrom(pos, targets) ? 50 : 0;
      const coverBonus = this.getCoverValue(pos, targets) * 10;
      
      actions.push({
        type: 'move',
        position: pos,
        score: flankBonus + coverBonus
      });
    }
    
    // Evaluate special abilities
    actions.push(...this.evaluateAbilities(unit, targets));
    
    return actions;
  }
  
  selectBestAction(actions) {
    // Sort by score, add some randomness on lower difficulties
    actions.sort((a, b) => b.score - a.score);
    
    if (this.difficulty === 'Easy' && Math.random() < 0.3) {
      // 30% chance to pick suboptimal action on Easy
      return actions[Math.min(actions.length - 1, Math.floor(Math.random() * 3))];
    }
    
    return actions[0];
  }
}
```

### Level Editor System

```jsx
const LevelEditor = () => {
  const [map, setMap] = useState(createEmptyMap(30, 30, 1));
  const [selectedTool, setSelectedTool] = useState('terrain');
  const [selectedTile, setSelectedTile] = useState('concrete');
  const [currentFloor, setCurrentFloor] = useState(0);
  
  const tools = {
    terrain: { name: 'Terrain', cursor: 'crosshair' },
    cover: { name: 'Cover', cursor: 'pointer' },
    elevation: { name: 'Elevation', cursor: 'ns-resize' },
    spawn: { name: 'Spawn Points', cursor: 'cell' },
    objects: { name: 'Objects', cursor: 'copy' },
    eraser: { name: 'Eraser', cursor: 'not-allowed' }
  };
  
  const handleTileClick = (x, y) => {
    const newMap = { ...map };
    const tile = newMap.tiles[currentFloor][y][x];
    
    switch (selectedTool) {
      case 'terrain':
        tile.terrain = selectedTile;
        tile.traversable = selectedTile !== 'void';
        break;
      case 'cover':
        // Cycle cover on clicked edge
        const edge = getClickedEdge(x, y, mousePosition);
        tile.cover[edge] = cycleCover(tile.cover[edge]);
        break;
      case 'spawn':
        tile.spawnPoint = selectedSpawnType;
        break;
      case 'eraser':
        resetTile(tile);
        break;
    }
    
    setMap(newMap);
  };
  
  const exportMap = () => {
    const mapData = {
      id: `custom_${Date.now()}`,
      name: mapName,
      author: 'Player',
      dimensions: {
        width: map.width,
        height: map.height,
        floors: map.floors
      },
      tiles: map.tiles,
      spawnZones: extractSpawnZones(map),
      objectives: map.objectives,
      metadata: {
        missionTypes: selectedMissionTypes,
        difficulty: 'custom',
        environment: selectedEnvironment
      }
    };
    
    downloadJSON(mapData, `${mapName}.json`);
  };
  
  return (
    <div className="level-editor">
      <EditorToolbar 
        tools={tools}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
      />
      
      <div className="editor-main">
        <TilePalette 
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
        />
        
        <div className="editor-canvas">
          <IsometricMapEditor
            map={map}
            currentFloor={currentFloor}
            onTileClick={handleTileClick}
            selectedTool={selectedTool}
          />
        </div>
        
        <PropertiesPanel 
          map={map}
          onUpdateProperties={updateMapProperties}
        />
      </div>
      
      <LayerControls
        floors={map.floors}
        currentFloor={currentFloor}
        onFloorChange={setCurrentFloor}
        onAddFloor={addFloor}
        onRemoveFloor={removeFloor}
      />
      
      <div className="editor-actions">
        <Button onClick={exportMap}>Export Map</Button>
        <Button onClick={importMap}>Import Map</Button>
        <Button onClick={testMap}>Test Map</Button>
      </div>
    </div>
  );
};
```

---

## Style Guide

### Color Palette

**UI Colors:**
- Background Dark: `#1a1a2e`
- Background Medium: `#16213e`
- Background Light: `#0f3460`
- Accent Primary: `#e94560`
- Accent Secondary: `#4a90d9`
- Text Primary: `#ffffff`
- Text Secondary: `#a0a0a0`
- Success: `#4ade80`
- Warning: `#fbbf24`
- Danger: `#ef4444`

**Terrain Colors:**
- Grass: `#4a7c59`
- Concrete: `#6b7280`
- Metal: `#94a3b8`
- Water: `#3b82f6`
- Sand: `#d4a574`

**Team Colors:**
- XCOM: `#4a90d9` (blue)
- Alien: `#ef4444` (red)
- Civilian: `#fbbf24` (yellow)

### Typography

- **Headers:** System UI, -apple-system, sans-serif
- **Body:** Same stack
- **Monospace (stats):** 'Courier New', monospace

**Sizes:**
- H1: 2rem, 700 weight
- H2: 1.5rem, 600 weight
- H3: 1.25rem, 600 weight
- Body: 1rem, 400 weight
- Small: 0.875rem, 400 weight

### Component Styling

**Buttons:**
```css
.button {
  background: linear-gradient(180deg, #4a90d9 0%, #3a7bc8 100%);
  border: 1px solid #5ba0e9;
  border-radius: 4px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.button:hover {
  background: linear-gradient(180deg, #5ba0e9 0%, #4a90d9 100%);
}

.button-danger {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  border-color: #f87171;
}
```

**Panels:**
```css
.panel {
  background: rgba(22, 33, 62, 0.95);
  border: 1px solid rgba(74, 144, 217, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

**Tooltips:**
```css
.tooltip {
  background: #0f3460;
  border: 1px solid #4a90d9;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.875rem;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
```

---

## Testing Scenarios

### Combat Tests

1. **Movement Range Calculation**
   - Place soldier at (10, 10)
   - Verify blue move zone shows exactly 7 tiles in cardinal directions
   - Verify yellow dash zone shows exactly 15 tiles
   - Confirm diagonal movement costs ~1.5x

2. **Cover Detection**
   - Place wall at (5, 5) providing cover to south
   - Place attacker at (5, 3) - should see full cover shield
   - Place attacker at (7, 5) - should see flanked (yellow) indicator
   - Verify hit chance reflects cover penalties

3. **Damage Calculation**
   - Soldier with 75 Aim, Laser Rifle (5-7 damage, 10% crit)
   - Target in half cover: Expected hit ~55%
   - Target flanked: Expected hit ~75%, crit ~60%
   - Verify damage rolls between weapon min/max

4. **Overwatch Triggers**
   - Place soldier A in overwatch
   - Move enemy through line of sight
   - Verify reaction shot fires with -20 Aim penalty
   - Verify no crit chance (unless Opportunist)

5. **Turn Sequence**
   - Verify all player units can act before turn ends
   - Verify turn ends automatically when all units exhausted
   - Verify enemy turn processes all living enemies

### Base Management Tests

1. **Facility Construction**
   - Verify cannot build without sufficient power
   - Verify cannot build without required engineers
   - Verify excavation required for deeper rows
   - Verify adjacency bonuses apply correctly

2. **Research Progression**
   - Start "Beam Weapons" research (14 days)
   - Verify progress updates daily
   - Verify completion unlocks Laser weapons
   - Verify prerequisites block locked research

3. **Panic System**
   - Start game, verify all countries at level 1 (Normal difficulty)
   - Ignore abduction mission, verify +2 panic to country
   - Launch satellite, verify -2 panic
   - Reach level 5, verify country leaves at month end

### Level Editor Tests

1. **Tile Placement**
   - Select terrain tool, click tile
   - Verify terrain changes
   - Verify walkability updates

2. **Cover Placement**
   - Add wall to tile edge
   - Verify cover appears on correct side
   - Verify adjacent tiles reflect cover

3. **Export/Import**
   - Create small test map
   - Export to JSON
   - Import, verify all data matches

---

## Accessibility Requirements

- All interactive elements keyboard accessible (Tab navigation)
- Focus indicators visible on all focusable elements
- Color is not sole indicator of information (icons + colors for status)
- Text contrast ratio minimum 4.5:1
- Screen reader labels for all buttons and controls
- Pause functionality during combat
- Adjustable game speed
- Tooltips available for all game mechanics
- High contrast mode option

---

## Performance Goals

- Initial load time: < 3 seconds
- Combat turn processing: < 100ms
- Pathfinding calculation: < 50ms for full map
- 60 FPS target for UI interactions
- Map rendering: < 16ms per frame
- Save/Load operations: < 500ms
- Memory usage: < 200MB

---

## Extended Features (Future Scope)

### Phase 2 Features
- Psionic abilities and Psi Lab
- Additional soldier customization (appearance)
- More enemy types (Mutons, Cyberdiscs, Ethereals)
- Aircraft interception minigame
- UFO mission types

### Phase 3 Features
- Multiplayer (1v1 tactical battles)
- Campaign procedural generation
- Steam Workshop integration for custom maps
- Achievement system
- Mod support

---

## Implementation Notes

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.4.0",
  "immer": "^10.0.0"
}
```

### State Management
Use Zustand with Immer for immutable state updates. Separate stores for:
- `gameStore` - Campaign progress, resources, soldiers
- `combatStore` - Active tactical battle state
- `editorStore` - Level editor state

### Persistence
- Save to localStorage with compression
- Auto-save after each mission
- Manual save slots (5 available)
- Export/Import save files as JSON

### Build Configuration
- Vite for development and bundling
- CSS Modules for component styling
- SVG sprites for icons and units
- Lazy loading for non-critical components

---

*This document serves as the complete specification for implementing Tactical Command. Follow TINS principles: all functionality described here should be implementable without external references.*
