import { AppLayout } from "@/components/shared/app-layout";
import { PremiumAgentCard } from "@/components/dashboard/premium-agent-card";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { getAgentRanking } from "@/lib/calculateAgentScore";

async function getAgents() {
  // OPTIMIZED: Fetch all data in parallel to avoid N+1 queries
  const [agents, allKPIs, allAudits, allCoaching] = await Promise.all([
    db.select().from(schema.agents).orderBy(schema.agents.name),
    db.select().from(schema.kpis).orderBy(desc(schema.kpis.date)),
    db.select().from(schema.audits),
    db.select().from(schema.coachingSessions)
  ]);

  // Group data by agent ID in memory
  const latestKPIByAgent = new Map<number, typeof allKPIs[0]>();
  const auditCountByAgent = new Map<number, number>();
  const coachingCountByAgent = new Map<number, number>();

  // Get latest KPI for each agent
  for (const kpi of allKPIs) {
    if (!latestKPIByAgent.has(kpi.agentId)) {
      latestKPIByAgent.set(kpi.agentId, kpi);
    }
  }

  // Count audits per agent
  for (const audit of allAudits) {
    auditCountByAgent.set(audit.agentId, (auditCountByAgent.get(audit.agentId) || 0) + 1);
  }

  // Count coaching sessions per agent
  for (const session of allCoaching) {
    coachingCountByAgent.set(session.agentId, (coachingCountByAgent.get(session.agentId) || 0) + 1);
  }

  // Combine all data
  const agentsWithStats = agents.map((agent) => {
    const latestKPI = latestKPIByAgent.get(agent.id);
    
    return {
      ...agent,
      latestKPIs: latestKPI ? {
        quality: latestKPI.quality,
        aht: latestKPI.aht,
        srr: latestKPI.srr,
        voc: latestKPI.voc
      } : { quality: null, aht: null, srr: null, voc: null },
      auditCount: auditCountByAgent.get(agent.id) || 0,
      coachingCount: coachingCountByAgent.get(agent.id) || 0,
    };
  });

  // Rank agents by performance
  const rankedAgents = getAgentRanking(agentsWithStats);

  return rankedAgents;
}

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <AppLayout title="Team Agents" description="Manage and view all team members">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-scale">
        <div className="glass-card p-6 shadow-premium">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Agents</p>
          <p className="text-5xl font-black text-white">{agents.length}</p>
        </div>
        <div className="glass-card p-6 shadow-premium border-[#A4E83C]/20">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Top Performers</p>
          <p className="text-5xl font-black text-[#A4E83C]">
            {agents.filter(a => a.latestKPIs && (a.latestKPIs.quality || 0) >= 90).length}
          </p>
        </div>
        <div className="glass-card p-6 shadow-premium border-[#FF8C42]/20">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Needs Attention</p>
          <p className="text-5xl font-black text-[#FF8C42]">
            {agents.filter(a => a.latestKPIs && (a.latestKPIs.quality || 0) < 70).length}
          </p>
        </div>
        <div className="glass-card p-6 shadow-premium">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Avg Score</p>
          <p className="text-5xl font-black text-[#3B82F6]">
            {Math.round(agents.reduce((sum, a) => {
              const score = a.latestKPIs ? (
                ((a.latestKPIs.quality || 0) + 
                 (a.latestKPIs.srr || 0) + 
                 (a.latestKPIs.voc || 0)) / 3
              ) : 0;
              return sum + score;
            }, 0) / agents.length)}%
          </p>
        </div>
      </div>

      {/* Agent Cards Grid - Using Premium Agent Card */}
      <div>
        <h2 className="text-3xl font-bold uppercase tracking-wide text-white mb-6">
          All Agents (Ranked by Performance)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <PremiumAgentCard
              key={agent.id}
              agent={{
                id: agent.id,
                name: agent.name,
                avatarUrl: agent.avatarUrl || null,
                tenure: agent.tenure || 0,
                status: agent.status || 'active',
              }}
              kpis={agent.latestKPIs}
              auditCount={agent.auditCount || 0}
              coachingCount={agent.coachingCount || 0}
              rank={agent.rank || 0}
              rankSuffix={agent.rankSuffix || ''}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

