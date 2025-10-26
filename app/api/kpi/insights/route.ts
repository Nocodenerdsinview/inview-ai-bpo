import { NextRequest, NextResponse } from "next/server";
import { generateKPIInsights } from "@/lib/generateKPIInsights";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      kpiName, 
      currentValue, 
      target, 
      unit,
      trend, 
      topPerformers,
      bottomPerformers 
    } = body;

    // Validate required fields
    if (!kpiName || currentValue === undefined || !target || !unit || !trend || !bottomPerformers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const insights = await generateKPIInsights(
      kpiName,
      currentValue,
      target,
      unit,
      trend,
      topPerformers || [],
      bottomPerformers
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

