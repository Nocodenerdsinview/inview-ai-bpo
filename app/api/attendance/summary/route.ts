import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentAttendance, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Get current day summary (active, sick, holiday counts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Get all agents
    const allAgents = await db.select().from(agents).all();
    const totalAgents = allAgents.length;

    // Get attendance for specified date
    const todayAttendance = await db
      .select()
      .from(agentAttendance)
      .where(eq(agentAttendance.date, date))
      .all();

    // Count by status (default to "active" if no record for the day)
    const statusCounts = todayAttendance.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { active: 0, sick: 0, holiday: 0 } as Record<string, number>
    );

    // Agents without attendance records default to active
    const recordedAgents = new Set(todayAttendance.map(r => r.agentId));
    const unrecordedCount = totalAgents - recordedAgents.size;
    statusCounts.active += unrecordedCount;

    // Check if attendance has been updated for today (all agents have records)
    const today = new Date().toISOString().split("T")[0];
    const isUpdatedToday = (date === today && recordedAgents.size === totalAgents);
    const lastUpdated = isUpdatedToday ? today : null;

    return NextResponse.json({
      date,
      totalAgents,
      activeCount: statusCounts.active || 0,
      sickCount: statusCounts.sick || 0,
      holidayCount: statusCounts.holiday || 0,
      lastUpdated,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance summary" },
      { status: 500 }
    );
  }
}

