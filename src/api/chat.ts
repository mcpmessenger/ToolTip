// Frontend API client for chat
// Connects to the backend API

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const API_BASE_URL = 'http://localhost:3001';

export async function chatWithAI(message: string): Promise<ChatResponse> {
  try {
    console.log(`Sending chat message: "${message}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.response,
      timestamp: data.timestamp,
      usage: data.usage
    };
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback to mock response if backend is not available
    console.log('Falling back to mock response...');
    return {
      response: `I received your message: "${message}". The backend service is not available, so this is a fallback response. Please start the backend server to get real AI responses.`,
      timestamp: new Date().toISOString()
    };
  }
}
