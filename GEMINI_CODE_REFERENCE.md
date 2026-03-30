# Code Reference: Before & After Secure Implementation

## Complete File Structure

```
your-project/
├── pages/
│   └── api/
│       └── generate.ts                 ← NEW: Backend API route
├── services/
│   ├── geminiService.ts               ← OLD: Remove after migration
│   └── geminiServiceClient.ts         ← NEW: Frontend client
├── components/
│   ├── Planning/
│   │   └── SmartPlanning.tsx          ← UPDATE: Use geminiServiceClient
│   └── ... other components
├── .env.local                         ← NEW: Local API key (don't commit)
├── .env.example                       ← NEW: Template for env vars
├── .gitignore                         ← UPDATE: Add .env.local
├── next.config.js                    ← NEW: Next.js config
├── package.json                       ← UPDATE: Add Next.js scripts
└── tsconfig.json                     ← UPDATE: For Next.js
```

---

## File 1: Backend API Route

**Location:** `/pages/api/generate.ts`

```typescript
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
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing or empty prompt',
      });
    }

    // ✅ SECURE: API key only accessible on server
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: 'AI service is not properly configured',
      });
    }

    // Initialize client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare config
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

    const text = result.response.text();

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('unauthorized')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
        });
      }
      if (msg.includes('rate limit') || msg.includes('429')) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to generate content',
    });
  }
}
```

---

## File 2: Frontend Service

**Location:** `/services/geminiServiceClient.ts`

```typescript
// ✅ NEW: Frontend service that calls the backend API
// (NOT directly accessing Gemini like before)

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

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
      const data = await response.json();
      throw new Error(data.details || data.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }

    return data.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function generateTaskPlan(taskDescription: string): Promise<string> {
  const prompt = `Generate a task plan for: ${taskDescription}`;
  return generateText(prompt, { temperature: 0.7, maxTokens: 1024 });
}

export async function generateTaskSuggestions(context: string): Promise<string> {
  const prompt = `Based on this context, suggest important tasks: ${context}`;
  return generateText(prompt, { temperature: 0.8, maxTokens: 1024 });
}

export async function generateAnalysis(data: string, type: string): Promise<string> {
  const prompt = `Perform ${type} analysis on: ${data}`;
  return generateText(prompt, { temperature: 0.6, maxTokens: 1024 });
}

export const geminiServiceClient = {
  generateText,
  generateTaskPlan,
  generateTaskSuggestions,
  generateAnalysis,
};
```

---

## File 3: Update Components

### Before ❌ (INSECURE)

```typescript
// OLD - DON'T USE
import { geminiService } from './services/geminiService';

async function handleGenerate() {
  try {
    // ❌ This calls Gemini directly from browser
    // ❌ Your API key is exposed!
    const plan = await geminiService.generateTaskPlan(taskDescription);
    setResult(plan);
  } catch (error) {
    setError(String(error));
  }
}
```

### After ✅ (SECURE)

```typescript
// NEW - USE THIS
import { geminiServiceClient } from './services/geminiServiceClient';

async function handleGenerate() {
  try {
    // ✅ This calls your backend API
    // ✅ API key is safe on server
    const plan = await geminiServiceClient.generateTaskPlan(taskDescription);
    setResult(plan);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  }
}
```

---

## File 4: Environment Configuration

### `.env.local` (Local development only)

```
# Never commit this file!
# It's in .gitignore
GEMINI_API_KEY=your_actual_api_key_from_google
```

### `.env.example` (Commit this to show what's needed)

```
# This file shows which environment variables are required
# Copy to .env.local and fill in actual values

GEMINI_API_KEY=your_key_here_not_real
```

### `.gitignore` (Make sure this has env files)

```
# Environment variables
.env.local
.env*.local

# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
.next/
out/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
```

---

## File 5: Package.json Updates

### Before ❌
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.34.0",
    "vite": "^6.2.0",
    "react": "^19.2.3"
  }
}
```

### After ✅
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "@google/generative-ai": "^0.12.0",
    "firebase": "^12.10.0",
    "lucide-react": "^0.562.0",
    "recharts": "^3.6.0",
    "tailwindcss": "^4.2.2"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "typescript": "~5.8.2"
  }
}
```

---

## File 6: next.config.js (NEW)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add any other Next.js config here
};

module.exports = nextConfig;
```

---

## File 7: tsconfig.json Update

### Before ❌
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

### After ✅
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Migration Path

### Step 1: Create Backend Files
1. Create `/pages/` directory
2. Create `/pages/api/` directory
3. Create `/pages/api/generate.ts`

### Step 2: Create Frontend Service
1. Create `/services/geminiServiceClient.ts`

### Step 3: Create Config Files
1. Create `next.config.js`
2. Update `tsconfig.json`
3. Update `package.json` scripts

### Step 4: Setup Environment
1. Create `.env.local` with `GEMINI_API_KEY`
2. Create `.env.example` template
3. Update `.gitignore`

### Step 5: Update Components
1. Find all: `import { geminiService }`
2. Replace with: `import { geminiServiceClient }`
3. Update all method calls

### Step 6: Test & Deploy
1. Test locally: `npm run dev`
2. Push to GitHub
3. Deploy to Vercel

---

## Key Differences Summary

| Aspect | Before ❌ | After ✅ |
|--------|----------|---------|
| **API Key Location** | Frontend (exposed) | Backend only (secure) |
| **Build Tool** | Vite | Next.js |
| **API Call** | Direct to Google | Via `/api/generate` |
| **Framework** | React (Vite) | Next.js |
| **Deployment** | Vercel (static) | Vercel (with functions) |
| **Security** | ⚠️ Low | ✅ High |
| **Scalability** | ✅ Good | ✅ Better |

---

## Testing Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build
npm build

# Test API endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hi"}'

# Push to production
git add .
git commit -m "Secure Gemini implementation"
git push origin main
```

---

## Files to Delete (After Migration)

Once everything is working, you can delete:

1. `services/geminiService.ts` (OLD - no longer needed)
2. `vite.config.ts` (if using Next.js only)
3. Any Vite-related config files

Keep backups in Git history just in case!

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to a specific commit
git reset --hard <commit-hash>

# Check git log
git log --oneline
```

---

Done! Your Gemini API is now secure. 🎉

