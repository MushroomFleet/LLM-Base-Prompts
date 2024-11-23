# Video PromptGen with ACE-HOLOFS
![Working-Confirmed](https://github.com/MushroomFleet/LLM-Base-Prompts/blob/main/LTXV-PromptGen/images/cognimus-confirmed.png)

## Overview
Video PromptGen is an advanced prompt engineering framework designed to generate high-quality, structured video scene descriptions using Claude's capabilities enhanced by the ACE-HOLOFS system. This framework combines Adaptive Capacity Elicitation (ACE) for cognitive enhancement with a Holographic Filesystem (HOLOFS) for organized result management.

## 🌟 Key Features
- Structured prompt generation for video scenes
- Token-optimized outputs (250 token maximum)
- Template-based pattern matching
- Cognitive enhancement via ACE framework
- Organized result management via HOLOFS
- Quality assurance and validation pipeline
- Automated error recovery

## 📁 Project Structure
**Note:** This is the holographic filesystem structure; You may use a flat file setup in the Claude Projects UI, the project-manifest.md will dynamically map the files and project a new structure with each new conversation matching the structure below.
```
video_promptgen/
├── system/
│   ├── core/
│   │   └── ACEHOLOFS-V3.txt
│   └── project-manifest.md
├── config/
│   ├── system/
│   │   └── video-prompt-system.md
│   └── project/
│       └── project-instructions.md
├── templates/
│   └── master/
│       └── LTXV-video-full-examples.txt
└── custom-instructions.md
```

## 🚀 Getting Started

### Prerequisites
- Access to Claude AI (Claude 3)
- Claude Projects feature enabled
- Basic understanding of prompt engineering

### Setup Instructions

1. **Create New Project**
   - Open Claude
   - Create new project named "Video PromptGen"
   - Navigate to project settings

2. **Upload Project Files**
   ```
   Required files:
   - custom-instructions.md (as Custom Instructions)
   - project-manifest.md
   - video-prompt-system.md
   - project-instructions.md
   - ACEHOLOFS-V3.txt
   - LTXV-video-full-examples.txt
   ```

3. **Configure Custom Instructions**
   - Copy contents of `custom-instructions.md` to project's Custom Instructions
   - Save and verify configuration

4. **Verify System**
   - Start new conversation
   - Run system verification command:
   ```
   holofs --verify-all
   ```

## 💡 Usage Guide

### Basic Prompt Generation
```
Example command:
"Generate a video scene prompt for a person walking through a city at night"
```

### Advanced Usage
1. **Specific Scene Requirements**
   ```
   "Generate a prompt for:
   - Scene type: real-life footage
   - Setting: urban environment
   - Lighting: night time
   - Camera: tracking shot"
   ```

2. **Template Matching**
   ```
   "Generate a prompt matching LTXV pattern for:
   [your scene description]"
   ```

3. **Token Optimization**
   ```
   "Generate a prompt optimized for tokens:
   Target: 200 tokens
   Scene: [your description]"
   ```

## 🔍 Framework Components

### ACE (Adaptive Capacity Elicitation)
- Enhances cognitive processing
- Maintains structural integrity
- Ensures pattern compliance
- Optimizes token distribution

### HOLOFS (Holographic Filesystem)
- Organizes generated prompts
- Tracks system state
- Maintains version control
- Enables result persistence

## 🛠️ Advanced Features

### Token Distribution
```yaml
Optimal Distribution:
- Subject descriptions: 20-40 tokens
- Action sequences: 30-50 tokens
- Technical details: 20-30 tokens
- Atmospheric elements: 15-25 tokens
- Scene context: 10-15 tokens
```

### Quality Metrics
- Structure adherence
- Token optimization
- Pattern matching
- Information density
- Technical precision

## 📋 Best Practices

1. **Always Start With**:
   - Clear scene objective
   - Specific technical requirements
   - Desired outcomes

2. **Maintain**:
   - Token awareness
   - Structure compliance
   - Template alignment

3. **Regularly Check**:
   - System status
   - Generated results
   - Quality metrics

## 🚨 Troubleshooting

Common Issues:
1. **Token Overflow**
   - Solution: Use optimization commands
   ```
   optimize-density path/to/prompt.txt
   ```

2. **Structure Mismatch**
   - Solution: Verify template alignment
   ```
   template-verify --source LTXV
   ```

3. **System State Issues**
   - Solution: Run repair sequence
   ```
   repair-structure --auto
   ```

## 📚 Resources

- [ACE-HOLOFS Documentation](#)
- [Video Prompt Engineering Guide](#)
- [Template Pattern Reference](#)
- [Token Optimization Strategies](#)
(WIP)

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## 🙏 Acknowledgments

- ACE-HOLOFS framework developers
- LTXV template system creators
- Claude AI team at Anthropic
- Contributing community members

---

For additional support or questions, please open an issue in the repository.
