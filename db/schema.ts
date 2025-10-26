import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Agents table - Core agent information
export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("Agent"),
  hireDate: text("hire_date").notNull(),
  tenure: integer("tenure").notNull(), // in months
  avatarUrl: text("avatar_url"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// KPIs table - Daily KPI snapshots per agent
export const kpis = sqliteTable("kpis", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  quality: real("quality"), // percentage
  aht: integer("aht"), // Average Handle Time in seconds
  srr: real("srr"), // Sales Retention Rate percentage
  voc: real("voc"), // Voice of Customer percentage
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Audits table - Quality audit records
export const audits = sqliteTable("audits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(),
  score: real("score"), // Overall audit score
  notes: text("notes"),
  callType: text("call_type"), // Retention, Lapse, Cancellation, MTA, RFI, VOC
  impactCategory: text("impact_category"), // BI (Business Impact), CI (Customer Impact), Comment
  tags: text("tags"), // JSON array of tags
  transcriptId: integer("transcript_id").references(() => transcripts.id),
  strengths: text("strengths"), // JSON array
  weaknesses: text("weaknesses"), // JSON array
  coachingStatus: text("coaching_status"), // null, "scheduled", "completed"
  linkedCoachingId: integer("linked_coaching_id").references(() => coachingSessions.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Coaching sessions table
export const coachingSessions = sqliteTable("coaching_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(),
  scheduledDate: text("scheduled_date"),
  type: text("type").notNull(), // scheduled, urgent, follow-up
  sessionType: text("session_type"), // 1-on-1 Audit, Team Meeting, AHT Agreement, Error Review
  linkedAuditId: integer("linked_audit_id"), // References audit ID (no foreign key to avoid circular dependency)
  previousActionPlanRef: text("previous_action_plan_ref"), // References previous session's action plan
  improvementStatus: text("improvement_status"), // Improved, No Change, Declined
  focusAreas: text("focus_areas"), // JSON array
  whatWentWell: text("what_went_well"),
  developmentAreas: text("development_areas"),
  actionPlan: text("action_plan"),
  commitments: text("commitments"), // JSON array
  outcome: text("outcome"),
  status: text("status").notNull().default("draft"), // draft, scheduled, in_progress, completed, cancelled, follow_up_needed, needs_reschedule
  aiGenerated: integer("ai_generated").notNull().default(0), // boolean
  aiPrepGenerated: integer("ai_prep_generated").default(0),
  aiPrepContent: text("ai_prep_content"), // JSON
  coachingSummary: text("coaching_summary"), // What agent will get from session
  linkedAuditIds: text("linked_audit_ids"), // JSON array
  availabilityChecked: integer("availability_checked").default(0),
  effectiveness: text("effectiveness"), // "effective" | "needs_follow_up" | null
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Leave records table
export const leaveRecords = sqliteTable("leave_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(), // Keep for backward compatibility
  startDate: text("start_date"),
  endDate: text("end_date"),
  type: text("type").notNull(), // full-day, half-day, sick, personal, vacation
  reason: text("reason"),
  approved: integer("approved").notNull().default(1), // boolean (deprecated, use status)
  status: text("status").notNull().default("approved"), // pending, approved, declined
  requestedDate: text("requested_date"),
  approvedBy: text("approved_by"),
  approvedDate: text("approved_date"),
  declinedReason: text("declined_reason"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Transcripts table - Call transcripts
export const transcripts = sqliteTable("transcripts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(),
  callType: text("call_type"), // cancellation, renewal, query, etc.
  content: text("content").notNull(),
  redactedContent: text("redacted_content"), // PII-redacted version
  duration: integer("duration"), // in seconds
  sentiment: text("sentiment"), // positive, neutral, negative
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Insights table - AI-generated insights
export const insights = sqliteTable("insights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").references(() => agents.id), // null for team-wide insights
  type: text("type").notNull(), // red-flag, watch-list, win, correlation, action
  priority: text("priority").notNull(), // high, medium, low
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidence: text("evidence"), // JSON array of supporting data
  actionable: integer("actionable").notNull().default(1), // boolean
  resolved: integer("resolved").notNull().default(0), // boolean
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Uploads table - File upload history
export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // csv, excel, pdf, txt
  reportType: text("report_type"), // quality, kpi, transcript
  status: text("status").notNull(), // pending, processing, completed, failed
  recordsProcessed: integer("records_processed").default(0),
  errors: text("errors"), // JSON array of errors
  uploadedBy: text("uploaded_by"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Reports table - Generated reports
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // weekly, monthly, custom
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  content: text("content").notNull(), // JSON or Markdown
  highlights: text("highlights"),
  risks: text("risks"),
  wins: text("wins"),
  aiGenerated: integer("ai_generated").notNull().default(1),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Agent Attendance table - Daily attendance tracking
export const agentAttendance = sqliteTable("agent_attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status").notNull(), // "active", "sick", "holiday"
  notes: text("notes"),
  leaveStart: text("leave_start"), // For planned leave
  leaveEnd: text("leave_end"),
  notifiedManager: integer("notified_manager").default(0), // boolean
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

