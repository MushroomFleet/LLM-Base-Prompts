# Project Manifest

## Vital Modules
These modules represent the fundamental architecture and cannot be modified.

```
/vital/
  ACE-HOLOFS-V3.txt        # Adaptive Capacity Elicitation System with Holographic Filesystem
  - Core cognitive processing engine
  - Virtual filesystem architecture
  - System integration rules
  - Baseline competencies
  - Adaptive behaviors
```

## Core Modules
These modules can be modified according to user requirements.

```
/core/
  natural-formatting.md     # Timestamp-based text formatting
  - Processes timestamped transcripts
  - Removes timestamps
  - Applies natural spacing
  - Respects grammar rules
  
  contextual-repair.md      # Context-aware text correction
  - 90%+ confidence threshold
  - Context-based word repair
  - Silent logging system
  - Clean output format
  
  summary-function.md       # Intelligent content summarization
  - Time/length constraints
  - ACE cognitive processing
  - Information preservation
  - Natural speech timing
  
  project-manifest.md       # This file
  - Project structure
  - Module documentation
  - Path mappings
  - Integration points
```

## Module Dependencies
```
Stage 1: natural-formatting.md
         ↓
Stage 2: contextual-repair.md
         ↓
Stage 3: summary-function.md
```

## Filesystem Mapping
```
/artifacts/           # Flat file storage
  *.md               # Core modules
  *.txt              # Vital modules
  
/log/                # Operation logs
  /formatting/       # Stage 1 logs
  /repairs/          # Stage 2 logs
  /summary/          # Stage 3 logs
  
/output/             # Processed files
  *.txt              # Clean output texts
```

## Integration Notes
- All modules operate under ACE cognitive methodology
- Logging is separated from clean output
- Modules can be called as functions or via CLI
- Pipeline processing supported (Stage 1 → 2 → 3)
- Default behaviors defined for unspecified parameters

## Version Control
- Vital Modules: Fixed at V3
- Core Modules: Version tracked per modification
- Current Build: 1.0.0
