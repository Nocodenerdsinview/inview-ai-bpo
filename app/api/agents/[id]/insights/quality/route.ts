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
    
    // Fetch audits with quality issues
    const audits = await db.select().from(schema.audits)
      .where(
        and(
          eq(schema.audits.agentId, parseInt(id)),
          sql`${schema.audits.date} >= ${startDate}`,
          sql`${schema.audits.date} <= ${endDate}`
        )
      );
    
    const lowScoreAudits = audits.filter(a => (a.score || 0) < 80);
    
    const prompt = `Analyze quality errors from ${audits.length} audits (${lowScoreAudits.length} below 80%).

Audit Data:
${audits.slice(0, 20).map(a => `${a.date}: Score ${a.score}% - ${a.notes || 'No notes'}`).join('\n')}

Provide EXACTLY 3 findings with:
1. Common error patterns
2. Frequency of each error type
3. Specific recommendations

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X occurrences out of Y audits",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a quality analyst specializing in UK home insurance call center audits. Identify recurring quality errors (scripting non-compliance, empathy gaps, documentation issues). Be specific and data-driven with error frequencies. Reference FCA compliance requirements where relevant. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating quality insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

