import { db, schema } from "@/lib/db";
import { eq, and, or, lte, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { eachDayOfInterval, format } from "date-fns";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, startDate, endDate, type, reason, status = "approved" } = body;

    // Validation
    if (!agentId || !startDate || !endDate || !type) {
      return NextResponse.json(
        { error: "Missing required fields: agentId, startDate, endDate, type" },
        { status: 400 }
      );
    }

    // Check for conflicts (existing leave in this date range)
    const conflicts = await db
      .select()
      .from(schema.leaveRecords)
      .where(
        and(
          eq(schema.leaveRecords.agentId, agentId),
          or(
            // New leave starts during existing leave
            and(
              lte(schema.leaveRecords.startDate, startDate),
              gte(schema.leaveRecords.endDate, startDate)
            ),
            // New leave ends during existing leave
            and(
              lte(schema.leaveRecords.startDate, endDate),
              gte(schema.leaveRecords.endDate, endDate)
            ),
            // New leave completely encompasses existing leave
            and(
              gte(schema.leaveRecords.startDate, startDate),
              lte(schema.leaveRecords.endDate, endDate)
            )
          )
        )
      );

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Leave conflict detected",
          conflicts: conflicts.map((c) => ({
            id: c.id,
            type: c.type,
            startDate: c.startDate,
            endDate: c.endDate,
          })),
        },
        { status: 409 }
      );
    }

    // Create leave record
    const [newLeave] = await db
      .insert(schema.leaveRecords)
      .values({
        agentId,
        date: startDate, // Use startDate as the date for backward compatibility
        startDate,
        endDate,
        type,
        reason: reason || null,
        status,
        requestedDate: format(new Date(), "yyyy-MM-dd"),
        approved: status === "approved" ? 1 : 0,
      })
      .returning();

    // If approved, sync with attendance
    if (status === "approved") {
      await syncLeaveToAttendance(agentId, startDate, endDate, type);
    }

    return NextResponse.json({ success: true, leave: newLeave }, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

// Helper function to sync leave with attendance
async function syncLeaveToAttendance(agentId: number, startDate: string, endDate: string, leaveType: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = eachDayOfInterval({ start, end });

    // Map leave type to attendance status
    const attendanceStatus = leaveType === "sick" ? "sick" : "holiday";

    // Create or update attendance records for each day
    for (const day of days) {
      const dateStr = format(day, "yyyy-MM-dd");

      // Check if attendance record exists
      const existing = await db
        .select()
        .from(schema.agentAttendance)
        .where(
          and(
            eq(schema.agentAttendance.agentId, agentId),
            eq(schema.agentAttendance.date, dateStr)
          )
        );

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(schema.agentAttendance)
          .set({
            status: attendanceStatus,
            leaveStart: startDate,
            leaveEnd: endDate,
            updatedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          })
          .where(eq(schema.agentAttendance.id, existing[0].id));
      } else {
        // Create new record
        await db.insert(schema.agentAttendance).values({
          agentId,
          date: dateStr,
          status: attendanceStatus,
          leaveStart: startDate,
          leaveEnd: endDate,
        });
      }
    }
  } catch (error) {
    console.error("Error syncing leave to attendance:", error);
    throw error;
  }
}

