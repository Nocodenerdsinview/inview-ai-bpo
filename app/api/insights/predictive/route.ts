import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { generatePredictiveAlerts } from "@/lib/groq";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get("agentId");
    const scope = agentId ? "agent" : "team";

    let recentTrends = "";
    let recentCoaching = "";
    let targetName = "";

    if (agentId) {
      // Agent-specific predictions
      const agent = await db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, parseInt(agentId)))
        .limit(1);

      if (!agent[0]) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      targetName = agent[0].name;

      // Get last 21 days of KPIs
      const kpis = await db
        .select()
        .from(schema.kpis)
        .where(eq(schema.kpis.agentId, parseInt(agentId)))
        .orderBy(desc(schema.kpis.date))
        .limit(21);

      recentTrends = kpis
        .map(
          (k) =>
            `${k.date}: Quality ${k.quality}%, AHT ${k.aht}s, SRR ${k.srr}%, VOC ${k.voc}%`
        )
        .join("\n");

      // Get recent coaching
      const coaching = await db
        .select()
        .from(schema.coachingSessions)
        .where(eq(schema.coachingSessions.agentId, parseInt(agentId)))
        .orderBy(desc(schema.coachingSessions.date))
        .limit(3);

      recentCoaching = coaching
        .map((c) => {
          const focusAreas = c.focusAreas ? JSON.parse(c.focusAreas) : [];
          return `${c.date}: ${c.type} | Focus: ${focusAreas.join(", ")} | Outcome: ${
            c.outcome || "Pending"
          }`;
        })
        .join("\n");
    } else {
      // Team-wide predictions
      targetName = "Team";

      // Get last 21 days of team averages
      const teamKPIs = await db
        .select({
          date: schema.kpis.date,
          avgQuality: sql<number>`AVG(${schema.kpis.quality})`,
          avgAHT: sql<number>`AVG(${schema.kpis.aht})`,
          avgSRR: sql<number>`AVG(${schema.kpis.srr})`,
          avgVOC: sql<number>`AVG(${schema.kpis.voc})`,
        })
        .from(schema.kpis)
        .where(sql`${schema.kpis.date} >= date('now', '-21 days')`)
        .groupBy(schema.kpis.date)
        .orderBy(desc(schema.kpis.date));

      recentTrends = teamKPIs
        .map(
          (k) =>
            `${k.date}: Quality ${k.avgQuality?.toFixed(1)}%, AHT ${k.avgAHT?.toFixed(
              0
            )}s, SRR ${k.avgSRR?.toFixed(1)}%, VOC ${k.avgVOC?.toFixed(1)}%`
        )
        .join("\n");

      // Get recent team coaching activity
      const coaching = await db
        .select()
        .from(schema.coachingSessions)
        .where(sql`${schema.coachingSessions.date} >= date('now', '-21 days')`)
        .orderBy(desc(schema.coachingSessions.date));

      const sessionTypes = coaching.reduce((acc: any, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {});

      recentCoaching = `
Total sessions: ${coaching.length}
By type: ${JSON.stringify(sessionTypes)}
Completed: ${coaching.filter((c) => c.status === "completed").length}
      `.trim();
    }

    // Generate predictive alerts
    const predictions = await generatePredictiveAlerts({
      agentOrTeam: targetName,
      recentTrends,
      recentCoaching,
    });

    return NextResponse.json({
      scope,
      target: targetName,
      predictions,
      forecastPeriod: "7 days",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating predictive alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}

