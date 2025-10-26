import { useMemo } from 'react';
import type { AgentKPIs } from '../calculateAgentScore';
import { 
  calculateTeamAverages,
  getTopPerformers,
  getBottomPerformers,
  createKPIDistribution
} from '../utils';

/**
 * Custom hook for calculating KPI statistics and distributions
 * Memoizes calculations to prevent unnecessary recomputation
 */
export function useAgentKPIs<T extends { name: string; latestKPIs: AgentKPIs }>(agents: T[]) {
  return useMemo(() => {
    // Calculate team averages
    const averages = calculateTeamAverages(agents);

    // Generate realistic 7-day sparkline data that matches current value
    const generateRealisticSparkline = (
      currentValue: number,
      lastWeekValue: number,
      variance: number = 3
    ): number[] => {
      const sparkData = [];
      const days = 7;
      const startValue = lastWeekValue;
      const endValue = currentValue;
      const totalChange = endValue - startValue;

      for (let i = 0; i < days; i++) {
        // Linear progression with some variance
        const progress = i / (days - 1);
        const baseValue = startValue + totalChange * progress;
        const randomVariance = (Math.random() - 0.5) * variance;
        const value = Math.max(0, baseValue + randomVariance);
        sparkData.push(Math.round(value));
      }

      // Ensure last value matches current exactly
      sparkData[sparkData.length - 1] = Math.round(currentValue);

      return sparkData;
    };

    // Quality KPI Distribution
    const qualityDistribution = createKPIDistribution(agents, 'quality', [
      { label: 'Good', min: 90, max: 101, color: '#A4E83C' },
      { label: 'Room for Improvement', min: 70, max: 90, color: '#FF8C42' },
      { label: 'Poor/Harmful', min: 0, max: 70, color: '#EF4444' }
    ]);

    // AHT KPI Distribution
    const ahtDistribution = createKPIDistribution(agents, 'aht', [
      { label: 'Amazing', min: 0, max: 450, color: '#A4E83C' },
      { label: 'Good', min: 450, max: 550, color: '#3B82F6' },
      { label: 'Moderate', min: 550, max: 600, color: '#FF8C42' },
      { label: 'Critical', min: 600, max: 9999, color: '#EF4444' }
    ]);

    // SRR KPI Distribution
    const srrDistribution = createKPIDistribution(agents, 'srr', [
      { label: 'Excellent', min: 90, max: 101, color: '#A4E83C' },
      { label: 'Good', min: 80, max: 90, color: '#3B82F6' },
      { label: 'Needs Work', min: 70, max: 80, color: '#FF8C42' },
      { label: 'Critical', min: 0, max: 70, color: '#EF4444' }
    ]);

    // VOC KPI Distribution
    const vocDistribution = createKPIDistribution(agents, 'voc', [
      { label: 'Excellent', min: 90, max: 101, color: '#A4E83C' },
      { label: 'Good', min: 80, max: 90, color: '#3B82F6' },
      { label: 'Needs Work', min: 70, max: 80, color: '#FF8C42' },
      { label: 'Critical', min: 0, max: 70, color: '#EF4444' }
    ]);

    return {
      averages,
      quality: {
        distribution: qualityDistribution,
        topPerformers: getTopPerformers(agents, 'quality', 3),
        bottomPerformers: getBottomPerformers(agents, 'quality', 3),
        sparklineData: generateRealisticSparkline(averages.quality || 0, (averages.quality || 0) - 2, 3)
      },
      aht: {
        distribution: ahtDistribution,
        topPerformers: getTopPerformers(agents, 'aht', 3, true), // Lower is better for AHT
        bottomPerformers: getBottomPerformers(agents, 'aht', 3, true),
        sparklineData: generateRealisticSparkline(averages.aht || 0, (averages.aht || 0) + 15, 20)
      },
      srr: {
        distribution: srrDistribution,
        topPerformers: getTopPerformers(agents, 'srr', 3),
        bottomPerformers: getBottomPerformers(agents, 'srr', 3),
        sparklineData: generateRealisticSparkline(averages.srr || 0, (averages.srr || 0) - 1, 3)
      },
      voc: {
        distribution: vocDistribution,
        topPerformers: getTopPerformers(agents, 'voc', 3),
        bottomPerformers: getBottomPerformers(agents, 'voc', 3),
        sparklineData: generateRealisticSparkline(averages.voc || 0, (averages.voc || 0) - 2, 3)
      },
      generateRealisticSparkline
    };
  }, [agents]);
}

