# 🧠 Project Prompt for Cursor AI
## Project Title: Call Centre Management Tool – AI-Powered Web Platform

---

## 🌍 Overview  
Build a **modern, AI-powered web application** designed for **call centre team leaders** managing teams of 10+ agents in a **home insurance retention** environment.  

This app will:  
- Centralize all agent data (KPIs, quality audits, transcripts, coaching sessions).  
- Automate coaching preparation and reporting.  
- Identify performance trends and recurring issues using AI.  
- Offer a sleek, control-centre experience similar to **Monday.com** or **ClickUp** — designed to make users feel fully in control of their daily team operations.

---

## ✨ Vision  
The tool should empower team leaders to manage performance, coaching, and reports with ease. The interface should make users feel like they’re in command of their workflow — clear, confident, and connected.  

> “I know exactly where my team stands today — who’s improving, who needs help, and what actions to take next.”

---

## 🎯 Success Metrics (6-Month Goals)
- **70% reduction in administrative time.**  
- **Automatic identification of performance challenges.**  
- **AI-generated, actionable coaching materials.**  
- **Insight-rich leadership reports ready every Monday morning.**  

---

## 🧩 Core Features  

### 1. 🏠 Dashboard – Leadership Command Centre  
**Purpose:** Provide a complete team snapshot.  

- **Team KPI Cards:** Show Quality, AHT, SRR, and VOC with trend arrows and color-coded statuses.  
- **Agent Cards Grid:** Show KPI summary, last audit, next coaching session, and attention flag.  
- **Alerts Section:**  
  - “⚠ Michael’s AHT spiked 30% this week.”  
  - “📉 Team SRR dropped 5% – 6 agents cited pricing objections.”  
  - “🔍 3 agents overdue for audits.”  

**UX Style:** Similar to Monday.com’s workspace dashboards — modular cards, drag-to-arrange panels, vibrant data tiles, and hover animations.

---

### 2. 👤 Agent Profile View – Deep Performance Insights  
**Purpose:** Give detailed visibility into each agent’s journey.  

Sections include:  
- **KPI Trend Charts:** 30, 90, or 365-day toggles (Recharts).  
- **Recent Audits:** AI-tagged (e.g., Empathy Strong, Script Weak).  
- **Strengths & Development Areas:** AI-generated with evidence and impact.  
- **Coaching History:** Commitments, outcomes, and follow-ups.  
- **Leave History:** Absence patterns, attendance rates, burnout indicators.  

**Example Layout:**  
A layout inspired by CRM profiles in ClickUp or HubSpot — sidebar navigation, KPI analytics center, and audit/coaching tabs.

---

### 3. 📂 Data Upload & Processing  
**Purpose:** Streamline how reports and transcripts are uploaded and reconciled.  

- **Supported Formats:** Excel, CSV, PDF, Text.  
- **AI Auto-Detection:** Detects report type, maps agent names, and validates data.  
- **Preview Mode:** Shows first 3 rows of parsed data before import.  
- **PII Redaction:** Automatically detects and removes sensitive data (names, policy numbers, emails).  
- **Unified Storage:** Combines all KPI reports into a daily snapshot per agent.  

**AI Logic Example:**  
“Detected: Quality Report – 10 agents, dated Oct 22.”  
“Agent ‘Mike Brown’ not found. Did you mean ‘Michael Brown’?”  

---

### 4. 🤖 AI Coaching Material Generator  
**Purpose:** Use transcripts, audit notes, and KPIs to auto-generate actionable coaching documents.  

#### Input Sources:  
- Call transcript  
- Manager’s observations  
- Recent KPIs  
- Historical coaching sessions  

#### AI Output Format Example:
```
# Coaching Session – Michael Brown
Date: Oct 22, 2025 | Call Type: Cancellation – Price Objection

✅ What Went Well:
- Excellent empathy in greeting
- Acknowledged price concerns promptly

⚠ Development Areas:
- Rushed discovery phase at 2:15 mark
- Negative phrasing: “Unfortunately” → Better: “Let’s explore your options.”

💡 Ideal Approach:
- Ask more open-ended questions about budget
- Reframe value using long-term protection

🎯 Action Plan:
- Practice slowing down the discovery phase
- Reword negative phrasing
- Review 2 calls next week for progress
```

Documents should be editable, downloadable, and visually structured like a Notion-style coaching page.

---

### 5. 🗓️ Coaching Calendar & Quick Prep  
**Purpose:** Manage all coaching activities efficiently.  

- Monthly calendar with color-coded sessions:  
  - 🟦 Scheduled, 🟥 Urgent, 🟩 Follow-up, 🟧 Leave  
- “Quick Prep” button generates AI-powered summary for the next session.  
- Auto-log commitments, follow-ups, and action plans.  
- Reminder system tied to coaching and audit uploads.

**Example:**  
“Sarah Johnson – Oct 23, 2PM”  
Focus: Benefits scripting | AI Prep: 5-min summary of last improvement | Shortcut to latest audit.

---

### 6. 📊 Audit Tracking  
**Purpose:** Ensure fair and consistent quality review cadence.  

- Daily, weekly, and monthly completion tracking.  
- Overdue audit notifications (>14 days).  
- Upload transcript + manager notes → AI tags and categorizes findings.  
- Tagging categories include: Empathy, Script Adherence, Objection Handling, Quote Timing.

**Smart Alerts:**  
- “Jennifer Lee overdue for audit (17 days).”  
- “Tom Wilson flagged for weak scripting in 3 audits.”  

---

### 7. 🌴 Leave Management  
**Purpose:** Track agent leave and its effect on performance.  

- Leave calendar (monthly overview + coverage alerts).  
- Leave types: Full day, Half day, Sick, Personal, Vacation.  
- Pattern Detection: “3 sick Mondays in last 60 days.”  
- AI Suggestions: “Possible burnout risk detected – consider workload review.”

---

### 8. 🧠 Pattern Recognition & Insights  
**Purpose:** AI analyzes all available data for trends and risk forecasting.  

#### Examples of Detected Insights:
- Recurring issues (e.g., “Script Adherence flagged 4x in 6 weeks”).  
- Performance correlation (“High AHT → SRR decline”).  
- Coaching ROI (“Empathy coaching improved VOC by 5%”).  
- Predictive alerts (“Jennifer’s Quality may drop next week”).  

**Insights Dashboard Layout:**  
- 🔴 Red Flags – Urgent agent issues  
- 🟡 Watch List – Agents showing decline  
- 🟢 Wins – Coaching or KPI improvements  
- 📊 Performance Correlations  
- 🎯 Recommended Actions  

---

### 9. 🧾 Leadership Weekly Report Generator  
**Purpose:** Automate leadership reporting and communication.  

**Report Includes:**  
- Weekly summary of KPIs and team actions  
- Top performers and recognition notes  
- Coaching activity and outcomes  
- Forecasts and key risks  

**Example Output:**
```
WEEKLY TEAM REPORT – Oct 14–20, 2025

🎯 Highlights:
- 6 coaching sessions completed
- Quality: 92% (↑1%), AHT: 510s (↓12s), SRR: 78% (↓1%)
- VOC stable at 96%

⚠ Risks:
- Michael: AHT trending high (620s) – consider shadowing
- Jennifer: Quality drop – audit scheduled

🟢 Wins:
- Sarah: Hold time reduced 15% after Oct 10 coaching
- Team VOC highest this quarter
```

Reports exportable as PDF/HTML, ready for leadership submission.

---

### 10. 🧩 Agent Profile System  
- Basic Info: Tenure, hire date, role.  
- KPI history with trends.  
- Strengths and development areas (AI-tagged).  
- Coaching and audit histories.  
- Leave and attendance data.  
- AI Recommendations (“Consider for mentor role”).

---

## 🎨 Design & UX  
**Style:** Sleek, modular, data-rich — inspired by Monday.com, Notion, and ClickUp.  
**Color Scheme:** Modern neutrals with vibrant accents (green/yellow/red status tones).  
**Motion:** Soft transitions, micro-animations on hover, subtle card pop.  
**Layout:**  
- Sidebar navigation (Dashboard, Agents, Coaching, Audits, Reports, Leave).  
- Quick access toolbar for “AI Prep,” “Add Audit,” and “Upload Data.”  
- Floating AI Assistant that suggests insights contextually.

---

## 🧱 Technical Architecture (Cursor Can Optimize)  
**Frontend:** React + TypeScript + TailwindCSS or shadcn/ui  
**Backend:** Node.js / Next.js (API routes)  
**Database:** SQLite or Postgres with SQLCipher encryption  
**AI:** Anthropic Claude (claude-sonnet) or OpenAI GPT-4 for NLP and summaries  
**Charts:** Recharts  
**File Handling:** PapaParse, SheetJS, pdf-parse  
**State Management:** React Context API + Reducer pattern  
**Security:** Role-based access control + PII redaction + local encryption

---

## 🔐 Security & Privacy  
- SQLCipher encryption for local storage.  
- Automatic customer PII redaction.  
- API keys stored securely via environment variables.  
- Role-based permissions (Team Leader, Supervisor).  

---

## 📦 MVP Deliverables  
1. Full web dashboard with mock data.  
2. AI-powered coaching generator prototype.  
3. File upload system (Excel, CSV, PDF).  
4. Quick Prep + Calendar integration.  
5. Mock insights and weekly report generator.  
6. Encrypted local data persistence.  

---

## 🧠 AI Functional Responsibilities  
1. Analyze transcripts → Generate structured coaching feedback.  
2. Detect patterns → Identify recurring performance issues.  
3. Forecast outcomes → Provide predictive alerts.  
4. Generate summaries → Create weekly leadership reports.  
5. Learn from data → Improve recommendations over time.

---

## 💬 Tone & Interaction Style  
AI should communicate like a proactive assistant, not a chatbot.  
> “Hey Treasure, Michael’s still struggling with discovery. Want me to prep a coaching plan for him?”  

Responses should be friendly, brief, and focused on action.  

---

## ✅ Project Goal Summary  
Cursor should:  
- Architect and plan the entire app (frontend, backend, database, AI).  
- Replicate a **Monday.com-style sleek UI** for call centre leadership.  
- Build an **MVP web version** of the system with mock AI integrations.  
- Ensure every feature from the PRD and Technical Spec is represented structurally.  

---

**End of Prompt – Ready for Cursor AI Planning and Implementation.**
