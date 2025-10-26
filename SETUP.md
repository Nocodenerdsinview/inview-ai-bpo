# Inview AI - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Your Groq API Key

1. Go to https://console.groq.com
2. Sign up for a free account (no credit card required)
3. Navigate to "API Keys" in the dashboard
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

### Step 2: Configure Environment

1. Open the project in your code editor
2. Create a file named `.env.local` in the root directory (`inview-ai/`)
3. Add your API key:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

**Important**: Replace `gsk_your_actual_key_here` with your actual Groq API key!

### Step 3: Run the Application

```bash
# Make sure you're in the inview-ai directory
cd "/Users/rtwaynethedon/Inview AI/inview-ai"

# Start the development server
npm run dev
```

### Step 4: Open Your Browser

Navigate to: **http://localhost:3000**

You should see the Inview AI dashboard with 10 agents and 90 days of mock data!

## 🎉 You're Done!

The database is already set up with realistic mock data. You can now:

- **Browse the dashboard** to see team KPIs and agent cards
- **Click on any agent** to view their detailed profile
- **Try the AI Coaching Generator** (requires Groq API key)
- **Explore insights** to see AI-powered pattern recognition
- **View audits, coaching sessions, and leave records**

## Testing AI Features

### Generate Coaching Material

1. Go to **Coaching** → **Generate**
2. Select an agent (e.g., "Michael Brown")
3. Optionally add a transcript or observations
4. Click "Generate Coaching Material"
5. Wait ~5-10 seconds for AI to generate

The AI will create a structured coaching document with:
- ✅ What Went Well
- ⚠ Development Areas
- 💡 Ideal Approach
- 🎯 Action Plan

## Groq Free Tier

The free tier includes:
- **30 requests/minute**
- **14,400 requests/day**
- **Access to llama-3.1 and mixtral models**

This is more than enough for development and testing!

## Troubleshooting

### "Failed to generate AI response"

**Cause**: Groq API key not configured or invalid

**Solution**:
1. Check `.env.local` exists in the project root
2. Verify the API key is correct (no extra spaces)
3. Restart the dev server: Stop (`Ctrl+C`) and run `npm run dev` again

### Database is empty

**Cause**: Database not seeded

**Solution**:
```bash
npm run db:setup
```

### Port 3000 already in use

**Cause**: Another application is using port 3000

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Next Steps

Once you're comfortable with the platform:

1. **Explore the codebase**: Start with `app/dashboard/page.tsx`
2. **Customize the data**: Edit `db/seed.ts` to match your team
3. **Add real data**: Implement the upload functionality in `app/uploads/page.tsx`
4. **Extend AI features**: Modify prompts in `lib/groq.ts`
5. **Deploy**: Build for production with `npm run build`

## Need Help?

- **Documentation**: See `README.md` for full documentation
- **Groq Docs**: https://console.groq.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

Happy coaching! 🚀


