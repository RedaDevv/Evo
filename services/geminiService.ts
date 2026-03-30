import { GoogleGenerativeAI } from '@google/genai';

// Initialize the Gemini AI client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
               (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

if (!apiKey) {
  console.warn('⚠️ Gemini API key not configured. AI features will be unavailable.');
  console.warn('Please set VITE_GEMINI_API_KEY in your .env.local file.');
}

const client = new GoogleGenerativeAI({
  apiKey: apiKey || 'sk-placeholder' // Placeholder to prevent initialization errors
});

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export const geminiService = {
  /**
   * Generate text using Gemini
   */
  async generateText(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<string> {
    try {
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const model = client.getGenerativeModel({ model: 'gemini-pro' });
      
      const generationConfig = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
        topP: options.topP ?? 0.95,
        topK: options.topK ?? 40,
      };

      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  },

  /**
   * Generate streaming text (if supported)
   */
  async generateTextStream(
    prompt: string,
    options: AIGenerationOptions = {}
  ) {
    try {
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const model = client.getGenerativeModel({ model: 'gemini-pro' });
      
      const generationConfig = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
        topP: options.topP ?? 0.95,
        topK: options.topK ?? 40,
      };

      const stream = await model.generateContentStream({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      });

      return stream;
    } catch (error) {
      console.error('Gemini streaming error:', error);
      throw error;
    }
  },

  /**
   * Generate content for task planning
   */
  async generateTaskPlan(taskDescription: string): Promise<string> {
    const prompt = `
You are a helpful task planning assistant. Generate a structured plan for the following task:

Task: ${taskDescription}

Please provide:
1. Main steps to complete the task
2. Estimated time for each step
3. Potential challenges
4. Tips for success

Format your response in a clear, structured way.
    `.trim();

    return this.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1024,
    });
  },

  /**
   * Generate focus session suggestions
   */
  async generateFocusSuggestions(taskTitle: string, duration: number): Promise<string> {
    const prompt = `
You are a productivity coach. Generate helpful suggestions for a ${duration}-minute focus session on the following task:

Task: ${taskTitle}

Please provide:
1. Tips to stay focused
2. When to take breaks
3. How to handle distractions
4. Way to measure progress

Keep it concise and actionable.
    `.trim();

    return this.generateText(prompt, {
      temperature: 0.6,
      maxTokens: 512,
    });
  },

  /**
   * Analyze task priority and importance
   */
  async analyzeTaskPriority(taskTitle: string, description: string): Promise<string> {
    const prompt = `
You are a task management expert. Analyze the following task and suggest its priority level and quadrant (Eisenhower Matrix):

Title: ${taskTitle}
Description: ${description}

Please provide:
1. Priority level (High/Medium/Low)
2. Urgency (Urgent/Not Urgent)
3. Importance (Important/Not Important)
4. Suggested quadrant (Do First/Schedule/Delegate/Eliminate)
5. Brief reasoning

Format your response clearly.
    `.trim();

    return this.generateText(prompt, {
      temperature: 0.5,
      maxTokens: 512,
    });
  },

  /**
   * Generate daily planning insights
   */
  async generateDailyPlanningInsights(tasks: Array<{title: string; duration: number}>): Promise<string> {
    const taskList = tasks.map((t, i) => `${i + 1}. ${t.title} (${t.duration} min)`).join('\n');
    
    const prompt = `
You are a daily planning assistant. Help organize this day's tasks:

Tasks:
${taskList}

Please provide:
1. Suggested order to complete tasks
2. Optimal timing recommendations
3. Energy level considerations
4. Break recommendations
5. Overall feasibility assessment

Be practical and motivating.
    `.trim();

    return this.generateText(prompt, {
      temperature: 0.6,
      maxTokens: 1024,
    });
  },

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!apiKey;
  },

  /**
   * Get API status
   */
  getStatus(): { configured: boolean; message: string } {
    if (!apiKey) {
      return {
        configured: false,
        message: 'Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env.local'
      };
    }
    
    return {
      configured: true,
      message: 'Gemini API is configured and ready'
    };
  }
};
