# Quick Start: Data Synchronization System

## ✅ What's Working Right Now

Your application now has a sophisticated offline-first data synchronization system! Here's what you can test immediately:

---

## 🚀 Immediate Testing

### 1. Global Refresh Button (NEW!)

**Location**: Top-right corner of every page, next to the date filter

**How to Test**:
1. Open the application
2. Look for the "Refresh" button with a rotating arrow icon
3. Click it
4. Watch the icon spin
5. All data on the page will refresh

**What it does**:
- Refreshes ALL cached data across the entire app
- Works on Dashboard, Agent Profiles, and all other pages
- Shows visual feedback (spinning icon)

---

### 2. Offline Mode (NEW!)

**How to Test**:
1. Open your browser DevTools (F12 or Cmd+Option+I)
2. Go to the Network tab
3. Change "Online" to "Offline"
4. Navigate around the app
5. You should see:
   - 🟠 Orange banner at top: "You're offline - showing cached data"
   - App still works with cached data
   - Data persists for 7 days!

**Go back online**:
1. Change network back to "Online"
2. Banner disappears automatically
3. Data syncs when you click Refresh

---

### 3. Dashboard (UPGRADED!)

**What Changed**:
- ✅ No more auto-refresh polling (saves bandwidth!)
- ✅ Uses React Query for smart caching
- ✅ Data cached for 7 days offline
- ✅ Manual refresh via global button
- ✅ Faster loading from cache

**Test it**:
1. Go to Dashboard
2. Wait for data to load
3. Click Refresh button
4. Close browser and reopen
5. Dashboard should load instantly from cache!

---

### 4. Agent Profile (UPGRADED!)

**What Changed**:
- ✅ Removed 30-second auto-refresh
- ✅ Uses React Query for caching
- ✅ Manual refresh via global button
- ✅ Edit profile updates cache instantly

**Test it**:
1. Click on any agent
2. Profile loads (cached after first visit)
3. Edit agent info (Edit button)
4. Changes appear instantly (optimistic update!)
5. Click Refresh to confirm from server

---

### 5. Optimistic Updates (NEW!)

These actions update the UI INSTANTLY before waiting for the server:

**Test Task Completion**:
1. Go to a page with tasks
2. Mark a task as complete
3. ⚡ Task moves to completed section IMMEDIATELY
4. No waiting for server response!
5. If server fails, it rolls back automatically

**Test Notification Read**:
1. Click on a notification
2. ⚡ Notification marked read INSTANTLY
3. Badge count updates immediately
4. Confirmed with server in background

---

## 📱 Developer Tools

### React Query DevTools (NEW!)

**How to Access**:
1. Open your app
2. Look for the React Query icon in bottom-left corner
3. Click it to expand DevTools

**What you can see**:
- All cached queries
- Query status (fresh, stale, loading)
- Cache data inspection
- Manual refetch buttons
- Performance metrics

**Try it**:
1. Go to Dashboard
2. Open DevTools
3. Find `['dashboard']` query
4. See cached data
5. Click "Refetch" button
6. Watch query update

---

## 🎯 What Works Offline

### ✅ Works Offline (7 days cache):
- Dashboard view
- Agent profiles
- KPI charts
- Coaching history
- Attendance records
- Task lists
- Notifications (read-only)

### ❌ Requires Online:
- Creating new data
- Uploading files
- AI-generated insights
- Real-time updates from other users

---

## 🔧 Configuration

### Current Settings

**Cache Duration**: 7 days
**Refresh Mode**: Manual only (no auto-refresh)
**Network Mode**: Offline-first
**Retry Attempts**: 3
**Retry Delay**: Exponential backoff

**Location**: `inview-ai/lib/query-client.ts`

---

## 📊 Performance Improvements

### Before:
- ❌ Dashboard fetched data every time
- ❌ Auto-refresh every 30 seconds (waste!)
- ❌ Multiple identical API calls
- ❌ Slow page loads

### After:
- ✅ Instant load from cache
- ✅ No auto-refresh (manual control)
- ✅ Deduplicates API calls automatically
- ✅ Fast, responsive UI

---

## 🐛 Troubleshooting

### Data not refreshing?
- Click the global Refresh button
- Check DevTools network tab
- Verify you're online

### Offline banner stuck?
- Check actual network connection
- Click X to dismiss banner
- Refresh page

### Cache seems stale?
- Click Refresh button
- Cache expires after 7 days
- Can clear browser cache if needed

### React Query DevTools not showing?
- Only available in development mode
- Check bottom-left corner
- Try refreshing page

---

## 📚 Documentation

**Full Guide**: `inview-ai/docs/DATA_SYNC_GUIDE.md`
- How to use hooks
- How to create new hooks
- Optimistic update patterns
- Cache invalidation strategies
- Best practices

**Implementation Summary**: `DATA_SYNC_IMPLEMENTATION_SUMMARY.md`
- What's completed
- What's remaining
- Migration examples
- Testing checklist

---

## 🎓 Key Concepts

### React Query Basics

**Query**: Fetching data
```typescript
const { data, isLoading } = useDashboardData();
```

**Mutation**: Changing data
```typescript
const updateAgent = useUpdateAgent();
await updateAgent.mutateAsync({ id, updates });
```

**Cache Invalidation**: Force refresh
```typescript
queryClient.invalidateQueries({ queryKey: ['agents'] });
```

### Offline-First

1. **Try cache first**: Always show cached data immediately
2. **Fetch in background**: Update cache from server
3. **Works offline**: Use cached data for 7 days
4. **Smart sync**: Only fetch when needed

---

## 🎉 Quick Wins to Show Off

1. **Instant Dashboard Load**
   - Visit dashboard
   - Close browser
   - Reopen → Instant load!

2. **Offline Mode Demo**
   - Go offline (DevTools)
   - Navigate entire app
   - Still works perfectly!

3. **Optimistic Updates**
   - Complete a task
   - Watch it update instantly
   - No loading spinners!

4. **Smart Caching**
   - Visit same page twice
   - Second time = instant
   - No API call made!

---

## 🚀 Next Level Features (Coming Soon)

- ⏳ Section-specific refresh buttons
- ⏳ More components using hooks
- ⏳ Sync queue for offline mutations
- ⏳ Conflict resolution
- ⏳ More optimistic updates

---

## 💡 Pro Tips

1. **Use Refresh Strategically**
   - Only refresh when you need latest data
   - Cache is usually fresh enough
   - Saves bandwidth and battery

2. **Check DevTools**
   - Monitor what's cached
   - See when queries refetch
   - Debug any issues

3. **Trust the Cache**
   - 7 days is generous
   - Data syncs on user actions
   - No need to refresh constantly

4. **Offline is Your Friend**
   - Work anywhere
   - Commute-friendly
   - Conference WiFi? No problem!

---

**Ready to test?** Start with the Dashboard and try the global Refresh button!

**Questions?** Check `docs/DATA_SYNC_GUIDE.md` for comprehensive documentation.

**Issues?** All hooks are in `hooks/api/` - easy to debug!






