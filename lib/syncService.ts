import { db, schema } from "@/lib/db";
import { eq, and, between } from "drizzle-orm";

interface KPIs {
  quality: number | null;
  aht: number | null;
  srr: number | null;
  voc: number | null;
}

// Rule 1: Agent on leave → Reschedule coaching
export async function syncLeaveToCoaching(agentId: number, leaveStart: Date, leaveEnd: Date) {
  try {
    const leaveStartStr = leaveStart.toISOString().split('T')[0];
    const leaveEndStr = leaveEnd.toISOString().split('T')[0];

    // Find all scheduled coachings in leave period
    const affectedCoachings = await db
      .select()
      .from(schema.coachingSessions)
      .where(
        and(
          eq(schema.coachingSessions.agentId, agentId),
          eq(schema.coachingSessions.status, 'scheduled')
        )
      );

    // Filter coachings that fall within leave period
    const coachingsInLeavePeriod = affectedCoachings.filter(coaching => {
      const coachingDate = coaching.scheduledDate || coaching.date;
      return coachingDate >= leaveStartStr && coachingDate <= leaveEndStr;
    });

    // Update status to 'needs_reschedule'
    for (const coaching of coachingsInLeavePeriod) {
      await db
        .update(schema.coachingSessions)
        .set({ status: 'needs_reschedule' })
        .where(eq(schema.coachingSessions.id, coaching.id))
        .run();
    }

    return {
      success: true,
      rescheduled: coachingsInLeavePeriod.length
    };
  } catch (error) {
    console.error('Error syncing leave to coaching:', error);
    return { success: false, error };
  }
}

// Rule 2: Low audit score → Suggest coaching
export async function syncAuditToCoaching(auditId: number, score: number, agentId: number) {
  try {
    if (score < 70) {
      // Check if coaching already planned for this agent in the last 7 days
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentDateStr = recentDate.toISOString().split('T')[0];

      const recentCoachings = await db
        .select()
        .from(schema.coachingSessions)
        .where(
          and(
            eq(schema.coachingSessions.agentId, agentId),
            eq(schema.coachingSessions.status, 'scheduled')
          )
        );

      const hasRecentCoaching = recentCoachings.some(
        coaching => coaching.date >= recentDateStr
      );

      return {
        success: true,
        suggestCoaching: !hasRecentCoaching,
        reason: hasRecentCoaching 
          ? 'Coaching already planned' 
          : `Low audit score: ${score}%`
      };
    }

    return { success: true, suggestCoaching: false };
  } catch (error) {
    console.error('Error syncing audit to coaching:', error);
    return { success: false, error };
  }
}

// Rule 3: KPIs improve after coaching → Mark effective
export async function syncKPIToCoachingEffectiveness(agentId: number, newKPIs: KPIs) {
  try {
    // Find recent completed coachings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentCoachings = await db
      .select()
      .from(schema.coachingSessions)
      .where(
        and(
          eq(schema.coachingSessions.agentId, agentId),
          eq(schema.coachingSessions.status, 'completed')
        )
      );

    const coachingsToCheck = recentCoachings.filter(
      coaching => coaching.date >= thirtyDaysAgoStr && !coaching.effectiveness
    );

    for (const coaching of coachingsToCheck) {
      // Get KPIs before coaching
      const coachingDate = new Date(coaching.date);
      const beforeDate = new Date(coachingDate);
      beforeDate.setDate(beforeDate.getDate() - 7);
      const beforeDateStr = beforeDate.toISOString().split('T')[0];

      const kpisBefore = await db
        .select()
        .from(schema.kpis)
        .where(
          and(
            eq(schema.kpis.agentId, agentId),
            eq(schema.kpis.date, beforeDateStr)
          )
        )
        .limit(1);

      if (kpisBefore.length > 0) {
        const before = kpisBefore[0];
        const improvement = calculateImprovement(
          {
            quality: before.quality,
            aht: before.aht,
            srr: before.srr,
            voc: before.voc
          },
          newKPIs
        );

        if (improvement > 10) {
          await db
            .update(schema.coachingSessions)
            .set({ effectiveness: 'effective' })
            .where(eq(schema.coachingSessions.id, coaching.id))
            .run();
        } else if (improvement < 0) {
          await db
            .update(schema.coachingSessions)
            .set({ 
              effectiveness: 'needs_follow_up',
              status: 'follow_up_needed'
            })
            .where(eq(schema.coachingSessions.id, coaching.id))
            .run();
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing KPI to coaching effectiveness:', error);
    return { success: false, error };
  }
}

function calculateImprovement(before: KPIs, after: KPIs): number {
  let improvements = 0;
  let count = 0;

  if (before.quality !== null && after.quality !== null) {
    improvements += (after.quality - before.quality);
    count++;
  }

  // For AHT, lower is better
  if (before.aht !== null && after.aht !== null) {
    improvements += ((before.aht - after.aht) / before.aht) * 100;
    count++;
  }

  if (before.srr !== null && after.srr !== null) {
    improvements += (after.srr - before.srr);
    count++;
  }

  if (before.voc !== null && after.voc !== null) {
    improvements += (after.voc - before.voc);
    count++;
  }

  return count > 0 ? improvements / count : 0;
}

// Check agent availability for scheduling
export async function checkAgentAvailability(agentId: number, dateRange?: { start: Date; end: Date }) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const endDate = dateRange?.end || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead
    const endDateStr = endDate.toISOString().split('T')[0];

    // Check for upcoming leave
    const upcomingLeave = await db
      .select()
      .from(schema.agentAttendance)
      .where(
        and(
          eq(schema.agentAttendance.agentId, agentId),
          eq(schema.agentAttendance.status, 'holiday')
        )
      );

    const leaveDays = upcomingLeave
      .filter(record => record.date >= today && record.date <= endDateStr)
      .map(record => record.date);

    // Get scheduled coachings
    const scheduledCoachings = await db
      .select()
      .from(schema.coachingSessions)
      .where(
        and(
          eq(schema.coachingSessions.agentId, agentId),
          eq(schema.coachingSessions.status, 'scheduled')
        )
      );

    const onLeave = leaveDays.includes(today);
    const returnDate = onLeave ? leaveDays[leaveDays.length - 1] : null;

    return {
      available: !onLeave,
      onLeave,
      returnDate,
      leaveDays,
      scheduledCoachings: scheduledCoachings.map(c => ({
        id: c.id,
        date: c.scheduledDate || c.date,
        focusAreas: c.focusAreas ? JSON.parse(c.focusAreas) : []
      }))
    };
  } catch (error) {
    console.error('Error checking agent availability:', error);
    return {
      available: true,
      onLeave: false,
      returnDate: null,
      leaveDays: [],
      scheduledCoachings: []
    };
  }
}

