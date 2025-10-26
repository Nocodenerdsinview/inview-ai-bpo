-- InView AI - Initial Supabase Schema Migration
-- BPO Call Center Performance Management for Hastings Direct

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- AGENTS TABLE (with soft delete for data preservation)
-- =============================================================================
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  team TEXT DEFAULT 'Team 1',
  role TEXT DEFAULT 'Insurance Agent',
  status TEXT DEFAULT 'active', -- 'active' or 'archived'
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL, -- Soft delete: never actually delete agents
  notes TEXT,
  CONSTRAINT agents_status_check CHECK (status IN ('active', 'archived'))
);

-- =============================================================================
-- KPIs TABLE (historical data preserved even if agent archived)
-- =============================================================================
CREATE TABLE kpis (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE RESTRICT, -- Prevent deletion if KPIs exist
  date DATE NOT NULL,
  quality DECIMAL(5,2),
  aht INTEGER, -- Average Handle Time in seconds
  srr DECIMAL(5,2), -- Sales Retention Rate
  voc DECIMAL(5,2), -- Voice of Customer
  calls_taken INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, date) -- One record per agent per day
);

-- =============================================================================
-- AUDITS TABLE (call quality assessments)
-- =============================================================================
CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  score DECIMAL(5,2),
  call_type TEXT, -- RET, CANX, MTA, etc.
  transcript TEXT,
  notes TEXT,
  tags TEXT[],
  coaching_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT audits_coaching_status_check CHECK (coaching_status IN ('pending', 'scheduled', 'completed'))
);

-- =============================================================================
-- COACHING SESSIONS TABLE
-- =============================================================================
CREATE TABLE coaching_sessions (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  scheduled_date TIMESTAMP,
  status TEXT DEFAULT 'scheduled',
  focus_areas TEXT[],
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT coaching_status_check CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- =============================================================================
-- LEAVE RECORDS TABLE
-- =============================================================================
CREATE TABLE leave_records (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  end_date DATE,
  type TEXT, -- Annual, Sick, Unpaid, etc.
  duration_days DECIMAL(5,2),
  status TEXT DEFAULT 'approved',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- UPLOAD HISTORY TABLE (track Hastings Direct data imports)
-- =============================================================================
CREATE TABLE upload_history (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- CSV, Excel, PDF
  upload_date TIMESTAMP DEFAULT NOW(),
  uploaded_by TEXT DEFAULT 'Manager',
  records_imported INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  CONSTRAINT upload_status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
CREATE INDEX idx_kpis_agent_date ON kpis(agent_id, date DESC);
CREATE INDEX idx_audits_agent_date ON audits(agent_id, date DESC);
CREATE INDEX idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_coaching_agent ON coaching_sessions(agent_id, scheduled_date DESC);
CREATE INDEX idx_leave_agent_date ON leave_records(agent_id, date DESC);
CREATE INDEX idx_upload_date ON upload_history(upload_date DESC);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for active agents only (exclude archived)
CREATE VIEW active_agents AS
SELECT * FROM agents 
WHERE status = 'active' AND deleted_at IS NULL;

-- View for agent performance summary (last 30 days)
CREATE VIEW agent_performance_30d AS
SELECT 
  a.id,
  a.name,
  a.team,
  ROUND(AVG(k.quality), 2) as avg_quality,
  ROUND(AVG(k.aht), 0) as avg_aht,
  ROUND(AVG(k.srr), 2) as avg_srr,
  ROUND(AVG(k.voc), 2) as avg_voc,
  COUNT(k.id) as data_points,
  MAX(k.date) as last_update
FROM agents a
LEFT JOIN kpis k ON a.id = k.agent_id
WHERE k.date >= CURRENT_DATE - INTERVAL '30 days'
  AND a.status = 'active'
  AND a.deleted_at IS NULL
GROUP BY a.id, a.name, a.team;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to archive agent (soft delete - preserves all data)
CREATE OR REPLACE FUNCTION archive_agent(agent_id_to_archive INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE agents 
  SET status = 'archived', 
      deleted_at = NOW()
  WHERE id = agent_id_to_archive;
  
  -- Log the action
  RAISE NOTICE 'Agent % archived. Historical data preserved.', agent_id_to_archive;
END;
$$ LANGUAGE plpgsql;

-- Function to reactivate agent
CREATE OR REPLACE FUNCTION reactivate_agent(agent_id_to_restore INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE agents 
  SET status = 'active', 
      deleted_at = NULL
  WHERE id = agent_id_to_restore;
  
  RAISE NOTICE 'Agent % reactivated.', agent_id_to_restore;
END;
$$ LANGUAGE plpgsql;

-- Function to update KPIs updated_at timestamp
CREATE OR REPLACE FUNCTION update_kpis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update KPIs updated_at
CREATE TRIGGER kpis_updated_at_trigger
BEFORE UPDATE ON kpis
FOR EACH ROW
EXECUTE FUNCTION update_kpis_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - Ready for future multi-user implementation
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to see everything (single manager mode)
-- Future: Add manager_id to agents table and restrict by manager

CREATE POLICY "Allow all for authenticated users" ON agents
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON kpis
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON audits
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON coaching_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON leave_records
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON upload_history
  FOR ALL USING (true);

-- =============================================================================
-- SEED DATA (Optional - comment out if migrating from SQLite)
-- =============================================================================

-- Example team
-- INSERT INTO agents (name, email, team, hire_date) VALUES
--   ('John Smith', 'john.smith@bpo.com', 'Team 1', '2024-01-15'),
--   ('Sarah Johnson', 'sarah.j@bpo.com', 'Team 1', '2024-02-01');

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE agents IS 'Agent profiles with soft delete capability';
COMMENT ON TABLE kpis IS 'Daily performance metrics (Quality, AHT, SRR, VOC)';
COMMENT ON TABLE audits IS 'Call quality assessments and transcripts';
COMMENT ON TABLE coaching_sessions IS 'Scheduled and completed coaching sessions';
COMMENT ON TABLE leave_records IS 'Agent absence tracking';
COMMENT ON TABLE upload_history IS 'Audit trail for Hastings Direct data imports';

COMMENT ON FUNCTION archive_agent IS 'Soft delete agent while preserving all historical data';
COMMENT ON FUNCTION reactivate_agent IS 'Restore previously archived agent';

