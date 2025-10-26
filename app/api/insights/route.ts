import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const resolved = url.searchParams.get("resolved");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : subDays(end, 30);

    const conditions = [];

    if (resolved !== null) {
      conditions.push(eq(schema.insights.resolved, resolved === "true" ? 1 : 0));
    }

    // Filter by date range
    conditions.push(sql`${schema.insights.createdAt} >= ${format(start, 'yyyy-MM-dd')}`);
    conditions.push(sql`${schema.insights.createdAt} <= ${format(end, 'yyyy-MM-dd')} 23:59:59`);

    const insights = await db
      .select()
      .from(schema.insights)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.insights.createdAt))
      .limit(100);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

