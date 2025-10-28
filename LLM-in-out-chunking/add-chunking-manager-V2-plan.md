# Advanced LLM Input/Output Chunking System Specification v2.0

## Overview

This specification defines an advanced, model-agnostic chunking system for handling arbitrarily large documents with LLM APIs. The system prevents truncation, enables parallel processing where appropriate, manages context intelligently, and provides comprehensive monitoring and recovery capabilities.

**Design Philosophy:** Maximize reliability, minimize latency, optimize costs, and maintain flexibility across any tech stack or model provider.

---

## Core Architecture

### Three-Layer System Design

```
Layer 1: ORCHESTRATION LAYER
  - Session management
  - Chunk scheduling and dependency resolution
  - Parallel execution coordination
  - State persistence

Layer 2: PROCESSING LAYER
  - Input chunking with context management
  - API request/response handling
  - Output capture and validation
  - Error recovery

Layer 3: ASSEMBLY LAYER
  - Deterministic output reassembly
  - Quality validation
  - Format normalization
  - Delivery
```

---

## Enhanced Configuration System

### Configuration Schema

```json
{
  "chunking": {
    "strategy": "token" | "character" | "semantic" | "hybrid",
    "size": 32000,
    "size_unit": "tokens" | "characters",
    "overlap": 500,
    "overlap_unit": "tokens" | "characters",
    "boundary_detection": {
      "enabled": true,
      "prefer": ["paragraph", "sentence", "code_block", "json_object"],
      "max_search_distance": 1000
    }
  },
  
  "context_management": {
    "mode": "stateless" | "rolling_summary" | "full_history",
    "summary_model": "same" | "fast_model_id",
    "max_context_chunks": 3,
    "include_previous_outputs": true
  },
  
  "execution": {
    "mode": "sequential" | "parallel" | "adaptive",
    "max_parallel_chunks": 5,
    "rate_limit": {
      "requests_per_minute": 50,
      "tokens_per_minute": 100000,
      "adaptive": true
    },
    "timeout_ms": 120000,
    "retry": {
      "max_attempts": 3,
      "backoff_strategy": "exponential",
      "initial_delay_ms": 1000,
      "max_delay_ms": 30000
    }
  },
  
  "quality": {
    "validation_enabled": true,
    "coherence_check": true,
    "min_output_length": 10,
    "max_output_length": 100000,
    "detect_truncation": true
  },
  
  "storage": {
    "base_path": "./chunks",
    "retention_days": 7,
    "compress_old_chunks": true,
    "encryption_enabled": false
  },
  
  "monitoring": {
    "track_costs": true,
    "track_latency": true,
    "track_token_usage": true,
    "webhooks": [],
    "log_level": "info"
  }
}
```

---

## Intelligent Input Chunking System

### Token-Aware Chunking

Modern LLM APIs bill and limit by tokens, not characters. Implement token-based chunking:

```
Step 1: Token Counting Setup
  function initialize_tokenizer(model_name):
    // Use appropriate tokenizer for model family
    if model_name contains "claude":
      tokenizer = load_anthropic_tokenizer()
    else if model_name contains "gpt":
      tokenizer = load_openai_tokenizer(model_name)
    else if model_name contains "llama":
      tokenizer = load_llama_tokenizer()
    else:
      tokenizer = load_generic_tokenizer()
    
    return tokenizer

Step 2: Document Token Analysis
  function analyze_document(document, config):
    tokenizer = initialize_tokenizer(config.model)
    tokens = tokenizer.encode(document)
    token_count = length(tokens)
    
    metadata = {
      "total_tokens": token_count,
      "total_characters": length(document),
      "tokens_per_character": token_count / length(document),
      "estimated_cost": calculate_cost(token_count, config.model)
    }
    
    if token_count <= config.chunking.size:
      metadata.chunking_needed = false
      return metadata
    
    metadata.chunking_needed = true
    metadata.estimated_chunks = ceiling(token_count / (config.chunking.size - config.chunking.overlap))
    
    return metadata
```

### Hybrid Chunking Strategy

Combine token limits with semantic boundaries:

```
function create_chunks_hybrid(document, config):
  tokenizer = initialize_tokenizer(config.model)
  chunks = []
  current_position = 0
  document_tokens = tokenizer.encode(document)
  total_tokens = length(document_tokens)
  
  while current_position < total_tokens:
    // Calculate target chunk size
    target_end = min(
      current_position + config.chunking.size,
      total_tokens
    )
    
    // Find semantic boundary near target
    if target_end < total_tokens:
      boundary_info = find_semantic_boundary(
        document,
        tokenizer.decode(document_tokens[0:target_end]),
        config.chunking.boundary_detection
      )
      
      if boundary_info.found:
        chunk_text = boundary_info.text
        chunk_tokens = tokenizer.encode(chunk_text)
        actual_end = current_position + length(chunk_tokens)
      else:
        // No good boundary found, use token limit
        chunk_tokens = document_tokens[current_position:target_end]
        chunk_text = tokenizer.decode(chunk_tokens)
        actual_end = target_end
    else:
      // Final chunk
      chunk_tokens = document_tokens[current_position:total_tokens]
      chunk_text = tokenizer.decode(chunk_tokens)
      actual_end = total_tokens
    
    // Create chunk object
    chunk = create_chunk_object(
      chunk_text,
      current_position,
      actual_end,
      chunks.length,
      config
    )
    
    chunks.append(chunk)
    
    // Move to next position with overlap
    if config.chunking.overlap > 0 and actual_end < total_tokens:
      current_position = actual_end - config.chunking.overlap
    else:
      current_position = actual_end
  
  return chunks
```

### Semantic Boundary Detection

```
function find_semantic_boundary(document, text_up_to_target, boundary_config):
  if not boundary_config.enabled:
    return {found: false}
  
  search_start = max(0, length(text_up_to_target) - boundary_config.max_search_distance)
  search_text = text_up_to_target[search_start:]
  
  // Priority order for boundaries
  for boundary_type in boundary_config.prefer:
    boundary = find_boundary_of_type(search_text, boundary_type)
    
    if boundary.found:
      return {
        found: true,
        text: text_up_to_target[0:search_start + boundary.position],
        boundary_type: boundary_type,
        natural: true
      }
  
  return {found: false}

function find_boundary_of_type(text, boundary_type):
  patterns = {
    "paragraph": ["\n\n", "\r\n\r\n"],
    "sentence": [".\n", ". ", "!\n", "! ", "?\n", "? "],
    "code_block": ["}\n", "}\r\n", "\n\n", ";\n"],
    "json_object": ["},\n", "}\n"],
    "xml_tag": ["</", "/>"],
    "markdown_header": ["\n# ", "\n## ", "\n### "]
  }
  
  if boundary_type not in patterns:
    return {found: false}
  
  // Search backwards for last occurrence of any pattern
  for pattern in patterns[boundary_type]:
    position = text.rfind(pattern)
    if position >= 0:
      return {
        found: true,
        position: position + length(pattern)
      }
  
  return {found: false}
```

---

## Advanced Context Management

### Rolling Context Strategy

Instead of processing chunks in isolation, maintain contextual awareness:

```
function generate_chunk_context(chunk, previous_chunks, config):
  if config.context_management.mode == "stateless":
    return generate_stateless_context(chunk)
  
  else if config.context_management.mode == "rolling_summary":
    return generate_rolling_summary_context(chunk, previous_chunks, config)
  
  else if config.context_management.mode == "full_history":
    return generate_full_history_context(chunk, previous_chunks, config)

function generate_rolling_summary_context(chunk, previous_chunks, config):
  context_parts = []
  
  // Add document-level context
  context_parts.append(f"Document: {chunk.metadata.document_id}")
  context_parts.append(f"Processing chunk {chunk.index + 1} of {chunk.total_chunks}")
  
  // Include summaries of recent chunks
  if previous_chunks.length > 0:
    max_context = min(
      config.context_management.max_context_chunks,
      previous_chunks.length
    )
    
    relevant_chunks = previous_chunks[-max_context:]
    
    context_parts.append("\nContext from previous sections:")
    
    for prev_chunk in relevant_chunks:
      if prev_chunk.summary:
        context_parts.append(f"- Part {prev_chunk.index + 1}: {prev_chunk.summary}")
      else:
        // Generate summary if not available
        summary = generate_quick_summary(prev_chunk.content, config)
        context_parts.append(f"- Part {prev_chunk.index + 1}: {summary}")
  
  // Add instruction
  context_parts.append(f"\nInstruction: {chunk.instruction}")
  
  // Add current chunk header
  if chunk.index == chunk.total_chunks - 1:
    context_parts.append("\nThis is the FINAL section. Provide complete output.")
  else:
    context_parts.append("\nProcess this section. More sections will follow.")
  
  return "\n".join(context_parts)

function generate_quick_summary(content, config):
  // Extract key elements for context
  lines = content.split("\n")
  
  summary_parts = []
  
  // Include first and last sentences
  sentences = extract_sentences(content)
  if sentences.length > 0:
    summary_parts.append(sentences[0])
    if sentences.length > 1:
      summary_parts.append(sentences[-1])
  
  // Include any headers or key terms
  headers = extract_headers(lines)
  if headers.length > 0:
    summary_parts.append(f"Topics: {', '.join(headers)}")
  
  summary = " | ".join(summary_parts)
  
  // Truncate if too long
  max_summary_length = 200
  if length(summary) > max_summary_length:
    summary = summary[0:max_summary_length] + "..."
  
  return summary
```

### Context Injection for Continuity

```
function inject_continuity_markers(chunk, previous_outputs, config):
  if not config.context_management.include_previous_outputs:
    return chunk.content
  
  if previous_outputs.length == 0:
    return chunk.content
  
  // Get last output's final sentences
  last_output = previous_outputs[-1]
  last_sentences = extract_sentences(last_output.content)[-2:]
  
  continuity_context = f"""
Previous output ended with:
{" ".join(last_sentences)}

Continue naturally from this point:
"""
  
  return continuity_context + chunk.content
```

---

## Parallel Processing & Dependency Management

### Execution Mode Selection

```
function determine_execution_mode(chunks, config):
  if config.execution.mode == "sequential":
    return "sequential"
  
  if config.execution.mode == "parallel":
    return "parallel"
  
  if config.execution.mode == "adaptive":
    // Analyze if chunks can be processed in parallel
    if all_chunks_independent(chunks):
      return "parallel"
    else if has_parallel_groups(chunks):
      return "grouped_parallel"
    else:
      return "sequential"

function all_chunks_independent(chunks):
  // Check if chunks are independent (e.g., multiple separate documents)
  unique_documents = set([chunk.metadata.document_id for chunk in chunks])
  
  if length(unique_documents) == length(chunks):
    return true  // Each chunk is a different document
  
  return false

function has_parallel_groups(chunks):
  // Check if we can create groups of independent chunks
  // For example, alternating chunks from different documents
  
  groups = {}
  for chunk in chunks:
    doc_id = chunk.metadata.document_id
    if doc_id not in groups:
      groups[doc_id] = []
    groups[doc_id].append(chunk)
  
  // If we have multiple documents, we can process them in parallel
  if length(groups) > 1:
    return true
  
  return false
```

### Parallel Execution Controller

```
function process_chunks_parallel(chunks, config):
  max_parallel = config.execution.max_parallel_chunks
  rate_limiter = initialize_rate_limiter(config.execution.rate_limit)
  
  // Create task queue
  pending_chunks = Queue(chunks)
  active_tasks = []
  completed_outputs = []
  failed_chunks = []
  
  while not pending_chunks.empty() or length(active_tasks) > 0:
    // Start new tasks up to parallel limit
    while length(active_tasks) < max_parallel and not pending_chunks.empty():
      if rate_limiter.can_proceed():
        chunk = pending_chunks.dequeue()
        
        task = async_process_chunk(
          chunk,
          config,
          on_complete=lambda output: handle_completion(output, completed_outputs),
          on_error=lambda error: handle_error(chunk, error, failed_chunks)
        )
        
        active_tasks.append(task)
        rate_limiter.record_request()
      else:
        // Wait for rate limit to refresh
        sleep(rate_limiter.time_until_next_slot())
    
    // Wait for at least one task to complete
    completed_task = wait_for_any(active_tasks)
    active_tasks.remove(completed_task)
    
    // Update rate limiter with actual token usage
    if completed_task.output:
      rate_limiter.record_tokens(completed_task.output.tokens_used)
  
  // Handle failures
  if length(failed_chunks) > 0:
    return retry_failed_chunks(failed_chunks, config)
  
  return completed_outputs
```

### Adaptive Rate Limiting

```
class AdaptiveRateLimiter:
  function initialize(config):
    this.requests_per_minute = config.requests_per_minute
    this.tokens_per_minute = config.tokens_per_minute
    this.adaptive = config.adaptive
    
    this.request_window = []
    this.token_window = []
    this.window_duration_ms = 60000  // 1 minute
    
    this.backoff_factor = 1.0
    this.last_rate_limit_error = null
  
  function can_proceed():
    now = current_time_ms()
    
    // Clean old entries
    this.request_window = [t for t in this.request_window if now - t < this.window_duration_ms]
    this.token_window = [t for t in this.token_window if now - t.timestamp < this.window_duration_ms]
    
    // Check request limit
    adjusted_request_limit = this.requests_per_minute / this.backoff_factor
    if length(this.request_window) >= adjusted_request_limit:
      return false
    
    // Check token limit
    current_tokens = sum([t.count for t in this.token_window])
    adjusted_token_limit = this.tokens_per_minute / this.backoff_factor
    if current_tokens >= adjusted_token_limit:
      return false
    
    return true
  
  function record_request():
    this.request_window.append(current_time_ms())
  
  function record_tokens(count):
    this.token_window.append({
      timestamp: current_time_ms(),
      count: count
    })
  
  function handle_rate_limit_error(error):
    if not this.adaptive:
      return
    
    this.last_rate_limit_error = current_time_ms()
    this.backoff_factor = min(this.backoff_factor * 1.5, 4.0)
    
    log("Rate limit hit, backing off by factor: " + this.backoff_factor)
  
  function time_until_next_slot():
    if not this.can_proceed():
      // Calculate time until oldest request/token expires
      oldest_request = min(this.request_window) if this.request_window else 0
      time_until_request_slot = max(0, this.window_duration_ms - (current_time_ms() - oldest_request))
      
      return time_until_request_slot + 100  // Add small buffer
    
    return 0
  
  function gradually_increase_rate():
    // If no rate limit errors recently, gradually increase rate
    if this.adaptive and this.backoff_factor > 1.0:
      time_since_error = current_time_ms() - (this.last_rate_limit_error or 0)
      
      if time_since_error > 300000:  // 5 minutes
        this.backoff_factor = max(1.0, this.backoff_factor * 0.9)
```

---

## Enhanced Output Management

### Output Validation

```
function validate_output(output_chunk, input_chunk, config):
  validation_result = {
    "valid": true,
    "warnings": [],
    "errors": []
  }
  
  if not config.quality.validation_enabled:
    return validation_result
  
  // Length checks
  if length(output_chunk.content) < config.quality.min_output_length:
    validation_result.errors.append("Output too short")
    validation_result.valid = false
  
  if length(output_chunk.content) > config.quality.max_output_length:
    validation_result.warnings.append("Output unusually long")
  
  // Truncation detection
  if config.quality.detect_truncation:
    if is_truncated(output_chunk.content):
      validation_result.errors.append("Output appears truncated")
      validation_result.valid = false
  
  // Coherence check
  if config.quality.coherence_check and input_chunk.index > 0:
    coherence_score = check_coherence(output_chunk, input_chunk.previous_outputs)
    
    if coherence_score < 0.5:
      validation_result.warnings.append(f"Low coherence score: {coherence_score}")
  
  // Check for error messages in output
  if contains_error_indicators(output_chunk.content):
    validation_result.warnings.append("Output contains error indicators")
  
  return validation_result

function is_truncated(content):
  // Check for common truncation indicators
  truncation_indicators = [
    "I apologize, but I've reached",
    "I've hit the character limit",
    "I need to stop here",
    "Due to length constraints",
    "I'll need to continue in the next",
    "[Output truncated]",
    "...[continued]"
  ]
  
  content_lower = content.lower()
  for indicator in truncation_indicators:
    if indicator.lower() in content_lower[-500:]:  // Check last 500 chars
      return true
  
  // Check for incomplete sentences at the end
  last_100 = content[-100:].strip()
  if last_100 and not last_100[-1] in [".", "!", "?", '"', "'", ")", "]", "}"]:
    return true
  
  return false

function contains_error_indicators(content):
  error_indicators = [
    "error:",
    "exception:",
    "failed to",
    "unable to",
    "cannot process",
    "I apologize, I cannot",
    "I'm sorry, I can't"
  ]
  
  content_lower = content.lower()
  for indicator in error_indicators:
    if indicator in content_lower[0:500]:  // Check first 500 chars
      return true
  
  return false

function check_coherence(current_output, previous_outputs):
  if length(previous_outputs) == 0:
    return 1.0
  
  // Simple coherence check: look for continuity markers
  current_start = current_output.content[0:200].lower()
  previous_end = previous_outputs[-1].content[-200:].lower()
  
  continuity_markers = [
    "continuing from",
    "as mentioned",
    "building on",
    "following from",
    "therefore",
    "consequently",
    "additionally",
    "furthermore"
  ]
  
  score = 0.5  // Baseline
  
  for marker in continuity_markers:
    if marker in current_start:
      score += 0.2
  
  // Check for topic consistency (simple keyword overlap)
  current_words = set(extract_keywords(current_start))
  previous_words = set(extract_keywords(previous_end))
  
  overlap = current_words.intersection(previous_words)
  overlap_ratio = length(overlap) / max(length(current_words), 1)
  
  score += overlap_ratio * 0.3
  
  return min(score, 1.0)
```

### Enhanced Metadata Schema

```
Input Chunk Metadata:
{
  "chunk_id": "uuid-v4",
  "session_id": "uuid-v4",
  "conversation_id": "uuid-v4",
  "document_id": "uuid-v4",
  "chunk_index": integer,
  "total_chunks": integer,
  "timestamp": "ISO8601",
  
  "content": {
    "size_bytes": integer,
    "size_characters": integer,
    "size_tokens": integer,
    "token_encoding": "cl100k_base | gpt2 | etc",
    "hash": "sha256 of content"
  },
  
  "boundaries": {
    "start_position": integer,
    "end_position": integer,
    "start_token": integer,
    "end_token": integer,
    "boundary_type": "natural | forced",
    "overlap_with_previous": integer
  },
  
  "context": {
    "mode": "stateless | rolling_summary | full_history",
    "previous_chunk_ids": ["uuid-v4"],
    "summary_of_previous": "string"
  },
  
  "execution": {
    "priority": integer,
    "dependencies": ["chunk_id"],
    "can_parallel": boolean,
    "group_id": "uuid-v4"
  }
}

Output Chunk Metadata:
{
  "output_chunk_id": "uuid-v4",
  "input_chunk_id": "uuid-v4",
  "session_id": "uuid-v4",
  "conversation_id": "uuid-v4",
  "document_id": "uuid-v4",
  "chunk_index": integer,
  "total_chunks": integer,
  "timestamp": "ISO8601",
  
  "content": {
    "size_bytes": integer,
    "size_characters": integer,
    "size_tokens": integer,
    "hash": "sha256 of content"
  },
  
  "api": {
    "model": "claude-sonnet-4-20250514",
    "provider": "anthropic",
    "request_id": "string",
    "latency_ms": integer,
    "tokens_input": integer,
    "tokens_output": integer,
    "cost_usd": float
  },
  
  "quality": {
    "validation_passed": boolean,
    "validation_warnings": ["string"],
    "validation_errors": ["string"],
    "coherence_score": float,
    "is_truncated": boolean
  },
  
  "retry": {
    "attempt": integer,
    "max_attempts": integer,
    "previous_attempts": [
      {
        "timestamp": "ISO8601",
        "error": "string",
        "retry_reason": "string"
      }
    ]
  }
}
```

---

## Intelligent Assembly System

### Multi-Stage Assembly

```
function assemble_outputs(output_chunks, config):
  // Stage 1: Validation & Sorting
  validated_chunks = validate_and_sort_chunks(output_chunks)
  
  // Stage 2: Deduplication (handle overlaps)
  deduplicated_chunks = remove_overlap_duplicates(validated_chunks, config)
  
  // Stage 3: Content merging
  merged_content = merge_chunk_contents(deduplicated_chunks, config)
  
  // Stage 4: Post-processing
  final_output = post_process_assembly(merged_content, config)
  
  // Stage 5: Quality check
  quality_report = assess_assembly_quality(final_output, output_chunks, config)
  
  return {
    "content": final_output,
    "metadata": generate_assembly_metadata(output_chunks),
    "quality": quality_report
  }

function validate_and_sort_chunks(output_chunks):
  // Check for missing chunks
  chunk_indices = [chunk.metadata.chunk_index for chunk in output_chunks]
  expected_indices = range(0, max(chunk_indices) + 1)
  
  missing = [i for i in expected_indices if i not in chunk_indices]
  
  if length(missing) > 0:
    throw AssemblyError("Missing chunks: " + str(missing))
  
  // Sort by index
  sorted_chunks = sort(output_chunks, key=lambda x: x.metadata.chunk_index)
  
  // Verify sequence integrity
  for i in range(length(sorted_chunks)):
    if sorted_chunks[i].metadata.chunk_index != i:
      throw AssemblyError("Chunk sequence integrity violation")
  
  return sorted_chunks

function remove_overlap_duplicates(chunks, config):
  if length(chunks) <= 1:
    return chunks
  
  deduplicated = [chunks[0]]
  
  for i in range(1, length(chunks)):
    current_chunk = chunks[i]
    previous_chunk = deduplicated[-1]
    
    // Check if there's overlap to remove
    overlap_size = current_chunk.metadata.boundaries.overlap_with_previous
    
    if overlap_size > 0:
      // Find actual duplicate content
      prev_end = previous_chunk.content[-overlap_size*2:]  // Check more than expected
      curr_start = current_chunk.content[0:overlap_size*2]
      
      duplicate_length = find_duplicate_length(prev_end, curr_start)
      
      if duplicate_length > 0:
        // Remove duplicate from current chunk
        cleaned_content = current_chunk.content[duplicate_length:]
        current_chunk.content = cleaned_content
    
    deduplicated.append(current_chunk)
  
  return deduplicated

function find_duplicate_length(text1, text2):
  // Find longest common prefix between end of text1 and start of text2
  max_check = min(length(text1), length(text2))
  
  for length in range(max_check, 0, -1):
    if text1[-length:] == text2[0:length]:
      return length
  
  return 0

function merge_chunk_contents(chunks, config):
  parts = []
  
  for chunk in chunks:
    content = chunk.content
    
    // Remove any chunk markers that LLM might have echoed
    content = remove_chunk_markers(content)
    
    // Remove excessive whitespace between chunks
    content = content.strip()
    
    parts.append(content)
  
  // Join with appropriate separator based on content type
  separator = detect_content_separator(chunks)
  merged = separator.join(parts)
  
  return merged

function remove_chunk_markers(content):
  // Remove common markers that LLMs might echo
  markers = [
    r"This is part \d+ of \d+",
    r"Part \d+ of \d+:",
    r"\[Chunk \d+/\d+\]",
    r"Continuing from previous section:",
    r"--- Part \d+ ---"
  ]
  
  cleaned = content
  for marker_pattern in markers:
    cleaned = regex_replace(cleaned, marker_pattern, "", flags=IGNORECASE)
  
  return cleaned

function detect_content_separator(chunks):
  // Detect appropriate separator based on content type
  
  sample = chunks[0].content[0:1000]
  
  // Check for code
  if contains_code_indicators(sample):
    return "\n\n"
  
  // Check for structured data (JSON, XML)
  if sample.strip().startswith("{") or sample.strip().startswith("["):
    return "\n"
  
  if sample.strip().startswith("<"):
    return "\n"
  
  // Default to double newline for prose
  return "\n\n"

function post_process_assembly(content, config):
  processed = content
  
  // Normalize whitespace
  processed = normalize_whitespace(processed)
  
  // Fix common concatenation issues
  processed = fix_concatenation_issues(processed)
  
  return processed

function fix_concatenation_issues(content):
  fixes = content
  
  // Fix missing spaces after periods
  fixes = regex_replace(fixes, r"\.([A-Z])", ". \\1")
  
  // Fix duplicate punctuation
  fixes = regex_replace(fixes, r"([.!?])\1+", "\\1")
  
  // Fix orphaned closing punctuation
  fixes = regex_replace(fixes, r"\s+([.!?,;:])", "\\1")
  
  return fixes

function assess_assembly_quality(final_output, chunks, config):
  report = {
    "total_chunks_assembled": length(chunks),
    "final_size_characters": length(final_output),
    "final_size_tokens": count_tokens(final_output),
    "issues": [],
    "warnings": [],
    "quality_score": 1.0
  }
  
  // Check for discontinuities
  discontinuity_score = check_discontinuities(final_output)
  if discontinuity_score < 0.7:
    report.warnings.append("Potential discontinuities detected")
    report.quality_score *= 0.9
  
  // Check for repeated content
  repetition_score = check_repetition(final_output)
  if repetition_score > 0.3:
    report.warnings.append("High repetition detected")
    report.quality_score *= 0.8
  
  // Verify all chunks contributed
  empty_chunks = [c for c in chunks if length(c.content.strip()) == 0]
  if length(empty_chunks) > 0:
    report.issues.append(f"{length(empty_chunks)} chunks were empty")
    report.quality_score *= 0.7
  
  return report
```

---

## Cost Tracking & Monitoring

### Comprehensive Cost Tracking

```
class CostTracker:
  function initialize(config):
    this.pricing = load_model_pricing()
    this.tracking_enabled = config.monitoring.track_costs
    this.session_costs = {}
  
  function load_model_pricing():
    // Pricing per 1M tokens (input/output)
    return {
      "claude-sonnet-4-20250514": {
        "input": 3.00,
        "output": 15.00
      },
      "claude-opus-4-20250514": {
        "input": 15.00,
        "output": 75.00
      },
      "gpt-4-turbo": {
        "input": 10.00,
        "output": 30.00
      },
      "gpt-3.5-turbo": {
        "input": 0.50,
        "output": 1.50
      }
    }
  
  function calculate_chunk_cost(chunk_metadata):
    if not this.tracking_enabled:
      return 0.0
    
    model = chunk_metadata.api.model
    input_tokens = chunk_metadata.api.tokens_input
    output_tokens = chunk_metadata.api.tokens_output
    
    if model not in this.pricing:
      log_warning(f"Unknown model pricing: {model}")
      return 0.0
    
    input_cost = (input_tokens / 1000000) * this.pricing[model].input
    output_cost = (output_tokens / 1000000) * this.pricing[model].output
    
    total_cost = input_cost + output_cost
    
    return total_cost
  
  function record_chunk_cost(chunk_metadata):
    cost = this.calculate_chunk_cost(chunk_metadata)
    
    session_id = chunk_metadata.session_id
    if session_id not in this.session_costs:
      this.session_costs[session_id] = {
        "total_cost": 0.0,
        "chunks_processed": 0,
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "model_breakdown": {}
      }
    
    session = this.session_costs[session_id]
    session.total_cost += cost
    session.chunks_processed += 1
    session.total_input_tokens += chunk_metadata.api.tokens_input
    session.total_output_tokens += chunk_metadata.api.tokens_output
    
    model = chunk_metadata.api.model
    if model not in session.model_breakdown:
      session.model_breakdown[model] = {"cost": 0.0, "chunks": 0}
    
    session.model_breakdown[model].cost += cost
    session.model_breakdown[model].chunks += 1
  
  function get_session_report(session_id):
    if session_id not in this.session_costs:
      return null
    
    session = this.session_costs[session_id]
    
    report = {
      "session_id": session_id,
      "total_cost_usd": round(session.total_cost, 4),
      "chunks_processed": session.chunks_processed,
      "average_cost_per_chunk": round(session.total_cost / session.chunks_processed, 4),
      "total_tokens": {
        "input": session.total_input_tokens,
        "output": session.total_output_tokens,
        "total": session.total_input_tokens + session.total_output_tokens
      },
      "cost_per_1k_tokens": round(
        session.total_cost / ((session.total_input_tokens + session.total_output_tokens) / 1000),
        4
      ),
      "model_breakdown": session.model_breakdown
    }
    
    return report
```

### Performance Monitoring

```
class PerformanceMonitor:
  function initialize(config):
    this.enabled = config.monitoring.track_latency
    this.metrics = {}
  
  function start_operation(operation_id, operation_type):
    this.metrics[operation_id] = {
      "type": operation_type,
      "start_time": current_time_ms(),
      "end_time": null,
      "duration_ms": null,
      "status": "in_progress"
    }
  
  function end_operation(operation_id, status="success"):
    if operation_id not in this.metrics:
      return
    
    metric = this.metrics[operation_id]
    metric.end_time = current_time_ms()
    metric.duration_ms = metric.end_time - metric.start_time
    metric.status = status
  
  function get_statistics(operation_type=null):
    relevant_metrics = this.metrics.values()
    
    if operation_type:
      relevant_metrics = [m for m in relevant_metrics if m.type == operation_type]
    
    if length(relevant_metrics) == 0:
      return null
    
    durations = [m.duration_ms for m in relevant_metrics if m.duration_ms]
    
    return {
      "count": length(relevant_metrics),
      "average_ms": mean(durations),
      "median_ms": median(durations),
      "min_ms": min(durations),
      "max_ms": max(durations),
      "p95_ms": percentile(durations, 95),
      "p99_ms": percentile(durations, 99)
    }
```

---

## Error Recovery & Resilience

### Smart Retry Logic

```
function process_chunk_with_retry(chunk, config):
  max_attempts = config.execution.retry.max_attempts
  backoff_strategy = config.execution.retry.backoff_strategy
  
  for attempt in range(1, max_attempts + 1):
    try:
      // Add attempt info to chunk metadata
      chunk.metadata.retry.attempt = attempt
      
      output = call_api(chunk, config)
      
      // Validate output
      validation = validate_output(output, chunk, config)
      
      if validation.valid:
        return output
      else:
        // Invalid output, retry
        if attempt < max_attempts:
          log_warning(f"Output validation failed for chunk {chunk.chunk_id}, attempt {attempt}")
          
          // Modify chunk or prompt for retry if needed
          chunk = adjust_chunk_for_retry(chunk, validation)
          
          delay = calculate_backoff_delay(attempt, backoff_strategy, config)
          sleep(delay)
          continue
        else:
          throw ValidationError("Output validation failed after all retries", validation)
    
    catch APIError as e:
      if attempt < max_attempts:
        // Record retry attempt
        chunk.metadata.retry.previous_attempts.append({
          "timestamp": current_timestamp(),
          "error": str(e),
          "retry_reason": classify_error(e)
        })
        
        // Determine if we should retry
        if is_retryable_error(e):
          log_warning(f"Retryable error for chunk {chunk.chunk_id}, attempt {attempt}: {e}")
          
          delay = calculate_backoff_delay(attempt, backoff_strategy, config)
          
          // Add jitter to prevent thundering herd
          delay += random(0, min(1000, delay * 0.1))
          
          sleep(delay)
          continue
        else:
          throw e  // Non-retryable error
      else:
        throw MaxRetriesExceeded("Max retry attempts reached", e)
  
  throw UnexpectedError("Exited retry loop unexpectedly")

function calculate_backoff_delay(attempt, strategy, config):
  base_delay = config.execution.retry.initial_delay_ms
  max_delay = config.execution.retry.max_delay_ms
  
  if strategy == "exponential":
    delay = base_delay * (2 ** (attempt - 1))
  else if strategy == "linear":
    delay = base_delay * attempt
  else if strategy == "constant":
    delay = base_delay
  else:
    delay = base_delay
  
  return min(delay, max_delay)

function is_retryable_error(error):
  // Rate limit errors are retryable
  if error.type in ["rate_limit", "quota_exceeded"]:
    return true
  
  // Temporary server errors are retryable
  if error.status_code in [500, 502, 503, 504]:
    return true
  
  // Timeout errors are retryable
  if error.type == "timeout":
    return true
  
  // Connection errors are retryable
  if error.type in ["connection_error", "network_error"]:
    return true
  
  // Authentication and validation errors are not retryable
  if error.status_code in [401, 403, 400, 422]:
    return false
  
  return false

function adjust_chunk_for_retry(chunk, validation):
  // If output was truncated, try with smaller chunk
  if "truncated" in validation.errors:
    chunk.content = chunk.content[0:int(length(chunk.content) * 0.8)]
    chunk.metadata.retry.adjustment = "reduced_chunk_size"
  
  // If coherence was low, add more context
  if validation.warnings contains "low coherence":
    chunk.context_header = enhance_context_header(chunk)
    chunk.metadata.retry.adjustment = "enhanced_context"
  
  return chunk
```

### Circuit Breaker Pattern

```
class CircuitBreaker:
  function initialize(config):
    this.failure_threshold = 5
    this.timeout_ms = 60000  // 1 minute
    this.state = "closed"  // closed, open, half_open
    this.failure_count = 0
    this.last_failure_time = null
    this.success_count = 0
  
  function call(function_to_call, *args):
    if this.state == "open":
      if this.should_attempt_reset():
        this.state = "half_open"
        this.success_count = 0
      else:
        throw CircuitBreakerError("Circuit breaker is open")
    
    try:
      result = function_to_call(*args)
      this.on_success()
      return result
    
    catch error:
      this.on_failure()
      throw error
  
  function on_success():
    this.failure_count = 0
    
    if this.state == "half_open":
      this.success_count += 1
      
      if this.success_count >= 3:
        this.state = "closed"
        log_info("Circuit breaker closed after successful recovery")
  
  function on_failure():
    this.failure_count += 1
    this.last_failure_time = current_time_ms()
    
    if this.failure_count >= this.failure_threshold:
      this.state = "open"
      log_error("Circuit breaker opened after repeated failures")
  
  function should_attempt_reset():
    if this.last_failure_time:
      time_since_failure = current_time_ms() - this.last_failure_time
      return time_since_failure >= this.timeout_ms
    
    return false
```

---

## Advanced Features

### Streaming Support

```
function process_chunk_streaming(chunk, config, on_token_callback):
  // For APIs that support streaming responses
  
  stream_buffer = ""
  
  response_stream = call_api_stream(chunk, config)
  
  for token in response_stream:
    stream_buffer += token
    
    // Call callback for real-time processing
    on_token_callback(token, stream_buffer)
    
    // Optionally save incremental progress
    if length(stream_buffer) % 1000 == 0:
      save_partial_output(chunk.chunk_id, stream_buffer)
  
  // Create final output chunk
  output = create_output_chunk(stream_buffer, chunk.metadata)
  
  return output
```

### Webhook Notifications

```
function notify_webhook(event_type, data, config):
  if length(config.monitoring.webhooks) == 0:
    return
  
  payload = {
    "event": event_type,
    "timestamp": current_timestamp(),
    "data": data
  }
  
  for webhook_url in config.monitoring.webhooks:
    try:
      http_post(webhook_url, json=payload, timeout=5000)
    catch error:
      log_warning(f"Failed to notify webhook {webhook_url}: {error}")

Event types:
  - "session_started"
  - "chunk_processed"
  - "chunk_failed"
  - "session_completed"
  - "assembly_completed"
  - "error_occurred"
```

### Progressive Output Delivery

```
function deliver_progressive_output(conversation_id, config):
  // Allow retrieving partial results before full assembly
  
  output_chunks = load_output_chunks(conversation_id)
  
  if length(output_chunks) == 0:
    return null
  
  // Sort chunks
  sorted_chunks = sort(output_chunks, key=lambda x: x.metadata.chunk_index)
  
  // Assemble available chunks
  partial_assembly = assemble_outputs(sorted_chunks, config)
  
  // Add progress indicator
  total_expected = sorted_chunks[0].metadata.total_chunks
  current_count = length(sorted_chunks)
  
  result = {
    "content": partial_assembly.content,
    "progress": {
      "chunks_completed": current_count,
      "chunks_total": total_expected,
      "percentage": (current_count / total_expected) * 100,
      "is_complete": current_count == total_expected
    },
    "quality": partial_assembly.quality
  }
  
  return result
```

---

## Implementation Patterns

### Main Orchestrator

```
class ChunkingOrchestrator:
  function initialize(config):
    this.config = config
    this.cost_tracker = CostTracker(config)
    this.performance_monitor = PerformanceMonitor(config)
    this.circuit_breaker = CircuitBreaker(config)
    this.rate_limiter = AdaptiveRateLimiter(config.execution.rate_limit)
  
  function process_document(document, instruction):
    session_id = generate_uuid()
    conversation_id = generate_uuid()
    document_id = generate_uuid()
    
    // Create session
    session = create_session(session_id, this.config)
    
    try:
      // Analyze document
      this.performance_monitor.start_operation(session_id + "_analysis", "analysis")
      analysis = analyze_document(document, this.config)
      this.performance_monitor.end_operation(session_id + "_analysis")
      
      if not analysis.chunking_needed:
        // Single request, no chunking
        result = this.process_single_request(
          document,
          instruction,
          session_id,
          conversation_id,
          document_id
        )
        return result
      
      // Create chunks
      this.performance_monitor.start_operation(session_id + "_chunking", "chunking")
      chunks = create_chunks_hybrid(document, this.config)
      this.performance_monitor.end_operation(session_id + "_chunking")
      
      // Store chunks
      for chunk in chunks:
        store_input_chunk(chunk, session_id, conversation_id)
      
      // Notify webhooks
      notify_webhook("session_started", {
        "session_id": session_id,
        "conversation_id": conversation_id,
        "document_id": document_id,
        "total_chunks": length(chunks),
        "total_tokens": analysis.total_tokens
      }, this.config)
      
      // Process chunks
      this.performance_monitor.start_operation(session_id + "_processing", "processing")
      
      execution_mode = determine_execution_mode(chunks, this.config)
      
      if execution_mode == "sequential":
        outputs = this.process_chunks_sequential(chunks)
      else if execution_mode in ["parallel", "grouped_parallel"]:
        outputs = this.process_chunks_parallel(chunks)
      
      this.performance_monitor.end_operation(session_id + "_processing")
      
      // Assemble outputs
      this.performance_monitor.start_operation(session_id + "_assembly", "assembly")
      final_output = assemble_outputs(outputs, this.config)
      this.performance_monitor.end_operation(session_id + "_assembly")
      
      // Store final output
      store_final_output(final_output, session_id, conversation_id)
      
      // Generate report
      cost_report = this.cost_tracker.get_session_report(session_id)
      perf_report = this.performance_monitor.get_statistics()
      
      // Notify completion
      notify_webhook("session_completed", {
        "session_id": session_id,
        "conversation_id": conversation_id,
        "chunks_processed": length(outputs),
        "cost_report": cost_report,
        "performance": perf_report
      }, this.config)
      
      return {
        "content": final_output.content,
        "metadata": final_output.metadata,
        "quality": final_output.quality,
        "session_id": session_id,
        "conversation_id": conversation_id,
        "cost": cost_report,
        "performance": perf_report
      }
    
    catch error:
      this.handle_session_error(session_id, error)
      throw error
  
  function process_chunks_sequential(chunks):
    outputs = []
    previous_outputs = []
    
    for chunk in chunks:
      // Add context from previous outputs
      chunk.previous_outputs = previous_outputs
      
      // Process with circuit breaker
      output = this.circuit_breaker.call(
        process_chunk_with_retry,
        chunk,
        this.config
      )
      
      // Track cost
      this.cost_tracker.record_chunk_cost(output.metadata)
      
      // Store output
      store_output_chunk(output, chunk.metadata.session_id, chunk.metadata.conversation_id)
      
      outputs.append(output)
      previous_outputs.append(output)
      
      // Notify webhook
      notify_webhook("chunk_processed", {
        "chunk_index": chunk.metadata.chunk_index,
        "total_chunks": chunk.metadata.total_chunks
      }, this.config)
    
    return outputs
  
  function process_chunks_parallel(chunks):
    return process_chunks_parallel(chunks, this.config)
  
  function handle_session_error(session_id, error):
    log_error(f"Session {session_id} failed: {error}")
    
    update_session_status(session_id, "error")
    
    notify_webhook("error_occurred", {
      "session_id": session_id,
      "error": str(error),
      "error_type": error.type
    }, this.config)
```

---

## Testing Strategy

### Comprehensive Test Cases

```
Test Suite 1: Basic Functionality
  - Single chunk document (no chunking)
  - Exact boundary document
  - Multi-chunk with clean boundaries
  - Multi-chunk requiring boundary adjustment
  - Empty document handling
  - Whitespace-only document

Test Suite 2: Token Handling
  - Character vs token counting accuracy
  - Different tokenizer compatibility
  - Emoji and special character handling
  - Multi-byte character handling

Test Suite 3: Context Management
  - Stateless mode
  - Rolling summary mode
  - Full history mode
  - Context overflow handling

Test Suite 4: Parallel Processing
  - Multiple independent documents
  - Mixed sequential and parallel
  - Rate limit handling during parallel
  - Failure handling in parallel mode

Test Suite 5: Error Recovery
  - API timeout retry
  - Rate limit retry
  - Server error retry
  - Non-retryable error handling
  - Circuit breaker activation
  - Partial output recovery

Test Suite 6: Assembly
  - Overlap deduplication
  - Content type detection
  - Discontinuity detection
  - Repetition detection
  - Quality scoring

Test Suite 7: Cost & Performance
  - Cost calculation accuracy
  - Token tracking accuracy
  - Latency measurement
  - Resource usage monitoring

Test Suite 8: Edge Cases
  - Very large documents (1M+ tokens)
  - Very small chunks
  - Malformed content
  - API response variations
  - Network interruptions
```

---

## Deployment Considerations

### Environment Variables

```
Required:
  - CHUNK_BASE_PATH: Base directory for chunk storage
  - API_KEY_{PROVIDER}: API keys for each provider

Optional:
  - CHUNK_SIZE: Default chunk size
  - MAX_PARALLEL: Maximum parallel chunks
  - RATE_LIMIT_RPM: Requests per minute
  - ENABLE_COST_TRACKING: Enable cost tracking
  - ENABLE_PERFORMANCE_MONITORING: Enable performance monitoring
  - WEBHOOK_URL: Notification webhook URL
  - LOG_LEVEL: Logging level
```

### Scaling Recommendations

```
Small Scale (< 100 documents/day):
  - Single instance
  - Local file storage
  - Sequential processing
  - chunk_size: 32000

Medium Scale (100-1000 documents/day):
  - Multiple worker instances
  - Shared storage (NFS, S3)
  - Parallel processing
  - chunk_size: 30000
  - Rate limiting enabled

Large Scale (1000+ documents/day):
  - Distributed worker pool
  - Cloud object storage
  - Queue-based orchestration
  - Adaptive rate limiting
  - chunk_size: 25000
  - Circuit breakers enabled
  - Comprehensive monitoring
```

---

## Migration from v1.0

### Key Changes

1. **Token-based chunking** replaces character-based
2. **Parallel processing** support added
3. **Context management** modes introduced
4. **Adaptive rate limiting** replaces fixed limits
5. **Enhanced validation** and quality checks
6. **Cost tracking** built-in
7. **Circuit breaker** pattern for resilience

### Migration Steps

```
Step 1: Update configuration
  - Add new config parameters
  - Set chunking.strategy to "token"
  - Configure execution.mode

Step 2: Install token counter
  - Add tokenizer library for your model
  - Test token counting accuracy

Step 3: Update storage schema
  - Add new metadata fields
  - Migrate existing chunks if needed

Step 4: Deploy new orchestrator
  - Run in parallel with v1.0 initially
  - Compare results
  - Gradually transition traffic

Step 5: Enable new features
  - Start with sequential mode
  - Test parallel processing
  - Enable cost tracking
  - Enable monitoring
```

---

## Summary

This enhanced specification provides:

- **Token-accurate chunking** for precise API limit management
- **Intelligent context management** for better coherence
- **Parallel processing** for reduced latency
- **Adaptive rate limiting** for optimal throughput
- **Comprehensive monitoring** for cost and performance
- **Robust error recovery** with circuit breakers and smart retries
- **Quality assurance** with validation and coherence checking
- **Progressive delivery** for early access to results

The system remains **model-agnostic** and **implementable as pseudocode**, allowing LLM code agents to adapt it to any tech stack while benefiting from these advanced capabilities.

---

**Version**: 2.0  
**Last Updated**: 2025-10-28  
**Status**: Production Ready
