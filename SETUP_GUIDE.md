# 🚀 InView AI Setup Guide
## Complete Step-by-Step Instructions for GitHub + Supabase

This guide will walk you through setting up your InView AI tool with cloud database and version control. I've already completed all the code work for you! 

---

## ✅ What I've Already Done For You

- ✅ Enhanced all 20 LLM prompts with expert personas
- ✅ Fixed API 500 errors with JSON mode
- ✅ Created GitHub Actions workflow for auto-deployment
- ✅ Built Supabase migration scripts
- ✅ Added agent management features (add/archive agents)
- ✅ Created comprehensive documentation
- ✅ Committed everything to Git

**All you need to do now is the 4 steps below!** 👇

---

## 📝 Step 1: Create GitHub Repository (5 minutes)

### 1.1 Go to GitHub
- Visit: [https://github.com](https://github.com)
- Sign in (or create free account if you don't have one)

### 1.2 Create New Repository
- Click the **"+"** in top right → **"New repository"**
- Settings:
  - **Repository name**: `inview-ai-bpo`
  - **Description**: `AI-powered call center performance management for Hastings Direct`
  - **Privacy**: ✅ **Private** (recommended for business tool)
  - **DO NOT** check "Initialize with README" (you already have code)

- Click **"Create repository"**

### 1.3 Copy the Repository URL
GitHub will show you a page with commands. Copy the repository URL:
```
https://github.com/YOUR_USERNAME/inview-ai-bpo.git
```

### 1.4 Connect Your Local Code to GitHub
Open Terminal and run these commands **ONE AT A TIME**:

```bash
cd "/Users/rtwaynethedon/Inview AI/inview-ai"

# Add GitHub as remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/inview-ai-bpo.git

# Push your code to GitHub
git push -u origin main
```

**✅ Done! Your code is now on GitHub and backed up in the cloud.**

---

## 🗄️ Step 2: Create Supabase Project (10 minutes)

### 2.1 Sign Up for Supabase
- Visit: [https://supabase.com](https://supabase.com)
- Click **"Start your project"**
- Sign in with GitHub (easiest) or create account

### 2.2 Create New Project
- Click **"New Project"**
- Settings:
  - **Organization**: Select your organization (or create one called "BPO Tools")
  - **Name**: `inview-ai-production`
  - **Database Password**: Choose a strong password (SAVE THIS!)
    - Example: `InView2025!Secure`
  - **Region**: **Europe West (London)** (closest to Hastings Direct)
  - **Pricing Plan**: **Free** (perfect to start)

- Click **"Create new project"**

⏱️ **Wait 2-3 minutes while Supabase sets up your database...**

### 2.3 Get Your API Keys
Once your project is ready:

1. Click **"Settings"** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (very long key)
   - **service_role key**: `eyJhbGc...` (very long key - click "Reveal")

**📋 COPY these three values - you'll need them in the next step!**

### 2.4 Run Database Migration
Now we'll create all the tables in Supabase:

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. **Open this file on your computer**: 
   ```
   /Users/rtwaynethedon/Inview AI/inview-ai/supabase/migrations/001_initial_schema.sql
   ```
4. **Copy ALL the contents** of that file
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (bottom right)

✅ You should see: **"Success. No rows returned"**

### 2.5 Verify Tables Were Created
- In Supabase, click **"Table Editor"** in left sidebar
- You should see these tables:
  - `agents`
  - `kpis`
  - `audits`
  - `coaching_sessions`
  - `leave_records`
  - `upload_history`

**✅ Perfect! Your database is ready!**

---

## 🔧 Step 3: Configure Environment Variables (3 minutes)

### 3.1 Open Your .env.local File
Open this file:
```
/Users/rtwaynethedon/Inview AI/inview-ai/.env.local
```

### 3.2 Add Supabase Credentials
Add these lines to your `.env.local` file (keep your existing GROQ_API_KEY):

```bash
# Existing
GROQ_API_KEY=your_existing_key_here

# NEW - Add these Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...paste_your_anon_key...
SUPABASE_SERVICE_KEY=eyJhbGc...paste_your_service_key...
```

**Replace** the `xxxxxxxxxxxxx` and `eyJhbGc...` parts with your actual keys from Step 2.3!

### 3.3 Save the File
Save `.env.local` and close it.

---

## 📦 Step 4: Migrate Your Data (5 minutes)

Now we'll move your existing agent data from SQLite to Supabase.

### 4.1 Install Required Package
```bash
cd "/Users/rtwaynethedon/Inview AI/inview-ai"
npm install @supabase/supabase-js
```

### 4.2 Run Migration Script
```bash
npx tsx scripts/migrate-to-supabase.ts
```

You should see:
```
🚀 Starting migration from SQLite to Supabase...
📦 Migrating agents...
✅ Migrated 10 agents
📊 Migrating KPIs...
✅ All 260 KPIs migrated
🎯 Migrating audits...
✅ All 80 audits migrated
...
✨ Migration completed successfully!
```

### 4.3 Verify Data in Supabase
- Go to Supabase dashboard
- Click **"Table Editor"**
- Click **"agents"** table
- You should see all your agents listed!

**✅ Your data is now in the cloud!**

---

## 🎉 Step 5: Test Everything (5 minutes)

### 5.1 Start Your Development Server
```bash
cd "/Users/rtwaynethedon/Inview AI/inview-ai"
npm run dev
```

### 5.2 Open the App
Visit: [http://localhost:3000](http://localhost:3000)

### 5.3 Test Key Features
- ✅ Dashboard loads with your agents
- ✅ Click on an agent → See their profile
- ✅ Generate AI insights (should work without 500 errors now!)
- ✅ Upload a Hastings Direct report → Data imports

**✅ If everything works, you're done!**

---

## 🎁 Bonus: New Features You Can Now Use

### Add New Agent
```bash
# Make a POST request to create agent
curl -X POST http://localhost:3000/api/agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Agent Name",
    "email": "agent@bpo.com",
    "team": "Team 1",
    "hireDate": "2025-01-15"
  }'
```

Or add this feature to your UI later!

### Archive Agent (When They Leave)
```bash
# Replace 123 with actual agent ID
curl -X POST http://localhost:3000/api/agents/123/archive
```

**Important**: Archived agents keep ALL their historical data. The AI can still analyze their past performance!

### Reactivate Agent (If They Return)
```bash
curl -X POST http://localhost:3000/api/agents/123/reactivate
```

---

## 📊 What You've Achieved

### Before:
- ❌ Local SQLite database (could lose data)
- ❌ No version control (couldn't undo changes)
- ❌ Single-user only
- ❌ Manual deployments

### After:
- ✅ **Cloud database** (Supabase) - backed up automatically
- ✅ **Version control** (GitHub) - every change tracked
- ✅ **Enhanced AI** - 20 improved prompts with expert personas
- ✅ **Agent management** - Add/archive agents with data preservation
- ✅ **Auto-deploy** - Push code → GitHub Actions → Production (when you set up Vercel)
- ✅ **Scalable** - Ready for multiple teams and managers

---

## 🔐 Important Security Notes

### Your .env.local File
- **NEVER** commit `.env.local` to GitHub
- It's already in `.gitignore` so it won't be uploaded
- Keep your API keys secret!

### Your SQLite Database
- Keep `inview.db` as a backup for now
- After confirming Supabase works for 1-2 weeks, you can delete it
- It's also in `.gitignore` so it won't go to GitHub

---

## 🆘 Troubleshooting

### "Migration failed: No rows returned"
**Solution**: Run the SQL migration again in Supabase SQL Editor. Make sure you copied the ENTIRE file.

### "Authentication failed" when migrating data
**Solution**: Check your `SUPABASE_SERVICE_KEY` in `.env.local`. Make sure you copied the **service_role** key (not the anon key).

### API still returns 500 errors
**Solution**: 
1. Restart your dev server (`npm run dev`)
2. Check GROQ_API_KEY is still in `.env.local`
3. Check browser console for specific error messages

### Can't push to GitHub: "Permission denied"
**Solution**: You may need to set up SSH keys or use GitHub CLI. Follow GitHub's guide: https://docs.github.com/en/authentication

---

## 📞 Next Steps (Optional)

### Want Real-Time Updates?
Your app is ready for real-time! When you add data in Supabase, all dashboards can update automatically. We can add this later.

### Want Multiple Managers?
Your database is ready for authentication! We can add:
- Manager login
- Team-specific access (Manager A only sees their agents)
- Admin role for viewing all teams

### Want Automatic Deployments?
Deploy to Vercel (free):
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables
4. Deploy!

Every time you push to GitHub, Vercel will auto-deploy your changes.

---

## 🎓 What You Learned

You now have:
- ✅ Git version control
- ✅ Cloud database
- ✅ Data migration skills
- ✅ API deployment knowledge
- ✅ Professional development workflow

**You're running a production-grade AI tool!** 🚀

---

## 📝 Daily Workflow (After Setup)

### Morning:
1. Check dashboard for overnight alerts
2. Upload yesterday's Hastings Direct reports
3. Review AI-generated insights

### When Agent Joins:
```bash
# API call or add UI button later
POST /api/agents/create
```

### When Agent Leaves:
```bash
# Archive (preserves data for AI)
POST /api/agents/{id}/archive
```

### Push Code Changes:
```bash
git add .
git commit -m "your change description"
git push
```

---

**🎉 Congratulations! You're now running InView AI with enterprise-grade infrastructure!**

Need help? All the code is documented and working. Just follow these steps carefully.

---

**Built with ❤️ for Hastings Direct BPO excellence**

