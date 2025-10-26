# Testing Guide - New Features

## 🎯 Features Ready to Test

### 1. Enhanced Dashboard (`/dashboard`)
**What to Look For:**
- ✅ **Attendance Warning Banner** (if attendance not updated today)
- ✅ **Red Flag Agents Widget** - Shows agents with overall score < 70%
- ✅ **Upcoming Coachings Widget** - Shows coaching sessions for next 7 days
- ✅ **Agents on Leave Widget** - Shows who's on holiday or sick today
- ✅ **Uncoached Audits Widget** - Shows audits with scores < 80% that need coaching
- ✅ **Agent Ranking** - All agents now show rank (1st, 2nd, 3rd, etc.)
- ✅ **Performance Scores** - Each agent card shows overall score badge
- ✅ **Red KPI Indicators** - Underperforming KPIs highlighted in red on cards

**How to Test:**
1. Navigate to `/dashboard`
2. Verify all widgets load without errors
3. Check that agent cards show rankings and scores
4. Click on "Plan Coaching" buttons in widgets
5. Verify data updates when date filter changes

---

### 2. Enhanced Audits Page (`/audits`)
**What to Look For:**
- ✅ **4th Summary Card** - "Needs Coaching" count
- ✅ **Coaching Status Badges** - Shows if audit has been coached
- ✅ **Plan Coaching Button** - On each audit card
- ✅ **Linked Coaching Button** - If audit has been coached
- ✅ **Weaknesses Display** - Areas for improvement shown as tags
- ✅ **Performance-Based Colors** - Scores color-coded (green/blue/orange/red)

**How to Test:**
1. Navigate to `/audits`
2. Look for the "Needs Coaching" count in summary cards
3. Scroll through audit cards
4. Click "Plan Coaching" on an audit (should navigate to quick-prep)
5. Verify coaching status badges appear correctly

---

### 3. Attendance Management (`/attendance`)
**What to Look For:**
- ✅ **3-Tab System** - Daily Update, Planned Leave, Upcoming (14 days)
- ✅ **Warning Banner** - Shows if not all agents updated for today
- ✅ **Daily Update Tab** - Quick status updates for all agents
- ✅ **Planned Leave Tab** - Manage future leave dates
- ✅ **Upcoming Tab** - See next 14 days of leave

**How to Test:**
1. Navigate to `/attendance`
2. Check if warning banner appears (should show if not updated today)
3. Switch between tabs
4. Update an agent's status in Daily Update
5. Click "Save Changes" button
6. Navigate to Planned Leave tab
7. Try adding/editing planned leave

---

### 4. Agent Profile Pages (`/agents/[id]`)
**What to Look For:**
- ✅ **Overall Score Display** - At top of profile
- ✅ **Rank Display** - Shows agent's ranking
- ✅ **Red KPI Warnings** - Underperforming KPIs highlighted
- ✅ **Dark Premium Theme** - Consistent styling throughout

**How to Test:**
1. Click any agent card from dashboard
2. Verify score and rank displayed prominently
3. Check that KPIs show color-based performance
4. Ensure theme is consistent with dashboard

---

## 🔌 API Endpoints to Test

### Test Commands (run in terminal):

```bash
# Test upcoming coachings
curl 'http://localhost:3000/api/coaching/upcoming?daysAhead=7'

# Test agents on leave
curl 'http://localhost:3000/api/attendance/on-leave'

# Test uncoached audits
curl 'http://localhost:3000/api/audits/uncoached?limit=10'

# Test attendance summary
curl 'http://localhost:3000/api/attendance/summary'
```

---

## 🎨 Visual Elements to Verify

### Color Scheme
- ✅ **Background**: Deep black (#0A0A0A)
- ✅ **Cards**: Dark gray (#1A1A1A, #2A2A2A)
- ✅ **Primary Accent**: Lime green (#A4E83C)
- ✅ **Warning**: Orange (#FF8C42)
- ✅ **Critical**: Red (#EF4444)
- ✅ **Info**: Blue (#3B82F6)

### Typography
- ✅ **Headings**: Bebas Neue, bold, uppercase
- ✅ **Body**: Inter, clean spacing
- ✅ **Metrics**: Extra large, bold numbers

### Interactions
- ✅ **Hover Effects**: Subtle glow and border changes
- ✅ **Button Hover**: Brightness increase
- ✅ **Card Hover**: Border color change
- ✅ **Smooth Transitions**: All state changes animated

---

## 🐛 Known Issues / Expected Behaviors

### Dashboard
- **Empty Widgets**: Some widgets won't show if no data (e.g., no upcoming coachings)
- **Attendance Banner**: Only shows if attendance not updated today
- **Red Flag Agents**: Only displays if agents have score < 70%

### Data
- **Mock Sparklines**: Sparkline data is generated for demo purposes
- **Coach Counts**: Audit and coaching counts on agent cards are mocked
- **Coaching Sessions**: If none scheduled, Upcoming Coachings shows empty state

---

## ✅ Test Checklist

### Dashboard
- [ ] Page loads without errors
- [ ] All widgets render correctly
- [ ] Red flag agents widget appears (if applicable)
- [ ] Upcoming coachings widget shows data or empty state
- [ ] Agents on leave widget appears (if applicable)
- [ ] Uncoached audits widget shows data
- [ ] Agent cards show rank and score
- [ ] KPI cards expandable with AI insights
- [ ] Date filter updates all data

### Audits
- [ ] Page loads without errors
- [ ] Summary cards show correct counts
- [ ] Audit cards display with proper styling
- [ ] "Plan Coaching" button works
- [ ] Coaching status badges appear
- [ ] Weaknesses display correctly
- [ ] Score colors match performance

### Attendance
- [ ] Page loads without errors
- [ ] All 3 tabs functional
- [ ] Daily update saves properly
- [ ] Warning banner appears when needed
- [ ] Summary counts update after save
- [ ] Planned leave can be added
- [ ] Upcoming view shows next 14 days

### Navigation
- [ ] Sidebar navigation works
- [ ] All page transitions smooth
- [ ] Back button works correctly
- [ ] Links open in correct context

---

## 🚀 Performance Checks

### Load Times
- [ ] Dashboard loads in < 3 seconds
- [ ] Agent cards render quickly
- [ ] No lag when scrolling
- [ ] Smooth animations

### Data Fetching
- [ ] Multiple API calls don't block UI
- [ ] Loading states show appropriately
- [ ] Error states handle gracefully
- [ ] No console errors

---

## 📝 Notes for Testing

1. **Browser**: Test in Chrome/Safari for best experience
2. **Screen Size**: Verify responsive design on different sizes
3. **Data**: Some widgets depend on database content
4. **Date Filter**: Test with different date ranges
5. **Network**: Check behavior with slow/offline connections

---

## 🎉 What to Appreciate

### User Experience
- Immediate visibility of problem areas
- Quick access to coaching tools
- Clear visual hierarchy
- Actionable insights everywhere

### Design
- Professional, modern aesthetic
- Consistent color coding
- Smooth interactions
- Premium feel throughout

### Functionality
- AI-powered insights
- Integrated workflows
- Data synchronization
- Smart filtering and ranking

---

**Happy Testing! 🚀**

*Report any issues or suggestions for improvements.*

