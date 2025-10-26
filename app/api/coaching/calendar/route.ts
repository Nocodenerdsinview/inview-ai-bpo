import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, gte, lte, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month"); // Format: YYYY-MM
    const agentId = searchParams.get("agentId");

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required (format: YYYY-MM)" },
        { status: 400 }
      );
    }

    // Calculate start and end dates for the month
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Build query conditions
    const conditions = [
      gte(schema.coachingSessions.scheduledDate, startDateStr),
      lte(schema.coachingSessions.scheduledDate, endDateStr + "T23:59:59"),
    ];

    if (agentId) {
      conditions.push(eq(schema.coachingSessions.agentId, parseInt(agentId)));
    }

    // Fetch coaching sessions with agent details
    const sessions = await db
      .select({
        session: schema.coachingSessions,
        agent: schema.agents,
      })
      .from(schema.coachingSessions)
      .leftJoin(schema.agents, eq(schema.coachingSessions.agentId, schema.agents.id))
      .where(and(...conditions))
      .all();

    // Transform sessions for calendar display
    const calendarSessions = sessions.map(({ session, agent }) => {
      const scheduledDateTime = session.scheduledDate || session.date;
      const [datePart, timePart] = scheduledDateTime.includes("T")
        ? scheduledDateTime.split("T")
        : [scheduledDateTime, "09:00:00"];

      return {
        id: session.id,
        agentId: session.agentId,
        agentName: agent?.name || "Unknown Agent",
        agentAvatar: agent?.avatarUrl || null,
        date: datePart,
        time: timePart.substring(0, 5), // HH:MM
        duration: 60, // Default 60 minutes
        type: session.type,
        status: session.status,
        focusAreas: session.focusAreas ? JSON.parse(session.focusAreas) : [],
        aiGenerated: session.aiGenerated === 1,
      };
    });

    return NextResponse.json({
      sessions: calendarSessions,
      month,
      totalSessions: calendarSessions.length,
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}

