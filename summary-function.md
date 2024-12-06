# Summary Function Module

## Purpose
Generate intelligent summaries of processed transcripts using ACE cognitive methodology to ensure optimal information preservation within given constraints.

## ACE-Driven Processing

### Priming Stage
- Analyze total content volume
- Identify target constraints (time/chars/words/default token limit)
- Map domain context and terminology
- Set information preservation priorities

### Comprehension Stage
- Parse full content structure
- Identify core themes and relationships
- Map temporal and causal connections
- Build contextual importance hierarchy

### Context Clarification Stage
- Break content into semantic units
- Evaluate information density of each unit
- Identify contextual dependencies
- Map critical narrative threads

### Expanding Stage
- Generate initial summary candidates
- Test against specified constraints
- Preserve contextual integrity
- Validate information accuracy

### Recursive Stage
- Refine summary through multiple passes
- Optimize information density
- Validate constraint compliance
- Ensure coherence and flow

## Constraint Handling

### Time-Based
- Base rate: 150 words/minute
- Account for:
  - Speech complexity
  - Natural pauses
  - Technical terminology
  - Numerical content

### Length-Based
- Character count
- Word count
- Default: Stay within remaining token limit

## Function Call
```
summary_text(
    input_text,
    constraint_type=None,  # "time", "chars", "words", or None for default
    constraint_value=None  # numeric value if constraint_type is specified
)
```

## Output
Clean summarized text with no markup, metadata, or annotations.

## Logging (/log/summary/[session_id].log)
```
ACE Process Tracking:
- Priming Factors: [key elements identified]
- Comprehension Metrics: [understanding depth]
- Context Maps: [relationship structures]
- Expansion Iterations: [refinement steps]
- Recursive Optimizations: [improvement cycles]

Constraint Details:
- Type: [constraint type]
- Target: [value]
- Achieved: [actual output metrics]
```
