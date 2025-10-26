import { generateChatCompletion } from "./groq";

interface CoachingPrepParams {
  agentId: number;
  agentName: string;
  auditId?: number;
  auditScore?: number;
  auditWeaknesses?: string[];
  recentKPIs?: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  };
  previousCoachings?: any[];
  includeTranscripts?: boolean;
}

interface CoachingPrepResult {
  summary: string;
  focusAreas: string[];
  talkingPoints: string[];
  expectedOutcomes: string[];
  suggestedExercises: string[];
  followUpActions: string[];
}

export async function generateCoachingPrep(params: CoachingPrepParams): Promise<CoachingPrepResult> {
  try {
    const prompt = buildCoachingPrompt(params);
    
    const aiResponse = await generateChatCompletion(
      [
        { 
          role: "system", 
          content: `You are a senior UK home insurance call center coaching specialist with 10+ years of experience in performance development and agent training. You've designed 500+ coaching plans that have improved performance for 200+ agents in UK insurance retention.

Your superpower: You design coaching plans that are immediately actionable, emotionally intelligent, and get results. You use GROW and STAR frameworks naturally. You anticipate resistance and build buy-in. Your plans balance accountability with support.

## INDUSTRY CONTEXT MASTERY

**UK Home Insurance Market:**
- Buildings & contents insurance - highly regulated (FCA oversight, TCF principles)
- Price-sensitive market (comparison sites dominate) - trust-building essential
- Limited discount flexibility - value-selling critical (benefits over price)
- Mandatory word-for-word scripting (GI/DEB/SUM verbatim) - no deviation allowed
- 4-tier quality scoring:
  - 100%: Perfect call
  - 75%: Process missed (e.g., missed documentation step)
  - 50%: Scripting not read verbatim OR customer experience negatively impacted
  - 0%: Harmful outcome (mis-selling, compliance breach) → immediate disciplinary

**Call Type Distribution:**
- 50% Renewals (objection handling, retention critical)
- 25% Customer Service (complaint resolution, policy changes)
- 25% New Business (needs discovery, product positioning)

## AGENT PROFILE & COACHING CONTEXT

**Typical Agent Profile:**
- Complacent veterans falling into bad habits (skip script, rush, don't actively listen)
- Key issues: Scripting non-compliance, robotic delivery (transactional vs genuine), lack of benefits stacking (buildings/contents), fear of value-selling (afraid to be "salesy")

**Coaching Approach:**
- Collaborative (GROW model, open questions, let agent think) - NOT directive
- Improvement timeline: 1 week expected for behavior change if agent responsive, 30-day trend tracking
- Coaching triggers:
  - Quality ≤75% = immediate impromptu coaching
  - SRR below 85% target = impromptu coaching
  - 0% harmful outcome = immediate coaching + disciplinary pathway

## YOUR COACHING PLAN FRAMEWORK

**Evidence-Based:**
- Grounded in UK insurance context (scripting compliance, benefits stacking gaps)
- Link every recommendation to specific performance data provided
- Reference audit scores, KPI gaps, trends

**Behavioral:**
- Focus on specific actions agents can DO (not personality traits they need to "be")
- Examples: "Read GI/DEB/SUM verbatim", "Stack 3 buildings/contents benefits before price", "Use customer name 4+ times"
- NOT: "Be more empathetic", "Improve quality", "Try harder"

**Framework-Driven:**
- Use GROW (Goal, Reality, Options, Will) structure naturally
- Apply STAR (Situation, Task, Action, Result) for behavioral examples
- Open questions to encourage agent thinking (not lecture/directive)

**Actionable:**
- Every recommendation includes specific exercises (role-play objection handling, script rehearsal)
- Clear timelines (1 week for simple fixes, 3-4 weeks for skill development)
- Measurable success metrics ("SRR 76% → 82%", "Zero 0% outcomes next 20 calls")

**Emotionally Intelligent:**
- Consider veteran complacency patterns (resistance to "being told" - needs collaborative discovery)
- Anticipate defensive reactions to 0% outcomes (shame/frustration - needs empathy first)
- Address fear of value-selling (reframe "salesy" as "helping customers understand value")
- Motivation for genuine vs robotic delivery (connect to customer impact, not just metrics)

**SMART Goals:**
- Specific: Exact behavior/metric targeted
- Measurable: Clear success criteria (numbers, frequencies)
- Achievable: 70% probability of success with reasonable effort
- Relevant: Directly addresses root cause identified
- Time-bound: Clear deadline AND interim checkpoints

**UK-Specific:**
- Address scripting compliance (GI/DEB/SUM verbatim requirements)
- Benefits stacking for buildings/contents insurance
- Value-over-price selling in price-sensitive market
- "Real vs robotic" communication (genuine rapport despite scripts)

## YOUR OUTPUT PRINCIPLES

**Specific, Not Vague:**
- ❌ BAD: "Improve empathy"
- ✅ GOOD: "Use empathy phrase in first 30 seconds of every call: 'I can hear that's frustrating' or 'That makes sense why you're concerned'"

**Action-Oriented:**
- ❌ BAD: "Be better at objection handling"
- ✅ GOOD: "When customer objects to price: (1) Acknowledge objection, (2) Re-stack 3 benefits matched to their need, (3) Pause 2 seconds, (4) Ask 'How does that sound?' Role-play this 3x during session."

**Data-Linked:**
- Always connect recommendations to the performance data provided
- Example: "Your SRR is 76% vs 85% target. Audit shows benefit stacking on only 4/10 renewal calls. Top performers stack 8-10/10. Focus Area: Increase benefit stacking to 8/10 calls."

**Emotionally Calibrated:**
- For 0% outcomes: Lead with empathy ("I know this is difficult to review"), then objective analysis, then path forward
- For complacent veterans: Leverage their expertise ("Your renewal opening is already strong at 8.5/10..."), then add the missing piece
- For defensive agents: Use questions ("What do you think contributed to...?") not statements ("You did X wrong")

**Timeline-Realistic:**
- Simple behavior changes (script compliance): 1-2 weeks
- Skill development (benefit stacking, objection handling): 2-4 weeks
- Mindset shifts (value-selling confidence, genuine rapport): 4-8 weeks

Always respond with valid JSON only, following the exact structure requested.`
        },
        { role: "user", content: prompt }
      ],
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        maxTokens: 2500,
      }
    );

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the AI response
    const coachingPlan = JSON.parse(aiResponse);
    
    return {
      summary: coachingPlan.summary || "Coaching session focused on performance improvement",
      focusAreas: coachingPlan.focusAreas || ["Performance improvement"],
      talkingPoints: coachingPlan.talkingPoints || [],
      expectedOutcomes: coachingPlan.expectedOutcomes || [],
      suggestedExercises: coachingPlan.suggestedExercises || [],
      followUpActions: coachingPlan.followUpActions || []
    };
  } catch (error) {
    console.error("Error generating coaching prep:", error);
    
    // Return fallback coaching plan
    return generateFallbackPlan(params);
  }
}

function buildCoachingPrompt(params: CoachingPrepParams): string {
  let prompt = `## COACHING PLAN GENERATION
**Agent:** ${params.agentName}
**Context:** Home insurance call center retention specialist
**Purpose:** Create actionable, evidence-based coaching plan

## PERFORMANCE DATA

`;
  
  if (params.auditScore !== undefined) {
    prompt += `### Recent Audit Performance:\n`;
    prompt += `- Overall Audit Score: ${params.auditScore}% ${params.auditScore < 70 ? '(CRITICAL - Below threshold)' : params.auditScore < 85 ? '(Needs improvement)' : '(Good performance)'}\n`;
    if (params.auditWeaknesses && params.auditWeaknesses.length > 0) {
      prompt += `- Quality Framework Areas Identified:\n`;
      for (const weakness of params.auditWeaknesses) {
        prompt += `  • ${weakness}\n`;
      }
      prompt += `\n**Quality Framework Elements to Assess:**\n`;
      prompt += `- DPA (Data Protection): Completed efficiently?\n`;
      prompt += `- RDC (Risk Data Check): All details confirmed (buildings/contents sums, room count, accidental damage, voluntary excess, occupancy)?\n`;
      prompt += `- CLT (Customer Loyalty Tool): Competitor details captured? Correct disposition?\n`;
      prompt += `- Benefit Stacking: Buildings AND contents cover explained BEFORE price?\n`;
      prompt += `- Helpful Statements: Mandatory scripting read verbatim?\n`;
      prompt += `- Signposting: Silence managed with customer updates?\n`;
      prompt += `- Power Words: "perfect", "thank you", "wonderful", "appreciate that"?\n`;
      prompt += `- Empathy: "I'm so sorry to hear", genuine tone shown?\n`;
      prompt += `- Personalization: Customer name used, genuine rapport vs transactional?\n`;
    }
    prompt += `\n`;
  }
  
  if (params.recentKPIs) {
    prompt += `### Recent KPI Performance:\n`;
    if (params.recentKPIs.quality !== null) {
      const qualityGap = 90 - params.recentKPIs.quality;
      prompt += `- Quality Score: ${params.recentKPIs.quality}% (Target: 90%, Gap: ${qualityGap > 0 ? '+' + qualityGap.toFixed(1) + '% needed' : 'EXCEEDING target'})\n`;
    }
    if (params.recentKPIs.aht !== null) {
      const ahtGap = params.recentKPIs.aht - 525;
      prompt += `- Average Handle Time: ${params.recentKPIs.aht}s (Target: 525s, Gap: ${ahtGap > 0 ? ahtGap.toFixed(0) + 's too slow' : 'MEETING target'})\n`;
    }
    if (params.recentKPIs.srr !== null) {
      const srrGap = 85 - params.recentKPIs.srr;
      prompt += `- Sales Retention Rate: ${params.recentKPIs.srr}% (Target: 85%, Gap: ${srrGap > 0 ? '+' + srrGap.toFixed(1) + '% needed' : 'EXCEEDING target'})\n`;
    }
    if (params.recentKPIs.voc !== null) {
      const vocGap = 88 - params.recentKPIs.voc;
      prompt += `- Voice of Customer: ${params.recentKPIs.voc}% (Target: 88%, Gap: ${vocGap > 0 ? '+' + vocGap.toFixed(1) + '% needed' : 'EXCEEDING target'})\n`;
    }
    prompt += `\n`;
  }
  
  if (params.previousCoachings && params.previousCoachings.length > 0) {
    prompt += `### Coaching History & Action Plan Tracking:\n`;
    prompt += `- Previous coaching sessions: ${params.previousCoachings.length} sessions in the past 90 days\n`;
    const latestCoaching = params.previousCoachings[0];
    if (latestCoaching.actionPlan) {
      prompt += `\n**Previous Action Plan:**\n${latestCoaching.actionPlan}\n`;
      if (latestCoaching.improvementStatus) {
        prompt += `**Progress Status:** ${latestCoaching.improvementStatus}\n`;
      }
      prompt += `\n**CRITICAL:** Assess if agent has applied the previous action plan. If "Improved", celebrate success. If "No Change" or "Declined", explore barriers and adjust approach.\n\n`;
    } else {
      prompt += `- Context: Assess if previous coaching is showing results or if different approach needed\n\n`;
    }
  }
  
  prompt += `## COACHING FRAMEWORK

Use GROW Model principles:
- **G**oal: What specific improvement are we targeting?
- **R**eality: Where is the agent now? What's the gap?
- **O**ptions: What strategies and techniques can help?
- **W**ill: What specific actions will the agent commit to?

Use STAR Method for behavioral coaching:
- **S**ituation: Describe the specific scenario
- **T**ask: What was expected/required?
- **A**ction: What did the agent do (good or bad)?
- **R**esult: What was the impact/outcome?

## JSON OUTPUT STRUCTURE

Generate a comprehensive coaching plan as a JSON object with the following structure:

{
  "summary": "A 2-3 sentence executive summary: What is the primary focus of this coaching session? What will the agent gain from it? Why is this coaching happening now?",
  
  "focusAreas": [
    "3-4 specific, behavioral focus areas (NOT personality traits)",
    "Format: 'Behavior/Skill - Why it matters - Link to KPI impact'",
    "Example: 'Objection handling timing - Currently presenting price too early - Directly impacts 15% lower SRR'"
  ],
  
  "talkingPoints": [
    "5-7 specific, concrete discussion points with examples",
    "Include STAR method examples where applicable",
    "Link each point to specific performance data",
    "Example: 'Review call from [date]: Customer objected at 3:45 mark. What triggered that? How could it have been prevented?'"
  ],
  
  "expectedOutcomes": [
    "3-5 measurable, SMART outcomes",
    "Format: 'Specific behavior/metric - Target value - Timeline'",
    "Example: 'Reduce AHT by 30-50 seconds through improved system navigation - Target <550s within 2 weeks'"
  ],
  
  "suggestedExercises": [
    "2-3 practical, hands-on exercises or role-plays",
    "Make them specific and immediately applicable",
    "Example: 'Role-play objection handling: Manager plays customer concerned about price increase. Agent practices value-based response technique discussed. Repeat until smooth delivery achieved (10-15 minutes).'"
  ],
  
  "followUpActions": [
    "3-4 specific, actionable commitments with accountability",
    "Format: 'Action - Timeline - Success metric - Check-in method'",
    "Example: 'Apply empathy statements in next 15 calls - This week - Manager spot-checks 3 calls - Friday follow-up meeting'"
  ]
}

## QUALITY REQUIREMENTS
- Every field must provide specific, actionable guidance (no generic advice)
- Link all recommendations to the performance data provided
- Use behavioral language ("do/say X" not "be better at Y")
- Include realistic timelines based on typical learning curves
- Consider agent's likely emotional state and potential resistance
- If audit score < 70, flag as HIGH PRIORITY coaching need
- If multiple KPIs below target, prioritize by business impact

Respond with ONLY the JSON object, no additional text.`;
  
  return prompt;
}

function generateFallbackPlan(params: CoachingPrepParams): CoachingPrepResult {
  const focusAreas: string[] = [];
  const talkingPoints: string[] = [];
  const expectedOutcomes: string[] = [];
  
  // Generate focus areas based on KPIs
  if (params.recentKPIs) {
    if (params.recentKPIs.quality !== null && params.recentKPIs.quality < 85) {
      focusAreas.push("Quality Improvement");
      talkingPoints.push(`Current quality score is ${params.recentKPIs.quality}%. Let's discuss specific call scenarios where quality can be improved.`);
      expectedOutcomes.push(`Improve quality score to above 85%`);
    }
    
    if (params.recentKPIs.aht !== null && params.recentKPIs.aht > 600) {
      focusAreas.push("Efficiency & Time Management");
      talkingPoints.push(`Your AHT is currently ${params.recentKPIs.aht}s. We'll work on techniques to handle calls more efficiently while maintaining quality.`);
      expectedOutcomes.push(`Reduce AHT to under 550s`);
    }
    
    if (params.recentKPIs.srr !== null && params.recentKPIs.srr < 85) {
      focusAreas.push("Sales & Retention Techniques");
      talkingPoints.push(`SRR is at ${params.recentKPIs.srr}%. Let's review effective retention strategies and objection handling.`);
      expectedOutcomes.push(`Increase SRR to above 85%`);
    }
    
    if (params.recentKPIs.voc !== null && params.recentKPIs.voc < 85) {
      focusAreas.push("Customer Experience");
      talkingPoints.push(`Customer satisfaction is at ${params.recentKPIs.voc}%. We'll focus on empathy, active listening, and problem resolution.`);
      expectedOutcomes.push(`Improve VOC score to above 88%`);
    }
  }
  
  // Add audit-specific items
  if (params.auditScore !== undefined && params.auditScore < 70) {
    focusAreas.push("Critical Performance Issues");
    talkingPoints.push(`Recent audit revealed areas needing immediate attention. Let's create an action plan to address these.`);
  }
  
  if (focusAreas.length === 0) {
    focusAreas.push("Performance Maintenance", "Skill Development");
    talkingPoints.push("Review recent performance and identify opportunities for growth");
    expectedOutcomes.push("Maintain current performance levels", "Develop advanced call handling skills");
  }
  
  return {
    summary: `This coaching session will focus on ${focusAreas.join(", ").toLowerCase()} to help ${params.agentName} improve their overall performance and achieve their targets.`,
    focusAreas,
    talkingPoints,
    expectedOutcomes,
    suggestedExercises: [
      "Role-play common call scenarios",
      "Review and analyze successful call recordings",
      "Practice objection handling techniques"
    ],
    followUpActions: [
      "Apply discussed techniques in next 10 calls",
      "Self-review one call per day using quality checklist",
      "Follow up with manager in 1 week to review progress",
      "Complete assigned training modules"
    ]
  };
}

