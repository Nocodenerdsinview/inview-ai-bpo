import { NextRequest, NextResponse } from "next/server";
import { generateCoachingMaterial } from "@/lib/groq";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, transcript, observations, callType } = body;

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Get agent info
    const agent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, parseInt(agentId)))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get recent KPIs
    const recentKPIs = await db
      .select()
      .from(schema.kpis)
      .where(eq(schema.kpis.agentId, parseInt(agentId)))
      .orderBy(desc(schema.kpis.date))
      .limit(7);

    const kpiSummary = recentKPIs.length > 0
      ? `Recent 7-day averages:
- Quality: ${(recentKPIs.reduce((sum, k) => sum + (k.quality || 0), 0) / recentKPIs.length).toFixed(0)}%
- AHT: ${Math.round(recentKPIs.reduce((sum, k) => sum + (k.aht || 0), 0) / recentKPIs.length)}s
- SRR: ${(recentKPIs.reduce((sum, k) => sum + (k.srr || 0), 0) / recentKPIs.length).toFixed(0)}%
- VOC: ${(recentKPIs.reduce((sum, k) => sum + (k.voc || 0), 0) / recentKPIs.length).toFixed(0)}%`
      : undefined;

    // Get recent audits
    const recentAudits = await db
      .select()
      .from(schema.audits)
      .where(eq(schema.audits.agentId, parseInt(agentId)))
      .orderBy(desc(schema.audits.date))
      .limit(3);

    const auditSummary = recentAudits.length > 0
      ? `Recent audits (last 3):
${recentAudits.map((a, i) => `${i + 1}. Score: ${a.score?.toFixed(0)}%, ${a.notes || "No notes"}`).join("\n")}`
      : undefined;

    // Generate coaching material
    const coachingContent = await generateCoachingMaterial({
      agentName: agent[0].name,
      transcript,
      observations,
      recentKPIs: kpiSummary,
      recentAudits: auditSummary,
      callType,
    });

    return NextResponse.json({ content: coachingContent });
  } catch (error) {
    console.error("Error generating coaching material:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching material" },
      { status: 500 }
    );
  }
}


