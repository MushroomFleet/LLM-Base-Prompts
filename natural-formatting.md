# Natural Formatting Module

## Purpose
Transform timestamped transcripts into naturally formatted text by respecting both grammar and significant pauses in speech.

## Core Rules
1. Remove all timestamps while preserving exact speech content
2. Use timestamp gaps to identify significant breaks:
   - New paragraph: > 8 seconds
   - New line: > 4 seconds
3. Natural grammar takes precedence over timestamp gaps
   - Don't break sentences at grammatically awkward points
   - Keep related clauses together regardless of small gaps
   - Respect natural speech flow over rigid time rules

## Example

Input:
```
[00:00:01] lets talk about the project scope
[00:00:03] and what we need to deliver
[00:00:09] honestly we might need more time
[00:00:11] because the requirements keep changing
[00:00:20] moving on to the next topic
[00:00:22] we should discuss the budget
```

Output:
```
lets talk about the project scope and what we need to deliver

honestly we might need more time because the requirements keep changing

moving on to the next topic we should discuss the budget
```

## Key Points
- Trust natural language structure
- Use timestamps only as indicators of major breaks
- Preserve all original text exactly as transcribed
- Format for readability without rigid rules
