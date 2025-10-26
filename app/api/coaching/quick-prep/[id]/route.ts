import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { generateQuickPrep } from "@/lib/groq";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    // Get agent details
    const agent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);

    if (!agent[0]) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get last coaching session
    const lastCoaching = await db
      .select()
      .from(schema.coachingSessions)
      .where(eq(schema.coachingSessions.agentId, agentId))
      .orderBy(desc(schema.coachingSessions.date))
      .limit(1);

    // Get recent KPIs (last 7 days)
    const recentKPIs = await db
      .select()
      .from(schema.kpis)
      .where(eq(schema.kpis.agentId, agentId))
      .orderBy(desc(schema.kpis.date))
      .limit(7);

    // Calculate KPI changes
    const latestKPI = recentKPIs[0];
    const previousKPI = recentKPIs[6];

    let kpiChanges = "";
    if (latestKPI && previousKPI) {
      const qualityChange = Number(((latestKPI.quality || 0) - (previousKPI.quality || 0)).toFixed(1));
      const ahtChange = Number(((latestKPI.aht || 0) - (previousKPI.aht || 0)).toFixed(0));
      const srrChange = Number(((latestKPI.srr || 0) - (previousKPI.srr || 0)).toFixed(1));
      const vocChange = Number(((latestKPI.voc || 0) - (previousKPI.voc || 0)).toFixed(1));

      kpiChanges = `
Quality: ${latestKPI.quality}% (${qualityChange > 0 ? '+' : ''}${qualityChange}%)
AHT: ${latestKPI.aht}s (${ahtChange > 0 ? '+' : ''}${ahtChange}s)
SRR: ${latestKPI.srr}% (${srrChange > 0 ? '+' : ''}${srrChange}%)
VOC: ${latestKPI.voc}% (${vocChange > 0 ? '+' : ''}${vocChange}%)
      `.trim();
    } else if (latestKPI) {
      kpiChanges = `
Quality: ${latestKPI.quality}%
AHT: ${latestKPI.aht}s
SRR: ${latestKPI.srr}%
VOC: ${latestKPI.voc}%
      `.trim();
    }

    // Get recent audits (last 2-3)
    const recentAudits = await db
      .select()
      .from(schema.audits)
      .where(eq(schema.audits.agentId, agentId))
      .orderBy(desc(schema.audits.date))
      .limit(3);

    let auditSummary = "";
    if (recentAudits.length > 0) {
      const latestAudit = recentAudits[0];
      auditSummary = `
Latest Audit (${latestAudit.date}): Score ${latestAudit.score}%
Strengths: ${latestAudit.strengths || 'N/A'}
Weaknesses: ${latestAudit.weaknesses || 'N/A'}
      `.trim();
    }

    // Prepare data for AI
    let lastCoachingSummary = "";
    if (lastCoaching[0]) {
      const session = lastCoaching[0];
      lastCoachingSummary = `
Date: ${session.date}
Focus: ${session.focusAreas ? JSON.parse(session.focusAreas).join(", ") : 'N/A'}
Commitments: ${session.commitments ? JSON.parse(session.commitments).join(", ") : 'N/A'}
Outcome: ${session.outcome || 'Pending'}
      `.trim();
    }

    // Generate AI talking points
    const aiTalkingPoints = await generateQuickPrep({
      agentName: agent[0].name,
      lastCoaching: lastCoachingSummary,
      recentKPIs: kpiChanges,
      latestAudit: auditSummary,
      focusAreas: lastCoaching[0]?.focusAreas 
        ? JSON.parse(lastCoaching[0].focusAreas) 
        : undefined,
    });

    return NextResponse.json({
      agent: agent[0],
      lastCoaching: lastCoaching[0] || null,
      recentKPIs: {
        latest: latestKPI || null,
        previous: previousKPI || null,
        changes: kpiChanges,
      },
      recentAudits,
      aiTalkingPoints,
      prepTime: "5 minutes",
    });
  } catch (error) {
    console.error("Error generating quick prep:", error);
    return NextResponse.json(
      { error: "Failed to generate quick prep data" },
      { status: 500 }
    );
  }
}

