# 🚀 Bulk Coaching Scheduler - Quick Start Guide

## Quick Access

### Method 1: From Coaching Page (Recommended)
1. Navigate to **`/coaching`**
2. Click the green **"Bulk Schedule"** button (top right)
3. Follow the wizard

### Method 2: From Dashboard Quick Actions (Optional)
- Configure `QuickActions` component with `onBulkSchedule` handler

---

## 📋 Step-by-Step Usage

### Step 1: Select Agents
- Click on agent cards to select (green border = selected)
- Use **"Select All"** for everyone
- Use **"Clear All"** to reset
- Shows selection count in real-time
- Click **"Next: Configure Sessions"**

### Step 2: Configure Sessions
Fill in the following:

#### 📅 Start Date
- Pick when scheduling should begin
- System will auto-advance if conflicts found

#### ⏰ Time Slots
- Add multiple time slots (e.g., 09:00, 10:00, 14:00)
- Sessions will rotate through these times
- Remove unwanted slots by clicking the X

#### 🎯 Session Type
- **Scheduled** - Regular coaching (Blue)
- **Urgent** - Performance issues (Red)
- **Follow-up** - Previous session follow-up (Green)

#### 📝 Focus Areas
- Add tags for what coaching will cover
- Examples: "AHT Improvement", "Quality Score", "SRR Discussion"
- Remove by clicking X on tag

#### ⏱️ Duration
- Set minutes per session (default: 60)
- Use 15-minute increments

#### 🔄 Auto-Reschedule
- ✅ **ON** (Recommended): Automatically finds next available date if agent on leave
- ❌ **OFF**: Skips agents who are on leave

Click **"Check Availability"**

### Step 3: Review
System checks:
- ✅ Leave data currency (warns if >7 days old)
- ✅ Each agent's availability
- ✅ Upcoming leave days
- ✅ Existing coaching count

**Warning Signs:**
- 🟠 Orange box = Leave data not recent
- 🟢 Green agent card = Available
- 🟠 Orange agent card = On leave or issues

**Summary shows:**
- Number of agents
- Start date
- Time slots
- Duration
- Focus areas

Click **"Confirm & Schedule"**

### Step 4: Results
See:
- ✅ **Scheduled Sessions** - Successfully booked
- ⚠️ **Skipped Agents** - Who couldn't be scheduled and why
- ⚠️ **Warnings** - Any issues to be aware of

Click **"Done"** to close

---

## 📅 Using Calendar View

### Switch to Calendar
1. On coaching page, click **"Calendar View"** tab
2. Navigate months with **< >** arrows
3. Click **"Today"** to return to current month

### Reading the Calendar

#### Session Cards
- **Time** displayed at top (e.g., 09:00)
- **Agent name** below time
- **Avatar** on left (if available)
- **✅ Green check** = Prep work ready
- **Color** indicates type:
  - 🔵 Blue = Scheduled
  - 🟢 Green = Follow-up
  - 🔴 Red = Urgent
  - ⚫ Gray = Completed

#### Hover for Details
Hover over a session with ✅ to see prep work details:
- ✓ What Went Well
- ✓ Development Areas
- ✓ Action Plan

#### Legend
Bottom of calendar shows color meanings

---

## 🎯 Common Use Cases

### Use Case 1: Monthly Coaching Round
**Scenario:** Schedule all 20 agents for regular check-ins

**Steps:**
1. Select all agents
2. Start date: Beginning of next week
3. Time slots: 09:00, 10:00, 11:00, 14:00, 15:00
4. Type: Scheduled
5. Focus: "Monthly Check-in"
6. Auto-reschedule: ON

**Result:** 20 sessions across 4-5 days, no conflicts

---

### Use Case 2: Urgent Performance Coachings
**Scenario:** 5 agents flagged for low scores, need immediate coaching

**Steps:**
1. Select 5 specific agents
2. Start date: Today or tomorrow
3. Time slots: 13:00, 14:00, 15:00, 16:00
4. Type: Urgent
5. Focus: "Performance Improvement", "Quality Issues"
6. Auto-reschedule: OFF (need it done fast)

**Result:** 5 urgent sessions ASAP, marked in red

---

### Use Case 3: Follow-up After Training
**Scenario:** Team completed training, schedule follow-ups in 2 weeks

**Steps:**
1. Select relevant team members
2. Start date: 2 weeks from now
3. Time slots: 10:00, 11:00, 14:00
4. Type: Follow-up
5. Focus: "Training Application", "Questions/Concerns"
6. Auto-reschedule: ON

**Result:** Follow-up sessions scheduled post-training

---

## ⚠️ Important Notes

### Before You Start
1. **Update Leave Records**: Ensure all team leave is loaded
   - System warns if no leave data from last 7 days
   - Better to update before bulk scheduling
2. **Check Your Availability**: System prevents double-booking you
3. **Agent Capacity**: Each agent max 1 coaching per day

### During Scheduling
- **Weekends Skipped**: System auto-skips Sat/Sun
- **30-Day Limit**: Won't search beyond 30 days for slots
- **Fair Distribution**: Agents with fewer coachings scheduled first

### After Scheduling
- **Calendar Updates**: New sessions appear immediately
- **Notifications**: Consider manually notifying agents
- **Prep Work**: Generate AI prep for each session as needed

---

## 🐛 Troubleshooting

### "Leave data warning" appears
**Solution:** Update leave records, then try again

### "Could not find available slot within 30 days"
**Cause:** Agent has extensive leave or too many existing coachings
**Solution:** 
- Check agent's schedule manually
- Reduce number of agents per run
- Use more time slots

### Agent keeps getting skipped
**Cause:** On extended leave or fully booked
**Solution:**
- Check attendance records
- View agent's profile for details
- Schedule manually after return

### Sessions not appearing in calendar
**Cause:** May be in different month
**Solution:**
- Use month navigation arrows
- Check "List View" for all sessions
- Refresh page if needed

---

## 💡 Pro Tips

1. **Stagger Types**: Mix scheduled/urgent to balance workload
2. **Morning Slots**: Often fill fastest, add extra AM times
3. **Buffer Time**: Leave gaps between your own meetings
4. **Prep Ahead**: Generate AI prep immediately after scheduling
5. **Weekly Batches**: Schedule week-by-week vs. all at once
6. **Save Templates**: Keep common focus area sets handy
7. **Review First**: Always check availability before confirming
8. **Export Calendar**: Print month view for wall calendar

---

## 📊 What Gets Tracked

When you bulk schedule, the system records:
- ✅ Agent ID
- ✅ Date & Time
- ✅ Session Type
- ✅ Focus Areas
- ✅ Status (scheduled)
- ✅ Created timestamp
- ✅ Auto-generated session ID

This enables:
- Attendance tracking
- Performance correlation
- Coaching frequency reports
- Fair distribution verification

---

## ✅ Best Practices

### Scheduling Frequency
- **Weekly**: Top performers, light check-ins
- **Bi-weekly**: Average performers, standard coaching
- **Weekly+**: Underperformers, intensive support

### Time Allocation
- **30 min**: Quick check-ins
- **60 min**: Standard coaching (recommended)
- **90 min**: Deep-dive sessions

### Focus Areas
Be specific:
- ❌ "Performance" (too vague)
- ✅ "AHT Reduction - Hold Time Optimization"
- ✅ "Quality Improvement - Call Opening"

### Fair Distribution
System handles this automatically, but you can verify:
1. After scheduling, go to Reports (future feature)
2. Check "Coaching Frequency by Agent"
3. Ensure no agent is over/under-coached

---

## 🎓 Training New Managers

### First Time Use
1. Start with 2-3 agents only
2. Use tomorrow's date
3. Pick simple time slots (09:00, 14:00)
4. Watch the results carefully

### Practice Scenario
Schedule yourself + 1 test agent:
- See how system handles conflicts
- Test the calendar view
- Try editing/canceling
- Build confidence

### Go Live
Once comfortable:
- Scale to 5-10 agents
- Then full team bulk schedules
- Regular monthly use

---

## 🔮 Coming Soon (Future Enhancements)

- 📧 Auto-email notifications to agents
- 📅 iCal/Google Calendar export
- 🔄 Recurring schedule templates
- 📊 Coaching analytics dashboard
- 🤖 AI-suggested coaching schedule
- 📱 Mobile-optimized view

---

## 🆘 Need Help?

### Common Questions

**Q: Can I schedule across multiple weeks?**  
A: Yes! System looks ahead up to 30 days automatically.

**Q: What if I need to change scheduled coachings?**  
A: Click session in calendar → Edit → Reschedule

**Q: Can two coaches use this at once?**  
A: Yes, each coach's availability is tracked separately.

**Q: How do I see just my scheduled coachings?**  
A: Calendar shows all by default, filter by coach (future) or use List View.

**Q: What if agent calls in sick on coaching day?**  
A: Manually reschedule that session via calendar.

---

**Ready to schedule? Head to `/coaching` and click "Bulk Schedule"!** 🚀






