# LLM Input/Output Chunking System Specification

## Overview

This specification defines a model-agnostic chunking system designed to handle arbitrarily large documents with LLM API calls (OpenRouter, Anthropic, OpenAI, etc.) by preventing truncation through intelligent input chunking and systematic output assembly.

**Core Principle:** The system handles chunking transparently, allowing LLMs to process large documents in manageable pieces while maintaining context and ensuring complete output capture.

---

## System Architecture

### Two-Phase Design

The system consists of two independent but coordinated subsystems:

1. **Input Chunking System** - Breaks large inputs into processable chunks
2. **Output Chunking System** - Captures and organizes LLM responses for reassembly

Both systems operate independently but share common metadata structures for correlation.

---

## Configuration Parameters

### Global Settings

```
chunk_size: integer (default: 32000)
  - Maximum characters per chunk
  - User-configurable per session or globally
  - Recommendation: Set based on model context limits minus prompt overhead

overlap_size: integer (default: 500)
  - Optional character overlap between chunks for context continuity
  - Set to 0 to disable overlap

timestamp_format: string (default: "ISO8601")
  - Format for all timestamps: YYYY-MM-DD_HH-MM-SS-mmm

session_id_format: string (default: "uuid-v4")
  - Format for session identification

storage_base_path: string
  - Base directory for all chunk storage
```

---

## Input Chunking System

### Purpose
Transform large input documents into a sequence of chunks that can be processed sequentially by an LLM while maintaining context awareness.

### Input Chunking Process

#### Step 1: Document Analysis
```
INPUT: Raw document content, instruction/prompt, configuration
OUTPUT: Chunking strategy

1. Measure document length in characters
2. If length <= chunk_size:
   - No chunking required, proceed with single request
   - EXIT chunking process
3. If length > chunk_size:
   - Calculate number of chunks needed
   - chunks_needed = ceiling(document_length / (chunk_size - overlap_size))
   - CONTINUE to Step 2
```

#### Step 2: Chunk Generation
```
For each chunk index from 0 to (chunks_needed - 1):

1. Calculate chunk boundaries:
   - start_pos = index * (chunk_size - overlap_size)
   - end_pos = min(start_pos + chunk_size, document_length)
   
2. Extract chunk content = document[start_pos:end_pos]

3. Apply intelligent boundary adjustment:
   - If not final chunk AND not at document end:
     - Search backward from end_pos for natural break point:
       - Paragraph break (\n\n)
       - Sentence end (. ! ?)
       - Line break (\n)
     - Adjust end_pos to break point if found within overlap_size distance
   
4. Generate chunk metadata (see Metadata Schema below)

5. Create chunk package (see Chunk Package Structure)

6. Write chunk to input queue
```

### Metadata Schema

Each chunk includes metadata for tracking and correlation:

```
{
  "chunk_id": "uuid-v4",
  "session_id": "uuid-v4",
  "conversation_id": "uuid-v4",
  "document_id": "uuid-v4 or filename hash",
  "chunk_index": integer (0-based),
  "total_chunks": integer,
  "timestamp": "ISO8601 datetime",
  "chunk_size_actual": integer (actual characters in this chunk),
  "original_instruction": "string (preserved across all chunks)",
  "chunk_type": "input",
  "overlap_applied": boolean,
  "natural_break_used": boolean
}
```

### Chunk Package Structure

```
{
  "metadata": { /* see Metadata Schema */ },
  "content": "string (actual chunk content)",
  "context_header": "string (auto-generated context preamble)",
  "instruction": "string (original instruction repeated)"
}
```

### Context Header Generation

The system automatically generates a context header for each chunk:

```
For chunk_index == 0:
  "This is part 1 of {total_chunks}. Process this section according to the instruction. Additional parts will follow."

For 0 < chunk_index < (total_chunks - 1):
  "This is part {chunk_index + 1} of {total_chunks}. This continues from the previous section. Process according to the instruction. Additional parts will follow."

For chunk_index == (total_chunks - 1):
  "This is part {chunk_index + 1} of {total_chunks} (FINAL). This continues from the previous section. Process according to the instruction and finalize."
```

### Input Queue Management

```
Queue Structure:
  - session_id/
    - conversation_id/
      - input/
        - timestamp_chunk-{chunk_index}_of_{total_chunks}.json

Queue Processing:
1. Chunks are processed sequentially in order
2. Each chunk is sent to LLM API only after previous chunk output is captured
3. Queue status tracked in session state file
4. Failed chunks can be retried without reprocessing entire document
```

---

## Output Chunking System

### Purpose
Capture all LLM responses with full metadata, organize by session/conversation, and prepare for reassembly without LLM involvement.

### Output Capture Process

#### Step 1: Response Reception
```
INPUT: LLM API response, corresponding input chunk metadata
OUTPUT: Stored output chunk

1. Extract response content from API response
2. Inherit correlation IDs from input chunk:
   - session_id
   - conversation_id
   - document_id
3. Generate new output chunk_id
4. Record timestamp of response reception
5. Calculate response metrics (character count, token estimate)
```

#### Step 2: Output Metadata Generation

```
{
  "output_chunk_id": "uuid-v4",
  "input_chunk_id": "uuid-v4 (references input chunk)",
  "session_id": "uuid-v4",
  "conversation_id": "uuid-v4",
  "document_id": "uuid-v4",
  "chunk_index": integer (matches input chunk_index),
  "total_chunks": integer (matches input total_chunks),
  "timestamp": "ISO8601 datetime",
  "response_size": integer (characters),
  "chunk_type": "output",
  "model_used": "string (API model identifier)",
  "api_latency_ms": integer,
  "is_final_chunk": boolean
}
```

#### Step 3: Output Storage

```
Storage Structure:
  storage_base_path/
    sessions/
      {session_id}/
        {conversation_id}/
          outputs/
            {timestamp}_output-{chunk_index}_of_{total_chunks}.json
            
Each file contains:
{
  "metadata": { /* see Output Metadata */ },
  "content": "string (raw LLM response)",
  "status": "complete" | "partial" | "error"
}
```

---

## Reassembly System

### Purpose
Combine output chunks into complete documents using deterministic scripts (NO LLM INVOLVEMENT).

### Reassembly Process

```
Step 1: Chunk Discovery
  - Scan output directory for conversation_id
  - Collect all output chunks
  - Sort by chunk_index
  - Verify chunk_count matches total_chunks

Step 2: Integrity Check
  - Verify sequential chunk_index (no gaps)
  - Check all chunks have same session_id, conversation_id, document_id
  - Flag any anomalies

Step 3: Content Concatenation
  For each chunk in order:
    1. Extract content from chunk file
    2. Remove any context headers (if LLM echoed them)
    3. Apply overlap removal if configured:
       - Compare end of current content with start of next chunk
       - Remove duplicate text (using fuzzy matching if needed)
    4. Append to assembled_document string
    
Step 4: Output Generation
  - Write assembled_document to final output file
  - Name: {conversation_id}_{document_id}_assembled_{timestamp}.txt
  - Include assembly metadata:
    {
      "assembled_from_chunks": integer,
      "total_characters": integer,
      "assembly_timestamp": "ISO8601",
      "source_chunks": ["list of output_chunk_ids"]
    }
```

---

## Error Handling & Recovery

### Input Phase Errors

```
Chunk Generation Failure:
  - Log error with chunk_index
  - Retry with adjusted boundaries
  - If persistent: Mark session as failed, preserve state for manual review

API Request Failure:
  - Capture error in chunk status
  - Preserve chunk in retry queue
  - Continue with next chunk or pause based on error type
```

### Output Phase Errors

```
Response Capture Failure:
  - Mark output chunk as "incomplete"
  - Store partial response if available
  - Flag for manual review

Missing Output Chunk:
  - Reassembly process detects gap
  - Generate error report
  - Attempt to retrieve from API logs
  - Provide partial assembly with gap markers
```

---

## State Management

### Session State File

```
Location: sessions/{session_id}/state.json

Content:
{
  "session_id": "uuid-v4",
  "created": "ISO8601",
  "updated": "ISO8601",
  "conversations": {
    "{conversation_id}": {
      "document_id": "uuid-v4",
      "total_chunks": integer,
      "processed_chunks": integer,
      "status": "pending" | "processing" | "complete" | "error",
      "input_chunks_queued": integer,
      "output_chunks_captured": integer,
      "ready_for_assembly": boolean
    }
  },
  "configuration": { /* chunk_size, overlap, etc */ }
}
```

---

## Implementation Guidelines

### For LLM-Based Code Agents

When implementing this system in a specific codebase:

#### 1. Language-Agnostic Principles
- Use native file I/O for chunk storage
- Use standard UUID libraries for ID generation
- Use ISO8601 for timestamps
- Use JSON for metadata storage (widely supported)

#### 2. API Integration Pattern
```
Pseudocode:
  function process_large_document(document, instruction, config):
    if length(document) <= config.chunk_size:
      return single_api_call(document, instruction)
    
    chunks = create_input_chunks(document, config)
    outputs = []
    
    for chunk in chunks:
      store_input_chunk(chunk)
      response = api_call(chunk.context_header + chunk.content, instruction)
      output_chunk = create_output_chunk(response, chunk.metadata)
      store_output_chunk(output_chunk)
      outputs.append(output_chunk)
    
    assembled = reassemble_outputs(outputs)
    return assembled
```

#### 3. Storage Abstraction
Implement storage layer that can be:
- Local filesystem
- Cloud object storage (S3, GCS, Azure Blob)
- Database with BLOB fields
- Any persistent storage with directory-like hierarchy

#### 4. Configuration Management
- Support environment variables
- Support config files (JSON, YAML, TOML)
- Support runtime parameters
- Validate configuration on startup

#### 5. Monitoring & Logging
```
Log Events:
  - Chunk creation (chunk_id, size, boundaries)
  - API requests (chunk_id, model, timestamp)
  - API responses (chunk_id, latency, size)
  - Assembly operations (conversation_id, chunks assembled)
  - Errors (detailed context, retry info)
```

---

## Usage Examples

### Example 1: Processing a 100K Character Document

```
Input: 
  - Document: 100,000 characters
  - Instruction: "Analyze this code and suggest improvements"
  - Config: chunk_size=32000, overlap=500

Process:
  1. Calculate: 4 chunks needed
  2. Create chunks:
     - Chunk 0: chars 0-32000
     - Chunk 1: chars 31500-63500
     - Chunk 2: chars 63000-95000
     - Chunk 3: chars 94500-100000
  3. Generate context headers for each
  4. Send to API sequentially
  5. Capture 4 output chunks
  6. Reassemble into single analysis document

Output:
  - Complete analysis in: assembled_output.txt
  - Individual chunks preserved in: outputs/ directory
```

### Example 2: Multi-Document Session

```
Session:
  - Document A (50K chars) → 2 chunks → conversation_id_A
  - Document B (80K chars) → 3 chunks → conversation_id_B
  - Document C (20K chars) → 1 chunk → conversation_id_C

Storage Structure:
  sessions/
    {session_id}/
      {conversation_id_A}/
        input/ (2 chunks)
        outputs/ (2 chunks)
      {conversation_id_B}/
        input/ (3 chunks)
        outputs/ (3 chunks)
      {conversation_id_C}/
        input/ (1 chunk)
        outputs/ (1 chunk)
```

---

## Performance Considerations

### Chunk Size Selection

```
Factors:
  - Model context window (stay well below limit)
  - Cost optimization (fewer chunks = fewer API calls)
  - Parallelization opportunity (smaller chunks = more parallel processing)
  - Overlap overhead (smaller chunks = more redundant processing)

Recommendations:
  - Claude/GPT-4: 30-50K characters
  - Smaller models: 10-20K characters
  - Code processing: Use smaller chunks with more overlap
  - Narrative text: Use larger chunks with less overlap
```

### Optimization Strategies

```
1. Intelligent Boundary Detection:
   - Prefer breaking at structural boundaries (functions, classes, paragraphs)
   - Reduces context loss between chunks

2. Parallel Processing:
   - For independent documents, process chunks in parallel
   - Respect API rate limits

3. Caching:
   - Cache input chunks if same document processed multiple times
   - Reuse chunk boundaries for identical documents

4. Streaming Assembly:
   - Begin assembly as soon as first output chunks available
   - Reduces end-to-end latency for very large documents
```

---

## Testing & Validation

### Unit Tests

```
Test Cases:
  1. Single chunk document (no chunking needed)
  2. Exact boundary document (length = chunk_size)
  3. Multi-chunk document with clean boundaries
  4. Multi-chunk document requiring boundary adjustment
  5. Extremely large document (10+ chunks)
  6. Empty document
  7. Document with unusual characters/encoding
```

### Integration Tests

```
Test Scenarios:
  1. End-to-end: Large doc → chunks → API → outputs → assembly
  2. Error recovery: Simulated API failure mid-process
  3. Concurrent sessions: Multiple documents simultaneously
  4. Storage integrity: Verify all metadata is preserved
  5. Reassembly accuracy: Compare assembled output to expected
```

---

## Extensibility Points

### Custom Chunking Strategies

```
Interface:
  function custom_chunker(document, config):
    return list[Chunk]

Implementations:
  - Token-based chunking (using tiktoken or similar)
  - Semantic chunking (using embeddings for natural boundaries)
  - Language-aware chunking (respecting code syntax)
  - Format-specific chunking (JSON, XML, Markdown)
```

### Custom Assembly Logic

```
Interface:
  function custom_assembler(output_chunks, config):
    return assembled_document

Implementations:
  - Markdown formatter (preserves formatting across chunks)
  - Code concatenator (handles imports/dependencies)
  - JSON merger (properly combines JSON fragments)
  - Deduplication assembler (removes redundant content)
```

---

## Security Considerations

### Data Protection

```
1. Chunk Storage:
   - Encrypt sensitive chunks at rest
   - Use appropriate file permissions
   - Implement automatic cleanup policies

2. Metadata:
   - Avoid storing sensitive info in metadata
   - Use opaque IDs (UUIDs not sequential)
   - Sanitize filenames

3. API Keys:
   - Never store API keys in chunk metadata
   - Use environment variables or secure key management
   - Rotate keys regularly
```

---

## Migration Path

### Integrating into Existing Systems

```
Step 1: Wrapper Implementation
  - Wrap existing LLM API calls with chunk detection
  - No changes to existing logic initially
  - Transparent to calling code

Step 2: Storage Setup
  - Create directory structure
  - Initialize session management
  - Configure parameters

Step 3: Gradual Rollout
  - Enable for documents over threshold
  - Monitor performance and accuracy
  - Adjust chunk_size based on results

Step 4: Full Integration
  - Make chunking system primary path
  - Deprecate old direct API calls
  - Enable advanced features (parallel processing, caching)
```

---

## Summary

This specification provides a complete, model-agnostic design for handling arbitrarily large documents with LLM APIs. The system is:

- **Transparent**: Calling code doesn't need to know about chunking
- **Reliable**: Preserves all content without truncation
- **Recoverable**: Handles failures gracefully with retry capability
- **Auditable**: Full metadata trail for debugging and monitoring
- **Flexible**: Configurable for different models, documents, and use cases
- **Deterministic**: Assembly is purely algorithmic, no LLM involvement

Implementation in any language/framework should follow these principles while adapting to the specific technical ecosystem.

---

**Version**: 1.0  
**Last Updated**: 2025-10-28  
**Status**: Ready for Implementation
