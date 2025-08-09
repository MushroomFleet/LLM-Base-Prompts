# ENH Prompt Enhancement System

Transform simple inputs into professional, detailed prompts for AI image and video generation, specifically aligned with pre-trained LoRA models.

## Overview

This repository contains a comprehensive collection of enhancement templates designed to elevate basic prompts into rich, detailed descriptions that maximize the potential of AI image/video generation models. The system provides clean base templates that can be customized using Large Language Models (LLMs) to align with specific LoRA training data and aesthetic requirements.

## System Architecture

### Base Templates
The foundation consists of four core enhancement systems:

- **`t2i-base-ENH.md`** - Text-to-Image enhancement (80-100 words)
- **`i2i-base-ENH.md`** - Image-to-Image enhancement (200-500 words)  
- **`t2v-base-ENH.md`** - Text-to-Video enhancement (90-120 words)
- **`i2v-temporal-base-ENH.md`** - Image-to-Video enhancement (200-500 words)

### LoRA-Specific Adaptations
Pre-customized templates in the `LORAs/` directory demonstrate how base templates can be adapted for specific aesthetic styles:

- **S0C13TY Style**: Cyberpunk/sci-fi aesthetic with advanced armor and futuristic environments
- **TH0RR4 Style**: Anime sci-fi featuring red-haired protagonist in tactical scenarios
- **SH4R0NA Style**: Additional character-specific adaptations

### Specialized Variants
Multiple variants for different compositional needs:
- Closeup shots (`*-closeup.md`)
- Establishing shots (`*-establishing.md`)
- Poster compositions (`*-poster.md`)
- Dynamic action (`*-dynamic.md`)
- Epic scenes (`*-epic.md`)

## Usage Instructions

### Step 1: Select Base Template
Choose the appropriate base template for your generation type:
- Use `t2i-base-ENH.md` for creating images from text descriptions
- Use `i2i-base-ENH.md` for modifying existing images
- Use `t2v-base-ENH.md` for generating videos from text
- Use `i2v-temporal-base-ENH.md` for animating static images

### Step 2: Customize with LLM
1. Load the chosen base template as a system prompt in your preferred LLM
2. Provide additional instructions specific to your LoRA or artistic requirements
3. Include example prompts that demonstrate your desired aesthetic
4. Specify any technical constraints or style preferences

### Step 3: Generate Enhanced Prompts
Input your simple prompts into the LLM system and receive professionally enhanced descriptions optimized for your specific model and aesthetic requirements.

### Step 4: Save Customized Templates
Save your customized enhancement systems as new `.md` files for consistent results across sessions.

## Customization Guidelines

### For New LoRA Adaptations
When creating adaptations for new LoRA models:

1. **Analyze LoRA Training Data**: Understand the visual style, subjects, and aesthetic elements
2. **Modify Core Elements**: Update character descriptions, environmental settings, and style specifications
3. **Preserve Structure**: Maintain the enhancement process and output format requirements
4. **Add Specific Examples**: Include examples that demonstrate the LoRA's unique characteristics
5. **Test and Refine**: Generate sample outputs and adjust the template based on results

### Key Customization Areas
- **Character Specifications**: Appearance, clothing, expressions, poses
- **Environmental Settings**: Backgrounds, lighting, atmospheric conditions
- **Style Mandates**: Art style, rendering quality, technical specifications
- **Color Palettes**: Dominant colors, accent hues, lighting temperatures
- **Compositional Elements**: Framing, perspective, camera angles

## Example Transformations

### Basic Input → Enhanced Output

**Simple**: "A girl by the water"

**Enhanced (Base)**: "Professional portrait photography, young East Asian woman with long dark braids sitting beside a tranquil lake. She wears a flowing white cotton dress with delicate embroidered details. Soft natural lighting creates gentle shadows across her serene expression as she gazes thoughtfully toward the camera. Background features beautifully blurred water with distant mountains. Shot with shallow depth of field, 85mm lens equivalent. Warm golden hour lighting with subtle film grain texture. Medium shot composition with rule of thirds framing."

**Enhanced (S0C13TY)**: "Cinematic tracking shot of a cyber samurai in intricate mechanical armor walking purposefully across a barren alien landscape. Advanced helmet with glowing red visor reflects the orange-hued sky dominated by twin moons. Complex exoskeleton features exposed wiring, pneumatic joints, and tactical displays that pulse with data. Camera follows from a low angle, emphasizing the figure's imposing silhouette against floating industrial structures in the distance."

## File Organization

```
ENH-prompts/
├── README.md                     # This file
├── t2i-base-ENH.md              # Text-to-Image base template
├── i2i-base-ENH.md              # Image-to-Image base template  
├── t2v-base-ENH.md              # Text-to-Video base template
├── i2v-temporal-base-ENH.md     # Image-to-Video base template
└── LORAs/                       # LoRA-specific adaptations
    ├── t2i-S0C13TY-ENH*.md     # S0C13TY style variants
    ├── t2i-TH0RR4-ENH*.md      # TH0RR4 style variants
    └── i2i-SH4R0NA*.md         # SH4R0NA style variants
```

## Best Practices

### Template Selection
- **Text-to-Image**: Use for creating new images from descriptions
- **Image-to-Image**: Use when modifying or enhancing existing images
- **Text-to-Video**: Use for generating video content from text descriptions
- **Image-to-Video**: Use for animating static images with motion

### Enhancement Quality
- Maintain the target word count for optimal results
- Include specific technical details (camera settings, lighting, composition)
- Preserve original user intent while adding professional depth
- Use appropriate terminology for the chosen medium (photography, animation, etc.)

### Customization Approach
- Start with base templates before creating specialized versions
- Test enhancements with your target model before finalizing templates
- Document successful modifications for future reference
- Create variant templates for different compositional needs

## Technical Requirements

### LLM Integration
- Compatible with any Large Language Model that supports system prompts
- Recommended models: GPT-4, Claude, or other advanced language models
- Ensure sufficient context window for template content and examples

### Output Format
- Single-line paragraph format (no special characters or formatting)
- Professional terminology appropriate to the generation medium
- Consistent style and quality descriptors
- Preservation of original user intent

## Contributing

When creating new LoRA adaptations:
1. Follow the established naming convention: `[type]-[LORA-NAME]-ENH-[variant].md`
2. Maintain the core structure while adapting content
3. Include comprehensive examples demonstrating the style
4. Test with actual generation models before submitting
5. Document any specific technical requirements or constraints

This system enables consistent, professional-quality prompt enhancement tailored to specific artistic styles and technical requirements, maximizing the potential of modern AI generation models.
