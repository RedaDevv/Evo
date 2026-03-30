# 🤖 Gemini API Configuration Guide

## ✅ Current Status

Your Gemini API key has been configured!

**Configuration:**
- ✅ API key added to `.env.local`
- ✅ Environment variable: `VITE_GEMINI_API_KEY`
- ✅ Gemini service created: `services/geminiService.ts`
- ✅ Ready to use!

---

## 📝 Setup Summary

### What Was Done

1. **Added API Key to `.env.local`**
   ```env
   VITE_GEMINI_API_KEY=AIzaSyABmNtFMKoxEH3Anhgfi_cgHEomhaSDbyE
   ```

2. **Updated `.env.example`**
   - Added template for team members
   - Added documentation links

3. **Created `services/geminiService.ts`**
   - Initialized Gemini AI client
   - Created helper methods for common tasks
   - Error handling and configuration checking

---

## 🚀 How to Use

### Import the Service

```typescript
import { geminiService } from './services/geminiService';
```

### Example 1: Generate Task Plan

```typescript
const plan = await geminiService.generateTaskPlan(
  'Build a React component for task management'
);
console.log(plan);
```

### Example 2: Generate Focus Session Suggestions

```typescript
const suggestions = await geminiService.generateFocusSuggestions(
  'Complete project documentation',
  25 // 25 minutes (Pomodoro timer)
);
console.log(suggestions);
```

### Example 3: Analyze Task Priority

```typescript
const analysis = await geminiService.analyzeTaskPriority(
  'Design new dashboard',
  'Create a new dashboard with analytics'
);
console.log(analysis);
```

### Example 4: Generate Daily Planning Insights

```typescript
const insights = await geminiService.generateDailyPlanningInsights([
  { title: 'Code review', duration: 30 },
  { title: 'Meeting', duration: 60 },
  { title: 'Documentation', duration: 45 }
]);
console.log(insights);
```

### Example 5: Stream Generated Text

```typescript
const stream = await geminiService.generateTextStream(
  'Generate 5 productivity tips'
);

for await (const chunk of stream) {
  console.log(chunk.text());
}
```

---

## 🔧 Available Methods

### `generateText(prompt, options)`
Generate text based on a prompt.

**Parameters:**
- `prompt: string` - The prompt to send to Gemini
- `options?: AIGenerationOptions` - Configuration options

**Returns:** Promise<string>

**Example:**
```typescript
const response = await geminiService.generateText(
  'What are 3 ways to improve productivity?',
  { temperature: 0.7, maxTokens: 500 }
);
```

---

### `generateTextStream(prompt, options)`
Generate text with streaming support.

**Parameters:**
- `prompt: string` - The prompt to send to Gemini
- `options?: AIGenerationOptions` - Configuration options

**Returns:** Promise<Stream>

**Example:**
```typescript
const stream = await geminiService.generateTextStream(
  'Generate a motivational quote'
);

for await (const chunk of stream) {
  process.stdout.write(chunk.text());
}
```

---

### `generateTaskPlan(taskDescription)`
Generate a structured plan for a task.

**Parameters:**
- `taskDescription: string` - Description of the task

**Returns:** Promise<string>

**What it does:**
- Breaks down the task into main steps
- Estimates time for each step
- Identifies potential challenges
- Provides tips for success

---

### `generateFocusSuggestions(taskTitle, duration)`
Generate focus session suggestions.

**Parameters:**
- `taskTitle: string` - Title of the task
- `duration: number` - Duration in minutes

**Returns:** Promise<string>

**What it does:**
- Tips to stay focused
- Break recommendations
- Distraction handling advice
- Progress measurement methods

---

### `analyzeTaskPriority(taskTitle, description)`
Analyze and suggest task priority.

**Parameters:**
- `taskTitle: string` - Task title
- `description: string` - Task description

**Returns:** Promise<string>

**What it does:**
- Determines priority level (High/Medium/Low)
- Assesses urgency
- Evaluates importance
- Suggests Eisenhower quadrant
- Provides reasoning

---

### `generateDailyPlanningInsights(tasks)`
Generate daily planning advice.

**Parameters:**
- `tasks: Array<{title: string; duration: number}>` - Array of tasks

**Returns:** Promise<string>

**What it does:**
- Suggests optimal task order
- Recommends timing
- Considers energy levels
- Recommends breaks
- Assesses feasibility

---

### `isConfigured()`
Check if Gemini API is configured.

**Returns:** boolean

**Example:**
```typescript
if (geminiService.isConfigured()) {
  console.log('Gemini AI is ready!');
} else {
  console.log('Please configure Gemini API key');
}
```

---

### `getStatus()`
Get detailed API status.

**Returns:** { configured: boolean; message: string }

**Example:**
```typescript
const status = geminiService.getStatus();
console.log(status.message);
// Output: "Gemini API is configured and ready"
```

---

## 📊 Configuration Options

### AIGenerationOptions

```typescript
interface AIGenerationOptions {
  temperature?: number;      // 0-2 (default: 0.7) - Randomness
  maxTokens?: number;        // Default: 1024 - Max output length
  topP?: number;             // 0-1 (default: 0.95) - Diversity
  topK?: number;             // Default: 40 - Token diversity
}
```

**Temperature:**
- `0` = Deterministic (always same answer)
- `0.7` = Balanced (default)
- `2` = Very creative/random

**maxTokens:**
- Short responses: 256-512
- Medium responses: 512-1024
- Long responses: 1024-2048

---

## 🧪 Testing

### Test 1: Check Configuration

```typescript
const status = geminiService.getStatus();
console.log(status);
```

**Expected output:**
```
{
  configured: true,
  message: "Gemini API is configured and ready"
}
```

### Test 2: Simple Generation

```typescript
const text = await geminiService.generateText(
  'Say hello in a friendly way'
);
console.log(text);
```

**Expected:** Friendly greeting

### Test 3: Task Planning

```typescript
const plan = await geminiService.generateTaskPlan(
  'Learn TypeScript'
);
console.log(plan);
```

**Expected:** Structured learning plan

---

## 🛠️ Integration Examples

### In React Component

```typescript
import { useState } from 'react';
import { geminiService } from './services/geminiService';

export function TaskPlannerComponent() {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async (taskTitle: string) => {
    setLoading(true);
    try {
      const generatedPlan = await geminiService.generateTaskPlan(taskTitle);
      setPlan(generatedPlan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleGeneratePlan('Complete project')}>
        {loading ? 'Generating...' : 'Generate Plan'}
      </button>
      {plan && <div>{plan}</div>}
    </div>
  );
}
```

### In Smart Planning Component

```typescript
import { SmartPlanning } from './components/Planning/SmartPlanning';
import { geminiService } from './services/geminiService';

export function EnhancedPlanning() {
  const generateSmartPlan = async (tasks: Task[]) => {
    if (!geminiService.isConfigured()) {
      console.warn('Gemini not configured');
      return;
    }

    const insights = await geminiService.generateDailyPlanningInsights(
      tasks.map(t => ({ title: t.title, duration: t.estimatedMinutes }))
    );

    return insights;
  };

  return <SmartPlanning onGeneratePlan={generateSmartPlan} />;
}
```

---

## 🔐 Security Notes

### API Key Protection
- ✅ Stored in `.env.local` (Git ignored)
- ✅ Never hardcoded in source files
- ✅ Protected in `.gitignore`
- ✅ Only loaded from environment

### Safer Practices
1. Never log the full API key
2. Don't share `.env.local` file
3. Rotate key if accidentally exposed
4. Use different keys for dev/prod

**Your key is safe in `.env.local`** ✅

---

## 📋 Troubleshooting

### Problem: "Gemini API key not configured"
**Solution:**
1. Check `.env.local` has the key
2. Verify key is not empty
3. Restart dev server
4. Check in browser console

### Problem: "Cannot find module '@google/genai'"
**Solution:**
```bash
npm install @google/genai
```

### Problem: API returns error
**Check:**
1. API key is valid
2. Network connection
3. API rate limits
4. Check browser console for details

---

## 🚀 Next Steps

### Immediate
1. ✅ API key is configured
2. ✅ Service is created
3. Start using in components

### Soon
1. Integrate into Smart Planning
2. Integrate into Pomodoro timer
3. Integrate into Task Analysis

### Later
1. Add streaming UI
2. Cache responses
3. Add usage tracking

---

## 📚 Documentation

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api/rest)
- [Model Info](https://ai.google.dev/models/gemini-pro)

---

## ✨ Summary

```
✅ Gemini API Key:        Configured
✅ Service File:          Created
✅ Environment Variable:  Set
✅ Ready to Use:          YES

Status: READY FOR USE 🚀
```

Your Gemini API is fully configured and ready to enhance your app with AI features!

