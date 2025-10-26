import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AgentKPIs } from "./calculateAgentScore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Agent Filtering Utilities

/**
 * Filters agents by performance score threshold
 * @param agents - Array of agents with KPI data
 * @param threshold - Minimum score threshold (0-100)
 * @param calculateScore - Function to calculate agent score
 * @returns Filtered array of agents
 */
export function filterAgentsByPerformance<T extends { latestKPIs: AgentKPIs }>(
  agents: T[],
  threshold: number,
  calculateScore: (kpis: AgentKPIs) => number
): T[] {
  return agents.filter(agent => calculateScore(agent.latestKPIs) >= threshold);
}

/**
 * Filters agents with specific KPI issues
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to check ('quality' | 'aht' | 'srr' | 'voc')
 * @param condition - Condition function to check
 * @returns Filtered array of agents
 */
export function filterAgentsByKPI<T extends { latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs,
  condition: (value: number | null) => boolean
): T[] {
  return agents.filter(agent => condition(agent.latestKPIs[kpiType]));
}

/**
 * Sorts agents by a specific KPI metric
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to sort by
 * @param direction - Sort direction ('asc' | 'desc')
 * @returns Sorted array of agents
 */
export function sortAgentsByKPI<T extends { latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs,
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  const sorted = [...agents].sort((a, b) => {
    const aValue = a.latestKPIs[kpiType] || 0;
    const bValue = b.latestKPIs[kpiType] || 0;
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
  return sorted;
}

/**
 * Calculates team average for a specific KPI
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to average
 * @returns Average value or 0 if no data
 */
export function calculateKPIAverage<T extends { latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs
): number {
  const values = agents
    .map(agent => agent.latestKPIs[kpiType])
    .filter((val): val is number => val !== null);
  
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculates all team KPI averages at once
 * @param agents - Array of agents with KPI data
 * @returns Object with all KPI averages
 */
export function calculateTeamAverages<T extends { latestKPIs: AgentKPIs }>(
  agents: T[]
): AgentKPIs {
  return {
    quality: calculateKPIAverage(agents, 'quality'),
    aht: calculateKPIAverage(agents, 'aht'),
    srr: calculateKPIAverage(agents, 'srr'),
    voc: calculateKPIAverage(agents, 'voc')
  };
}

/**
 * Gets top N performers for a specific KPI
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to rank by
 * @param count - Number of top performers to return
 * @param lowerIsBetter - If true, lower values rank higher (for AHT)
 * @returns Array of top performers with name and value
 */
export function getTopPerformers<T extends { name: string; latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs,
  count: number = 3,
  lowerIsBetter: boolean = false
): Array<{ name: string; value: number }> {
  const validAgents = agents.filter(a => a.latestKPIs[kpiType] !== null);
  const sorted = sortAgentsByKPI(validAgents, kpiType, lowerIsBetter ? 'asc' : 'desc');
  
  return sorted.slice(0, count).map(agent => ({
    name: agent.name,
    value: agent.latestKPIs[kpiType]!
  }));
}

/**
 * Gets bottom N performers for a specific KPI
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to rank by
 * @param count - Number of bottom performers to return
 * @param lowerIsBetter - If true, higher values rank lower (for AHT)
 * @returns Array of bottom performers with name and value
 */
export function getBottomPerformers<T extends { name: string; latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs,
  count: number = 3,
  lowerIsBetter: boolean = false
): Array<{ name: string; value: number }> {
  const validAgents = agents.filter(a => a.latestKPIs[kpiType] !== null);
  const sorted = sortAgentsByKPI(validAgents, kpiType, lowerIsBetter ? 'desc' : 'asc');
  
  return sorted.slice(0, count).map(agent => ({
    name: agent.name,
    value: agent.latestKPIs[kpiType]!
  }));
}

/**
 * Creates KPI distribution buckets
 * @param agents - Array of agents with KPI data
 * @param kpiType - Type of KPI to distribute
 * @param buckets - Array of bucket definitions
 * @returns Array of distribution data
 */
export function createKPIDistribution<T extends { latestKPIs: AgentKPIs }>(
  agents: T[],
  kpiType: keyof AgentKPIs,
  buckets: Array<{ label: string; min: number; max: number; color: string }>
): Array<{ label: string; count: number; percentage: number; color: string }> {
  const validAgents = agents.filter(a => a.latestKPIs[kpiType] !== null);
  const total = validAgents.length;
  
  if (total === 0) {
    return buckets.map(bucket => ({
      ...bucket,
      count: 0,
      percentage: 0
    }));
  }
  
  return buckets.map(bucket => {
    const count = validAgents.filter(agent => {
      const value = agent.latestKPIs[kpiType]!;
      return value >= bucket.min && value < bucket.max;
    }).length;
    
    return {
      label: bucket.label,
      count,
      percentage: (count / total) * 100,
      color: bucket.color
    };
  });
}

