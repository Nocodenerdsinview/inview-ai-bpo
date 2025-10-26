import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, date, quality, aht, srr, voc } = body;

    // Validate required fields
    if (!agentId || !date) {
      return NextResponse.json(
        { error: "Agent ID and date are required" },
        { status: 400 }
      );
    }

    // Validate at least one KPI is provided
    if (quality === null && aht === null && srr === null && voc === null) {
      return NextResponse.json(
        { error: "At least one KPI value is required" },
        { status: 400 }
      );
    }

    // Validate agent exists
    const agent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if record already exists
    const existing = await db
      .select()
      .from(schema.kpis)
      .where(and(eq(schema.kpis.agentId, agentId), eq(schema.kpis.date, date)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(schema.kpis)
        .set({
          quality: quality ?? existing[0].quality,
          aht: aht ?? existing[0].aht,
          srr: srr ?? existing[0].srr,
          voc: voc ?? existing[0].voc,
        })
        .where(and(eq(schema.kpis.agentId, agentId), eq(schema.kpis.date, date)));
    } else {
      // Insert new record
      await db.insert(schema.kpis).values({
        agentId,
        date,
        quality: quality ?? null,
        aht: aht ?? null,
        srr: srr ?? null,
        voc: voc ?? null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "KPI saved successfully",
      agentId,
      date,
    });
  } catch (error) {
    console.error("Error saving manual KPI:", error);
    return NextResponse.json(
      { error: "Failed to save KPI" },
      { status: 500 }
    );
  }
}

