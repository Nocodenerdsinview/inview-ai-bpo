import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import { generateChatCompletion } from '@/lib/groq';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Fetch KPIs for AHT analysis
    const kpis = await db.select().from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, parseInt(id)),
          sql`${schema.kpis.date} >= ${startDate}`,
          sql`${schema.kpis.date} <= ${endDate}`
        )
      );
    
    // Fetch audits that might contain AHT-related notes
    const audits = await db.select().from(schema.audits)
      .where(
        and(
          eq(schema.audits.agentId, parseInt(id)),
          sql`${schema.audits.date} >= ${startDate}`,
          sql`${schema.audits.date} <= ${endDate}`
        )
      );
    
    const avgAHT = kpis.reduce((sum, k) => sum + (k.aht || 0), 0) / (kpis.length || 1);
    const highAHTDays = kpis.filter(k => k.aht && k.aht > 550).length;
    
    const prompt = `Analyze AHT (Average Handle Time) performance from ${kpis.length} data points.

Average AHT: ${Math.round(avgAHT)}s
Days with high AHT (>550s): ${highAHTDays}

Recent AHT Data:
${kpis.slice(0, 20).map(k => `${k.date}: ${k.aht}s`).join('\n')}

Audit Notes (potential struggles):
${audits.slice(0, 10).map(a => `${a.date}: ${a.notes || 'No notes'}`).join('\n')}

Provide EXACTLY 3 findings with:
1. AHT patterns and trends
2. Common time management struggles
3. Specific recommendations to improve efficiency

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X days out of Y had high AHT",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a call center efficiency analyst specializing in UK home insurance operations. Identify AHT drivers (system issues, hold times, knowledge gaps, indecision, transfers). Balance efficiency with quality - never recommend rushing that hurts outcomes. Target AHT sweet spot: 420-480s. Be specific and data-driven. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating AHT insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

