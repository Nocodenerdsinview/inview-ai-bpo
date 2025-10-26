import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : subDays(end, 30);

    // Calculate comparison period (same duration, immediately before)
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const comparisonEnd = subDays(start, 1);
    const comparisonStart = subDays(comparisonEnd, duration);

    // Get current period average
    const currentWeekQuery = await db
      .select({
        quality: sql<number>`AVG(${schema.kpis.quality})`,
        aht: sql<number>`AVG(${schema.kpis.aht})`,
        srr: sql<number>`AVG(${schema.kpis.srr})`,
        voc: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(sql`${schema.kpis.date} >= ${format(start, 'yyyy-MM-dd')} AND ${schema.kpis.date} <= ${format(end, 'yyyy-MM-dd')}`);

    // Get previous period average (for comparison)
    const previousWeekQuery = await db
      .select({
        quality: sql<number>`AVG(${schema.kpis.quality})`,
        aht: sql<number>`AVG(${schema.kpis.aht})`,
        srr: sql<number>`AVG(${schema.kpis.srr})`,
        voc: sql<number>`AVG(${schema.kpis.voc})`,
      })
      .from(schema.kpis)
      .where(sql`${schema.kpis.date} >= ${format(comparisonStart, 'yyyy-MM-dd')} AND ${schema.kpis.date} <= ${format(comparisonEnd, 'yyyy-MM-dd')}`);

    const current = currentWeekQuery[0];
    const previous = previousWeekQuery[0];

    const calculateChange = (curr: number, prev: number) => {
      if (!prev) return 0;
      return ((curr - prev) / prev) * 100;
    };

    const getTrend = (change: number, isLowerBetter = false): "up" | "down" | "stable" => {
      if (Math.abs(change) < 1) return "stable";
      if (isLowerBetter) {
        return change < 0 ? "up" : "down";
      }
      return change > 0 ? "up" : "down";
    };

    const summary = {
      quality: {
        current: Math.round(current.quality || 0),
        change: calculateChange(current.quality || 0, previous.quality || 0),
        trend: getTrend(calculateChange(current.quality || 0, previous.quality || 0)),
      },
      aht: {
        current: Math.round(current.aht || 0),
        change: calculateChange(current.aht || 0, previous.aht || 0),
        trend: getTrend(calculateChange(current.aht || 0, previous.aht || 0), true), // Lower is better
      },
      srr: {
        current: Math.round(current.srr || 0),
        change: calculateChange(current.srr || 0, previous.srr || 0),
        trend: getTrend(calculateChange(current.srr || 0, previous.srr || 0)),
      },
      voc: {
        current: Math.round(current.voc || 0),
        change: calculateChange(current.voc || 0, previous.voc || 0),
        trend: getTrend(calculateChange(current.voc || 0, previous.voc || 0)),
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching KPI summary:", error);
    return NextResponse.json({ error: "Failed to fetch KPI summary" }, { status: 500 });
  }
}

