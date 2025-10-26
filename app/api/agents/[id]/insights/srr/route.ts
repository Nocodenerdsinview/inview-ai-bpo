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
    
    // Fetch KPIs for SRR scores
    const kpis = await db.select().from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, parseInt(id)),
          sql`${schema.kpis.date} >= ${startDate}`,
          sql`${schema.kpis.date} <= ${endDate}`
        )
      );
    
    // Fetch audits for retention issues
    const audits = await db.select().from(schema.audits)
      .where(
        and(
          eq(schema.audits.agentId, parseInt(id)),
          sql`${schema.audits.date} >= ${startDate}`,
          sql`${schema.audits.date} <= ${endDate}`
        )
      );
    
    const avgSRR = kpis.reduce((sum, k) => sum + (k.srr || 0), 0) / (kpis.length || 1);
    const lowSRRDays = kpis.filter(k => k.srr && k.srr < 75).length;
    
    const prompt = `Analyze Static Retention Rate (SRR) performance from ${kpis.length} data points and ${audits.length} audits.

Average SRR: ${Math.round(avgSRR)}%
Days with low SRR (<75%): ${lowSRRDays}

Recent SRR Data:
${kpis.slice(0, 20).map(k => `${k.date}: ${k.srr}%`).join('\n')}

Audit Notes (potential retention issues):
${audits.slice(0, 15).map(a => `${a.date}: Score ${a.score}% - ${a.notes || 'No notes'}`).join('\n')}

Provide EXACTLY 3 findings with:
1. Common patterns in customer retention failures
2. Specific issues causing callbacks or escalations
3. Actionable recommendations to improve first-call resolution

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X occurrences out of Y calls",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a retention and resolution analyst specializing in UK home insurance retention. Identify SRR barriers (benefit stacking gaps, price objection handling, value-selling fear, objection timing). Target SRR: 85%. Focus on techniques that work (3-tier value stacking, preemptive objection addressing). Be specific and data-driven with revenue impact. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating SRR insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

