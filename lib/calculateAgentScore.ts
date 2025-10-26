export interface AgentKPIs {
  quality: number | null;
  aht: number | null;
  srr: number | null;
  voc: number | null;
}

export interface AgentForRanking {
  id: number;
  name: string;
  latestKPIs: AgentKPIs;
  avatarUrl?: string | null;
  tenure?: number;
  status?: string;
  auditCount?: number;
  coachingCount?: number;
}

export interface RankedAgent extends AgentForRanking {
  score: number;
  rank: number;
  rankSuffix: string;
}

export function calculateOverallScore(kpis: AgentKPIs): number {
  const weights = {
    quality: 0.25,  // 25%
    aht: 0.25,      // 25%
    srr: 0.25,      // 25%
    voc: 0.25       // 25%
  };
  
  // Normalize AHT (lower is better) - convert to percentage
  // Perfect AHT: 300s = 100%, 600s+ = 0%
  const ahtScore = kpis.aht 
    ? Math.max(0, Math.min(100, 100 - ((kpis.aht - 300) / 300) * 100))
    : 75; // Default if no AHT data
  
  const qualityScore = kpis.quality || 75;
  const srrScore = kpis.srr || 75;
  const vocScore = kpis.voc || 75;
  
  const totalScore = (
    qualityScore * weights.quality +
    ahtScore * weights.aht +
    srrScore * weights.srr +
    vocScore * weights.voc
  );
  
  return Math.round(totalScore);
}

export function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 85) return { bg: '#A4E83C', text: '#A4E83C', label: 'Excellent' }; // Green
  if (score >= 70) return { bg: '#FF8C42', text: '#FF8C42', label: 'Fair' };      // Orange
  return { bg: '#EF4444', text: '#EF4444', label: 'Needs Attention' };            // Red
}

export function getAgentRanking(agents: AgentForRanking[]): RankedAgent[] {
  return agents
    .map(agent => ({
      ...agent,
      score: calculateOverallScore(agent.latestKPIs)
    }))
    .sort((a, b) => b.score - a.score)
    .map((agent, index) => ({
      ...agent,
      rank: index + 1,
      rankSuffix: getRankSuffix(index + 1)
    }));
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function getKPIProblems(kpis: AgentKPIs): Array<{ metric: string; value: number | null; issue: string }> {
  const problems: Array<{ metric: string; value: number | null; issue: string }> = [];
  
  if (kpis.quality !== null && kpis.quality < 85) {
    problems.push({
      metric: 'Quality',
      value: kpis.quality,
      issue: kpis.quality < 70 ? 'Critical - Below 70%' : 'Below Target (85%)'
    });
  }
  
  if (kpis.aht !== null && kpis.aht > 600) {
    problems.push({
      metric: 'AHT',
      value: kpis.aht,
      issue: kpis.aht > 700 ? 'Critical - Above 700s' : 'Above Target (600s)'
    });
  }
  
  if (kpis.srr !== null && kpis.srr < 85) {
    problems.push({
      metric: 'SRR',
      value: kpis.srr,
      issue: kpis.srr < 70 ? 'Critical - Below 70%' : 'Below Target (85%)'
    });
  }
  
  if (kpis.voc !== null && kpis.voc < 85) {
    problems.push({
      metric: 'VOC',
      value: kpis.voc,
      issue: kpis.voc < 70 ? 'Critical - Below 70%' : 'Below Target (85%)'
    });
  }
  
  return problems;
}

