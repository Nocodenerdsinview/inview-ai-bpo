import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, lt, or, isNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get audits without coaching status or with scores < 80
    const uncoachedAudits = await db
      .select({
        audit: schema.audits,
        agent: schema.agents,
      })
      .from(schema.audits)
      .leftJoin(schema.agents, eq(schema.audits.agentId, schema.agents.id))
      .where(
        and(
          or(
            isNull(schema.audits.coachingStatus),
            eq(schema.audits.coachingStatus, '')
          ),
          lt(schema.audits.score, 80)
        )
      )
      .orderBy(desc(schema.audits.date))
      .limit(limit)
      .all();

    // Format the response
    const formattedAudits = uncoachedAudits.map(({ audit, agent }) => ({
      id: audit.id,
      agentId: audit.agentId,
      agentName: agent?.name || 'Unknown',
      date: audit.date,
      score: audit.score || 0,
      notes: audit.notes,
    }));

    return NextResponse.json(formattedAudits);
  } catch (error) {
    console.error("Error fetching uncoached audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch uncoached audits" },
      { status: 500 }
    );
  }
}

