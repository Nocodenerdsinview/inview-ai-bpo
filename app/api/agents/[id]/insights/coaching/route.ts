import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import { generateChatCompletion } from '@/lib/groq';
import { parseISO, differenceInDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Fetch KPIs
    const kpis = await db.select().from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, parseInt(id)),
          sql`${schema.kpis.date} >= ${startDate}`,
          sql`${schema.kpis.date} <= ${endDate}`
        )
      );
    
    // Fetch coaching sessions
    const coachingSessions = await db.select().from(schema.coachingSessions)
      .where(
        and(
          eq(schema.coachingSessions.agentId, parseInt(id)),
          sql`${schema.coachingSessions.scheduledDate} >= ${startDate}`,
          sql`${schema.coachingSessions.scheduledDate} <= ${endDate}`
        )
      );
    
    // Calculate before/after metrics for each coaching
    const coachingImpacts = coachingSessions
      .filter(s => s.status === 'completed')
      .map(session => {
        const sessionDate = parseISO(session.scheduledDate || session.createdAt);
        
        // Get 7 days before
        const before = kpis.filter(k => {
          const kpiDate = parseISO(k.date);
          const diff = differenceInDays(sessionDate, kpiDate);
          return diff > 0 && diff <= 7;
        });
        
        // Get 7 days after
        const after = kpis.filter(k => {
          const kpiDate = parseISO(k.date);
          const diff = differenceInDays(kpiDate, sessionDate);
          return diff > 0 && diff <= 7;
        });
        
        if (before.length === 0 || after.length === 0) return null;
        
        const avgQualityBefore = before.reduce((sum, k) => sum + (k.quality || 0), 0) / before.length;
        const avgQualityAfter = after.reduce((sum, k) => sum + (k.quality || 0), 0) / after.length;
        const avgAHTBefore = before.reduce((sum, k) => sum + (k.aht || 0), 0) / before.length;
        const avgAHTAfter = after.reduce((sum, k) => sum + (k.aht || 0), 0) / after.length;
        
        return {
          date: session.scheduledDate,
          qualityChange: avgQualityAfter - avgQualityBefore,
          ahtChange: avgAHTBefore - avgAHTAfter, // Lower AHT is better
        };
      })
      .filter(impact => impact !== null);
    
    const prompt = `Analyze coaching effectiveness from ${coachingSessions.length} coaching sessions.

Coaching Sessions:
${coachingSessions.map(s => `${s.scheduledDate || s.createdAt}: ${s.status} - ${s.actionPlan || 'No action plan'}`).join('\n')}

Measured Impact (Before vs After):
${coachingImpacts.map(i => `${i?.date}: Quality ${i?.qualityChange > 0 ? '+' : ''}${Math.round(i?.qualityChange || 0)}%, AHT ${i?.ahtChange > 0 ? '-' : '+'}${Math.round(Math.abs(i?.ahtChange || 0))}s`).join('\n')}

Provide EXACTLY 3 findings with:
1. Which coaching sessions had the most positive impact
2. Which coaching topics/methods were most effective
3. Recommendations for future coaching focus areas

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X sessions showed Y% improvement",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a coaching effectiveness analyst specializing in UK call centers. Assess coaching ROI by comparing before/after metrics. Responsive agents improve within 1 week (85% sustain). Resistant agents plateau after 2-3 sessions (needs escalation). Identify patterns: what coaching works, what does not, and why. Be specific and data-driven. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating coaching insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

