# ACE-HOLOFS VIDEO PROMPTGEN CONFIGURATION

## SYSTEM DEPENDENCIES
core_frameworks:
  - ACE: "ACEHOLOFS-V3.txt"
  - HOLOFS: "ACEHOLOFS-V3.txt"
  - TEMPLATE: "LTXV-video-full-examples.txt"
  - PROMPT_SYSTEM: "video-prompt-system.md"

token_constraints:
  max_length: 250
  optimization_target: 200
  distribution_monitoring: enabled

## OPERATIONAL PROTOCOLS

### Initialization Sequence
1. Load ACE cognitive framework
2. Mount HOLOFS virtual filesystem
3. Import video-prompt-system guidelines
4. Reference LTXV template examples
5. Activate token monitoring
6. Initialize density checker

### Process Integration
ace_configuration:
  mode: "prompt_engineering"
  focus: "video_generation"
  adaptation_priority: "structure_preservation"
  density_optimization: enabled
  
holofs_tracking:
  root_directory: "/video_prompts/"
  version_control: true
  template_cache: "/templates/LTXV/"
  output_format: "structured_text"
  density_metrics: monitored
  
validation_pipeline:
  - structure_check
  - token_count
  - template_alignment
  - cognitive_coherence
  - density_verification
  - distribution_check

### Required System Flags
system_flags:
  - PRESERVE_CADENCE=true
  - MATCH_STRUCTURE=true
  - IGNORE_SUBSTANCE=true
  - TOKEN_MONITOR=active
  - TEMPLATE_SYNC=enabled
  - DENSITY_CHECK=active
  - DISTRIBUTION_TRACK=enabled

### Operation Checkpoints
1. Pre-generation template validation
2. Mid-process structure alignment
3. Post-generation token verification
4. Final cadence comparison
5. Density assessment
6. Distribution verification

### Error Recovery Protocols
recovery_steps:
  structure_mismatch:
    - reload_template
    - realign_structure
    - preserve_content
  
  token_overflow:
    - identify_excess
    - optimize_density
    - maintain_requirements
    
  cadence_drift:
    - reference_LTXV
    - adjust_rhythm
    - retain_meaning
    
  density_issue:
    - identify_sparse_areas
    - compress_verbose_sections
    - rebalance_distribution

### Quality Metrics
quality_requirements:
  density:
    information_density: "high"
    description_style: "precise_concise"
    priority_balance:
      physical_descriptions: 0.3
      action_sequences: 0.4
      technical_elements: 0.3

  distribution:
    subject_descriptions: "20-40 tokens"
    action_sequences: "30-50 tokens"
    technical_details: "20-30 tokens"
    atmospheric_elements: "15-25 tokens"
    scene_context: "10-15 tokens"

## INTEGRATION NOTES

1. Template Synchronization
   - Maintain LTXV structural patterns
   - Preserve video-prompt-system rules
   - Allow ACE adaptation within bounds

2. Token Management
   - Implement soft warning at 200 tokens
   - Hard stop at 250 tokens
   - Optimize for information density
   - Monitor component distribution

3. Quality Assurance
   - Validate against LTXV examples
   - Confirm ACE cognitive alignment
   - Verify HOLOFS tracking integrity
   - Check density metrics
   - Verify distribution balance

4. System Coherence
   - Maintain framework synchronization
   - Enable cross-reference capabilities
   - Ensure version consistency
   - Monitor density patterns
   - Track distribution compliance

## OPERATIONAL COMMANDS

### Generation Commands
```bash
# Initialize new prompt generation
prompt-gen --new --template standard

# Validate existing prompt
prompt-gen --validate path/to/prompt.txt

# Analyze prompt metrics
prompt-gen --analyze path/to/prompt.txt
```

### System Management
```bash
# Check system status
system-check --all

# Verify template alignment
template-verify --source LTXV

# Monitor token distribution
token-monitor --live
```

### Error Recovery
```bash
# Repair structure issues
repair-structure --auto

# Optimize density
optimize-density path/to/prompt.txt

# Rebalance distribution
rebalance-tokens path/to/prompt.txt
```

## USAGE GUIDELINES

1. Always initialize system before generation
2. Verify template alignment for each prompt
3. Monitor token distribution in real-time
4. Maintain backup of generated prompts
5. Regular system state verification
6. Periodic optimization checks

## MAINTENANCE PROCEDURES

1. Regular System Checks
   - Template integrity
   - Token distribution patterns
   - Density optimization
   - Structure alignment

2. Performance Optimization
   - Monitor generation patterns
   - Analyze success metrics
   - Adjust parameters as needed
   - Update constraints if required

3. Error Prevention
   - Regular validation checks
   - Proactive optimization
   - System state monitoring
   - Template synchronization
