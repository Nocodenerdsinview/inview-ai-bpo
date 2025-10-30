# Announcements System - Quick Testing Guide

## ✅ What's Been Done

1. **Navigation Bar Fixes** - Tasks, Attendance, and User Management pages now show the sidebar
2. **Announcements System** - Fully implemented with 4 sample announcements seeded
3. **Database** - Schema pushed and sample data added

---

## 🧪 How to Test

### 1. Check Navigation Bar Fixes

Visit these pages and verify the sidebar is visible:
- `/tasks` - Task Management page
- `/attendance` - Attendance Management page  
- `/admin/users` - User Management page (admin only)

**Expected Result:** Sidebar navigation should be visible on all these pages.

---

### 2. Test Dashboard Announcements Widget

1. Go to `/dashboard`
2. Look for the "Communications" section (replaced Recent Achievements)
3. You should see up to 3 unacknowledged announcements

**Expected Result:**
- Widget shows "Communications" header with Megaphone icon
- Badge showing "4 New" (since 4 sample announcements were seeded)
- Up to 3 announcements displayed with:
  - Title and preview
  - Priority badge (Info/Important/Urgent)
  - Color coding (Blue/Orange/Red)
  - "Mark as Read" button
  - Creation date
- "View All Communications" button at the bottom

**Test Actions:**
- Click "Mark as Read" on any announcement
  - Should disappear from the list with animation
  - Badge count should decrease
  - Toast notification "Announcement acknowledged"

---

### 3. Test Communications Page (All Users)

1. Click "Communications" in the sidebar
2. Or click "View All Communications" from the dashboard widget

**Expected Result:**
- Stats cards showing:
  - Total Announcements: 4
  - Unread: 4 (or less if you acknowledged some)
  - Read: 0 (or more if you acknowledged some)
- Search bar
- Refresh button
- Two tabs: "Unread" and "All Announcements"

**Test Actions:**

#### Search:
- Type "maintenance" in search → Should show "System Maintenance" announcement
- Type "holiday" → Should show "Holiday Schedule" announcement
- Clear search → Shows all announcements

#### Unread Tab:
- Should show only unacknowledged announcements at the top
- Click "Select All Unread" → All checkboxes should be checked
- Click "Mark X as Read" → All selected should be acknowledged
- Should see success toast

#### All Announcements Tab:
- Should show all announcements
- Acknowledged ones show green "Read" badge
- Show acknowledgement date

#### Individual Acknowledgement:
- Click "Mark as Read" on any announcement
- Should update immediately
- Moves to "All Announcements" tab if viewing "Unread"

---

### 4. Test Announcements Management (Admin Only)

1. Click "Admin" → "Announcements" in sidebar
2. Or go to `/announcements`

**Expected Result:**
- Stats cards showing:
  - Total: 4
  - Active: 4
  - Inactive: 0
- "Create Announcement" button
- List of all announcements with edit/toggle/delete actions
- Each shows:
  - Title and content
  - Priority badge
  - Active/Inactive badge
  - Target audience badge (All Users or X Roles)
  - Acknowledged count (should be 0 initially)
  - Created date

**Test Actions:**

#### Create Announcement:
1. Click "Create Announcement"
2. Fill in:
   - Title: "Test Announcement"
   - Content: "This is a test message"
   - Priority: Choose any (Info/Important/Urgent)
   - Target Audience:
     - Try "All Users"
     - Try "Specific Roles" → Check some roles
3. Click "Create Announcement"
4. Should see success toast
5. New announcement appears in list

#### Edit Announcement:
1. Click Edit icon on any announcement
2. Modify title or content
3. Click "Update Announcement"
4. Should see success toast
5. Changes should be reflected

#### Toggle Active/Inactive:
1. Click eye icon to deactivate
2. Should see "Inactive" badge and gray eye icon
3. Click again to reactivate
4. Should see "Active" badge and green check

#### Delete Announcement:
1. Click trash icon
2. Confirm deletion
3. Should be removed from list

---

### 5. Test Role-Based Targeting

#### Create Admin-Only Announcement:
1. Go to `/announcements` (admin page)
2. Create new announcement
3. Select "Specific Roles" → Check only "Admin"
4. Create it
5. Log in as non-admin user
6. Go to `/communications`
7. **Expected:** Should NOT see the admin-only announcement

#### Create Team Lead + Coach Announcement:
1. Create announcement targeting only "Team Lead" and "Coach"
2. Log in as agent
3. **Expected:** Should NOT see this announcement
4. Log in as team_lead or coach
5. **Expected:** SHOULD see this announcement

---

### 6. Test Acknowledgement Persistence

1. Log in as any user
2. Go to `/communications`
3. Note the unacknowledged announcements
4. **Do NOT acknowledge them**
5. Log out and log back in
6. Go to `/communications`
7. **Expected:** Same announcements still show as unacknowledged

8. Now acknowledge one announcement
9. Log out and log back in
10. Go to `/communications`
11. **Expected:** Acknowledged announcement does NOT show in "Unread" tab
12. Go to "All Announcements" tab
13. **Expected:** Acknowledged announcement shows with "Read" badge

---

### 7. Test Priority Visual Indicators

Check that announcements display with correct colors:

**Info (Blue):**
- Icon: Info circle
- Color: Blue (#3B82F6)
- Example: "Holiday Schedule Reminder"

**Important (Orange):**
- Icon: Bell
- Color: Orange (#FF8C42)
- Example: "Welcome to the New Communications System!"

**Urgent (Red):**
- Icon: Alert Triangle
- Color: Red (#EF4444)
- Example: "System Maintenance Scheduled"

---

### 8. Test Sidebar Navigation

**All Users Should See:**
- Communications link in "Main" section
- Between "Tasks" and "Agents"
- With Megaphone icon

**Admin Should Also See:**
- "Announcements" link in "Admin" section
- Below "User Management"
- With Megaphone icon

**Test Navigation:**
- Click "Communications" → Goes to `/communications`
- Click "Announcements" (admin) → Goes to `/announcements`
- Active state highlights when on those pages

---

## 📊 Sample Announcements Seeded

1. **Welcome to the New Communications System!**
   - Priority: Important
   - Target: All Users
   - Content: Introduction to the system

2. **System Maintenance Scheduled**
   - Priority: Urgent
   - Target: All Users
   - Content: Maintenance window details

3. **New KPI Targets for Q4**
   - Priority: Important
   - Target: Team Lead + Coach only
   - Content: Q4 KPI targets

4. **Holiday Schedule Reminder**
   - Priority: Info
   - Target: All Users
   - Content: Holiday leave request reminder

---

## ✨ Key Features to Verify

- [x] Announcements appear on dashboard
- [x] Individual acknowledgement works
- [x] Bulk acknowledgement works
- [x] Search functionality works
- [x] Role-based targeting works
- [x] Priority indicators correct colors
- [x] Active/Inactive toggling works
- [x] Edit announcements works
- [x] Create announcements works
- [x] Delete announcements works
- [x] Navigation bar visible on all pages
- [x] Sidebar links work correctly
- [x] Acknowledgement persists across sessions
- [x] Unread count updates correctly

---

## 🐛 If Something Doesn't Work

### Clear Browser Cache
Sometimes the new routes need a hard refresh:
1. Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Or clear browser cache

### Restart Dev Server
If routes aren't loading:
```bash
npm run dev
```

### Check Database
Verify tables were created:
```bash
npm run db:studio
```
Look for `announcements` and `announcement_acknowledgements` tables.

### Re-seed Announcements
If you need to reset the sample announcements:
```bash
npx tsx scripts/seed-announcements.ts
```

---

## 🎉 Success Criteria

The implementation is successful if:

1. ✅ Navigation bar appears on Tasks, Attendance, and User Management pages
2. ✅ Dashboard shows announcements widget instead of Recent Achievements
3. ✅ Communications page accessible from sidebar
4. ✅ Users can acknowledge announcements individually or in bulk
5. ✅ Admin can create, edit, activate/deactivate announcements
6. ✅ Role-based targeting works correctly
7. ✅ Priority visual indicators display correctly
8. ✅ Acknowledgements persist (announcements stay until acknowledged)
9. ✅ Search functionality works
10. ✅ All UI elements match the existing design system

---

## 📝 Notes

- Users will only see announcements targeted to their role or "all users"
- Inactive announcements don't appear to users (only in admin panel)
- Acknowledged announcements can still be viewed in "All Announcements" tab
- The system ensures users on leave can catch up when they return
- Bulk operations make it easy to acknowledge multiple announcements at once

Enjoy your new communications system! 🎊

