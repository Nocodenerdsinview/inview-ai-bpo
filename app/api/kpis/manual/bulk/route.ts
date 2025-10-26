import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

interface KPIRecord {
  agentId: number;
  date: string;
  quality: number | null;
  aht: number | null;
  srr: number | null;
  voc: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body as { records: KPIRecord[] };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Records array is required" },
        { status: 400 }
      );
    }

    // Validate each record
    const errors: string[] = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      if (!record.agentId || !record.date) {
        errors.push(`Record ${i + 1}: Agent ID and date are required`);
      }

      if (
        record.quality === null &&
        record.aht === null &&
        record.srr === null &&
        record.voc === null
      ) {
        errors.push(`Record ${i + 1}: At least one KPI value is required`);
      }

      // Validate ranges
      if (record.quality !== null && (record.quality < 0 || record.quality > 100)) {
        errors.push(`Record ${i + 1}: Quality must be between 0 and 100`);
      }
      if (record.aht !== null && record.aht < 0) {
        errors.push(`Record ${i + 1}: AHT must be positive`);
      }
      if (record.srr !== null && (record.srr < 0 || record.srr > 100)) {
        errors.push(`Record ${i + 1}: SRR must be between 0 and 100`);
      }
      if (record.voc !== null && (record.voc < 0 || record.voc > 100)) {
        errors.push(`Record ${i + 1}: VOC must be between 0 and 100`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation errors", details: errors },
        { status: 400 }
      );
    }

    // Get all unique agent IDs to verify they exist
    const uniqueAgentIds = [...new Set(records.map((r) => r.agentId))];
    const agents = await db
      .select({ id: schema.agents.id })
      .from(schema.agents);

    const existingAgentIds = new Set(agents.map((a) => a.id).filter(id => uniqueAgentIds.includes(id)));
    const invalidAgentIds = uniqueAgentIds.filter((id) => !existingAgentIds.has(id));

    if (invalidAgentIds.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid agent IDs",
          details: `The following agent IDs do not exist: ${invalidAgentIds.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Process records in batches
    let created = 0;
    let updated = 0;

    for (const record of records) {
      try {
        // Check if record exists
        const existing = await db
          .select()
          .from(schema.kpis)
          .where(
            and(
              eq(schema.kpis.agentId, record.agentId),
              eq(schema.kpis.date, record.date)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing record
          await db
            .update(schema.kpis)
            .set({
              quality: record.quality ?? existing[0].quality,
              aht: record.aht ?? existing[0].aht,
              srr: record.srr ?? existing[0].srr,
              voc: record.voc ?? existing[0].voc,
            })
            .where(
              and(
                eq(schema.kpis.agentId, record.agentId),
                eq(schema.kpis.date, record.date)
              )
            );

          updated++;
        } else {
          // Insert new record
          await db.insert(schema.kpis).values({
            agentId: record.agentId,
            date: record.date,
            quality: record.quality,
            aht: record.aht,
            srr: record.srr,
            voc: record.voc,
          });

          created++;
        }
      } catch (recordError) {
        console.error(`Error processing record for agent ${record.agentId}:`, recordError);
        errors.push(
          `Failed to save record for agent ${record.agentId} on ${record.date}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${created + updated} KPI records`,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error saving bulk KPIs:", error);
    return NextResponse.json(
      { error: "Failed to save bulk KPIs" },
      { status: 500 }
    );
  }
}

