// Agent Types
export interface Agent {
  id: number;
  name: string;
  email: string | null;
  role: string;
  hireDate: string;
  tenure: number;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
}

// KPI Types
export interface KPI {
  id: number;
  agentId: number;
  date: string;
  quality: number | null;
  aht: number | null; // Average Handle Time
  srr: number | null; // Sales Retention Rate
  voc: number | null; // Voice of Customer
  createdAt: string;
}

export interface TeamKPISummary {
  quality: { current: number; change: number; trend: "up" | "down" | "stable" };
  aht: { current: number; change: number; trend: "up" | "down" | "stable" };
  srr: { current: number; change: number; trend: "up" | "down" | "stable" };
  voc: { current: number; change: number; trend: "up" | "down" | "stable" };
}

// Audit Types
export interface Audit {
  id: number;
  agentId: number;
  date: string;
  score: number | null;
  notes: string | null;
  tags: string | null;
  transcriptId: number | null;
  strengths: string | null;
  weaknesses: string | null;
  createdAt: string;
}

export interface AuditTag {
  category: string;
  rating: string;
}

// Coaching Session Types
export interface CoachingSession {
  id: number;
  agentId: number;
  date: string;
  scheduledDate: string | null;
  type: "scheduled" | "urgent" | "follow-up";
  focusAreas: string | null;
  whatWentWell: string | null;
  developmentAreas: string | null;
  actionPlan: string | null;
  commitments: string | null;
  outcome: string | null;
  status: "scheduled" | "completed" | "cancelled";
  aiGenerated: number;
  createdAt: string;
  updatedAt: string;
}

// Leave Record Types
export interface LeaveRecord {
  id: number;
  agentId: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
  type: "full-day" | "half-day" | "sick" | "personal" | "vacation";
  reason: string | null;
  approved: number;
  status: string;
  requestedDate: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  declinedReason: string | null;
  createdAt: string;
}

// Transcript Types
export interface Transcript {
  id: number;
  agentId: number;
  date: string;
  callType: string | null;
  content: string;
  redactedContent: string | null;
  duration: number | null;
  sentiment: string | null;
  createdAt: string;
}

// Insight Types
export interface Insight {
  id: number;
  agentId: number | null;
  type: "red-flag" | "watch-list" | "win" | "correlation" | "action";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  evidence: string | null;
  actionable: number;
  resolved: number;
  createdAt: string;
}

// Upload Types
export interface Upload {
  id: number;
  filename: string;
  fileType: string;
  reportType: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  recordsProcessed: number | null;
  errors: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

// Report Types
export interface Report {
  id: number;
  type: "weekly" | "monthly" | "custom";
  title: string;
  startDate: string;
  endDate: string;
  content: string;
  highlights: string | null;
  risks: string | null;
  wins: string | null;
  aiGenerated: number;
  createdAt: string;
}

// Dashboard Types
export interface AgentCardData {
  agent: Agent;
  latestKPIs: KPI | null;
  lastAuditDate: string | null;
  nextCoachingDate: string | null;
  attentionFlags: string[];
}

export interface AlertData {
  id: string;
  type: "warning" | "danger" | "info";
  message: string;
  agentId?: number;
  priority: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  quality?: number;
  aht?: number;
  srr?: number;
  voc?: number;
}

// Form Types
export interface CoachingFormData {
  agentId: number;
  scheduledDate: string;
  type: "scheduled" | "urgent" | "follow-up";
  focusAreas: string[];
  transcript?: File;
  observations?: string;
}

export interface UploadFormData {
  file: File;
  reportType?: string;
}

// Extended Types for Better Type Coverage

export interface AgentWithStats extends Agent {
  latestKPIs: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  };
  auditCount: number;
  coachingCount: number;
  rank?: number;
  rankSuffix?: string;
}

export interface KPIDistribution {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PerformanceTier {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopPerformer {
  name: string;
  value: number;
}

export interface RichKPICardData {
  label: string;
  sublabel: string;
  icon: any; // Lucide icon component
  iconColor: string;
  iconBgColor: string;
  value: number;
  unit: string;
  target: number;
  lastWeekValue: number;
  sparklineData: number[];
  sparklineColor: string;
  distribution: KPIDistribution[];
  topPerformers: TopPerformer[];
  bottomPerformers: TopPerformer[];
}

export interface CoachingSessionWithAgent extends CoachingSession {
  agent?: Agent;
}

export interface LeaveRecordWithAgent extends LeaveRecord {
  agent?: Agent;
}

export interface AuditWithAgent extends Audit {
  agent?: Agent;
  agentName?: string;
}

export interface InsightData {
  type: string;
  message: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

