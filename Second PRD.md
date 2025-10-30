# Product Requirements Document
# Call Centre Management Tool - AI-Powered Desktop Application

**Document Version:** 1.0  
**Last Updated:** October 22, 2025  
**Status:** Ready for Development

---

## Document Purpose

This PRD serves as the comprehensive specification for building a call centre management tool using Cursor AI. The document is structured to enable phased development with clear, actionable requirements for each component.

---

## 1. PROJECT OVERVIEW

### 1.1 Executive Summary

An Electron-based desktop application that helps call centre team leaders manage 10 agents across home insurance retention. The tool consolidates performance data, automates coaching preparation, identifies patterns, and generates actionable insights.

### 1.2 Success Metrics (6-month vision)

- 70% reduction in administrative time
- Clear identification of agent challenges with actionable solutions
- Data-driven coaching plans with measurable outcomes
- Confident, insight-rich reporting to leadership

### 1.3 Core Value Proposition

Transform manual, spreadsheet-based management into an automated, AI-powered coaching and performance management system that runs locally on desktop.

---

## 2. TECHNICAL FOUNDATION

### 2.1 Technology Stack

```yaml
Platform: Desktop Application (Electron)
Frontend Framework: React with TypeScript
UI Library: Tailwind CSS + shadcn/ui components
Database: SQLite with SQLCipher encryption
AI Integration: Anthropic Claude API (claude-sonnet-4-20250514)
Data Processing:
  - CSV: PapaParse
  - Excel: SheetJS (xlsx)
  - PDF: pdf-parse or PDF.js
State Management: React Context API + useReducer
Charting: Recharts
Date Handling: date-fns
Build Tool: Vite
Package Manager: npm or pnpm
```

### 2.2 Project Structure

```
call-centre-tool/
├── src/
│   ├── main/                           # Electron main process
│   │   ├── main.ts
│   │   ├── database/
│   │   │   ├── schema.ts
│   │   │   ├── migrations/
│   │   │   └── queries.ts
│   │   ├── services/
│   │   │   ├── fileProcessor.ts
│   │   │   ├── piiRedactor.ts
│   │   │   └── backupService.ts
│   │   └── ipc/                        # IPC handlers
│   │       ├── dataHandlers.ts
│   │       ├── aiHandlers.ts
│   │       └── reportHandlers.ts
│   │
│   ├── renderer/                       # React application
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── TeamSummary.tsx
│   │   │   │   │   ├── AgentCard.tsx
│   │   │   │   │   └── AnomalyAlerts.tsx
│   │   │   │   ├── agents/
│   │   │   │   │   ├── AgentProfile.tsx
│   │   │   │   │   ├── AgentList.tsx
│   │   │   │   │   └── KPITrendChart.tsx
│   │   │   │   ├── coaching/
│   │   │   │   │   ├── CoachingCalendar.tsx
│   │   │   │   │   ├── QuickPrep.tsx
│   │   │   │   │   ├── SessionLogger.tsx
│   │   │   │   │   └── ActionPlanTracker.tsx
│   │   │   │   ├── audits/
│   │   │   │   │   ├── AuditUpload.tsx
│   │   │   │   │   ├── AuditTracker.tsx
│   │   │   │   │   └── AuditHistory.tsx
│   │   │   │   ├── ai/
│   │   │   │   │   ├── CoachingMaterialGenerator.tsx
│   │   │   │   │   ├── PatternInsights.tsx
│   │   │   │   │   └── PredictiveAlerts.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   ├── WeeklyReport.tsx
│   │   │   │   │   └── ReportHistory.tsx
│   │   │   │   ├── upload/
│   │   │   │   │   ├── DataUpload.tsx
│   │   │   │   │   └── FilePreview.tsx
│   │   │   │   ├── leave/
│   │   │   │   │   ├── LeaveCalendar.tsx
│   │   │   │   │   └── LeaveManager.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── QuickActions.tsx
│   │   │   │   └── ui/                 # shadcn/ui components
│   │   │   │       ├── button.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── AgentContext.tsx
│   │   │   │   └── NotificationContext.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAgents.ts
│   │   │   │   ├── useKPIData.ts
│   │   │   │   ├── useCoaching.ts
│   │   │   │   └── useAI.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── api.ts              # IPC communication
│   │   │   │   ├── claude.ts           # Claude API integration
│   │   │   │   └── dataProcessing.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── dateHelpers.ts
│   │   │   │   ├── kpiCalculations.ts
│   │   │   │   ├── nameMatching.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── agent.ts
│   │   │   │   ├── kpi.ts
│   │   │   │   ├── coaching.ts
│   │   │   │   ├── audit.ts
│   │   │   │   └── report.ts
│   │   │   │
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── shared/                         # Shared between main and renderer
│       ├── constants.ts
│       └── types.ts
│
├── resources/                          # App icons, etc.
├── .env.example
├── electron-builder.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. DEVELOPMENT PHASES

### Phase 1: Foundation & Core Infrastructure (Week 1-2)

**Goal:** Set up project structure, database, and basic UI framework

#### 3.1.1 Project Setup

```bash
# Initialize Electron + React + TypeScript + Vite
# Configure Tailwind CSS + shadcn/ui
# Set up SQLite with SQLCipher
# Configure electron-builder
```

**Deliverables:**
- Working Electron app that opens a window
- Tailwind CSS configured and working
- SQLite database connection established
- Basic layout (Sidebar + Header + Content area)

**Acceptance Criteria:**
- App launches without errors
- Hot reload works for renderer process
- Database can be created and queried
- UI shows basic layout structure

#### 3.1.2 Database Schema Implementation

**File:** `src/main/database/schema.ts`

```typescript
// Implement all tables from section 5.3.1:
// - agents
// - kpi_daily
// - audits
// - coaching_sessions
// - action_plans
// - leave_records
// - agent_strengths
// - agent_development_areas
// - coaching_templates
// - weekly_reports
// - teams
// - users
```

**Deliverables:**
- All database tables created
- Sample seed data for development
- Migration system for schema updates
- Database query functions (CRUD operations)

**Acceptance Criteria:**
- All tables created successfully
- Foreign key constraints work
- Can insert/query/update/delete data
- Encryption works (SQLCipher)

---

### Phase 2: Dashboard & Data Display (Week 3-4)

**Goal:** Build the main dashboard with team and agent views

#### 3.2.1 Team Dashboard

**Files to Create:**
- `src/renderer/src/components/dashboard/Dashboard.tsx`
- `src/renderer/src/components/dashboard/TeamSummary.tsx`
- `src/renderer/src/components/dashboard/AgentCard.tsx`
- `src/renderer/src/hooks/useKPIData.ts`

**Features:**

1. **Team Aggregate KPI Cards**
   - Display Quality, AHT, SRR, VOC
   - Show trend arrows (up/down/stable)
   - Color indicators (green/yellow/red)
   - Click to drill down

2. **Agent Cards Grid**
   - 2-3 column responsive grid
   - Color-coded borders (green/yellow/red)
   - Show current KPIs
   - Last audit date
   - Next coaching session
   - "Needs Attention" flag

3. **Color Coding Logic**

```typescript
interface KPIThresholds {
  quality: { target: 90; borderline: 85; critical: 85 };
  aht: { target: 550; borderline: 600; critical: 600 };
  srr: { target: 'floor_avg'; borderlineOffset: 5; criticalOffset: 5 };
  voc: { target: 94; borderline: 90; critical: 90 };
}

function getAgentStatus(
  kpis: AgentKPIs, 
  thresholds: KPIThresholds
): 'green' | 'yellow' | 'red' {
  // Implementation based on section 3.1.1
}
```

**Acceptance Criteria:**
- Dashboard loads and displays team summary
- Agent cards show correct KPI data
- Color coding works according to thresholds
- Clicking agent card opens agent profile
- Responsive layout works on different screen sizes

#### 3.2.2 Agent Profile View

**Files to Create:**
- `src/renderer/src/components/agents/AgentProfile.tsx`
- `src/renderer/src/components/agents/KPITrendChart.tsx`
- `src/renderer/src/components/agents/StrengthsAndDevelopment.tsx`

**Features:**

1. **KPI Trends Chart (30 days)**
   - Line chart with 4 lines (Quality, AHT, SRR, VOC)
   - Recharts implementation
   - Toggle between 30/90/365 day views

2. **Current Performance Section**
   - Display all KPIs with targets
   - AHT breakdown (Talk/Hold/Wrap)
   - Visual indicators (✓ or ⚠)

3. **Recent Audits List**
   - Last 5 audits with scores
   - Click to view full audit
   - Quick summary of findings

4. **Strengths & Development Areas**
   - AI-identified from audits
   - Show evidence and impact
   - Active action plans

5. **Coaching History**
   - Timeline of coaching sessions
   - Commitments and outcomes
   - Next scheduled session

**Acceptance Criteria:**
- Profile loads all agent data correctly
- Charts render with accurate data
- Can toggle between time periods
- All sections display relevant information
- Navigation back to dashboard works

---

### Phase 3: Data Upload & Processing (Week 5-6)

**Goal:** Enable uploading and processing of Excel, CSV, PDF files

#### 3.3.1 File Upload Interface

**Files to Create:**
- `src/renderer/src/components/upload/DataUpload.tsx`
- `src/renderer/src/components/upload/FilePreview.tsx`
- `src/main/services/fileProcessor.ts`

**Features:**

1. **Drag & Drop Upload Zone**
   - Support Excel (.xlsx, .xls)
   - Support CSV
   - Support PDF (for audits)
   - Support Text (for transcripts)
   - Multiple file upload

2. **AI File Analysis**

```typescript
interface FileAnalysisResult {
  type: 'quality' | 'aht' | 'srr' | 'hold' | 'audit' | 'unknown';
  dateRange: { start: Date; end: Date };
  agentsFound: string[];
  columnsDetected: string[];
  preview: any[][];
  confidence: number;
}

async function analyzeFileWithAI(
  fileContent: string
): Promise<FileAnalysisResult> {
  // Use Claude API to analyze file structure
}
```

3. **Data Preview & Confirmation**
   - Show first 3 rows
   - Confirm report type
   - Verify date
   - Match agent names

**Acceptance Criteria:**
- Can drag/drop files
- Can browse and select files
- AI correctly identifies file type
- Preview shows accurate data
- User can confirm or correct analysis

#### 3.3.2 Data Processing Pipeline

**Files to Create:**
- `src/main/services/fileProcessor.ts`
- `src/main/services/nameMatching.ts`
- `src/renderer/src/utils/dataProcessing.ts`

**Processing Flow:**

```typescript
class FileProcessor {
  async processFile(file: File): Promise<ProcessingResult> {
    // 1. Detect file type
    // 2. Parse file (Excel/CSV/PDF)
    // 3. Analyze with AI
    // 4. Match agent names
    // 5. Validate data
    // 6. Store in database
    // 7. Return confirmation
  }

  async parseExcel(buffer: Buffer): Promise<any[][]> {
    // Use SheetJS
  }

  async parseCSV(text: string): Promise<any[][]> {
    // Use PapaParse
  }

  async parsePDF(buffer: Buffer): Promise<string> {
    // Use pdf-parse
  }
}
```

**Name Matching Algorithm:**

```typescript
interface NameMatchResult {
  matched: boolean;
  agentId?: number;
  confidence: number;
  suggestions?: Agent[];
}

function matchAgentName(
  inputName: string, 
  agents: Agent[]
): NameMatchResult {
  // 1. Exact match (case-insensitive)
  // 2. Handle "Last, First" vs "First Last"
  // 3. Fuzzy match (Levenshtein distance ≤ 2)
  // 4. Check nickname variations
  // 5. Return suggestions if ambiguous
}
```

**Acceptance Criteria:**
- Excel files parse correctly
- CSV files parse with auto-delimiter detection
- PDF text extraction works
- Agent name matching handles variations
- Data saves to correct database tables
- User receives clear error messages

---

### Phase 4: AI Coaching Material Generator (Week 7-8)

**Goal:** Generate coaching materials using Claude API

#### 3.4.1 Claude API Integration

**Files to Create:**
- `src/renderer/src/services/claude.ts`
- `src/main/ipc/aiHandlers.ts`

**API Configuration:**

```typescript
interface ClaudeConfig {
  apiKey: string; // From environment variable
  model: 'claude-sonnet-4-20250514';
  maxTokens: 8000;
  baseURL: 'https://api.anthropic.com/v1/messages';
}

class ClaudeService {
  async analyzeCallTranscript(
    transcript: string,
    agentContext: AgentContext,
    managerNotes: string
  ): Promise<CoachingDocument> {
    // Implement coaching analysis prompt from section 5.1.2
  }

  async detectPatterns(
    kpiHistory: KPIData[],
    auditSummaries: AuditSummary[],
    coachingHistory: CoachingSession[]
  ): Promise<PatternAnalysis> {
    // Implement pattern detection prompt
  }

  async generateWeeklyReport(
    teamData: TeamData,
    weekRange: DateRange
  ): Promise<WeeklyReport> {
    // Implement weekly report prompt
  }
}
```

**CRITICAL: API Security**
- API key stored in environment variable, NEVER in code
- Use Electron's `safeStorage` API for production
- No API calls from renderer process directly
- All AI calls go through main process IPC

#### 3.4.2 Coaching Material Generator

**Files to Create:**
- `src/renderer/src/components/ai/CoachingMaterialGenerator.tsx`
- `src/renderer/src/components/coaching/CoachingDocument.tsx`

**Features:**

1. **Input Form**
   - Upload/paste call transcript
   - Select agent from dropdown
   - Add manager observations (textarea)
   - Select call outcome
   - Trigger AI analysis

2. **AI Analysis Process**

```typescript
interface CoachingAnalysisRequest {
  agentId: number;
  transcript: string;
  managerNotes: string;
  callOutcome: 'saved' | 'lost' | 'pending';
  customerReason?: string;
}

interface CoachingDocument {
  callSummary: string;
  whatWentWell: Array<{
    point: string;
    evidence: string;
    timestamp?: string;
  }>;
  developmentAreas: Array<{
    issue: string;
    whatHappened: string;
    impact: string;
    specificExample: string;
  }>;
  wordChoiceAnalysis: Array<{
    said: string;
    better: string;
    why: string;
  }>;
  idealApproach: {
    customerSituation: string;
    recommendations: string[];
  };
  actionPlan: {
    behavioralChanges: Array<{
      change: string;
      commitment: string;
      successLooksLike: string;
    }>;
    followUpDate: Date;
    checkInFocus: string[];
  };
  supportingData: {
    agentKPIs: KPISummary;
    patterns: string[];
  };
}
```

3. **Generated Document Display**
   - Markdown rendering
   - Editable sections
   - Copy to clipboard
   - Save as PDF
   - Link to schedule coaching session

**Acceptance Criteria:**
- Can upload/paste transcript
- PII redaction works automatically
- AI generates structured coaching document
- Document follows exact format from spec
- Can edit AI-generated content
- Can save to database
- Can export as PDF/markdown

#### 3.4.3 PII Redaction Engine

**Files to Create:**
- `src/main/services/piiRedactor.ts`

**Implementation:**

```typescript
class PIIRedactor {
  redactTranscript(transcript: string): {
    redactedText: string;
    redactions: Array<{
      original: string;
      replacement: string;
      position: number;
    }>;
  } {
    let redacted = transcript;
    const redactions = [];

    // 1. Regex patterns for common PII
    const patterns = {
      policyNumber: /\b\d{10,12}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    };

    // 2. AI-powered name detection
    const names = this.detectNamesWithAI(transcript);

    // 3. Apply redactions
    // 4. Preserve agent names
    // 5. Return redacted text + audit trail

    return { redactedText: redacted, redactions };
  }

  async detectNamesWithAI(text: string): Promise<string[]> {
    // Use Claude to identify customer names
  }
}
```

**Acceptance Criteria:**
- Redacts policy numbers
- Redacts phone numbers
- Redacts email addresses
- AI detects and redacts customer names
- Preserves agent names
- Logs all redactions
- User can review before saving

---

### Phase 5: Coaching Calendar & Session Management (Week 9-10)

**Goal:** Schedule and manage coaching sessions with reminders

#### 3.5.1 Coaching Calendar

**Files to Create:**
- `src/renderer/src/components/coaching/CoachingCalendar.tsx`
- `src/renderer/src/components/coaching/SessionList.tsx`
- `src/renderer/src/hooks/useCoaching.ts`

**Features:**

1. **Monthly Calendar View**
   - React Big Calendar or custom implementation
   - Color-coded events:
     - 🟦 Scheduled coaching
     - 🟥 Urgent/impromptu needed
     - 🟩 Follow-up check-in
     - 🟧 Agent on leave
   - Click date to add session
   - Click session to view details

2. **Agenda/List View**
   - Chronological list of upcoming sessions
   - Show agent name, time, focus area
   - "Quick Prep" button
   - Status indicators

3. **Session Scheduling**

```typescript
interface CoachingSession {
  id: number;
  agentId: number;
  sessionDate: Date;
  duration: number; // minutes
  sessionType: 'scheduled' | 'impromptu' | 'follow_up';
  focusArea: string;
  relatedAuditId?: number;
  relatedActionPlanId?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

function scheduleSession(session: Partial<CoachingSession>): void {
  // Validate date/time
  // Check for conflicts
  // Create reminder
  // Save to database
}
```

**Acceptance Criteria:**
- Calendar displays all scheduled sessions
- Can add new session from calendar
- Color coding works correctly
- Can edit/cancel sessions
- Agenda view shows upcoming sessions
- Sessions linked to agents and action plans

#### 3.5.2 Quick Prep Mode

**Files to Create:**
- `src/renderer/src/components/coaching/QuickPrep.tsx`
- `src/renderer/src/utils/coachingPrepGenerator.ts`

**Features:**

1. **Auto-Generated Brief**

```typescript
interface QuickPrepBrief {
  lastSession: {
    date: Date;
    focus: string;
    commitment: string;
    actionPlan: string;
  };
  progressCheck: {
    kpiChanges: KPIComparison;
    recentAudits: AuditSummary[];
    coachingApplied: boolean;
    observations: string[];
  };
  todaysFocus: {
    topics: string[];
    reasoning: string;
  };
  talkingPoints: string[];
  supportingDocs: Array<{
    type: 'audit' | 'chart' | 'actionPlan';
    id: number;
    title: string;
  }>;
  estimatedPrepTime: number; // minutes
}

function generateQuickPrep(
  agentId: number,
  sessionDate: Date
): QuickPrepBrief {
  // Fetch last session
  // Calculate KPI changes
  // Get recent audits
  // Determine focus areas
  // Generate talking points
  // Link supporting documents
}
```

2. **Quick Prep UI**
   - Collapsible sections
   - One-click access to linked documents
   - Can add manual notes
   - Print/export option

**Acceptance Criteria:**
- Quick Prep generates accurate brief
- Shows all relevant historical data
- KPI comparisons calculate correctly
- Linked documents open correctly
- Can add manual prep notes
- Prep time estimate is reasonable

#### 3.5.3 Session Logger

**Files to Create:**
- `src/renderer/src/components/coaching/SessionLogger.tsx`
- `src/renderer/src/components/coaching/ActionPlanForm.tsx`

**Features:**

1. **Post-Session Logging Form**
   - Auto-populates with prep notes
   - Editable discussion summary
   - Agent commitment (textarea)
   - Action items checklist
   - Follow-up date picker
   - Reminder checkbox

2. **Action Plan Creation**

```typescript
interface ActionPlan {
  id: number;
  agentId: number;
  sessionId: number | null;
  planTitle: string;
  goal: string | null;
  behavioralChanges: string | null; // JSON string
  successCriteria: string | null;
  createdDate: Date;
  followUpDate: Date | null;
  status: 'active' | 'completed' | 'abandoned';
  completionNotes?: string | null;
}

function createActionPlan(
  sessionId: number,
  plan: Partial<ActionPlan>
): ActionPlan {
  // Validate required fields
  // Create plan in database
  // Set up reminders
  // Link to session
}
```

**Acceptance Criteria:**
- Form pre-fills with prep data
- Can edit all fields
- Action items save correctly
- Follow-up reminder created
- Action plan linked to session
- Can schedule next session from logger

---

### Phase 6: Audit Tracking (Week 11)

**Goal:** Track quality audits and identify overdue agents

#### 3.6.1 Audit Dashboard

**Files to Create:**
- `src/renderer/src/components/audits/AuditTracker.tsx`
- `src/renderer/src/components/audits/AuditUpload.tsx`

**Features:**

1. **Audit Tracker Overview**
   - Goal tracking (4/day, 2/agent/month)
   - Overdue agents list (>14 days)
   - Audit distribution chart
   - Suggested next audits

2. **Audit Upload Flow**
   - Select agent
   - Upload transcript or paste text
   - Add manager findings
   - AI auto-analysis
   - PII redaction preview
   - Save audit
   - Option to generate coaching material

3. **Auto-Tagging System**

```typescript
interface AuditTags {
  empathy: 'strong' | 'weak' | 'neutral';
  scriptAdherence: 'strong' | 'weak' | 'neutral';
  objectionHandling: 'strong' | 'weak' | 'neutral';
  quoteTiming: 'good' | 'poor' | 'neutral';
  // ... more categories
}

async function autoTagAudit(
  transcript: string,
  managerNotes: string
): Promise<AuditTags> {
  // Use Claude to analyze and tag
}
```

**Acceptance Criteria:**
- Tracks audit progress vs. goals
- Identifies overdue agents
- Can upload and process audits
- AI tagging works accurately
- Tags feed into pattern recognition
- Audit history viewable per agent

---

### Phase 7: Pattern Recognition & Insights (Week 12-13)

**Goal:** AI-powered pattern detection and predictive alerts

#### 3.7.1 Pattern Detection Engine

**Files to Create:**
- `src/renderer/src/components/ai/PatternInsights.tsx`
- `src/main/services/patternAnalyzer.ts`

**Features:**

1. **Individual Agent Patterns**

```typescript
interface IndividualPattern {
  type: 
    | 'recurring_issue' 
    | 'performance_correlation' 
    | 'coaching_effectiveness' 
    | 'day_of_week';
  agentId: number;
  description: string;
  occurrences: number;
  evidence: Array<{
    date: Date;
    type: 'audit' | 'kpi' | 'coaching';
    details: string;
  }>;
  impact: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

async function detectIndividualPatterns(
  agentId: number,
  timeframe: number // days
): Promise<IndividualPattern[]> {
  // Fetch agent data (KPIs, audits, coaching)
  // Use Claude to analyze patterns
  // Return structured patterns
}
```

2. **Team-Wide Patterns**

```typescript
interface TeamPattern {
  type: 
    | 'common_struggle' 
    | 'top_performer_behavior' 
    | 'kpi_correlation' 
    | 'external_factor';
  description: string;
  affectedAgents: number[];
  evidence: any[];
  rootCause?: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}
```

3. **Insights Dashboard**
   - Red Flags (high priority issues)
   - Watch List (medium priority)
   - Wins (positive patterns)
   - Performance Correlations
   - Recommended Actions

**Acceptance Criteria:**
- Detects recurring issues accurately
- Identifies performance correlations
- Measures coaching effectiveness
- Detects team-wide patterns
- Provides actionable recommendations
- Updates insights automatically

#### 3.7.2 Predictive Alerts

**Files to Create:**
- `src/renderer/src/components/ai/PredictiveAlerts.tsx`
- `src/main/services/predictor.ts`

**Features:**

1. **Agent Performance Forecasting**

```typescript
interface PerformanceForecast {
  agentId: number;
  timeframe: number; // days ahead
  predictions: {
    quality?: { 
      current: number; 
      predicted: number; 
      confidence: number; 
    };
    aht?: { 
      current: number; 
      predicted: number; 
      confidence: number; 
    };
    srr?: { 
      current: number; 
      predicted: number; 
      confidence: number; 
    };
    voc?: { 
      current: number; 
      predicted: number; 
      confidence: number; 
    };
  };
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string[];
  recommendedAction: string;
}

async function forecastAgentPerformance(
  agentId: number,
  daysAhead: number
): Promise<PerformanceForecast> {
  // Analyze trends
  // Consider coaching history
  // Factor in leave
  // Use Claude for prediction
}
```

2. **Predictive Alerts UI**
   - Alert cards with risk levels
   - Predictions with confidence scores
   - Action buttons (schedule coaching, conduct audit)
   - Dismissable with notes

**Acceptance Criteria:**
- Generates reasonable predictions
- Risk levels make sense
- Recommendations are actionable
- Alerts update based on new data
- Can act on alerts directly from UI

---

### Phase 8: Leave Management (Week 14)

**Goal:** Track leave and identify coverage issues

#### 3.8.1 Leave Calendar & Manager

**Files to Create:**
- `src/renderer/src/components/leave/LeaveCalendar.tsx`
- `src/renderer/src/components/leave/LeaveManager.tsx`

**Features:**

1. **Leave Calendar View**
   - Month view with leave indicators
   - Color-coded by leave type
   - Hover for details
   - Add/edit leave

2. **Leave Pattern Detection**

```typescript
interface LeavePattern {
  agentId: number;
  patternType: 
    | 'monday_friday' 
    | 'frequent_sick' 
    | 'no_leave' 
    | 'coverage_heavy_week';
  description: string;
  occurrences: number;
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
}

function detectLeavePatterns(
  agentId: number,
  timeframe: number
): LeavePattern[] {
  // Analyze leave records
  // Detect patterns
  // Flag concerns
}
```

3. **Coverage Alerts**
   - Show weeks with heavy leave
   - Calculate coverage percentage
   - Alert when <80% coverage

**Acceptance Criteria:**
- Can view team leave calendar
- Can add/edit leave records
- Pattern detection works
- Coverage alerts trigger correctly
- Leave types tracked separately

---

### Phase 9: Weekly Reports (Week 15)

**Goal:** Auto-generate leadership reports

#### 3.9.1 Report Generator

**Files to Create:**
- `src/renderer/src/components/reports/WeeklyReport.tsx`
- `src/renderer/src/components/reports/ReportHistory.tsx`
- `src/main/services/reportGenerator.ts`

**Features:**

1. **Automated Report Generation**
   - Scheduled: Every Monday 8 AM
   - On-demand: Generate for any date range

2. **Report Structure**

```typescript
interface WeeklyReport {
  weekRange: { start: Date; end: Date };
  teamId: number;
  managerName: string;
  executiveSummary: string;
  kpiPerformance: {
    quality: KPIMetric;
    aht: KPIMetric;
    srr: KPIMetric;
    voc: KPIMetric;
  };
  rootCauseAnalysis: {
    issue: string;
    causes: Array<{ 
      factor: string; 
      impact: string; 
      evidence: string; 
    }>;
  }[];
  actionsTaken: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  agentSpotlight: {
    topPerformers: Array<{ 
      agentId: number; 
      strengths: string; 
      opportunity: string; 
    }>;
    needsSupport: Array<{ 
      agentId: number; 
      challenge: string; 
      intervention: string; 
    }>;
  };
  coachingActivity: {
    sessionsCompleted: number;
    auditsCompleted: number;
    newActionPlans: number;
    effectiveness: string;
  };
  forecastAndRisks: {
    nextWeekOutlook: { 
      kpi: string; 
      prediction: string; 
      reasoning: string; 
    }[];
    risks: Array<{ 
      risk: string; 
      level: string; 
      mitigation: string; 
    }>;
  };
  insights: {
    insight: string;
    evidence: string;
    recommendation: string;
    impact: string;
  }[];
  generatedAt: Date;
}
```

3. **Report Display**
   - HTML/Markdown rendering
   - Print-friendly layout
   - Export as PDF
   - Email integration (copy to clipboard)
   - Edit before sending

**Acceptance Criteria:**
- Auto-generates every Monday
- Can generate on-demand
- Report follows exact structure from spec
- All sections populated with accurate data
- Can export as PDF
- Can save report history

---

### Phase 10: Polish & Advanced Features (Week 16-18)

#### 3.10.1 Supervisor Multi-Team View

**Files to Create:**
- `src/renderer/src/components/supervisor/SupervisorDashboard.tsx`
- `src/renderer/src/components/supervisor/TeamComparison.tsx`

**Features:**
- Department-level dashboard
- Compare multiple teams
- Manager activity tracking
- Department insights

#### 3.10.2 UI/UX Enhancements

**Tasks:**
- Loading states for all async operations
- Error boundaries
- Toast notifications
- Keyboard shortcuts
- Accessibility (ARIA labels, keyboard navigation)
- Dark mode support
- Responsive design refinement

#### 3.10.3 Performance Optimization

**Tasks:**
- Implement virtualization for large lists
- Optimize database queries
- Cache frequently accessed data
- Lazy load components
- Optimize re-renders
- Background jobs for heavy computations

#### 3.10.4 Testing & Documentation

**Tasks:**
- Unit tests for utility functions
- Integration tests for critical flows
- E2E tests for main user journeys
- User documentation
- Developer documentation
- Video tutorials

---

## 4. DATA MODELS (TypeScript Types)

### 4.1 Core Types

```typescript
// Agent Types
interface Agent {
  agentId: number;
  fullName: string;
  employeeId: string;
  hireDate: Date;
  teamId: number;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

// KPI Types
interface KPIDaily {
  kpiId: number;
  agentId: number;
  date: Date;
  qualityScore: number | null;
  ahtSeconds: number | null;
  ahtTalkSeconds: number | null;
  ahtHoldSeconds: number | null;
  ahtWrapSeconds: number | null;
  srrPercentage: number | null;
  vocPercentage: number | null;
  floorSrrAvg: number | null;
  uploadedAt: Date;
  sourceFile: string | null;
}

interface KPIThresholds {
  quality: { 
    target: number; 
    borderline: number; 
    critical: number; 
  };
  aht: { 
    target: number; 
    borderline: number; 
    critical: number; 
  };
  srr: { 
    target: number; 
    borderlineOffset: number; 
    criticalOffset: number; 
  };
  voc: { 
    target: number; 
    borderline: number; 
    critical: number; 
  };
}

// Audit Types
interface Audit {
  auditId: number;
  agentId: number;
  auditDate: Date;
  auditType: 'quality' | 'voc_validation' | 'coaching_review';
  qualityScore: number | null;
  callTranscript: string | null;
  managerNotes: string | null;
  aiAnalysis: string | null; // JSON string
  findings: string | null;
  tags: string | null; // Comma-separated
  createdBy: number;
  createdAt: Date;
}

// Coaching Types
interface CoachingSession {
  sessionId: number;
  agentId: number;
  sessionDate: Date;
  sessionType: 'scheduled' | 'impromptu' | 'follow_up';
  focusArea: string | null;
  discussionNotes: string | null;
  agentCommitment: string | null;
  actionItems: string | null; // JSON string
  followUpDate: Date | null;
  outcome: 'success' | 'in_progress' | 'needs_escalation' | null;
  outcomeNotes: string | null;
  createdBy: number;
  createdAt: Date;
}

interface ActionPlan {
  planId: number;
  agentId: number;
  sessionId: number | null;
  planTitle: string;
  goal: string | null;
  behavioralChanges: string | null; // JSON string
  successCriteria: string | null;
  createdDate: Date;
  followUpDate: Date | null;
  status: 'active' | 'completed' | 'abandoned';
  completionNotes: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

// Leave Types
interface LeaveRecord {
  leaveId: number;
  agentId: number;
  leaveDate: Date;
  leaveType: 'sick' | 'vacation' | 'personal' | 'other';
  duration: 'full_day' | 'half_day' | 'partial';
  hours: number | null;
  reason: string | null;
  createdAt: Date;
}

// Agent Profile Types
interface AgentStrength {
  strengthId: number;
  agentId: number;
  strengthCategory: string;
  evidence: string | null;
  firstIdentified: Date;
  lastConfirmed: Date;
  confidenceScore: number | null;
}

interface AgentDevelopmentArea {
  developmentId: number;
  agentId: number;
  areaCategory: string;
  description: string | null;
  firstIdentified: Date;
  lastObserved: Date;
  status: 'active' | 'improving' | 'resolved';
  resolutionDate: Date | null;
  resolutionNotes: string | null;
}

// Report Types
interface WeeklyReport {
  reportId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  teamId: number;
  reportContent: string;
  kpiSummary: string | null; // JSON string
  insights: string | null;
  generatedAt: Date;
  sentTo: string | null;
}

// Team Types
interface Team {
  teamId: number;
  teamName: string;
  managerId: number;
  department: string | null;
  createdAt: Date;
}

// User Types
interface User {
  userId: number;
  username: string;
  fullName: string | null;
  role: 'manager' | 'supervisor' | 'admin';
  passwordHash: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}
```

---

## 5. KEY ALGORITHMS & LOGIC

### 5.1 KPI Status Calculation

```typescript
type KPIStatus = 'green' | 'yellow' | 'red';

interface AgentKPIStatus {
  overall: KPIStatus;
  quality: KPIStatus;
  aht: KPIStatus;
  srr: KPIStatus;
  voc: KPIStatus;
  needsAttention: boolean;
}

function calculateAgentStatus(
  kpis: KPIDaily,
  thresholds: KPIThresholds,
  floorAvg: number
): AgentKPIStatus {
  const statuses: KPIStatus[] = [];

  // Quality
  let qualityStatus: KPIStatus = 'green';
  if (kpis.qualityScore !== null) {
    if (kpis.qualityScore < thresholds.quality.critical) {
      qualityStatus = 'red';
    } else if (kpis.qualityScore < thresholds.quality.borderline) {
      qualityStatus = 'yellow';
    }
    statuses.push(qualityStatus);
  }

  // AHT
  let ahtStatus: KPIStatus = 'green';
  if (kpis.ahtSeconds !== null) {
    if (kpis.ahtSeconds > thresholds.aht.critical) {
      ahtStatus = 'red';
    } else if (kpis.ahtSeconds > thresholds.aht.borderline) {
      ahtStatus = 'yellow';
    }
    statuses.push(ahtStatus);
  }

  // SRR (compared to floor average)
  let srrStatus: KPIStatus = 'green';
  if (kpis.srrPercentage !== null && floorAvg !== null) {
    const diff = kpis.srrPercentage - floorAvg;
    if (diff < -thresholds.srr.criticalOffset) {
      srrStatus = 'red';
    } else if (diff < -thresholds.srr.borderlineOffset) {
      srrStatus = 'yellow';
    }
    statuses.push(srrStatus);
  }

  // VOC
  let vocStatus: KPIStatus = 'green';
  if (kpis.vocPercentage !== null) {
    if (kpis.vocPercentage < thresholds.voc.critical) {
      vocStatus = 'red';
    } else if (kpis.vocPercentage < thresholds.voc.borderline) {
      vocStatus = 'yellow';
    }
    statuses.push(vocStatus);
  }

  // Overall status: Red if any red, Yellow if any yellow, else Green
  let overall: KPIStatus = 'green';
  if (statuses.includes('red')) {
    overall = 'red';
  } else if (statuses.includes('yellow')) {
    overall = 'yellow';
  }

  return {
    overall,
    quality: qualityStatus,
    aht: ahtStatus,
    srr: srrStatus,
    voc: vocStatus,
    needsAttention: overall === 'red',
  };
}
```

### 5.2 Trend Calculation

```typescript
type Trend = 'up' | 'down' | 'stable';

function calculateTrend(
  current: number, 
  previous: number, 
  threshold: number = 2
): Trend {
  const percentChange = ((current - previous) / previous) * 100;
  if (Math.abs(percentChange) < threshold) return 'stable';
  return percentChange > 0 ? 'up' : 'down';
}

interface TrendData {
  current: number;
  previous: number;
  trend: Trend;
  percentChange: number;
}

function calculateKPITrends(
  currentWeek: KPIDaily[],
  previousWeek: KPIDaily[]
): Record<string, TrendData> {
  const avgCurrent = calculateAverages(currentWeek);
  const avgPrevious = calculateAverages(previousWeek);

  return {
    quality: {
      current: avgCurrent.quality,
      previous: avgPrevious.quality,
      trend: calculateTrend(avgCurrent.quality, avgPrevious.quality),
      percentChange: 
        ((avgCurrent.quality - avgPrevious.quality) / avgPrevious.quality) * 100,
    },
    // ... same for aht, srr, voc
  };
}
```

### 5.3 Anomaly Detection

```typescript
interface Anomaly {
  type: 'spike' | 'drop' | 'pattern' | 'overdue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  agentId?: number;
  agentName?: string;
  details: any;
}

function detectAnomalies(
  agents: Agent[],
  recentKPIs: Map<number, KPIDaily[]>,
  baselines: Map<number, KPIDaily>,
  audits: Map<number, Audit[]>
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const agent of agents) {
    const agentKPIs = recentKPIs.get(agent.agentId) || [];
    const baseline = baselines.get(agent.agentId);
    const agentAudits = audits.get(agent.agentId) || [];

    if (!baseline || agentKPIs.length === 0) continue;

    // Check for AHT spike (>30% from baseline)
    const latestKPI = agentKPIs[0];
    if (latestKPI.ahtSeconds && baseline.ahtSeconds) {
      const spikePercent = 
        ((latestKPI.ahtSeconds - baseline.ahtSeconds) / baseline.ahtSeconds) * 100;
      
      if (spikePercent > 30) {
        anomalies.push({
          type: 'spike',
          severity: 'high',
          message: `${agent.fullName}'s AHT spiked ${spikePercent.toFixed(0)}% today (avg: ${latestKPI.ahtSeconds}s vs baseline: ${baseline.ahtSeconds}s)`,
          agentId: agent.agentId,
          agentName: agent.fullName,
          details: { 
            current: latestKPI.ahtSeconds, 
            baseline: baseline.ahtSeconds 
          },
        });
      }
    }

    // Check for overdue audits (>14 days)
    const lastAudit = agentAudits[0];
    const daysSinceAudit = lastAudit
      ? Math.floor(
          (Date.now() - new Date(lastAudit.auditDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
      : 999;

    if (daysSinceAudit > 14) {
      anomalies.push({
        type: 'overdue',
        severity: 'medium',
        message: `${agent.fullName} overdue for quality audit (${daysSinceAudit} days)`,
        agentId: agent.agentId,
        agentName: agent.fullName,
        details: { 
          daysSinceAudit, 
          lastAuditDate: lastAudit?.auditDate 
        },
      });
    }

    // More anomaly checks...
  }

  // Team-level anomalies (e.g., common themes from audits)
  // ...

  return anomalies;
}
```

---

## 6. CLAUDE API PROMPTS

### 6.1 Coaching Analysis Prompt

```typescript
function generateCoachingPrompt(
  agentName: string,
  agentContext: {
    quality: number;
    aht: number;
    srr: number;
    recentTrend: string;
    pastCoaching: string[];
  },
  transcript: string,
  managerNotes: string,
  callDetails: {
    reason: string;
    sentiment: string;
    outcome: string;
  }
): string {
  return `You are an expert call center coach analyzing a home insurance retention call.

CONTEXT
- Agent: ${agentName}
- Current Performance: Quality ${agentContext.quality}%, AHT ${agentContext.aht}s, SRR ${agentContext.srr}%
- Recent Trend: ${agentContext.recentTrend}
- Past Coaching: ${agentContext.pastCoaching.join(', ')}
- Manager Notes: ${managerNotes}

CALL TRANSCRIPT
${transcript}

CUSTOMER SITUATION
- Reason for call: ${callDetails.reason}
- Customer sentiment: ${callDetails.sentiment}
- Outcome: ${callDetails.outcome}

ANALYZE FOR:
1. What went well (specific examples with timestamps if available)
2. Development areas (specific behaviors to change)
3. Choice of words analysis (what to say instead of what was said)
4. What would have made this call amazing (specific to this customer's situation)
5. Recommended action plan with specific behavioral changes

REQUIREMENTS:
- Be specific and actionable
- Use examples from the transcript
- Focus on behaviors that impact KPIs (Quality, AHT, SRR)
- Consider the agent's known strengths and development areas
- Provide realistic, achievable recommendations

FORMAT YOUR RESPONSE AS A STRUCTURED COACHING DOCUMENT WITH THESE SECTIONS:

Coaching Session – [Agent Name]
Date: [Date]
Call Reviewed: [Call ID/Date]
Call Reason: [Reason]

CALL SUMMARY
[Brief 2-3 sentence summary of what happened and outcome]

✅ WHAT WENT WELL
[List 2-4 specific positive behaviors with examples from the call]

⚠ DEVELOPMENT AREAS
[List 2-4 specific areas for improvement with:
● What Happened
● Impact
● Specific Example with timestamp if possible]

💡 WHAT WOULD HAVE MADE THIS CALL AMAZING
[Given the customer's specific situation, describe the ideal approach with specific recommendations]

🎯 ACTION PLAN
Behavioral Changes to Practice:
[List 3-4 specific behavioral changes with:
● Commitment (what they'll do)
● Success looks like (how to measure)]

📊 SUPPORTING DATA
[Reference the agent's KPIs and any patterns identified]

Be conversational but professional. Use emojis sparingly as shown in the structure.`;
}
```

### 6.2 Pattern Detection Prompt

```typescript
function generatePatternPrompt(
  agentId: number,
  agentName: string,
  timeframe: number,
  kpiHistory: KPIDaily[],
  auditSummaries: Array<{ 
    date: Date; 
    score: number; 
    findings: string; 
  }>,
  coachingHistory: Array<{ 
    date: Date; 
    focus: string; 
    outcome: string; 
  }>
): string {
  return `You are analyzing performance patterns for call center agent ${agentName} over the past ${timeframe} days.

AGENT DATA

KPI History (last ${timeframe} days):
${JSON.stringify(kpiHistory, null, 2)}

AUDIT FINDINGS
${auditSummaries
  .map(a => `${a.date.toISOString().split('T')[0]}: Score ${a.score}% - ${a.findings}`)
  .join('\n')}

COACHING HISTORY
${coachingHistory
  .map(c => `${c.date.toISOString().split('T')[0]}: ${c.focus} - Outcome: ${c.outcome}`)
  .join('\n')}

IDENTIFY:
1. Recurring issues across audits (patterns that appear 3+ times)
2. Performance correlations (when X happens, Y changes)
3. Coaching effectiveness (did previous interventions work?)
4. Day/time patterns (Monday vs Friday performance, etc.)
5. Trend direction (improving, declining, stable)

PROVIDE:
- Clear pattern descriptions with evidence
- Root cause hypotheses
- Specific recommendations for intervention
- Timeline expectations for improvement

Be data-driven and avoid speculation. If there isn't enough data to identify a pattern, say so.

FORMAT YOUR RESPONSE AS JSON:
{
  "patterns": [
    {
      "type": "recurring_issue | performance_correlation | coaching_effectiveness | day_of_week",
      "description": "Clear description of the pattern",
      "occurrences": number,
      "evidence": ["evidence point 1", "evidence point 2"],
      "impact": "How this affects performance",
      "recommendation": "Specific action to take",
      "urgency": "low | medium | high",
      "timeline": "Expected timeline for improvement"
    }
  ],
  "overallAssessment": "Summary of agent's trajectory",
  "primaryFocus": "The #1 thing to address right now"
}`;
}
```

### 6.3 Weekly Report Prompt

```typescript
function generateWeeklyReportPrompt(
  teamName: string,
  managerName: string,
  weekRange: { start: Date; end: Date },
  kpiData: {
    current: any;
    previous: any;
    trends: any;
  },
  auditSummaries: Array<{ 
    agentName: string; 
    score: number; 
    findings: string; 
  }>,
  coachingActivity: {
    sessionsCompleted: number;
    auditsCompleted: number;
    newActionPlans: number;
  },
  floorSrrAvg: number,
  knownChallenges: string[]
): string {
  return `Generate a leadership-ready weekly performance report for a call center team.

TEAM DATA
- Team: ${teamName}
- Manager: ${managerName}
- Week: ${weekRange.start.toISOString().split('T')[0]} to ${weekRange.end.toISOString().split('T')[0]}
- Team Size: ${kpiData.current.agentCount} agents

KPI PERFORMANCE (Current Week vs Previous Week)
${JSON.stringify(kpiData, null, 2)}

Floor SRR Average: ${floorSrrAvg}%

AUDIT SUMMARIES
${auditSummaries
  .map(a => `${a.agentName}: ${a.score}% - ${a.findings}`)
  .join('\n')}

COACHING ACTIVITY
- Sessions completed: ${coachingActivity.sessionsCompleted}
- Audits conducted: ${coachingActivity.auditsCompleted}
- New action plans: ${coachingActivity.newActionPlans}

KNOWN CHALLENGES
${knownChallenges.join('\n')}

GENERATE A REPORT WITH THESE SECTIONS:

1. **EXECUTIVE SUMMARY** (2-3 sentences)
   Overall team performance and key focus areas

2. **KPI PERFORMANCE** (Week-over-Week)
   For each KPI (Quality, AHT, SRR, VOC):
   - Current value with trend arrow
   - Comparison to target
   - How many agents on target
   - Key drivers of performance

3. **ROOT CAUSE ANALYSIS** (for any declining KPIs)
   Primary, secondary, and minor factors with evidence

4. **ACTIONS TAKEN & PLANNED**
   - Immediate Actions (this week)
   - Short-Term Actions (next 2 weeks)
   - Long-Term Actions (next 30 days)

5. **AGENT SPOTLIGHT**
   - Top Performers (2-3 agents): Strengths and opportunities
   - Needs Support (2-3 agents): Challenges, interventions, timelines

6. **COACHING ACTIVITY**
   Summary of sessions, effectiveness, and impact

7. **FORECAST & RISKS**
   - Next week outlook for each KPI
   - Risks to monitor with mitigation strategies

8. **KEY INSIGHTS & RECOMMENDATIONS**
   3-5 data-driven insights with:
   - Evidence
   - Recommendation
   - Expected impact

TONE: Professional, data-driven, action-oriented
FORMAT: Use markdown with clear sections, bullet points, and emojis for visual clarity

Be specific with numbers and avoid vague statements. Every recommendation should be actionable.`;
}
```

### 6.4 File Analysis Prompt

```typescript
function generateFileAnalysisPrompt(
  fileName: string,
  fileContent: string,
  preview: string[][]
): string {
  return `You are analyzing an uploaded file to determine what type of call center report it is.

FILE NAME: ${fileName}

FIRST 5 ROWS OF DATA:
${preview.map((row, i) => `Row ${i + 1}: ${row.join(' | ')}`).join('\n')}

DETERMINE:
1. Report Type: Is this a Quality, AHT, SRR, Hold Time, VOC, or other report?
2. Date Range: What date or date range does this report cover?
3. Agents: How many agents are in this report? List their names as they appear.
4. Columns: What columns are present and what do they represent?
5. Data Quality: Are there any issues (missing data, formatting problems, etc.)?

RESPOND IN JSON FORMAT:
{
  "reportType": "quality | aht | srr | hold | voc | audit | unknown",
  "confidence": 0-100,
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "agentsFound": ["Agent Name 1", "Agent Name 2"],
  "columns": [
    {
      "name": "Column header as it appears",
      "type": "agent_name | date | quality_score | aht_seconds | srr_percentage | etc",
      "format": "Description of the data format"
    }
  ],
  "issues": ["Any data quality issues found"],
  "recommendation": "What the user should do next"
}

If you cannot determine the report type with confidence >70%, set reportType to "unknown" and explain why in the recommendation.`;
}
```

---

## 7. IPC (Inter-Process Communication) Structure

### 7.1 IPC Channels Definition

```typescript
// src/shared/ipcChannels.ts
export const IPC_CHANNELS = {
  // Database operations
  DB_GET_AGENTS: 'db:get-agents',
  DB_GET_AGENT: 'db:get-agent',
  DB_CREATE_AGENT: 'db:create-agent',
  DB_UPDATE_AGENT: 'db:update-agent',
  DB_GET_KPI_DATA: 'db:get-kpi-data',
  DB_SAVE_KPI_DATA: 'db:save-kpi-data',
  DB_GET_KPI_TRENDS: 'db:get-kpi-trends',
  DB_GET_AUDITS: 'db:get-audits',
  DB_SAVE_AUDIT: 'db:save-audit',
  DB_GET_AUDIT: 'db:get-audit',
  DB_GET_COACHING_SESSIONS: 'db:get-coaching-sessions',
  DB_SAVE_COACHING_SESSION: 'db:save-coaching-session',
  DB_GET_COACHING_SESSION: 'db:get-coaching-session',
  DB_GET_ACTION_PLANS: 'db:get-action-plans',
  DB_SAVE_ACTION_PLAN: 'db:save-action-plan',
  DB_UPDATE_ACTION_PLAN: 'db:update-action-plan',
  DB_GET_LEAVE_RECORDS: 'db:get-leave-records',
  DB_SAVE_LEAVE_RECORD: 'db:save-leave-record',
  DB_GET_WEEKLY_REPORTS: 'db:get-weekly-reports',
  DB_SAVE_WEEKLY_REPORT: 'db:save-weekly-report',

  // File processing
  FILE_UPLOAD: 'file:upload',
  FILE_ANALYZE: 'file:analyze',
  FILE_PROCESS: 'file:process',
  FILE_EXPORT: 'file:export',

  // AI operations
  AI_ANALYZE_TRANSCRIPT: 'ai:analyze-transcript',
  AI_DETECT_PATTERNS: 'ai:detect-patterns',
  AI_GENERATE_REPORT: 'ai:generate-report',
  AI_ANALYZE_FILE: 'ai:analyze-file',
  AI_FORECAST_PERFORMANCE: 'ai:forecast-performance',

  // PII redaction
  PII_REDACT: 'pii:redact',
  PII_REVIEW: 'pii:review',

  // System operations
  SYS_GET_APP_VERSION: 'sys:get-app-version',
  SYS_CHECK_UPDATES: 'sys:check-updates',
  SYS_BACKUP_DATABASE: 'sys:backup-database',
  SYS_RESTORE_DATABASE: 'sys:restore-database',

  // Notifications
  NOTIFY_SHOW: 'notify:show',
  NOTIFY_SCHEDULE_REMINDER: 'notify:schedule-reminder',
} as const;
```