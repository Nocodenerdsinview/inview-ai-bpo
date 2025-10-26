import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { addDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get("daysAhead") || "7");
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), daysAhead), 'yyyy-MM-dd');

    // Get upcoming coaching sessions
    const coachings = await db
      .select({
        coaching: schema.coachingSessions,
        agent: schema.agents,
      })
      .from(schema.coachingSessions)
      .leftJoin(schema.agents, eq(schema.coachingSessions.agentId, schema.agents.id))
      .where(
        and(
          eq(schema.coachingSessions.status, 'scheduled'),
          gte(schema.coachingSessions.scheduledDate, today),
          lte(schema.coachingSessions.scheduledDate, endDate)
        )
      )
      .orderBy(schema.coachingSessions.scheduledDate)
      .all();

    // Format the response
    const formattedCoachings = coachings.map(({ coaching, agent }) => ({
      id: coaching.id,
      agentId: coaching.agentId,
      agentName: agent?.name || 'Unknown',
      scheduledDate: coaching.scheduledDate || coaching.date,
      type: coaching.type,
      focusAreas: coaching.focusAreas,
      status: coaching.status,
    }));

    return NextResponse.json(formattedCoachings);
  } catch (error) {
    console.error("Error fetching upcoming coachings:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming coachings" },
      { status: 500 }
    );
  }
}

