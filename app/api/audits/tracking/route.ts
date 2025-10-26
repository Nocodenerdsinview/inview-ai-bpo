import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { differenceInDays, format, startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // If date params provided, use them, otherwise use default ranges
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30);
    
    const today = format(endDate, "yyyy-MM-dd");
    const weekStart = format(startOfWeek(endDate), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(endDate), "yyyy-MM-dd");
    const filterStart = format(startDate, "yyyy-MM-dd");

    // Goals
    const dailyGoal = 4;
    const monthlyGoal = 80; // 4 audits/day * 20 working days

    // Get all agents
    const agents = await db.select().from(schema.agents).where(eq(schema.agents.status, "active"));

    // Get today's audits
    const todayAudits = await db
      .select()
      .from(schema.audits)
      .where(sql`${schema.audits.date} = ${today}`);

    // Get this week's audits
    const weekAudits = await db
      .select()
      .from(schema.audits)
      .where(sql`${schema.audits.date} >= ${weekStart}`);

    // Get this month's audits
    const monthAudits = await db
      .select()
      .from(schema.audits)
      .where(sql`${schema.audits.date} >= ${monthStart}`);

    // Check for overdue audits (14+ days since last audit)
    const overdueAgents = await Promise.all(
      agents.map(async (agent) => {
        const lastAudit = await db
          .select()
          .from(schema.audits)
          .where(eq(schema.audits.agentId, agent.id))
          .orderBy(desc(schema.audits.date))
          .limit(1);

        if (lastAudit.length === 0) {
          return {
            agentId: agent.id,
            agentName: agent.name,
            lastAuditDate: null,
            daysOverdue: null,
            kpiStatus: null,
          };
        }

        const daysSince = differenceInDays(new Date(), new Date(lastAudit[0].date));

        if (daysSince >= 14) {
          // Get latest KPI to determine status
          const latestKPI = await db
            .select()
            .from(schema.kpis)
            .where(eq(schema.kpis.agentId, agent.id))
            .orderBy(desc(schema.kpis.date))
            .limit(1);

          let kpiStatus = null;
          if (latestKPI[0]) {
            const kpi = latestKPI[0];
            if ((kpi.quality || 0) < 85 || (kpi.aht || 0) > 600) {
              kpiStatus = "Yellow/Red KPI";
            }
          }

          return {
            agentId: agent.id,
            agentName: agent.name,
            lastAuditDate: lastAudit[0].date,
            daysOverdue: daysSince,
            kpiStatus,
          };
        }

        return null;
      })
    );

    const overdue = overdueAgents.filter((a) => a !== null);

    // Get audit distribution by agent this month
    const distribution = await Promise.all(
      agents.map(async (agent) => {
        const agentAudits = monthAudits.filter((a) => a.agentId === agent.id);
        return {
          agentId: agent.id,
          agentName: agent.name,
          count: agentAudits.length,
        };
      })
    );

    // AI-suggested next audits
    const suggested = await Promise.all(
      agents.map(async (agent) => {
        const lastAudit = await db
          .select()
          .from(schema.audits)
          .where(eq(schema.audits.agentId, agent.id))
          .orderBy(desc(schema.audits.date))
          .limit(1);

        const latestKPI = await db
          .select()
          .from(schema.kpis)
          .where(eq(schema.kpis.agentId, agent.id))
          .orderBy(desc(schema.kpis.date))
          .limit(1);

        const agentAuditsThisMonth = monthAudits.filter((a) => a.agentId === agent.id);

        let priority = 0;
        let reason = "";

        // Priority 1: Overdue (14+ days)
        if (lastAudit.length === 0 || differenceInDays(new Date(), new Date(lastAudit[0].date)) >= 14) {
          priority = 10;
          reason = "Overdue for audit (14+ days)";
        }
        // Priority 2: Yellow/Red KPI status
        else if (latestKPI[0]) {
          const kpi = latestKPI[0];
          if ((kpi.quality || 0) < 85 || (kpi.aht || 0) > 600) {
            priority = 9;
            reason = "Yellow/Red KPI status - needs verification";
          }
        }
        // Priority 3: Below monthly target
        if (agentAuditsThisMonth.length < 2) {
          priority = Math.max(priority, 5);
          if (!reason) reason = "Below monthly audit target";
        }

        return priority > 0
          ? {
              agentId: agent.id,
              agentName: agent.name,
              priority,
              reason,
            }
          : null;
      })
    );

    const suggestedFiltered = suggested
      .filter((s) => s !== null)
      .sort((a, b) => b!.priority - a!.priority)
      .slice(0, 5);

    return NextResponse.json({
      dailyGoal,
      monthlyGoal,
      todayCompleted: todayAudits.length,
      weekCompleted: weekAudits.length,
      monthCompleted: monthAudits.length,
      overdue,
      distribution: distribution.sort((a, b) => a.count - b.count),
      suggested: suggestedFiltered,
    });
  } catch (error) {
    console.error("Error fetching audit tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit tracking data" },
      { status: 500 }
    );
  }
}

