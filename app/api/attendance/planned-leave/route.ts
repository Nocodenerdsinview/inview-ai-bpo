import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, sql, or, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch all leave records (holiday or sick) from today onwards
    const plannedLeave = await db
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
          sql`${schema.agentAttendance.date} >= ${today}`,
          or(
            eq(schema.agentAttendance.status, 'holiday'),
            eq(schema.agentAttendance.status, 'sick')
          )
        )
      )
      .orderBy(schema.agentAttendance.date);

    return NextResponse.json(plannedLeave);
  } catch (error) {
    console.error("Error fetching planned leave:", error);
    return NextResponse.json({ error: "Failed to fetch planned leave" }, { status: 500 });
  }
}

