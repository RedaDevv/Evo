import React, { useState } from 'react';
import { geminiServiceClient } from '../../services/geminiServiceClient';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartPlanningProps {
  onPlanGenerated?: (plan: string) => void;
}

/**
 * Example Component: SmartPlanning (Updated for Secure Backend)
 * 
 * This component demonstrates how to use the new geminiServiceClient
 * which calls the backend API route instead of directly accessing
 * the Gemini API key on the frontend.
 */
const SmartPlanningExample: React.FC<SmartPlanningProps> = ({ onPlanGenerated }) => {
  const [taskInput, setTaskInput] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle plan generation
   * Uses the backend API securely instead of direct Gemini calls
   */
  const handleGeneratePlan = async () => {
    if (!taskInput.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // ✅ SECURE: Calls /api/generate backend route
      // ❌ NOT: Directly accessing Gemini API with exposed key
      const plan = await geminiServiceClient.generateTaskPlan(taskInput);

      setGeneratedPlan(plan);
      setSuccessMessage('Plan generated successfully!');
      onPlanGenerated?.(plan);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      console.error('Plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle task suggestions
   */
  const handleGenerateSuggestions = async () => {
    if (!taskInput.trim()) {
      setError('Please enter context for suggestions');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // ✅ SECURE: Calls /api/generate backend route
      const suggestions = await geminiServiceClient.generateTaskSuggestions(
        taskInput
      );

      setGeneratedPlan(suggestions);
      setSuccessMessage('Suggestions generated successfully!');
      onPlanGenerated?.(suggestions);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(message);
      console.error('Suggestions generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle analysis generation
   */
  const handleGenerateAnalysis = async () => {
    if (!taskInput.trim()) {
      setError('Please enter data to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // ✅ SECURE: Calls /api/generate backend route
      const analysis = await geminiServiceClient.generateAnalysis(
        taskInput,
        'comprehensive'
      );

      setGeneratedPlan(analysis);
      setSuccessMessage('Analysis generated successfully!');
      onPlanGenerated?.(analysis);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate analysis';
      setError(message);
      console.error('Analysis generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-planning-container p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Smart Planning (Secure)</h2>

      {/* Info Box: Security Notice */}
      <div className="mb-4 p-3 bg-blue-900 border border-blue-600 rounded-md">
        <p className="text-sm text-blue-100">
          ✅ <strong>Secure Implementation:</strong> This component now uses a backend API route.
          Your Gemini API key is never exposed to the frontend.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="taskInput" className="block text-white mb-2 font-medium">
          Task Description or Context
        </label>
        <textarea
          id="taskInput"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          disabled={loading}
          placeholder="Describe the task you want to plan, or provide context for suggestions..."
          className="w-full h-24 p-3 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={handleGeneratePlan}
          disabled={loading || !taskInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Plan'
          )}
        </button>

        <button
          onClick={handleGenerateSuggestions}
          disabled={loading || !taskInput.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Get Suggestions'
          )}
        </button>

        <button
          onClick={handleGenerateAnalysis}
          disabled={loading || !taskInput.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-600 rounded-md flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-200 font-semibold">Error</h3>
            <p className="text-red-100 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-900 border border-green-600 rounded-md flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-100">{successMessage}</p>
        </div>
      )}

      {/* Generated Content */}
      {generatedPlan && (
        <div className="bg-slate-700 border border-slate-600 rounded-md p-4">
          <h3 className="text-white font-semibold mb-3">Generated Content:</h3>
          <div className="text-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
            {generatedPlan}
          </div>

          {/* Copy Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedPlan);
              alert('Copied to clipboard!');
            }}
            className="mt-4 px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-slate-300 mt-2">Generating content securely via backend...</p>
        </div>
      )}
    </div>
  );
};

export default SmartPlanningExample;

/**
 * Usage Notes:
 * 
 * 1. Import this component in your page:
 *    import SmartPlanningExample from './SmartPlanningExample';
 * 
 * 2. Use it in your render:
 *    <SmartPlanningExample onPlanGenerated={(plan) => console.log(plan)} />
 * 
 * 3. Make sure you have:
 *    - Backend API route: /pages/api/generate.ts
 *    - Frontend service: services/geminiServiceClient.ts
 *    - Environment variable: GEMINI_API_KEY in .env.local (dev) or Vercel dashboard (prod)
 * 
 * Security Benefits:
 * ✅ API key never exposed to frontend
 * ✅ All API calls go through your backend
 * ✅ Works on Vercel with environment variables
 * ✅ Scalable and maintainable
 */
