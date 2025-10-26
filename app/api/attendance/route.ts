import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentAttendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET: Fetch attendance for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const attendance = await db
      .select()
      .from(agentAttendance)
      .where(eq(agentAttendance.date, date))
      .all();

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST: Update attendance for agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, date, status, notes } = body;

    if (!agentId || !date || !status) {
      return NextResponse.json(
        { error: "agentId, date, and status are required" },
        { status: 400 }
      );
    }

    // Check if attendance record already exists
    const existing = await db
      .select()
      .from(agentAttendance)
      .where(
        and(
          eq(agentAttendance.agentId, agentId),
          eq(agentAttendance.date, date)
        )
      )
      .get();

    if (existing) {
      // Update existing record
      const updated = await db
        .update(agentAttendance)
        .set({
          status,
          notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(agentAttendance.id, existing.id))
        .returning()
        .get();

      return NextResponse.json(updated);
    } else {
      // Insert new record
      const inserted = await db
        .insert(agentAttendance)
        .values({
          agentId,
          date,
          status,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning()
        .get();

      return NextResponse.json(inserted);
    }
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// PUT: Bulk update attendance
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { agentId, date, status, notes }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "updates array is required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const update of updates) {
      const { agentId, date, status, notes } = update;

      if (!agentId || !date || !status) {
        continue; // Skip invalid entries
      }

      // Check if attendance record already exists
      const existing = await db
        .select()
        .from(agentAttendance)
        .where(
          and(
            eq(agentAttendance.agentId, agentId),
            eq(agentAttendance.date, date)
          )
        )
        .get();

      if (existing) {
        // Update existing record
        const updated = await db
          .update(agentAttendance)
          .set({
            status,
            notes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(agentAttendance.id, existing.id))
          .returning()
          .get();

        results.push(updated);
      } else {
        // Insert new record
        const inserted = await db
          .insert(agentAttendance)
          .values({
            agentId,
            date,
            status,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning()
          .get();

        results.push(inserted);
      }
    }

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Error bulk updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to bulk update attendance" },
      { status: 500 }
    );
  }
}

