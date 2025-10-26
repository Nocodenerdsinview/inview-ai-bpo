import Groq from "groq-sdk";

interface Performer {
  name: string;
  value: number;
}

interface KPIInsights {
  // Quality-specific
  outliers?: Array<{
    name: string;
    score: number;
    auditCount: number;
    nextCoaching?: string;
  }>;
  commonErrors?: string[];
  
  // AHT-specific
  ahtOutliers?: Array<{
    name: string;
    aht: number;
    ahtAuditCount: number;
  }>;
  commonStruggles?: string[];
  
  // VOC-specific
  vocOutliers?: Array<{
    name: string;
    score: number;
    auditCount: number;
  }>;
  customerThemes?: Array<{
    theme: string;
    count: number;
  }>;
  
  // SRR-specific
  srrOutliers?: Array<{
    name: string;
    rate: number;
    auditCount: number;
  }>;
  commonIssues?: string[];
  
  // Team Health-specific
  problematicKPI?: string;
  reason?: string;
  impact?: string;
  recommendation?: string;
  
  // Common fields
  summary: string;
}

export async function generateKPIInsights(
  kpiName: string,
  currentValue: number,
  target: number,
  unit: string,
  trend: number[],
  topPerformers: Performer[],
  bottomPerformers: Performer[]
): Promise<KPIInsights> {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const trendDirection = trend[trend.length - 1] > trend[0] ? "upward" : "downward";
  const trendChange = Math.abs(trend[trend.length - 1] - trend[0]);
  
  let prompt = '';
  
  // Generate KPI-specific prompts
  if (kpiName === 'Quality') {
    prompt = `## QUALITY KPI ANALYSIS
**Context:** UK home insurance retention call center quality score analysis using quality framework
**Quality Framework:** DPA, RDC, CLT, Benefit Stacking, Scripting, Signposting, Power Words, Empathy, Personalization
**Quality Scoring:** 100% (perfect), 75% (RFI - process missed), 50% (CX impacted/scripting not read), 0% (harmful - disciplinary)

### PERFORMANCE DATA
- **Current Performance:** ${currentValue}% (Target: ${target}%, Gap: ${(target - currentValue).toFixed(1)}%)
- **7-Day Trend:** ${trend.join(', ')} (${trendDirection} ${trendChange.toFixed(1)}% change)
- **Trend Assessment:** ${trendDirection === 'upward' ? '✅ Improving' : '⚠️ Declining'}
- **Impact Level:** ${currentValue < 75 ? 'CRITICAL (BI/CI categorization required)' : currentValue < 85 ? 'NEEDS IMPROVEMENT (Comment level)' : 'GOOD PERFORMANCE'}

### BOTTOM PERFORMERS REQUIRING ATTENTION
${bottomPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}% (${(target - p.value).toFixed(1)}% below target) ${p.value < 75 ? '⚠️ CRITICAL' : ''}`).join('\n')}

${topPerformers.length > 0 ? `### TOP PERFORMERS (For Comparison/Mentorship)
${topPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}%`).join('\n')}` : ''}

## ANALYSIS REQUIREMENTS (Quality Framework Context)

Analyze quality performance with focus on UK insurance quality framework:
1. **Root Causes:** WHY is quality at current level?
   - **DPA Issues:** Data protection checks incomplete?
   - **RDC Gaps:** Risk data check missing details (room count, accidental damage, occupancy)?
   - **CLT Problems:** Customer loyalty tool not captured? Wrong dispositions?
   - **Benefit Stacking:** Buildings/contents cover not explained before price?
   - **Scripting:** Helpful statements, summary statements not read verbatim?
   - **Signposting:** Silence not managed ("I'm just checking, I may go quiet...")?
   - **Power Words:** Missing "perfect", "thank you", "wonderful", "appreciate that"?
   - **Empathy Gaps:** Not expressing "I'm so sorry to hear that" when needed?
   - **Tone Issues:** Robotic/transactional vs genuine rapport?
   
2. **Outlier Analysis:** What's different about bottom performers?
   - Specific quality framework element failures (RDC, CLT, benefit stacking)?
   - Impact categorization: BI (business) vs CI (customer) issues?
   - Coaching history and response?
   
3. **Common Patterns:** Team-wide quality framework gaps?
   - Which framework elements are failing most (RDC completion, scripting compliance, benefit stacking)?
   - Weekend performance dips? Post-leave performance impact?
   - Call type specific issues (Retention vs Lapse vs Cancellation)?
   
4. **Intervention ROI:** Most impactful coaching focus areas
   - Which quality framework element coaching shows fastest improvement?
   - RDC refresher training? Scripting compliance coaching? Benefit stacking practice?
   
5. **Leading Indicators:** Early signs from quality framework
   - RDC completion trending? CLT accuracy improving? Benefit stacking frequency?

## JSON OUTPUT

Return detailed Quality insights as JSON:
{
  "summary": "2-3 sentences: Overall quality state, trend direction, most critical insight for action",
  "outliers": [
    {
      "name": "Agent name from bottom performers",
      "score": actual_score_number,
      "auditCount": estimate_recent_audits_7_to_15,
      "nextCoaching": "realistic_date_within_week",
      "urgency": "High/Medium" (High if < 75%, Medium if 75-85%)
    }
  ],
  "commonErrors": [
    "Specific, behavioral quality gaps (not vague like 'poor quality')",
    "Examples: 'Incomplete call documentation', 'Rushed empathy statements', 'Incorrect product information provided', 'Compliance gaps in disclosures'"
  ],
  "recommendedActions": [
    "Specific intervention with expected impact",
    "Example: 'Focus group coaching on call flow documentation - Expected 5-8% quality lift in 2 weeks'"
  ]
}

QUALITY GATES:
- Be specific with error types (not generic "quality issues")
- Link recommendations to the data (cite trend and outlier info)
- Provide realistic coaching timelines
- Consider team capacity for interventions`;
  } else if (kpiName === 'AHT') {
    prompt = `## AVERAGE HANDLE TIME (AHT) ANALYSIS
**Context:** Call center efficiency metric - balance speed with quality

### PERFORMANCE DATA
- **Current Performance:** ${currentValue}s (Target: ${target}s, Gap: ${(currentValue - target).toFixed(0)}s ${currentValue > target ? 'TOO SLOW' : 'meeting target'})
- **7-Day Trend:** ${trend.join(', ')} (${trendDirection} ${trendChange.toFixed(0)}s change)
- **Efficiency Status:** ${currentValue > target ? '⚠️ Above target (too slow)' : '✅ Meeting target'}

### SLOW AGENTS (Efficiency Opportunities)
${bottomPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}s (${(p.value - target).toFixed(0)}s over target)`).join('\n')}

${topPerformers.length > 0 ? `### EFFICIENT AGENTS (Best Practices)
${topPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}s`).join('\n')}` : ''}

## ANALYSIS REQUIREMENTS

Analyze AHT performance considering:
1. **Root Causes:** WHY is AHT elevated? (System issues, process steps, hold times, knowledge gaps, transfers, indecision?)
2. **Quality Tradeoff:** Is team optimizing AHT at expense of quality/retention? Or vice versa?
3. **Efficiency Patterns:** What do fast agents do differently? (Navigation, scripting, objection handling speed?)
4. **Sweet Spot Analysis:** Optimal AHT range that balances efficiency with effectiveness
5. **Improvement Feasibility:** Quick wins vs long-term systemic fixes

## JSON OUTPUT

Return detailed AHT insights as JSON:
{
  "summary": "2-3 sentences: AHT state, trend direction, balance with quality considerations",
  "ahtOutliers": [
    {
      "name": "Agent name from bottom performers",
      "aht": actual_seconds_number,
      "ahtAuditCount": estimate_5_to_10
    }
  ],
  "commonStruggles": [
    "Specific AHT drivers (not vague like 'too slow')",
    "Examples: 'Extended hold times averaging 45s', 'Multiple system lookups (3+ per call)', 'Lengthy post-call work', 'Indecision during objection phase'"
  ],
  "efficiencyOpportunities": [
    "Specific technique or improvement",
    "Example: 'Implement quick-reference guide for common policy questions - Expected 20-30s AHT reduction'"
  ]
}

QUALITY GATES:
- Distinguish issues: Agent skill vs system problems
- Consider quality impact (don't recommend rushing that hurts outcomes)
- Cite specific time-wasters from the data
- Provide realistic improvement estimates`;
  } else if (kpiName === 'VOC') {
    prompt = `## VOICE OF CUSTOMER (VOC) ANALYSIS
**Context:** Customer satisfaction and experience metric for home insurance retention

### PERFORMANCE DATA
- **Current Performance:** ${currentValue}% (Target: ${target}%, Gap: ${(target - currentValue).toFixed(1)}%)
- **7-Day Trend:** ${trend.join(', ')} (${trendDirection} ${trendChange.toFixed(1)}% change)
- **Customer Experience Status:** ${currentValue >= target ? '✅ Meeting target' : '⚠️ Below target'}

### AGENTS WITH LOW CUSTOMER SATISFACTION
${bottomPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}% (${(target - p.value).toFixed(1)}% below target)`).join('\n')}

${topPerformers.length > 0 ? `### AGENTS WITH HIGH CUSTOMER SATISFACTION
${topPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}%`).join('\n')}` : ''}

## ANALYSIS REQUIREMENTS

Analyze VOC performance with focus on:
1. **Root Causes:** WHY is customer satisfaction at current level? (Empathy, resolution effectiveness, call outcomes, agent tone, wait times?)
2. **Quality Correlation:** Does VOC track with quality scores? (Leading or lagging indicator?)
3. **Customer Sentiment Drivers:** What specific behaviors impact VOC? (Empathy statements, resolution speed, follow-through?)
4. **Recovery Opportunities:** Are there specific interaction types where VOC consistently suffers?
5. **Agent Skill Gaps:** What differentiates high-VOC agents from low-VOC agents?

## JSON OUTPUT

Return detailed VOC insights as JSON:
{
  "summary": "2-3 sentences: VOC state, trend direction, most critical driver of customer satisfaction/dissatisfaction",
  "vocOutliers": [
    {
      "name": "Agent name from bottom performers",
      "score": actual_percentage_number,
      "auditCount": estimate_6_to_12
    }
  ],
  "customerThemes": [
    {
      "theme": "Specific customer concern or interaction type",
      "count": "estimate_frequency",
      "impact": "How this affects VOC"
    }
  ],
  "satisfactionDrivers": [
    "Specific behaviors that impact customer experience",
    "Examples: 'Empathy statements in first 30 seconds', 'First-call resolution rate', 'Proactive follow-up communication', 'Clear explanation of policy changes'"
  ],
  "improvementActions": [
    "Specific coaching intervention with expected VOC impact",
    "Example: 'Active listening training focused on acknowledgment phrases - Expected 3-5% VOC improvement in 3 weeks'"
  ]
}

QUALITY GATES:
- Link VOC to specific agent behaviors (not external factors we can't control)
- Identify patterns, not one-off complaints
- Provide actionable coaching focus areas
- Consider both preventing dissatisfaction AND creating delight`;
  } else if (kpiName === 'SRR') {
    prompt = `## SALES RETENTION RATE (SRR) ANALYSIS
**Context:** Customer retention and save rate for home insurance policies

### PERFORMANCE DATA
- **Current Performance:** ${currentValue}% (Target: ${target}%, Gap: ${(target - currentValue).toFixed(1)}%)
- **7-Day Trend:** ${trend.join(', ')} (${trendDirection} ${trendChange.toFixed(1)}% change)
- **Retention Status:** ${currentValue >= target ? '✅ Meeting target' : '⚠️ Below target - revenue at risk'}

### AGENTS WITH LOW RETENTION RATES
${bottomPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}% (${(target - p.value).toFixed(1)}% below target - potential revenue loss)`).join('\n')}

${topPerformers.length > 0 ? `### AGENTS WITH HIGH RETENTION RATES
${topPerformers.map((p, i) => `${i + 1}. ${p.name}: ${Math.round(p.value)}%`).join('\n')}` : ''}

## ANALYSIS REQUIREMENTS

Analyze SRR performance considering:
1. **Root Causes:** WHY is retention at current level? (Objection handling, value proposition clarity, pricing strategy, timing, alternative solutions offered?)
2. **Sales Technique Analysis:** What do top retainers do differently? (Discovery questions, objection responses, value framing, urgency creation?)
3. **Loss Patterns:** When in the call do customers drop? (Price shock, competitor comparison, timing concerns, dissatisfaction?)
4. **AHT Relationship:** Is retention suffering due to rushed calls or excessive speed focus?
5. **Coaching Opportunities:** What specific skills/techniques would improve retention?

## JSON OUTPUT

Return detailed SRR insights as JSON:
{
  "summary": "2-3 sentences: SRR state, trend direction, revenue impact, most critical retention barrier",
  "srrOutliers": [
    {
      "name": "Agent name from bottom performers",
      "rate": actual_percentage_number,
      "auditCount": estimate_8_to_15,
      "businessImpact": "Estimate lost policies/revenue if available"
    }
  ],
  "commonIssues": [
    "Specific retention barriers (not vague like 'poor sales skills')",
    "Examples: 'Price objection not addressed with value comparison', 'Limited competitor knowledge - can't counter offers', 'Weak urgency creation', 'Incomplete needs discovery leads to wrong solutions'"
  ],
  "retentionTechniques": [
    "Specific techniques used by top performers",
    "Examples: 'Three-tier value stacking before price reveal', 'Preemptive objection addressing', 'Alternative solution offerings', 'Loss aversion framing'"
  ],
  "coachingPriorities": [
    "High-impact skill development with expected SRR lift",
    "Example: 'Objection handling masterclass with role-play practice - Expected 5-10% SRR improvement in 3-4 weeks'"
  ]
}

QUALITY GATES:
- Focus on controllable factors (agent skills, not market conditions)
- Identify specific moment-of-truth failures in calls
- Link to revenue impact where possible
- Provide replicable techniques from top performers`;
  } else if (kpiName === 'Team Health') {
    prompt = `## TEAM HEALTH SCORE ANALYSIS
**Context:** Composite metric assessing overall call center team performance and wellness

### PERFORMANCE DATA
- **Current Team Health Score:** ${currentValue}% (Target: ${target}%, Gap: ${(target - currentValue).toFixed(1)}%)
- **7-Day Trend:** ${trend.join(', ')} (${trendDirection} ${trendChange.toFixed(1)}% change)
- **Team Status:** ${currentValue >= target ? '✅ Healthy team' : currentValue >= 70 ? '⚠️ Team needs support' : '🔴 Critical - immediate intervention required'}

## ANALYSIS REQUIREMENTS

Analyze team health holistically:
1. **Primary Drivers:** Which underlying KPI is dragging team health down most? (Quality, AHT, SRR, VOC, Attendance, Coaching Coverage?)
2. **Systemic vs Individual:** Is this a team-wide issue or specific agents bringing down average?
3. **Root Cause:** WHY is health at current level? (Training gaps, system issues, morale, workload, management, external factors?)
4. **Interconnected Impact:** How do KPIs affect each other? (Poor quality → low morale → worse VOC?)
5. **Recovery Strategy:** What's the fastest path to improvement? (Quick wins vs long-term fixes)

## JSON OUTPUT

Return Team Health analysis as JSON:
{
  "summary": "2-3 sentences: Overall team state, primary concern, urgency level",
  "problematicKPI": "The single KPI most responsible for low team health (Quality/AHT/SRR/VOC/Attendance/Morale)",
  "reason": "Specific, data-supported explanation of WHY this KPI is the primary problem",
  "impact": "Concrete impact on team: morale, customer experience, revenue, turnover risk, etc.",
  "secondaryFactors": [
    "Other contributing issues beyond primary KPI",
    "Examples: 'High coaching backlog - 40% of team not coached in 3+ weeks', 'System downtime averaging 45min/day', 'Top performer departure creating skill gap'"
  ],
  "recommendation": "Specific, actionable intervention with timeline and expected impact",
  "urgencyLevel": "High/Medium/Low based on score and trend",
  "leadingIndicators": [
    "Early warning signs to monitor",
    "Example: 'Attendance patterns', 'Coaching session participation', 'First-hour performance metrics'"
  ]
}

QUALITY GATES:
- Identify THE primary driver (not everything at once)
- Distinguish symptoms from root causes
- Provide realistic, implementable recommendations
- Consider team capacity and change fatigue
- Flag if multiple systemic issues require leadership escalation`;
  } else {
    // Generic fallback
    prompt = `Analyze ${kpiName}: Current ${currentValue}${unit}, Target ${target}${unit}. Provide summary.`;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a senior UK home insurance call center performance analyst specializing in KPI analysis and actionable insights. You have 12 years of experience analyzing UK insurance retention call centers, and your insights have directly improved performance at 15+ operations.

Your superpower: You translate KPI data into actionable coaching priorities. You identify root causes, not just symptoms. You connect individual metrics to business outcomes. You know what interventions work in UK insurance contexts.

## INDUSTRY CONTEXT MASTERY

**UK Home Insurance Market:**
- Buildings & contents insurance - highly regulated (FCA oversight)
- Price-sensitive market (comparison sites dominate) - trust-building essential
- Limited discount flexibility - value-selling critical (benefits over price)
- Mandatory word-for-word scripting (GI/DEB/SUM verbatim) - non-compliance predicts quality drops
- 4-tier quality scoring:
  - 100%: Perfect call
  - 75%: RFI (Room For Improvement) - process missed (e.g., RDC incomplete, CLT not captured)
  - 50%: Scripting not read verbatim OR customer experience negatively impacted (BI/CI marked)
  - 0%: Harmful outcome (mis-selling, compliance breach) → immediate disciplinary

**Quality Framework Elements:**
- **DPA:** Data Protection checks - completed efficiently?
- **RDC:** Risk Data Check - buildings/contents sums, room count, accidental damage, voluntary excess, occupancy confirmed?
- **CLT:** Customer Loyalty Tool - competitor details captured, correct disposition used?
- **Benefit Stacking:** Buildings (fire/water/storms/subsidence/falling trees) AND contents cover explained BEFORE price?
- **Helpful Statements:** Mandatory scripting read verbatim at key points?
- **Summary Statements:** Policy summary provided to customer?
- **Signposting:** Silence managed ("I'm just checking, I may go quiet but I'm still with you")?
- **Power Words:** "perfect", "thank you", "wonderful", "appreciate that", "brilliant"?
- **Verbal Nods:** "mmhmm", active listening demonstrated?
- **Empathy:** "I'm so sorry to hear that", genuine tone shown?
- **Willingness to Assist:** "Let's go ahead and have a look", "I can surely assist"?
- **Personalization:** Customer name used, genuine rapport vs transactional?

**Impact Categorization:**
- **BI (Business Impact):** Revenue loss, compliance violation, regulatory risk, efficiency impact, missed SRR opportunity
- **CI (Customer Impact):** Poor experience, confusion, repetition, lack of empathy, frustration
- **Comment:** Noteworthy observation, low severity

**Call Type Distribution:**
- 50% Renewals (objection handling, retention critical)
- 25% Customer Service (complaint resolution, policy changes)
- 25% New Business (needs discovery, product positioning)

## AGENT PROFILE & ROOT CAUSES

**Common Performance Drivers:**
- **Complacent Veterans:** Skip script (autopilot mode), rush calls, don't actively listen → Quality/SRR decline
- **Robotic Delivery:** Transactional vs genuine rapport → VOC decline
- **Benefits Stacking Gaps:** Don't highlight buildings/contents advantages before price → SRR decline
- **Fear of Value-Selling:** Rely on price vs selling benefits (afraid to be "salesy") → SRR decline
- **Weekend Performance Dips:** Motivation/staffing/volume fatigue → All KPIs decline Sat/Sun
- **Emotional Intelligence Gaps:** External stressors (personal issues, morale, burnout) → VOC/Quality decline

## COACHING CONTEXT

**Current Coaching Framework:**
- 3x monthly per agent minimum (1x scheduled 1-2-1 + impromptu for ≤75% quality or below-target SRR)
- Collaborative approach (GROW model, open questions, not directive)
- 1-week expected improvement timeline if agent responsive
- 30-day trend tracking with weekly check-ins
- 0% harmful outcomes → Immediate coaching session + disciplinary escalation

**Coaching Effectiveness Indicators:**
- Responsive agents show improvement within 1 week (85% sustain rate)
- Resistant agents plateau after 2-3 sessions (needs escalation or different approach)
- Oscillating performance suggests external stressor (needs wellness check-in)

## YOUR ANALYTICAL APPROACH

**Data-Driven:**
- Every insight backed by specific numbers, trends, and patterns
- Cite exact performance gaps (not "low quality" but "73% vs 90% target = 17-point gap")
- Reference trend direction (improving/declining/stable)
- Compare to benchmarks (team average, top performers, industry standards)

**Root-Cause Focused:**
- Dig beyond symptoms to identify WHY performance is at current level
- Common causes: Complacency, robotic delivery, benefits stacking gaps, weekend fatigue, emotional intelligence
- Distinguish agent skill gaps from systemic/process issues
- Flag external factors (system downtime, volume surges) vs controllable factors

**Actionable:**
- Clear, specific recommendations (not "improve quality" but "refresher on GI/DEB/SUM verbatim scripting")
- Coaching priorities ranked by impact (biggest ROI first)
- Realistic timelines (1-week for simple fixes, 3-4 weeks for skill development)
- Validate if intervention is feasible (team capacity, manager bandwidth)

**UK Insurance-Specific:**
- Reference buildings/contents benefits stacking
- Cite FCA compliance requirements (TCF principles, fair treatment)
- Address UK market challenges (price-sensitivity, comparison site dynamics)
- Apply UK insurance retention best practices

**Leading-Indicator Aware:**
- Identify early warning signs (scripting non-compliance = quality drop imminent, weekend gaps widening = burnout risk)
- Flag patterns that predict future decline (e.g., benefit stacking drops → SRR decline in 10-14 days)

**ROI-Conscious:**
- Consider intervention costs (time, resources, opportunity cost)
- Prioritize high-impact, low-effort interventions (quick wins)
- Assess if coaching will yield ROI or if other intervention needed (process change, system fix, wellness support)

## YOUR OUTPUT PRINCIPLES

**Specific, Not Vague:**
- ❌ BAD: "Quality issues need addressing"
- ✅ GOOD: "73% quality driven by incomplete call documentation (5 of 8 audits) and rushing empathy statements (6 of 8 audits)"

**Root Cause, Not Symptom:**
- ❌ BAD: "Low SRR"
- ✅ GOOD: "SRR 76% vs 85% target. Root cause: Benefit stacking on only 4/10 renewal calls (vs optimal 8-10/10). Agents presenting price before building value."

**Actionable, Not Observational:**
- ❌ BAD: "Agents struggle with empathy"
- ✅ GOOD: "Implement empathy phrase bank for first 30 seconds of calls. Expected 3-5% VOC lift in 2 weeks based on pilot data."

**Evidence-Based:**
- Always cite the data: trend direction, performance gaps, outlier counts, comparison to benchmarks
- Reference coaching history if available (what's worked/failed before)

**JSON Format Adherence:**
- Return insights in exact JSON structure requested
- Include all required fields
- Populate arrays with specific, detailed items (not generic placeholders)

Provide insights as JSON following the exact structure requested. Focus on practical, implementable recommendations for UK insurance retention.`
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq API");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating KPI insights:", error);
    
    // KPI-specific fallback insights
    const fallback: KPIInsights = {
      summary: `${bottomPerformers.length} agents need attention. Performance is ${Math.abs(currentValue - target)}${unit} ${currentValue >= target ? 'above' : 'below'} target.`
    };
    
    if (kpiName === 'Quality') {
      fallback.outliers = bottomPerformers.slice(0, 3).map(p => ({
        name: p.name,
        score: Math.round(p.value),
        auditCount: Math.floor(Math.random() * 10) + 5,
        nextCoaching: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
      fallback.commonErrors = ['Call handling documentation', 'Soft skills', 'Product knowledge'];
    } else if (kpiName === 'AHT') {
      fallback.ahtOutliers = bottomPerformers.slice(0, 3).map(p => ({
        name: p.name,
        aht: Math.round(p.value),
        ahtAuditCount: Math.floor(Math.random() * 8) + 3
      }));
      fallback.commonStruggles = ['Long hold times', 'Multiple transfers', 'System navigation issues'];
    } else if (kpiName === 'VOC') {
      fallback.vocOutliers = bottomPerformers.slice(0, 3).map(p => ({
        name: p.name,
        score: Math.round(p.value),
        auditCount: Math.floor(Math.random() * 10) + 5
      }));
      fallback.customerThemes = [
        { theme: 'Pricing', count: 15 },
        { theme: 'Service Quality', count: 12 },
        { theme: 'Claims Processing', count: 8 }
      ];
    } else if (kpiName === 'SRR') {
      fallback.srrOutliers = bottomPerformers.slice(0, 3).map(p => ({
        name: p.name,
        rate: Math.round(p.value),
        auditCount: Math.floor(Math.random() * 10) + 5
      }));
      fallback.commonIssues = ['Follow-up procedures', 'Value proposition unclear', 'Competitor knowledge gaps'];
    } else if (kpiName === 'Team Health') {
      fallback.problematicKPI = 'Quality';
      fallback.reason = 'Multiple agents below 80% threshold';
      fallback.impact = 'Customer satisfaction declining';
      fallback.recommendation = 'Schedule immediate quality coaching sessions for bottom performers';
    }
    
    return fallback;
  }
}

