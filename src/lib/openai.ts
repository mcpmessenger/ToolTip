import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  console.error('Missing OpenAI API key. Please set VITE_OPENAI_API_KEY in your .env file')
  throw new Error('Missing OpenAI API key. Please set VITE_OPENAI_API_KEY in your .env file')
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
})

export interface PageAnalysis {
  summary: string
  keyPoints: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
  relevanceScore: number
  suggestedQuestions: string[]
}

export async function analyzePageContent(content: string, url: string): Promise<PageAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that analyzes web page content. Analyze the provided content and return a JSON response with the following structure:
          {
            "summary": "A concise 2-3 sentence summary of the page content",
            "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
            "sentiment": "positive|neutral|negative",
            "category": "The main category/topic of the content",
            "relevanceScore": 0.0-1.0,
            "suggestedQuestions": ["Question 1", "Question 2", "Question 3"]
          }`
        },
        {
          role: 'user',
          content: `Analyze this web page content from ${url}:\n\n${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    return analysis
  } catch (error) {
    console.error('Error analyzing page content:', error)
    throw new Error('Failed to analyze page content')
  }
}

export async function generateChatResponse(
  userMessage: string, 
  context: CrawledPage[], 
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    const contextText = context.map(page => 
      `URL: ${page.url}\nTitle: ${page.title}\nSummary: ${page.summary}\nContent: ${page.content.substring(0, 500)}...`
    ).join('\n\n')

    const historyText = conversationHistory.slice(-5).map(msg => 
      `User: ${msg.user_message}\nAI: ${msg.ai_response}`
    ).join('\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant that helps users navigate and understand web content. You have access to crawled web pages and can provide intelligent responses based on the content. Be conversational, helpful, and accurate.`
        },
        {
          role: 'user',
          content: `Context from crawled pages:\n${contextText}\n\nConversation history:\n${historyText}\n\nUser question: ${userMessage}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return response.choices[0].message.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error('Failed to generate chat response')
  }
}

export async function generateSearchQuery(userInput: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Convert the user input into an effective web search query. Return only the search query, no additional text.'
        },
        {
          role: 'user',
          content: userInput
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    })

    return response.choices[0].message.content || userInput
  } catch (error) {
    console.error('Error generating search query:', error)
    return userInput
  }
}
