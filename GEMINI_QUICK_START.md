# 🚀 Gemini Secure API - Quick Start (5 Minutes)

## Checklist

### ✅ Step 1: Create Backend Files (1 min)

- [ ] Create directory: `/pages/api/`
- [ ] Create file: `/pages/api/generate.ts` (copy from GEMINI_CODE_REFERENCE.md)
- [ ] Create file: `/services/geminiServiceClient.ts` (copy from GEMINI_CODE_REFERENCE.md)

### ✅ Step 2: Setup Environment (1 min)

- [ ] Create `.env.local` in project root
- [ ] Add: `GEMINI_API_KEY=your_actual_api_key`
- [ ] Get key from: https://aistudio.google.com/app/apikey
- [ ] Verify `.env.local` in `.gitignore`
- [ ] Create `.env.example` (no real key)

### ✅ Step 3: Update Configuration (1 min)

- [ ] Create `next.config.js` (copy from GEMINI_CODE_REFERENCE.md)
- [ ] Update `package.json` scripts (dev → next dev, build → next build)
- [ ] Update `tsconfig.json` (copy from GEMINI_CODE_REFERENCE.md)

### ✅ Step 4: Install Dependencies (1 min)

```bash
npm install next @google/generative-ai
```

### ✅ Step 5: Test Locally (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000/api/generate

Test with curl:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello"}'
```

Expected:
```json
{
  "success": true,
  "text": "Hello! How can I help you today?"
}
```

---

## Update Your Components

### Find & Replace

Search for:
```
import { geminiService }
```

Replace with:
```
import { geminiServiceClient }
```

Then update all calls:
```
geminiService.generateText()  →  geminiServiceClient.generateText()
geminiService.generateTaskPlan()  →  geminiServiceClient.generateTaskPlan()
```

---

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Secure Gemini API implementation"
git push origin main
```

### Step 2: Connect to Vercel
1. Go: https://vercel.com
2. Click: "Add New" → "Project"
3. Select your GitHub repository
4. Click: "Deploy"

### Step 3: Add Environment Variable
1. In Vercel dashboard: Settings → Environment Variables
2. Add: `GEMINI_API_KEY` = your_actual_key
3. Select: All environments (Production, Preview, Development)
4. Click: "Add"
5. Click: "Deployments" → "..." → "Redeploy"

### Step 4: Test Production
```bash
curl -X POST https://your-domain.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello"}'
```

---

## Done! 🎉

Your Gemini API is now:
- ✅ Secure (API key hidden)
- ✅ Deployed on Vercel
- ✅ Works everywhere (not just local)

---

## Troubleshooting (2 min)

### "Cannot find module 'next'"
```bash
npm install next
```

### "GEMINI_API_KEY is not configured"
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add: `GEMINI_API_KEY` with your real key

### "Build failed"
1. Check Vercel build logs
2. Fix locally: `npm run dev`
3. Test: `npm run build`

### Still have issues?
Read full guides:
- GEMINI_SECURE_IMPLEMENTATION.md (detailed setup)
- GEMINI_VERCEL_DEPLOYMENT.md (deployment guide)
- GEMINI_CODE_REFERENCE.md (code examples)

---

## Files Created

- ✅ `/pages/api/generate.ts` - Backend API route
- ✅ `/services/geminiServiceClient.ts` - Frontend service
- ✅ `/next.config.js` - Next.js config
- ✅ `.env.local` - Local API key (not committed)
- ✅ `.env.example` - Template
- ✅ Documentation guides

---

## Next

1. Update your components to use `geminiServiceClient`
2. Test locally with `npm run dev`
3. Deploy to Vercel
4. Add environment variable in Vercel
5. Done!

Questions? Check the full documentation files. ✨

