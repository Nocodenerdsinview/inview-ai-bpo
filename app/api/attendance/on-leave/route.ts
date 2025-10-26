import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || format(new Date(), 'yyyy-MM-dd');

    // Get agents on leave (holiday or sick) for the specified date
    const agentsOnLeave = await db
      .select({
        attendance: schema.agentAttendance,
        agent: schema.agents,
      })
      .from(schema.agentAttendance)
      .leftJoin(schema.agents, eq(schema.agentAttendance.agentId, schema.agents.id))
      .where(
        and(
          eq(schema.agentAttendance.date, date),
          sql`${schema.agentAttendance.status} != 'active'`
        )
      )
      .all();

    // Format the response
    const formattedAgents = agentsOnLeave.map(({ attendance, agent }) => ({
      id: agent?.id || 0,
      name: agent?.name || 'Unknown',
      avatarUrl: agent?.avatarUrl,
      status: attendance.status as 'holiday' | 'sick',
      date: attendance.date,
      notes: attendance.notes,
      leaveEnd: attendance.leaveEnd,
    }));

    return NextResponse.json(formattedAgents);
  } catch (error) {
    console.error("Error fetching agents on leave:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents on leave" },
      { status: 500 }
    );
  }
}

