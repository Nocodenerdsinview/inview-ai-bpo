import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { eachDayOfInterval, format } from "date-fns";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();

    // Fetch existing leave record
    const [existingLeave] = await db
      .select()
      .from(schema.leaveRecords)
      .where(eq(schema.leaveRecords.id, id));

    if (!existingLeave) {
      return NextResponse.json({ error: "Leave record not found" }, { status: 404 });
    }

    const previousStatus = existingLeave.status;
    const newStatus = body.status || previousStatus;

    // Update leave record
    const updateData: any = {
      ...body,
      approved: newStatus === "approved" ? 1 : 0,
    };

    if (newStatus === "approved" && previousStatus !== "approved") {
      updateData.approvedDate = format(new Date(), "yyyy-MM-dd");
      updateData.approvedBy = body.approvedBy || "Manager";
    }

    const [updatedLeave] = await db
      .update(schema.leaveRecords)
      .set(updateData)
      .where(eq(schema.leaveRecords.id, id))
      .returning();

    // Sync with attendance based on status change
    if (newStatus === "approved" && previousStatus !== "approved") {
      // Newly approved - sync to attendance
      const startDate = updatedLeave.startDate || updatedLeave.date;
      const endDate = updatedLeave.endDate || updatedLeave.date;
      await syncLeaveToAttendance(updatedLeave.agentId, startDate, endDate, updatedLeave.type);
    } else if (newStatus === "declined" && previousStatus === "approved") {
      // Declined - remove from attendance
      const startDate = existingLeave.startDate || existingLeave.date;
      const endDate = existingLeave.endDate || existingLeave.date;
      await removeLeaveFromAttendance(existingLeave.agentId, startDate, endDate);
    }

    return NextResponse.json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.error("Error updating leave record:", error);
    return NextResponse.json({ error: "Failed to update leave record" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // Fetch existing leave record
    const [existingLeave] = await db
      .select()
      .from(schema.leaveRecords)
      .where(eq(schema.leaveRecords.id, id));

    if (!existingLeave) {
      return NextResponse.json({ error: "Leave record not found" }, { status: 404 });
    }

    // Remove from attendance if it was approved
    if (existingLeave.status === "approved") {
      const startDate = existingLeave.startDate || existingLeave.date;
      const endDate = existingLeave.endDate || existingLeave.date;
      await removeLeaveFromAttendance(existingLeave.agentId, startDate, endDate);
    }

    // Delete leave record
    await db.delete(schema.leaveRecords).where(eq(schema.leaveRecords.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting leave record:", error);
    return NextResponse.json({ error: "Failed to delete leave record" }, { status: 500 });
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

// Helper function to remove leave from attendance
async function removeLeaveFromAttendance(agentId: number, startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = eachDayOfInterval({ start, end });

    // Delete attendance records for each day
    for (const day of days) {
      const dateStr = format(day, "yyyy-MM-dd");

      await db
        .delete(schema.agentAttendance)
        .where(
          and(
            eq(schema.agentAttendance.agentId, agentId),
            eq(schema.agentAttendance.date, dateStr)
          )
        );
    }
  } catch (error) {
    console.error("Error removing leave from attendance:", error);
    throw error;
  }
}

