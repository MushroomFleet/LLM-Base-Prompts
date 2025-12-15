# Source Engine FPS Development - Getting Started Guide

## Overview

This guide will walk you through setting up a complete development environment for creating a custom FPS game using Valve's Source Engine. The Source Engine is a powerful game engine that has been used to create games like Half-Life 2, Counter-Strike: Source, Team Fortress 2, and Portal.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Choosing Your Source Engine Version](#choosing-your-source-engine-version)
3. [Required Software](#required-software)
4. [Obtaining Source Engine SDK](#obtaining-source-engine-sdk)
5. [Setting Up Your Development Environment](#setting-up-your-development-environment)
6. [Project Structure](#project-structure)
7. [Building Your First Mod](#building-your-first-mod)
8. [Next Steps](#next-steps)

## Prerequisites

Before you begin, you should have:

- **Programming Knowledge**: Familiarity with C++ is essential, as Source Engine uses C++ for game code
- **3D Concepts**: Basic understanding of 3D math (vectors, matrices, quaternions)
- **Game Development Basics**: Understanding of game loops, entity systems, and event-driven programming
- **Windows OS**: Source Engine development is primarily Windows-based (Windows 10 or 11 recommended)
- **Disk Space**: At least 50GB of free space for SDK, tools, and build files
- **RAM**: Minimum 8GB, 16GB recommended
- **Steam Account**: Required to access Source SDK and related tools

## Choosing Your Source Engine Version

There are several branches of Source Engine available:

### Source SDK Base 2013 (Recommended for Beginners)

- Most recent open-source version
- Available on GitHub
- Best documentation and community support
- Used for single-player and multiplayer games
- Includes Source SDK Base 2013 Singleplayer and Multiplayer branches

### Source SDK 2007

- Older version based on Episode One engine
- Good for learning but outdated
- Less recommended for new projects

### Source 2

- Valve's newer engine
- Currently limited SDK access
- Primarily for Dota 2, Half-Life: Alyx, Counter-Strike 2
- Not recommended for independent developers yet

**For this guide, we'll focus on Source SDK Base 2013.**

## Required Software

### 1. Visual Studio

**Visual Studio 2013** or **Visual Studio 2022** (Community Edition is free)

- Download from: https://visualstudio.microsoft.com/
- Required components:
  - Desktop development with C++
  - Windows SDK
  - C++ MFC for latest build tools (optional but helpful)

### 2. Steam and Source SDK

- Install Steam client
- Source SDK Base 2013 (both single-player and multiplayer)
- At least one Source game for testing (Half-Life 2, Team Fortress 2, etc.)

### 3. Git

- Download from: https://git-scm.com/
- Required for cloning the Source SDK repository

### 4. Additional Recommended Tools

- **Text Editor**: Visual Studio Code, Notepad++, or Sublime Text for quick edits
- **3D Modeling Software**: Blender (free) for creating custom models
- **Image Editor**: GIMP (free) or Photoshop for textures
- **VTFEdit**: For creating Valve Texture Format files
- **GCFScape**: For extracting game assets from Valve's VPK/GCF files

## Obtaining Source Engine SDK

### Method 1: GitHub Repository (Recommended)

1. Open command prompt or Git Bash
2. Navigate to your desired directory:
   ```bash
   cd C:\Development
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/ValveSoftware/source-sdk-2013.git
   ```

4. This will create a `source-sdk-2013` folder with both MP (multiplayer) and SP (singleplayer) directories

### Method 2: Steam Tools

1. Open Steam Library
2. Click on "Tools" in the left sidebar
3. Find "Source SDK Base 2013 Singleplayer" and "Source SDK Base 2013 Multiplayer"
4. Install both

Note: The GitHub method is preferred as it gives you the full source code.

## Setting Up Your Development Environment

### Step 1: Create Your Project Directory

```
C:\SourceEngine\
├── source-sdk-2013\     (Cloned repository)
├── MyFPSGame\           (Your game project)
└── tools\               (Additional tools)
```

### Step 2: Prepare the Source Code

1. Navigate to `source-sdk-2013\mp\src` (for multiplayer) or `sp\src` (for singleplayer)
2. Make a copy of the entire `src` folder and rename it to your project name (e.g., `MyFPSGame_src`)
3. This gives you a clean starting point while preserving the original SDK

### Step 3: Generate Visual Studio Solution

1. Navigate to your game's `src` folder
2. Find `createallprojects.bat`
3. Run this batch file - it will generate `.vcproj` or `.sln` files for Visual Studio

Alternatively, you can create project files for specific Visual Studio versions:

```bash
# For Visual Studio 2013
devtools\bin\vpc.exe /2013

# For Visual Studio 2022
devtools\bin\vpc.exe /2022
```

### Step 4: Open the Solution

1. Navigate to `src` folder
2. Open `games.sln` in Visual Studio
3. You should see multiple projects including:
   - Client DLL
   - Server DLL
   - Game UI
   - Various tool projects

### Step 5: Configure Build Settings

1. In Visual Studio, select your build configuration:
   - **Debug**: For development with full debugging symbols (slower)
   - **Release**: Optimized build for distribution (faster)

2. Set the solution platform to **Win32** or **x86** (Source SDK 2013 is 32-bit)

### Step 6: Initial Build

1. Right-click on the solution in Solution Explorer
2. Select "Build Solution" (Ctrl+Shift+B)
3. First build will take 10-30 minutes depending on your system
4. Watch for errors in the Output window

Common build issues:
- Missing SDK paths: Update Windows SDK version in project properties
- Missing DirectX SDK: May need to install DirectX SDK (June 2010)
- Path too long errors: Move project closer to drive root

## Project Structure

Understanding the Source SDK structure:

```
src\
├── game\
│   ├── client\          # Client-side code (rendering, UI, prediction)
│   ├── server\          # Server-side code (game logic, AI, physics)
│   └── shared\          # Code shared between client and server
├── public\              # Public headers and interfaces
├── lib\                 # Compiled libraries
├── devtools\            # Build tools (VPC)
├── utils\               # Utility programs (VBSP, VVIS, VRAD)
└── game\
    └── mod_*\           # Game content directory
        ├── bin\         # Compiled DLLs go here
        ├── maps\        # BSP map files
        ├── materials\   # Textures and shaders
        ├── models\      # 3D models
        ├── scripts\     # Game configuration
        └── sound\       # Audio files
```

## Building Your First Mod

### Step 1: Customize Game Info

1. Navigate to `game\mod_hl2mp\` (or your mod folder)
2. Edit `gameinfo.txt`:
   ```
   "GameInfo"
   {
       game    "My FPS Game"
       title   "MyFPSGame"
       type    multiplayer_only
       // ... other settings
   }
   ```

### Step 2: Create a Simple Weapon Modification

As a first task, let's modify an existing weapon:

1. Open `game\server\hl2mp\weapon_pistol.cpp`
2. Find the damage values and increase them
3. Rebuild the solution
4. The compiled DLLs will appear in `game\mod_hl2mp\bin\`

### Step 3: Launch Your Mod

1. Copy your compiled `client.dll` and `server.dll` to the game's bin folder
2. Create a shortcut to `hl2.exe` with launch parameters:
   ```
   hl2.exe -game "C:\Path\To\Your\Mod" -dev -console
   ```
3. Launch and test your changes

### Step 4: Create a Test Map

1. Open Hammer Editor (included with Source SDK)
2. Create a simple room with player spawns
3. Compile the map (File > Run Map)
4. Test your weapon modifications

## Next Steps

Now that you have your development environment set up, here are recommended next steps:

### Learning Resources

1. **Valve Developer Community Wiki**: https://developer.valvesoftware.com/
2. **Source SDK Documentation**: Read through the included documentation
3. **Community Forums**: 
   - Facepunch Forums
   - MapCore community
   - r/SourceEngine subreddit

### Practice Projects

1. **Weapon Modifications**: Adjust damage, fire rate, reload times
2. **New Weapon Creation**: Create a new weapon based on existing code
3. **Custom Game Modes**: Modify game rules for unique gameplay
4. **Map Creation**: Learn Hammer Editor and level design
5. **Custom Models**: Import simple models and test them in-game

### Advanced Topics to Explore

- **Networking**: Understanding client-server architecture
- **Physics**: Working with VPhysics system
- **AI**: Modifying NPC behavior
- **Shaders**: Creating custom visual effects
- **Optimization**: Profiling and improving performance
- **Animation**: Creating and implementing custom animations

### Best Practices

1. **Version Control**: Use Git to track your changes
2. **Code Comments**: Document your modifications thoroughly
3. **Regular Backups**: Keep backups of working builds
4. **Test Frequently**: Build and test often to catch issues early
5. **Community Engagement**: Share progress and ask questions

## Troubleshooting Common Issues

### Build Errors

**Error**: Cannot open include file 'windows.h'
- **Solution**: Install Windows SDK through Visual Studio Installer

**Error**: Project is out of date
- **Solution**: Clean solution and rebuild (Build > Clean Solution)

### Runtime Errors

**Error**: Failed to load client.dll
- **Solution**: Ensure DLL is in correct bin folder and matches game version

**Error**: Missing map
- **Solution**: Compile maps using Hammer Editor or copy from base game

### Performance Issues

- Use Release builds for better performance
- Profile using built-in Source Engine profiling tools
- Check console for performance warnings

## Conclusion

You now have a complete Source Engine FPS development environment! The Source Engine is powerful but has a learning curve. Start with small modifications, gradually increase complexity, and don't hesitate to use the extensive community resources available.

Remember: every successful Source mod started with someone following a guide just like this one. Happy developing!

## Additional Resources

- **Valve Developer Wiki**: https://developer.valvesoftware.com/
- **Source SDK GitHub**: https://github.com/ValveSoftware/source-sdk-2013
- **Hammer Editor Tutorials**: https://developer.valvesoftware.com/wiki/Hammer
- **VDC Programming**: https://developer.valvesoftware.com/wiki/Category:Programming
- **Source Engine Discord Communities**: Search for Source Engine development servers

---

*Last Updated: December 2025*
*For Source SDK Base 2013*
