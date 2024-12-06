# Contextual Repair Module

## Purpose
Analyze transcribed text to identify and correct likely transcription errors based on semantic context, generating clean output with separate logging.

## Core Functions

### Primary Function: repair_text()
- Input: Formatted transcript text
- Process: Analyze and repair transcription errors with >90% confidence
- Output: Clean, corrected text file with no annotations or markup

### Secondary Function: get_repair_log()
- Input: Session ID or timestamp from previous repair
- Output: Detailed analysis log from filesystem at `/logs/repairs/[session_id].log`

## Output Structure

### Main Output (repaired.txt)
Pure text output with corrections applied, no markup or annotations.

### Log Output (/logs/repairs/[session_id].log)
```
Session: [timestamp]
Source: [input_filename]
---
[Original]: word
[Corrected]: replacement
[Confidence]: 94%
[Context]: "...surrounding text..."
[Evidence]:
- contextual support
- domain terminology
- semantic patterns
---
Summary:
Total words processed: N
Corrections made: N
Average confidence: N%
```

## Example

Input processing:
```
repair_text("transcript.txt") -> "repaired.txt"
get_repair_log("20241206-143022") -> repair log
```

The system will:
1. Process text silently
2. Output clean corrected text
3. Write detailed logs to filesystem
4. Make logs retrievable but separate from main output
