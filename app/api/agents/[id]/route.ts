import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { name, email, role, avatarUrl } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Check if agent exists
    const existingAgent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);

    if (existingAgent.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Update agent profile
    await db
      .update(schema.agents)
      .set({
        name,
        email,
        role,
        avatarUrl: avatarUrl || null,
      })
      .where(eq(schema.agents.id, agentId));

    // Fetch updated agent
    const updatedAgent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);

    return NextResponse.json({
      success: true,
      agent: updatedAgent[0],
    });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent profile" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to last 90 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : subDays(end, 90);

    // Get agent
    const agent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get KPIs within date range
    const kpis = await db
      .select()
      .from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, agentId),
          sql`${schema.kpis.date} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.kpis.date} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(schema.kpis.date);

    // Get audits within date range
    const audits = await db
      .select()
      .from(schema.audits)
      .where(
        and(
          eq(schema.audits.agentId, agentId),
          sql`${schema.audits.date} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.audits.date} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(desc(schema.audits.date));

    // Get coaching sessions within date range
    const coachingSessions = await db
      .select()
      .from(schema.coachingSessions)
      .where(
        and(
          eq(schema.coachingSessions.agentId, agentId),
          sql`${schema.coachingSessions.scheduledDate} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.coachingSessions.scheduledDate} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(desc(schema.coachingSessions.scheduledDate));

    // Get leave records within date range
    const leaveRecords = await db
      .select()
      .from(schema.leaveRecords)
      .where(
        and(
          eq(schema.leaveRecords.agentId, agentId),
          sql`${schema.leaveRecords.date} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.leaveRecords.date} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(desc(schema.leaveRecords.date));

    // Get attendance records within date range
    const attendanceRecords = await db
      .select()
      .from(schema.agentAttendance)
      .where(
        and(
          eq(schema.agentAttendance.agentId, agentId),
          sql`${schema.agentAttendance.date} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.agentAttendance.date} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(desc(schema.agentAttendance.date));

    // Calculate stats
    const avgQuality = kpis.length > 0
      ? kpis.reduce((sum, kpi) => sum + (kpi.quality || 0), 0) / kpis.length
      : 0;
    const avgAHT = kpis.length > 0
      ? kpis.reduce((sum, kpi) => sum + (kpi.aht || 0), 0) / kpis.length
      : 0;
    const avgSRR = kpis.length > 0
      ? kpis.reduce((sum, kpi) => sum + (kpi.srr || 0), 0) / kpis.length
      : 0;
    const avgVOC = kpis.length > 0
      ? kpis.reduce((sum, kpi) => sum + (kpi.voc || 0), 0) / kpis.length
      : 0;

    // Calculate attendance stats
    const activeDays = attendanceRecords.filter(a => a.status === 'active').length;
    const sickDays = attendanceRecords.filter(a => a.status === 'sick').length;
    const holidayDays = attendanceRecords.filter(a => a.status === 'holiday').length;

    return NextResponse.json({
      agent: agent[0],
      kpis,
      audits,
      coachingSessions,
      leaveRecords,
      attendanceRecords,
      stats: {
        avgQuality,
        avgAHT,
        avgSRR,
        avgVOC,
        totalAudits: audits.length,
        totalCoaching: coachingSessions.length,
        totalDays: attendanceRecords.length,
        activeDays,
        sickDays,
        holidayDays,
      },
    });
  } catch (error) {
    console.error("Error fetching agent data:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent data" },
      { status: 500 }
    );
  }
}
