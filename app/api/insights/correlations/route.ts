import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { analyzeCorrelations } from "@/lib/groq";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisType = (searchParams.get("type") || "all") as
      | "aht-srr"
      | "quality-voc"
      | "coaching-impact"
      | "leave-impact"
      | "all";

    // Get all KPI data for correlation analysis
    const kpiData = await db
      .select({
        agentId: schema.kpis.agentId,
        date: schema.kpis.date,
        quality: schema.kpis.quality,
        aht: schema.kpis.aht,
        srr: schema.kpis.srr,
        voc: schema.kpis.voc,
      })
      .from(schema.kpis)
      .where(sql`${schema.kpis.date} >= date('now', '-90 days')`)
      .orderBy(schema.kpis.date);

    // Format KPI data for AI analysis
    const kpiDataFormatted = kpiData
      .map(
        (k) =>
          `Agent ${k.agentId}, ${k.date}: Q=${k.quality}%, AHT=${k.aht}s, SRR=${k.srr}%, VOC=${k.voc}%`
      )
      .join("\n");

    // Calculate basic statistics for context
    const stats = {
      avgQuality: kpiData.reduce((sum, k) => sum + (k.quality || 0), 0) / kpiData.length,
      avgAHT: kpiData.reduce((sum, k) => sum + (k.aht || 0), 0) / kpiData.length,
      avgSRR: kpiData.reduce((sum, k) => sum + (k.srr || 0), 0) / kpiData.length,
      avgVOC: kpiData.reduce((sum, k) => sum + (k.voc || 0), 0) / kpiData.length,
    };

    // Group data for sweet spot analysis
    const ahtRanges = {
      low: kpiData.filter((k) => k.aht && k.aht < 450),
      medium: kpiData.filter((k) => k.aht && k.aht >= 450 && k.aht <= 500),
      high: kpiData.filter((k) => k.aht && k.aht > 500),
    };

    const sweetSpotData = `
AHT < 450s: Avg SRR ${(
      ahtRanges.low.reduce((sum, k) => sum + (k.srr || 0), 0) / ahtRanges.low.length || 0
    ).toFixed(1)}%
AHT 450-500s: Avg SRR ${(
      ahtRanges.medium.reduce((sum, k) => sum + (k.srr || 0), 0) /
        ahtRanges.medium.length || 0
    ).toFixed(1)}%
AHT > 500s: Avg SRR ${(
      ahtRanges.high.reduce((sum, k) => sum + (k.srr || 0), 0) / ahtRanges.high.length || 0
    ).toFixed(1)}%
    `.trim();

    const fullData = `
${kpiDataFormatted}

Overall Statistics:
- Avg Quality: ${stats.avgQuality.toFixed(1)}%
- Avg AHT: ${stats.avgAHT.toFixed(0)}s
- Avg SRR: ${stats.avgSRR.toFixed(1)}%
- Avg VOC: ${stats.avgVOC.toFixed(1)}%

Sweet Spot Analysis:
${sweetSpotData}
    `.trim();

    // Generate AI correlation analysis
    const analysis = await analyzeCorrelations({
      kpiData: fullData,
      analysisType,
    });

    return NextResponse.json({
      correlations: analysis,
      statistics: stats,
      dataPoints: {
        recordsAnalyzed: kpiData.length,
        dateRange: "90 days",
        analysisType,
      },
    });
  } catch (error) {
    console.error("Error analyzing correlations:", error);
    return NextResponse.json(
      { error: "Failed to analyze correlations" },
      { status: 500 }
    );
  }
}

