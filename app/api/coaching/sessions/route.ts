import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : subDays(end, 30);

    const sessions = await db
      .select({
        session: schema.coachingSessions,
        agent: schema.agents,
      })
      .from(schema.coachingSessions)
      .leftJoin(schema.agents, eq(schema.coachingSessions.agentId, schema.agents.id))
      .where(
        and(
          sql`${schema.coachingSessions.scheduledDate} >= ${format(start, 'yyyy-MM-dd')}`,
          sql`${schema.coachingSessions.scheduledDate} <= ${format(end, 'yyyy-MM-dd')}`
        )
      )
      .orderBy(desc(schema.coachingSessions.scheduledDate));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching coaching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaching sessions" },
      { status: 500 }
    );
  }
}

