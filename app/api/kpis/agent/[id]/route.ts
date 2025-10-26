import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);
    const url = new URL(request.url);
    
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const days = parseInt(url.searchParams.get("days") || "30");

    let kpis;
    
    if (startDate && endDate) {
      // Use specific date range
      kpis = await db
        .select()
        .from(schema.kpis)
        .where(
          and(
            eq(schema.kpis.agentId, agentId),
            sql`${schema.kpis.date} >= ${startDate}`,
            sql`${schema.kpis.date} <= ${endDate}`
          )
        )
        .orderBy(desc(schema.kpis.date));
    } else {
      // Use days limit (backwards compatibility)
      const end = new Date();
      const start = subDays(end, days);
      
      kpis = await db
        .select()
        .from(schema.kpis)
        .where(
          and(
            eq(schema.kpis.agentId, agentId),
            sql`${schema.kpis.date} >= ${format(start, 'yyyy-MM-dd')}`,
            sql`${schema.kpis.date} <= ${format(end, 'yyyy-MM-dd')}`
          )
        )
        .orderBy(desc(schema.kpis.date));
    }

    return NextResponse.json(kpis.reverse());
  } catch (error) {
    console.error("Error fetching agent KPIs:", error);
    return NextResponse.json({ error: "Failed to fetch agent KPIs" }, { status: 500 });
  }
}

