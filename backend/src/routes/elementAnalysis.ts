import express from 'express';
import { ChatService } from '../services/chatService';

const router = express.Router();
const chatService = new ChatService();

// Analyze element for tooltip content
router.post('/analyze-element', async (req, res) => {
  try {
    const { element, url, timestamp } = req.body;

    if (!element) {
      return res.status(400).json({
        success: false,
        message: 'Element data is required'
      });
    }

    // Extract element information
    const elementInfo = {
      tag: element.tag,
      text: element.text,
      attributes: element.attributes,
      coordinates: element.coordinates,
      url: url || element.url
    };

    // Generate AI-powered tooltip content
    const tooltipContent = await generateTooltipContent(elementInfo);

    res.json({
      success: true,
      data: {
        tooltip: tooltipContent.content,
        confidence: tooltipContent.confidence,
        source: 'ai-analysis',
        element: elementInfo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Element analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze element',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function generateTooltipContent(elementInfo: any) {
  try {
    // Create a context-aware prompt for the AI
    const prompt = createAnalysisPrompt(elementInfo);
    
    // Get AI response
    const response = await chatService.generateResponse(prompt);
    
    // Parse the AI response to extract tooltip content and confidence
    const parsedResponse = parseAIResponse(response.content);
    
    return {
      content: parsedResponse.content,
      confidence: parsedResponse.confidence
    };

  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Fallback to rule-based tooltip generation
    return generateFallbackTooltip(elementInfo);
  }
}

function createAnalysisPrompt(elementInfo: any): string {
  const { tag, text, attributes, url } = elementInfo;
  
  return `Analyze this web element and provide a helpful tooltip description:

Element Details:
- Tag: ${tag}
- Text: "${text || 'No text content'}"
- Attributes: ${JSON.stringify(attributes, null, 2)}
- URL: ${url}

Please provide:
1. A concise, helpful tooltip description (max 100 characters)
2. A confidence score (0.0 to 1.0) based on how clear the element's purpose is

Format your response as JSON:
{
  "content": "Your tooltip text here",
  "confidence": 0.8
}

Focus on:
- What the element does (button, link, form control, etc.)
- Its purpose or destination if it's a link
- Any important warnings or information
- Keep it user-friendly and concise`;
}

function parseAIResponse(response: string): { content: string; confidence: number } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        content: parsed.content || 'Interactive element',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON:', error);
  }

  // Fallback: extract content from the response
  const lines = response.split('\n').filter(line => line.trim());
  const content = lines[0]?.trim() || 'Interactive element';
  
  return {
    content: content.length > 100 ? content.substring(0, 97) + '...' : content,
    confidence: 0.6
  };
}

function generateFallbackTooltip(elementInfo: any): { content: string; confidence: number } {
  const { tag, text, attributes } = elementInfo;
  
  // Rule-based tooltip generation
  let content = '';
  let confidence = 0.7;

  // Check for explicit labels
  if (attributes?.title) {
    content = attributes.title;
    confidence = 0.9;
  } else if (attributes?.['aria-label']) {
    content = attributes['aria-label'];
    confidence = 0.8;
  } else if (attributes?.placeholder) {
    content = `Enter ${attributes.placeholder.toLowerCase()}`;
    confidence = 0.8;
  } else if (text && text.trim()) {
    // Use element text as tooltip
    const cleanText = text.trim().replace(/\s+/g, ' ');
    content = cleanText.length > 50 ? cleanText.substring(0, 47) + '...' : cleanText;
    confidence = 0.6;
  } else {
    // Generate based on tag type
    switch (tag.toLowerCase()) {
      case 'button':
        content = 'Click to perform action';
        confidence = 0.5;
        break;
      case 'a':
        content = attributes?.href ? `Go to ${attributes.href}` : 'Click to navigate';
        confidence = 0.6;
        break;
      case 'input':
        const inputType = attributes?.type || 'text';
        content = `Enter ${inputType} input`;
        confidence = 0.7;
        break;
      case 'select':
        content = 'Choose an option';
        confidence = 0.7;
        break;
      default:
        content = `Interactive ${tag} element`;
        confidence = 0.4;
    }
  }

  return { content, confidence };
}

export default router;
