# 🚀 Quick Start - 4 Simple Steps

## ✅ What's Already Done
All code is ready! I've built everything for you. You just need to:

---

## Step 1: Create GitHub Repository (5 min)
```bash
# 1. Go to github.com → New Repository
#    Name: inview-ai-bpo
#    Privacy: Private
#    DON'T initialize with README

# 2. In Terminal:
cd "/Users/rtwaynethedon/Inview AI/inview-ai"
git remote add origin https://github.com/YOUR_USERNAME/inview-ai-bpo.git
git push -u origin main
```

---

## Step 2: Create Supabase Project (10 min)
```bash
# 1. Go to supabase.com → Sign up → New Project
#    Name: inview-ai-production
#    Region: Europe West (London)
#    Choose strong password (save it!)

# 2. In Supabase → SQL Editor → New Query
#    Copy ALL contents from:
#    supabase/migrations/001_initial_schema.sql
#    Paste and Run

# 3. Get your API keys:
#    Settings → API → Copy these:
#    - Project URL
#    - anon public key  
#    - service_role key (click Reveal)
```

---

## Step 3: Add API Keys (3 min)
Open `.env.local` and add:
```bash
# Keep existing
GROQ_API_KEY=your_key_here

# Add new (replace with YOUR actual keys from Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## Step 4: Migrate Data (5 min)
```bash
cd "/Users/rtwaynethedon/Inview AI/inview-ai"

# Run migration
npx tsx scripts/migrate-to-supabase.ts

# Should see: ✅ Migration completed successfully!

# Start app
npm run dev

# Visit: http://localhost:3000
```

---

## 🎉 Done!

### What You Now Have:
✅ Cloud database (no more losing data!)
✅ GitHub backup (undo any mistake)
✅ Enhanced AI (20 expert prompts)
✅ Agent management (add/archive/reactivate)
✅ Production-ready infrastructure

### Your New Workflow:
```bash
# Add agent when someone joins
# (We can add a UI button for this later)
curl -X POST http://localhost:3000/api/agents/create \
  -H "Content-Type: application/json" \
  -d '{"name": "John Smith", "team": "Team 1"}'

# Archive agent when someone leaves (keeps ALL data)
curl -X POST http://localhost:3000/api/agents/123/archive

# Push code changes
git add .
git commit -m "description of changes"
git push
```

---

## 📚 Full Details
See `SETUP_GUIDE.md` for complete step-by-step instructions with screenshots and troubleshooting.

---

**Need Help?** Just follow the steps in order. Everything is ready to go!

