import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Calculate date ranges for current and previous periods
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - daysDiff);
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);

    // Get current period KPIs
    const currentPeriodKPIs = await db
      .select({
        quality: sql<number>`AVG(${schema.kpis.quality})`,
        aht: sql<number>`AVG(${schema.kpis.aht})`,
        srr: sql<number>`AVG(${schema.kpis.srr})`,
        voc: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(
        and(
          gte(schema.kpis.date, start.toISOString().split('T')[0]),
          lte(schema.kpis.date, end.toISOString().split('T')[0])
        )
      );

    // Get previous period KPIs for comparison
    const previousPeriodKPIs = await db
      .select({
        quality: sql<number>`AVG(${schema.kpis.quality})`,
        aht: sql<number>`AVG(${schema.kpis.aht})`,
        srr: sql<number>`AVG(${schema.kpis.srr})`,
        voc: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(
        and(
          gte(schema.kpis.date, previousStart.toISOString().split('T')[0]),
          lte(schema.kpis.date, previousEnd.toISOString().split('T')[0])
        )
      );

    const current = currentPeriodKPIs[0];
    const previous = previousPeriodKPIs[0];

    const calculateChange = (curr: number, prev: number) => {
      if (!prev) return 0;
      return ((curr - prev) / prev) * 100;
    };

    const getTrend = (change: number, isLowerBetter = false): "up" | "down" | "stable" => {
      if (Math.abs(change) < 1) return "stable";
      if (isLowerBetter) {
        return change < 0 ? "up" : "down";
      }
      return change > 0 ? "up" : "down";
    };

    const teamKPIs = {
      quality: {
        current: Math.round(current.quality || 0),
        change: calculateChange(current.quality || 0, previous.quality || 0),
        trend: getTrend(calculateChange(current.quality || 0, previous.quality || 0)),
      },
      aht: {
        current: Math.round(current.aht || 0),
        change: calculateChange(current.aht || 0, previous.aht || 0),
        trend: getTrend(calculateChange(current.aht || 0, previous.aht || 0), true),
      },
      srr: {
        current: Math.round(current.srr || 0),
        change: calculateChange(current.srr || 0, previous.srr || 0),
        trend: getTrend(calculateChange(current.srr || 0, previous.srr || 0)),
      },
      voc: {
        current: Math.round(current.voc || 0),
        change: calculateChange(current.voc || 0, previous.voc || 0),
        trend: getTrend(calculateChange(current.voc || 0, previous.voc || 0)),
      },
    };

    // Get all agents
    const agents = await db.select().from(schema.agents).orderBy(schema.agents.name);

    // Get latest KPIs for each agent within the date range
    const agentsWithData = await Promise.all(
      agents.map(async (agent) => {
        const latestKPIs = await db
          .select()
          .from(schema.kpis)
          .where(
            and(
              eq(schema.kpis.agentId, agent.id),
              gte(schema.kpis.date, start.toISOString().split('T')[0]),
              lte(schema.kpis.date, end.toISOString().split('T')[0])
            )
          )
          .orderBy(desc(schema.kpis.date))
          .limit(1);

        const latestAudit = await db
          .select()
          .from(schema.audits)
          .where(
            and(
              eq(schema.audits.agentId, agent.id),
              gte(schema.audits.date, start.toISOString().split('T')[0]),
              lte(schema.audits.date, end.toISOString().split('T')[0])
            )
          )
          .orderBy(desc(schema.audits.date))
          .limit(1);

        const nextCoaching = await db
          .select()
          .from(schema.coachingSessions)
          .where(
            and(
              eq(schema.coachingSessions.agentId, agent.id),
              eq(schema.coachingSessions.status, "scheduled")
            )
          )
          .orderBy(schema.coachingSessions.date)
          .limit(1);

        // Determine attention flag
        let needsAttention = false;
        let attentionReason = "";

        if (latestKPIs[0]) {
          const kpi = latestKPIs[0];
          if (kpi.aht && kpi.aht > 600) {
            needsAttention = true;
            attentionReason = "High AHT";
          } else if (kpi.quality && kpi.quality < 85) {
            needsAttention = true;
            attentionReason = "Low Quality";
          } else if (kpi.srr && kpi.srr < 70) {
            needsAttention = true;
            attentionReason = "Low SRR";
          }
        }

        // Check for overdue audit
        if (!latestAudit[0]) {
          const daysSinceLastAudit = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastAudit > 14) {
            needsAttention = true;
            attentionReason = attentionReason ? `${attentionReason}, Overdue Audit` : "Overdue Audit";
          }
        }

        return {
          ...agent,
          latestKPIs: latestKPIs[0] || null,
          latestAudit: latestAudit[0] || null,
          nextCoaching: nextCoaching[0] || null,
          needsAttention,
          attentionReason,
        };
      })
    );

    // Get recent insights within date range
    const insights = await db
      .select()
      .from(schema.insights)
      .where(
        and(
          gte(schema.insights.createdAt, start.toISOString()),
          lte(schema.insights.createdAt, end.toISOString())
        )
      )
      .orderBy(desc(schema.insights.createdAt))
      .limit(5);

    return NextResponse.json({
      teamKPIs,
      agents: agentsWithData,
      insights,
      dateRange: {
        start: startDate,
        end: endDate,
        daysDiff,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

