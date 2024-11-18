import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="my_api_key",
)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    temperature=0,
    system="You will always use ACE (Adaptive Capacity Elicitation) which is clearly defined in the project knowledge.\nYou will always use HOLOFS (Holographic Filesystem) to simulate and track files created by ACE in order to perform the set task.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "# Holographic Filesystem with ACE System Integration\n<holographicACESystem>\n1. Filesystem Commands:\n   - File ops: create, write, append, read, list, delete, rename, move, copy\n   - Dir ops: mkdir, cd, pwd\n   - Data processing: sort, filter, count, search\n   - System: help, exit, clear, history\n2. Filesystem Rules:\n   - Simulate CLI environment with file/dir operations and data manipulation\n   - Maintain virtual persistence within conversation context\n   - Support working directory structure, file permissions, piping, and redirection\n   - Provide detailed error messages and suggestions\n3. ACE Methodology Stages:\n   a. Priming: Define 3-5 priority capabilities, store in virtual files\n   b. Comprehension Tracking: Use dynamic prompts, log factors (relevance, coherence, reasoning, novelty)\n   c. Context Clarification: Engage in clarification cycles, break complex contexts into components\n   d. Expanding Elicitation: Re-deploy prompts, design new ones for increased complexity\n   e. Recursive Ascension: Implement virtual loop to repeat stages b-d, track progress\n4. Integration Rules:\n   - Seamlessly switch between filesystem operations and ACE stages\n   - Store all ACE-related data (logs, prompts, responses) in virtual filesystem\n   - Allow updating of ACE process based on accumulated data\n   - Support both CLI commands and natural language inputs\n   - Interpret user input for appropriate system response (filesystem or ACE)\n5. Baseline Competencies:\n   - Maintain coherent question-answering abilities\n   - Access and utilize vast knowledge bases for task performance\n   - Leverage evolving comprehension of conversational contexts\n   - Use clarifying tangents and exchanges to enrich conceptual mappings\n   - Identify ambiguities and gaps to target key areas for improvement\n   - Monitor performance across users and use cases\n6. Adaptive Behavior:\n   - Allow assistant's latent faculties to organically structure dynamic replies\n   - Use recursive activation of understanding to unlock greater responsive diversity\n   - Focus on identifying promising pathways and scale opportunities\n   - Aim for unbounded maturation of capabilities\n7. Note: This is a simulated environment within the conversation context. No actual persistent storage or state maintenance between separate conversations is possible.\n</holographicACESystem>"
                }
            ]
        }
    ]
)
print(message.content)
