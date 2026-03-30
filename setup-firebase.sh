#!/bin/bash
# Firebase Setup Script
# Run this to set up all Firebase fixes automatically

set -e

echo "================================"
echo "🚀 Firebase Setup Script"
echo "================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the Evo-1 directory:"
    echo "  cd /Users/reda/Desktop/Evo-1"
    echo "  bash setup-firebase.sh"
    exit 1
fi

# Step 1: Check if .env.local exists
echo "📝 Step 1: Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "  ⓘ .env.local not found, creating from .env.example..."
        cp .env.example .env.local
        echo "  ✅ Created .env.local"
    else
        echo "  ❌ Error: Neither .env.local nor .env.example found"
        exit 1
    fi
else
    echo "  ✅ .env.local already exists"
fi

# Step 2: Verify .env.local has credentials
echo ""
echo "🔐 Step 2: Verifying Firebase credentials..."
if grep -q "VITE_FIREBASE_PROJECT_ID" .env.local; then
    PROJECT_ID=$(grep "VITE_FIREBASE_PROJECT_ID" .env.local | cut -d '=' -f2)
    echo "  ✅ Firebase Project ID: $PROJECT_ID"
else
    echo "  ⚠️  Warning: VITE_FIREBASE_PROJECT_ID not set in .env.local"
fi

if grep -q "VITE_FIREBASE_API_KEY" .env.local; then
    API_KEY=$(grep "VITE_FIREBASE_API_KEY" .env.local | cut -d '=' -f2 | cut -c 1-20)
    echo "  ✅ Firebase API Key: $API_KEY... (hidden for security)"
else
    echo "  ⚠️  Warning: VITE_FIREBASE_API_KEY not set in .env.local"
fi

# Step 3: Check .gitignore
echo ""
echo "🔒 Step 3: Verifying .gitignore protection..."
if grep -q "\.env\.local" .gitignore; then
    echo "  ✅ .env.local is protected in .gitignore"
else
    echo "  ⚠️  Warning: .env.local not in .gitignore"
fi

if grep -q "firebase-applet-config.json" .gitignore; then
    echo "  ✅ firebase-applet-config.json is protected in .gitignore"
else
    echo "  ⚠️  Warning: firebase-applet-config.json not in .gitignore"
fi

# Step 4: Check node_modules
echo ""
echo "📦 Step 4: Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules found"
else
    echo "  ⓘ Installing dependencies..."
    npm install
    echo "  ✅ Dependencies installed"
fi

# Step 5: Verify Firebase imports
echo ""
echo "🔍 Step 5: Verifying Firebase configuration..."
if grep -q "import.meta.env.VITE_FIREBASE_PROJECT_ID" firebase.ts; then
    echo "  ✅ firebase.ts uses environment variables"
else
    echo "  ⚠️  Warning: firebase.ts may not use environment variables"
fi

if grep -q "enableIndexedDbPersistence" firebase.ts; then
    echo "  ✅ Offline persistence is enabled"
else
    echo "  ⚠️  Warning: Offline persistence may not be enabled"
fi

# Step 6: Summary
echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env.local and add any missing credentials"
echo "  2. Run: npm run dev"
echo "  3. Check browser console for:"
echo "     ✅ Firebase connection successful"
echo "     ✅ Firestore offline persistence enabled"
echo ""
echo "📚 Documentation:"
echo "  - FIREBASE_FIX_SUMMARY.md (Start here)"
echo "  - FIREBASE_FIXES_CHECKLIST.md (Quick reference)"
echo "  - FIREBASE_SETUP_GUIDE.md (Complete guide)"
echo "  - FIREBASE_CODE_REFERENCE.md (Code examples)"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
