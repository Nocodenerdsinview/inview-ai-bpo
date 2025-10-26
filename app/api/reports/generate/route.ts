import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, sql } from "drizzle-orm";
import { generateEnhancedWeeklyReport } from "@/lib/groq";
import { subDays, format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    const start = startDate || format(subDays(new Date(), 7), "yyyy-MM-dd");
    const end = endDate || format(new Date(), "yyyy-MM-dd");

    // Get team KPIs for the week
    const teamKPIs = await db
      .select({
        date: schema.kpis.date,
        avgQuality: sql<number>`AVG(${schema.kpis.quality})`,
        avgAHT: sql<number>`AVG(${schema.kpis.aht})`,
        avgSRR: sql<number>`AVG(${schema.kpis.srr})`,
        avgVOC: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(sql`${schema.kpis.date} >= ${start} AND ${schema.kpis.date} <= ${end}`)
      .groupBy(schema.kpis.date)
      .orderBy(schema.kpis.date);

    const teamKPISummary = `
Weekly Average:
- Quality: ${(teamKPIs.reduce((sum, k) => sum + (k.avgQuality || 0), 0) / teamKPIs.length).toFixed(1)}%
- AHT: ${(teamKPIs.reduce((sum, k) => sum + (k.avgAHT || 0), 0) / teamKPIs.length).toFixed(0)}s
- SRR: ${(teamKPIs.reduce((sum, k) => sum + (k.avgSRR || 0), 0) / teamKPIs.length).toFixed(1)}%
- VOC: ${(teamKPIs.reduce((sum, k) => sum + (k.avgVOC || 0), 0) / teamKPIs.length).toFixed(1)}%

Daily Breakdown:
${teamKPIs.map(k => `${k.date}: Q=${k.avgQuality?.toFixed(1)}%, AHT=${k.avgAHT?.toFixed(0)}s, SRR=${k.avgSRR?.toFixed(1)}%, VOC=${k.avgVOC?.toFixed(1)}%`).join("\n")}
    `.trim();

    // OPTIMIZED: Get agent performance for the week (avoid N+1 queries)
    // Fetch all agents and KPIs in parallel, then group in memory
    const [agents, allKPIs] = await Promise.all([
      db.select().from(schema.agents),
      db
        .select()
        .from(schema.kpis)
        .where(
          sql`${schema.kpis.date} >= ${start} AND ${schema.kpis.date} <= ${end}`
        )
    ]);

    // Group KPIs by agent ID in memory
    const kpisByAgent = new Map<number, typeof allKPIs>();
    for (const kpi of allKPIs) {
      if (!kpisByAgent.has(kpi.agentId)) {
        kpisByAgent.set(kpi.agentId, []);
      }
      kpisByAgent.get(kpi.agentId)!.push(kpi);
    }

    // Calculate averages for each agent
    const agentPerformance = agents.map((agent) => {
      const kpis = kpisByAgent.get(agent.id) || [];
      
      if (kpis.length === 0) return null;

      const avgQuality = kpis.reduce((sum, k) => sum + (k.quality || 0), 0) / kpis.length;
      const avgAHT = kpis.reduce((sum, k) => sum + (k.aht || 0), 0) / kpis.length;
      const avgSRR = kpis.reduce((sum, k) => sum + (k.srr || 0), 0) / kpis.length;
      const avgVOC = kpis.reduce((sum, k) => sum + (k.voc || 0), 0) / kpis.length;

      return {
        name: agent.name,
        avgQuality,
        avgAHT,
        avgSRR,
        avgVOC,
      };
    }).filter((agent): agent is NonNullable<typeof agent> => agent !== null);

    // Sort agents by SRR to identify top performers and those needing support
    const validAgents = agentPerformance.filter((a) => a !== null);
    validAgents.sort((a, b) => (b?.avgSRR || 0) - (a?.avgSRR || 0));

    const topPerformers = validAgents.slice(0, 2);
    const needsSupport = validAgents.slice(-2).reverse();

    const agentSpotlight = `
Top Performers:
${topPerformers.map(a => `- ${a?.name}: Quality ${a?.avgQuality.toFixed(1)}%, SRR ${a?.avgSRR.toFixed(1)}%, VOC ${a?.avgVOC.toFixed(1)}%`).join("\n")}

Needs Support:
${needsSupport.map(a => `- ${a?.name}: Quality ${a?.avgQuality.toFixed(1)}%, AHT ${a?.avgAHT.toFixed(0)}s, SRR ${a?.avgSRR.toFixed(1)}%`).join("\n")}
    `.trim();

    // Get coaching activity
    const coachingSessions = await db
      .select()
      .from(schema.coachingSessions)
      .where(sql`${schema.coachingSessions.date} >= ${start} AND ${schema.coachingSessions.date} <= ${end}`);

    const coachingActivity = `
Sessions this week: ${coachingSessions.length}
- Scheduled: ${coachingSessions.filter(s => s.type === "scheduled").length}
- Urgent: ${coachingSessions.filter(s => s.type === "urgent").length}
- Follow-up: ${coachingSessions.filter(s => s.type === "follow-up").length}

Completed: ${coachingSessions.filter(s => s.status === "completed").length}
Pending: ${coachingSessions.filter(s => s.status === "scheduled").length}
    `.trim();

    // Get audit findings
    const audits = await db
      .select({
        audit: schema.audits,
        agent: schema.agents,
      })
      .from(schema.audits)
      .leftJoin(schema.agents, sql`${schema.audits.agentId} = ${schema.agents.id}`)
      .where(sql`${schema.audits.date} >= ${start} AND ${schema.audits.date} <= ${end}`)
      .orderBy(desc(schema.audits.date));

    const auditFindings = `
Audits completed: ${audits.length}
Average score: ${(audits.reduce((sum, a) => sum + (a.audit.score || 0), 0) / audits.length).toFixed(1)}%

Recent findings:
${audits.slice(0, 5).map(a => `- ${a.agent?.name}: ${a.audit.score}% | ${a.audit.strengths || 'N/A'}`).join("\n")}
    `.trim();

    // Get insights for risks and wins
    const insights = await db
      .select()
      .from(schema.insights)
      .where(sql`${schema.insights.createdAt} >= ${start}`)
      .orderBy(desc(schema.insights.priority));

    const risks = insights
      .filter((i) => i.type === "red-flag" || i.type === "watch-list")
      .map((i) => `- ${i.title}: ${i.description}`)
      .join("\n");

    const wins = insights
      .filter((i) => i.type === "win")
      .map((i) => `- ${i.title}: ${i.description}`)
      .join("\n");

    // Generate the report using AI
    const reportContent = await generateEnhancedWeeklyReport({
      startDate: start,
      endDate: end,
      teamKPIs: teamKPISummary,
      agentSpotlight,
      coachingActivity,
      auditFindings,
      risks: risks || "No significant risks identified",
      wins: wins || "Continue current momentum",
    });

    // Save report to database
    const savedReport = await db
      .insert(schema.reports)
      .values({
        type: "weekly",
        title: `Weekly Report: ${start} to ${end}`,
        startDate: start,
        endDate: end,
        content: reportContent,
        highlights: wins,
        risks,
        aiGenerated: 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      report: savedReport[0],
      content: reportContent,
    });
  } catch (error) {
    console.error("Error generating weekly report:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly report" },
      { status: 500 }
    );
  }
}

