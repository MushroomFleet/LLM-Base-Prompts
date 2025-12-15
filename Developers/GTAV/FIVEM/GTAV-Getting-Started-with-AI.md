# Getting Started with GTAV/FiveM Modding Using AI Assistance

**A Guide by ScuffedEpoch.com (OragenAI.com)**

Welcome to the world of GTAV modding! This guide will walk you through everything you need to know to set up a complete development environment for FiveM modding, with a focus on leveraging modern AI coding assistants (Google Gemini, Anthropic Claude, and OpenAI ChatGPT) to accelerate your learning and development process.

This guide is designed to eliminate barriers to entry for prospective mod developers and developers in training seeking a sandbox to experiment in.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Core Installation Steps](#core-installation-steps)
3. [Development Environment Setup](#development-environment-setup)
4. [AI Coding Assistant Integration](#ai-coding-assistant-integration)
5. [Setting Up Your First FiveM Resource](#setting-up-your-first-fivem-resource)
6. [Essential Tools & Utilities](#essential-tools--utilities)
7. [Recommended Folder Structure](#recommended-folder-structure)
8. [Next Steps & Learning Resources](#next-steps--learning-resources)

---

## Prerequisites

Before you begin, ensure you have:

- **Windows 10/11** (64-bit) - FiveM development is primarily Windows-based
- **At least 8GB RAM** (16GB recommended for smooth development)
- **100GB+ free disk space** (for GTAV, tools, and development files)
- **A legitimate copy of GTAV** - required for FiveM
- **Basic understanding of programming concepts** (helpful but not required)
- **Administrator access** on your PC

---

## Core Installation Steps

### Step 1: Install Grand Theft Auto V

**Important:** You only need the base, non-enhanced version of GTAV. The cheapest version available will work perfectly.

1. **Purchase GTAV** from one of these platforms:
   - **Steam** (most common for modding)
   - **Epic Games Store**
   - **Rockstar Games Launcher**

2. **Install the game** to your preferred location:
   - Default: `C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto V`
   - Note your installation path - you'll need it later

3. **Launch GTAV at least once** through the official launcher:
   - Complete the initial setup
   - Get past the calibration screen
   - This ensures all game files are properly initialized

4. **Verify your installation**:
   - Ensure `GTA5.exe` exists in your GTAV directory
   - Total installation size should be approximately 95-110GB

---

### Step 2: Install FiveM

FiveM is the multiplayer modification framework we'll be using for all development.

1. **Download FiveM**:
   - Visit [https://fivem.net/](https://fivem.net/)
   - Click "Download Client"
   - Save `FiveM.exe` to a temporary location

2. **Run the installer**:
   - Double-click `FiveM.exe`
   - Choose installation location (default: `%localappdata%\FiveM`)
   - Wait for the initial download and installation to complete

3. **First launch**:
   - FiveM will automatically detect your GTAV installation
   - If prompted, manually point it to your GTAV directory
   - Allow FiveM to download required files (this may take 10-30 minutes)

4. **Create a FiveM account** (optional but recommended):
   - Sign up at [https://forum.cfx.re/](https://forum.cfx.re/)
   - This allows you to host servers and access community resources

5. **Verify installation**:
   - FiveM should launch without errors
   - You should see the server browser

---

### Step 3: Install OpenIV

OpenIV is essential for extracting, viewing, and repacking GTAV game files.

1. **Download OpenIV**:
   - Visit [http://openiv.com/](http://openiv.com/)
   - Click "Download OpenIV"
   - Choose the latest stable version

2. **Install OpenIV**:
   - Run the installer
   - Accept the license agreement
   - Choose installation directory (default is fine)

3. **Initial setup**:
   - Launch OpenIV
   - Select "Grand Theft Auto V" when prompted
   - Choose "Windows" as your platform
   - Point OpenIV to your GTAV installation directory

4. **Enable Edit Mode**:
   - Click the "Edit mode" button in the top right
   - Read and accept the warning about modding
   - Install the ASI Loader and OpenIV.ASI when prompted

5. **Important notes**:
   - OpenIV lets you browse `.rpf` archives (GTAV's package format)
   - You can extract models, textures, scripts, and game data
   - Always work with **copies** of game files, never modify originals directly

---

### Step 4: Install CodeWalker

CodeWalker is a powerful tool for viewing and editing GTAV's world data, models, and scripts.

1. **Download CodeWalker**:
   - Visit [https://www.gta5-mods.com/tools/codewalker-gtav-interactive-3d-map](https://www.gta5-mods.com/tools/codewalker-gtav-interactive-3d-map)
   - Or search for "CodeWalker" on GTA5-Mods.com
   - Download the latest version

2. **Extract CodeWalker**:
   - Create a folder: `C:\Tools\CodeWalker`
   - Extract all files from the ZIP archive
   - No installation required - it's portable

3. **Initial configuration**:
   - Launch `CodeWalker.exe`
   - Go to `Tools` → `Options`
   - Set your GTAV folder path
   - Click "Initialize" to scan game files (this takes 5-15 minutes)

4. **Key features**:
   - **3D world viewer** - explore the entire GTAV map
   - **Model viewer** - view `.ydr`, `.yft`, `.ydd` files
   - **Script viewer** - examine `.ysc` compiled scripts
   - **Map editor** - create custom maps and placements
   - **Vehicle/Ped editor** - modify vehicle and character data

---

## Development Environment Setup

### Step 5: Install Visual Studio Community Edition

While VSCode is popular, we recommend Visual Studio Community for its superior debugging capabilities and C# support (useful for FiveM server-side scripting).

1. **Download Visual Studio**:
   - Visit [https://visualstudio.microsoft.com/vs/community/](https://visualstudio.microsoft.com/vs/community/)
   - Click "Download Visual Studio Community 2022"

2. **Run the installer**:
   - Launch `vs_community.exe`
   - Select workloads:
     - ✅ **.NET desktop development** (for C# server scripts)
     - ✅ **Desktop development with C++** (optional, for advanced scripting)
     - ✅ **Game development with C++** (optional, for performance-critical mods)

3. **Install individual components**:
   - Go to "Individual components" tab
   - Select:
     - `.NET 6.0 Runtime` and `.NET 8.0 Runtime`
     - `C++ CMake tools for Windows`
     - `Git for Windows`

4. **Complete installation**:
   - Click "Install" (this may take 30-60 minutes)
   - Restart your PC when prompted

5. **Configure Visual Studio**:
   - Launch Visual Studio
   - Sign in with a Microsoft account (free)
   - Choose your theme preference
   - Set up your default settings

### Step 6: Install Node.js and Additional Tools

Many FiveM resources use JavaScript/Lua, and build tools require Node.js.

1. **Install Node.js**:
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS version (Long Term Support)
   - Run installer with default settings
   - Verify installation: Open Command Prompt and type:
     ```bash
     node --version
     npm --version
     ```

2. **Install Git**:
   - Visit [https://git-scm.com/](https://git-scm.com/)
   - Download and install with default settings
   - This enables version control for your projects

3. **Install a Lua Language Server** (optional but recommended):
   - Open Visual Studio
   - Go to `Extensions` → `Manage Extensions`
   - Search for "Lua" and install a Lua language support extension
   - Restart Visual Studio

---

### Step 7: Set Up Your FiveM Development Server

To test your mods, you'll need a local FiveM server.

1. **Download FiveM Server Files**:
   - Visit [https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/)
   - Download the latest recommended build
   - Extract to a dedicated folder: `C:\FiveM-Server\`

2. **Create server configuration**:
   - Navigate to your server folder
   - Create a file named `server.cfg`
   - Add basic configuration:
     ```bash
     # Basic Server Configuration
     endpoint_add_tcp "0.0.0.0:30120"
     endpoint_add_udp "0.0.0.0:30120"
     
     # Server name
     sv_hostname "My Development Server"
     
     # Loading screen
     load_screen_manual_switch 'yes'
     
     # Maximum players
     sv_maxclients 32
     
     # License key (get from https://keymaster.fivem.net)
     sv_licenseKey "YOUR_LICENSE_KEY_HERE"
     
     # Resources to start
     ensure mapmanager
     ensure chat
     ensure spawnmanager
     ensure sessionmanager
     ensure basic-gamemode
     ensure hardcap
     
     # Add your custom resources here
     # ensure your-resource-name
     ```

3. **Get a license key**:
   - Visit [https://keymaster.fivem.net/](https://keymaster.fivem.net/)
   - Log in with your FiveM account
   - Generate a new key
   - Copy it into your `server.cfg`

4. **Start your server**:
   - Double-click `FXServer.exe` in your server folder
   - Wait for "Server started" message
   - Connect via FiveM client: `localhost:30120`

---

## AI Coding Assistant Integration

One of the most powerful aspects of modern development is leveraging AI assistants. Here's how to integrate them into your FiveM development workflow:

### Using AI Assistants Effectively

**Anthropic Claude (claude.ai)**
- **Best for**: Complex architecture decisions, debugging, code review
- **Strengths**: Deep reasoning, explaining complex systems, reviewing large codebases
- **FiveM use cases**: 
  - Designing resource architecture
  - Debugging native function calls
  - Explaining FiveM framework internals
  - Converting code between Lua and JavaScript

**OpenAI ChatGPT (chat.openai.com)**
- **Best for**: Quick code generation, boilerplate, common patterns
- **Strengths**: Fast responses, broad knowledge of popular libraries
- **FiveM use cases**:
  - Generating basic resource templates
  - Writing UI code (HTML/CSS/JS for NUI)
  - Quick Lua/JS snippet generation

**Google Gemini (gemini.google.com)**
- **Best for**: Research, documentation, multi-modal tasks
- **Strengths**: Searching documentation, explaining concepts, analyzing images
- **FiveM use cases**:
  - Finding FiveM native functions
  - Understanding game mechanics
  - Analyzing in-game screenshots for debugging

### Best Practices for AI-Assisted FiveM Development

1. **Provide context**:
   ```
   I'm developing a FiveM resource that needs to [describe goal].
   I'm using [Lua/JavaScript] [client/server]-side scripting.
   Here's my current code: [paste code]
   ```

2. **Ask specific questions**:
   - ❌ "How do I make a car spawn?"
   - ✅ "How do I spawn a vehicle with model hash `adder` at coordinates x: 0, y: 0, z: 72 using FiveM natives?"

3. **Request explanations, not just code**:
   - Ask "Can you explain what this native function does and show an example?"
   - This helps you learn instead of just copy-pasting

4. **Iterate and refine**:
   - Show AI assistants error messages
   - Ask for optimization suggestions
   - Request alternative approaches

5. **Verify with documentation**:
   - Always check [https://docs.fivem.net/natives/](https://docs.fivem.net/natives/)
   - Cross-reference AI suggestions with official docs

### Setting Up AI Assistant Integration in Visual Studio

1. **Install GitHub Copilot** (optional, paid):
   - Extensions → Manage Extensions
   - Search "GitHub Copilot"
   - Install and sign in

2. **Use inline AI chat**:
   - Many IDEs now have built-in AI chat
   - Keep a browser tab with Claude/ChatGPT open
   - Use AI to explain confusing code sections

---

## Setting Up Your First FiveM Resource

Let's create a simple "Hello World" resource to test your setup.

### Step 1: Create Resource Folder

1. Navigate to: `C:\FiveM-Server\resources\`
2. Create a new folder: `my-first-resource`

### Step 2: Create `fxmanifest.lua`

Every FiveM resource needs this manifest file:

```lua
fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'My First FiveM Resource'
version '1.0.0'

-- Client scripts (run on player's game)
client_scripts {
    'client.lua'
}

-- Server scripts (run on server)
server_scripts {
    'server.lua'
}
```

### Step 3: Create `client.lua`

```lua
-- This runs on the player's client
print("^2[CLIENT] My First Resource Loaded!^0")

-- Register a command
RegisterCommand('hello', function()
    print("^3Hello from client!^0")
    
    -- Show notification in-game
    SetNotificationTextEntry('STRING')
    AddTextComponentString('Hello World from FiveM!')
    DrawNotification(false, true)
end, false)

-- Create a thread that runs continuously
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(5000) -- Wait 5 seconds
        print("^5Client thread running...^0")
    end
end)
```

### Step 4: Create `server.lua`

```lua
-- This runs on the server
print("^2[SERVER] My First Resource Loaded!^0")

-- Register a server command
RegisterCommand('servertest', function(source, args, rawCommand)
    print("^3Server command executed by player " .. source .. "^0")
    
    -- Send message to player
    TriggerClientEvent('chat:addMessage', source, {
        args = {'Server', 'Hello from the server!'}
    })
end, false)

-- Listen for when players join
AddEventHandler('playerConnecting', function(playerName)
    print("^6Player connecting: " .. playerName .. "^0")
end)
```

### Step 5: Start Your Resource

1. Open `server.cfg`
2. Add at the bottom:
   ```bash
   ensure my-first-resource
   ```
3. Restart your FiveM server
4. Connect via FiveM client
5. Open F8 console and type `/hello`

---

## Essential Tools & Utilities

### Recommended Additional Tools

1. **FiveM Resource Manager**:
   - [txAdmin](https://github.com/tabarra/txAdmin) - Web-based server management
   - Install: Download from GitHub and follow instructions

2. **Lua Development Tools**:
   - [LuaLS](https://github.com/LuaLS/lua-language-server) - Language server for better Lua support
   - [Luacheck](https://github.com/mpeterv/luacheck) - Lua linter

3. **Database Management** (for advanced resources):
   - [HeidiSQL](https://www.heidisql.com/) - MySQL/MariaDB management
   - [DBeaver](https://dbeaver.io/) - Universal database tool

4. **3D Modeling** (for custom assets):
   - [Blender](https://www.blender.org/) - Free 3D modeling software
   - [3ds Max](https://www.autodesk.com/products/3ds-max/) - Professional (paid) option

5. **Texture Editing**:
   - [GIMP](https://www.gimp.org/) - Free image editor
   - [Photoshop](https://www.adobe.com/products/photoshop.html) - Professional (paid) option

6. **Version Control**:
   - [GitHub Desktop](https://desktop.github.com/) - Easy Git interface
   - Create repositories for your resources

---

## Recommended Folder Structure

Organize your development workspace for maximum efficiency:

```
C:\FiveM-Development\
│
├── Server\                          # Your FiveM server
│   ├── resources\
│   │   ├── [my-resources]\         # Your custom resources
│   │   └── [downloaded-resources]\ # Community resources
│   ├── server.cfg
│   └── FXServer.exe
│
├── Projects\                        # Development workspace
│   ├── my-first-resource\
│   ├── vehicle-shop\
│   └── custom-hud\
│
├── Tools\
│   ├── CodeWalker\
│   ├── OpenIV\
│   └── Other-Tools\
│
├── Assets\                          # Extracted game files
│   ├── vehicles\
│   ├── peds\
│   ├── maps\
│   └── props\
│
└── Documentation\                   # Your notes and references
    ├── natives-reference.txt
    ├── ai-prompts.md
    └── learning-resources.md
```

---

## Next Steps & Learning Resources

### Official Documentation

- **FiveM Docs**: [https://docs.fivem.net/](https://docs.fivem.net/)
- **Native Reference**: [https://docs.fivem.net/natives/](https://docs.fivem.net/natives/)
- **Cookbook**: [https://cookbook.fivem.net/](https://cookbook.fivem.net/)

### Community Resources

- **FiveM Forums**: [https://forum.cfx.re/](https://forum.cfx.re/)
- **FiveM Discord**: [https://discord.gg/fivem](https://discord.gg/fivem)
- **GTA5-Mods**: [https://www.gta5-mods.com/](https://www.gta5-mods.com/)

### Learning Path Suggestions

1. **Week 1-2**: Environment setup, basic Lua/JavaScript
2. **Week 3-4**: Understanding FiveM natives and events
3. **Week 5-6**: Creating simple resources (commands, notifications)
4. **Week 7-8**: Working with UI (NUI/HTML/CSS/JS)
5. **Month 3+**: Advanced topics (networking, database, optimization)

### AI-Assisted Learning Tips

- **Daily practice**: Ask AI assistants to explain one new native function per day
- **Code review**: Share your code with AI for optimization suggestions
- **Debugging**: When stuck, explain the problem to AI - often helps you spot the issue
- **Pattern recognition**: Ask AI to show you common FiveM design patterns

---

## Troubleshooting Common Issues

### FiveM Won't Start

- Verify GTAV launched successfully at least once
- Check antivirus isn't blocking FiveM
- Run FiveM as administrator

### Server Won't Start

- Verify license key in `server.cfg`
- Check for syntax errors in config files
- Ensure port 30120 isn't already in use

### Resource Not Loading

- Check `fxmanifest.lua` syntax
- Verify resource is in `resources\` folder
- Ensure `ensure resource-name` in `server.cfg`
- Check F8 console for error messages

### OpenIV/CodeWalker Issues

- Run as administrator
- Verify GTAV path is correctly set
- Reinstall if files become corrupted

---

## Final Notes

Welcome to the FiveM modding community! Remember:

- **Start small** - Don't try to build a roleplay server on day one
- **Ask questions** - The community is generally helpful
- **Use AI assistants** - They're incredible learning tools
- **Document your work** - Future you will thank present you
- **Have fun** - Modding is about creativity and experimentation

For more guides, resources, and community support, visit **ScuffedEpoch.com** (powered by OragenAI.com).

Happy modding! 🚗💨

---

*This guide is maintained by the ScuffedEpoch.com community. Last updated: December 2025*
