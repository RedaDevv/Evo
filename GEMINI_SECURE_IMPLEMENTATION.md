# Secure Gemini API Implementation for Vercel

## Overview

This guide explains how to securely implement the Google Gemini API using a Next.js serverless backend instead of calling it directly from the frontend. This ensures your API key is never exposed to users.

## Architecture

```
Frontend (Browser)
    ↓
    │ Fetch Request with Prompt
    ↓
Next.js API Route (/api/generate)
    ↓
    │ Backend (Vercel Serverless Function)
    │ - Has access to GEMINI_API_KEY via process.env
    │ - Never exposes the key to the client
    ↓
Google Gemini API
    ↓
    │ Generated Content
    ↓
Next.js API Route (Response)
    ↓
    │ JSON Response
    ↓
Frontend (Display Result)
```

## Setup Instructions

### Step 1: Install Next.js Dependencies

If you haven't already migrated to Next.js, add the required dependencies:

```bash
npm install next react react-dom
npm install @google/generative-ai
npm install -D next@latest
```

### Step 2: Update Package.json Scripts

Add or update your `package.json` scripts for Next.js:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 3: Create Next.js Config

Create `next.config.js` in your project root:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### Step 4: Environment Variables Setup

Create a `.env.local` file in your project root:

```
GEMINI_API_KEY=your_actual_api_key_here
```

**Never commit `.env.local` to Git.** Add it to `.gitignore`:

```gitignore
.env.local
.env*.local
```

### Step 5: Create the API Route

Create the file `/pages/api/generate.ts` (already created in the workspace):

This endpoint:
- Only accepts POST requests
- Validates the prompt input
- Accesses `GEMINI_API_KEY` from `process.env` (secure - only available on server)
- Calls the Gemini API
- Returns a JSON response with error handling

### Step 6: Update Frontend Code

Replace your current `geminiService.ts` calls with the new `geminiServiceClient.ts`:

**Before (Direct API call - EXPOSED):**
```typescript
// ❌ This exposed your API key!
import { geminiService } from './services/geminiService';

const result = await geminiService.generateText(prompt);
```

**After (Via Backend API - SECURE):**
```typescript
// ✅ This is secure - API key is hidden
import { geminiServiceClient } from './services/geminiServiceClient';

const result = await geminiServiceClient.generateText(prompt);
```

### Step 7: Update Component Usage

Here's an example of how to use the new service in a React component:

```typescript
import React, { useState } from 'react';
import { geminiServiceClient } from '../services/geminiServiceClient';

export default function SmartPlanning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const text = await geminiServiceClient.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1024,
      });
      setResult(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleGenerate('Create a plan...')} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Plan'}
      </button>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{result}</div>}
    </div>
  );
}
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Add secure Gemini API backend integration"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Click "Continue"

### 3. Add Environment Variables

In the Vercel dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Google Gemini API key
3. Make sure it's enabled for all environments (Production, Preview, Development)
4. Click "Save"

### 4. Deploy

```bash
git push origin main
```

Vercel will automatically deploy your changes. Your API endpoint will be:
```
https://your-project-name.vercel.app/api/generate
```

## Testing the API

### Local Testing

Start your development server:

```bash
npm run dev
```

Test with curl:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short poem about coding"}'
```

### Expected Response (Success)

```json
{
  "success": true,
  "text": "The code flows like rivers of light...\n\nIndentation tells the story..."
}
```

### Expected Response (Error)

```json
{
  "success": false,
  "error": "Missing required field: prompt",
  "details": "The prompt field is required"
}
```

## Error Handling

The API handles various error scenarios:

| Status Code | Scenario | Response |
|---|---|---|
| 200 | ✅ Success | `{ success: true, text: "..." }` |
| 400 | ❌ Bad request | `{ success: false, error: "Missing prompt" }` |
| 401 | ❌ Auth failed | `{ success: false, error: "Authentication failed" }` |
| 405 | ❌ Wrong method | `{ success: false, error: "Method not allowed" }` |
| 429 | ❌ Rate limited | `{ success: false, error: "Rate limit exceeded" }` |
| 500 | ❌ Server error | `{ success: false, error: "Failed to generate content" }` |

## Updating Components to Use New Service

### SmartPlanning Component

```typescript
import { geminiServiceClient } from '../services/geminiServiceClient';

// Instead of:
// const plan = await geminiService.generateTaskPlan(description);

// Use:
const plan = await geminiServiceClient.generateTaskPlan(description);
```

### For All AI Features

Replace all imports and calls to:
- `geminiService.generateText()` → `geminiServiceClient.generateText()`
- `geminiService.generateTaskPlan()` → `geminiServiceClient.generateTaskPlan()`
- `geminiService.generateTaskSuggestions()` → `geminiServiceClient.generateTaskSuggestions()`

## Security Best Practices

✅ **DO:**
- Keep `GEMINI_API_KEY` only in `.env.local` (local) and Vercel environment variables (production)
- Use HTTPS for all API calls (automatically handled by Vercel)
- Validate input on the server side (already implemented)
- Log errors server-side for debugging
- Use appropriate HTTP status codes

❌ **DON'T:**
- Expose your API key in frontend code
- Commit `.env.local` to version control
- Store API keys in localStorage or sessionStorage
- Log sensitive information to client console
- Hard-code API keys anywhere

## Troubleshooting

### Issue: "GEMINI_API_KEY is not configured"

**Solution**: Make sure you've added the environment variable to Vercel:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your actual key
3. Redeploy

### Issue: "Cannot find module '@google/generative-ai'"

**Solution**: Install the dependency:
```bash
npm install @google/generative-ai
```

### Issue: CORS errors when calling from frontend

**Solution**: Make sure you're calling `/api/generate` (relative path), not the full URL.

### Issue: API key still exposed

**Solution**: 
1. Regenerate your Gemini API key at [Google Cloud Console](https://console.cloud.google.com)
2. Update the environment variable in Vercel
3. Verify the old key is revoked

## Migration Checklist

- [ ] Install Next.js and required dependencies
- [ ] Create `.env.local` with GEMINI_API_KEY
- [ ] Create `/pages/api/generate.ts`
- [ ] Create `services/geminiServiceClient.ts`
- [ ] Update all components using Gemini AI
- [ ] Test locally with `npm run dev`
- [ ] Push to GitHub
- [ ] Add environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Test API endpoint on production
- [ ] Verify no API key leaks in frontend code

## Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Google Generative AI Node.js SDK](https://github.com/google/generative-ai-js)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Deployment to Vercel](https://nextjs.org/docs/deployment/vercel)

## Next Steps

1. Run `npm install` to ensure all dependencies are installed
2. Create `.env.local` with your `GEMINI_API_KEY`
3. Update your components to use `geminiServiceClient`
4. Test locally: `npm run dev`
5. Deploy to Vercel

Questions? Check the troubleshooting section or refer to the official documentation links above.
