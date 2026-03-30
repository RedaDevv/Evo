/**
 * Frontend Gemini Service
 * This service communicates with the serverless API route (/api/generate)
 * instead of calling the Gemini API directly from the browser
 */

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface GenerateResponse {
  success: boolean;
  text?: string;
  error?: string;
  details?: string;
}

/**
 * Call the backend API to generate text using Gemini
 * @param prompt - The prompt to send to Gemini
 * @param options - Generation configuration options
 * @returns The generated text
 */
export async function generateText(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        topP: options.topP,
        topK: options.topK,
      }),
    });

    if (!response.ok) {
      const errorData: GenerateResponse = await response.json();
      throw new Error(
        errorData.details || errorData.error || `HTTP Error: ${response.status}`
      );
    }

    const data: GenerateResponse = await response.json();

    if (!data.success) {
      throw new Error(data.details || data.error || 'Unknown error occurred');
    }

    if (!data.text) {
      throw new Error('No response text received from API');
    }

    return data.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

/**
 * Generate a task plan using the backend API
 * @param taskDescription - Description of the task to plan
 * @returns The generated task plan
 */
export async function generateTaskPlan(taskDescription: string): Promise<string> {
  const prompt = `
You are a helpful task planning assistant. Generate a structured plan for the following task:

Task: ${taskDescription}

Please provide:
1. Main objectives
2. Key steps to complete
3. Estimated time for each step
4. Potential challenges and solutions
5. Success criteria

Format the response in a clear, organized manner.
`;

  return generateText(prompt, {
    temperature: 0.7,
    maxTokens: 1024,
  });
}

/**
 * Generate smart task suggestions using the backend API
 * @param context - Context about existing tasks and goals
 * @returns The generated suggestions
 */
export async function generateTaskSuggestions(context: string): Promise<string> {
  const prompt = `
You are an intelligent task recommendation system. Based on the following context, suggest 3-5 important tasks that should be added:

Context:
${context}

For each suggestion:
1. Provide a clear task title
2. Explain why it's important
3. Suggest a priority level (High/Medium/Low)
4. Estimate time required

Format as a numbered list.
`;

  return generateText(prompt, {
    temperature: 0.8,
    maxTokens: 1024,
  });
}

/**
 * Generate insights or analysis using the backend API
 * @param data - Data or information to analyze
 * @param analysisType - Type of analysis to perform
 * @returns The analysis results
 */
export async function generateAnalysis(
  data: string,
  analysisType: string
): Promise<string> {
  const prompt = `
Perform a ${analysisType} analysis on the following data:

${data}

Provide:
1. Key findings
2. Patterns or trends
3. Recommendations
4. Areas for improvement

Be concise but thorough.
`;

  return generateText(prompt, {
    temperature: 0.6,
    maxTokens: 1024,
  });
}

export const geminiServiceClient = {
  generateText,
  generateTaskPlan,
  generateTaskSuggestions,
  generateAnalysis,
};
