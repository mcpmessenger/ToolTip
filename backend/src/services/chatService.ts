import OpenAI from 'openai';
import { supabase } from '../config/supabase';

// Lazy initialization of OpenAI - will be created when first needed
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (openai === null) {
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && 
        apiKey !== 'your_openai_api_key_here' &&
        apiKey.trim() !== '') {
      openai = new OpenAI({
        apiKey: apiKey
      });
      console.log('OpenAI initialized successfully');
    } else {
      console.log('OpenAI not configured, using mock response');
    }
  }
  return openai;
}

export interface ChatResponse {
  content: string;
  timestamp: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChatService {
  async generateResponse(message: string): Promise<ChatResponse> {
    try {
      const openaiClient = getOpenAI();
      if (!openaiClient) {
        console.log('OpenAI not configured, using mock response');
        const mockResponse = this.generateMockResponse(message);
        await this.saveChatMessage(message, mockResponse);
        return {
          content: mockResponse,
          timestamp: new Date().toISOString()
        };
      }

      // Generate AI response using OpenAI
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for ToolTip Companion, a web browsing and crawling tool. Help users with web searches, information gathering, and general questions. Be concise and helpful.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const content = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      const usage = completion.usage;

      // Save chat message to database
      await this.saveChatMessage(message, content);

      return {
        content,
        timestamp: new Date().toISOString(),
        usage: usage ? {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback response
      const fallbackResponse = this.generateMockResponse(message);
      return {
        content: fallbackResponse,
        timestamp: new Date().toISOString()
      };
    }
  }

  private generateMockResponse(message: string): string {
    const responses = [
      `I received your message: "${message}". This is a demo response. To get real AI responses, please add your OpenAI API key to the backend .env file.`,
      `Thanks for your message: "${message}". I'm currently running in demo mode. Set up your OpenAI API key for intelligent responses!`,
      `Hello! I got your message: "${message}". I'm a demo AI assistant. Add your OpenAI API key to enable real AI capabilities.`,
      `I understand you said: "${message}". This is a mock response. Configure your OpenAI API key for real AI chat!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async saveChatMessage(userMessage: string, aiResponse: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, skipping chat message save');
        return;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_message: userMessage,
            ai_response: aiResponse,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error saving chat message:', error);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }
}

export const chatService = new ChatService();
