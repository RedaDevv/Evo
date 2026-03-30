import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RequestBody {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface SuccessResponse {
  success: true;
  text: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

type ResponseData = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are supported.',
    });
  }

  try {
    const { prompt, temperature, maxTokens, topP, topK } = req.body as RequestBody;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt',
      });
    }

    if (!prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Prompt cannot be empty',
      });
    }

    // Verify API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: 'AI service is not properly configured',
      });
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare generation config
    const generationConfig = {
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxTokens ?? 1024,
      topP: topP ?? 0.95,
      topK: topK ?? 40,
    };

    // Generate content
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // API key related errors
      if (
        errorMessage.includes('api key') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('permission denied')
      ) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          details: 'Invalid or expired API credentials',
        });
      }

      // Rate limiting
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.',
        });
      }

      // Quota exceeded
      if (errorMessage.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'Quota exceeded',
          details: 'API quota has been exceeded. Please try again later.',
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      details: 'An unexpected error occurred while processing your request',
    });
  }
}
