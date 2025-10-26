import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, sql, or, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
  }

  try {
    // Fetch leave records within the date range
    const upcomingLeave = await db
      .select({
        id: schema.agentAttendance.id,
        agentId: schema.agentAttendance.agentId,
        date: schema.agentAttendance.date,
        status: schema.agentAttendance.status,
        notes: schema.agentAttendance.notes,
        agentName: schema.agents.name,
        agentAvatarUrl: schema.agents.avatarUrl,
      })
      .from(schema.agentAttendance)
      .leftJoin(schema.agents, eq(schema.agentAttendance.agentId, schema.agents.id))
      .where(
        and(
          sql`${schema.agentAttendance.date} >= ${start}`,
          sql`${schema.agentAttendance.date} <= ${end}`,
          or(
            eq(schema.agentAttendance.status, 'holiday'),
            eq(schema.agentAttendance.status, 'sick')
          )
        )
      )
      .orderBy(schema.agentAttendance.date);

    return NextResponse.json(upcomingLeave);
  } catch (error) {
    console.error("Error fetching upcoming leave:", error);
    return NextResponse.json({ error: "Failed to fetch upcoming leave" }, { status: 500 });
  }
}

