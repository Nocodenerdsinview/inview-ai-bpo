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
    
    // Fetch KPIs for VOC scores
    const kpis = await db.select().from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, parseInt(id)),
          sql`${schema.kpis.date} >= ${startDate}`,
          sql`${schema.kpis.date} <= ${endDate}`
        )
      );
    
    // Fetch audits for customer feedback themes
    const audits = await db.select().from(schema.audits)
      .where(
        and(
          eq(schema.audits.agentId, parseInt(id)),
          sql`${schema.audits.date} >= ${startDate}`,
          sql`${schema.audits.date} <= ${endDate}`
        )
      );
    
    const avgVOC = kpis.reduce((sum, k) => sum + (k.voc || 0), 0) / (kpis.length || 1);
    const lowVOCDays = kpis.filter(k => k.voc && k.voc < 80).length;
    
    const prompt = `Analyze Voice of Customer (VOC) feedback from ${kpis.length} data points and ${audits.length} audits.

Average VOC Score: ${Math.round(avgVOC)}%
Days with low VOC (<80%): ${lowVOCDays}

Recent VOC Scores:
${kpis.slice(0, 20).map(k => `${k.date}: ${k.voc}%`).join('\n')}

Audit Notes (customer feedback themes):
${audits.slice(0, 15).map(a => `${a.date}: Score ${a.score}% - ${a.notes || 'No notes'}`).join('\n')}

Provide EXACTLY 3 findings with:
1. Common customer complaint themes (pricing, service, claims, wait times, etc.)
2. Patterns in customer dissatisfaction
3. Specific recommendations to improve customer experience

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X occurrences in Y customer interactions",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a customer experience analyst specializing in UK home insurance call centers. Identify VOC drivers (empathy gaps, robotic delivery, resolution effectiveness, felt heard/rushed). Link VOC to specific agent behaviors. Focus on actionable improvements (empathy phrases, active listening, follow-through). Be specific and data-driven. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating VOC insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

