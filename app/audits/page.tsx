import { AppLayout } from "@/components/shared/app-layout";
import { AuditCard } from "@/components/audits/audit-card";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

async function getAudits() {
  const audits = await db
    .select({
      audit: schema.audits,
      agent: schema.agents,
    })
    .from(schema.audits)
    .leftJoin(schema.agents, eq(schema.audits.agentId, schema.agents.id))
    .orderBy(desc(schema.audits.date));

  return audits;
}

export default async function AuditsPage() {
  const audits = await getAudits();
  
  const needsCoachingCount = audits.filter(
    a => !a.audit.coachingStatus && a.audit.score && a.audit.score < 80
  ).length;

  return (
    <AppLayout
      title="Quality Audits"
      description="Track and manage quality audit records"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="glass-card p-10 text-center shadow-premium">
          <p className="metric-number-xl text-white mb-2">{audits.length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Audits</p>
        </div>
        <div className="glass-card p-10 text-center border-[#A4E83C]/20 shadow-premium">
          <p className="metric-number-xl text-[#A4E83C] mb-2">
            {audits.filter(a => a.audit.score && a.audit.score >= 90).length}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Excellent (90%+)</p>
        </div>
        <div className="glass-card p-10 text-center border-[#FF8C42]/20 shadow-premium">
          <p className="metric-number-xl text-[#FF8C42] mb-2">
            {audits.filter(a => a.audit.score && a.audit.score < 80).length}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Needs Improvement</p>
        </div>
        <div className="glass-card p-10 text-center border-[#3B82F6]/20 shadow-premium">
          <p className="metric-number-xl text-[#3B82F6] mb-2">
            {needsCoachingCount}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Needs Coaching</p>
        </div>
      </div>

      {/* Audit Cards */}
      <div className="space-y-4">
        {audits.map(({ audit, agent }) => (
          <AuditCard key={audit.id} audit={audit} agent={agent} />
        ))}
      </div>
    </AppLayout>
  );
}

