# 📅 Bulk Coaching Scheduler Feature - Complete Implementation

## ✅ Status: FULLY IMPLEMENTED

### Overview
A comprehensive multi-coaching booking system that allows managers to schedule multiple coaching sessions at once with automatic conflict detection, leave management, and fair distribution among agents.

---

## 🎯 Key Features

### 1. **Multi-Agent Scheduling**
- Select multiple agents at once for bulk scheduling
- Fair distribution algorithm ensures equal coaching opportunities
- Agents with fewer existing coachings are prioritized

### 2. **Leave Integration & Conflict Detection**
- ✅ Automatic leave data validation
- ✅ Warns if leave data hasn't been updated recently
- ✅ Automatically skips agents on leave
- ✅ Reschedules to next available date after leave ends
- ✅ Prevents double-booking for both coach and agents

### 3. **Smart Scheduling**
- Configure multiple time slots (e.g., 09:00, 10:00, 14:00, 15:00)
- Automatically distributes sessions across available slots
- Skips weekends automatically
- Looks ahead up to 30 days for available slots
- Prevents scheduling on days where agents already have coachings

### 4. **Calendar View with Prep Work Status**
- Month-by-month calendar visualization
- Sessions show:
  - Agent name and avatar
  - Date and time
  - Session type (color-coded)
  - ✅ **Prep Work Indicator** - Green checkmark shows if prep work exists
  - Hover tooltip showing prep work details:
    - What Went Well
    - Development Areas
    - Action Plan
- Legend for easy reference
- Click sessions for more details

### 5. **Intuitive UI Flow**
Four-step wizard:
1. **Selection** - Choose agents (with select all/clear options)
2. **Configuration** - Set dates, times, focus areas, session type
3. **Review** - Check availability and warnings before confirming
4. **Results** - See successfully scheduled and skipped sessions

---

## 📁 Files Created/Modified

### New Files
1. **`/api/coaching/bulk-schedule/route.ts`** (370 lines)
   - POST endpoint for bulk scheduling
   - GET endpoint for availability checking
   - Fair distribution algorithm
   - Leave conflict detection
   - Coach double-booking prevention

2. **`/api/coaching/calendar/route.ts`** (82 lines)
   - Calendar data API with prep work status
   - Month-based filtering
   - Agent-specific filtering
   - Prep work details included

3. **`/components/coaching/bulk-scheduling-modal.tsx`** (600+ lines)
   - Full-featured modal with 4-step wizard
   - Agent selection with avatars
   - Time slot management
   - Focus area configuration
   - Availability checking
   - Results display

4. **`/components/coaching/coaching-page-client.tsx`** (200+ lines)
   - Client wrapper for coaching page
   - Tab navigation (List/Calendar views)
   - Integration with bulk scheduler
   - State management for refreshing

### Modified Files
1. **`/components/coaching/coaching-calendar.tsx`**
   - Added prep work indicators
   - Added hover tooltips for prep details
   - Enhanced session cards
   - Updated legend

2. **`/components/shared/quick-actions.tsx`**
   - Added optional `onBulkSchedule` prop
   - Added "Bulk Schedule" button
   - Maintains backward compatibility

3. **`/app/coaching/page.tsx`**
   - Integrated with new client component
   - Fetches active agents for scheduling
   - Maintains server-side data fetching

---

## 🎨 UI Components

### Bulk Scheduling Modal

#### Step 1: Agent Selection
```
┌─────────────────────────────────────────┐
│  Select Agents (5 selected)            │
│  [Select All] [Clear All]              │
│                                         │
│  ┌───┐ ┌───┐ ┌───┐                    │
│  │ ✓ │ │ ✓ │ │   │  Agent Cards...    │
│  └───┘ └───┘ └───┘                    │
│                                         │
│  [Cancel] [Next: Configure Sessions]   │
└─────────────────────────────────────────┘
```

#### Step 2: Configuration
- **Start Date**: Date picker (defaults to tomorrow)
- **Session Type**: Dropdown (Scheduled/Urgent/Follow-up)
- **Time Slots**: Add/remove multiple times
- **Duration**: Minutes slider
- **Focus Areas**: Tag-based input
- **Auto-reschedule**: Checkbox for leave handling

#### Step 3: Review
- Availability check results per agent
- Leave warnings highlighted
- Summary of configuration
- Final confirmation

#### Step 4: Results
- Success message with count
- List of scheduled sessions
- Skipped agents with reasons
- Any warnings or notes

### Calendar View

```
┌─────────────────────────────────────────────────────┐
│  January 2025                    [Today] [< >]      │
├─────────────────────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat                 │
│   1    2    3    4    5    6    7                  │
│        ┌─────────────────────┐                     │
│        │ 09:00 ✓             │  (✓ = Prep Work)    │
│        │ Sarah K.            │                     │
│        └─────────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Fair Distribution Algorithm
```typescript
1. Fetch all agents' existing coaching counts
2. Sort agents by coaching count (ascending)
3. Schedule sessions starting with agents who have fewest coachings
4. This ensures equal opportunity across the team
```

### Leave Conflict Resolution
```typescript
1. Check if agent is on leave for proposed date
2. If on leave AND auto-reschedule enabled:
   - Find return date
   - Try scheduling for day after return
3. If on leave AND auto-reschedule disabled:
   - Skip agent with reason
4. Continue to next available date
```

### Double-Booking Prevention
```typescript
1. Track coach's existing bookings
2. For each proposed session:
   - Check if coach is already booked at that time
   - If conflict, try next time slot
   - If all slots exhausted, try next day
3. Agent-side: Check if agent already has coaching that day
```

### Prep Work Detection
```typescript
Session has prep work if ANY of:
- aiPrepGenerated === true
- aiPrepContent exists
- whatWentWell exists
- developmentAreas exists
- actionPlan exists
```

---

## 🚀 Usage Guide

### From Coaching Page
1. Navigate to `/coaching`
2. Click **"Bulk Schedule"** button (top right, green)
3. Follow the 4-step wizard
4. View results in Calendar or List view

### From Quick Actions (Optional)
- Pass `onBulkSchedule` handler to `QuickActions` component
- Shows "Bulk Schedule" button in quick actions bar

### API Endpoints

#### Schedule Sessions
```typescript
POST /api/coaching/bulk-schedule
Body: {
  agentIds: number[];
  startDate: string; // YYYY-MM-DD
  duration: number; // minutes
  sessionType: string;
  focusAreas: string[];
  timeSlots: string[]; // ["09:00", "10:00"]
  autoRescheduleOnLeave: boolean;
}

Response: {
  success: boolean;
  scheduled: number;
  skipped: number;
  sessions: ScheduledSession[];
  skippedAgents: SkippedAgent[];
  warnings: string[];
  leaveDataChecked: boolean;
}
```

#### Check Availability
```typescript
GET /api/coaching/bulk-schedule?agentIds=1,2,3&startDate=2025-01-15

Response: {
  leaveDataAvailable: boolean;
  agentsChecked: number;
  availability: AgentAvailability[];
  recommendation: string;
}
```

#### Get Calendar
```typescript
GET /api/coaching/calendar?month=2025-01&agentId=5

Response: {
  success: boolean;
  month: string;
  sessions: CalendarSession[];
  count: number;
}
```

---

## 🎯 Key Benefits

### For Managers
- ✅ Save time: Schedule 10+ coachings in 2 minutes
- ✅ Ensure fairness: Algorithm distributes evenly
- ✅ Avoid conflicts: Automatic leave/booking checks
- ✅ Track prep work: See which sessions are ready
- ✅ Visual planning: Calendar view for month overview

### For Agents
- ✅ Fair opportunities: Everyone gets equal coaching
- ✅ No conflicts: Won't be scheduled during leave
- ✅ Visibility: Can see upcoming coachings in calendar
- ✅ Prep transparency: Know when prep is ready

### For the System
- ✅ Data integrity: Validates leave data first
- ✅ Scalability: Handles large agent lists
- ✅ Flexibility: Configurable time slots and types
- ✅ Smart scheduling: Up to 30-day lookahead

---

## 🔍 Validation & Safety

### Pre-Flight Checks
1. ✅ Leave data recency check (warns if >7 days old)
2. ✅ Active agents only
3. ✅ Valid date range
4. ✅ At least one time slot configured

### During Scheduling
1. ✅ Skip weekends
2. ✅ Check agent availability
3. ✅ Check coach availability
4. ✅ Prevent same-day double coaching
5. ✅ Limit search to 30 days

### Post-Scheduling
1. ✅ Report skipped agents with reasons
2. ✅ Show warnings if any
3. ✅ Confirm successful schedules
4. ✅ Allow immediate calendar view

---

## 📊 Example Scenarios

### Scenario 1: Standard Bulk Schedule
**Input:**
- 10 agents selected
- Start date: Tomorrow
- Time slots: 09:00, 10:00, 14:00, 15:00
- Auto-reschedule: ON

**Result:**
- 9 sessions scheduled
- 1 agent skipped (on leave for 30+ days)
- Sessions distributed across 3 days
- Fair distribution maintained

### Scenario 2: Urgent Coaching Round
**Input:**
- 5 agents (performance flags)
- Type: Urgent
- Start date: Today
- Time slots: 13:00, 14:00, 15:00

**Result:**
- 5 sessions scheduled for today/tomorrow
- All marked as "urgent" (red color)
- Coach not double-booked
- Immediate calendar visibility

### Scenario 3: Monthly Planning
**Input:**
- All 20 agents
- Start: Next Monday
- Type: Scheduled
- 8 time slots per day

**Result:**
- 20 sessions across 2-3 weeks
- Agents with 0 coachings scheduled first
- Leave conflicts auto-resolved
- Calendar shows full month plan

---

## 🎨 Color Coding

| Session Type | Color | Hex Code |
|-------------|-------|----------|
| Scheduled | Blue | #3B82F6 |
| Follow-up | Green | #A4E83C |
| Urgent | Red | #EF4444 |
| Completed | Gray | #6B7280 |

| Status | Indicator |
|--------|-----------|
| Has Prep Work | ✓ Green Check |
| No Prep Work | No indicator |

---

## 🧪 Testing Checklist

- [x] Schedule single agent
- [x] Schedule multiple agents
- [x] Handle agent on leave (with auto-reschedule)
- [x] Handle agent on leave (without auto-reschedule)
- [x] Prevent coach double-booking
- [x] Prevent agent same-day double coaching
- [x] Fair distribution verification
- [x] Weekend skipping
- [x] 30-day limit handling
- [x] Leave data warning
- [x] Prep work display in calendar
- [x] Calendar month navigation
- [x] Tab switching (List/Calendar)
- [x] Modal close/cancel
- [x] Results display

---

## 📈 Future Enhancements (Optional)

1. **Recurring Schedules**: Set up weekly/monthly coaching rounds
2. **Team Templates**: Save common configurations
3. **Email Notifications**: Auto-notify agents of new bookings
4. **Calendar Export**: iCal/Google Calendar integration
5. **Conflict Resolution UI**: Interactive drag-and-drop reschedule
6. **Advanced Filters**: Filter calendar by agent/type/status
7. **Bulk Rescheduling**: Move multiple sessions at once
8. **Coach Preferences**: Set preferred time slots per coach
9. **Analytics**: Coaching frequency reports
10. **AI Suggestions**: Recommend which agents need coaching

---

## 🎓 Developer Notes

### Key Functions
- `checkAgentAvailability()` - In `/lib/syncService.ts`
- `syncLeaveToCoaching()` - In `/lib/syncService.ts`
- Fair distribution sorting in bulk-schedule API

### Database Schema
Uses existing `coachingSessions` table:
- `scheduledDate`: Stores date + time (YYYY-MM-DD HH:mm)
- `status`: "scheduled" for new bulk sessions
- `type`: Inherited from input
- `focusAreas`: JSON array
- `aiPrepGenerated`, `aiPrepContent`, etc.: For prep work tracking

### Performance
- Batch inserts for multiple sessions
- Efficient leave/availability queries
- Calendar pagination by month
- No N+1 query issues

---

## ✅ Completion Summary

**All Requirements Met:**
- ✅ Book multiple coachings at once
- ✅ Ensure fair distribution
- ✅ Alert for leave data
- ✅ Automatic leave handling
- ✅ Substitute next available day
- ✅ Prevent double booking
- ✅ Feature in coaching section
- ✅ Quick action available
- ✅ Calendar view with details
- ✅ Show agent, time, date
- ✅ Display prep work status

**Total Implementation:**
- 4 new files
- 3 modified files
- 1,200+ lines of code
- Full UI/UX flow
- Production-ready

---

## 📸 Screenshots

### Bulk Scheduling Modal - Step 1
Agent selection with checkboxes, avatars, and select all/clear functionality.

### Bulk Scheduling Modal - Step 3
Availability review showing agents on leave, upcoming leave days, and existing coachings.

### Calendar View
Month calendar with color-coded sessions, prep work indicators, and hover tooltips.

### Results Screen
Success message with scheduled sessions list and skipped agents with reasons.

---

**Feature Status: ✅ COMPLETE AND PRODUCTION-READY**

*Built with attention to UX, data integrity, and scalability.*






