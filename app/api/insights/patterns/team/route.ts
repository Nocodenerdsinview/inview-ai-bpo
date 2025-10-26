import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, sql } from "drizzle-orm";
import { analyzeTeamPatterns } from "@/lib/groq";

export async function GET() {
  try {
    // Get all agents
    const agents = await db.select().from(schema.agents);
    const agentCount = agents.length;

    // Get team KPIs (last 30 days)
    const teamKPIs = await db
      .select({
        date: schema.kpis.date,
        avgQuality: sql<number>`AVG(${schema.kpis.quality})`,
        avgAHT: sql<number>`AVG(${schema.kpis.aht})`,
        avgSRR: sql<number>`AVG(${schema.kpis.srr})`,
        avgVOC: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(sql`${schema.kpis.date} >= date('now', '-30 days')`)
      .groupBy(schema.kpis.date)
      .orderBy(desc(schema.kpis.date));

    // Format team KPIs
    const teamKPIsSummary = teamKPIs
      .map(
        (k) =>
          `${k.date}: Quality ${k.avgQuality?.toFixed(1)}%, AHT ${k.avgAHT?.toFixed(
            0
          )}s, SRR ${k.avgSRR?.toFixed(1)}%, VOC ${k.avgVOC?.toFixed(1)}%`
      )
      .join("\n");

    // Get recent audits across all agents
    const audits = await db
      .select({
        audit: schema.audits,
        agent: schema.agents,
      })
      .from(schema.audits)
      .leftJoin(schema.agents, sql`${schema.audits.agentId} = ${schema.agents.id}`)
      .orderBy(desc(schema.audits.date))
      .limit(50);

    // Aggregate audit themes
    const auditThemes: { [key: string]: number } = {};
    audits.forEach(({ audit }) => {
      if (audit.tags) {
        const tags = JSON.parse(audit.tags);
        tags.forEach((tag: any) => {
          const key = `${tag.category}-${tag.rating}`;
          auditThemes[key] = (auditThemes[key] || 0) + 1;
        });
      }
    });

    const auditSummary = `
Recent audit themes (last 50 audits):
${Object.entries(auditThemes)
  .map(([theme, count]) => `- ${theme}: ${count} occurrences`)
  .join("\n")}

Common strengths: ${audits
      .filter(({ audit }) => audit.strengths)
      .slice(0, 10)
      .map(({ audit, agent }) => `${agent?.name}: ${audit.strengths}`)
      .join(" | ")}

Common weaknesses: ${audits
      .filter(({ audit }) => audit.weaknesses)
      .slice(0, 10)
      .map(({ audit, agent }) => `${agent?.name}: ${audit.weaknesses}`)
      .join(" | ")}
    `.trim();

    // Get coaching sessions
    const coachingSessions = await db
      .select()
      .from(schema.coachingSessions)
      .where(sql`${schema.coachingSessions.date} >= date('now', '-30 days')`)
      .orderBy(desc(schema.coachingSessions.date));

    const coachingSummary = `
Total sessions (last 30 days): ${coachingSessions.length}
By type: ${JSON.stringify(
      coachingSessions.reduce((acc: any, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {})
    )}
By status: ${JSON.stringify(
      coachingSessions.reduce((acc: any, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        return acc;
      }, {})
    )}
    `.trim();

    // Generate AI analysis
    const analysis = await analyzeTeamPatterns({
      teamKPIs: teamKPIsSummary,
      auditSummaries: auditSummary,
      coachingSessions: coachingSummary,
      agentCount,
    });

    return NextResponse.json({
      teamPatterns: analysis,
      dataPoints: {
        agentCount,
        daysAnalyzed: teamKPIs.length,
        auditsAnalyzed: audits.length,
        coachingSessionsAnalyzed: coachingSessions.length,
      },
    });
  } catch (error) {
    console.error("Error analyzing team patterns:", error);
    return NextResponse.json(
      { error: "Failed to analyze team patterns" },
      { status: 500 }
    );
  }
}

