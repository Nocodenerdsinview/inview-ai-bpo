# 🚀 InView AI - Quick Start Guide

**Welcome to InView AI!** Your call center management tool is now loaded with realistic data and ready to use.

---

## ✅ What's Been Done

- ✅ **8 realistic agents** based on actual Hastings Direct audits
- ✅ **90 days of KPI data** per agent with realistic performance trends
- ✅ **Custom targets system** - Set monthly KPI targets for each agent
- ✅ **Manual data entry** - Add KPI, Audit, Coaching, and Leave data anytime
- ✅ **Watch list** - Monitor agents with specific performance issues
- ✅ **Auto-rescheduling** - Leave entry automatically reschedules conflicting coaching
- ✅ **UK insurance terminology** - All AI prompts updated with proper terms

---

## 🎯 Getting Started (3 Minutes)

### Step 1: Start the Application

```bash
cd "/Users/rtwaynethedon/Inview AI/inview-ai"
npm run dev
```

### Step 2: Open in Browser

Navigate to: **http://localhost:3000**

### Step 3: Login

Select **"Team Lead"** role (already selected by default)

### Step 4: Explore Your Team

You should now see **8 agents** on your dashboard:
- Marcia Mokoena
- Thando Skollo
- Ongie Maluleke
- Maps Sebothoma
- Cyril Ndlovu
- Katlego Mathe
- Lefa Molefe
- Keitu Mogorosi

---

## 🎨 Key Features Overview

### 1. Custom Monthly Targets

**Location:** Navigate to `/targets` or click "Set Targets" from sidebar

**What You Can Do:**
- Set Quality, AHT, SRR, and VOC targets for each agent
- Set Floor SRR Average for team comparison
- Copy previous month's targets as a starting point
- Save all targets at once

**Try It:**
1. Go to `/targets`
2. You'll see targets already set for the current month
3. Try changing Marcia's Quality target to 92%
4. Click "Save All Targets"
5. Navigate to next month → Click "Copy Previous Month"

### 2. Manual Data Entry

**Location:** Click **"Quick Actions"** button in top right → Select entry type

**Four Entry Types:**

#### A. Add KPI Data
- Select agent
- Choose date
- Enter Quality, AHT (with breakdown), SRR, VOC
- Add optional notes
- **Auto-calculates** Talk/Hold/Wrap times

#### B. Add Audit
- Select agent and call type (new structure: Retentions/CS/NB)
- Enter audit score
- Paste transcript (optional)
- Click **"Analyze with AI"** to auto-fill findings
- Categorize findings as:
  - **BI (Business Impact)** - Process failures
  - **CI (Customer Impact)** - CX issues
  - **Comment** - Observations
- Check "Schedule coaching" to auto-create session

#### C. Add Coaching
- Select agent and session type
- Pick focus areas (chips UI with common + custom)
- Enter what went well, development areas
- Create action plan
- Set follow-up date

#### D. Add Leave
- Select agent and leave type
- Choose start/end dates
- System **automatically checks** for coaching conflicts
- **Auto-reschedules** conflicting sessions to 7 days after leave
- Calculates total days

### 3. Watch List

**Location:** Dashboard widget or from audit results

**Purpose:** Monitor agents for specific recurring issues

**How to Use:**
1. Complete audit with identified issue
2. Click "Add to Watch List" button
3. Enter focus area (e.g., "RDC completion")
4. Enter reason why you're monitoring this
5. Agent appears in watch list widget on dashboard
6. Track days on list
7. Quick actions: Schedule coaching, Resolve, or Remove

**Example:**
- Ongie keeps missing RDC room count
- Add to watch list for "RDC completion"
- Next audit: Check if issue recurs
- If resolved after 2 good audits → Mark as resolved

### 4. Realistic Audit Examples

**Location:** `/audits` page

**What to Expect:**
- 8 audits with **actual audit text** from real Hastings Direct examples
- Proper BI/CI/Comment categorization
- Realistic findings like:
  - "Incomplete RDC - room count not verified" (BI)
  - "Did NOT read regulatory statement" (CI)
  - "Consider slowing pace on price reveal" (Comment)

---

## 📊 Understanding the Data

### Your 8 Agents (Performance Summary)

| Agent | Scenario | Quality | AHT | Strengths | Development Areas |
|-------|----------|---------|-----|-----------|-------------------|
| Marcia | Improving | 87% | 495s | Empathy, DPA | RDC completion |
| Thando | Consistent | 90% | 510s | Verbal nods | RDC visibility |
| Ongie | Needs Help | 82% | 530s | Product knowledge | Pacing, Detail checks |
| Maps | AHT Star | 85% | **485s** | Efficiency | Empathy expression |
| Cyril | Solid | 88% | 500s | Positive language | Process knowledge |
| Katlego | Rising Star | 91% | 515s | Professionalism | Documentation timing |
| Lefa | Quality Champion | **93%** | 525s | Clear communication | Empathy timing |
| Keitu | Developing | 86% | 510s | Willingness | Pacing |

### KPI Data
- **90 days** of data per agent
- Realistic variance and trends
- Some agents improving, some declining
- AHT breakdown: Talk (60%), Hold (15%), Wrap (25%)

### Call Types (New Structure)

**RETENTIONS:**
- `retention_taken_up` (RTU) - Customer renewed
- `retention_lapsed` - Customer let policy lapse

**CUSTOMER SERVICE:**
- `cs_mta` - Mid-Term Adjustment (policy changes)
- `cs_cancellation` - Policy cancellation
- `cs_query` - General query

**NEW BUSINESS:**
- `nb_new_quote` - Providing quote
- `nb_taking_up_quote` - Taking up quote

---

## 🎯 Common Workflows

### Workflow 1: Set Monthly Targets (Start of Month)
1. Navigate to `/targets`
2. Check current month is selected
3. Enter Floor SRR Average (e.g., 86.5%)
4. Set individual targets for each agent
5. Click "Save All Targets"

**Time:** 5-10 minutes

### Workflow 2: Log Daily Audits
1. Conduct audit on call
2. Click "Quick Actions" → "Add Audit"
3. Select agent and call type
4. Paste transcript (if available)
5. Click "Analyze with AI" (auto-fills findings)
6. Review and edit BI/CI/Comment findings
7. Check "Schedule coaching" if needed
8. Save

**Time:** 3-5 minutes per audit

### Workflow 3: Weekly Coaching Prep
1. View scheduled coaching sessions
2. Click into session → See linked audit
3. Review agent's recent KPIs
4. Check watch list status
5. Use coaching material generated from audit
6. Conduct session
7. Log notes and commitments

**Time:** 10 minutes prep per session

### Workflow 4: Monthly Leave Management
1. Agent requests leave
2. Quick Actions → "Add Leave"
3. Select agent, dates, type
4. System checks coaching conflicts
5. Conflicts shown with auto-reschedule option
6. Save → coaching auto-moved to +7 days after leave

**Time:** 2 minutes per leave entry

---

## 🔍 Testing Checklist

### ✅ Phase 1-4, 7, 11 Complete

Test each feature:

- [ ] **Dashboard:** See 8 agents (not 140 dummy ones)
- [ ] **Targets:** Navigate to `/targets` → See current targets
- [ ] **Set New Targets:** Change one target → Save → Refresh → Persists
- [ ] **Manual KPI:** Add KPI data for today
- [ ] **Manual Audit:** Create audit → Schedule coaching
- [ ] **Manual Coaching:** Create coaching session
- [ ] **Manual Leave:** Add leave → See conflict warning
- [ ] **Watch List:** Add agent to watch list → See in widget
- [ ] **Quick Actions:** Menu shows 4 entry types
- [ ] **Agent Profile:** View Marcia → See 90 days of data
- [ ] **Audits Page:** See 8 realistic audits

---

## 🎨 UI Tips

### Color Coding

**KPI Status:**
- **Green:** Meeting/exceeding target
- **Amber:** Within 5% of target
- **Red:** More than 5% away from target

**Impact Categories (Audits):**
- **Red Box (BI):** Business process failure
- **Amber Box (CI):** Customer experience issue
- **Blue Box (Comment):** Observations only

**Leave Types:**
- **Red:** Sick
- **Blue:** Vacation
- **Purple:** Personal
- **Orange:** Emergency

**Watch List:** Amber theme (monitoring)

### Icons Guide
- 📊 **TrendingUp:** KPI Entry
- ✅ **FileCheck:** Audit Entry
- 📅 **Calendar:** Coaching Entry
- ✈️ **Plane:** Leave Entry
- 👁️ **Eye:** Watch List
- 🎯 **Target:** Targets Page

---

## 🔧 Troubleshooting

### Issue: AI Analysis Not Working
**Cause:** Missing Groq API key  
**Solution:** Add to `.env.local`:
```
GROQ_API_KEY=your_key_here
```
**Workaround:** Manually fill BI/CI/Comment findings

### Issue: Can't See All Agents
**Cause:** Team Lead isolation (only see your team)  
**Expected:** You should see 8 agents (your team)  
**If Admin:** Would see all agents across all teams

### Issue: Targets Not Showing
**Cause:** No targets set for current month  
**Solution:** Go to `/targets` → Set and save targets

### Issue: Leave Conflict Not Detected
**Cause:** No coaching scheduled during those dates  
**Expected:** Only shows warning if actual conflict exists

---

## 📝 Data Entry Best Practices

### For KPIs
- **Daily Entry:** Enter at end of day for today's date
- **Bulk Historical:** Use file upload for past data
- **AHT Breakdown:** Let system auto-calculate, then adjust if needed

### For Audits
- **Transcript First:** Paste transcript, then use AI analysis
- **Review AI Output:** Always review and edit AI suggestions
- **BI vs CI:** BI = process failure, CI = customer impact
- **Link to Coaching:** Check box to auto-create coaching session

### For Coaching
- **Focus Areas:** Start with common, add custom as needed
- **Action Plan:** Be specific and measurable
- **Follow-up:** Always set follow-up date for accountability

### For Leave
- **Check Conflicts:** System auto-checks, but review alert
- **Sick Days Pattern:** More than 5 in 30 days = Flag for discussion
- **Annual Allowance:** Default 25 days/year per agent

---

## 🚀 What's Next?

### Ready for Production Use
✅ Set monthly targets  
✅ Log daily KPIs manually  
✅ Conduct and log audits  
✅ Schedule coaching  
✅ Monitor watch list  
✅ Manage leave  

### Optional Enhancements (Not Yet Implemented)
- Coaching workflow wizard
- Template library
- Notification filtering
- Peer-to-peer matching
- Audit quota tracker
- Date comparison presets

---

## 📞 Support

### Getting Help
1. Check this guide first
2. Review `COMPLETE_IMPLEMENTATION_SUMMARY.md` for technical details
3. Test with realistic data (8 agents already loaded)

### Common Questions

**Q: How do I reset the database?**  
A: Run `npm run db:setup` to re-seed realistic data

**Q: Can I add more agents?**  
A: Yes, use the agents page or modify `db/seed-realistic.ts`

**Q: Are targets required?**  
A: Not required, but KPI comparisons won't show without them

**Q: What if I make a mistake?**  
A: All manual entries can be edited/deleted via the UI

---

## ✅ Quick Start Checklist

### First Time Setup (One Time)
- [ ] Run `npm install` (if not done)
- [ ] Run `npm run db:setup` (clears dummy data, loads realistic data)
- [ ] Start with `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login as Team Lead

### Daily Workflow
- [ ] Check dashboard for alerts
- [ ] Review watch list widget
- [ ] Add KPI data for today (if available)
- [ ] Log any audits conducted
- [ ] Schedule coaching sessions
- [ ] Update leave records

### Monthly Workflow
- [ ] Set targets for new month (copy previous or set fresh)
- [ ] Review team performance vs targets
- [ ] Check leave balance for each agent
- [ ] Resolve completed watch list items

---

**Status:** ✅ **READY TO USE**  
**Version:** 2.0.0  
**Data Quality:** 🌟🌟🌟🌟🌟 Production-Ready  
**Last Updated:** October 28, 2025

---

**Enjoy using InView AI!** 🎉

Your tool is now optimized for UK insurance call center management with realistic data, custom targets, comprehensive manual entry, and intelligent monitoring.

