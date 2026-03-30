# Gemini Secure Implementation - Quick Reference

## What Changed?

### Before ❌ (Insecure - Your API key was exposed)
```typescript
// vite.config.ts exposed your key
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}

// Frontend code accessed it directly
const apiKey = process.env.GEMINI_API_KEY; // 🔓 VISIBLE TO EVERYONE
const client = new GoogleGenerativeAI({ apiKey });
```

### After ✅ (Secure - API key stays on server)
```typescript
// Frontend only sends the prompt
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Your prompt here' })
});

// Backend handles the API key securely
// process.env.GEMINI_API_KEY is only available on server (Vercel Function)
```

---

## Implementation Guide

### 1. API Route: `/pages/api/generate.ts`

**What it does:**
- Receives prompt from frontend
- Accesses API key from `process.env.GEMINI_API_KEY`
- Calls Google Gemini API (securely, server-side)
- Returns generated text to frontend
- Handles errors gracefully

**Key Security Features:**
- API key never sent to client ✅
- Input validation ✅
- Error messages don't expose sensitive info ✅
- Proper HTTP status codes ✅

---

### 2. Frontend Service: `services/geminiServiceClient.ts`

**Example usage:**

```typescript
import { geminiServiceClient } from './services/geminiServiceClient';

// Simple generation
const result = await geminiServiceClient.generateText(
  'Write a poem about productivity'
);

// With options
const result = await geminiServiceClient.generateText(
  'Create a task plan',
  {
    temperature: 0.7,
    maxTokens: 1024,
  }
);

// Specialized functions
const plan = await geminiServiceClient.generateTaskPlan(
  'Build a web application'
);

const suggestions = await geminiServiceClient.generateTaskSuggestions(
  'Current tasks: Bug fixes, Documentation'
);
```

---

## File Structure

```
your-project/
├── pages/
│   └── api/
│       └── generate.ts          ← Backend API Route (SECURE)
├── services/
│   ├── geminiService.ts         ← OLD (DELETE AFTER MIGRATION)
│   └── geminiServiceClient.ts   ← NEW (Use this instead)
├── .env.local                   ← Local env variables (DO NOT COMMIT)
├── .gitignore                   ← Make sure .env.local is here
├── next.config.js               ← Next.js configuration
└── package.json
```

---

## Environment Setup

### Local Development

Create `.env.local` in project root:
```
GEMINI_API_KEY=your_key_from_google_ai_studio
```

### Production (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `GEMINI_API_KEY` = `your_key`
5. Redeploy

---

## Updating Your Components

### Find & Replace Guide

#### SmartPlanning Component

**Before:**
```typescript
import { geminiService } from './services/geminiService';

const plan = await geminiService.generateTaskPlan(taskDesc);
```

**After:**
```typescript
import { geminiServiceClient } from './services/geminiServiceClient';

const plan = await geminiServiceClient.generateTaskPlan(taskDesc);
```

#### Any Component Using Gemini

```typescript
// Find all imports:
import { geminiService } from './services/geminiService';

// Replace with:
import { geminiServiceClient } from './services/geminiServiceClient';

// Then replace method calls:
geminiService.generateText()           → geminiServiceClient.generateText()
geminiService.generateTaskPlan()       → geminiServiceClient.generateTaskPlan()
geminiService.generateTaskSuggestions() → geminiServiceClient.generateTaskSuggestions()
```

---

## Testing

### Test the API Endpoint Locally

```bash
# Start dev server
npm run dev

# In another terminal, test with curl
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List 3 productivity tips",
    "temperature": 0.7,
    "maxTokens": 256
  }'
```

### Expected Response
```json
{
  "success": true,
  "text": "Here are 3 productivity tips:\n\n1. Time blocking: Set specific blocks of time for different tasks...\n\n2. Prioritization: Use the Eisenhower Matrix..."
}
```

### Test Error Handling

Missing prompt:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": ""}'
```

Wrong HTTP method:
```bash
curl -X GET http://localhost:3000/api/generate
```

---

## Deployment to Vercel

### Quick Steps

```bash
# 1. Commit changes
git add .
git commit -m "Secure Gemini API implementation"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys on GitHub push
# No additional steps needed if connected to Vercel!

# 4. Verify deployment
# Check Vercel dashboard for build status
```

### Manual Deployment (if needed)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set production environment variables
vercel env add GEMINI_API_KEY
# Enter your API key
# Select "Production, Preview, Development"

# Promote to production
vercel --prod
```

---

## Security Checklist

- [ ] API key in `.env.local` (local)
- [ ] API key in Vercel dashboard (production)
- [ ] `.env.local` in `.gitignore`
- [ ] No API key in frontend code
- [ ] All components updated to use `geminiServiceClient`
- [ ] Old `geminiService.ts` no longer used
- [ ] Local test working (`npm run dev`)
- [ ] Production test working (deployed URL)
- [ ] No API key visible in network requests (inspect browser DevTools)

---

## Common Issues & Solutions

### Issue: "Cannot find module 'next'"
**Fix:** `npm install next`

### Issue: "GEMINI_API_KEY is not configured"
**Fix:** 
1. Create `.env.local` locally
2. Add env var to Vercel dashboard
3. Restart dev server / redeploy

### Issue: API key appears in DevTools Network tab
**This is normal!** The network tab shows the network request. As long as:
- Request goes to `/api/generate` (your backend)
- Response doesn't contain your actual API key ✅
- Frontend never initializes `GoogleGenerativeAI` directly ✅

### Issue: CORS error
**Not applicable!** You're calling your own domain's API route, no CORS issues.

---

## Vite to Next.js Migration (Optional Deeper Migration)

If you want to fully migrate from Vite to Next.js:

1. Create `next.config.js`
2. Move `pages/` structure if needed
3. Update `tsconfig.json` for Next.js
4. Update `package.json` scripts
5. Install Next.js: `npm install next`

For now, you can keep both Vite + Next.js coexisting during transition.

---

## API Reference

### POST /api/generate

**Request:**
```json
{
  "prompt": "Your prompt text",
  "temperature": 0.7,
  "maxTokens": 1024,
  "topP": 0.95,
  "topK": 40
}
```

**Response (Success):**
```json
{
  "success": true,
  "text": "Generated content here..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error type",
  "details": "Detailed error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing/invalid data)
- `401` - Auth failed (invalid API key)
- `405` - Method not allowed (not POST)
- `429` - Rate limited or quota exceeded
- `500` - Server error

---

## Next Steps

1. ✅ Copy `/pages/api/generate.ts` to your project
2. ✅ Copy `services/geminiServiceClient.ts` to your project
3. ✅ Create `.env.local` with `GEMINI_API_KEY`
4. ✅ Update imports in components
5. ✅ Test locally: `npm run dev`
6. ✅ Deploy to Vercel
7. ✅ Add env var to Vercel dashboard
8. ✅ Test production API

Done! Your Gemini API is now secure. 🎉

