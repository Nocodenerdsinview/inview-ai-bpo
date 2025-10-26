import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const sqlite = new Database(path.join(process.cwd(), "inview.db"));
const db = drizzle(sqlite, { schema });

// Helper to generate dates
function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

// Helper to get future date
function getFutureDateString(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split("T")[0];
}

// Helper to add variance to a base value
function withVariance(base: number, variance: number): number {
  return Math.max(0, base + (Math.random() - 0.5) * variance * 2);
}

// Helper to generate time
function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 9) + 9; // 9 AM to 5 PM
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

async function seed() {
  console.log("🌱 Starting database seed with 10 focused agents...");

  // Clear existing data
  console.log("Clearing existing data...");
  db.delete(schema.kpis).run();
  db.delete(schema.audits).run();
  db.delete(schema.coachingSessions).run();
  db.delete(schema.leaveRecords).run();
  db.delete(schema.transcripts).run();
  db.delete(schema.insights).run();
  db.delete(schema.uploads).run();
  db.delete(schema.reports).run();
  db.delete(schema.agentAttendance).run();
  db.delete(schema.agents).run();

  // Agent Development Themes (consistent issues that evolve over time)
  const developmentThemes = {
    empathyGaps: ["Empathy gaps", "Not expressing empathy when needed", "Tone improvement needed"],
    ahtIssues: ["AHT management", "Hold/wrap time excessive", "System navigation efficiency"],
    rdcCompletion: ["RDC completion gaps", "Missing accidental damage confirmation", "Room count not verified"],
    pacing: ["Speaking too fast", "Customer can't absorb information", "Need to slow down delivery"],
    scriptingAdherence: ["Scripting not read verbatim", "Missing helpful statements", "Wrap-up incomplete"],
    probing: ["Weak probing", "Not asking open-ended questions", "Missing competitor details"],
    benefitStacking: ["Benefit stacking missing", "Not highlighting cover before price", "Value-selling gaps"],
    holdSignposting: ["Silence not signposted", "Long holds without updates", "Customer left confused"],
    speakingOver: ["Speaking over customer", "Not waiting 2 seconds", "Interrupting"],
    repetition: ["Asking same question twice", "Making customer repeat information", "Not taking notes"],
    cltAccuracy: ["CLT not completed", "Wrong disposition codes", "Competitor details missing"],
    toneEnergy: ["Robotic delivery", "Transactional vs genuine", "Low energy/enthusiasm"]
  };

  // 10 Focused Agent Profiles with Development Themes
  const agentProfiles = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      tenure: 36,
      status: "active",
      scenario: "top_performer",
      baseQuality: 95,
      baseAHT: 420,
      baseSRR: 93,
      baseVOC: 94,
      trend: "stable",
      themes: [] as string[], // Minimal development needs
      auditCount: 8,
      coachingCount: 3
    },
    {
      name: "Michael Chen",
      email: "michael.chen@example.com",
      tenure: 24,
      status: "active",
      scenario: "consistent_good",
      baseQuality: 88,
      baseAHT: 480,
      baseSRR: 87,
      baseVOC: 89,
      trend: "stable",
      themes: ["pacing", "benefitStacking"] as string[], // Minor improvements needed
      auditCount: 6,
      coachingCount: 4
    },
    {
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      tenure: 12,
      status: "active",
      scenario: "quality_needs_work",
      baseQuality: 68,
      baseAHT: 510,
      baseSRR: 85,
      baseVOC: 72,
      trend: "improving",
      themes: ["empathyGaps", "scriptingAdherence", "rdcCompletion"] as string[], // Improving over time
      auditCount: 7,
      coachingCount: 5
    },
    {
      name: "James Rodriguez",
      email: "james.rodriguez@example.com",
      tenure: 18,
      status: "active",
      scenario: "aht_issues",
      baseQuality: 91,
      baseAHT: 650,
      baseSRR: 89,
      baseVOC: 88,
      trend: "stable",
      themes: ["ahtIssues", "holdSignposting"] as string[], // Focused AHT work
      auditCount: 6,
      coachingCount: 6
    },
    {
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      tenure: 6,
      status: "active",
      scenario: "rising_star",
      baseQuality: 82,
      baseAHT: 540,
      baseSRR: 78,
      baseVOC: 80,
      trend: "improving",
      themes: ["probing", "cltAccuracy"] as string[], // Learning and improving
      auditCount: 5,
      coachingCount: 3
    },
    {
      name: "David Martinez",
      email: "david.martinez@example.com",
      tenure: 14,
      status: "active",
      scenario: "critical_performance",
      baseQuality: 62,
      baseAHT: 680,
      baseSRR: 65,
      baseVOC: 64,
      trend: "declining",
      themes: ["scriptingAdherence", "empathyGaps", "ahtIssues"] as string[], // Multiple issues declining
      auditCount: 8,
      coachingCount: 7
    },
    {
      name: "Jennifer Lee",
      email: "jennifer.lee@example.com",
      tenure: 30,
      status: "active", // Will add leave records
      scenario: "on_leave",
      baseQuality: 90,
      baseAHT: 470,
      baseSRR: 91,
      baseVOC: 92,
      trend: "stable",
      themes: ["pacing"] as string[], // Minor area only
      auditCount: 6,
      coachingCount: 3
    },
    {
      name: "Robert Taylor",
      email: "robert.taylor@example.com",
      tenure: 36,
      status: "active",
      scenario: "voc_specialist",
      baseQuality: 87,
      baseAHT: 495,
      baseSRR: 84,
      baseVOC: 96,
      trend: "stable",
      themes: ["benefitStacking", "probing"] as string[], // SRR improvement focus
      auditCount: 7,
      coachingCount: 4
    },
    {
      name: "Amanda Brown",
      email: "amanda.brown@example.com",
      tenure: 10,
      status: "active",
      scenario: "recently_improved",
      baseQuality: 79,
      baseAHT: 530,
      baseSRR: 80,
      baseVOC: 78,
      trend: "improving",
      themes: ["rdcCompletion", "repetition"] as string[], // Was worse, now improving
      auditCount: 6,
      coachingCount: 5
    },
    {
      name: "Chris Davis",
      email: "chris.davis@example.com",
      tenure: 48,
      status: "active",
      scenario: "experienced_declining",
      baseQuality: 74,
      baseAHT: 590,
      baseSRR: 73,
      baseVOC: 75,
      trend: "declining",
      themes: ["toneEnergy", "scriptingAdherence"] as string[], // Complacency setting in
      auditCount: 6,
      coachingCount: 5
    }
  ];

  console.log("Creating 10 agents with specific scenarios...");
  const agents = [];
  for (const profile of agentProfiles) {
    const hireDate = new Date();
    hireDate.setMonth(hireDate.getMonth() - profile.tenure);
    
    const result = db.insert(schema.agents).values({
      name: profile.name,
      email: profile.email,
      role: "Agent",
      hireDate: hireDate.toISOString().split("T")[0],
      tenure: profile.tenure,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name.replace(" ", "")}`,
      status: profile.status,
    }).run();

    agents.push({ id: result.lastInsertRowid as number, ...profile });
  }

  console.log("Generating 365 days of KPI data per agent with realistic trends...");
  for (const agent of agents) {
    for (let day = 0; day < 365; day++) {
      const date = getDateString(day);
      
      // Calculate which phase of the year we're in (0-365 days ago)
      const monthsAgo = day / 30;
      
      // Apply realistic trend patterns over the year
      let trendAdjustment = 0;
      let seasonalFactor = 0;
      
      // Seasonal patterns (Q4 typically better, summer slower)
      if (day < 90) {
        // Last 3 months (Q4 equivalent) - peak performance
        seasonalFactor = 2;
      } else if (day >= 150 && day < 240) {
        // Summer period (middle of year) - slight dip
        seasonalFactor = -1.5;
      }
      
      if (agent.trend === "improving") {
        // Steady improvement over the year: worse 12 months ago, better now
        trendAdjustment = (365 - day) * 0.03; // Gradual 10-point improvement over year
      } else if (agent.trend === "declining") {
        // Gradual decline: better 12 months ago, worse now
        trendAdjustment = -(365 - day) * 0.02; // Gradual 7-point decline
      } else {
        // Stable but with minor fluctuations
        trendAdjustment = Math.sin(day / 30) * 1.5; // Small waves
      }
      
      // Training period for newer agents (first 2 months)
      let trainingFactor = 0;
      if (agent.tenure <= 12 && day > 335) {
        // They were new 11-12 months ago
        trainingFactor = -10;
      } else if (agent.tenure <= 12 && day > 305) {
        trainingFactor = -5;
      }
      
      const totalAdjustment = trendAdjustment + seasonalFactor + trainingFactor;
      
      const quality = Math.round(withVariance(agent.baseQuality + totalAdjustment, 4));
      const aht = Math.round(withVariance(agent.baseAHT - (totalAdjustment * 2), 25));
      const srr = Math.round(withVariance(agent.baseSRR + totalAdjustment * 0.6, 4));
      const voc = Math.round(withVariance(agent.baseVOC + totalAdjustment * 0.6, 3));

      db.insert(schema.kpis).values({
        agentId: agent.id,
        date,
        quality: Math.max(0, Math.min(100, quality)),
        aht: Math.max(200, aht),
        srr: Math.max(0, Math.min(100, srr)),
        voc: Math.max(0, Math.min(100, voc)),
      }).run();
    }
  }

  console.log("Creating realistic audits with call types and impact categorization...");
  
  // Call type distribution (UK insurance)
  const callTypes = ["Retention", "Lapse", "Cancellation", "MTA", "RFI", "VOC"];
  const callTypeWeights = [0.40, 0.25, 0.15, 0.10, 0.05, 0.05]; // 40% Retention, 25% Lapse, etc.
  
  // Realistic audit strengths by quality framework
  const auditStrengths = [
    ["• Great empathy shown with 'I'm so sorry to hear that'. Keep it up!", "• Excellent use of power words: 'perfect', 'thank you', 'wonderful'"],
    ["• Strong willingness to assist: 'Let's go ahead and have a look'. Well done!", "• DPA completed efficiently"],
    ["• Used verbal nods effectively showing active listening", "• Great tone and energy throughout the call"],
    ["• RDC checks completed correctly. Excellent work!", "• Benefit stacking well executed before pricing"],
    ["• Setting expectations clearly with signposting", "• Personalization - used customer's name, built genuine rapport"],
    ["• Summary statements read accordingly", "• Professional and respectful throughout"],
    ["• Helpful statements used appropriately", "• Good use of probing to understand customer needs"],
    ["• CLT captured correctly", "• Handled customer objections well with empathy"]
  ];

  // Realistic development areas based on agent themes
  const getDevelopmentAreas = (themes: string[], themesDefs: any): string[] => {
    const areas: string[] = [];
    for (const theme of themes) {
      const themeDef = themesDefs[theme];
      if (themeDef && themeDef.length > 0) {
        areas.push(`• ${themeDef[Math.floor(Math.random() * themeDef.length)]}`);
      }
    }
    // Add specific examples
    if (themes.includes("empathyGaps")) {
      areas.push("• It would have been ideal to express empathy earlier when customer mentioned cancellation");
    }
    if (themes.includes("rdcCompletion")) {
      areas.push("• RDC: Missing accidental damage confirmation (BI)");
    }
    if (themes.includes("holdSignposting")) {
      areas.push("• There were points of silence not signposted - moving forward fill silence with expectations (CI)");
    }
    return areas.slice(0, 3); // Max 3 development areas
  };

  // Generate 2-3 audits per agent per month across the year (24-36 audits per agent)
  for (const agent of agents) {
    const totalAudits = Math.floor(Math.random() * 13) + 24; // 24-36 audits over the year
    for (let i = 0; i < totalAudits; i++) {
      // Distribute audits across the full year (365 days)
      const daysAgo = Math.floor(Math.random() * 365) + 1;
      const date = getDateString(daysAgo);
      
      // Score based on agent profile and time
      const monthsAgo = daysAgo / 30;
      let score = withVariance(agent.baseQuality, 8);
      
      if (agent.trend === "improving") {
        // Older audits worse, recent better
        score += monthsAgo * -1.5; // Improve over time
      } else if (agent.trend === "declining") {
        // Older audits better, recent worse
        score += monthsAgo * 1; // Decline over time
      }
      score = Math.round(Math.max(50, Math.min(100, score)));

      // Select call type based on weights
      const random = Math.random();
      let cumulativeWeight = 0;
      let callType = "Retention";
      for (let j = 0; j < callTypes.length; j++) {
        cumulativeWeight += callTypeWeights[j];
        if (random <= cumulativeWeight) {
          callType = callTypes[j];
          break;
        }
      }

      // Impact categorization based on score and themes
      let impactCategory = null;
      if (score < 75) {
        // Below 75 needs marking
        if (agent.themes.includes("scriptingAdherence") || agent.themes.includes("cltAccuracy")) {
          impactCategory = "BI"; // Business Impact
        } else if (agent.themes.includes("empathyGaps") || agent.themes.includes("toneEnergy")) {
          impactCategory = "CI"; // Customer Impact
        } else {
          impactCategory = Math.random() > 0.5 ? "BI" : "CI";
        }
      } else if (score < 85) {
        impactCategory = "Comment"; // Minor issues
      }

      // Generate realistic notes based on call type
      let callSummary = "";
      if (callType === "Retention") {
        callSummary = "Customer called to discuss renewal pricing after finding competitor quote.";
      } else if (callType === "Lapse") {
        callSummary = "Customer contacted to lapse renewal, stating they found cheaper elsewhere.";
      } else if (callType === "Cancellation") {
        callSummary = "Customer called to cancel policy mid-term.";
      } else if (callType === "MTA") {
        callSummary = "Customer requested mid-term adjustment to policy details.";
      } else if (callType === "RFI") {
        callSummary = "Room for improvement - quality audit identified process gaps.";
      } else {
        callSummary = "Voice of customer feedback call.";
      }

      const strengthsList = auditStrengths[i % auditStrengths.length];
      const developmentList = getDevelopmentAreas(agent.themes, developmentThemes);

      // Coaching status - some coached, some not
      const needsCoaching = score < 80 && Math.random() > 0.4;
      const coachingStatus = needsCoaching ? (Math.random() > 0.5 ? "scheduled" : null) : "completed";

      db.insert(schema.audits).values({
        agentId: agent.id,
        date,
        score,
        callType,
        impactCategory,
        notes: `${callSummary} ${score >= 90 ? 'Excellent performance - maintain standards.' : score >= 75 ? 'Good performance with minor areas for development.' : 'Performance needs improvement - coaching required.'}`,
        tags: JSON.stringify(score >= 80 ? ["good_call", "adherence"] : ["coaching_needed", "quality_concern"]),
        strengths: JSON.stringify(strengthsList),
        weaknesses: JSON.stringify(developmentList),
        coachingStatus,
      }).run();
    }
  }

  console.log("Creating realistic coaching sessions with action plan tracking...");
  
  // Session types distribution
  const sessionTypes = ["1-on-1 Audit", "Team Meeting", "AHT Agreement", "Error Review"];
  const sessionTypeWeights = [0.80, 0.10, 0.05, 0.05]; // 80% 1-on-1, 10% Team, etc.
  
  // Realistic "What Went Well" examples
  const whatWentWellExamples = [
    "• Great empathy shown with 'I'm so sorry to hear that'. Keep it up!\n• Strong willingness to assist throughout\n• Excellent use of power words\n• Good tone and energy",
    "• Used verbal nods effectively showing active listening\n• DPA completed efficiently\n• Setting expectations clearly\n• Professional and respectful",
    "• RDC checks completed correctly\n• Benefit stacking well executed\n• Used customer's name for personalization\n• Handled objections with empathy",
    "• Summary statements read accordingly\n• Helpful statements used appropriately\n• CLT captured correctly\n• Great probing to understand needs"
  ];
  
  // Realistic action plans by theme
  const getActionPlan = (themes: string[]): string => {
    const plans: string[] = [];
    let planNum = 1;
    
    for (const theme of themes) {
      if (theme === "empathyGaps") {
        plans.push(`${planNum}. Practice empathy statements: Use "I'm so sorry to hear that" when customer expresses frustration - This week - Manager spot-checks 3 calls`);
        planNum++;
      } else if (theme === "ahtIssues") {
        plans.push(`${planNum}. Hold/wrap management: Complete all documentation while customer on call, use hold only when necessary - Next 10 calls - AHT target <550s`);
        planNum++;
      } else if (theme === "rdcCompletion") {
        plans.push(`${planNum}. RDC checklist: Confirm ALL details including accidental damage, room count, occupancy before proceeding - Moving forward - Zero RDC misses`);
        planNum++;
      } else if (theme === "pacing") {
        plans.push(`${planNum}. Slow down delivery: Pause between key points, check customer understanding - Next 5 calls - Manager feedback`);
        planNum++;
      } else if (theme === "scriptingAdherence") {
        plans.push(`${planNum}. Read all mandatory scripting verbatim: Helpful statements, summary statements, wrap-up - This week - 100% compliance`);
        planNum++;
      } else if (theme === "benefitStacking") {
        plans.push(`${planNum}. Benefit stacking: List buildings AND contents cover BEFORE revealing price - Next 10 calls - SRR improvement target`);
        planNum++;
      } else if (theme === "holdSignposting") {
        plans.push(`${planNum}. Signpost silence: "I'm just checking your quote, I may go quiet but I'm still with you" - Every hold - Zero customer confusion`);
        planNum++;
      }
    }
    
    if (plans.length === 0) {
      plans.push("1. Maintain current performance standards - Continue applying best practices");
    }
    
    return plans.slice(0, 3).join("\n");
  };

  // Store audit IDs for linking
  const agentAudits: { [key: number]: number[] } = {};
  const allAudits = db.select().from(schema.audits).all();
  for (const audit of allAudits) {
    if (!agentAudits[audit.agentId]) {
      agentAudits[audit.agentId] = [];
    }
    agentAudits[audit.agentId].push(audit.id);
  }

  for (const agent of agents) {
    const agentAuditIds = agentAudits[agent.id] || [];
    
    // Past completed sessions distributed across the year (12-24 sessions)
    const pastSessions = Math.floor(Math.random() * 13) + 12; // 12-24 sessions
    const sessionDates: { date: string; actionPlan: string; sessionId?: number }[] = [];
    
    for (let i = 0; i < pastSessions; i++) {
      // Distribute sessions across the full year
      const daysAgo = Math.floor(Math.random() * 350) + 5; // 5-355 days ago
      const date = getDateString(daysAgo);
      
      // Select session type
      const random = Math.random();
      let cumulativeWeight = 0;
      let sessionType = "1-on-1 Audit";
      for (let j = 0; j < sessionTypes.length; j++) {
        cumulativeWeight += sessionTypeWeights[j];
        if (random <= cumulativeWeight) {
          sessionType = sessionTypes[j];
          break;
        }
      }
      
      // Link to a relevant audit (if 1-on-1 Audit type)
      let linkedAuditId = null;
      if (sessionType === "1-on-1 Audit" && agentAuditIds.length > 0) {
        linkedAuditId = agentAuditIds[Math.floor(Math.random() * agentAuditIds.length)];
      }
      
      // Reference previous action plan (if this is a follow-up)
      let previousActionPlanRef = null;
      let improvementStatus = null;
      if (i > 0 && sessionDates.length > 0 && Math.random() > 0.4) {
        const prevSession = sessionDates[sessionDates.length - 1];
        previousActionPlanRef = `Previous session ${prevSession.date}: ${prevSession.actionPlan.substring(0, 100)}...`;
        
        // Determine improvement based on trend
        if (agent.trend === "improving") {
          improvementStatus = Math.random() > 0.3 ? "Improved" : "No Change";
        } else if (agent.trend === "declining") {
          improvementStatus = Math.random() > 0.6 ? "Improved" : (Math.random() > 0.5 ? "No Change" : "Declined");
        } else {
          improvementStatus = Math.random() > 0.2 ? "Improved" : "No Change";
        }
      }
      
      // Generate realistic content
      const whatWentWell = whatWentWellExamples[i % whatWentWellExamples.length];
      const developmentAreas = getDevelopmentAreas(agent.themes, developmentThemes).join("\n");
      const actionPlan = getActionPlan(agent.themes);
      
      const focusAreas = agent.themes.map(t => {
        if (t === "empathyGaps") return "Empathy & Tone";
        if (t === "ahtIssues") return "AHT Management";
        if (t === "rdcCompletion") return "RDC Completion";
        if (t === "pacing") return "Pacing & Clarity";
        if (t === "scriptingAdherence") return "Scripting Compliance";
        if (t === "probing") return "Probing & Fact-Finding";
        if (t === "benefitStacking") return "Benefit Stacking";
        if (t === "holdSignposting") return "Hold Management";
        if (t === "cltAccuracy") return "CLT Accuracy";
        if (t === "toneEnergy") return "Tone & Energy";
        return "Quality Improvement";
      });
      
      const result = db.insert(schema.coachingSessions).values({
        agentId: agent.id,
        date,
        scheduledDate: date,
        type: (i === 0 || improvementStatus === "Declined") ? "urgent" : "scheduled",
        sessionType,
        linkedAuditId,
        previousActionPlanRef,
        improvementStatus,
        focusAreas: JSON.stringify(focusAreas.length > 0 ? focusAreas : ["Quality Score", "Customer Service"]),
        whatWentWell,
        developmentAreas: developmentAreas || "Continue maintaining high standards",
        actionPlan,
        commitments: JSON.stringify([
          "Apply action plan items in next 10 calls",
          "Request feedback from manager",
          "Review quality framework materials"
        ]),
        outcome: improvementStatus === "Improved" 
          ? "Agent demonstrated clear improvement and commitment to continued development" 
          : "Agent engaged positively and committed to action plan",
        status: "completed",
        aiGenerated: 1,
        effectiveness: (improvementStatus === "Improved" || improvementStatus === null) ? "effective" : "needs_follow_up",
      }).run();
      
      sessionDates.push({ date, actionPlan, sessionId: result.lastInsertRowid as number });
    }

    // Future scheduled sessions (1-3)
    const futureSessions = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < futureSessions; i++) {
      const daysAhead = Math.floor(Math.random() * 10) + 2; // 2-12 days ahead
      const scheduledDate = getFutureDateString(daysAhead);
      const scheduledTime = getRandomTime();
      
      // Most future sessions are 1-on-1
      const sessionType = Math.random() > 0.2 ? "1-on-1 Audit" : "Team Meeting";
      
      const focusAreas = agent.themes.map(t => {
        if (t === "empathyGaps") return "Empathy & Tone";
        if (t === "ahtIssues") return "AHT Management";
        if (t === "rdcCompletion") return "RDC Completion";
        return "Quality Improvement";
      });
      
      db.insert(schema.coachingSessions).values({
        agentId: agent.id,
        date: scheduledDate,
        scheduledDate: `${scheduledDate}T${scheduledTime}:00`,
        type: agent.scenario === "critical_performance" || agent.scenario === "quality_needs_work" ? "urgent" : "scheduled",
        sessionType,
        focusAreas: JSON.stringify(focusAreas.length > 0 ? focusAreas : ["Quality Score", "Performance Review"]),
        status: "scheduled",
        aiGenerated: 1,
        aiPrepGenerated: 1,
        aiPrepContent: JSON.stringify({
          summary: `Focus on ${agent.themes.join(", ") || "performance improvement"} based on recent audits`,
          talkingPoints: "Review recent KPIs, discuss action plan progress, set new goals",
          recommendations: "Celebrate wins, address gaps, role-play scenarios"
        }),
        coachingSummary: `Upcoming ${sessionType} to review performance and set improvement targets`,
        availabilityChecked: 1,
      }).run();
    }
  }

  console.log("Creating attendance records (last 30 days)...");
  const today = new Date().toISOString().split("T")[0];
  
  for (const agent of agents) {
    // Last 30 days of attendance
    for (let day = 0; day < 30; day++) {
      const date = getDateString(day);
      let status = "active";
      
      // Jennifer Lee is on leave some days
      if (agent.name === "Jennifer Lee" && day < 5) {
        status = "holiday";
      }
      // Random sick days (rare)
      else if (Math.random() < 0.03) {
        status = "sick";
      }
      // Random holiday days (rare)
      else if (Math.random() < 0.02) {
        status = "holiday";
      }

      db.insert(schema.agentAttendance).values({
        agentId: agent.id,
        date,
        status,
        notes: status !== "active" ? (status === "sick" ? "Sick day" : "Planned leave") : null,
      }).run();
    }

    // Today's attendance
    const todayStatus = agent.name === "Jennifer Lee" ? "holiday" : "active";
    db.insert(schema.agentAttendance).values({
      agentId: agent.id,
      date: today,
      status: todayStatus,
      notes: todayStatus === "holiday" ? "Planned annual leave" : null,
    }).run();

    // Jennifer Lee - Planned future leave
    if (agent.name === "Jennifer Lee") {
      for (let i = 1; i <= 7; i++) {
        const futureDate = getFutureDateString(i);
        db.insert(schema.agentAttendance).values({
          agentId: agent.id,
          date: futureDate,
          status: "holiday",
          notes: "Planned annual leave",
          leaveStart: getFutureDateString(1),
          leaveEnd: getFutureDateString(7),
          notifiedManager: 1,
        }).run();
      }
    }
  }

  console.log("Creating leave records...");
  // Create multi-day leave periods for testing the timeline view
  const leaveRecordsData = [
    // Jennifer Lee - Upcoming holiday (already in attendance)
    {
      agentId: agents.find(a => a.name === "Jennifer Lee")!.id,
      startDate: getFutureDateString(1),
      endDate: getFutureDateString(7),
      type: "holiday",
      status: "approved",
      reason: "Annual family holiday",
      requestedDate: getDateString(15),
      approvedBy: "Manager",
      approvedDate: getDateString(14),
    },
    // Sarah Johnson - Past sick leave
    {
      agentId: agents.find(a => a.name === "Sarah Johnson")!.id,
      startDate: getDateString(5),
      endDate: getDateString(7),
      type: "sick",
      status: "approved",
      reason: "Flu recovery",
      requestedDate: getDateString(6),
      approvedBy: "Manager",
      approvedDate: getDateString(6),
    },
    // Michael Chen - Upcoming personal leave
    {
      agentId: agents.find(a => a.name === "Michael Chen")!.id,
      startDate: getFutureDateString(10),
      endDate: getFutureDateString(12),
      type: "personal",
      status: "approved",
      reason: "Family matters",
      requestedDate: getDateString(3),
      approvedBy: "Manager",
      approvedDate: getDateString(2),
    },
    // Emma Wilson - Pending vacation request
    {
      agentId: agents.find(a => a.name === "Emma Wilson")!.id,
      startDate: getFutureDateString(20),
      endDate: getFutureDateString(25),
      type: "vacation",
      status: "pending",
      reason: "Beach holiday",
      requestedDate: getDateString(1),
      approvedBy: null,
      approvedDate: null,
    },
    // James Rodriguez - Past vacation
    {
      agentId: agents.find(a => a.name === "James Rodriguez")!.id,
      startDate: getDateString(15),
      endDate: getDateString(17),
      type: "vacation",
      status: "approved",
      reason: "Long weekend trip",
      requestedDate: getDateString(25),
      approvedBy: "Manager",
      approvedDate: getDateString(24),
    },
    // Lisa Anderson - Half day (upcoming)
    {
      agentId: agents.find(a => a.name === "Lisa Anderson")!.id,
      startDate: getFutureDateString(3),
      endDate: getFutureDateString(3),
      type: "half-day",
      status: "approved",
      reason: "Medical appointment",
      requestedDate: getDateString(7),
      approvedBy: "Manager",
      approvedDate: getDateString(6),
    },
    // David Martinez - Declined vacation
    {
      agentId: agents.find(a => a.name === "David Martinez")!.id,
      startDate: getFutureDateString(5),
      endDate: getFutureDateString(9),
      type: "vacation",
      status: "declined",
      reason: "Short notice request",
      requestedDate: getDateString(0),
      approvedBy: "Manager",
      approvedDate: null,
      declinedReason: "Insufficient notice - peak period",
    },
    // Robert Taylor - Upcoming vacation
    {
      agentId: agents.find(a => a.name === "Robert Taylor")!.id,
      startDate: getFutureDateString(15),
      endDate: getFutureDateString(19),
      type: "vacation",
      status: "approved",
      reason: "Annual leave",
      requestedDate: getDateString(20),
      approvedBy: "Manager",
      approvedDate: getDateString(19),
    },
    // Amanda Brown - Past sick day
    {
      agentId: agents.find(a => a.name === "Amanda Brown")!.id,
      startDate: getDateString(3),
      endDate: getDateString(3),
      type: "sick",
      status: "approved",
      reason: "Migraine",
      requestedDate: getDateString(3),
      approvedBy: "Manager",
      approvedDate: getDateString(3),
    },
    // Chris Davis - Pending personal leave
    {
      agentId: agents.find(a => a.name === "Chris Davis")!.id,
      startDate: getFutureDateString(8),
      endDate: getFutureDateString(9),
      type: "personal",
      status: "pending",
      reason: "Personal commitment",
      requestedDate: getDateString(0),
      approvedBy: null,
      approvedDate: null,
    },
    // Michael Chen - Compassionate leave
    {
      agentId: agents.find(a => a.name === "Michael Chen")!.id,
      startDate: getDateString(10),
      endDate: getDateString(12),
      type: "compassionate",
      status: "approved",
      reason: "Family bereavement",
      requestedDate: getDateString(11),
      approvedBy: "Manager",
      approvedDate: getDateString(11),
    },
    // Amanda Brown - Study leave
    {
      agentId: agents.find(a => a.name === "Amanda Brown")!.id,
      startDate: getFutureDateString(6),
      endDate: getFutureDateString(8),
      type: "study",
      status: "approved",
      reason: "Professional certification exam",
      requestedDate: getDateString(12),
      approvedBy: "Manager",
      approvedDate: getDateString(10),
    },
  ];

  for (const leaveData of leaveRecordsData) {
    db.insert(schema.leaveRecords).values({
      agentId: leaveData.agentId,
      date: leaveData.startDate, // Use startDate as date for backward compatibility
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      type: leaveData.type,
      reason: leaveData.reason,
      status: leaveData.status,
      approved: leaveData.status === "approved" ? 1 : 0,
      requestedDate: leaveData.requestedDate || null,
      approvedBy: leaveData.approvedBy || null,
      approvedDate: leaveData.approvedDate || null,
      declinedReason: (leaveData as any).declinedReason || null,
    }).run();
  }

  console.log("Creating sample transcripts...");
  for (const agent of agents) {
    const numTranscripts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTranscripts; i++) {
      const daysAgo = Math.floor(Math.random() * 20) + 1;
      db.insert(schema.transcripts).values({
        agentId: agent.id,
        date: getDateString(daysAgo),
        callType: ["Cancellation - Price", "Renewal", "General Query", "Complaint"][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 600) + 300,
        content: "Sample call transcript content would go here...",
        sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)],
      }).run();
    }
  }

  console.log("Creating insights...");
  db.insert(schema.insights).values({
    type: "win",
    priority: "medium",
    title: "Quality Scores Trending Up",
    description: "Team quality scores have improved by 3.2% this month",
    evidence: JSON.stringify([
      "Sarah Johnson: +5% quality",
      "Michael Chen: +3% quality",
      "Lisa Anderson: +7% quality"
    ]),
    actionable: 0,
    resolved: 0,
  }).run();

  db.insert(schema.insights).values({
    type: "red-flag",
    priority: "high",
    title: "AHT Concerns",
    description: "2 agents showing elevated AHT requiring coaching intervention",
    evidence: JSON.stringify([
      "James Rodriguez: 650s avg (target: <550s)",
      "David Martinez: 680s avg (target: <550s)"
    ]),
    actionable: 1,
    resolved: 0,
  }).run();

  db.insert(schema.insights).values({
    type: "action",
    priority: "high",
    title: "Critical Performance Alert",
    description: "David Martinez requires immediate coaching intervention - multiple KPIs underperforming",
    evidence: JSON.stringify([
      "Quality: 62% (target: >70%)",
      "AHT: 680s (target: <550s)",
      "SRR: 65% (target: >70%)"
    ]),
    actionable: 1,
    resolved: 0,
  }).run();

  console.log("✅ Database seeded successfully with realistic UK call center data!");
  console.log("📊 Created comprehensive data with authentic coaching language:");
  console.log(`   - 10 agents with specific performance scenarios & development themes`);
  console.log(`   - 365 days of daily KPI data per agent (full year history with trends)`);
  console.log(`   - 24-36 audits per agent with:`);
  console.log(`     • Call types (Retention, Lapse, Cancellation, MTA, RFI, VOC)`);
  console.log(`     • Impact categorization (BI, CI, Comment)`);
  console.log(`     • Authentic quality framework feedback`);
  console.log(`   - 12-24 coaching sessions per agent with:`);
  console.log(`     • Session types (1-on-1 Audit, Team Meeting, AHT Agreement, Error Review)`);
  console.log(`     • Action plan tracking & previous session references`);
  console.log(`     • Improvement status (Improved, No Change, Declined)`);
  console.log(`     • Linked audit IDs for 1-on-1 sessions`);
  console.log(`     • Authentic UK coaching language & structure`);
  console.log(`   - Future coaching sessions (scheduled with times)`);
  console.log(`   - 30 days of attendance records`);
  console.log(`   - Sample transcripts and insights`);
  console.log(`   - Realistic trends: seasonal patterns, training periods, agent development trajectories`);
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    sqlite.close();
    process.exit(0);
  });
