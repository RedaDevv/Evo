# Gemini Secure API - Vercel Deployment Guide

## Overview

This guide walks you through deploying your Evo application with a secure Gemini API backend to Vercel.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier is fine)
- ✅ Google Gemini API key
- ✅ Your code on GitHub

---

## Step 1: Prepare Your Code

### 1.1 Verify File Structure

Make sure you have these files in your project:

```
your-project/
├── pages/
│   └── api/
│       └── generate.ts          ✅ Backend API route
├── services/
│   └── geminiServiceClient.ts   ✅ Frontend service
├── .env.local                   ✅ Local env variables
├── .env.example                 ✅ Example template
├── .gitignore                   ✅ Should include .env.local
├── package.json                 ✅ Updated with Next.js
├── next.config.js              ✅ Next.js configuration
└── tsconfig.json               ✅ Updated for Next.js
```

### 1.2 Create `.env.example`

```bash
# This file shows what environment variables are needed
# Don't put actual values here!
GEMINI_API_KEY=your_key_here_not_real
```

### 1.3 Verify `.gitignore`

Make sure `.gitignore` includes:

```
.env.local
.env*.local
node_modules/
dist/
.next/
out/
```

### 1.4 Create `next.config.js`

If you don't have it, create it in your project root:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

---

## Step 2: Update package.json

Your `package.json` should have these scripts:

```json
{
  "name": "evo",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@google/generative-ai": "^0.12.0",
    "firebase": "^12.10.0",
    "framer-motion": "^12.38.0",
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

## Step 3: Local Testing

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Create `.env.local`

```bash
GEMINI_API_KEY=your_actual_api_key_from_google
```

Get your key from: https://aistudio.google.com/app/apikey

### 3.3 Run Development Server

```bash
npm run dev
```

### 3.4 Test the API

In your browser or terminal:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello"}'
```

Expected response:
```json
{
  "success": true,
  "text": "Hello! How can I help you today?"
}
```

---

## Step 4: Push to GitHub

### 4.1 Commit Changes

```bash
git add .
git commit -m "Add secure Gemini API backend for Vercel deployment"
git push origin main
```

### 4.2 Verify on GitHub

1. Go to your GitHub repository
2. Check that `.env.local` is NOT in the repository (should be in .gitignore)
3. Verify these files are present:
   - `pages/api/generate.ts`
   - `services/geminiServiceClient.ts`
   - `next.config.js`
   - `package.json` with updated scripts

---

## Step 5: Connect to Vercel

### 5.1 Go to Vercel Dashboard

1. Visit https://vercel.com
2. Click "Dashboard" (top right)
3. Click "Add New" → "Project"

### 5.2 Import GitHub Repository

1. Click "Import Project"
2. Select "Import Git Repository"
3. Search for your repository name
4. Click "Select"

### 5.3 Configure Project

1. **Project name**: `evo` (or your preferred name)
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `.` (or leave blank)
4. **Build & Development Settings**: Click "Override" if needed

### 5.4 Add Environment Variables

⚠️ **IMPORTANT**: Add your API key HERE, not in the code!

1. Scroll down to "Environment Variables"
2. Click "Add Environment Variable"
3. Fill in:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Google Gemini API key
   - **Environments**: Check all boxes (Production, Preview, Development)
4. Click "Add"
5. You should see one environment variable listed

### 5.5 Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. When done, you'll see a checkmark ✅
4. Your site URL will be shown (e.g., `https://evo-abc123.vercel.app`)

---

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

1. Go to your project on Vercel dashboard
2. Look for "Production" deployment
3. Should see green checkmark ✅

### 6.2 Test the API Endpoint

Replace `YOUR_DOMAIN` with your Vercel domain:

```bash
curl -X POST https://YOUR_DOMAIN.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List 2 productivity tips"}'
```

Example:
```bash
curl -X POST https://evo-abc123.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List 2 productivity tips"}'
```

Expected response:
```json
{
  "success": true,
  "text": "Here are 2 productivity tips:\n\n1. Time blocking..."
}
```

### 6.3 Visit Your App

1. Click the preview URL in Vercel dashboard
2. Your app should load
3. Try using any Gemini AI features
4. They should work without errors!

---

## Step 7: Troubleshooting

### Issue: "Build Failed"

**Check the build logs:**
1. Click "Deployments" in Vercel
2. Click the failed deployment
3. Look for error messages

**Common causes:**
- Missing `next.config.js`
- TypeScript errors in `/pages/api/generate.ts`
- Missing `@google/generative-ai` in `package.json`

**Fix:**
1. Fix the error locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel will auto-redeploy

### Issue: "GEMINI_API_KEY is not configured"

**Causes:**
- Environment variable not added to Vercel
- Wrong variable name (should be exactly `GEMINI_API_KEY`)
- Variable added after deployment

**Fix:**
1. Go to Vercel project Settings
2. Click "Environment Variables"
3. Verify `GEMINI_API_KEY` exists
4. Verify it has the correct value (your API key)
5. Redeploy: Click "Deployments" → "..." → "Redeploy"

### Issue: "Cannot find module '@google/generative-ai'"

**Cause:** Dependency not installed on Vercel

**Fix:**
1. Verify in `package.json`: `"@google/generative-ai": "^0.12.0"`
2. Commit and push
3. Vercel will reinstall dependencies and redeploy

### Issue: API returns 500 error

**Check the API logs:**
1. In Vercel: Functions → Click `/api/generate`
2. Look at the logs
3. Common issues:
   - Invalid API key
   - API quota exceeded
   - Gemini API service down

**Fix:**
1. Verify API key is correct
2. Check Google Cloud Console for quota/usage
3. Try again in a few minutes

### Issue: API key appears in browser Network tab

**Is this a problem?**
- ✅ Normal! Network requests go to your backend
- ✅ The request shows the prompt (not the API key)
- ✅ Response doesn't contain your API key

**Verify security:**
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Make a request to generate content
4. Click the `/api/generate` request
5. Look at "Request" → You see: `{"prompt": "..."}`
6. Look at "Response" → You see: `{"success": true, "text": "..."}`
7. Your actual API key should NOT appear anywhere!

---

## Step 8: Updates & Changes

### Updating Code

1. Make changes locally
2. Test with `npm run dev`
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push origin main`
5. Vercel auto-deploys (check dashboard)

### Updating Environment Variables

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Click the variable to edit
4. Update value
5. Redeploy: Deployments → "..." → "Redeploy"

### Regenerating API Key (Security)

If your API key is compromised:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Delete the old key
3. Create a new key
4. Update in Vercel environment variables
5. Redeploy

---

## Monitoring & Maintenance

### Check Analytics

1. Vercel dashboard → Your project
2. Click "Analytics"
3. View:
   - Requests
   - Performance
   - Errors

### View Function Logs

1. Click "Functions" (in project menu)
2. Click `/api/generate`
3. View real-time logs of API calls

### Monitor Error Rate

1. Click "Monitoring"
2. View error trends
3. Click errors for details

---

## Performance Optimization

### Cache Responses (Optional)

If you want to cache Gemini responses, add to `/pages/api/generate.ts`:

```typescript
// Cache successful responses for 60 seconds
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
```

### Rate Limiting (Optional)

Add rate limiting to prevent abuse:

```typescript
// Add this near the top of the handler
const rateLimit = new Map<string, number[]>();

const rateLimitCheck = (ip: string): boolean => {
  const now = Date.now();
  const times = rateLimit.get(ip) || [];
  const recent = times.filter(t => now - t < 60000); // Last 60 seconds
  
  if (recent.length > 30) return false; // Max 30 requests per minute
  
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
};
```

---

## Production Checklist

- [ ] Code on GitHub
- [ ] Project connected to Vercel
- [ ] `GEMINI_API_KEY` added to Vercel environment variables
- [ ] Build succeeded on Vercel (green checkmark)
- [ ] `/api/generate` endpoint works
- [ ] Gemini features work in production
- [ ] No API key exposed in frontend code
- [ ] `.env.local` in `.gitignore`
- [ ] Error handling works (test with invalid prompt)
- [ ] Performance acceptable

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all Gemini features
3. ✅ Monitor for errors
4. ✅ Gather user feedback
5. ✅ Iterate and improve

## Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Generative AI](https://ai.google.dev/)
- [API Keys - Google AI Studio](https://aistudio.google.com/app/apikey)

---

**Questions?** Check:
1. Vercel build logs
2. Function logs in Vercel dashboard
3. Browser console (DevTools)
4. Network tab (DevTools)

Good luck! 🚀

