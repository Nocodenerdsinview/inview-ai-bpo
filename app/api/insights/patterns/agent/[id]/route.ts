import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { analyzeAgentPatterns } from "@/lib/groq";

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

    // Get last 90 days of KPIs
    const kpis = await db
      .select()
      .from(schema.kpis)
      .where(eq(schema.kpis.agentId, agentId))
      .orderBy(desc(schema.kpis.date))
      .limit(90);

    // Format KPI history
    const kpiHistory = kpis
      .map(
        (k) =>
          `${k.date}: Quality ${k.quality}%, AHT ${k.aht}s, SRR ${k.srr}%, VOC ${k.voc}%`
      )
      .join("\n");

    // Get all audits
    const audits = await db
      .select()
      .from(schema.audits)
      .where(eq(schema.audits.agentId, agentId))
      .orderBy(desc(schema.audits.date))
      .limit(20);

    // Format audit summaries
    const auditSummaries = audits
      .map((a) => {
        const tags = a.tags ? JSON.parse(a.tags) : [];
        return `${a.date}: Score ${a.score}% | Tags: ${tags
          .map((t: any) => `${t.category}-${t.rating}`)
          .join(", ")} | Strengths: ${a.strengths || "N/A"} | Weaknesses: ${
          a.weaknesses || "N/A"
        }`;
      })
      .join("\n");

    // Get coaching history
    const coachingHistory = await db
      .select()
      .from(schema.coachingSessions)
      .where(eq(schema.coachingSessions.agentId, agentId))
      .orderBy(desc(schema.coachingSessions.date))
      .limit(10);

    // Format coaching history
    const coachingSummary = coachingHistory
      .map((c) => {
        const focusAreas = c.focusAreas ? JSON.parse(c.focusAreas) : [];
        return `${c.date}: Type ${c.type} | Focus: ${focusAreas.join(
          ", "
        )} | Outcome: ${c.outcome || "Pending"}`;
      })
      .join("\n");

    // Get leave patterns
    const leaveRecords = await db
      .select()
      .from(schema.leaveRecords)
      .where(eq(schema.leaveRecords.agentId, agentId))
      .orderBy(desc(schema.leaveRecords.date))
      .limit(30);

    const leavePatterns = leaveRecords
      .map((l) => `${l.date}: ${l.type}`)
      .join("\n");

    // Generate AI analysis
    const analysis = await analyzeAgentPatterns({
      agentName: agent[0].name,
      kpiHistory,
      auditSummaries,
      coachingHistory: coachingSummary,
      leavePatterns: leavePatterns || undefined,
    });

    return NextResponse.json({
      agent: agent[0],
      patterns: analysis,
      dataPoints: {
        kpisAnalyzed: kpis.length,
        auditsAnalyzed: audits.length,
        coachingSessionsAnalyzed: coachingHistory.length,
        leaveRecordsAnalyzed: leaveRecords.length,
      },
    });
  } catch (error) {
    console.error("Error analyzing agent patterns:", error);
    return NextResponse.json(
      { error: "Failed to analyze patterns" },
      { status: 500 }
    );
  }
}

