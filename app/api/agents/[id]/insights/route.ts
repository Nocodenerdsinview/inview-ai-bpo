import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { generateChatCompletion } from "@/lib/groq";
import { format, parseISO, differenceInDays } from "date-fns";

// Helper: Analyze day-of-week patterns
function analyzeDayOfWeekPatterns(kpis: any[]) {
  const byDay: any = {};
  kpis.forEach(kpi => {
    const day = format(parseISO(kpi.date), 'EEEE');
    if (!byDay[day]) byDay[day] = { count: 0, totalQuality: 0, totalAHT: 0, totalSRR: 0, totalVOC: 0 };
    byDay[day].count++;
    byDay[day].totalQuality += kpi.quality || 0;
    byDay[day].totalAHT += kpi.aht || 0;
    byDay[day].totalSRR += kpi.srr || 0;
    byDay[day].totalVOC += kpi.voc || 0;
  });
  
  return Object.entries(byDay).map(([day, data]: [string, any]) => ({
    day,
    avgQuality: (data.totalQuality / data.count).toFixed(1),
    avgAHT: Math.round(data.totalAHT / data.count),
    avgSRR: (data.totalSRR / data.count).toFixed(1),
    avgVOC: (data.totalVOC / data.count).toFixed(1),
    count: data.count
  })).sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });
}

// Helper: Get KPIs before coaching
function getKPIsBeforeCoaching(kpis: any[], coachingDate: string, days: number = 7) {
  const coaching = parseISO(coachingDate);
  const before = kpis.filter(k => {
    const kpiDate = parseISO(k.date);
    const daysDiff = differenceInDays(coaching, kpiDate);
    return daysDiff > 0 && daysDiff <= days;
  });
  
  if (before.length === 0) return { avgQuality: 0, avgAHT: 0, avgSRR: 0, avgVOC: 0 };
  
  return {
    avgQuality: Math.round(before.reduce((sum, k) => sum + (k.quality || 0), 0) / before.length),
    avgAHT: Math.round(before.reduce((sum, k) => sum + (k.aht || 0), 0) / before.length),
    avgSRR: Math.round(before.reduce((sum, k) => sum + (k.srr || 0), 0) / before.length),
    avgVOC: Math.round(before.reduce((sum, k) => sum + (k.voc || 0), 0) / before.length),
  };
}

// Helper: Get KPIs after coaching
function getKPIsAfterCoaching(kpis: any[], coachingDate: string, days: number = 7) {
  const coaching = parseISO(coachingDate);
  const after = kpis.filter(k => {
    const kpiDate = parseISO(k.date);
    const daysDiff = differenceInDays(kpiDate, coaching);
    return daysDiff > 0 && daysDiff <= days;
  });
  
  if (after.length === 0) return { avgQuality: 0, avgAHT: 0, avgSRR: 0, avgVOC: 0 };
  
  return {
    avgQuality: Math.round(after.reduce((sum, k) => sum + (k.quality || 0), 0) / after.length),
    avgAHT: Math.round(after.reduce((sum, k) => sum + (k.aht || 0), 0) / after.length),
    avgSRR: Math.round(after.reduce((sum, k) => sum + (k.srr || 0), 0) / after.length),
    avgVOC: Math.round(after.reduce((sum, k) => sum + (k.voc || 0), 0) / after.length),
  };
}

// Helper: Get external factors
function getExternalFactors(agentId: number, kpis: any[], leaveRecords: any[], coaching: any[]) {
  const factors = [];
  
  // Recent leave impact
  const recentLeave = leaveRecords.filter(l => {
    const leaveDate = parseISO(l.endDate || l.date);
    return differenceInDays(new Date(), leaveDate) <= 14;
  });
  if (recentLeave.length > 0) {
    factors.push(`Recent leave: ${recentLeave.length} period(s) in last 14 days`);
  }
  
  // Recent coaching
  const recentCoaching = coaching.filter(c => {
    const coachDate = parseISO(c.scheduledDate);
    return differenceInDays(new Date(), coachDate) <= 14 && differenceInDays(new Date(), coachDate) >= 0;
  });
  if (recentCoaching.length > 0) {
    factors.push(`Recent coaching: ${recentCoaching.length} session(s) in last 14 days`);
  }
  
  return factors.length > 0 ? factors.join('\n- ') : 'No recent external factors';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);
    
    // Fetch comprehensive data
    const agent = await db.select().from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);
    
    if (agent.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    
    const kpis = await db.select().from(schema.kpis)
      .where(eq(schema.kpis.agentId, agentId))
      .orderBy(desc(schema.kpis.date))
      .limit(90);
    
    const audits = await db.select().from(schema.audits)
      .where(eq(schema.audits.agentId, agentId))
      .orderBy(desc(schema.audits.date))
      .limit(20);
    
    const coaching = await db.select().from(schema.coachingSessions)
      .where(eq(schema.coachingSessions.agentId, agentId))
      .orderBy(desc(schema.coachingSessions.scheduledDate))
      .limit(10);
      
    const leaveRecords = await db.select().from(schema.leaveRecords)
      .where(eq(schema.leaveRecords.agentId, agentId))
      .orderBy(desc(schema.leaveRecords.date))
      .limit(10);
    
    // Calculate data confidence score
    const confidenceScore = Math.min(100, 
      (kpis.length / 90 * 40) + // 40% weight for KPI completeness
      (audits.length / 20 * 30) + // 30% weight for audit availability
      (coaching.length / 5 * 30)  // 30% weight for coaching history
    );
    
    // Analyze day-of-week patterns
    const dayPatterns = analyzeDayOfWeekPatterns(kpis);
    const dayPatternsText = dayPatterns.map(d => 
      `${d.day}: Q=${d.avgQuality}%, AHT=${d.avgAHT}s, SRR=${d.avgSRR}%, VOC=${d.avgVOC}% (${d.count} days)`
    ).join('\n');
    
    // Format data for AI
    const kpiSummary = kpis.slice(0, 30).map(k => 
      `${k.date} (${format(parseISO(k.date), 'EEEE')}): Q=${k.quality}%, AHT=${k.aht}s, SRR=${k.srr}%, VOC=${k.voc}%`
    ).join("\n");
    
    const auditSummary = audits.map(a => 
      `${a.date}: Score ${a.score}% - ${a.notes || 'No notes'} - Coached: ${a.coachingStatus || 'Not yet'}`
    ).join("\n");
    
    const coachingSummary = coaching.map((c, i) => {
      const beforeKPIs = getKPIsBeforeCoaching(kpis, c.scheduledDate || c.createdAt, 7);
      const afterKPIs = getKPIsAfterCoaching(kpis, c.scheduledDate || c.createdAt, 7);
      return `Session ${i+1} (${c.scheduledDate}): ${c.status}
Before (7d): Q=${beforeKPIs.avgQuality}%, AHT=${beforeKPIs.avgAHT}s, SRR=${beforeKPIs.avgSRR}%, VOC=${beforeKPIs.avgVOC}%
After (7d): Q=${afterKPIs.avgQuality}%, AHT=${afterKPIs.avgAHT}s, SRR=${afterKPIs.avgSRR}%, VOC=${afterKPIs.avgVOC}%
Impact: Quality ${afterKPIs.avgQuality - beforeKPIs.avgQuality > 0 ? 'improved by +' : 'declined by '}${Math.abs(afterKPIs.avgQuality - beforeKPIs.avgQuality)}%`;
    }).join("\n\n");
    
    // External factors context
    const externalFactors = getExternalFactors(agentId, kpis, leaveRecords, coaching);
    
    const prompt = `Analyze ${agent[0].name}'s performance with data confidence of ${confidenceScore.toFixed(0)}%.

## KPI History (Last 30 Days):
${kpiSummary}

## Day-of-Week Performance Patterns:
${dayPatternsText}

## Recent Audits (with Coaching Status):
${auditSummary}

## Coaching Effectiveness (Before/After):
${coachingSummary}

## External Factors:
- ${externalFactors}

Provide EXACTLY:
1. **3 Strong Observations** - Data-driven positives with specific dates/numbers
2. **3 Development Areas** - Issues with evidence and actionable recommendations
3. **Optimal Coaching Day** - Best day of week for coaching based on performance patterns
4. **Priority Score** - Urgency to coach this agent (1-100, where 100 = critical)

Format as JSON:
{
  "observations": [
    { "title": "...", "description": "...", "evidence": "...", "dataPoints": 5 },
    { "title": "...", "description": "...", "evidence": "...", "dataPoints": 8 },
    { "title": "...", "description": "...", "evidence": "...", "dataPoints": 6 }
  ],
  "developmentAreas": [
    { "title": "...", "description": "...", "evidence": "...", "recommendation": "...", "urgency": "high" },
    { "title": "...", "description": "...", "evidence": "...", "recommendation": "...", "urgency": "medium" },
    { "title": "...", "description": "...", "evidence": "...", "recommendation": "...", "urgency": "low" }
  ],
  "optimalCoachingDay": "Wednesday",
  "priorityScore": 75,
  "coachingEffectiveness": {
    "avgQualityImpact": "+5.2%",
    "avgAHTImpact": "-15s",
    "successRate": "80%",
    "totalSessions": ${coaching.length}
  }
}`;

    const aiResponse = await generateChatCompletion([
      { role: "system", content: "You are a data analyst specializing in UK home insurance call center performance. Use ONLY the provided data - never fabricate metrics or dates. Be specific with dates, numbers, and evidence. Identify patterns across weekdays vs weekends. Assess coaching effectiveness by comparing before/after metrics. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ], { temperature: 0.3, maxTokens: 2000, jsonMode: true });
    
    // Parse AI response
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, provide default structure
      insights = {
        observations: [
          { title: "Data Processing", description: "Analyzing performance data", evidence: "Ongoing analysis", dataPoints: kpis.length }
        ],
        developmentAreas: [
          { title: "Data Review", description: "Performance review in progress", evidence: "Historical data", recommendation: "Continue monitoring", urgency: "low" }
        ],
        optimalCoachingDay: "Wednesday",
        priorityScore: 50,
        coachingEffectiveness: {
          avgQualityImpact: "—",
          avgAHTImpact: "—",
          successRate: coaching.length > 0 ? "Data available" : "No data",
          totalSessions: coaching.length
        }
      };
    }
    
    insights.confidenceScore = Math.round(confidenceScore);
    insights.lastUpdated = new Date().toISOString();
    insights.dayPatterns = dayPatterns;
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating agent insights:", error);
    return NextResponse.json({ 
      error: "Failed to generate insights",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

