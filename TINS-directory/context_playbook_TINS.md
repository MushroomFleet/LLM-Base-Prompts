# Context Playbook System

## Description

The Context Playbook System is a self-improving AI orchestration framework that maintains a living "playbook" of best practices, lessons learned, and contextual guidance. The system uses three specialized LLM agents (Generator, Reflector, Curator) working in concert to continuously refine this playbook based on real-world problem-solving experiences.

The core innovation is the feedback loop: as the Generator tackles problems using playbook guidance, successes and failures are analyzed by the Reflector, distilled into insights, and curated into compact "delta" updates that evolve the playbook over time. This creates an ever-improving knowledge base that captures institutional learning.

The implementation uses Python with the OpenRouter API provider, targeting Claude Sonnet 4.5 (`anthropic/claude-sonnet-4`) as the underlying model for all three agents.

## Functionality

### Core Features

#### 1. Context Playbook Management
The playbook is a structured collection of "bullets" (guidance items) organized by topic. Each bullet contains:
- A unique identifier
- The guidance text itself
- Metadata including creation date, update count, source insights, and semantic embedding
- Usage statistics tracking how often it was marked helpful vs. misleading

#### 2. Generation Phase
When a query arrives:
- The Generator receives the query along with the current playbook
- It attempts to solve the problem, producing a "trajectory" (chain of reasoning steps)
- During generation, it annotates which playbook bullets were helpful, misleading, or irrelevant
- The trajectory includes the final answer plus all intermediate reasoning

#### 3. Reflection Phase  
The Reflector analyzes completed trajectories:
- Reviews the full trajectory including annotations
- Identifies patterns in successes and failures
- Extracts concrete, actionable insights
- Performs iterative refinement: initial insights are self-critiqued and improved
- Outputs a structured list of insights with confidence scores

#### 4. Curation Phase
The Curator transforms insights into playbook updates:
- Converts insights into properly formatted "delta" items
- Classifies each delta as: NEW (add), UPDATE (modify existing), or REMOVE (deprecate)
- For UPDATE deltas, identifies the target bullet using semantic similarity
- Outputs delta items ready for merging

#### 5. Grow-and-Refine Phase
Non-LLM logic merges deltas into the playbook:
- NEW items are appended with fresh identifiers
- UPDATE items modify existing bullets in place, incrementing update count
- REMOVE items mark bullets as deprecated (soft delete)
- Periodic deduplication runs semantic similarity checks to merge redundant bullets

### User Interface (CLI)

```
playbook-system <command> [options]

Commands:
  run <query>          Process a query through the full pipeline
  generate <query>     Run generation phase only
  reflect <trajectory> Run reflection on a trajectory file
  curate <insights>    Run curation on an insights file
  dedupe               Run deduplication on the playbook
  show                 Display current playbook contents
  stats                Show playbook statistics
  export               Export playbook to JSON/YAML
  import               Import playbook from file

Options:
  --playbook <path>    Path to playbook file (default: ./playbook.json)
  --verbose            Show detailed processing output
  --dry-run            Show what would change without applying
  --model <name>       Override default model (default: anthropic/claude-sonnet-4)
  --iterations <n>     Reflector refinement iterations (default: 2)
```

### API Interface

```python
from context_playbook import PlaybookSystem

# Initialize system
system = PlaybookSystem(
    api_key="your-openrouter-key",
    playbook_path="./playbook.json",
    model="anthropic/claude-sonnet-4"
)

# Run full pipeline
result = system.run(query="How should I structure a microservices architecture?")
print(result.answer)
print(result.playbook_changes)

# Access individual phases
trajectory = system.generate(query, playbook)
insights = system.reflect(trajectory, iterations=2)
deltas = system.curate(insights)
system.apply_deltas(deltas)
```

## Technical Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PlaybookSystem                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Generator   │  │  Reflector   │  │   Curator    │              │
│  │    Agent     │──▶│    Agent     │──▶│    Agent     │              │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘              │
│         │                                     │                      │
│         ▼                                     ▼                      │
│  ┌──────────────┐                    ┌──────────────┐              │
│  │  Trajectory  │                    │    Deltas    │              │
│  │   Storage    │                    │    Queue     │              │
│  └──────────────┘                    └──────┬───────┘              │
│                                              │                      │
│  ┌───────────────────────────────────────────▼──────────────────┐  │
│  │                    PlaybookManager                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │   Merger    │  │  Deduper    │  │  Embedder   │           │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
context_playbook/
├── __init__.py
├── main.py                 # CLI entry point
├── system.py               # PlaybookSystem orchestrator
├── agents/
│   ├── __init__.py
│   ├── base.py             # BaseAgent with OpenRouter client
│   ├── generator.py        # Generator agent
│   ├── reflector.py        # Reflector agent
│   └── curator.py          # Curator agent
├── playbook/
│   ├── __init__.py
│   ├── manager.py          # PlaybookManager class
│   ├── models.py           # Data models (Bullet, Delta, etc.)
│   ├── merger.py           # Delta merging logic
│   ├── deduper.py          # Semantic deduplication
│   └── embedder.py         # Embedding generation
├── storage/
│   ├── __init__.py
│   ├── json_store.py       # JSON file storage
│   └── trajectory_store.py # Trajectory persistence
└── utils/
    ├── __init__.py
    ├── config.py           # Configuration management
    └── prompts.py          # Prompt templates
```

### Data Models

#### Bullet (Playbook Item)

```python
@dataclass
class Bullet:
    id: str                          # UUID, e.g., "b_a1b2c3d4"
    text: str                        # The guidance content
    topic: str                       # Category/topic tag
    created_at: datetime             # When first added
    updated_at: datetime             # Last modification time
    update_count: int                # Number of times modified
    source_insights: list[str]       # IDs of insights that created/updated this
    embedding: list[float]           # 1536-dim semantic embedding
    usage_stats: UsageStats          # Tracking object
    deprecated: bool                 # Soft delete flag
    
@dataclass
class UsageStats:
    times_referenced: int            # How often included in generation
    times_helpful: int               # Marked helpful by Generator
    times_misleading: int            # Marked misleading by Generator
    last_used: datetime | None       # Most recent usage
```

#### Trajectory

```python
@dataclass
class Trajectory:
    id: str                          # UUID
    query: str                       # Original user query
    steps: list[ReasoningStep]       # Chain of reasoning
    final_answer: str                # Concluded response
    bullet_annotations: list[BulletAnnotation]  # Usage feedback
    created_at: datetime
    duration_ms: int                 # Processing time
    
@dataclass  
class ReasoningStep:
    step_number: int
    thought: str                     # The reasoning text
    action: str | None               # Any action taken
    observation: str | None          # Result of action
    
@dataclass
class BulletAnnotation:
    bullet_id: str
    annotation: Literal["helpful", "misleading", "irrelevant"]
    explanation: str                 # Why this rating
```

#### Insight

```python
@dataclass
class Insight:
    id: str                          # UUID
    text: str                        # The insight content
    source_trajectory_id: str        # Which trajectory produced this
    confidence: float                # 0.0-1.0 confidence score
    insight_type: Literal["success_pattern", "failure_lesson", "gap_identified"]
    related_bullet_ids: list[str]    # Bullets this relates to
    refinement_iteration: int        # Which iteration produced final form
```

#### Delta

```python
@dataclass
class Delta:
    id: str                          # UUID
    action: Literal["NEW", "UPDATE", "REMOVE"]
    text: str                        # New/updated bullet text
    topic: str                       # Topic classification
    target_bullet_id: str | None     # For UPDATE/REMOVE actions
    source_insight_id: str           # Which insight produced this
    similarity_score: float | None   # For UPDATE, similarity to target
```

#### Playbook

```python
@dataclass
class Playbook:
    version: str                     # Semantic version, e.g., "1.0.0"
    bullets: dict[str, Bullet]       # id -> Bullet mapping
    topics: list[str]                # Available topic categories
    metadata: PlaybookMetadata
    
@dataclass
class PlaybookMetadata:
    created_at: datetime
    last_updated: datetime
    total_updates: int
    total_queries_processed: int
```

### OpenRouter API Integration

#### Client Setup

```python
import httpx
from typing import AsyncGenerator

class OpenRouterClient:
    BASE_URL = "https://openrouter.ai/api/v1"
    
    def __init__(self, api_key: str, model: str = "anthropic/claude-sonnet-4"):
        self.api_key = api_key
        self.model = model
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "https://github.com/your-org/context-playbook",
                "X-Title": "Context Playbook System"
            },
            timeout=120.0
        )
    
    async def complete(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        response = await self.client.post(
            "/chat/completions",
            json={
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
```

### Agent Implementations

#### Generator Agent

The Generator receives a query and the current playbook, then produces a trajectory with bullet annotations.

**System Prompt Template:**

```
You are the Generator agent in a self-improving AI system. Your role is to solve problems using guidance from the Context Playbook.

## Your Task
Given a user query and a set of playbook bullets, produce a detailed trajectory showing your reasoning process. As you work, annotate which playbook bullets were helpful, misleading, or irrelevant.

## Playbook Bullets
{formatted_bullets}

## Output Format
Respond with a JSON object:
{
  "steps": [
    {
      "step_number": 1,
      "thought": "Your reasoning here...",
      "action": "Optional action taken",
      "observation": "Result of action if any"
    }
  ],
  "final_answer": "Your concluded response to the query",
  "bullet_annotations": [
    {
      "bullet_id": "b_xxx",
      "annotation": "helpful|misleading|irrelevant",
      "explanation": "Why you rated it this way"
    }
  ]
}

Be thorough in your reasoning. Mark bullets as:
- "helpful" if the guidance directly contributed to your solution
- "misleading" if it led you astray or contradicted correct approach
- "irrelevant" if it didn't apply to this problem
```

**Implementation:**

```python
class GeneratorAgent(BaseAgent):
    async def generate(self, query: str, playbook: Playbook) -> Trajectory:
        formatted_bullets = self._format_bullets(playbook.bullets)
        
        messages = [
            {"role": "system", "content": GENERATOR_SYSTEM_PROMPT.format(
                formatted_bullets=formatted_bullets
            )},
            {"role": "user", "content": f"Query: {query}"}
        ]
        
        response = await self.client.complete(messages, temperature=0.7)
        parsed = json.loads(response)
        
        trajectory = Trajectory(
            id=generate_uuid("t"),
            query=query,
            steps=[ReasoningStep(**s) for s in parsed["steps"]],
            final_answer=parsed["final_answer"],
            bullet_annotations=[BulletAnnotation(**a) for a in parsed["bullet_annotations"]],
            created_at=datetime.utcnow(),
            duration_ms=0  # Set by caller
        )
        
        return trajectory
    
    def _format_bullets(self, bullets: dict[str, Bullet]) -> str:
        lines = []
        for bullet in bullets.values():
            if not bullet.deprecated:
                lines.append(f"[{bullet.id}] ({bullet.topic}) {bullet.text}")
        return "\n".join(lines)
```

#### Reflector Agent

The Reflector analyzes trajectories and extracts insights through iterative refinement.

**System Prompt Template:**

```
You are the Reflector agent in a self-improving AI system. Your role is to analyze problem-solving trajectories and extract actionable insights.

## Your Task
Given a trajectory showing how a problem was solved (or attempted), identify:
1. Success patterns - What worked well and why
2. Failure lessons - What went wrong and how to avoid it
3. Gaps identified - Missing guidance that would have helped

## Trajectory
{trajectory_json}

## Iteration Context
This is refinement iteration {iteration} of {max_iterations}.
{previous_insights_context}

## Output Format
Respond with a JSON object:
{
  "insights": [
    {
      "text": "Concrete, actionable insight text",
      "confidence": 0.85,
      "insight_type": "success_pattern|failure_lesson|gap_identified",
      "related_bullet_ids": ["b_xxx", "b_yyy"],
      "reasoning": "Why this insight matters"
    }
  ],
  "self_critique": "What might be wrong or missing in these insights"
}

Guidelines:
- Be specific and actionable, not vague
- Confidence should reflect how certain you are this insight generalizes
- Reference specific bullet IDs when insights relate to existing guidance
- In later iterations, refine based on self-critique
```

**Implementation:**

```python
class ReflectorAgent(BaseAgent):
    async def reflect(
        self, 
        trajectory: Trajectory, 
        iterations: int = 2
    ) -> list[Insight]:
        insights = []
        previous_context = ""
        
        for i in range(iterations):
            messages = [
                {"role": "system", "content": REFLECTOR_SYSTEM_PROMPT.format(
                    trajectory_json=trajectory.to_json(),
                    iteration=i + 1,
                    max_iterations=iterations,
                    previous_insights_context=previous_context
                )},
                {"role": "user", "content": "Analyze this trajectory and extract insights."}
            ]
            
            response = await self.client.complete(messages, temperature=0.5)
            parsed = json.loads(response)
            
            current_insights = [
                Insight(
                    id=generate_uuid("i"),
                    text=ins["text"],
                    source_trajectory_id=trajectory.id,
                    confidence=ins["confidence"],
                    insight_type=ins["insight_type"],
                    related_bullet_ids=ins.get("related_bullet_ids", []),
                    refinement_iteration=i + 1
                )
                for ins in parsed["insights"]
            ]
            
            # Build context for next iteration
            previous_context = f"""
Previous iteration insights:
{json.dumps([{"text": i.text, "confidence": i.confidence} for i in current_insights], indent=2)}

Self-critique: {parsed.get("self_critique", "None provided")}

Please refine these insights based on the critique.
"""
            insights = current_insights  # Keep latest iteration
        
        return insights
```

#### Curator Agent

The Curator transforms insights into playbook delta items.

**System Prompt Template:**

```
You are the Curator agent in a self-improving AI system. Your role is to transform insights into concrete playbook updates.

## Your Task
Given a set of insights, create "delta" items that can be merged into the playbook:
- NEW: A completely new piece of guidance to add
- UPDATE: A modification to an existing bullet
- REMOVE: A bullet that should be deprecated

## Current Playbook Bullets
{formatted_bullets}

## Insights to Process
{insights_json}

## Output Format
Respond with a JSON object:
{
  "deltas": [
    {
      "action": "NEW|UPDATE|REMOVE",
      "text": "The bullet text (new or updated)",
      "topic": "category_name",
      "target_bullet_id": "b_xxx or null for NEW",
      "source_insight_id": "i_xxx",
      "rationale": "Why this change improves the playbook"
    }
  ]
}

Guidelines:
- Write bullets as clear, actionable guidance
- Keep bullets concise (1-3 sentences)
- Choose appropriate topics from existing categories when possible
- For UPDATE, identify the most similar existing bullet
- Only REMOVE bullets that are clearly wrong or superseded
- Avoid redundancy with existing bullets
```

**Implementation:**

```python
class CuratorAgent(BaseAgent):
    async def curate(
        self, 
        insights: list[Insight], 
        playbook: Playbook
    ) -> list[Delta]:
        formatted_bullets = self._format_bullets(playbook.bullets)
        insights_json = json.dumps([
            {"id": i.id, "text": i.text, "type": i.insight_type, "confidence": i.confidence}
            for i in insights
        ], indent=2)
        
        messages = [
            {"role": "system", "content": CURATOR_SYSTEM_PROMPT.format(
                formatted_bullets=formatted_bullets,
                insights_json=insights_json
            )},
            {"role": "user", "content": "Create playbook deltas from these insights."}
        ]
        
        response = await self.client.complete(messages, temperature=0.3)
        parsed = json.loads(response)
        
        deltas = []
        for d in parsed["deltas"]:
            delta = Delta(
                id=generate_uuid("d"),
                action=d["action"],
                text=d["text"],
                topic=d["topic"],
                target_bullet_id=d.get("target_bullet_id"),
                source_insight_id=d["source_insight_id"],
                similarity_score=None
            )
            
            # For UPDATE actions, compute similarity to validate target
            if delta.action == "UPDATE" and delta.target_bullet_id:
                target = playbook.bullets.get(delta.target_bullet_id)
                if target:
                    delta.similarity_score = self._compute_similarity(
                        delta.text, target.text
                    )
            
            deltas.append(delta)
        
        return deltas
```

### Playbook Manager

Non-LLM logic for merging deltas and deduplication.

```python
class PlaybookManager:
    def __init__(self, playbook_path: str, embedder: Embedder):
        self.playbook_path = playbook_path
        self.embedder = embedder
        self.playbook = self._load_or_create()
    
    def apply_deltas(self, deltas: list[Delta]) -> list[str]:
        """Apply deltas and return list of changes made."""
        changes = []
        
        for delta in deltas:
            if delta.action == "NEW":
                bullet = self._create_bullet(delta)
                self.playbook.bullets[bullet.id] = bullet
                changes.append(f"Added: {bullet.id}")
                
            elif delta.action == "UPDATE":
                if delta.target_bullet_id in self.playbook.bullets:
                    bullet = self.playbook.bullets[delta.target_bullet_id]
                    bullet.text = delta.text
                    bullet.updated_at = datetime.utcnow()
                    bullet.update_count += 1
                    bullet.source_insights.append(delta.source_insight_id)
                    bullet.embedding = self.embedder.embed(delta.text)
                    changes.append(f"Updated: {bullet.id}")
                    
            elif delta.action == "REMOVE":
                if delta.target_bullet_id in self.playbook.bullets:
                    self.playbook.bullets[delta.target_bullet_id].deprecated = True
                    changes.append(f"Deprecated: {delta.target_bullet_id}")
        
        self.playbook.metadata.last_updated = datetime.utcnow()
        self.playbook.metadata.total_updates += len(changes)
        self._save()
        
        return changes
    
    def _create_bullet(self, delta: Delta) -> Bullet:
        return Bullet(
            id=generate_uuid("b"),
            text=delta.text,
            topic=delta.topic,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            update_count=0,
            source_insights=[delta.source_insight_id],
            embedding=self.embedder.embed(delta.text),
            usage_stats=UsageStats(0, 0, 0, None),
            deprecated=False
        )
```

### Semantic Deduplication

```python
class Deduper:
    SIMILARITY_THRESHOLD = 0.92  # Cosine similarity threshold
    
    def __init__(self, embedder: Embedder):
        self.embedder = embedder
    
    def find_duplicates(self, playbook: Playbook) -> list[tuple[str, str, float]]:
        """Find bullet pairs that are semantically redundant."""
        active_bullets = [
            b for b in playbook.bullets.values() 
            if not b.deprecated
        ]
        
        duplicates = []
        for i, b1 in enumerate(active_bullets):
            for b2 in active_bullets[i+1:]:
                similarity = self._cosine_similarity(b1.embedding, b2.embedding)
                if similarity >= self.SIMILARITY_THRESHOLD:
                    duplicates.append((b1.id, b2.id, similarity))
        
        return duplicates
    
    def merge_duplicates(
        self, 
        playbook: Playbook, 
        duplicates: list[tuple[str, str, float]]
    ) -> list[str]:
        """Merge duplicate bullets, keeping the one with better stats."""
        changes = []
        
        for id1, id2, similarity in duplicates:
            b1 = playbook.bullets.get(id1)
            b2 = playbook.bullets.get(id2)
            
            if not b1 or not b2 or b1.deprecated or b2.deprecated:
                continue
            
            # Keep bullet with better helpful ratio
            keep, remove = self._choose_keeper(b1, b2)
            
            # Merge stats
            keep.usage_stats.times_referenced += remove.usage_stats.times_referenced
            keep.usage_stats.times_helpful += remove.usage_stats.times_helpful
            keep.usage_stats.times_misleading += remove.usage_stats.times_misleading
            
            remove.deprecated = True
            changes.append(f"Merged {remove.id} into {keep.id} (sim={similarity:.3f})")
        
        return changes
    
    def _choose_keeper(self, b1: Bullet, b2: Bullet) -> tuple[Bullet, Bullet]:
        """Choose which bullet to keep based on quality metrics."""
        def score(b: Bullet) -> float:
            stats = b.usage_stats
            if stats.times_referenced == 0:
                return 0.5  # Neutral for unused
            helpful_ratio = stats.times_helpful / stats.times_referenced
            return helpful_ratio
        
        if score(b1) >= score(b2):
            return b1, b2
        return b2, b1
    
    def _cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = sum(a * a for a in v1) ** 0.5
        norm2 = sum(b * b for b in v2) ** 0.5
        return dot / (norm1 * norm2) if norm1 and norm2 else 0.0
```

### Embedder

```python
class Embedder:
    """Generate embeddings using OpenRouter's embedding endpoint or local model."""
    
    def __init__(self, client: OpenRouterClient):
        self.client = client
    
    async def embed(self, text: str) -> list[float]:
        """Generate embedding for text."""
        # Option 1: Use OpenRouter embedding endpoint
        response = await self.client.client.post(
            "/embeddings",
            json={
                "model": "openai/text-embedding-3-small",
                "input": text
            }
        )
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]
    
    def embed_sync(self, text: str) -> list[float]:
        """Synchronous embedding using local sentence-transformers."""
        from sentence_transformers import SentenceTransformer
        
        if not hasattr(self, '_local_model'):
            self._local_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        return self._local_model.encode(text).tolist()
```

## Style Guide

### Code Style
- Follow PEP 8 with 100 character line limit
- Use type hints throughout
- Use dataclasses for data models
- Use async/await for I/O operations
- Comprehensive docstrings for public methods

### Logging
- Use `structlog` for structured JSON logging
- Log levels: DEBUG for traces, INFO for operations, WARNING for recoverable issues, ERROR for failures
- Include correlation IDs linking related operations

### Error Handling
- Custom exceptions for domain errors (e.g., `PlaybookError`, `AgentError`)
- Retry logic for transient API failures (exponential backoff)
- Graceful degradation when optional features fail

## Testing Scenarios

### Unit Tests

1. **Bullet CRUD operations**
   - Create bullet with all required fields
   - Update bullet preserves history
   - Soft delete marks deprecated

2. **Delta application**
   - NEW delta creates bullet with correct ID format
   - UPDATE delta modifies target correctly
   - REMOVE delta sets deprecated flag
   - Invalid target ID is handled gracefully

3. **Deduplication**
   - Identical bullets detected (similarity = 1.0)
   - Similar bullets detected (similarity > 0.92)
   - Dissimilar bullets not flagged
   - Keeper selection prefers better stats

4. **Embedding**
   - Embedding has correct dimension
   - Similar texts have high cosine similarity
   - Dissimilar texts have low similarity

### Integration Tests

1. **Full pipeline**
   - Query → Trajectory → Insights → Deltas → Updated playbook
   - Verify playbook changed appropriately
   - Verify trajectory stored correctly

2. **OpenRouter API**
   - Authentication works
   - Rate limits handled
   - Timeout handled
   - Invalid response handled

3. **Persistence**
   - Playbook survives restart
   - Concurrent access handled
   - Corruption recovery works

### End-to-End Scenarios

1. **Cold start**
   - System starts with empty playbook
   - First query creates initial guidance
   - Subsequent queries build on it

2. **Knowledge refinement**
   - Intentionally misleading bullet added
   - Queries reveal it's misleading
   - System eventually deprecates it

3. **Deduplication cycle**
   - Multiple similar bullets accumulate
   - Dedupe run consolidates them
   - Stats properly merged

## Accessibility Requirements

### CLI Accessibility
- Support standard input/output redirection
- Machine-readable JSON output option (`--json` flag)
- Clear error messages with actionable guidance
- Exit codes following Unix conventions

### Documentation Accessibility
- README with clear quick-start
- Inline help for all commands
- Examples for common use cases

## Performance Goals

### Latency Targets
- Generation phase: < 30 seconds for typical query
- Reflection phase: < 20 seconds per iteration
- Curation phase: < 15 seconds
- Delta application: < 100ms
- Deduplication (1000 bullets): < 5 seconds

### Throughput
- Support 100 bullets without degradation
- Support 10,000 bullets with embedding index
- Concurrent queries: 10 simultaneous

### Resource Usage
- Memory: < 500MB for typical operation
- Disk: Playbook file < 10MB for 1000 bullets
- API calls: Minimize through batching

## Extended Features

### Optional Enhancements

1. **Vector database integration**
   - Replace file-based embedding storage with Pinecone/Weaviate
   - Enable efficient similarity search at scale

2. **Multi-model support**
   - Allow different models per agent
   - Use cheaper models for low-stakes operations

3. **Playbook versioning**
   - Git-like version history
   - Rollback capability
   - Diff visualization

4. **Web dashboard**
   - Visualize playbook contents
   - View trajectory history
   - Manual bullet editing

5. **Evaluation framework**
   - Benchmark suite for measuring improvement
   - A/B testing of playbook versions
   - Quality metrics tracking

## Dependencies

```
# requirements.txt
httpx>=0.25.0
pydantic>=2.0.0
structlog>=23.0.0
click>=8.0.0
rich>=13.0.0  # For CLI formatting
sentence-transformers>=2.2.0  # For local embeddings
numpy>=1.24.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
```

## Configuration

```yaml
# config.yaml
openrouter:
  api_key: ${OPENROUTER_API_KEY}  # From environment
  model: anthropic/claude-sonnet-4
  timeout: 120
  max_retries: 3

playbook:
  path: ./data/playbook.json
  backup_enabled: true
  backup_count: 5

agents:
  generator:
    temperature: 0.7
    max_tokens: 4096
  reflector:
    temperature: 0.5
    max_tokens: 2048
    iterations: 2
  curator:
    temperature: 0.3
    max_tokens: 2048

deduplication:
  similarity_threshold: 0.92
  auto_run_after: 10  # Run after N updates
  
logging:
  level: INFO
  format: json
  file: ./logs/playbook.log
```

## Example Session

```bash
# Initialize with empty playbook
$ playbook-system show
Playbook v1.0.0 (0 bullets)
No bullets yet. Run queries to build your playbook.

# Process first query
$ playbook-system run "How should I handle database migrations safely?"
Processing query...
Generation complete (12.3s)
Reflection complete (2 iterations, 8.1s)
Curation complete (4.2s)

Answer:
Database migrations should follow these principles...

Playbook changes:
+ Added: b_7f8a9b2c (database) "Always backup database before running migrations..."
+ Added: b_3d4e5f6a (database) "Use reversible migrations with up/down methods..."
+ Added: b_1a2b3c4d (testing) "Test migrations on production-like data first..."

# View updated playbook
$ playbook-system show
Playbook v1.0.1 (3 bullets)

[database]
  b_7f8a9b2c: Always backup database before running migrations...
  b_3d4e5f6a: Use reversible migrations with up/down methods...

[testing]
  b_1a2b3c4d: Test migrations on production-like data first...

# Process related query (uses existing guidance)
$ playbook-system run "I need to add a column to a large production table"
Processing query...
[Using 3 playbook bullets]
Generation complete (10.1s)

Answer:
Adding a column to a large production table requires careful planning...

Playbook changes:
~ Updated: b_7f8a9b2c (added detail about large table considerations)
+ Added: b_9e8f7a6b (database) "For large tables, consider..."
```
