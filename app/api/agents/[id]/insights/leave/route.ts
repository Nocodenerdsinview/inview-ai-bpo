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
    
    // Fetch KPIs
    const kpis = await db.select().from(schema.kpis)
      .where(
        and(
          eq(schema.kpis.agentId, parseInt(id)),
          sql`${schema.kpis.date} >= ${startDate}`,
          sql`${schema.kpis.date} <= ${endDate}`
        )
      );
    
    // Fetch leave records
    const leaveRecords = await db.select().from(schema.leaveRecords)
      .where(
        and(
          eq(schema.leaveRecords.agentId, parseInt(id)),
          sql`${schema.leaveRecords.startDate} >= ${startDate}`,
          sql`${schema.leaveRecords.endDate} <= ${endDate}`
        )
      );
    
    // Fetch attendance records
    const attendance = await db.select().from(schema.agentAttendance)
      .where(
        and(
          eq(schema.agentAttendance.agentId, parseInt(id)),
          sql`${schema.agentAttendance.date} >= ${startDate}`,
          sql`${schema.agentAttendance.date} <= ${endDate}`
        )
      );
    
    const totalDays = attendance.length;
    const sickDays = attendance.filter(a => a.status === 'sick').length;
    const holidayDays = attendance.filter(a => a.status === 'holiday').length;
    const activeDays = attendance.filter(a => a.status === 'active').length;
    
    const prompt = `Analyze the impact of leave on agent performance over ${totalDays} days.

Leave Summary:
- Sick Days: ${sickDays}
- Holiday Days: ${holidayDays}
- Active Days: ${activeDays}
- Total Leave Records: ${leaveRecords.length}

Leave Details:
${leaveRecords.map(l => `${l.type}: ${l.startDate || l.date} to ${l.endDate || l.date} - ${l.reason || 'No reason'}`).join('\n')}

Performance Metrics (${kpis.length} data points):
Average Quality: ${Math.round(kpis.reduce((sum, k) => sum + (k.quality || 0), 0) / (kpis.length || 1))}%
Average AHT: ${Math.round(kpis.reduce((sum, k) => sum + (k.aht || 0), 0) / (kpis.length || 1))}s

Provide EXACTLY 3 findings with:
1. Patterns in leave frequency and duration
2. Impact of leave on performance metrics
3. Recommendations for managing workload and attendance

Format as JSON:
{
  "findings": [
    {
      "title": "...",
      "description": "...",
      "evidence": "X days of leave over Y period",
      "recommendation": "..."
    }
  ]
}`;

    const response = await generateChatCompletion([
      { role: 'system', content: 'You are a workforce management analyst specializing in UK call centers. Analyze leave impact on performance. Typical pattern: 10-15% dip for 1-2 weeks post-leave (normal), 3+ weeks indicates problem. Identify return-to-work adjustment patterns. Be specific and data-driven with before/after metrics. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, jsonMode: true });
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating leave insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

