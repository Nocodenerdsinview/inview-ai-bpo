/**
 * InView AI - SQLite to Supabase Migration Script
 * 
 * This script migrates all data from local SQLite database to Supabase PostgreSQL.
 * Run after setting up Supabase project and running the schema migration.
 * 
 * Usage:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 *   2. Run: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n');
  
  // Connect to SQLite
  const dbPath = path.join(process.cwd(), 'inview.db');
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // ======================
    // 1. MIGRATE AGENTS
    // ======================
    console.log('📦 Migrating agents...');
    const agents = db.prepare('SELECT * FROM agents').all();
    
    if (agents.length > 0) {
      const { data, error } = await supabase
        .from('agents')
        .insert(agents)
        .select();
      
      if (error) {
        console.error('❌ Error migrating agents:', error);
        throw error;
      }
      console.log(`✅ Migrated ${agents.length} agents`);
    } else {
      console.log('⚠️  No agents found to migrate');
    }
    
    // ======================
    // 2. MIGRATE KPIs
    // ======================
    console.log('\n📊 Migrating KPIs...');
    const kpis = db.prepare('SELECT * FROM kpis ORDER BY date DESC').all();
    
    if (kpis.length > 0) {
      // Batch insert in chunks of 1000 (Supabase limit)
      const batchSize = 1000;
      for (let i = 0; i < kpis.length; i += batchSize) {
        const batch = kpis.slice(i, i + batchSize);
        const { error } = await supabase
          .from('kpis')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error at batch ${i}-${i + batch.length}:`, error);
          throw error;
        }
        console.log(`  ✓ Migrated ${i + batch.length}/${kpis.length} KPIs`);
      }
      console.log(`✅ All ${kpis.length} KPIs migrated`);
    } else {
      console.log('⚠️  No KPIs found to migrate');
    }
    
    // ======================
    // 3. MIGRATE AUDITS
    // ======================
    console.log('\n🎯 Migrating audits...');
    const audits = db.prepare('SELECT * FROM audits ORDER BY date DESC').all();
    
    if (audits.length > 0) {
      // Convert JSON strings to arrays for tags if needed
      const processedAudits = audits.map(audit => ({
        ...audit,
        tags: typeof audit.tags === 'string' 
          ? JSON.parse(audit.tags || '[]')
          : audit.tags
      }));
      
      const batchSize = 500;
      for (let i = 0; i < processedAudits.length; i += batchSize) {
        const batch = processedAudits.slice(i, i + batchSize);
        const { error } = await supabase
          .from('audits')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error at batch ${i}-${i + batch.length}:`, error);
          throw error;
        }
        console.log(`  ✓ Migrated ${i + batch.length}/${audits.length} audits`);
      }
      console.log(`✅ All ${audits.length} audits migrated`);
    } else {
      console.log('⚠️  No audits found to migrate');
    }
    
    // ======================
    // 4. MIGRATE COACHING SESSIONS
    // ======================
    console.log('\n💼 Migrating coaching sessions...');
    const coachingSessions = db.prepare('SELECT * FROM coaching_sessions ORDER BY scheduled_date DESC').all();
    
    if (coachingSessions.length > 0) {
      // Convert JSON strings to arrays for focus_areas if needed
      const processedSessions = coachingSessions.map(session => ({
        ...session,
        focus_areas: typeof session.focus_areas === 'string'
          ? JSON.parse(session.focus_areas || '[]')
          : session.focus_areas
      }));
      
      const { error } = await supabase
        .from('coaching_sessions')
        .insert(processedSessions);
      
      if (error) {
        console.error('❌ Error migrating coaching sessions:', error);
        throw error;
      }
      console.log(`✅ Migrated ${coachingSessions.length} coaching sessions`);
    } else {
      console.log('⚠️  No coaching sessions found to migrate');
    }
    
    // ======================
    // 5. MIGRATE LEAVE RECORDS
    // ======================
    console.log('\n📅 Migrating leave records...');
    const leaveRecords = db.prepare('SELECT * FROM leave_records ORDER BY date DESC').all();
    
    if (leaveRecords.length > 0) {
      const { error } = await supabase
        .from('leave_records')
        .insert(leaveRecords);
      
      if (error) {
        console.error('❌ Error migrating leave records:', error);
        throw error;
      }
      console.log(`✅ Migrated ${leaveRecords.length} leave records`);
    } else {
      console.log('⚠️  No leave records found to migrate');
    }
    
    // ======================
    // 6. VERIFY MIGRATION
    // ======================
    console.log('\n🔍 Verifying migration...');
    
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    
    const { count: kpiCount } = await supabase
      .from('kpis')
      .select('*', { count: 'exact', head: true });
    
    const { count: auditCount } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📈 Migration Summary:');
    console.log(`   Agents: ${agentCount} records in Supabase`);
    console.log(`   KPIs: ${kpiCount} records in Supabase`);
    console.log(`   Audits: ${auditCount} records in Supabase`);
    
    console.log('\n✨ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Update lib/db.ts to use Supabase connection');
    console.log('   3. Test the application');
    console.log('   4. Keep SQLite as backup until confirmed working\n');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run migration
migrateData().catch(console.error);

