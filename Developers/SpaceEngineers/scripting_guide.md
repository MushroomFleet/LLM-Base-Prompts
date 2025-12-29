# Complete Guide to Scripting with Space Engineers

**Space Engineers scripting empowers players to automate complex in-game interactions through C# code executed by Programmable Blocks.** Scripts can control any block in the game—from automated airlocks and inventory management to precision flight controls and sophisticated mining drones. This capability transforms Space Engineers from a building game into a genuine automation playground where programming skills translate directly into engineering advantages.

The scripting system uses a restricted subset of C# and .NET, providing enough power for complex automation while preventing security issues. Scripts interact with blocks through the **Ingame Scripting API** (distinct from the Modding API), accessing blocks via the `GridTerminalSystem` and controlling them through type-specific interfaces like `IMyDoor`, `IMyThrust`, and `IMyTextSurface`.

---

## Prerequisites and setup requirements

Before writing scripts, ensure your environment meets these requirements:

**Platform restrictions apply strictly**: Scripts run only on **PC (Steam/Microsoft Store)** and **Dedicated Servers**—Microsoft and Sony prohibit custom code execution on Xbox and PlayStation. Console players can only use scripts indirectly by joining PC-hosted servers.

**Required game settings:**
- Enable **Experimental Mode** in the game's main options
- Enable **In-game Scripts** in your world's Advanced Settings
- Ensure Programmable Blocks have power in-game

**Development environment setup**: While the in-game editor works, it's quite limited. Professional scripters use external IDEs:

| Tool | Description |
|------|-------------|
| **Visual Studio Community** | Full-featured IDE, completely free |
| **MDK2 (Malware's Development Kit)** | VS extension with whitelist checking, auto-deployment, and project templates |
| **Visual Studio Code** | Lightweight alternative with appropriate extensions |
| **Rider** | Professional IDE with free non-commercial edition |

MDK2 is highly recommended—it creates properly configured projects, validates code against Space Engineers' whitelist in real-time, and deploys scripts directly to the game.

---

## The basic structure of a Space Engineers script

Every script runs within an implicit `Program` class that inherits from `MyGridProgram`. When you open a newly placed Programmable Block, you see this skeleton:

```csharp
public Program()
{
}

public void Save()
{
}

public void Main(string argument)
{
}
```

In MDK projects, this wraps inside a namespace structure:

```csharp
namespace IngameScript
{
    partial class Program : MyGridProgram
    {
        public Program() { }
        public void Save() { }
        public void Main(string argument, UpdateType updateSource) { }
    }
}
```

The namespace and class declaration are **not** part of the actual script—Space Engineers adds these automatically. Only code inside the `Program` class executes.

**Three hard limits constrain scripts:**
- **100,000 characters** maximum script size
- **50,000 instruction count** per single execution (prevents infinite loops)
- **Whitelisted .NET types only**—no file system, threading, or network access

---

## Understanding the Program class methods

### Program() — The constructor

```csharp
public Program()
{
    // Runs once when script loads or recompiles
    Runtime.UpdateFrequency = UpdateFrequency.Update100;
    InitializeBlocks();
}
```

The constructor runs **once** when the game loads or when you recompile the script. Use it for one-time initialization: fetching block references, setting update frequency, and initializing state variables. This is optional—simple scripts can omit it entirely.

### Save() — Persistence handler

```csharp
public void Save()
{
    // Runs when game saves or before recompile
    Storage = $"{_count};{_mode}";
}
```

Called whenever the game saves or before recompilation. Store data in the `Storage` string property to persist between sessions. Unlike normal variables, `Storage` survives recompiles and game reloads.

### Main() — Entry point

```csharp
public void Main(string argument, UpdateType updateSource)
{
    // Runs every time the script executes
}
```

The **required** method called each time the script runs. The `argument` parameter receives text from toolbar configurations, button panels, or timer blocks. The `updateSource` enum indicates what triggered execution—useful for handling different triggers differently.

### Built-in properties from MyGridProgram

Your script inherits several essential properties:

| Property | Purpose |
|----------|---------|
| `Me` | Reference to the Programmable Block running the script |
| `GridTerminalSystem` | Access to all blocks on the grid |
| `Echo` | Output function for debugging (displays in PB details) |
| `Storage` | Persistent string that survives recompiles |
| `Runtime` | Access to timing and update frequency settings |
| `IGC` | Inter-Grid Communication system |

---

## Finding and controlling blocks with GridTerminalSystem

`GridTerminalSystem` provides access to all blocks on the same grid and mechanically connected grids (via rotors, pistons, connectors—not landing gears) that share ownership with the Programmable Block.

### Getting a single block by exact name

```csharp
IMyInteriorLight light = GridTerminalSystem.GetBlockWithName("Hangar Light") as IMyInteriorLight;
if (light == null)
{
    Echo("Block not found!");
    return;
}
light.Enabled = !light.Enabled;
```

Names must match **exactly**—case, spacing, and all characters. Always null-check before use.

### Getting all blocks of a specific type

```csharp
List<IMyBatteryBlock> batteries = new List<IMyBatteryBlock>();
GridTerminalSystem.GetBlocksOfType(batteries);

float totalPower = 0;
foreach (var battery in batteries)
    totalPower += battery.CurrentStoredPower;
Echo($"Total stored: {totalPower:F2} MWh");
```

### Filtering blocks with predicates

```csharp
List<IMyThrust> forwardThrusters = new List<IMyThrust>();
GridTerminalSystem.GetBlocksOfType(forwardThrusters, 
    t => t.Enabled && t.CustomName.Contains("Forward"));

// Filter to current construct only (ignores docked ships)
List<IMyTerminalBlock> myBlocks = new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(myBlocks, b => b.IsSameConstructAs(Me));
```

### Working with block groups

```csharp
IMyBlockGroup group = GridTerminalSystem.GetBlockGroupWithName("Airlock Doors");
if (group != null)
{
    List<IMyDoor> doors = new List<IMyDoor>();
    group.GetBlocksOfType(doors);
    foreach (var door in doors)
        door.CloseDoor();
}
```

### Searching blocks by partial name match

```csharp
List<IMyTerminalBlock> taggedBlocks = new List<IMyTerminalBlock>();
GridTerminalSystem.SearchBlocksOfName("[AUTO]", taggedBlocks);
```

---

## Working with different block types

All blocks inherit from `IMyTerminalBlock`, which provides common properties like `CustomName`, `CustomData`, and `EntityId`. Functional blocks add `Enabled` for on/off control. Here are the most commonly scripted block types:

### Doors (IMyDoor)

```csharp
IMyDoor door = GridTerminalSystem.GetBlockWithName("Airlock") as IMyDoor;
door.OpenDoor();           // Open
door.CloseDoor();          // Close
door.ToggleDoor();         // Toggle
bool isOpen = door.Open;   // Check state
DoorStatus status = door.Status;  // Open, Closed, Opening, Closing
```

### Pistons (IMyPistonBase)

```csharp
IMyPistonBase piston = GridTerminalSystem.GetBlockWithName("Drill Piston") as IMyPistonBase;
piston.Velocity = 0.5f;           // m/s (negative retracts)
piston.MinLimit = 0f;             // Minimum extension
piston.MaxLimit = 10f;            // Maximum extension
float position = piston.CurrentPosition;
piston.Extend();                  // Start extending
piston.Retract();                 // Start retracting
piston.Reverse();                 // Reverse direction
```

### Rotors (IMyMotorStator)

```csharp
IMyMotorStator rotor = GridTerminalSystem.GetBlockWithName("Solar Rotor") as IMyMotorStator;
rotor.TargetVelocityRPM = 1.0f;           // RPM (can be negative)
rotor.LowerLimitDeg = -45f;               // Degrees
rotor.UpperLimitDeg = 45f;
rotor.RotorLock = true;                   // Lock rotor
float angleRadians = rotor.Angle;         // Current angle in radians
float angleDegrees = MathHelper.ToDegrees(rotor.Angle);
```

### Thrusters (IMyThrust)

```csharp
IMyThrust thruster = GridTerminalSystem.GetBlockWithName("Forward Thrust") as IMyThrust;
thruster.ThrustOverridePercentage = 0.5f;  // 0-1 (50% power)
thruster.ThrustOverride = 50000f;          // Direct Newtons
float current = thruster.CurrentThrust;    // Current output
float max = thruster.MaxEffectiveThrust;   // Maximum available
```

### Batteries (IMyBatteryBlock)

```csharp
IMyBatteryBlock battery = GridTerminalSystem.GetBlockWithName("Battery") as IMyBatteryBlock;
float stored = battery.CurrentStoredPower;  // MWh
float capacity = battery.MaxStoredPower;    // MWh
float input = battery.CurrentInput;         // MW
float output = battery.CurrentOutput;       // MW
battery.ChargeMode = ChargeMode.Auto;       // Auto, Recharge, Discharge
```

### Sensors (IMySensorBlock)

```csharp
IMySensorBlock sensor = GridTerminalSystem.GetBlockWithName("Proximity") as IMySensorBlock;
sensor.FrontExtend = 50f;          // Detection range (meters)
sensor.DetectPlayers = true;
sensor.DetectSmallShips = true;
sensor.DetectEnemy = true;

MyDetectedEntityInfo entity = sensor.LastDetectedEntity;
if (!entity.IsEmpty())
    Echo($"Detected: {entity.Name} at {entity.Position}");
```

### Connectors (IMyShipConnector)

```csharp
IMyShipConnector connector = GridTerminalSystem.GetBlockWithName("Dock") as IMyShipConnector;
connector.Connect();
connector.Disconnect();
bool docked = connector.Status == MyShipConnectorStatus.Connected;
```

### Gyroscopes (IMyGyro)

```csharp
IMyGyro gyro = GridTerminalSystem.GetBlockWithName("Gyro") as IMyGyro;
gyro.GyroOverride = true;    // Enable manual control
gyro.Yaw = 1.0f;             // rad/s
gyro.Pitch = 0.5f;
gyro.Roll = 0f;
gyro.GyroPower = 1.0f;       // Power multiplier (0-1)
```

---

## Using Echo and LCD displays for output

### The Echo function

`Echo()` outputs text to the Programmable Block's details panel—essential for debugging:

```csharp
public void Main()
{
    Echo("Script running!");
    Echo($"Instructions: {Runtime.CurrentInstructionCount}");
    Echo($"Runtime: {Runtime.LastRunTimeMs:F3}ms");
}
```

### Writing to LCD panels

LCD blocks implement `IMyTextSurface` directly:

```csharp
IMyTextPanel lcd = GridTerminalSystem.GetBlockWithName("Status LCD") as IMyTextPanel;
lcd.ContentType = ContentType.TEXT_AND_IMAGE;  // Required!
lcd.FontSize = 1.5f;
lcd.FontColor = Color.Green;
lcd.WriteText("Hello World!", false);  // false = overwrite, true = append
```

### Writing to multi-surface blocks

Cockpits, programmable blocks, and other blocks with multiple screens implement `IMyTextSurfaceProvider`:

```csharp
// Access PB's own display
IMyTextSurface pbScreen = Me.GetSurface(0);  // 0 = Large Display, 1 = Keyboard
pbScreen.ContentType = ContentType.TEXT_AND_IMAGE;
pbScreen.WriteText("Running");

// Access cockpit screens
IMyCockpit cockpit = GridTerminalSystem.GetBlockWithName("Cockpit") as IMyCockpit;
IMyTextSurface centerScreen = cockpit.GetSurface(0);
centerScreen.ContentType = ContentType.TEXT_AND_IMAGE;
centerScreen.WriteText("Flight Data");
```

### Universal LCD handler for any screen type

```csharp
IMyTextSurface GetTextSurface(string blockName, int screenIndex = 0)
{
    IMyTerminalBlock block = GridTerminalSystem.GetBlockWithName(blockName);
    
    if (block is IMyTextSurface)
        return (IMyTextSurface)block;
    
    if (block is IMyTextSurfaceProvider)
        return ((IMyTextSurfaceProvider)block).GetSurface(screenIndex);
    
    return Me.GetSurface(0);  // Fallback to PB screen
}
```

---

## Complete working code examples

### Basic: Toggle lights by argument

```csharp
public void Main(string argument)
{
    List<IMyLightingBlock> lights = new List<IMyLightingBlock>();
    GridTerminalSystem.GetBlocksOfType(lights);
    
    foreach (var light in lights)
    {
        switch (argument.ToLower())
        {
            case "on":  light.Enabled = true; break;
            case "off": light.Enabled = false; break;
            default:    light.Enabled = !light.Enabled; break;
        }
    }
    Echo($"Toggled {lights.Count} lights");
}
```

### Intermediate: Ship status display

```csharp
IMyTextSurface display;
List<IMyBatteryBlock> batteries = new List<IMyBatteryBlock>();
List<IMyGasTank> h2Tanks = new List<IMyGasTank>();
StringBuilder sb = new StringBuilder();

public Program()
{
    Runtime.UpdateFrequency = UpdateFrequency.Update100;
    display = Me.GetSurface(0);
    display.ContentType = ContentType.TEXT_AND_IMAGE;
    GridTerminalSystem.GetBlocksOfType(batteries);
    GridTerminalSystem.GetBlocksOfType(h2Tanks);
}

public void Main()
{
    sb.Clear();
    
    // Battery status
    float stored = 0, maxStored = 0;
    foreach (var b in batteries)
    {
        stored += b.CurrentStoredPower;
        maxStored += b.MaxStoredPower;
    }
    float powerPercent = maxStored > 0 ? stored / maxStored : 0;
    sb.AppendLine($"⚡ Power: {powerPercent:P0}");
    sb.AppendLine(Bar(powerPercent, 20));
    
    // Hydrogen status
    float h2Total = 0;
    foreach (var tank in h2Tanks)
        h2Total += (float)tank.FilledRatio;
    float h2Avg = h2Tanks.Count > 0 ? h2Total / h2Tanks.Count : 0;
    sb.AppendLine($"\n🔋 Hydrogen: {h2Avg:P0}");
    sb.AppendLine(Bar(h2Avg, 20));
    
    display.WriteText(sb.ToString());
}

string Bar(float percent, int len)
{
    int filled = (int)(percent * len);
    return "[" + new string('█', filled) + new string('░', len - filled) + "]";
}
```

### Intermediate: Automated airlock

```csharp
IMyDoor innerDoor, outerDoor;
IMyAirVent vent;
string currentState = "idle";

public Program()
{
    Runtime.UpdateFrequency = UpdateFrequency.Update10;
    innerDoor = GridTerminalSystem.GetBlockWithName("Airlock Inner") as IMyDoor;
    outerDoor = GridTerminalSystem.GetBlockWithName("Airlock Outer") as IMyDoor;
    vent = GridTerminalSystem.GetBlockWithName("Airlock Vent") as IMyAirVent;
}

public void Main(string argument)
{
    if (argument == "cycle_out") currentState = "depressurizing";
    if (argument == "cycle_in") currentState = "pressurizing";
    
    float oxygen = vent.GetOxygenLevel();
    
    switch (currentState)
    {
        case "depressurizing":
            innerDoor.CloseDoor();
            vent.Depressurize = true;
            if (oxygen < 0.01f)
            {
                outerDoor.OpenDoor();
                currentState = "idle";
            }
            break;
            
        case "pressurizing":
            outerDoor.CloseDoor();
            vent.Depressurize = false;
            if (oxygen > 0.95f)
            {
                innerDoor.OpenDoor();
                currentState = "idle";
            }
            break;
    }
    
    Echo($"State: {currentState}\nO2: {oxygen:P0}");
}
```

---

## Continuous running and Timer Block integration

### Using Runtime.UpdateFrequency (recommended)

```csharp
public Program()
{
    // Set in constructor - script runs automatically
    Runtime.UpdateFrequency = UpdateFrequency.Update100;  // Every ~1.67 seconds
}
```

**Available frequencies:**
- `UpdateFrequency.None` — Manual run only (default)
- `UpdateFrequency.Once` — Run once next tick, then stop
- `UpdateFrequency.Update1` — Every tick (~16.7ms) — **use sparingly!**
- `UpdateFrequency.Update10` — Every 10 ticks (~167ms)
- `UpdateFrequency.Update100` — Every 100 ticks (~1.67s)

### Checking what triggered execution

```csharp
public void Main(string argument, UpdateType updateSource)
{
    // Handle manual triggers
    if ((updateSource & (UpdateType.Terminal | UpdateType.Trigger)) != 0)
    {
        HandleCommand(argument);
    }
    
    // Handle automatic updates
    if ((updateSource & UpdateType.Update100) != 0)
    {
        UpdateStatus();
    }
}
```

### Using Timer Blocks (alternative method)

Configure a Timer Block to run your Programmable Block's "Run" action repeatedly. This works but `Runtime.UpdateFrequency` is more efficient and doesn't require additional blocks.

---

## Common errors and troubleshooting

### Compilation errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Not allowed type was used` | Using prohibited namespace | Remove System.IO, System.Net, System.Threading |
| `Cannot implicitly convert` | Type mismatch | Add explicit cast: `as IMyDoor` |
| `does not exist in current context` | Undeclared variable | Declare variable before use |

### Runtime errors

**NullReferenceException** — Most common error, caused by accessing a null block:

```csharp
// BAD - crashes if block doesn't exist
IMyDoor door = GridTerminalSystem.GetBlockWithName("Door") as IMyDoor;
door.OpenDoor();  // CRASH!

// GOOD - always check for null
if (door != null)
    door.OpenDoor();
else
    Echo("Door not found - check name spelling!");
```

**Script too complex** — Exceeding 50,000 instructions:

```csharp
// Monitor instruction count
Echo($"Instructions: {Runtime.CurrentInstructionCount}/{Runtime.MaxInstructionCount}");

// Split work across multiple ticks if needed
```

### Block not found debugging

```csharp
// List all blocks of a type to verify names
List<IMyDoor> doors = new List<IMyDoor>();
GridTerminalSystem.GetBlocksOfType(doors);
Echo($"Found {doors.Count} doors:");
foreach (var door in doors)
    Echo($"  '{door.CustomName}'");
```

---

## Best practices and optimization tips

### Initialize blocks once in Program()

```csharp
// GOOD - fetch once, reuse throughout
List<IMyThrust> thrusters = new List<IMyThrust>();

public Program()
{
    GridTerminalSystem.GetBlocksOfType(thrusters);
}

public void Main()
{
    // Use cached thrusters list
}
```

### Reuse collections instead of allocating

```csharp
// BAD - allocates new list every run
public void Main()
{
    List<IMyDoor> doors = new List<IMyDoor>();  // Memory allocation!
    GridTerminalSystem.GetBlocksOfType(doors);
}

// GOOD - reuse existing list
List<IMyDoor> doors = new List<IMyDoor>();
public void Main()
{
    doors.Clear();
    GridTerminalSystem.GetBlocksOfType(doors);
}
```

### Use direct properties instead of terminal actions

```csharp
// FASTER - direct property access
light.Enabled = true;
door.OpenDoor();
piston.Velocity = 1.0f;

// SLOWER - terminal action lookup
light.ApplyAction("OnOff_On");
```

### Use StringBuilder for text construction

```csharp
StringBuilder sb = new StringBuilder();  // Allocate once

public void Main()
{
    sb.Clear();
    sb.AppendLine("Line 1");
    sb.AppendLine("Line 2");
    display.WriteText(sb.ToString());
}
```

### Spread heavy work across multiple ticks

```csharp
int workPhase = 0;

public void Main()
{
    switch (workPhase)
    {
        case 0: ProcessBatteries(); break;
        case 1: ProcessCargo(); break;
        case 2: UpdateDisplay(); break;
    }
    workPhase = (workPhase + 1) % 3;
}
```

### Use Update100 unless faster updates are essential

Most automation works perfectly at **Update100** (~1.67 second intervals). Reserve **Update10** for responsive controls and **Update1** only for time-critical operations like flight controllers.

---

## Conclusion

Space Engineers scripting opens enormous possibilities for automation, from simple quality-of-life improvements to sophisticated autonomous systems. The key concepts to master are: understanding the **Program/Save/Main lifecycle**, efficiently using **GridTerminalSystem** to find blocks, knowing the **interface properties** for each block type, and following **performance best practices** to avoid impacting server performance.

For continued learning, explore the official wiki at **spaceengineers.wiki.gg/wiki/Scripting**, browse community scripts on the Steam Workshop (filter by "Type: IngameScript"), and join the **#programmable-block** channel on Keen's Discord server where experienced scripters help newcomers daily. The MDK2 project at **github.com/malforge/mdk2** provides excellent tooling and its wiki contains advanced tutorials for scripters ready to go deeper.
