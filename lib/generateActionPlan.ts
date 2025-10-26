interface AgentKPIs {
  quality: number | null;
  aht: number | null;
  srr: number | null;
  voc: number | null;
}

interface TeamAverages {
  quality: number;
  aht: number;
  srr: number;
  voc: number;
}

interface ActionPlan {
  focusAreas: Array<{
    area: string;
    priority: "high" | "medium" | "low";
    reason: string;
    icon: string;
  }>;
  actionItems: Array<{
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
  coachingApproach: string;
  successMetrics: string[];
}

export function generateActionPlan(
  agentKPIs: AgentKPIs,
  teamAvg: TeamAverages,
  agentName: string
): ActionPlan {
  const focusAreas: ActionPlan["focusAreas"] = [];
  const actionItems: ActionPlan["actionItems"] = [];
  const successMetrics: string[] = [];

  // Analyze each KPI and generate recommendations
  if (agentKPIs.quality !== null) {
    if (agentKPIs.quality < 80) {
      focusAreas.push({
        area: "Quality Score - Critical",
        priority: "high",
        reason: `At ${agentKPIs.quality.toFixed(0)}%, well below target of 90%. Immediate coaching required.`,
        icon: "AlertCircle",
      });
      actionItems.push({
        action: "Schedule urgent 1-on-1 coaching session focused on quality fundamentals",
        timeline: "Within 24 hours",
        expectedOutcome: "5-10% quality improvement within 1 week",
      });
      actionItems.push({
        action: "Review last 3 calls with manager for specific improvement areas",
        timeline: "This week",
        expectedOutcome: "Identify top 2-3 quality gaps",
      });
      successMetrics.push("Quality score reaches 85% within 2 weeks");
    } else if (agentKPIs.quality < 90) {
      focusAreas.push({
        area: "Quality Score - Improvement Needed",
        priority: "medium",
        reason: `At ${agentKPIs.quality.toFixed(0)}%, close to target but needs refinement.`,
        icon: "Target",
      });
      actionItems.push({
        action: "Weekly quality coaching sessions focusing on advanced techniques",
        timeline: "Next 4 weeks",
        expectedOutcome: "Reach 90%+ quality consistently",
      });
      successMetrics.push("Maintain quality above 90% for 2 consecutive weeks");
    }
  }

  if (agentKPIs.aht !== null) {
    if (agentKPIs.aht > 605) {
      focusAreas.push({
        area: "Handle Time - Critical",
        priority: "high",
        reason: `At ${agentKPIs.aht}s, significantly above target of 550s. Efficiency training needed.`,
        icon: "Clock",
      });
      actionItems.push({
        action: "Shadow top performer to learn efficient call handling techniques",
        timeline: "This week",
        expectedOutcome: "Reduce AHT by 30-50 seconds",
      });
      actionItems.push({
        action: "Focus on reducing hold time and improving system navigation",
        timeline: "Next 2 weeks",
        expectedOutcome: "AHT under 600s consistently",
      });
      successMetrics.push("AHT drops below 580s within 2 weeks");
    } else if (agentKPIs.aht > 550) {
      focusAreas.push({
        area: "Handle Time - Optimization",
        priority: "medium",
        reason: `At ${agentKPIs.aht}s, slightly above target. Minor efficiency gains needed.`,
        icon: "Zap",
      });
      actionItems.push({
        action: "Practice streamlining discovery phase and objection handling",
        timeline: "Next 2 weeks",
        expectedOutcome: "AHT reduction of 10-20 seconds",
      });
      successMetrics.push("Consistently achieve AHT under 550s");
    }
  }

  if (agentKPIs.srr !== null && agentKPIs.srr < 75) {
    focusAreas.push({
      area: "Sales Retention Rate - Development",
      priority: agentKPIs.srr < 70 ? "high" : "medium",
      reason: `At ${agentKPIs.srr.toFixed(0)}%, below target of 75%. Sales skills need enhancement.`,
      icon: "TrendingUp",
    });
    actionItems.push({
      action: "Objection handling workshop and role-play practice",
      timeline: "This week",
      expectedOutcome: "Improved confidence in retention conversations",
    });
    actionItems.push({
      action: "Review successful retention calls from team top performers",
      timeline: "Next week",
      expectedOutcome: "Learn 3-5 effective retention techniques",
    });
    successMetrics.push("SRR improves to 75%+ within 3 weeks");
  }

  if (agentKPIs.voc !== null && agentKPIs.voc < 94) {
    focusAreas.push({
      area: "Voice of Customer - Customer Experience",
      priority: "medium",
      reason: `At ${agentKPIs.voc.toFixed(0)}%, below target. Focus on customer satisfaction needed.`,
      icon: "Heart",
    });
    actionItems.push({
      action: "Empathy and active listening skills workshop",
      timeline: "Next 2 weeks",
      expectedOutcome: "Enhanced customer rapport building",
    });
    successMetrics.push("VOC score reaches 94%+ consistently");
  }

  // Determine coaching approach based on primary issues
  let coachingApproach = "";
  const criticalCount = focusAreas.filter((f) => f.priority === "high").length;

  if (criticalCount >= 2) {
    coachingApproach = `${agentName} requires intensive coaching with daily check-ins. Focus on building fundamentals across multiple areas. Consider temporary schedule adjustment for training time.`;
  } else if (criticalCount === 1) {
    coachingApproach = `${agentName} needs focused coaching on the critical area with 2-3 sessions per week. Balance coaching with regular performance monitoring.`;
  } else {
    coachingApproach = `${agentName} is performing adequately but has room for improvement. Weekly coaching sessions focusing on refinement and consistency will help reach targets.`;
  }

  // Add general action items if none were added
  if (actionItems.length === 0) {
    actionItems.push({
      action: "Continue current performance with monthly coaching check-ins",
      timeline: "Ongoing",
      expectedOutcome: "Maintain current high performance levels",
    });
    actionItems.push({
      action: "Explore stretch goals and career development opportunities",
      timeline: "Next month",
      expectedOutcome: "Enhanced engagement and skill development",
    });
    successMetrics.push("Maintain all KPIs above target for 30 days");
  }

  // Add general success metrics
  if (successMetrics.length === 0) {
    successMetrics.push("All KPIs meet or exceed targets");
    successMetrics.push("Consistent performance over 30-day period");
  }

  return {
    focusAreas,
    actionItems,
    coachingApproach,
    successMetrics,
  };
}

