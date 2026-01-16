# REACT-KOMBAT

A lightweight spiritual successor to classic 2D fighting games, built entirely in React JSX components. REACT-KOMBAT captures the essence of arcade fighting games with SVG-based visuals designed for future sprite animation upgrades.

## Description

REACT-KOMBAT is a browser-based 2D fighting game that pays homage to the classic arcade fighting genre. The game features a complete experience from main menu through character selection to visceral one-on-one combat. Built entirely in React with no external game engines, it demonstrates that complex real-time gameplay can be achieved through careful state management and animation techniques.

The game launches with two fighters: **BOB** (balanced brawler) and **STEVE** (technical striker), each with unique movesets and visual designs. All graphics use SVG for crisp scaling, with an architecture designed to swap SVG placeholders for low frame-rate sprite animations (2-3 frames per move) as the project evolves.

Key differentiators include a dedicated block button system (vs hold-back-to-block), simplified 2-directional special move inputs, and a focus on accessibility while maintaining competitive depth.

---

## Table of Contents

1. [Game Flow & Screens](#game-flow--screens)
2. [Core Combat System](#core-combat-system)
3. [Input System](#input-system)
4. [Character Specifications](#character-specifications)
5. [Technical Implementation](#technical-implementation)
6. [Visual Design & Animation](#visual-design--animation)
7. [Audio Design](#audio-design)
8. [UI/UX Specifications](#uiux-specifications)
9. [State Management Architecture](#state-management-architecture)
10. [Testing Scenarios](#testing-scenarios)
11. [Accessibility Requirements](#accessibility-requirements)
12. [Performance Goals](#performance-goals)
13. [Extended Features](#extended-features)

---

## Game Flow & Screens

### Screen Progression

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐     ┌─────────────┐
│  MAIN MENU  │ ──▶ │ CHARACTER SELECT│ ──▶ │ VS SCREEN   │ ──▶ │ FIGHT ARENA │
└─────────────┘     └─────────────────┘     └─────────────┘     └─────────────┘
                                                                       │
                                                                       ▼
                                                               ┌─────────────┐
                                                               │RESULTS/RETRY│
                                                               └─────────────┘
```

### 1. Main Menu Screen

**Layout:**
- Full-screen dark backdrop with animated background effects
- Game logo "REACT-KOMBAT" prominently centered (stylized with blood-red gradient)
- Vertical menu stack centered below logo

**Menu Options:**
1. **FIGHT** - Begins character selection (1P vs CPU or 2P local)
2. **VS MODE** - Two-player local match
3. **OPTIONS** - Sound, difficulty, controls configuration
4. **CREDITS** - Development credits

**Interactions:**
- Keyboard: Arrow keys navigate, Enter selects
- Mouse: Hover highlight, click selects
- Selection triggers screen shake + confirmation sound
- Each option has unique hover animation

**Visual Style:**
- Background: Dark concrete texture with subtle red vein patterns pulsing
- Typography: Bold, angular custom font (think arcade cabinet style)
- Fire/smoke particle effects around logo
- Lightning bolt accent elements

### 2. Character Selection Screen

**Layout:**
- Two selection zones (LEFT for P1, RIGHT for P2/CPU)
- Character roster displayed as portrait cards in center grid
- Large character preview panels on outer edges
- Timer countdown (15 seconds per selection)

**For Each Player Zone:**
```
┌──────────────────────────────────────────────────────────────┐
│  [P1 PREVIEW]     [BOB] [STEVE] [?] [?]     [P2 PREVIEW]     │
│                                                               │
│  Fighter Name                           Fighter Name          │
│  Health: ████████                       Health: ████████      │
│  Speed:  ██████░░                       Speed:  ████████      │
│  Power:  ████████                       Power:  ██████░░      │
│                                                               │
│              [PRESS START WHEN READY]                        │
└──────────────────────────────────────────────────────────────┘
```

**Character Cards:**
- Portrait image (SVG headshot)
- Name label below
- Locked characters show "?" with padlock
- Selected state: Golden border + scale up 110%

**Character Stats Display:**
- Health (base HP pool)
- Speed (walk/dash speed)
- Power (damage multiplier)
- Displayed as stylized bar graphs

**Interactions:**
- P1: WASD or Arrow Keys to navigate roster, Enter/Space to confirm
- P2: IJKL to navigate, U to confirm (or CPU auto-selects)
- Cannot select same character as opponent (in VS mode)
- Random select option available

### 3. VS Screen (Pre-Fight)

**Layout:**
- Split-screen dramatic pose of both fighters
- VS emblem animated in center
- Stage name displayed at bottom
- 3-second dramatic pause before arena transition

**Elements:**
- Fighter portraits in action poses
- Names in large bold text
- "ROUND 1" indicator
- Crackling lightning effect between portraits

### 4. Fight Arena (Main Gameplay)

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [P1 HEALTH BAR]              ROUND 1              [P2 HEALTH BAR] │
│ [P1 NAME]                     :60                    [P2 NAME]    │
│ [SPECIAL METER]                                 [SPECIAL METER]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                        ┌───────────┐                               │
│                        │  STAGE    │                               │
│    [P1 FIGHTER]        │BACKGROUND │        [P2 FIGHTER]           │
│         🧍              │           │              🧍                │
│    ─────────────────────────────────────────────────────────      │
│                      [GROUND PLANE]                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**HUD Elements:**
- Health bars: Segmented design, drains smoothly, flashes red at 25%
- Timer: 60-second countdown (99 for extended matches)
- Round indicator: Best of 3 rounds
- Special meter: Fills with hits landed/received
- Win icons: Skull icons below health bar for rounds won

**Stage:**
- Side-scrolling arena (1.5x screen width)
- Parallax background layers (3 depths minimum)
- Destructible foreground elements (optional)
- Stage boundary indicators

**Round Flow:**
1. "ROUND X" announcement (1.5s)
2. "FIGHT!" announcement (0.5s)
3. Active combat
4. Round ends: KO or timeout
5. "PLAYER X WINS" or "DRAW" (2s)
6. Reset positions for next round or proceed to results

### 5. Results Screen

**Elements:**
- Winning character in victory pose (full body)
- "PLAYER X WINS" in large text
- Match statistics:
  - Total damage dealt
  - Combos landed
  - Special moves used
  - Perfect rounds bonus

**Options:**
- REMATCH - Same characters, same stage
- CHARACTER SELECT - Return to roster
- MAIN MENU - Return to title

---

## Core Combat System

### Frame Data Foundation

The game runs at a logical 60 FPS tick rate for combat calculations, regardless of rendering frame rate. All timing is measured in **frames** (1 frame = 16.67ms).

**Attack Anatomy:**
```
[STARTUP FRAMES] → [ACTIVE FRAMES] → [RECOVERY FRAMES]
    (wind-up)      (hitbox active)    (return to neutral)
```

### Attack Types

#### 1. Standing Attacks
| Input | Name | Startup | Active | Recovery | Damage | Block |
|-------|------|---------|--------|----------|--------|-------|
| LP | Light Punch | 4f | 3f | 8f | 5 | Mid |
| HP | Heavy Punch | 10f | 4f | 18f | 12 | Mid |
| LK | Light Kick | 5f | 3f | 10f | 5 | Mid |
| HK | Heavy Kick | 12f | 5f | 22f | 14 | Mid |

#### 2. Crouching Attacks (Hold DOWN + Attack)
| Input | Name | Startup | Active | Recovery | Damage | Block |
|-------|------|---------|--------|----------|--------|-------|
| D+LP | Crouch Jab | 4f | 2f | 7f | 4 | Mid |
| D+HP | Uppercut | 8f | 4f | 24f | 15 | Mid |
| D+LK | Low Kick | 5f | 3f | 9f | 4 | Low |
| D+HK | Sweep | 10f | 4f | 28f | 10 | Low |

#### 3. Jumping Attacks
| Input | Name | Startup | Active | Recovery | Damage |
|-------|------|---------|--------|----------|--------|
| J+LP | Jump Punch | 5f | until land | 4f | 8 |
| J+HP | Dive Punch | 7f | until land | 6f | 12 |
| J+LK | Jump Kick | 5f | until land | 4f | 8 |
| J+HK | Dive Kick | 8f | until land | 8f | 14 |

### Hit Regions

Three attack heights determine blocking requirements:

1. **HIGH** - Hits standing opponents, whiffs on crouching
2. **MID** - Hits both standing and crouching, blocked standing or crouching
3. **LOW** - Must be blocked crouching

### Blocking System

**Dedicated Block Button** (distinguishes from Street Fighter):
- Press BLOCK to enter block state
- Blocks MID attacks in any stance
- Must crouch (DOWN+BLOCK) to block LOW attacks
- Cannot block while in hitstun, attacking, or jumping
- Chip damage: Blocked special moves deal 25% damage

**Block Stun:**
- Light attacks: 8 frames of blockstun
- Heavy attacks: 14 frames of blockstun
- Special moves: 18-24 frames of blockstun

### Hitstun & Combos

When an attack connects:
1. Defender enters **hitstun** (cannot act)
2. Hitstun duration varies by attack strength
3. Attacker can chain additional hits if they recover before defender

**Hitstun Values:**
- Light attacks: 12 frames
- Heavy attacks: 20 frames
- Special moves: 24-30 frames
- Launcher attacks: 35 frames (pops up)

**Juggle System:**
- Airborne opponents can be hit up to 3 times
- Each subsequent juggle hit has reduced hitstun
- Gravity pulls opponent down during juggle

### Damage Scaling

Combo damage reduces with each subsequent hit:
| Hit # | Damage Multiplier |
|-------|-------------------|
| 1 | 100% |
| 2 | 90% |
| 3 | 80% |
| 4 | 70% |
| 5+ | 60% |

### Special Meter

**Meter Properties:**
- Maximum: 100 units (displayed as 3 bars of ~33 each)
- Gain on hit: 5 units per hit landed
- Gain on block: 3 units when blocking
- Gain on being hit: 8 units when taking damage

**Meter Usage:**
- **Enhanced Special (1 bar)**: Input special + HP+HK simultaneously
  - Adds extra hit, more damage, safer on block
- **Super Move (3 bars)**: Unique devastating attack per character
  - Armored startup, massive damage, cinematic

### Knockdown & Wake-up

**On Knockdown:**
- Knocked down state lasts 30 frames
- Cannot be hit while fully grounded
- Wake-up begins automatically

**Wake-up Options:**
- **Normal rise**: Stand up after 30 frames
- **Quick rise**: Press any button to recover in 20 frames
- **Delayed rise**: Hold DOWN to extend knockdown by 15 frames (mixup tool)

**Invincibility Frames:**
- First 4 frames of wake-up are invincible
- Allows reversal attacks to beat meaty pressure

---

## Input System

### Control Scheme

**Player 1 (Left Side):**
```
Movement:           Actions:
   W (Jump)         U = Light Punch    I = Heavy Punch
   ↑                J = Light Kick     K = Heavy Kick
A ← → D            L = Block
   ↓                O = Throw (or LP+LK)
   S (Crouch)
```

**Player 2 (Right Side):**
```
Movement:           Actions:
   ↑ (Jump)        Numpad 7 = LP      Numpad 8 = HP
   ↑               Numpad 4 = LK      Numpad 5 = HK
← ← → →           Numpad 6 = Block
   ↓               Numpad 9 = Throw
   ↓ (Crouch)
```

### Special Move Inputs

REACT-KOMBAT uses **simplified directional inputs** (MK-style, not quarter-circles):

**Input Notation:**
- D = Down
- F = Forward (toward opponent)
- B = Back (away from opponent)
- U = Up

**Motion Types:**
1. **D, F + Attack** = Forward special (e.g., projectile)
2. **D, B + Attack** = Backward special (e.g., retreat attack)
3. **B, F + Attack** = Charge forward special (e.g., rushing attack)
4. **D, D + Attack** = Ground special (e.g., low projectile)

**Input Buffer:**
- Directional inputs are valid for 12 frames
- Complete sequence within buffer window
- Button press completes the special move

**Input Priority:**
When multiple interpretations are possible:
1. Special move (if valid input detected)
2. Normal attack with direction modifier
3. Basic normal attack

### Throw System

**Throw Input:** LP + LK simultaneously (or dedicated THROW button)

**Properties:**
- Range: Very close (touching hitboxes)
- Startup: 5 frames
- Cannot be blocked
- Deals 15 damage
- Switches sides with opponent

**Throw Tech (Escape):**
- Input throw within 7 frames of being grabbed
- Both players reset to neutral
- No damage dealt

---

## Character Specifications

### BOB - "The Brawler"

**Archetype:** Balanced all-rounder with strong fundamentals

**Lore:** A former construction worker who learned to fight in underground bare-knuckle circuits. Bob relies on raw power and honest gameplay.

**Visual Design:**
- Stocky build, muscular frame
- Work boots, jeans, tank top (torn)
- Bandaged fists
- Crew cut hair, stubble beard
- Primary color: Orange/Brown

**Base Stats:**
- Health: 100 (standard)
- Walk Speed: 4.0 units/frame
- Dash Speed: 8.0 units/frame
- Jump Height: 120 units
- Jump Duration: 40 frames

**Special Moves:**

| Move | Input | Startup | Active | Recovery | Damage | Properties |
|------|-------|---------|--------|----------|--------|------------|
| Power Punch | D, F + HP | 14f | 4f | 22f | 18 | Knockdown on hit |
| Low Sweep | D, B + LK | 8f | 6f | 20f | 10 | Low, slides forward |
| Shoulder Rush | B, F + HK | 20f | 8f | 18f | 14 | Armor 1 hit during active |
| Rising Upper | D, D + HP | 6f | 10f | 30f | 20 | Anti-air, launcher |

**Enhanced Specials (1 Bar):**

| Move | Changes |
|------|---------|
| EX Power Punch | 2 hits, 24 damage, wall bounce |
| EX Low Sweep | Faster startup (6f), more range |
| EX Shoulder Rush | Full armor, 20 damage |
| EX Rising Upper | Invincible frames 1-8, 28 damage |

**Super Move - "KNOCKOUT BLOW" (3 Bars):**
- Input: D, F, D, F + HP+HK
- Startup: 10f (armored)
- Cinematic: Bob winds up massive haymaker, screen shakes on impact
- Damage: 35
- Launches opponent across screen

**Combo Routes:**
1. Basic: LP → LP → HP (3 hits, 17 damage)
2. Launcher: D+HP → J+HP → Power Punch (3 hits, 38 damage)
3. Advanced: LP → LP → D+HP → J+HK → Shoulder Rush (5 hits, 45 damage)

---

### STEVE - "The Technician"

**Archetype:** Technical fighter with superior speed and combo potential

**Lore:** A disgraced martial arts instructor who developed his own hybrid fighting style. Steve prioritizes precision over power.

**Visual Design:**
- Lean, athletic build
- Martial arts gi (open chest, sleeves torn off)
- Fingerless gloves
- Slicked-back dark hair
- Primary color: Blue/White

**Base Stats:**
- Health: 90 (slightly less)
- Walk Speed: 4.5 units/frame
- Dash Speed: 9.0 units/frame
- Jump Height: 130 units
- Jump Duration: 38 frames

**Special Moves:**

| Move | Input | Startup | Active | Recovery | Damage | Properties |
|------|-------|---------|--------|----------|--------|------------|
| Ki Blast | D, F + LP | 12f | Projectile | 20f | 10 | Mid projectile |
| Spinning Kick | D, B + HK | 10f | 8f | 16f | 12 | 2 hits, advances |
| Teleport | D, D + LK | 18f | - | 12f | 0 | Appears behind opponent |
| Flash Kick | D, D + HK | 4f | 8f | 28f | 16 | Anti-air, invincible |

**Enhanced Specials (1 Bar):**

| Move | Changes |
|------|---------|
| EX Ki Blast | Faster, 2 projectiles, 18 damage |
| EX Spinning Kick | 4 hits, launcher, 20 damage |
| EX Teleport | Instant recovery, can act immediately |
| EX Flash Kick | Fully invincible, 24 damage |

**Super Move - "THOUSAND STRIKES" (3 Bars):**
- Input: D, B, D, B + HP+HK
- Startup: 8f (invincible)
- Cinematic: Steve performs rapid-fire combo ending with spinning backfist
- Damage: 38
- 12-hit visual combo

**Combo Routes:**
1. Basic: LK → LK → HK (3 hits, 15 damage)
2. Launcher: Spinning Kick → J+HP → Ki Blast (4 hits, 32 damage)
3. Advanced: LP → LP → LK → Spinning Kick → J+LP → J+HK → Flash Kick (8 hits, 52 damage)

---

## Technical Implementation

### Component Architecture

```
src/
├── components/
│   ├── screens/
│   │   ├── MainMenu.jsx
│   │   ├── CharacterSelect.jsx
│   │   ├── VSScreen.jsx
│   │   ├── FightArena.jsx
│   │   └── ResultsScreen.jsx
│   │
│   ├── game/
│   │   ├── GameEngine.jsx        // Core game loop & state
│   │   ├── Fighter.jsx           // Fighter component wrapper
│   │   ├── FighterRenderer.jsx   // SVG/Sprite rendering
│   │   ├── Hitbox.jsx            // Collision visualization (debug)
│   │   ├── Projectile.jsx        // Projectile entities
│   │   └── Stage.jsx             // Background & floor
│   │
│   ├── ui/
│   │   ├── HealthBar.jsx
│   │   ├── SpecialMeter.jsx
│   │   ├── Timer.jsx
│   │   ├── RoundIndicator.jsx
│   │   ├── AnnouncerText.jsx     // "FIGHT!", "KO!", etc.
│   │   └── ComboCounter.jsx
│   │
│   └── effects/
│       ├── HitSpark.jsx          // Impact effects
│       ├── ScreenShake.jsx
│       └── SlowMotion.jsx        // Hit pause effect
│
├── systems/
│   ├── InputManager.js           // Keyboard input handling
│   ├── CollisionSystem.js        // AABB collision detection
│   ├── CombatResolver.js         // Hit/block/damage logic
│   ├── ComboTracker.js           // Combo counting & scaling
│   └── AIController.js           // CPU opponent logic
│
├── data/
│   ├── characters/
│   │   ├── bob.js                // Bob's frame data & moves
│   │   └── steve.js              // Steve's frame data & moves
│   ├── stages.js                 // Stage configurations
│   └── constants.js              // Game constants
│
├── hooks/
│   ├── useGameLoop.js            // requestAnimationFrame loop
│   ├── useInput.js               // Input state management
│   └── useFighter.js             // Fighter state & actions
│
├── assets/
│   ├── svg/
│   │   ├── fighters/             // Fighter SVG components
│   │   ├── effects/              // Hit effects, projectiles
│   │   └── ui/                   // UI element graphics
│   └── sprites/                  // Future sprite sheets
│
└── App.jsx
```

### Game Loop Architecture

```javascript
// Core game loop runs at 60 logical FPS
const TICK_RATE = 1000 / 60; // 16.67ms

function GameEngine() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  
  useEffect(() => {
    let lastTime = 0;
    let accumulator = 0;
    
    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += deltaTime;
      
      // Fixed timestep updates
      while (accumulator >= TICK_RATE) {
        dispatch({ type: 'TICK' }); // Advance game state by 1 frame
        accumulator -= TICK_RATE;
      }
      
      // Render at display refresh rate
      requestAnimationFrame(gameLoop);
    };
    
    requestAnimationFrame(gameLoop);
  }, []);
}
```

### Fighter State Machine

```
                    ┌─────────┐
                    │  IDLE   │◀──────────────────────┐
                    └────┬────┘                       │
                         │                            │
         ┌───────────────┼───────────────┐            │
         ▼               ▼               ▼            │
    ┌─────────┐    ┌──────────┐    ┌──────────┐      │
    │ WALKING │    │ CROUCHING│    │ JUMPING  │      │
    └────┬────┘    └────┬─────┘    └────┬─────┘      │
         │              │               │             │
         └──────────────┴───────┬───────┘             │
                                ▼                     │
                         ┌───────────┐                │
                         │ ATTACKING │                │
                         └─────┬─────┘                │
                               │                      │
              ┌────────────────┼────────────────┐     │
              ▼                ▼                ▼     │
       ┌───────────┐    ┌───────────┐    ┌──────────┐│
       │  HITSTUN  │    │ BLOCKSTUN │    │ RECOVERY ├┘
       └─────┬─────┘    └─────┬─────┘    └──────────┘
             │                │
             ▼                │
      ┌────────────┐          │
      │ KNOCKDOWN  ├──────────┘
      └────────────┘
```

### Fighter Data Structure

```javascript
const fighterState = {
  // Identity
  id: 'player1',
  character: 'bob',
  
  // Position & Physics
  position: { x: 200, y: 0 },
  velocity: { x: 0, y: 0 },
  facing: 1, // 1 = right, -1 = left
  
  // State
  state: 'idle', // idle, walking, crouching, jumping, attacking, hitstun, blockstun, knockdown
  stateFrames: 0, // Frames in current state
  
  // Combat
  health: 100,
  maxHealth: 100,
  meter: 0,
  maxMeter: 100,
  
  // Current Action
  currentMove: null,
  moveFrame: 0,
  
  // Flags
  isGrounded: true,
  isBlocking: false,
  canCancel: false,
  hitstunRemaining: 0,
  blockstunRemaining: 0,
  invincibleFrames: 0,
  
  // Collision
  hurtbox: { x: -20, y: -80, width: 40, height: 80 },
  hitbox: null, // Active only during attacks
  
  // Combo
  comboCount: 0,
  juggleCount: 0,
};
```

### Collision System

```javascript
// AABB Collision Detection
function checkCollision(hitbox, hurtbox) {
  return (
    hitbox.x < hurtbox.x + hurtbox.width &&
    hitbox.x + hitbox.width > hurtbox.x &&
    hitbox.y < hurtbox.y + hurtbox.height &&
    hitbox.y + hitbox.height > hurtbox.y
  );
}

// Per-frame collision check
function processCombat(attacker, defender) {
  if (!attacker.hitbox) return null;
  
  // Transform hitbox to world coordinates
  const worldHitbox = {
    x: attacker.position.x + (attacker.hitbox.x * attacker.facing),
    y: attacker.position.y + attacker.hitbox.y,
    width: attacker.hitbox.width,
    height: attacker.hitbox.height,
  };
  
  const worldHurtbox = {
    x: defender.position.x + defender.hurtbox.x,
    y: defender.position.y + defender.hurtbox.y,
    width: defender.hurtbox.width,
    height: defender.hurtbox.height,
  };
  
  if (checkCollision(worldHitbox, worldHurtbox)) {
    return resolveHit(attacker, defender);
  }
  
  return null;
}
```

### Input Buffer System

```javascript
const INPUT_BUFFER_FRAMES = 12;

class InputBuffer {
  constructor() {
    this.buffer = []; // Array of { input, frame }
    this.currentFrame = 0;
  }
  
  addInput(input) {
    this.buffer.push({ input, frame: this.currentFrame });
    // Clean old inputs
    this.buffer = this.buffer.filter(
      entry => this.currentFrame - entry.frame <= INPUT_BUFFER_FRAMES
    );
  }
  
  checkSequence(sequence) {
    // Check if sequence was input within buffer window
    let seqIndex = 0;
    for (const entry of this.buffer) {
      if (entry.input === sequence[seqIndex]) {
        seqIndex++;
        if (seqIndex === sequence.length) return true;
      }
    }
    return false;
  }
  
  tick() {
    this.currentFrame++;
  }
}
```

---

## Visual Design & Animation

### SVG Fighter Structure

Each fighter is composed of modular SVG parts for animation:

```jsx
const FighterSVG = ({ pose, facing }) => (
  <g transform={`scale(${facing}, 1)`}>
    <g id="legs">
      <path id="left-leg" d={poses[pose].leftLeg} />
      <path id="right-leg" d={poses[pose].rightLeg} />
    </g>
    <g id="torso">
      <path id="body" d={poses[pose].body} />
    </g>
    <g id="arms">
      <path id="left-arm" d={poses[pose].leftArm} />
      <path id="right-arm" d={poses[pose].rightArm} />
    </g>
    <g id="head">
      <circle id="head-shape" cx="0" cy="-70" r="12" />
    </g>
  </g>
);
```

### Animation States

Each fighter has these animation states (minimum frames per state for initial SVG version):

| State | Frames | Loop |
|-------|--------|------|
| Idle | 2 | Yes |
| Walk Forward | 3 | Yes |
| Walk Backward | 3 | Yes |
| Crouch | 1 | No |
| Jump Rise | 2 | No |
| Jump Fall | 2 | No |
| Light Punch | 3 | No |
| Heavy Punch | 3 | No |
| Light Kick | 3 | No |
| Heavy Kick | 3 | No |
| Crouch Attack | 2 | No |
| Special 1-4 | 3 each | No |
| Hitstun | 2 | No |
| Knockdown | 3 | No |
| Win Pose | 2 | Yes |
| Lose Pose | 1 | No |

### Color Palettes

**BOB:**
```css
--bob-skin: #D4A574;
--bob-primary: #E07020;
--bob-secondary: #4A3728;
--bob-accent: #FFD700;
--bob-outline: #2D1810;
```

**STEVE:**
```css
--steve-skin: #E8C4A0;
--steve-primary: #2E5090;
--steve-secondary: #FFFFFF;
--steve-accent: #00BFFF;
--steve-outline: #1A2840;
```

### Hit Effects

```jsx
const HitSpark = ({ position, intensity }) => (
  <g className="hit-spark" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
    {/* Radial burst lines */}
    {[...Array(8)].map((_, i) => (
      <line
        key={i}
        x1="0" y1="0"
        x2={Math.cos(i * Math.PI / 4) * 30 * intensity}
        y2={Math.sin(i * Math.PI / 4) * 30 * intensity}
        stroke="#FFD700"
        strokeWidth="3"
        className="spark-line"
      />
    ))}
    {/* Center flash */}
    <circle r={15 * intensity} fill="#FFFFFF" className="spark-flash" />
  </g>
);
```

### Screen Effects

**Screen Shake:**
```javascript
// Apply to game container on heavy hits
const shakeKeyframes = [
  { transform: 'translate(0, 0)' },
  { transform: 'translate(-5px, 3px)' },
  { transform: 'translate(5px, -3px)' },
  { transform: 'translate(-3px, 5px)' },
  { transform: 'translate(0, 0)' },
];

function triggerScreenShake(intensity = 1) {
  container.animate(shakeKeyframes, {
    duration: 150 * intensity,
    easing: 'ease-out',
  });
}
```

**Hit Pause (Freeze Frame):**
- On hit: Freeze both fighters for 3-5 frames
- Creates weight and impact feel
- More frames for heavier attacks

---

## Audio Design

### Sound Categories

**UI Sounds:**
- Menu navigation: Soft click
- Menu select: Confirming woosh
- Menu back: Rejection thud

**Combat Sounds:**
- Light hit: Quick slap
- Heavy hit: Meaty thud
- Block: Dull impact
- Whiff: Air swoosh
- Special move: Unique per move

**Announcer Voice Lines:**
- "ROUND 1/2/3"
- "FIGHT!"
- "PLAYER 1 WINS" / "PLAYER 2 WINS"
- "K.O.!"
- "PERFECT!"
- "DRAW"

### Audio Implementation

```javascript
// Simple audio manager
const AudioManager = {
  sounds: {},
  
  preload(soundMap) {
    Object.entries(soundMap).forEach(([key, src]) => {
      this.sounds[key] = new Audio(src);
      this.sounds[key].preload = 'auto';
    });
  },
  
  play(soundId, volume = 1) {
    const sound = this.sounds[soundId];
    if (sound) {
      sound.currentTime = 0;
      sound.volume = volume;
      sound.play();
    }
  }
};
```

---

## UI/UX Specifications

### Health Bar Design

```
┌──────────────────────────────────────────────────────────────┐
│ ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────────────────────────────────┘
```

**Properties:**
- Width: 300px per player
- Height: 24px
- Background: Dark gray (#333)
- Health fill: Gradient from green (#4CAF50) to red (#F44336)
- Lost health: Shows briefly as white before disappearing
- Border: 2px gold (#FFD700)
- Segments: 10 visible tick marks

**Damage Animation:**
1. Immediate: White flash on bar
2. 0.2s delay: Health slides down to new value
3. Previous health shows as gray "ghost" bar briefly

### Special Meter Design

```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓░░░░ │ ░░░░░░░░░░░░ │
│     BAR 1     │     BAR 2     │     BAR 3     │
└─────────────────────────────────────────┘
```

**Properties:**
- 3 distinct bars (each = 33.3 meter)
- Full bar glows
- Meter gain causes brief flash
- Position: Below health bar

### Timer Display

**Style:**
- Large, bold numbers
- Centered at top
- Flashes red under 10 seconds
- Pulses on each second in final 10

### Announcer Text

**"ROUND X":**
- Font: 72px, bold, uppercase
- Color: White with black stroke
- Animation: Scales up from 0, holds 1s, fades
- Sound: Announcer voice

**"FIGHT!":**
- Font: 96px, bold
- Color: Red gradient
- Animation: Slam down from above, shake, fade
- Sound: Announcer voice

**"K.O.!":**
- Font: 120px, bold
- Color: Yellow/Orange gradient
- Animation: Screen shake, flash, zoom in
- Sound: Impact + announcer

### Combo Counter

**Display:**
- Shows during active combos
- Position: Near attacking player
- Format: "X HITS!" + damage total
- Animation: Each hit causes number to bounce

```jsx
const ComboCounter = ({ hits, damage }) => (
  <div className="combo-counter">
    <span className="hit-count">{hits}</span>
    <span className="hit-label">HITS!</span>
    <span className="damage-total">{damage} DMG</span>
  </div>
);
```

---

## State Management Architecture

### Global Game State

```javascript
const initialGameState = {
  // Screen management
  currentScreen: 'mainMenu', // mainMenu, characterSelect, vsScreen, fight, results
  
  // Match configuration
  matchConfig: {
    rounds: 3,
    timeLimit: 60,
    difficulty: 'medium', // easy, medium, hard (for CPU)
  },
  
  // Selected characters
  player1Character: null,
  player2Character: null,
  isPlayer2CPU: true,
  
  // Match state (during fight)
  match: {
    round: 1,
    player1Wins: 0,
    player2Wins: 0,
    timer: 60,
    isPaused: false,
    isRoundOver: false,
    winner: null,
  },
  
  // Fighter states
  fighters: {
    player1: { /* fighterState */ },
    player2: { /* fighterState */ },
  },
  
  // Active projectiles
  projectiles: [],
  
  // Visual effects
  effects: [],
  
  // Announcer state
  announcer: {
    currentText: null,
    duration: 0,
  },
};
```

### Action Types

```javascript
const ActionTypes = {
  // Screen navigation
  NAVIGATE_TO: 'NAVIGATE_TO',
  
  // Character select
  SELECT_CHARACTER: 'SELECT_CHARACTER',
  CONFIRM_SELECTION: 'CONFIRM_SELECTION',
  
  // Match flow
  START_MATCH: 'START_MATCH',
  START_ROUND: 'START_ROUND',
  END_ROUND: 'END_ROUND',
  END_MATCH: 'END_MATCH',
  
  // Gameplay
  TICK: 'TICK',
  PROCESS_INPUT: 'PROCESS_INPUT',
  
  // Fighter actions
  FIGHTER_MOVE: 'FIGHTER_MOVE',
  FIGHTER_ATTACK: 'FIGHTER_ATTACK',
  FIGHTER_BLOCK: 'FIGHTER_BLOCK',
  FIGHTER_HIT: 'FIGHTER_HIT',
  FIGHTER_KNOCKDOWN: 'FIGHTER_KNOCKDOWN',
  
  // Effects
  SPAWN_EFFECT: 'SPAWN_EFFECT',
  SPAWN_PROJECTILE: 'SPAWN_PROJECTILE',
  REMOVE_PROJECTILE: 'REMOVE_PROJECTILE',
  
  // Announcer
  SHOW_ANNOUNCEMENT: 'SHOW_ANNOUNCEMENT',
  HIDE_ANNOUNCEMENT: 'HIDE_ANNOUNCEMENT',
};
```

---

## Testing Scenarios

### Combat Tests

1. **Basic Hit Registration**
   - Player 1 punches, Player 2 in range → Hit registered, damage applied
   - Player 1 punches, Player 2 out of range → Whiff, no damage

2. **Blocking**
   - Player 2 blocks, Player 1 attacks mid → Block successful, chip damage only
   - Player 2 stands, Player 1 sweeps → Low hits, full damage
   - Player 2 crouch blocks, Player 1 sweeps → Block successful

3. **Combo System**
   - Light punch → Light punch → Heavy punch connects → 3-hit combo, scaled damage
   - Launcher → Jump attack → Special connects → Juggle combo works

4. **Special Moves**
   - Input D, F + HP correctly → Special move executes
   - Incomplete input → No special move
   - Special move hits → Extra hitstun applied

5. **Throw System**
   - Throw at close range → Throw succeeds
   - Throw tech within window → Throw escaped
   - Throw while blocking → Throw connects (throws beat block)

### Edge Cases

1. **Simultaneous Hits (Trades)**
   - Both players attack on same frame → Both take damage
   - Priority: Whoever's hitbox is more forward wins in exact ties

2. **Corner Behavior**
   - Pushed to corner → Cannot move backward
   - Knockback in corner → Wall bounce instead of sliding

3. **Round Transition**
   - KO → Both players reset position, health refilled
   - Time runs out → Player with more health wins
   - Both KO same frame → Draw, replay round

4. **Projectile Interactions**
   - Projectiles collide → Both destroyed
   - Projectile hits blocking opponent → Chip damage
   - Jumping over projectile → Clean jump, no damage

---

## Accessibility Requirements

### Visual Accessibility

1. **Color Contrast**
   - All UI text meets WCAG AA (4.5:1 ratio)
   - Health bars distinguishable without color (use patterns)
   - Hit/hurt indicator doesn't rely solely on color

2. **Motion Sensitivity**
   - Option to reduce screen shake
   - Option to disable flashing effects
   - Steady frame rate preferred

3. **Visual Indicators**
   - Audio-visual sync for all important events
   - Clear visual state changes (blocking, hitstun)

### Control Accessibility

1. **Remappable Controls**
   - All buttons can be reassigned
   - One-button special moves option
   - Simplified input mode (auto-combos)

2. **Input Timing**
   - Adjustable input buffer window (8-16 frames)
   - Training mode with input display

### Cognitive Accessibility

1. **Clear Feedback**
   - Combo counter always visible during combo
   - Damage numbers optional
   - Round/win state clearly communicated

2. **Pause Functionality**
   - Pause available at any time
   - Move list accessible from pause menu

---

## Performance Goals

### Target Metrics

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS stable |
| Input Latency | <16ms (1 frame) |
| Load Time | <3s initial load |
| Memory Usage | <100MB |

### Optimization Strategies

1. **Rendering**
   - Use CSS transforms over position changes
   - Batch DOM updates
   - Use `will-change` for animated elements
   - Implement object pooling for effects

2. **State Updates**
   - Memoize expensive calculations
   - Use refs for non-rendering state
   - Minimize re-renders with React.memo

3. **Asset Loading**
   - Preload all assets before fight
   - Use SVG sprites
   - Lazy load non-essential screens

---

## Extended Features

### Future Enhancements (Post-MVP)

1. **Sprite Animation System**
   - Replace SVG with sprite sheets
   - 2-3 frame animations per move
   - Smooth interpolation between frames

2. **Additional Characters**
   - Character 3: Grappler archetype
   - Character 4: Zoner archetype
   - Unique mechanics per character

3. **Stage Variety**
   - Stage 2: Industrial factory
   - Stage 3: Temple arena
   - Stage hazards (optional)

4. **Online Multiplayer**
   - WebRTC peer-to-peer
   - Rollback netcode implementation
   - Matchmaking system

5. **Training Mode**
   - Input display
   - Hitbox visualization
   - Frame data overlay
   - Record/playback dummy

6. **Replay System**
   - Record match inputs
   - Playback with rewind
   - Share replay codes

---

## Implementation Priorities

### Phase 1: Core Loop (MVP)
- [ ] Main menu navigation
- [ ] Basic character select (2 characters)
- [ ] Fight arena with movement
- [ ] Basic attacks (LP, HP, LK, HK)
- [ ] Blocking
- [ ] Health bars and round system
- [ ] Win/lose conditions

### Phase 2: Depth
- [ ] Special moves
- [ ] Combo system
- [ ] Special meter
- [ ] Enhanced specials
- [ ] Super moves
- [ ] Sound effects

### Phase 3: Polish
- [ ] Announcer text
- [ ] Hit effects
- [ ] Screen shake
- [ ] VS screen
- [ ] Results screen
- [ ] AI opponent

### Phase 4: Expansion
- [ ] Sprite animation system
- [ ] Additional characters
- [ ] Training mode
- [ ] Options menu

---

*REACT-KOMBAT: Where every frame is a battle.*
