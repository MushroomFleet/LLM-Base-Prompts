# VIDEO_PROMPTGEN_PROJECT_MANIFEST V1.0

## Project Structure Map
```yaml
project_root: /video_promptgen/
manifest_version: "1.0.0"
last_updated: "2024-11-23"

core_systems:
  ace_holofs:
    system_definition: "ACEHOLOFS-V3.txt"
    location: /system/core/
    dependencies: []
    initialization_priority: 1

configuration_files:
  system_config:
    - file: "video-prompt-system.md"
      location: /config/system/
      dependencies: ["ACEHOLOFS-V3.txt"]
      initialization_priority: 2
      
  project_config:
    - file: "project-instructions.md"
      location: /config/project/
      dependencies: ["video-prompt-system.md"]
      initialization_priority: 3

  templates:
    - file: "LTXV-video-full-examples.txt"
      location: /templates/master/
      dependencies: ["video-prompt-system.md"]
      initialization_priority: 4

working_directories:
  prompts:
    path: /video_prompts/
    subdirectories:
      - templates/
      - generated/validated/
      - generated/pending_review/
      - templates/variations/
      - templates/examples/
    
  metrics:
    path: /metrics/
    subdirectories:
      - token_counts/
      - density_logs/
      - distribution_analysis/
    
  ace_tracking:
    path: /ace_tracking/
    subdirectories:
      - capability_logs/
      - comprehension_data/
      - clarification_cycles/
    
  system_state:
    path: /system_state/
    subdirectories:
      - current_session/
      - performance_metrics/

initialization_sequence:
  1. system_bootstrap:
     - mount_holofs:
         command: "holofs --mount /video_promptgen"
         verify: "directory_structure"
     - load_ace:
         command: "ace --initialize --config ACEHOLOFS-V3.txt"
         verify: "system_response"

  2. config_loading:
     - load_system:
         command: "holofs --load /config/system/video-prompt-system.md"
         verify: "configuration_state"
     - load_project:
         command: "holofs --load /config/project/project-instructions.md"
         verify: "project_state"

  3. template_setup:
     - load_templates:
         command: "holofs --load /templates/master/LTXV-video-full-examples.txt"
         verify: "template_availability"

  4. directory_verification:
     - verify_structure:
         command: "holofs --verify-structure"
         repair: "auto_create_missing"

session_management:
  state_tracking:
    current_session:
      file: "session_state.json"
      location: "/system_state/current_session/"
      auto_backup: true
    
    persistence:
      file: "persistence_log.json"
      location: "/system_state/performance_metrics/"
      update_frequency: "on_change"

restoration_protocol:
  on_new_conversation:
    1. load_manifest:
       command: "holofs --load-manifest project-manifest.md"
    2. verify_structure:
       command: "holofs --verify-all"
    3. restore_state:
       command: "holofs --restore-latest-session"
    4. initialize_systems:
       command: "ace --reinitialize --load-state"

version_control:
  tracking:
    - generated_prompts
    - performance_metrics
    - system_states
  
  backup:
    frequency: "on_session_end"
    location: "/system_state/backups/"
    retention: "last_5_sessions"

system_flags:
  required:
    - HOLOFS_MOUNTED
    - ACE_INITIALIZED
    - CONFIG_LOADED
    - TEMPLATES_AVAILABLE
  
  optional:
    - METRICS_TRACKING
    - PERFORMANCE_LOGGING
    - STATE_PERSISTENCE

error_handling:
  on_mount_failure:
    - attempt_repair: true
    - max_retries: 3
    - fallback: "initialize_new_filesystem"
  
  on_state_corruption:
    - attempt_recovery: true
    - restore_point: "last_valid_state"
    - fallback: "reinitialize_clean"
```

## Functionality Notes

1. **State Persistence**:
   - Maintains system state between conversations
   - Automatically restores last valid configuration
   - Preserves generated prompts and metrics

2. **Version Control**:
   - Tracks changes to system configuration
   - Maintains history of generated prompts
   - Enables rollback to previous states

3. **Error Recovery**:
   - Automatic repair of filesystem structure
   - State recovery from corruption
   - Graceful degradation on failure

4. **System Verification**:
   - Checks file integrity on load
   - Validates directory structure
   - Ensures system consistency

## Usage Instructions

1. **New Conversation Initialization**:
   ```bash
   holofs --load-manifest project-manifest.md
   holofs --verify-all
   ace --reinitialize --load-state
   ```

2. **State Verification**:
   ```bash
   holofs --verify-structure
   holofs --check-integrity
   ```

3. **System Recovery**:
   ```bash
   holofs --repair-structure
   holofs --restore-latest-valid
   ```
