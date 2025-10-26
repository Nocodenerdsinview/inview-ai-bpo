import { db, schema } from "@/lib/db";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, getDaysInMonth, format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // YYYY-MM

    // Default to current month if not provided
    const targetDate = monthParam ? new Date(monthParam + "-01") : new Date();
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const daysInMonth = getDaysInMonth(targetDate);

    // Fetch all agents
    const agents = await db.select().from(schema.agents).orderBy(schema.agents.name);

    // Fetch leave records that overlap with the target month
    const leaveRecords = await db
      .select()
      .from(schema.leaveRecords)
      .where(
        or(
          // Leave that starts or ends in this month
          and(
            gte(schema.leaveRecords.startDate, format(monthStart, "yyyy-MM-dd")),
            lte(schema.leaveRecords.startDate, format(monthEnd, "yyyy-MM-dd"))
          ),
          and(
            gte(schema.leaveRecords.endDate, format(monthStart, "yyyy-MM-dd")),
            lte(schema.leaveRecords.endDate, format(monthEnd, "yyyy-MM-dd"))
          ),
          // Leave that spans the entire month
          and(
            lte(schema.leaveRecords.startDate, format(monthStart, "yyyy-MM-dd")),
            gte(schema.leaveRecords.endDate, format(monthEnd, "yyyy-MM-dd"))
          )
        )
      );

    // Group leave records by agent
    const agentsWithLeave = agents.map((agent) => {
      const agentLeave = leaveRecords
        .filter((leave) => leave.agentId === agent.id)
        .map((leave) => {
          const start = leave.startDate || leave.date;
          const end = leave.endDate || leave.date;
          const startDate = new Date(start);
          const endDate = new Date(end);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: leave.id,
            agentId: leave.agentId,
            startDate: start,
            endDate: end,
            type: leave.type,
            status: leave.status,
            reason: leave.reason,
            duration,
            requestedDate: leave.requestedDate,
            approvedBy: leave.approvedBy,
            approvedDate: leave.approvedDate,
            declinedReason: leave.declinedReason,
          };
        });

      return {
        id: agent.id,
        name: agent.name,
        avatarUrl: agent.avatarUrl,
        email: agent.email,
        leaveRecords: agentLeave,
      };
    });

    return NextResponse.json({
      agents: agentsWithLeave,
      month: format(targetDate, "yyyy-MM"),
      daysInMonth,
      monthStart: format(monthStart, "yyyy-MM-dd"),
      monthEnd: format(monthEnd, "yyyy-MM-dd"),
    });
  } catch (error) {
    console.error("Error fetching leave timeline data:", error);
    return NextResponse.json({ error: "Failed to fetch leave timeline data" }, { status: 500 });
  }
}

